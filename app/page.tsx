'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types'
import { loadUsers, getCurrentUser, setCurrentUser } from '@/utils/storage'
import { LogIn, User as UserIcon, Eye, EyeOff } from 'lucide-react'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [currentUser, setCurrentUserState] = useState<User | null>(null)
  const [loginMode, setLoginMode] = useState<'qa' | 'viewer'>('qa')
  const [selectedQAMember, setSelectedQAMember] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const qaTeamMembers = ['NemanjaN', 'NemanjaP', 'Milan', 'Vlada']

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUserState(user)
    setLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const users = loadUsers()
    let user: User | undefined

    if (loginMode === 'qa') {
      // QA Team login - check selected member with shared password
      if (!selectedQAMember) {
        setError('Please select a team member')
        return
      }
      user = users.find(u => u.username === selectedQAMember && u.password === password)
      if (!user) {
        setError('Invalid password for selected team member')
      }
    } else {
      // Viewer login - regular username/password
      user = users.find(u => u.username === username && u.password === password)
      if (!user) {
        setError('Invalid username or password')
      }
    }

    if (user) {
      setCurrentUser(user)
      setCurrentUserState(user)
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
          
          {/* Login Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('qa')
                setError('')
                setUsername('')
                setShowPassword(false)
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                loginMode === 'qa'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              QA Team
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('viewer')
                setError('')
                setSelectedQAMember('')
                setShowPassword(false)
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                loginMode === 'viewer'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              Viewer
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginMode === 'qa' ? (
              <>
                {/* QA Team Member Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Team Member
                  </label>
                  <select
                    value={selectedQAMember}
                    onChange={(e) => setSelectedQAMember(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">-- Select your name --</option>
                    {qaTeamMembers.map(member => (
                      <option key={member} value={member}>{member}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Team Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-12"
                      placeholder="Enter team password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Viewer Login */}
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
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      title={showPassword ? 'Show password' : 'Hide password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

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

        </div>
      </div>
    </main>
  )
}
