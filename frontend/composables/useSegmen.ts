export const SEGMEN_LIST = ['Bank', 'Multifinance', 'BPR', 'KSP', 'Fintech', 'Others'] as const
export type Segmen = typeof SEGMEN_LIST[number]

export function useSegmen() {
  return { segmens: SEGMEN_LIST }
}
