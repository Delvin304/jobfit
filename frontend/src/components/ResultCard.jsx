function ResultCard({ matchedSkills = [], missingSkills = [], matchPercentage = 0, jobRole = '' }) {
  const safeMatch = Number(matchPercentage || 0)

  const getTheme = () => {
    if (safeMatch >= 80) return { gradient: 'from-emerald-500 to-cyan-500', text: 'text-emerald-200' }
    if (safeMatch >= 60) return { gradient: 'from-cyan-500 to-sky-500', text: 'text-cyan-200' }
    if (safeMatch >= 40) return { gradient: 'from-amber-500 to-orange-500', text: 'text-amber-200' }
    return { gradient: 'from-rose-500 to-pink-500', text: 'text-rose-200' }
  }

  const theme = getTheme()

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
        <div className={`bg-gradient-to-r ${theme.gradient} p-8 text-white text-center`}>
          <p className="text-sm opacity-90 mb-2">{jobRole || 'Role'}</p>
          <h3 className="text-5xl font-black">{safeMatch.toFixed(1)}%</h3>
          <p className="text-sm mt-1">Skill Match</p>
        </div>
        <div className="p-6 grid md:grid-cols-3 gap-3">
          <div className="bg-slate-900/40 border border-white/10 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Matched</p>
            <p className="text-2xl font-bold text-emerald-300">{matchedSkills.length}</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Missing</p>
            <p className="text-2xl font-bold text-rose-300">{missingSkills.length}</p>
          </div>
          <div className="bg-slate-900/40 border border-white/10 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-cyan-300">{matchedSkills.length + missingSkills.length}</p>
          </div>
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6 shadow-xl">
        <h4 className="text-lg font-bold text-white mb-4">Matched Skills</h4>
        {matchedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-sm">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No matched skills detected.</p>
        )}
      </div>

      <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6 shadow-xl">
        <h4 className="text-lg font-bold text-white mb-4">Missing Skills</h4>
        {missingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span key={skill} className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-200 text-sm">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className={theme.text}>No missing skills. Strong alignment.</p>
        )}
      </div>
    </div>
  )
}

export default ResultCard
