function RecruiterView({ recruiterSummary = {}, active = false }) {
  if (!active) return null

  return (
    <div className="backdrop-blur-md bg-white/10 border border-sky-200/20 rounded-2xl p-6 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4">Recruiter View</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-900/40 rounded-lg p-4 text-slate-100">
          <p className="text-sm text-slate-400 mb-1">Top Skills</p>
          <p>{(recruiterSummary.top_skills || []).join(', ') || 'Not available'}</p>
        </div>
        <div className="bg-slate-900/40 rounded-lg p-4 text-slate-100">
          <p className="text-sm text-slate-400 mb-1">Years of Experience</p>
          <p>{recruiterSummary.years_of_experience ?? 0}</p>
        </div>
        <div className="bg-slate-900/40 rounded-lg p-4 text-slate-100">
          <p className="text-sm text-slate-400 mb-1">Projects Count</p>
          <p>{recruiterSummary.projects_count ?? 0}</p>
        </div>
        <div className="bg-slate-900/40 rounded-lg p-4 text-slate-100">
          <p className="text-sm text-slate-400 mb-1">Education Level</p>
          <p>{recruiterSummary.education_level || 'Not specified'}</p>
        </div>
      </div>
    </div>
  )
}

export default RecruiterView
