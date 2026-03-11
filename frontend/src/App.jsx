import './index.css'
import { useState } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Auth from './components/Auth'
import Home from './pages/Home'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '800542912132-5hrt7i7rnsd0hr3ed7v7ea02fobrph5c.apps.googleusercontent.com'

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
