function SkillGap({ missingSkills = [], learningRecommendations = [] }) {
  return (
    <div className="backdrop-blur-md bg-white/10 border border-amber-200/20 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4">Skill Gap Learning Engine</h3>
      {missingSkills.length === 0 ? (
        <p className="text-emerald-300">No major skill gaps detected.</p>
      ) : (
        <div className="space-y-3">
          {learningRecommendations.map((item) => (
            <div key={item.skill} className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900/40 rounded-lg p-3">
              <span className="text-slate-200 font-medium">{item.skill}</span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 md:mt-0 inline-flex items-center justify-center px-3 py-2 rounded-md bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 hover:bg-cyan-500/30 transition-colors"
              >
                {item.title}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SkillGap
