'use client'

import { useState, useEffect } from 'react'
import { Project, TestCase } from '@/types'
import { ArrowLeft, Plus, FileText, Trash2 } from 'lucide-react'
import { 
  loadTestCasesByProject, 
  saveTestCase, 
  updateTestCase,
  deleteTestCase,
  subscribeToTestCases 
} from '@/utils/storage'
import TestCaseForm from './TestCaseForm'
import TestCaseList from './TestCaseList'

interface ProjectViewProps {
  project: Project
  onBack: () => void
  onDelete: (projectId: string) => void
}

export default function ProjectView({ project, onBack, onDelete }: ProjectViewProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial test cases
    loadTestCasesByProject(project.id).then(data => {
      setTestCases(data)
      setLoading(false)
    })

    // Subscribe to real-time updates
    const unsubscribe = subscribeToTestCases(project.id, (updatedTestCases) => {
      setTestCases(updatedTestCases)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [project.id])

  const handleCreateTestCase = async (testCaseData: Omit<TestCase, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => {
    const newTestCase: Omit<TestCase, 'id'> = {
      ...testCaseData,
      projectId: project.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    try {
      const testCaseId = await saveTestCase(newTestCase)
      // If not using real-time updates (local storage), manually update
      if (!subscribeToTestCases(project.id, () => {})) {
        setTestCases([...testCases, { ...newTestCase, id: testCaseId }])
      }
      setShowForm(false)
    } catch (error) {
      console.error('Error creating test case:', error)
      alert('Failed to create test case')
    }
  }

  const handleUpdateTestCase = async (testCaseData: Omit<TestCase, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTestCase) return

    try {
      await updateTestCase(editingTestCase.id, testCaseData)
      // If not using real-time updates (local storage), manually update
      if (!subscribeToTestCases(project.id, () => {})) {
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
      // If not using real-time updates (local storage), manually update
      if (!subscribeToTestCases(project.id, () => {})) {
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

  const handleDeleteProject = () => {
    if (confirm(`Are you sure you want to delete project "${project.name}" and all its test cases?`)) {
      // Delete all test cases for this project
      Promise.all(testCases.map(tc => deleteTestCase(tc.id)))
        .then(() => {
          // Delete the project
          onDelete(project.id)
        })
        .catch(error => {
          console.error('Error deleting project:', error)
          alert('Failed to delete project')
        })
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
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Test Case
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
          <div className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Total Test Cases</p>
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
    </main>
  )
}
