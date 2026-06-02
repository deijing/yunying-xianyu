import express from 'express'
import cors from 'cors'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const SKILL_PATH = resolve(__dirname, '../../../../.claude/skills/customer-intent-analyzer/SKILL.md')
let SKILL_PROMPT = ''

try {
  SKILL_PROMPT = readFileSync(SKILL_PATH, 'utf-8')
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

app.post('/api/analyze', (req, res) => {
  const { message } = req.body
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '请提供 message 字段' })
  }

  try {
    const prompt = buildPrompt(message)
    console.log('🤖 正在调用 Claude CLI 分析客户消息...')

    const stdout = execSync('claude -p --bare --dangerously-skip-permissions', {
      input: prompt,
      encoding: 'utf-8',
      timeout: 120_000,
      maxBuffer: 10 * 1024 * 1024,
    })

    const jsonStr = extractJSON(stdout)
    const report = JSON.parse(jsonStr)
    console.log('✅ 分析完成')

    return res.json({ success: true, report })
  } catch (err: any) {
    console.error('❌ 分析失败:', err.message)
    if (err.stdout) {
      try {
        const jsonStr = extractJSON(err.stdout)
        const report = JSON.parse(jsonStr)
        return res.json({ success: true, report })
      } catch { /* fallback parse failed too */ }
    }
    return res.status(500).json({
      error: '分析失败',
      detail: err.message,
      stdout: err.stdout?.slice(0, 2000),
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 意图分析服务启动: http://localhost:${PORT}`)
  console.log(`📡 POST /api/analyze`)
})
