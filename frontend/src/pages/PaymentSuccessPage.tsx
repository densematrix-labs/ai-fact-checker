import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTokenStore } from '../lib/tokenStore'

export default function PaymentSuccessPage() {
  const { t } = useTranslation()
  const { refreshBalance } = useTokenStore()

  useEffect(() => {
    // Refresh balance after successful payment
    refreshBalance()
  }, [refreshBalance])

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="mb-8 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-verdict-true/20 flex items-center justify-center">
          <span className="text-4xl">✓</span>
        </div>
        
        <h1 className="font-display text-3xl font-bold text-paper-100 mb-4">
          {t('payment.success')}
        </h1>
        
        <p className="text-paper-300 text-lg">
          {t('payment.tokensAdded')}
        </p>
      </div>

      <Link
        to="/"
        className="inline-block px-8 py-4 bg-highlight text-ink-900 font-display font-bold text-lg rounded-lg hover:bg-yellow-400 transition-all"
      >
        {t('payment.goHome')}
      </Link>
    </div>
  )
}
