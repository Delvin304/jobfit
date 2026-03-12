import './index.css'
import { useState } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Auth from './components/Auth'
import Home from './pages/Home'

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()

/**
 * App Component (Root Component)
 * 
 * Responsibility:
 * - Root component of the React application
 * - Manages global authentication state and decides whether to show
 *   the login/register screen or the main Home page.
 *
 * Data Flow:
 * - App → Auth: passes `onAuth` callback to receive token/username
 * - App → Home: passes token/username and logout handler
 * - Auth → App: delivers credentials when the user successfully logs in
 */
function App() {
  // token stored in state so that re-renders happen when it changes
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [username, setUsername] = useState(localStorage.getItem('username'))

  const handleAuth = (newToken, newUsername) => {
    setToken(newToken)
    setUsername(newUsername)
    // persist for page reloads
    localStorage.setItem('token', newToken)
    localStorage.setItem('username', newUsername)
  }

  const handleLogout = () => {
    setToken(null)
    setUsername(null)
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  // if there's no token, show authentication form
  if (!token) {
    if (!GOOGLE_CLIENT_ID) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 px-6">
          <div className="w-full max-w-lg p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg text-white">
            <h1 className="text-2xl font-bold mb-4 text-center">Google auth is not configured</h1>
            <p className="text-sm text-slate-200 text-center">
              Set <code>VITE_GOOGLE_CLIENT_ID</code> in the frontend environment and redeploy Vercel.
            </p>
          </div>
        </div>
      )
    }

    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Auth onAuth={handleAuth} />
      </GoogleOAuthProvider>
    )
  }

  // once authenticated, show the normal Home page
  return <Home token={token} username={username} onLogout={handleLogout} />
}

export default App
