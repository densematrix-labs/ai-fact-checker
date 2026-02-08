import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { t } = useTranslation()

  return (
    <header className="border-b border-ink-700 bg-ink-900/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-highlight flex items-center justify-center">
            <span className="text-ink-900 font-display font-bold text-xl">?</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-paper-100 group-hover:text-highlight transition-colors">
              {t('site.title')}
            </h1>
            <p className="text-xs text-paper-300 tracking-wider uppercase">
              {t('site.tagline')}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/pricing"
            className="text-paper-200 hover:text-highlight transition-colors font-body"
          >
            {t('header.pricing')}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
