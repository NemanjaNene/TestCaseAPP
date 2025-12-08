'use client'

import { useState, useEffect } from 'react'
import { TestSuite, TestCase } from '@/types'
import { ArrowLeft, Plus, FileText, Trash2, Layers } from 'lucide-react'
import { 
  loadTestCasesBySuite, 
  saveTestCase, 
  updateTestCase,
  deleteTestCase,
  deleteTestSuite,
  subscribeToTestCasesBySuite 
} from '@/utils/storage'
import TestCaseForm from './TestCaseForm'
import TestCaseList from './TestCaseList'

interface TestSuiteViewProps {
  suite: TestSuite
  projectId: string
  onBack: () => void
}

export default function TestSuiteView({ suite, projectId, onBack }: TestSuiteViewProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTestCasesBySuite(suite.id).then(data => {
      setTestCases(data)
      setLoading(false)
    })

    const unsubscribe = subscribeToTestCasesBySuite(suite.id, (updatedTestCases) => {
      setTestCases(updatedTestCases)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [suite.id])

  const handleCreateTestCase = async (testCaseData: Omit<TestCase, 'id' | 'projectId' | 'suiteId' | 'createdAt' | 'updatedAt'>) => {
    const newTestCase: Omit<TestCase, 'id'> = {
      ...testCaseData,
      projectId: projectId,
      suiteId: suite.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    try {
      const testCaseId = await saveTestCase(newTestCase)
      if (!subscribeToTestCasesBySuite(suite.id, () => {})) {
        setTestCases([...testCases, { ...newTestCase, id: testCaseId }])
      }
      setShowForm(false)
    } catch (error) {
      console.error('Error creating test case:', error)
      alert('Failed to create test case')
    }
  }

  const handleUpdateTestCase = async (testCaseData: Omit<TestCase, 'id' | 'projectId' | 'suiteId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTestCase) return

    try {
      await updateTestCase(editingTestCase.id, testCaseData)
      if (!subscribeToTestCasesBySuite(suite.id, () => {})) {
        setTestCases(testCases.map(tc => 
          tc.id === editingTestCase.id 
            ? { ...tc, ...testCaseData, updatedAt: new Date().toISOString() }
            : tc
        ))
      }
      setEditingTestCase(null)
      setShowForm(false)
    } catch (error) {
      console.error('Error updating test case:', error)
      alert('Failed to update test case')
    }
  }

  const handleDeleteTestCase = async (testCaseId: string) => {
    if (!confirm('Are you sure you want to delete this test case?')) return

    try {
      await deleteTestCase(testCaseId)
      if (!subscribeToTestCasesBySuite(suite.id, () => {})) {
        setTestCases(testCases.filter(tc => tc.id !== testCaseId))
      }
    } catch (error) {
      console.error('Error deleting test case:', error)
      alert('Failed to delete test case')
    }
  }

  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase)
    setShowForm(true)
  }

  const handleDeleteSuite = async () => {
    if (!confirm(`Are you sure you want to delete "${suite.name}" and all its test cases?`)) return

    try {
      // Delete all test cases in this suite
      await Promise.all(testCases.map(tc => deleteTestCase(tc.id)))
      // Delete the suite
      await deleteTestSuite(suite.id)
      onBack()
    } catch (error) {
      console.error('Error deleting suite:', error)
      alert('Failed to delete test suite')
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingTestCase(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-32 h-32 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Suites
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {suite.name}
              </h1>
              <p className="text-gray-400">
                {suite.description || 'No description'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Test Case
          </button>
          <button
            onClick={handleDeleteSuite}
            className="btn-danger flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Suite
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-gray-400 text-sm">Test Cases in Suite</p>
              <p className="text-3xl font-bold">{testCases.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Case Form or List */}
      {showForm ? (
        <TestCaseForm
          testCase={editingTestCase}
          onSubmit={editingTestCase ? handleUpdateTestCase : handleCreateTestCase}
          onCancel={handleCancelForm}
        />
      ) : (
        <TestCaseList
          testCases={testCases}
          onEdit={handleEditTestCase}
          onDelete={handleDeleteTestCase}
        />
      )}
    </div>
  )
}

