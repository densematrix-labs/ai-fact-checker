import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { checkClaim } from '../lib/api'
import { useTokenStore } from '../lib/tokenStore'
import { getDeviceId } from '../lib/fingerprint'
import FactCheckResult from '../components/FactCheckResult'

interface FactCheckResultData {
  credibility_score: number
  credibility_level: string
  summary: string
  key_points: Array<{
    point: string
    assessment: 'likely_true' | 'uncertain' | 'likely_false'
    explanation: string
  }>
  contradictions: string[]
  source_analysis: {
    likely_origin: string
    spread_pattern: string
    red_flags: string[]
  }
  disclaimer: string
}

export default function HomePage() {
  const { t, i18n } = useTranslation()
  const [claim, setClaim] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<FactCheckResultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { refreshBalance, freeTrialRemaining } = useTokenStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (claim.length < 10) {
      setError(t('errors.tooShort'))
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const deviceId = await getDeviceId()
      const data = await checkClaim(claim, i18n.language, deviceId)
      setResult(data)
      refreshBalance()
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('payment') || err.message.includes('token')) {
          setError(t('errors.paymentRequired'))
        } else {
          setError(err.message)
        }
      } else {
        setError(t('errors.generic'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="font-display text-5xl md:text-6xl font-bold text-paper-100 mb-4 leading-tight">
          {t('hero.headline')}
        </h1>
        <p className="text-xl text-paper-300 font-body">
          {t('hero.subheadline')}
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-12 animate-slide-up">
        <div className="relative">
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder={t('input.placeholder')}
            className="w-full h-40 p-6 bg-ink-800 border-2 border-ink-700 rounded-lg text-paper-100 font-body text-lg resize-none focus:border-highlight focus:outline-none transition-colors"
            data-testid="input-field"
          />
          <div className="absolute bottom-4 right-4 text-ink-500 text-sm font-mono">
            {claim.length} / 5000
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-paper-300 text-sm">
            {freeTrialRemaining > 0 ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-verdict-true rounded-full animate-pulse-slow"></span>
                {t('trial.remaining', { count: freeTrialRemaining })}
              </span>
            ) : (
              <Link to="/pricing" className="text-highlight hover:underline">
                {t('trial.getPremium')}
              </Link>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || claim.length < 10}
            className="px-8 py-4 bg-highlight text-ink-900 font-display font-bold text-lg rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            data-testid="generate-btn"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                {t('input.analyzing')}
                <span className="investigating-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </span>
            ) : (
              t('input.button')
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-verdict-false/20 border border-verdict-false rounded-lg text-verdict-false animate-fade-in" data-testid="error-message">
          {error}
          {error === t('errors.paymentRequired') && (
            <Link to="/pricing" className="ml-2 underline">
              {t('trial.getPremium')}
            </Link>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="animate-slide-up" data-testid="result">
          <FactCheckResult result={result} />
        </div>
      )}

      {/* Decorative divider */}
      <div className="divider-ornate my-16">
        <span className="bg-ink-900 px-4 text-ink-600">✦</span>
      </div>

      {/* How it works */}
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div className="p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-800 flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="font-display font-bold text-lg text-paper-100 mb-2">1. Paste</h3>
          <p className="text-paper-300 text-sm">Copy any claim, headline, or statement you want verified</p>
        </div>
        <div className="p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-800 flex items-center justify-center">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="font-display font-bold text-lg text-paper-100 mb-2">2. Analyze</h3>
          <p className="text-paper-300 text-sm">Our AI examines the claim against known facts and patterns</p>
        </div>
        <div className="p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-800 flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <h3 className="font-display font-bold text-lg text-paper-100 mb-2">3. Verify</h3>
          <p className="text-paper-300 text-sm">Get a detailed credibility assessment and source analysis</p>
        </div>
      </div>
    </div>
  )
}
