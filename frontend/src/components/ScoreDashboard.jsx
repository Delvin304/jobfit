import { useEffect, useMemo, useState } from 'react'

function ScoreDashboard({ atsScore = 0, scoreBreakdown = {} }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const safeScore = Math.max(0, Math.min(100, Number(atsScore || 0)))

  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current += 2
      if (current >= safeScore) {
        current = safeScore
        clearInterval(interval)
      }
      setAnimatedScore(current)
    }, 20)
    return () => clearInterval(interval)
  }, [safeScore])

  const tier = useMemo(() => {
    if (safeScore >= 90) return 'Top 5% Candidate'
    if (safeScore >= 70) return 'Strong Match'
    return 'Upskill Required'
  }, [safeScore])

  const strokeDasharray = 2 * Math.PI * 56
  const strokeDashoffset = strokeDasharray * (1 - animatedScore / 100)

  return (
    <div className="backdrop-blur-md bg-white/10 border border-cyan-300/20 rounded-2xl p-6 shadow-xl">
      <h3 className="text-2xl font-bold text-white mb-6">ATS Score Dashboard</h3>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="relative w-40 h-40">
          <svg className="w-40 h-40 -rotate-90">
            <circle cx="80" cy="80" r="56" stroke="rgba(148,163,184,0.25)" strokeWidth="12" fill="none" />
            <circle
              cx="80"
              cy="80"
              r="56"
              stroke="url(#scoreGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-3xl font-extrabold text-white">{animatedScore.toFixed(0)}</p>
            <p className="text-xs text-slate-300">/100</p>
          </div>
        </div>

        <div className="flex-1 w-full">
          <p className="text-lg text-cyan-200 font-semibold mb-4">{tier}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-900/40 rounded-lg p-3 text-slate-200">
              Skill Match: {scoreBreakdown.skill_match_score ?? 0}
            </div>
            <div className="bg-slate-900/40 rounded-lg p-3 text-slate-200">
              Sections: {scoreBreakdown.section_completeness_score ?? 0}
            </div>
            <div className="bg-slate-900/40 rounded-lg p-3 text-slate-200">
              Keywords: {scoreBreakdown.keyword_density_score ?? 0}
            </div>
            <div className="bg-slate-900/40 rounded-lg p-3 text-slate-200">
              Formatting: {scoreBreakdown.formatting_score ?? 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScoreDashboard
