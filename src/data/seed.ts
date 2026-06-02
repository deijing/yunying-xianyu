import type { ArchiveData } from '@/types'
import { DEFAULT_SEGMENTS } from '@/types'

export const seedData: ArchiveData = {
  segments: [...DEFAULT_SEGMENTS],
  customers: [
    {
      id: 'cust_lin',
      name: '林小姐',
      source: '小红书',
      segment: '自由职业',
      stage: '准备成交',
      intentLevel: 5,
      tags: ['小红书', '数据分析', '体验课', '高意向'],
      note: '已自己在做宏观+博主数据分析，有自建模板，想要系统课程框架，主动问体验课怎么排。',
      createdAt: '2026-06-02',
      updatedAt: '2026-06-02',
      reportIds: ['rpt_lin_1'],
    },
    {
      id: 'cust_zhang',
      name: '张先生',
      source: '闲鱼',
      segment: '上班族',
      stage: '观望咨询',
      intentLevel: 2,
      tags: ['问价', 'AI入门', '信息少'],
      note: '只问了一句"你这AI教啥的多少钱"，信息量低，意向待确认。',
      createdAt: '2026-05-30',
      updatedAt: '2026-05-30',
      reportIds: [],
    },
    {
      id: 'cust_wang',
      name: '王同学',
      source: '私域',
      segment: '在校学生',
      stage: '已付费推进',
      intentLevel: 4,
      tags: ['n8n', '工作流', '进度焦虑'],
      note: '已付费学员，n8n 工作流卡在第三步，且担心跟不上节奏，有流失风险信号。',
      createdAt: '2026-05-28',
      updatedAt: '2026-06-01',
      reportIds: [],
    },
  ],
  reports: [
    {
      id: 'rpt_lin_1',
      customerId: 'cust_lin',
      title: '小红书数据分析 · 体验课意向客户',
      titleEn: 'Xiaohongshu Data-Analytics Trial Course · Lead Intent',
      brandColor: '#FF2442',
      createdAt: '2026-06-02',
      quickRead:
        '他已经自己在跑数据分析了（宏观经济、不同博主各有模板，还在完善），现在想要一套系统课程框架，尤其想知道第一节体验课讲什么，跑通就直接开课。',
      intent: '要一个具体的课程规划 / 第一节体验课大纲。不是听大道理，是要一条敢开始的清晰路径。',
      deepGoal: '把零散的手工分析系统化成可复用 SOP / 工作流，更快更专业，服务小红书内容产出与变现。',
      evidence: '已投入在做、主动问"第一节做哪方面""体验课你觉得怎么样"——典型的临门一脚信号。',
      closeProbability: 80,
      intentLevel: 5,
      stage: '准备成交',
      signals: [
        { title: '已有模板积累', detail: '真实需求、付费能力强' },
        { title: '主动问体验课', detail: '想验货 + 想立刻开始' },
      ],
      concerns: [
        { title: '怕买到通用课', detail: '反复强调"针对我的需求""不同博主不同模板"' },
        { title: '想确认你懂行', detail: '怀疑你是否真懂这套数据分析' },
      ],
      risk: '体验课若讲得太泛太基础，他会觉得"我自己都会，不值"当场掉单。必须贴着他现有模板往上搭。',
      teaching: {
        framework: [
          { title: '需求梳理', detail: '盘点宏观/博主需求，定数据从哪来' },
          { title: '模板升级', detail: '为每类需求配可复用模板' },
          { title: '工作流自动化', detail: '查数据→套模板→出结论半自动' },
          { title: '沉淀 SOP', detail: '批量复用到不同博主 / 主题' },
        ],
        trialLesson: {
          title: '拿你一个真实需求，跑通一条完整分析链路',
          points: [
            '直接拿他手上的某博主/宏观指标当案例，不讲理论',
            '现场演示：定数据源 → 模板结构化 → AI 出初稿',
            '产出一个他当场就能用的小成果',
          ],
          why: '他最怕"通用、用不上"。拿他自己的活当场练、当场出成果，是打消顾虑、证明你懂行、推动成交最快的方式。',
        },
      },
      actions: [
        { title: '先接住他', detail: '回一句确认方向，让他觉得被听懂' },
        { title: '反问需求', detail: '"先跑通哪个——某博主还是某宏观指标？"顺带把体验课做到他心坎上' },
        { title: '给可见成果', detail: '说清体验课结束他能拿到什么' },
      ],
      followUp:
        '他若没立刻回 → 当天晚些发一句："我按你说的宏观+博主两块，初步排了个体验课的点，你看方不方便约个时间？" 用已经为他动手了当由头，比干等管用。',
      script: [
        '你这其实已经自己在跑数据分析了，就差一套打法把它串成可复用的流程对吧，这个我能帮你搭。',
        '体验课我建议别讲虚的，直接拿你手上正在做的一个真实需求来练——你现在最想先跑通哪个？是某个博主的分析，还是某类宏观指标？我们这一节就把它从"查数据→套你的模板→AI 出初稿"完整走一遍，结束你手上就能多一份能直接用的模板。',
        '你方便的话告诉我那个具体需求，我今天就给你把第一节的内容排出来，咱约个时间开始。',
      ],
    },
  ],
}
