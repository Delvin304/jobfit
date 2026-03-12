import axios from 'axios'

/**
 * API Service for communicating with Django backend
 * 
 * Why Axios?
 * - Better error handling than fetch()
 * - Automatic JSON parsing
 * - Request/response interceptors support
 * - Cleaner API for file uploads
 * 
 * Base URL points to Django backend running on localhost:8000
 * In production, this would be an environment variable
 */

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()
const apiBaseUrl = configuredApiBaseUrl || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api/' : '/api/')

// create instance
const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000, // 30 seconds timeout for file uploads
})

// attach token (if any) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = import.meta.env.PROD
        ? 'Cannot reach the backend. Set VITE_API_BASE_URL on Vercel to your Render backend URL ending with /api/.'
        : 'Cannot reach the backend at http://127.0.0.1:8000/api/. Start the Django server and try again.'
    }
    return Promise.reject(error)
  }
)

/**
 * Register a new user
 * @param {string} username
 * @param {string} password
 * @param {string} email
 */
export const register = async (username, password, email) => {
  const response = await api.post('auth/register/', { username, password, email })
  return response.data
}

/**
 * Log in an existing user
 * @param {string} username
 * @param {string} password
 */
export const login = async (username, password) => {
  const response = await api.post('auth/login/', { username, password })
  return response.data
}

/**
 * Log in with Google
 * @param {string} token - Google ID token
 */
export const googleLogin = async (token) => {
  const response = await api.post('auth/google/', { token })
  return response.data
}



/**
 * Analyze resume against a job role
 * 
 * Why FormData?
 * - FormData is required for multipart/form-data requests (file uploads)
 * - Django REST Framework expects file uploads in this format
 * - FormData automatically sets correct Content-Type header with boundary
 * 
 * Frontend-Backend Flow:
 * 1. Frontend creates FormData with resume_file and job_role_id
 * 2. Axios sends POST request to /api/analyze-resume/
 * 3. Django backend receives request, validates with serializer
 * 4. Backend processes: extracts text, finds skills, analyzes gap
 * 5. Backend returns JSON response with results
 * 6. Frontend receives response and updates UI
 * 
 * @param {File} resumeFile - The resume file (PDF or DOCX)
 * @param {number} jobRoleId - The ID of the job role to analyze against
 * @returns {Promise} Axios response with analysis results
 */
export const analyzeResume = async (resumeFile, jobRoleId, jobDescription) => {
  // Create FormData object for multipart/form-data request
  const formData = new FormData()

  // Append resume file (field name must match backend serializer)
  formData.append('resume_file', resumeFile)

  // Keep legacy support for role based analysis.
  if (jobRoleId) {
    formData.append('job_role_id', jobRoleId)
  }

  // New ATS flow: optional job description text.
  if (jobDescription) {
    formData.append('job_description', jobDescription)
  }

  // Send POST request to backend
  const response = await api.post('analyze-resume/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

export const downloadAnalysisReport = async (analysisPayload) => {
  const response = await api.post('download-report/', analysisPayload, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Send a chat message to the lightweight resume assistant.
 * @param {string} message
 * @param {Object|null} analysisData - Optional analysis context for personalized replies
 */
export const chatWithAssistant = async (message, analysisData = null) => {
  const response = await api.post('chat/', {
    message,
    analysis_data: analysisData,
  })
  return response.data
}

export default api
