'use client'

import { useState, useEffect } from 'react'
import { TestRun, TestRunResult } from '@/types'
import { PlayCircle, Calendar, User, CheckCircle2, TrendingUp, Trash2, Eye } from 'lucide-react'
import { loadTestRunResultsByTestRun, deleteTestRun, subscribeToTestRuns, loadTestRunsByProject } from '@/utils/storage'

interface TestRunListProps {
  projectId: string
  onSelectTestRun: (testRun: TestRun) => void
  onCreateNew: () => void
}

interface TestRunWithStats extends TestRun {
  stats?: {
    total: number
    executed: number
    pass: number
    fail: number
    skip: number
    blocked: number
    passRate: number
  }
}

export default function TestRunList({ projectId, onSelectTestRun, onCreateNew }: TestRunListProps) {
  const [testRuns, setTestRuns] = useState<TestRunWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()

    const unsubscribe = subscribeToTestRuns(projectId, async (updatedRuns) => {
      await loadStatsForRuns(updatedRuns)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [projectId])

  const loadData = async () => {
    setLoading(true)
    const runs = await loadTestRunsByProject(projectId)
    await loadStatsForRuns(runs)
    setLoading(false)
  }

  const loadStatsForRuns = async (runs: TestRun[]) => {
    const runsWithStats = await Promise.all(
      runs.map(async (run) => {
        const results = await loadTestRunResultsByTestRun(run.id)
        
        const stats = {
          total: results.length,
          executed: results.filter(r => r.status !== 'not_run').length,
          pass: results.filter(r => r.status === 'pass').length,
          fail: results.filter(r => r.status === 'fail').length,
          skip: results.filter(r => r.status === 'skip').length,
          blocked: results.filter(r => r.status === 'blocked').length,
          passRate: 0
        }

        if (stats.executed > 0) {
          stats.passRate = (stats.pass / stats.executed) * 100
        }

        return { ...run, stats }
      })
    )

    // Sort by creation date (newest first)
    runsWithStats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setTestRuns(runsWithStats)
  }

  const handleDelete = async (testRunId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this test run? This cannot be undone.')) return

    try {
      await deleteTestRun(testRunId)
      if (!subscribeToTestRuns(projectId, () => {})) {
        await loadData()
      }
    } catch (error) {
      console.error('Error deleting test run:', error)
      alert('Failed to delete test run')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="loading w-32 h-32 rounded-full"></div>
      </div>
    )
  }

  if (testRuns.length === 0) {
    return (
      <div className="card text-center py-16">
        <PlayCircle className="w-20 h-20 text-gray-600 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2 text-gray-400">No test runs yet</h3>
        <p className="text-gray-500 mb-6">Create your first test run to start testing</p>
        <button
          onClick={onCreateNew}
          className="btn-primary inline-flex items-center gap-2"
        >
          <PlayCircle className="w-5 h-5" />
          Create First Test Run
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {testRuns.map(testRun => {
        const isCompleted = testRun.status === 'completed'
        const stats = testRun.stats!

        return (
          <div
            key={testRun.id}
            onClick={() => onSelectTestRun(testRun)}
            className="card cursor-pointer hover:border-green-500/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}>
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold truncate">{testRun.name}</h3>
                    {testRun.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{testRun.description}</p>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(testRun.startedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {testRun.createdBy}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    isCompleted 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {isCompleted ? '✅ Completed' : '🟡 In Progress'}
                  </span>
                </div>

                {/* Progress Bar */}
                {stats.total > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Execution Progress</span>
                      <span className="font-semibold">
                        {stats.executed}/{stats.total} ({Math.round((stats.executed / stats.total) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                        style={{ width: `${(stats.executed / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Pass: <strong>{stats.pass}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    ✕ Fail: <strong>{stats.fail}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    ⏭️ Skip: <strong>{stats.skip}</strong>
                  </span>
                  {stats.blocked > 0 && (
                    <span className="flex items-center gap-1 text-orange-400">
                      🚫 Blocked: <strong>{stats.blocked}</strong>
                    </span>
                  )}
                  {stats.executed > 0 && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <TrendingUp className="w-4 h-4" />
                      Pass Rate: <strong>{Math.round(stats.passRate)}%</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectTestRun(testRun)
                  }}
                  className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 transition-all"
                  title={isCompleted ? "View Report" : "Continue Test Run"}
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={(e) => handleDelete(testRun.id, e)}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 transition-all"
                  title="Delete Test Run"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
