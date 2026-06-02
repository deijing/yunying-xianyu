import express from 'express'
import cors from 'cors'
import { spawn } from 'child_process'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { homedir } from 'os'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '5mb' }))

const SKILL_PATH = resolve(homedir(), '.claude/skills/customer-intent-analyzer/SKILL.md')
let SKILL_PROMPT = ''

try {
  SKILL_PROMPT = readFileSync(SKILL_PATH, 'utf-8')
  console.log(`📖 已加载 skill: ${SKILL_PATH}`)
} catch {
  console.warn('⚠️  SKILL.md 未找到，使用内置回退 prompt')
  SKILL_PROMPT = `你是客户意图分析专家。请分析客户消息并输出 JSON 格式的 IntentReport。`
}

function buildPrompt(message: string): string {
  return `${SKILL_PROMPT}

---

## 当前任务

用户发来了一段客户/学员的消息，请你直接输出 JSON 格式的 IntentReport。

要求：
1. **不要生成 HTML 报告**，只输出 JSON
2. **不要输出任何 Markdown 说明文字**，只输出 JSON
3. JSON 必须放在 \`\`\`json ... \`\`\` 代码块内
4. 严格按上面 schema 填充每个字段
5. stage 取值只能是：观望咨询 / 比较犹豫 / 准备成交 / 已付费推进 / 复购续费
6. intentLevel 是 1-5 整数
7. closeProbability 是 0-100 整数
8. brandColor 按内容识别品牌色（聊小红书→#FF2442，无明显品牌→#0A84FF）
9. 信息不足处的字段，诚实标注"信息不足"

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

app.post('/api/analyze', (req, res) => {
  const { message } = req.body
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '请提供 message 字段' })
  }

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
  console.log('🤖 正在调用 Claude CLI 分析客户消息...')

  send('status', { msg: '🔧 正在启动本地 Agent...' })

  const child = spawn('claude', ['-p', '--bare', '--dangerously-skip-permissions'], {
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
