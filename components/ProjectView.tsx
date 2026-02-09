'use client'

import { useState, useEffect } from 'react'
import { Project, TestSuite, TestCase, TestRun, User } from '@/types'
import { ArrowLeft, Plus, Layers, Trash2, FileText, PlayCircle } from 'lucide-react'
import { 
  loadTestSuitesByProject,
  saveTestSuite,
  deleteTestSuite,
  subscribeToTestSuites,
  loadTestCasesByProject,
  deleteTestCase,
  subscribeToTestCases,
  saveTestRun,
  getCurrentUser,
  canEditProject
} from '@/utils/storage'
import CreateTestSuiteModal from './CreateTestSuiteModal'
import TestSuiteView from './TestSuiteView'
import CreateTestRunModal from './CreateTestRunModal'
import TestRunList from './TestRunList'
import TestRunExecution from './TestRunExecution'
import TestRunDashboard from './TestRunDashboard'
import TestRunReport from './TestRunReport'

interface ProjectViewProps {
  project: Project
  user: User
  onBack: () => void
  onDelete: (projectId: string) => void
}

type ViewMode = 'suites' | 'runs'
type TestRunView = 'execution' | 'report'

export default function ProjectView({ project, user, onBack, onDelete }: ProjectViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('suites')
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [testCaseCounts, setTestCaseCounts] = useState<Record<string, number>>({})
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null)
  const [selectedTestRun, setSelectedTestRun] = useState<TestRun | null>(null)
  const [testRunView, setTestRunView] = useState<TestRunView>('execution')
  const [showCreateSuiteModal, setShowCreateSuiteModal] = useState(false)
  const [showCreateRunModal, setShowCreateRunModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshTestCaseCounts = async () => {
    const testCases = await loadTestCasesByProject(project.id)
    const counts: Record<string, number> = {}
    testCases.forEach(tc => {
      if (tc.suiteId) {
        counts[tc.suiteId] = (counts[tc.suiteId] || 0) + 1
      }
    })
    setTestCaseCounts(counts)
  }

  useEffect(() => {
    // Load initial test suites
    loadTestSuitesByProject(project.id).then(data => {
      setTestSuites(data)
      setLoading(false)
    })

    // Load test case counts
    refreshTestCaseCounts()

    // Subscribe to real-time updates for suites
    const unsubscribeSuites = subscribeToTestSuites(project.id, (updatedSuites) => {
      setTestSuites(updatedSuites)
    })

    // Subscribe to real-time updates for test cases (to update counts)
    const unsubscribeTestCases = subscribeToTestCases(project.id, (testCases) => {
      const counts: Record<string, number> = {}
      testCases.forEach(tc => {
        if (tc.suiteId) {
          counts[tc.suiteId] = (counts[tc.suiteId] || 0) + 1
        }
      })
      setTestCaseCounts(counts)
    })

    return () => {
      if (unsubscribeSuites) unsubscribeSuites()
      if (unsubscribeTestCases) unsubscribeTestCases()
    }
  }, [project.id])

  // Refresh counts when coming back from suite view
  useEffect(() => {
    if (!selectedSuite) {
      refreshTestCaseCounts()
    }
  }, [selectedSuite])

  const handleCreateSuite = async (name: string, description: string) => {
    const newSuite: Omit<TestSuite, 'id'> = {
      name,
      description,
      projectId: project.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    try {
      const suiteId = await saveTestSuite(newSuite)
      if (!subscribeToTestSuites(project.id, () => {})) {
        setTestSuites([...testSuites, { ...newSuite, id: suiteId }])
      }
      setShowCreateSuiteModal(false)
    } catch (error) {
      console.error('Error creating test suite:', error)
      alert('Failed to create test suite')
    }
  }

  const handleCreateTestRun = async (name: string, description: string, suiteIds: string[]) => {
    const user = getCurrentUser()
    const newTestRun: Omit<TestRun, 'id'> = {
      name,
      description,
      projectId: project.id,
      suiteIds,
      createdBy: user?.username || 'unknown',
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    try {
      const testRunId = await saveTestRun(newTestRun)
      setShowCreateRunModal(false)
      // Open the test run for execution
      setSelectedTestRun({ ...newTestRun, id: testRunId })
    } catch (error) {
      console.error('Error creating test run:', error)
      alert('Failed to create test run')
    }
  }

  const handleDeleteSuite = async (suiteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this test suite and all its test cases?')) return

    try {
      // Delete all test cases in this suite
      const allTestCases = await loadTestCasesByProject(project.id)
      const suiteTestCases = allTestCases.filter(tc => tc.suiteId === suiteId)
      await Promise.all(suiteTestCases.map(tc => deleteTestCase(tc.id)))
      
      // Delete the suite
      await deleteTestSuite(suiteId)
      
      if (!subscribeToTestSuites(project.id, () => {})) {
        setTestSuites(testSuites.filter(s => s.id !== suiteId))
      }
    } catch (error) {
      console.error('Error deleting test suite:', error)
      alert('Failed to delete test suite')
    }
  }

  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete project "${project.name}" and all its test suites and test cases?`)) return

    try {
      // Delete all test cases
      const testCases = await loadTestCasesByProject(project.id)
      await Promise.all(testCases.map(tc => deleteTestCase(tc.id)))
      
      // Delete all test suites
      await Promise.all(testSuites.map(s => deleteTestSuite(s.id)))
      
      // Delete the project
      onDelete(project.id)
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-32 h-32 rounded-full"></div>
      </div>
    )
  }

  // If a suite is selected, show the suite view
  if (selectedSuite) {
    return (
      <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <TestSuiteView
            suite={selectedSuite}
            projectId={project.id}
            user={user}
            onBack={() => setSelectedSuite(null)}
          />
        </div>
      </main>
    )
  }

  // If a test run is selected, show the test run execution or report view (only for QA Team)
  if (selectedTestRun && user.role === 'admin') {
    return (
      <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="max-w-7xl mx-auto">
          {testRunView === 'execution' ? (
            <TestRunExecution
              testRun={selectedTestRun}
              onBack={() => {
                setSelectedTestRun(null)
                setTestRunView('execution')
              }}
              onViewReport={() => setTestRunView('report')}
            />
          ) : (
            <TestRunReport
              testRun={selectedTestRun}
              onBack={() => {
                setSelectedTestRun(null)
                setTestRunView('execution')
              }}
              onContinueExecution={() => setTestRunView('execution')}
            />
          )}
        </div>
      </main>
    )
  }

  // Calculate total test cases
  const totalTestCases = Object.values(testCaseCounts).reduce((a, b) => a + b, 0)

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {project.name}
              </h1>
              <p className="text-gray-400 text-lg">
                {project.description || 'No description'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {canEditProject(user) && (
              <>
                {viewMode === 'suites' ? (
                  <button
                    onClick={() => setShowCreateSuiteModal(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    New Test Suite
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCreateRunModal(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    New Test Run
                  </button>
                )}
                <button
                  onClick={handleDeleteProject}
                  className="btn-danger flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Project
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setViewMode('suites')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              viewMode === 'suites'
                ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                : 'bg-gray-800/50 border-2 border-gray-700/50 text-gray-400 hover:border-gray-600/50'
            }`}
          >
            <Layers className="w-5 h-5" />
            Test Suites
          </button>
          {user.role === 'admin' && (
            <button
              onClick={() => setViewMode('runs')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'runs'
                  ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                  : 'bg-gray-800/50 border-2 border-gray-700/50 text-gray-400 hover:border-gray-600/50'
              }`}
            >
              <PlayCircle className="w-5 h-5" />
              Test Runs
            </button>
          )}
        </div>

        {/* Content Based on View Mode */}
        {viewMode === 'suites' || user.role !== 'admin' ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <Layers className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Test Suites</p>
                    <p className="text-3xl font-bold">{testSuites.length}</p>
                  </div>
                </div>
              </div>
              <div className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Test Cases</p>
                    <p className="text-3xl font-bold">{totalTestCases}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Suites */}
            <div>
          <div className="flex items-center gap-3 mb-6">
            <Layers className="w-6 h-6 text-purple-400" />
            <h2 className="text-3xl font-bold">Test Suites</h2>
          </div>

          {testSuites.length === 0 ? (
            <div className="card text-center py-16">
              <Layers className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-400">
                {canEditProject(user) ? 'No test suites yet' : 'No test suites available'}
              </h3>
              <p className="text-gray-500 mb-6">
                {canEditProject(user) 
                  ? 'Create your first test suite to organize your test cases'
                  : 'This project does not have any test suites yet'}
              </p>
              {canEditProject(user) && (
                <button
                  onClick={() => setShowCreateSuiteModal(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create First Suite
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testSuites.map(suite => (
                <div
                  key={suite.id}
                  onClick={() => setSelectedSuite(suite)}
                  className="card cursor-pointer hover:border-purple-500/50 group relative"
                >
                  {canEditProject(user) && (
                    <button
                      onClick={(e) => handleDeleteSuite(suite.id, e)}
                      className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Suite"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1 truncate">{suite.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{suite.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {testCaseCounts[suite.id] || 0} test cases
                    </span>
                    <span className="text-gray-500">
                      {new Date(suite.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          </>
        ) : (
          <>
            {/* Test Run Dashboard (Green Area Stats) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <TestRunDashboard projectId={project.id} testSuites={testSuites} />
              </div>
              <div className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Test Cases</p>
                    <p className="text-3xl font-bold">{totalTestCases}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Runs List */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <PlayCircle className="w-6 h-6 text-green-400" />
                <h2 className="text-3xl font-bold">Test Runs</h2>
              </div>

              <TestRunList
                projectId={project.id}
                onSelectTestRun={setSelectedTestRun}
                onCreateNew={() => setShowCreateRunModal(true)}
              />
            </div>
          </>
        )}

        {/* Create Suite Modal */}
        {showCreateSuiteModal && (
          <CreateTestSuiteModal
            onClose={() => setShowCreateSuiteModal(false)}
            onCreate={handleCreateSuite}
          />
        )}

        {/* Create Test Run Modal */}
        {showCreateRunModal && (
          <CreateTestRunModal
            projectId={project.id}
            suites={testSuites}
            onClose={() => setShowCreateRunModal(false)}
            onCreate={handleCreateTestRun}
          />
        )}
      </div>
    </main>
  )
}
