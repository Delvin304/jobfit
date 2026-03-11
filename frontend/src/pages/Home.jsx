import { useEffect, useState } from 'react'
import ResumeUpload from '../components/ResumeUpload'
import JobRoleSelect from '../components/JobRoleSelect'
import JobDescriptionInput from '../components/JobDescriptionInput'
import ResultCard from '../components/ResultCard'
import ScoreDashboard from '../components/ScoreDashboard'
import SkillGap from '../components/SkillGap'
import RecruiterView from '../components/RecruiterView'
import Suggestions from '../components/Suggestions'
import ChatBot from '../components/ChatBot'
import { analyzeResume, downloadAnalysisReport } from '../services/api'

const STORAGE_KEY = 'last_resume_analysis'
const LOAD_STEPS = [
  'Parsing Resume...',
  'Extracting Skills...',
  'Running ATS Analysis...',
  'Generating Recommendations...',
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function Home({ username, onLogout }) {
  const [resumeFile, setResumeFile] = useState(null)
  const [selectedJobRole, setSelectedJobRole] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState('')
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('candidate')

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      try {
        setResult(JSON.parse(cached))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  const handleAnalyze = async () => {
    if (!resumeFile) {
      setError('Please upload a PDF or DOCX resume first.')
      return
    }
    if (!selectedJobRole && !jobDescription.trim()) {
      setError('Please select a job role or paste a job description.')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)
    setLoadingStep(LOAD_STEPS[0])

    const stepTimers = LOAD_STEPS.map((step, index) => setTimeout(() => setLoadingStep(step), index * 375))

    try {
      const analysisPromise = analyzeResume(resumeFile, selectedJobRole?.id, jobDescription.trim())
      const [response] = await Promise.all([analysisPromise, sleep(1500)])

      const normalized = {
        matchedSkills: response.matched_skills || [],
        missingSkills: response.missing_skills || [],
        matchPercentage: response.match_percentage || 0,
        atsScore: response.ats_score ?? response.match_percentage ?? 0,
        scoreBreakdown: response.score_breakdown || {},
        parsedSections: response.parsed_sections || {},
        sectionWarnings: response.section_warnings || [],
        recruiterSummary: response.recruiter_summary || {},
        learningRecommendations: response.learning_recommendations || [],
        improvementSuggestions: response.improvement_suggestions || [],
        jobDescriptionAnalysis: response.job_description_analysis || {},
        jobRole: selectedJobRole?.title || 'Custom JD',
      }

      setResult(normalized)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.error || err.message || 'Analysis failed.'
      setError(message)
    } finally {
      stepTimers.forEach((timer) => clearTimeout(timer))
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!result) return
    try {
      const blob = await downloadAnalysisReport({
        ats_score: result.atsScore,
        match_percentage: result.matchPercentage,
        matched_skills: result.matchedSkills,
        missing_skills: result.missingSkills,
        section_warnings: result.sectionWarnings,
      })
      const fileUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = 'analysis_report.pdf'
      link.click()
      URL.revokeObjectURL(fileUrl)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to download PDF report.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 text-white">
      <div className="relative z-30 flex justify-end items-center gap-4 p-4 bg-slate-900/40 backdrop-blur-sm border-b border-cyan-400/20">
        <span className="text-sm text-slate-300">Logged in as <strong className="text-cyan-300">{username}</strong></span>
        <button onClick={onLogout} className="text-sm text-red-300 hover:text-red-200 underline">Logout</button>
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-4 py-10">
        <div className="mb-10 flex flex-col items-center text-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
            JobFit AI
          </h1>
          <p className="text-slate-300 mt-3">ATS Resume Analyzer with AI Career Assistant</p>
        </div>

        {error && (
          <div className="mb-6 border border-red-400/40 bg-red-500/15 text-red-200 rounded-xl p-4">{error}</div>
        )}

        {!result && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 backdrop-blur-md bg-white/10 rounded-2xl border border-cyan-300/20 p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4">1. Upload Resume</h2>
              <ResumeUpload
                onFileChange={(file) => {
                  setResumeFile(file)
                  setError(null)
                }}
                onAnalyze={handleAnalyze}
                loading={loading}
                selectedFile={resumeFile}
              />
            </div>
            <div className="lg:col-span-1 backdrop-blur-md bg-white/10 rounded-2xl border border-cyan-300/20 p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4">2. Choose Role (Optional)</h2>
              <JobRoleSelect onSelect={setSelectedJobRole} selectedRole={selectedJobRole} />
            </div>
            <div className="lg:col-span-1 backdrop-blur-md bg-white/10 rounded-2xl border border-cyan-300/20 p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4">3. Paste Job Description</h2>
              <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-8 backdrop-blur-md bg-white/10 rounded-2xl border border-cyan-300/20 p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-cyan-400/30 border-t-cyan-200 animate-spin" />
            <p className="text-xl font-semibold text-cyan-100">{loadingStep}</p>
            <p className="text-sm text-slate-400 mt-2">Please wait while we complete ATS analysis.</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('candidate')}
                className={`px-4 py-2 rounded-lg border ${activeTab === 'candidate' ? 'bg-cyan-400/20 border-cyan-300/50' : 'bg-white/5 border-white/20'}`}
              >
                Candidate View
              </button>
              <button
                onClick={() => setActiveTab('recruiter')}
                className={`px-4 py-2 rounded-lg border ${activeTab === 'recruiter' ? 'bg-cyan-400/20 border-cyan-300/50' : 'bg-white/5 border-white/20'}`}
              >
                Recruiter View
              </button>
              <button
                onClick={handleDownloadReport}
                className="ml-auto px-4 py-2 rounded-lg border border-emerald-300/40 bg-emerald-400/20 hover:bg-emerald-400/30"
              >
                Download Analysis Report
              </button>
            </div>

            {activeTab === 'candidate' && (
              <div className="space-y-6">
                <ScoreDashboard atsScore={result.atsScore} scoreBreakdown={result.scoreBreakdown} />
                <ResultCard
                  matchedSkills={result.matchedSkills}
                  missingSkills={result.missingSkills}
                  matchPercentage={result.matchPercentage}
                  jobRole={result.jobRole}
                />
                <SkillGap missingSkills={result.missingSkills} learningRecommendations={result.learningRecommendations} />
                <Suggestions sectionWarnings={result.sectionWarnings} improvementSuggestions={result.improvementSuggestions} />
              </div>
            )}

            <RecruiterView recruiterSummary={result.recruiterSummary} active={activeTab === 'recruiter'} />

            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null)
                  setResumeFile(null)
                  setSelectedJobRole(null)
                  setJobDescription('')
                  localStorage.removeItem(STORAGE_KEY)
                }}
                className="px-6 py-3 rounded-lg border border-slate-400/30 bg-slate-700/40 hover:bg-slate-700/70"
              >
                Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>

      <ChatBot analysisResult={result} />
    </div>
  )
}

export default Home
