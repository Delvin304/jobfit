function Suggestions({ sectionWarnings = [], improvementSuggestions = [] }) {
  return (
    <div className="backdrop-blur-md bg-white/10 border border-rose-200/20 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4">Improvement Suggestions</h3>

      <div className="space-y-3 mb-6">
        {sectionWarnings.length > 0 ? (
          sectionWarnings.map((warning, index) => (
            <div key={`${warning}-${index}`} className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-amber-200">
              {warning}
            </div>
          ))
        ) : (
          <p className="text-emerald-300">Core ATS resume sections are present.</p>
        )}
      </div>

      <div className="space-y-3">
        {improvementSuggestions.length > 0 ? (
          improvementSuggestions.map((item) => (
            <div key={item.weak_verb} className="bg-slate-900/40 rounded-lg p-3">
              <p className="text-slate-200">
                Replace <span className="text-rose-300 font-semibold">{item.weak_verb}</span> ({item.count} times)
              </p>
              <p className="text-cyan-200 text-sm mt-1">
                Suggested verbs: {item.suggestions.join(', ')}
              </p>
            </div>
          ))
        ) : (
          <p className="text-slate-300">No weak action verbs detected.</p>
        )}
      </div>
    </div>
  )
}

export default Suggestions
