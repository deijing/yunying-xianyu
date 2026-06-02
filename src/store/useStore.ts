import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ArchiveData, Customer, IntentReport } from '@/types'
import { seedData } from '@/data/seed'
import { uid, today } from '@/lib/utils'

interface StoreState extends ArchiveData {
  // 客户
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'reportIds'>) => string
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  removeCustomer: (id: string) => void
  // 报告
  addReport: (r: Omit<IntentReport, 'id' | 'createdAt'>) => string
  removeReport: (id: string) => void
  // 人群分类
  setSegments: (segs: string[]) => void
  // 数据
  importData: (data: ArchiveData) => void
  resetDemo: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...seedData,

      addCustomer: (c) => {
        const id = uid('cust')
        const now = today()
        set((s) => ({
          customers: [{ ...c, id, createdAt: now, updatedAt: now, reportIds: [] }, ...s.customers],
        }))
        return id
      },

      updateCustomer: (id, patch) =>
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: today() } : c,
          ),
        })),

      removeCustomer: (id) =>
        set((s) => ({
          customers: s.customers.filter((c) => c.id !== id),
          reports: s.reports.filter((r) => r.customerId !== id),
        })),

      addReport: (r) => {
        const id = uid('rpt')
        set((s) => ({
          reports: [{ ...r, id, createdAt: today() }, ...s.reports],
          customers: s.customers.map((c) =>
            c.id === r.customerId
              ? {
                  ...c,
                  reportIds: [id, ...c.reportIds],
                  stage: r.stage,
                  intentLevel: r.intentLevel,
                  updatedAt: today(),
                }
              : c,
          ),
        }))
        return id
      },

      removeReport: (id) =>
        set((s) => ({
          reports: s.reports.filter((r) => r.id !== id),
          customers: s.customers.map((c) => ({
            ...c,
            reportIds: c.reportIds.filter((rid) => rid !== id),
          })),
        })),

      setSegments: (segments) => set({ segments }),

      importData: (data) =>
        set({
          customers: data.customers ?? [],
          reports: data.reports ?? [],
          segments: data.segments ?? get().segments,
        }),

      resetDemo: () => set({ ...seedData }),
    }),
    { name: 'intent-hub-v1' },
  ),
)
