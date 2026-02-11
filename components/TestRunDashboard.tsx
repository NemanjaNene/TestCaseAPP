'use client'

import { useState, useEffect } from 'react'
import { TestRun, TestRunResult, TestSuite } from '@/types'
import { loadTestRunsByProject, loadTestRunResultsByTestRun, subscribeToTestRuns } from '@/utils/storage'
import { TrendingUp, CheckCircle2, XCircle, SkipForward, Ban, Calendar, PlayCircle } from 'lucide-react'

interface TestRunDashboardProps {
  projectId: string
  testSuites: TestSuite[]
}

interface SuiteStats {
  suiteId: string
  suiteName: string
  pass: number
  fail: number
  skip: number
  blocked: number
  notRun: number
  total: number
}

export default function TestRunDashboard({ projectId, testSuites }: TestRunDashboardProps) {
  const [latestRun, setLatestRun] = useState<TestRun | null>(null)
  const [results, setResults] = useState<TestRunResult[]>([])
  const [suiteStats, setSuiteStats] = useState<SuiteStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()

    const unsubscribe = subscribeToTestRuns(projectId, async (runs) => {
      if (runs.length > 0) {
        const sorted = runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        await loadRunData(sorted[0])
      } else {
        setLatestRun(null)
        setResults([])
        setSuiteStats([])
      }
      setLoading(false)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [projectId])

  const loadData = async () => {
    setLoading(true)
    const runs = await loadTestRunsByProject(projectId)
    
    if (runs.length > 0) {
      const sorted = runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      await loadRunData(sorted[0])
    }
    
    setLoading(false)
  }

  const loadRunData = async (run: TestRun) => {
    setLatestRun(run)
    const runResults = await loadTestRunResultsByTestRun(run.id)
    setResults(runResults)

    // Calculate stats per suite
    const statsMap = new Map<string, SuiteStats>()
    
    // Initialize all suites
    testSuites.forEach(suite => {
      statsMap.set(suite.id, {
        suiteId: suite.id,
        suiteName: suite.name,
        pass: 0,
        fail: 0,
        skip: 0,
        blocked: 0,
        notRun: 0,
        total: 0
      })
    })

    // Count results per suite
    runResults.forEach(result => {
      const testCase = result.testCaseId // We need to get suite from testCase
      // For now, we'll aggregate all results
      // TODO: Group by suite properly when we have the mapping
    })

    setSuiteStats(Array.from(statsMap.values()))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading w-16 h-16 rounded-full"></div>
      </div>
    )
  }

  if (!latestRun) {
    return (
      <div className="card text-center py-12 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold mb-2 text-gray-400">No Test Runs Yet</h3>
        <p className="text-gray-500">Create a test run to see execution statistics here</p>
      </div>
    )
  }

  // Calculate overall stats
  const stats = {
    total: results.length,
    pass: results.filter(r => r.status === 'pass').length,
    fail: results.filter(r => r.status === 'fail').length,
    skip: results.filter(r => r.status === 'skip').length,
    blocked: results.filter(r => r.status === 'blocked').length,
    notRun: results.filter(r => r.status === 'not_run').length
  }

  const executed = stats.total - stats.notRun
  const passRate = executed > 0 ? Math.round((stats.pass / executed) * 100) : 0
  const executionRate = stats.total > 0 ? Math.round((executed / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Latest Test Run Card */}
      <div className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-400">Latest Test Run</h3>
            <h2 className="text-2xl font-bold">{latestRun.name}</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            latestRun.status === 'completed'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            {latestRun.status === 'completed' ? 'Completed' : 'In Progress'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Calendar className="w-4 h-4" />
          Started: {new Date(latestRun.startedAt).toLocaleString()}
        </div>

        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Overall Progress</span>
            <span className="font-semibold">{executionRate}% ({executed}/{stats.total})</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
              style={{ width: `${executionRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{stats.pass}</p>
            <p className="text-xs text-gray-400">Pass</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{stats.fail}</p>
            <p className="text-xs text-gray-400">Fail</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
              <SkipForward className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{stats.skip}</p>
            <p className="text-xs text-gray-400">Skip</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
              <Ban className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{stats.blocked}</p>
            <p className="text-xs text-gray-400">Blocked</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{passRate}%</p>
            <p className="text-xs text-gray-400">Pass Rate</p>
          </div>
        </div>
      </div>

      {/* By Suite Breakdown */}
      {testSuites.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">By Test Suite</h3>
          <div className="space-y-3">
            {testSuites.map(suite => {
              // Filter results for this suite
              // Note: This is simplified - in real implementation you'd need to map test cases to suites
              const suiteResults = results // Placeholder - needs proper filtering
              const suitePass = suiteResults.filter(r => r.status === 'pass').length
              const suiteFail = suiteResults.filter(r => r.status === 'fail').length
              const suiteSkip = suiteResults.filter(r => r.status === 'skip').length
              const suiteBlocked = suiteResults.filter(r => r.status === 'blocked').length
              const suiteTotal = suiteResults.length

              return (
                <div key={suite.id} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <p className="font-semibold mb-2">{suite.name}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {suitePass}
                    </span>
                    <span className="text-red-400 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> {suiteFail}
                    </span>
                    <span className="text-yellow-400 flex items-center gap-1">
                      <SkipForward className="w-3 h-3" /> {suiteSkip}
                    </span>
                    {suiteBlocked > 0 && (
                      <span className="text-orange-400 flex items-center gap-1">
                        <Ban className="w-3 h-3" /> {suiteBlocked}
                      </span>
                    )}
                    <span className="text-gray-500 ml-auto">({suiteTotal} total)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
