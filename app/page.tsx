'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { loadUsers, getCurrentUser, setCurrentUser } from '@/utils/storage'
import { LogIn, User as UserIcon } from 'lucide-react'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)
    setLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const users = loadUsers()
    const user = users.find(u => u.username === username && u.password === password)

    if (user) {
      setCurrentUser(user)
      setCurrentUserState(user)
    } else {
      setError('Invalid username or password')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentUserState(null)
    setUsername('')
    setPassword('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-32 h-32 rounded-full"></div>
      </div>
    )
  }

  if (currentUser) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="w-full max-w-md animate-slideUp">
        <div className="card text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <UserIcon className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            QA Test Case Manager
          </h1>
          <p className="text-gray-400 text-lg">
            Professional Test Case Management Tool
          </p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Login
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-gray-300 mb-2">
              <strong>Default credentials:</strong>
            </p>
            <p className="text-sm text-gray-400">
              Username: <code className="text-blue-400">admin</code>
            </p>
            <p className="text-sm text-gray-400">
              Password: <code className="text-blue-400">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
