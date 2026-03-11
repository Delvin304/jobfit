import { useState } from 'react'

function ResumeUpload({ onFileChange, onAnalyze, loading = false, selectedFile = null }) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(event.type === 'dragenter' || event.type === 'dragover')
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(false)

    const file = event.dataTransfer.files[0]
    const isValidType = file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    if (isValidType && onFileChange) {
      onFileChange(file)
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && onFileChange) {
      onFileChange(file)
    }
  }

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          dragActive ? 'border-cyan-400 bg-cyan-500/20' : 'border-slate-400/50 bg-white/5 hover:border-slate-300/70'
        }`}
      >
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer block">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="text-xl font-semibold text-cyan-100">Upload Resume</div>
            <div>
              <p className="text-lg font-semibold text-white mb-1">
                {dragActive ? 'Drop your resume here' : 'Drag and drop your resume'}
              </p>
              <p className="text-sm text-slate-400">
                or <span className="text-cyan-300 font-medium">click to browse</span>
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-2">Supported: PDF, DOCX (Max 10MB)</p>
          </div>
        </label>
      </div>

      {selectedFile && (
        <div className="mt-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg flex items-center gap-3">
          <span className="text-emerald-300 text-sm font-semibold">Ready</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-200">{selectedFile.name}</p>
            <p className="text-xs text-emerald-300/70">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      )}

      <button
        onClick={onAnalyze}
        disabled={loading || !selectedFile}
        className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </span>
        ) : (
          'Analyze Resume'
        )}
      </button>
    </div>
  )
}

export default ResumeUpload
