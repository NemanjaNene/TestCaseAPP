'use client'

import { useState, useEffect } from 'react'
import { TestRun, TestCase, TestRunResult } from '@/types'
import { ArrowLeft, CheckCircle2, XCircle, SkipForward, Ban, FileText, MessageSquare, Bug } from 'lucide-react'
import { loadTestCasesBySuite, loadTestRunResultsByTestRun } from '@/utils/storage'

interface TestRunReportProps {
  testRun: TestRun
  onBack: () => void
  onContinueExecution?: () => void
}

export default function TestRunReport({ testRun, onBack, onContinueExecution }: TestRunReportProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [results, setResults] = useState<Map<string, TestRunResult>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [testRun.id])

  const loadData = async () => {
    setLoading(true)
    
    // Load all test cases from selected suites
    const allTestCases: TestCase[] = []
    for (const suiteId of testRun.suiteIds) {
      const suiteCases = await loadTestCasesBySuite(suiteId)
      allTestCases.push(...suiteCases)
    }
    
    // Sort by order
    allTestCases.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    setTestCases(allTestCases)

    // Load results
    const existingResults = await loadTestRunResultsByTestRun(testRun.id)
    const resultsMap = new Map<string, TestRunResult>()
    existingResults.forEach(r => resultsMap.set(r.testCaseId, r))
    setResults(resultsMap)

    setLoading(false)
  }

  // Calculate stats
  const stats = {
    total: testCases.length,
    pass: Array.from(results.values()).filter(r => r.status === 'pass').length,
    fail: Array.from(results.values()).filter(r => r.status === 'fail').length,
    skip: Array.from(results.values()).filter(r => r.status === 'skip').length,
    blocked: Array.from(results.values()).filter(r => r.status === 'blocked').length,
    notRun: testCases.length - results.size
  }

  const executed = stats.total - stats.notRun
  const passRate = executed > 0 ? Math.round((stats.pass / executed) * 100) : 0

  const getStatusIcon = (status?: string) => {
    if (status === 'pass') return <CheckCircle2 className="w-5 h-5 text-green-400" />
    if (status === 'fail') return <XCircle className="w-5 h-5 text-red-400" />
    if (status === 'skip') return <SkipForward className="w-5 h-5 text-yellow-400" />
    if (status === 'blocked') return <Ban className="w-5 h-5 text-orange-400" />
    return <FileText className="w-5 h-5 text-gray-400" />
  }

  const getStatusColor = (status?: string) => {
    if (status === 'pass') return 'bg-green-500/20 text-green-400 border-green-500/50'
    if (status === 'fail') return 'bg-red-500/20 text-red-400 border-red-500/50'
    if (status === 'skip') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    if (status === 'blocked') return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
    return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-32 h-32 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        {onContinueExecution && testRun.status === 'in_progress' && (
          <button
            onClick={onContinueExecution}
            className="btn-primary flex items-center gap-2"
          >
            Continue Execution
          </button>
        )}
      </div>

      {/* Test Run Info */}
      <div className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <h2 className="text-2xl font-bold mb-2">{testRun.name}</h2>
        {testRun.description && (
          <p className="text-gray-400 mb-4">{testRun.description}</p>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
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
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{passRate}%</p>
            <p className="text-xs text-gray-400">Pass Rate</p>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          Started: {new Date(testRun.startedAt).toLocaleString()}
          {testRun.completedAt && (
            <> | Completed: {new Date(testRun.completedAt).toLocaleString()}</>
          )}
        </div>
      </div>

      {/* Test Results */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Test Results</h3>
        <div className="space-y-3">
          {testCases.map((testCase, index) => {
            const result = results.get(testCase.id)
            
            return (
              <div
                key={testCase.id}
                className={`p-4 rounded-lg border ${getStatusColor(result?.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(result?.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {index + 1}. {testCase.title}
                        </h4>
                        {testCase.description && (
                          <p className="text-sm text-gray-400 mt-1">{testCase.description}</p>
                        )}
                      </div>
                      {result && (
                        <span className="text-xs px-2 py-1 rounded-full border font-semibold whitespace-nowrap">
                          {result.status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {result && (result.comment || result.bugId || result.executedBy) && (
                      <div className="mt-3 pt-3 border-t border-current/20 space-y-2 text-sm">
                        {result.executedBy && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Executed by:</span>
                            <span>{result.executedBy}</span>
                            {result.executedAt && (
                              <span className="text-gray-500">
                                • {new Date(result.executedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {result.comment && (
                          <div className="flex gap-2">
                            <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-gray-400">Comment:</span>
                              <p className="mt-1 whitespace-pre-wrap">{result.comment}</p>
                            </div>
                          </div>
                        )}
                        
                        {result.bugId && (
                          <div className="flex items-center gap-2">
                            <Bug className="w-4 h-4" />
                            <span className="text-gray-400">Bug ID:</span>
                            <span className="font-mono font-semibold">{result.bugId}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
