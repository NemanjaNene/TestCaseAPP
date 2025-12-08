'use client'

import { useState, useEffect } from 'react'
import { Project, TestSuite, TestCase } from '@/types'
import { ArrowLeft, Plus, Layers, Trash2, FileText } from 'lucide-react'
import { 
  loadTestSuitesByProject,
  saveTestSuite,
  deleteTestSuite,
  subscribeToTestSuites,
  loadTestCasesByProject,
  deleteTestCase
} from '@/utils/storage'
import CreateTestSuiteModal from './CreateTestSuiteModal'
import TestSuiteView from './TestSuiteView'

interface ProjectViewProps {
  project: Project
  onBack: () => void
  onDelete: (projectId: string) => void
}

export default function ProjectView({ project, onBack, onDelete }: ProjectViewProps) {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [testCaseCounts, setTestCaseCounts] = useState<Record<string, number>>({})
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial test suites
    loadTestSuitesByProject(project.id).then(data => {
      setTestSuites(data)
      setLoading(false)
    })

    // Load test case counts for each suite
    loadTestCasesByProject(project.id).then(testCases => {
      const counts: Record<string, number> = {}
      testCases.forEach(tc => {
        counts[tc.suiteId] = (counts[tc.suiteId] || 0) + 1
      })
      setTestCaseCounts(counts)
    })

    // Subscribe to real-time updates
    const unsubscribe = subscribeToTestSuites(project.id, (updatedSuites) => {
      setTestSuites(updatedSuites)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [project.id])

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
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating test suite:', error)
      alert('Failed to create test suite')
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
            onBack={() => setSelectedSuite(null)}
          />
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Test Suite
            </button>
            <button
              onClick={handleDeleteProject}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete Project
            </button>
          </div>
        </div>

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
              <h3 className="text-2xl font-semibold mb-2 text-gray-400">No test suites yet</h3>
              <p className="text-gray-500 mb-6">Create your first test suite to organize your test cases</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create First Suite
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testSuites.map(suite => (
                <div
                  key={suite.id}
                  onClick={() => setSelectedSuite(suite)}
                  className="card cursor-pointer hover:border-purple-500/50 group relative"
                >
                  <button
                    onClick={(e) => handleDeleteSuite(suite.id, e)}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Suite"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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

        {/* Create Suite Modal */}
        {showCreateModal && (
          <CreateTestSuiteModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateSuite}
          />
        )}
      </div>
    </main>
  )
}
