import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createCheckout } from '../lib/api'
import { getDeviceId } from '../lib/fingerprint'

const products = [
  {
    id: 'basic',
    tokens: 3,
    price: '$2.99',
    priceNum: 2.99,
  },
  {
    id: 'standard',
    tokens: 10,
    price: '$7.99',
    priceNum: 7.99,
    popular: true,
  },
  {
    id: 'pro',
    tokens: 30,
    price: '$19.99',
    priceNum: 19.99,
  },
]

export default function PricingPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (productId: string) => {
    setLoading(productId)
    try {
      const deviceId = await getDeviceId()
      const successUrl = `${window.location.origin}/payment/success?product=${productId}`
      const cancelUrl = window.location.href
      
      const { checkout_url } = await createCheckout(productId, deviceId, successUrl, cancelUrl)
      window.location.href = checkout_url
    } catch (error) {
      console.error('Checkout error:', error)
      setLoading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold text-paper-100 mb-4">
          {t('pricing.title')}
        </h1>
        <p className="text-paper-300 text-lg">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className={`relative bg-ink-800 rounded-xl p-6 border-2 transition-all hover:scale-105 ${
              product.popular
                ? 'border-highlight shadow-lg shadow-highlight/20'
                : 'border-ink-700'
            }`}
          >
            {product.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-highlight text-ink-900 text-sm font-bold rounded-full">
                  {t('pricing.popular')}
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="font-display text-4xl font-bold text-paper-100 mb-2">
                {product.tokens}
              </div>
              <div className="text-paper-300 text-sm">
                {t('pricing.checks')}
              </div>
            </div>

            <div className="text-center mb-6">
              <span className="font-display text-3xl font-bold text-highlight">
                {product.price}
              </span>
            </div>

            <ul className="space-y-3 mb-6 text-sm text-paper-300">
              <li className="flex items-center gap-2">
                <span className="text-verdict-true">✓</span>
                {t('pricing.features.instant')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-verdict-true">✓</span>
                {t('pricing.features.languages')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-verdict-true">✓</span>
                {t('pricing.features.detailed')}
              </li>
            </ul>

            <button
              onClick={() => handlePurchase(product.id)}
              disabled={loading !== null}
              className={`w-full py-3 rounded-lg font-display font-bold transition-all ${
                product.popular
                  ? 'bg-highlight text-ink-900 hover:bg-yellow-400'
                  : 'bg-ink-700 text-paper-100 hover:bg-ink-600'
              } disabled:opacity-50`}
            >
              {loading === product.id ? 'Loading...' : t('pricing.buy')}
            </button>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className="mt-12 text-center">
        <div className="flex items-center justify-center gap-6 text-paper-300 text-sm">
          <span>🔒 Secure Payment</span>
          <span>💳 All Cards Accepted</span>
          <span>⚡ Instant Delivery</span>
        </div>
      </div>
    </div>
  )
}
