import express from 'express'
import cors from 'cors'
import { spawn } from 'child_process'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '5mb' }))

const SYSTEM_PROMPT = `你是客户意图分析专家，专为 AI/知识付费教学场景做客户咨询消息分析。

分析心法：
1. 去噪翻译：剥掉口语化的口水词、重复、语气词，留下事实和诉求核心。
2. 分清说出来的和没说出来的：客户表面说的话往往不是他真正想要的，要从话里读出他没有直接表达的动机——他在担心什么、他真正要验证什么、他卡在哪一步。
3. 判断他此刻最需要你给什么：不是长篇大论，而是一个让他敢迈出下一步的具体规划。

stage 成交阶段判断依据：
- 观望咨询：初次接触、泛泛问"你教什么""怎么收费"，没有明确付费意向。
- 比较犹豫：有付费意愿但不确定值不值、怕踩坑，或正在对比多家。
- 准备成交：提出了具体的上课/购买意向，在评估可行性而非价值。
- 已付费推进：已经付款，进入交付/学习阶段，需要推进进度和巩固信任。
- 复购续费：现有学员或老客户，需要续费/复购的推进。

brandColor 选取规则：聊小红书的内容→#FF2442（小红书红）；聊抖音→#000000或#00f2ea；无明显平台→#0A84FF（科技蓝）。`

function buildPrompt(message: string): string {
  return `${SYSTEM_PROMPT}

请直接输出以下 JSON 格式（不要输出任何其他文字，不要 HTML，不要把 JSON 包在 markdown 里）：

{
  "title": "客户一句话主题",
  "titleEn": "English Subtitle",
  "brandColor": "#FF2442",
  "quickRead": "把客户原话翻成人话的一句速读，简洁",
  "intent": "他此刻最想拿到的具体东西",
  "deepGoal": "深层目标（赚钱/提效/转行/交差等）",
  "evidence": "凭哪句话这么判断",
  "closeProbability": 80,
  "intentLevel": 4,
  "stage": "比较犹豫",
  "signals": [{"title":"积极信号", "detail":"具体说明"}],
  "concerns": [{"title":"顾虑点", "detail":"具体说明"}],
  "risk": "最大的丢单风险一句话",
  "teaching": {
    "framework": [{"title":"教学步骤", "detail":"内容说明"}],
    "trialLesson": {"title":"第一节体验课主题", "points":["要点1","要点2"], "why":"为什么这么排"}
  },
  "actions": [{"title":"现在做的动作", "detail":"具体做法"}],
  "followUp": "跟进节奏（具体时间节点和动作，不要空话）",
  "script": ["话术1（先接住诉求，口语化）", "话术2（给具体可见的下一步）"]
}

约束：
- stage 只能选：观望咨询 / 比较犹豫 / 准备成交 / 已付费推进 / 复购续费
- intentLevel 是 1-5 的整数
- closeProbability 是 0-100 的整数
- 每个 signals、concerns、framework、actions 至少 1 条
- script 至少 2 条，用口语而不是销售腔
- 没有足够信息判断的字段标注"信息不足"，不要编造
- 不提供体验课时 trialLesson 可以省略
- 输出纯 JSON，不要 \`\`\` 包裹

客户消息：
"""
${message}
"""`
}

function extractJSON(raw: string): string {
  const match = raw.match(/```json\s*([\s\S]*?)\s*```/)
  if (match) return match[1].trim()
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    return raw.slice(start, end + 1)
  }
  throw new Error('未找到 JSON 输出')
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, claude: true })
})

const MODELS = ['sonnet', 'opus', 'haiku'] as const

app.post('/api/analyze', (req, res) => {
  const { message, model } = req.body
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '请提供 message 字段' })
  }
  const selectedModel = MODELS.includes(model) ? model : 'sonnet'

  // SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  })

  const send = (type: string, data: unknown) => {
    res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  const prompt = buildPrompt(message)
  console.log(`🤖 调用 Claude CLI → ${selectedModel}...`)

  send('status', { msg: `🔧 启动 ${selectedModel} 模型...` })

  const child = spawn('claude', ['-p', '--bare', '--dangerously-skip-permissions', '--model', selectedModel], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' },
  })

  child.stdin!.write(prompt)
  child.stdin!.end()

  let fullOutput = ''

  child.stdout.on('data', (chunk: Buffer) => {
    const text = chunk.toString('utf-8')
    fullOutput += text
    send('log', { text })
  })

  child.stderr.on('data', (chunk: Buffer) => {
    const text = chunk.toString('utf-8')
    if (text.trim()) send('log', { text, stderr: true })
  })

  child.on('error', (err) => {
    console.error('❌ 进程启动失败:', err.message)
    send('error', { msg: `进程启动失败: ${err.message}` })
    res.end()
  })

  child.on('close', (code) => {
    console.log(`Claude CLI 退出码: ${code}`)
    if (code !== 0) {
      send('error', { msg: `Agent 异常退出（退出码 ${code}）` })
      return res.end()
    }

    send('status', { msg: '📦 正在解析分析结果...' })

    try {
      const jsonStr = extractJSON(fullOutput)
      const report = JSON.parse(jsonStr)

      const required = ['title', 'quickRead', 'script', 'intent']
      const missing = required.filter((k) => !report[k])
      if (missing.length) {
        send('error', { msg: `JSON 缺少必要字段: ${missing.join(', ')}` })
        return res.end()
      }

      console.log('✅ 分析完成:', report.title)
      send('done', { report })
    } catch (e: any) {
      send('error', { msg: `JSON 解析失败: ${e.message}` })
    }
    res.end()
  })
})

app.listen(PORT, () => {
  console.log(`🚀 意图分析服务启动: http://localhost:${PORT}`)
  console.log(`📡 POST /api/analyze (SSE)`)
  console.log(`🩺 GET  /api/health`)
})
