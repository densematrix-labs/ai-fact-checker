import { create } from 'zustand'
import { getTokenBalance } from './api'
import { getDeviceId } from './fingerprint'

interface TokenState {
  paidTokens: number
  freeTrialRemaining: number
  totalAvailable: number
  isLoading: boolean
  refreshBalance: () => Promise<void>
}

export const useTokenStore = create<TokenState>((set) => ({
  paidTokens: 0,
  freeTrialRemaining: 1,
  totalAvailable: 1,
  isLoading: false,

  refreshBalance: async () => {
    set({ isLoading: true })
    try {
      const deviceId = await getDeviceId()
      const balance = await getTokenBalance(deviceId)
      set({
        paidTokens: balance.paid_tokens,
        freeTrialRemaining: balance.free_trial_remaining,
        totalAvailable: balance.total_available,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to refresh balance:', error)
      set({ isLoading: false })
    }
  },
}))
