import { useTranslation } from 'react-i18next'

interface ClaimPoint {
  point: string
  assessment: 'likely_true' | 'uncertain' | 'likely_false'
  explanation: string
}

interface SourceAnalysis {
  likely_origin: string
  spread_pattern: string
  red_flags: string[]
}

interface FactCheckResultProps {
  result: {
    credibility_score: number
    credibility_level: string
    summary: string
    key_points: ClaimPoint[]
    contradictions: string[]
    source_analysis: SourceAnalysis
    disclaimer: string
  }
}

export default function FactCheckResult({ result }: FactCheckResultProps) {
  const { t } = useTranslation()

  const getCredibilityColor = (level: string) => {
    switch (level) {
      case 'high': return 'verdict-true'
      case 'medium': return 'verdict-uncertain'
      case 'low': return 'verdict-false'
      default: return 'verdict-uncertain'
    }
  }

  const getAssessmentColor = (assessment: string) => {
    switch (assessment) {
      case 'likely_true': return 'verdict-true'
      case 'uncertain': return 'verdict-uncertain'
      case 'likely_false': return 'verdict-false'
      default: return 'verdict-uncertain'
    }
  }

  const color = getCredibilityColor(result.credibility_level)

  return (
    <div className="space-y-8">
      {/* Credibility Score */}
      <div className="bg-ink-800 rounded-xl p-8 border border-ink-700">
        <h2 className="font-display text-2xl font-bold text-paper-100 mb-6">
          {t('result.credibility')}
        </h2>
        
        <div className="flex items-center gap-8">
          <div className={`relative w-32 h-32`}>
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-ink-700"
              />
              <circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${result.credibility_score * 2.83} 283`}
                strokeLinecap="round"
                className={`text-${color}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-display text-3xl font-bold text-${color}`}>
                {Math.round(result.credibility_score)}%
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className={`inline-block px-4 py-2 rounded-full border ${color} font-display font-bold mb-4`}>
              {t(`result.${result.credibility_level}`)}
            </div>
            <p className="text-paper-200 font-body text-lg">{result.summary}</p>
          </div>
        </div>
      </div>

      {/* Key Points */}
      <div className="bg-ink-800 rounded-xl p-8 border border-ink-700">
        <h2 className="font-display text-2xl font-bold text-paper-100 mb-6">
          {t('result.keyPoints')}
        </h2>
        
        <div className="space-y-4">
          {result.key_points.map((point, index) => (
            <div key={index} className="p-4 bg-ink-900 rounded-lg">
              <div className="flex items-start gap-4">
                <span className={`mt-1 px-2 py-1 rounded text-xs font-mono border ${getAssessmentColor(point.assessment)}`}>
                  {t(`result.assessment.${point.assessment}`)}
                </span>
                <div>
                  <p className="text-paper-100 font-body mb-2">"{point.point}"</p>
                  <p className="text-paper-300 text-sm">{point.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contradictions */}
      {result.contradictions.length > 0 && (
        <div className="bg-ink-800 rounded-xl p-8 border border-ink-700">
          <h2 className="font-display text-2xl font-bold text-paper-100 mb-6">
            {t('result.contradictions')}
          </h2>
          
          <ul className="space-y-3">
            {result.contradictions.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-verdict-false mt-1">⚠️</span>
                <span className="text-paper-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source Analysis */}
      <div className="bg-ink-800 rounded-xl p-8 border border-ink-700">
        <h2 className="font-display text-2xl font-bold text-paper-100 mb-6">
          {t('result.sourceAnalysis')}
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-paper-300 text-sm uppercase tracking-wider mb-2">
              {t('result.likelyOrigin')}
            </h3>
            <p className="text-paper-100 font-body">{result.source_analysis.likely_origin}</p>
          </div>
          <div>
            <h3 className="text-paper-300 text-sm uppercase tracking-wider mb-2">
              {t('result.spreadPattern')}
            </h3>
            <p className="text-paper-100 font-body">{result.source_analysis.spread_pattern}</p>
          </div>
        </div>
        
        {result.source_analysis.red_flags.length > 0 && (
          <div className="mt-6">
            <h3 className="text-paper-300 text-sm uppercase tracking-wider mb-3">
              {t('result.redFlags')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.source_analysis.red_flags.map((flag, index) => (
                <span key={index} className="px-3 py-1 bg-verdict-false/20 text-verdict-false rounded-full text-sm">
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-ink-700/50 rounded-lg border border-ink-600 text-center">
        <p className="text-paper-300 text-sm italic">{result.disclaimer}</p>
      </div>
    </div>
  )
}
