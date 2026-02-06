'use client'

import { useState, useEffect } from 'react'
import { TestRun, TestCase, TestRunResult, TestResultStatus } from '@/types'
import { ArrowLeft, CheckCircle2, XCircle, SkipForward, Ban, ChevronRight, ChevronLeft, FileText } from 'lucide-react'
import { loadTestCasesBySuite, loadTestRunResultsByTestRun, upsertTestRunResult, updateTestRun, subscribeToTestRunResults } from '@/utils/storage'
import { getCurrentUser } from '@/utils/storage'

interface TestRunExecutionProps {
  testRun: TestRun
  onBack: () => void
}

export default function TestRunExecution({ testRun, onBack }: TestRunExecutionProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [results, setResults] = useState<Map<string, TestRunResult>>(new Map())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [comment, setComment] = useState('')
  const [bugId, setBugId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()

    // Try to subscribe to real-time updates if Firebase is available
    const unsubscribe = subscribeToTestRunResults(testRun.id, (updatedResults) => {
      console.log('🔔 Real-time update: Received', updatedResults.length, 'results')
      const resultsMap = new Map<string, TestRunResult>()
      updatedResults.forEach(r => resultsMap.set(r.testCaseId, r))
      setResults(resultsMap)
    })

    if (!unsubscribe) {
      console.log('⚠️ Real-time subscription not available, using manual refresh')
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
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

    // Load existing results
    const existingResults = await loadTestRunResultsByTestRun(testRun.id)
    const resultsMap = new Map<string, TestRunResult>()
    existingResults.forEach(r => resultsMap.set(r.testCaseId, r))
    setResults(resultsMap)

    setLoading(false)
  }

  const currentTestCase = testCases[currentIndex]
  const currentResult = currentTestCase ? results.get(currentTestCase.id) : undefined

  useEffect(() => {
    // Load comment and bugId when test case changes
    if (currentResult) {
      setComment(currentResult.comment || '')
      setBugId(currentResult.bugId || '')
    } else {
      setComment('')
      setBugId('')
    }
  }, [currentIndex, currentResult])

  const handleMarkStatus = async (status: TestResultStatus) => {
    if (!currentTestCase) return

    const user = getCurrentUser()
    const now = new Date().toISOString()

    console.log('🔵 Marking status:', status, 'for test case:', currentTestCase.id)

    try {
      const resultData: any = {
        status,
        executedAt: now,
        executedBy: user?.username || 'unknown'
      }
      
      // Only add comment and bugId if they have values
      if (comment.trim()) {
        resultData.comment = comment.trim()
      }
      if (bugId.trim()) {
        resultData.bugId = bugId.trim()
      }
      
      await upsertTestRunResult(testRun.id, currentTestCase.id, resultData)

      console.log('✅ Result saved successfully')

      // Small delay to ensure storage is updated
      await new Promise(resolve => setTimeout(resolve, 100))

      // Reload results from storage to ensure sync
      const freshResults = await loadTestRunResultsByTestRun(testRun.id)
      console.log('🔄 Reloaded results:', freshResults.length, 'results')
      
      const resultsMap = new Map<string, TestRunResult>()
      freshResults.forEach(r => {
        console.log('📊 Result:', r.testCaseId, '→', r.status)
        resultsMap.set(r.testCaseId, r)
      })
      
      setResults(resultsMap)
      console.log('✨ State updated, total results:', resultsMap.size)

      // Auto-advance to next test case
      if (currentIndex < testCases.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    } catch (error) {
      console.error('❌ Error marking test result:', error)
      // Don't show alert, just log the error
      console.error('Note: Result may have been saved to localStorage')
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < testCases.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleComplete = async () => {
    if (!confirm('Mark this test run as completed?')) return

    try {
      await updateTestRun(testRun.id, {
        status: 'completed',
        completedAt: new Date().toISOString()
      })
      onBack()
    } catch (error) {
      console.error('Error completing test run:', error)
      alert('Failed to complete test run')
    }
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

  const progress = stats.total > 0 ? ((stats.total - stats.notRun) / stats.total) * 100 : 0

  // Debug: Log stats when they change
  console.log('📈 Stats:', stats, 'Progress:', progress.toFixed(1) + '%')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-32 h-32 rounded-full"></div>
      </div>
    )
  }

  if (testCases.length === 0) {
    return (
      <div className="card text-center py-16">
        <FileText className="w-20 h-20 text-gray-600 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2 text-gray-400">No test cases found</h3>
        <p className="text-gray-500 mb-6">The selected test suites don't have any test cases yet.</p>
        <button onClick={onBack} className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          Back to Test Runs
        </button>
      </div>
    )
  }

  const getStatusColor = (status?: TestResultStatus) => {
    if (!status || status === 'not_run') return 'bg-gray-500'
    if (status === 'pass') return 'bg-green-500'
    if (status === 'fail') return 'bg-red-500'
    if (status === 'skip') return 'bg-yellow-500'
    if (status === 'blocked') return 'bg-orange-500'
    return 'bg-gray-500'
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar - Test Cases List */}
      <div className="w-80 flex-shrink-0">
        <div className="card sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-3">Test Cases</h3>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-400">Pass</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-400">Fail</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-gray-400">Skip</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-gray-400">Blocked</span>
            </div>
          </div>

          <div className="space-y-2">
            {testCases.map((testCase, index) => {
              const result = results.get(testCase.id)
              const isActive = index === currentIndex
              return (
                <button
                  key={testCase.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(result?.status)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{testCase.title}</p>
                      <p className="text-xs text-gray-400">Test {index + 1} of {testCases.length}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={handleComplete}
            className="btn-primary"
          >
            Complete Test Run
          </button>
        </div>

      {/* Test Run Info */}
      <div className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <h2 className="text-2xl font-bold mb-2">{testRun.name}</h2>
        {testRun.description && (
          <p className="text-gray-400 mb-4">{testRun.description}</p>
        )}
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="font-semibold">{Math.round(progress)}% ({stats.total - stats.notRun}/{stats.total})</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Pass: <strong>{stats.pass}</strong>
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="w-4 h-4 text-red-400" />
            Fail: <strong>{stats.fail}</strong>
          </span>
          <span className="flex items-center gap-1">
            <SkipForward className="w-4 h-4 text-yellow-400" />
            Skip: <strong>{stats.skip}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Ban className="w-4 h-4 text-orange-400" />
            Blocked: <strong>{stats.blocked}</strong>
          </span>
        </div>
      </div>

      {/* Test Case Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Test Case {currentIndex + 1} of {testCases.length}</p>
            <h3 className="text-2xl font-bold">{currentTestCase.title}</h3>
          </div>
          {currentResult && (
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              currentResult.status === 'pass' ? 'bg-green-500/20 text-green-400' :
              currentResult.status === 'fail' ? 'bg-red-500/20 text-red-400' :
              currentResult.status === 'skip' ? 'bg-yellow-500/20 text-yellow-400' :
              currentResult.status === 'blocked' ? 'bg-orange-500/20 text-orange-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {currentResult.status.toUpperCase()}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          {currentTestCase.description && (
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-1">Description:</p>
              <p className="text-gray-300 whitespace-pre-wrap">{currentTestCase.description}</p>
            </div>
          )}

          {currentTestCase.preconditions && (
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-1">Preconditions:</p>
              <p className="text-gray-300 whitespace-pre-wrap">{currentTestCase.preconditions}</p>
            </div>
          )}

          {currentTestCase.testSteps && (
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-1">Test Steps:</p>
              <p className="text-gray-300 whitespace-pre-wrap">{currentTestCase.testSteps}</p>
            </div>
          )}

          {currentTestCase.expectedResult && (
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-1">Expected Result:</p>
              <p className="text-gray-300 whitespace-pre-wrap">{currentTestCase.expectedResult}</p>
            </div>
          )}
        </div>

        {/* Status Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => handleMarkStatus('pass')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 font-semibold transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            Pass
          </button>
          <button
            onClick={() => handleMarkStatus('fail')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-semibold transition-all"
          >
            <XCircle className="w-5 h-5" />
            Fail
          </button>
          <button
            onClick={() => handleMarkStatus('skip')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 font-semibold transition-all"
          >
            <SkipForward className="w-5 h-5" />
            Skip
          </button>
          <button
            onClick={() => handleMarkStatus('blocked')}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 text-orange-400 font-semibold transition-all"
          >
            <Ban className="w-5 h-5" />
            Blocked
          </button>
        </div>

        {/* Comment and Bug ID */}
        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="textarea-field"
              placeholder="Add notes, observations, or details about the test execution..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bug ID (optional)
            </label>
            <input
              type="text"
              value={bugId}
              onChange={(e) => setBugId(e.target.value)}
              className="input-field"
              placeholder="e.g., BUG-123, JIRA-456"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === testCases.length - 1}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
