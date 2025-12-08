'use client'

import { TestCase } from '@/types'
import { FileText, Edit2, Trash2, Calendar } from 'lucide-react'

interface TestCaseListProps {
  testCases: TestCase[]
  onEdit: (testCase: TestCase) => void
  onDelete: (testCaseId: string) => void
}

export default function TestCaseList({ testCases, onEdit, onDelete }: TestCaseListProps) {
  if (testCases.length === 0) {
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
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-blue-400" />
        <h2 className="text-3xl font-bold">Test Cases</h2>
        <span className="text-sm text-gray-500">({testCases.length})</span>
      </div>

      <div className="space-y-4">
        {testCases.map(testCase => (
          <div key={testCase.id} className="card hover:border-blue-500/50 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold mb-2">{testCase.title}</h3>
                    {testCase.description && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-gray-400 mb-1">Description:</p>
                        <p className="text-gray-300 whitespace-pre-wrap">{testCase.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pl-13">
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
              </div>

              <div className="flex gap-2 flex-shrink-0">
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
          </div>
        ))}
      </div>
    </div>
  )
}

