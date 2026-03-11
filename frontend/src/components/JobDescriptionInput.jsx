import { useState } from 'react'

function JobDescriptionInput({ value, onChange }) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-200 mb-2">
        Paste Job Description
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        rows={10}
        placeholder="Paste role responsibilities, required skills, tools, and technologies..."
        className={`relative z-10 w-full rounded-xl border bg-slate-900/50 text-slate-100 caret-cyan-200 cursor-text p-4 outline-none transition-all duration-300 ${
          focused ? 'border-cyan-400/70 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-slate-500/40'
        }`}
      />
      <p className="text-xs text-slate-400 mt-2">
        ATS analyzer uses lightweight keyword + fuzzy matching from this text.
      </p>
    </div>
  )
}

export default JobDescriptionInput
