import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-ink-700 bg-ink-900 py-8 mt-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center">
          <p className="text-paper-300 text-sm mb-4 max-w-xl mx-auto">
            ⚠️ {t('footer.disclaimer')}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-paper-300">
            <a href="/privacy" className="hover:text-paper-100 transition-colors">
              {t('footer.privacy')}
            </a>
            <span className="text-ink-600">|</span>
            <a href="/terms" className="hover:text-paper-100 transition-colors">
              {t('footer.terms')}
            </a>
            <span className="text-ink-600">|</span>
            <span className="text-ink-500">© 2026 DenseMatrix</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
