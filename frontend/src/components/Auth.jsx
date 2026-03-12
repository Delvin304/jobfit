import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { login, register, googleLogin } from '../services/api'

function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = isLogin
        ? await login(username, password)
        : await register(username, password, email)

      // store token in localStorage and inform parent
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', data.username || username)
      onAuth(data.token, data.username || username)

      // clear form fields after successful auth
      setUsername('')
      setPassword('')
      setEmail('')
    } catch (err) {
      let msg = err.message || 'Authentication failed'

      // Try to extract detailed error message from backend response
      if (err.response?.data?.detail) {
        msg = err.response.data.detail
      } else if (err.response?.data?.error) {
        msg = err.response.data.error
      } else if (typeof err.response?.data === 'object') {
        // Handle field-level validation errors like {password: ["message"]}
        const errorEntries = Object.entries(err.response.data || {})
        if (errorEntries.length > 0) {
          const fieldMsgs = errorEntries
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages
              return `${field}: ${msg}`
            })
            .join(' | ')
          if (fieldMsgs) msg = fieldMsgs
        }
      }

      setError(msg)
      console.error('Auth error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
        <h2 className="text-2xl text-white font-bold mb-6 text-center">
          {isLogin ? 'Log in' : 'Create account'}
        </h2>
        {error && (
          <div className="mb-4 text-red-300 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white text-sm mb-1">Username</label>
            <input
              className="w-full px-3 py-2 rounded bg-white/20 text-white placeholder-slate-300 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-4">
              <label className="block text-white text-sm mb-1">Email</label>
              <input
                className="w-full px-3 py-2 rounded bg-white/20 text-white placeholder-slate-300 focus:outline-none"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-white text-sm mb-1">Password</label>
            <input
              className="w-full px-3 py-2 rounded bg-white/20 text-white placeholder-slate-300 focus:outline-none"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : isLogin ? 'Log in' : 'Register'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-slate-300">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  setLoading(true)
                  setError(null)
                  const data = await googleLogin(credentialResponse.credential)
                  localStorage.setItem('token', data.token)
                  localStorage.setItem('username', data.username)
                  onAuth(data.token, data.username)
                } catch (err) {
                  let msg = err.message || 'Google login failed'
                  if (err.response?.data?.detail) msg = err.response.data.detail
                  setError(msg)
                  console.error('Google login error:', err)
                } finally {
                  setLoading(false)
                }
              }}
              onError={() => {
                console.error('Google Login Failed')
                setError('Google Login Failed')
              }}
              theme="filled_black"
              shape="pill"
            />
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-300">
          {isLogin ? 'Need an account?' : 'Already have one?'}{' '}
          <button
            className="text-blue-400 underline"
            onClick={() => {
              // when toggling between login and registration, clear fields
              setIsLogin(!isLogin)
              setUsername('')
              setPassword('')
              setEmail('')
              setError(null)
            }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Auth
