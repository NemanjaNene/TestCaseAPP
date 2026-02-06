'use client'

import { useState, useEffect } from 'react'
import { TestSuite } from '@/types'
import { X, PlayCircle } from 'lucide-react'

interface CreateTestRunModalProps {
  projectId: string
  suites: TestSuite[]
  onClose: () => void
  onCreate: (name: string, description: string, suiteIds: string[]) => void
}

export default function CreateTestRunModal({ projectId, suites, onClose, onCreate }: CreateTestRunModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSuites, setSelectedSuites] = useState<Set<string>>(new Set())

  // Select all suites by default
  useEffect(() => {
    if (suites.length > 0) {
      setSelectedSuites(new Set(suites.map(s => s.id)))
    }
  }, [suites])

  const toggleSuite = (suiteId: string) => {
    setSelectedSuites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(suiteId)) {
        newSet.delete(suiteId)
      } else {
        newSet.add(suiteId)
      }
      return newSet
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && selectedSuites.size > 0) {
      onCreate(name.trim(), description.trim(), Array.from(selectedSuites))
    }
  }

  const handleSelectAll = () => {
    setSelectedSuites(new Set(suites.map(s => s.id)))
  }

  const handleDeselectAll = () => {
    setSelectedSuites(new Set())
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <PlayCircle className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">Create Test Run</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Test Run Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g., Sprint 5 Regression, Smoke Test v1.2"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea-field"
              placeholder="Optional: Add notes about this test run..."
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-300">
                Select Test Suites * ({selectedSuites.size} selected)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs px-2 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-all"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs px-2 py-1 rounded bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-400 transition-all"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {suites.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No test suites found in this project.</p>
                <p className="text-sm mt-2">Create test suites first before starting a test run.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {suites.map(suite => (
                  <label
                    key={suite.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSuites.has(suite.id)
                        ? 'bg-purple-500/20 border-purple-500/50'
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSuites.has(suite.id)}
                      onChange={() => toggleSuite(suite.id)}
                      className="mt-1 w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-purple-500 focus:ring-offset-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white">{suite.name}</p>
                      {suite.description && (
                        <p className="text-sm text-gray-400 mt-1">{suite.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!name.trim() || selectedSuites.size === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Create Test Run
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
