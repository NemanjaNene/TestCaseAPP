'use client'

import { useState, useEffect } from 'react'
import { TestCase, TestRunResult, TestResultStatus, User } from '@/types'
import { FileText, Edit2, Trash2, Calendar, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { loadTestRunResults, canEditProject } from '@/utils/storage'

interface TestCaseListProps {
  testCases: TestCase[]
  user: User
  onEdit: (testCase: TestCase) => void
  onDelete: (testCaseId: string) => void
  onReorder: (reorderedTestCases: TestCase[]) => void
}

export default function TestCaseList({ testCases, user, onEdit, onDelete, onReorder }: TestCaseListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [localTestCases, setLocalTestCases] = useState<TestCase[]>(testCases)
  const [testResults, setTestResults] = useState<Map<string, TestRunResult>>(new Map())

  // Load latest test results for all test cases
  useEffect(() => {
    const loadResults = async () => {
      const allResults = await loadTestRunResults()
      
      // For each test case, find the most recent result
      const latestResults = new Map<string, TestRunResult>()
      testCases.forEach(testCase => {
        const results = allResults
          .filter(r => r.testCaseId === testCase.id)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        
        if (results.length > 0) {
          latestResults.set(testCase.id, results[0])
        }
      })
      
      setTestResults(latestResults)
    }
    
    loadResults()
  }, [testCases])

  // Update local state when props change (from parent or firebase)
  useEffect(() => {
    if (!draggedId) {
      setLocalTestCases(testCases)
    }
  }, [testCases, draggedId])

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setExpandedIds(new Set(localTestCases.map(tc => tc.id)))
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  const handleDragStart = (e: React.DragEvent, testCaseId: string) => {
    setDraggedId(testCaseId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, testCaseId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedId && draggedId !== testCaseId) {
      setDragOverId(testCaseId)
    }
  }

  const handleDragEnter = (e: React.DragEvent, testCaseId: string) => {
    e.preventDefault()
    
    if (draggedId && draggedId !== testCaseId) {
      // Reorder locally for smooth visual feedback
      const draggedIndex = localTestCases.findIndex(tc => tc.id === draggedId)
      const targetIndex = localTestCases.findIndex(tc => tc.id === testCaseId)

      if (draggedIndex === -1 || targetIndex === -1) return

      // Create new array with item moved to target position
      const reordered = [...localTestCases]
      const [draggedItem] = reordered.splice(draggedIndex, 1)
      reordered.splice(targetIndex, 0, draggedItem)

      // Update local state immediately for visual feedback
      setLocalTestCases(reordered)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    
    // Save the final order
    if (draggedId) {
      const updatedTestCases = localTestCases.map((tc, index) => ({
        ...tc,
        order: index
      }))
      onReorder(updatedTestCases)
    }
    
    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    // Save the final order
    if (draggedId) {
      const updatedTestCases = localTestCases.map((tc, index) => ({
        ...tc,
        order: index
      }))
      onReorder(updatedTestCases)
    }
    
    setDraggedId(null)
    setDragOverId(null)
  }

  const getStatusColor = (status?: TestResultStatus) => {
    if (!status || status === 'not_run') return 'bg-gray-500'
    if (status === 'pass') return 'bg-green-500'
    if (status === 'fail') return 'bg-red-500'
    if (status === 'skip') return 'bg-yellow-500'
    if (status === 'blocked') return 'bg-orange-500'
    return 'bg-gray-500'
  }

  const getStatusLabel = (status?: TestResultStatus) => {
    if (!status || status === 'not_run') return 'Not executed'
    if (status === 'pass') return 'Passed'
    if (status === 'fail') return 'Failed'
    if (status === 'skip') return 'Skipped'
    if (status === 'blocked') return 'Blocked'
    return 'Unknown'
  }

  if (localTestCases.length === 0) {
    return (
      <div className="card text-center py-16">
        <FileText className="w-20 h-20 text-gray-600 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold mb-2 text-gray-400">No test cases yet</h3>
        <p className="text-gray-500">Create your first test case to get started</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-400" />
          <h2 className="text-3xl font-bold">Test Cases</h2>
          <span className="text-sm text-gray-500">({localTestCases.length})</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-sm px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-all"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-sm px-3 py-1 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-400 transition-all"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {localTestCases.map(testCase => {
          const isExpanded = expandedIds.has(testCase.id)
          const isDragging = draggedId === testCase.id
          const isDragOver = dragOverId === testCase.id
          const result = testResults.get(testCase.id)
          
          return (
            <div 
              key={testCase.id} 
              className={`card hover:border-blue-500/50 transition-all ${
                isDragging ? 'opacity-50 scale-95' : ''
              } ${
                isDragOver ? 'border-blue-500 scale-105' : ''
              }`}
              draggable={canEditProject(user)}
              onDragStart={canEditProject(user) ? (e) => handleDragStart(e, testCase.id) : undefined}
              onDragOver={canEditProject(user) ? (e) => handleDragOver(e, testCase.id) : undefined}
              onDragEnter={canEditProject(user) ? (e) => handleDragEnter(e, testCase.id) : undefined}
              onDrop={canEditProject(user) ? handleDrop : undefined}
              onDragEnd={canEditProject(user) ? handleDragEnd : undefined}
            >
              {/* Header - Always visible */}
              <div 
                className="flex items-center justify-between gap-4 cursor-pointer"
                onClick={() => toggleExpand(testCase.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {canEditProject(user) && (
                    <div 
                      className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <button
                    className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpand(testCase.id)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-blue-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    {result && (
                      <div 
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${getStatusColor(result.status)}`}
                        title={getStatusLabel(result.status)}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold truncate">{testCase.title}</h3>
                      {result && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          result.status === 'pass' ? 'bg-green-500/20 text-green-400' :
                          result.status === 'fail' ? 'bg-red-500/20 text-red-400' :
                          result.status === 'skip' ? 'bg-yellow-500/20 text-yellow-400' :
                          result.status === 'blocked' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {getStatusLabel(result.status)}
                        </span>
                      )}
                    </div>
                    {!isExpanded && testCase.description && (
                      <p className="text-sm text-gray-500 truncate">{testCase.description}</p>
                    )}
                  </div>
                </div>

                {canEditProject(user) && (
                  <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEdit(testCase)}
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => onDelete(testCase.id)}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-4 animate-fadeIn">
                  {testCase.description && (
                    <div>
                      <p className="text-sm font-semibold text-gray-400 mb-1">Description:</p>
                      <p className="text-gray-300 whitespace-pre-wrap">{testCase.description}</p>
                    </div>
                  )}

                  {testCase.preconditions && (
                    <div>
                      <p className="text-sm font-semibold text-gray-400 mb-1">Precondition(s):</p>
                      <p className="text-gray-300 whitespace-pre-wrap">{testCase.preconditions}</p>
                    </div>
                  )}

                  {testCase.testSteps && (
                    <div>
                      <p className="text-sm font-semibold text-gray-400 mb-1">Test Steps:</p>
                      <p className="text-gray-300 whitespace-pre-wrap">{testCase.testSteps}</p>
                    </div>
                  )}

                  {testCase.expectedResult && (
                    <div>
                      <p className="text-sm font-semibold text-gray-400 mb-1">Expected Result:</p>
                      <p className="text-gray-300 whitespace-pre-wrap">{testCase.expectedResult}</p>
                    </div>
                  )}

                  {result && (
                    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                      <p className="text-sm font-semibold text-gray-400 mb-2">Last Execution:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Status:</span>
                          <span className={`font-semibold ${
                            result.status === 'pass' ? 'text-green-400' :
                            result.status === 'fail' ? 'text-red-400' :
                            result.status === 'skip' ? 'text-yellow-400' :
                            result.status === 'blocked' ? 'text-orange-400' :
                            'text-gray-400'
                          }`}>
                            {getStatusLabel(result.status)}
                          </span>
                        </div>
                        {result.executedBy && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Executed by:</span>
                            <span className="text-gray-300">{result.executedBy}</span>
                          </div>
                        )}
                        {result.executedAt && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Executed at:</span>
                            <span className="text-gray-300">{new Date(result.executedAt).toLocaleString()}</span>
                          </div>
                        )}
                        {result.comment && (
                          <div>
                            <span className="text-gray-400">Comment:</span>
                            <p className="text-gray-300 mt-1 whitespace-pre-wrap">{result.comment}</p>
                          </div>
                        )}
                        {result.bugId && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Bug ID:</span>
                            <span className="text-red-400 font-mono">{result.bugId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Created: {new Date(testCase.createdAt).toLocaleString()}
                    </span>
                    {testCase.updatedAt !== testCase.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Updated: {new Date(testCase.updatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
