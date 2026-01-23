'use client'

import { useState, useEffect } from 'react'
import { TestCase } from '@/types'
import { FileText, Edit2, Trash2, Calendar, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'

interface TestCaseListProps {
  testCases: TestCase[]
  onEdit: (testCase: TestCase) => void
  onDelete: (testCaseId: string) => void
  onReorder: (reorderedTestCases: TestCase[]) => void
}

export default function TestCaseList({ testCases, onEdit, onDelete, onReorder }: TestCaseListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [localTestCases, setLocalTestCases] = useState<TestCase[]>(testCases)

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
          
          return (
            <div 
              key={testCase.id} 
              className={`card hover:border-blue-500/50 transition-all ${
                isDragging ? 'opacity-50 scale-95' : ''
              } ${
                isDragOver ? 'border-blue-500 scale-105' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, testCase.id)}
              onDragOver={(e) => handleDragOver(e, testCase.id)}
              onDragEnter={(e) => handleDragEnter(e, testCase.id)}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            >
              {/* Header - Always visible */}
              <div 
                className="flex items-center justify-between gap-4 cursor-pointer"
                onClick={() => toggleExpand(testCase.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </div>
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
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold truncate">{testCase.title}</h3>
                    {!isExpanded && testCase.description && (
                      <p className="text-sm text-gray-500 truncate">{testCase.description}</p>
                    )}
                  </div>
                </div>

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
