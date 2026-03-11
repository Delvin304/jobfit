import { useState } from 'react'

function JobRoleSelect({ onSelect, selectedRole = null }) {
  const jobRoles = [
    { id: 1, title: 'Backend Developer', badge: 'API', color: 'from-cyan-500 to-blue-500' },
    { id: 2, title: 'Frontend Developer', badge: 'UI', color: 'from-emerald-500 to-teal-500' },
  ]

  const [selected, setSelected] = useState(selectedRole?.id || null)

  const handleSelect = (role) => {
    setSelected(role.id)
    if (onSelect) onSelect(role)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {jobRoles.map((role) => {
          const isActive = selected === role.id || selectedRole?.id === role.id
          return (
            <button
              key={role.id}
              onClick={() => handleSelect(role)}
              className={`group relative overflow-hidden rounded-xl p-5 transition-all duration-300 ${
                isActive ? 'ring-2 ring-cyan-200/60 bg-white/20' : 'bg-white/10 hover:bg-white/15'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              <div className="relative z-10 text-left">
                <div className="inline-block text-xs px-2 py-1 rounded-full bg-slate-900/50 text-cyan-200 mb-3">{role.badge}</div>
                <h3 className="text-lg font-bold text-white mb-2">{role.title}</h3>
                <p className={`text-sm ${isActive ? 'text-emerald-200' : 'text-slate-300'}`}>
                  {isActive ? 'Selected' : 'Click to select'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default JobRoleSelect
