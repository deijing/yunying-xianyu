// ===== 统一数据契约（前后端通用，也是 customer-intent-analyzer skill 的输出格式）=====

export const STAGES = ['观望咨询', '比较犹豫', '准备成交', '已付费推进', '复购续费'] as const
export type Stage = (typeof STAGES)[number]

export const DEFAULT_SEGMENTS = ['上班族', '宝妈', '自由职业', '小微老板', '在校学生', '其他']

export interface PointItem {
  title: string
  detail: string
}

export interface TeachingStep {
  title: string
  detail: string
}

export interface TrialLesson {
  title: string
  points: string[]
  why: string
}

export interface IntentReport {
  id: string
  customerId: string
  title: string
  titleEn?: string
  brandColor: string // 自动识别的品牌色，如小红书红 #FF2442
  createdAt: string

  quickRead: string // 原话速读
  intent: string // 当下意图
  deepGoal: string // 深层目标
  evidence: string // 判断依据
  closeProbability: number // 成交概率 0-100
  intentLevel: number // 意向强度 1-5
  stage: Stage

  signals: PointItem[] // 积极信号
  concerns: PointItem[] // 潜在顾虑
  risk: string // 关键风险

  teaching: {
    framework: TeachingStep[]
    trialLesson?: TrialLesson
  }

  actions: PointItem[] // 现在就做
  followUp: string // 跟进节奏
  script: string[] // 话术气泡
}

export interface Customer {
  id: string
  name: string
  source: string
  segment: string
  stage: Stage
  intentLevel: number
  tags: string[]
  note: string
  createdAt: string
  updatedAt: string
  reportIds: string[]
}

export interface ArchiveData {
  customers: Customer[]
  reports: IntentReport[]
  segments: string[]
}
