'use client'

import { useState, useEffect } from 'react'
import { TestCase } from '@/types'
import { Save, X } from 'lucide-react'

interface TestCaseFormProps {
  testCase?: TestCase | null
  onSubmit: (data: Omit<TestCase, 'id' | 'projectId' | 'suiteId' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export default function TestCaseForm({ testCase, onSubmit, onCancel }: TestCaseFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [preconditions, setPreconditions] = useState('')
  const [testSteps, setTestSteps] = useState('')
  const [expectedResult, setExpectedResult] = useState('')

  useEffect(() => {
    if (testCase) {
      setTitle(testCase.title)
      setDescription(testCase.description)
      setPreconditions(testCase.preconditions)
      setTestSteps(testCase.testSteps)
      setExpectedResult(testCase.expectedResult)
    }
  }, [testCase])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      preconditions: preconditions.trim(),
      testSteps: testSteps.trim(),
      expectedResult: expectedResult.trim(),
    })
  }

  return (
    <div className="card animate-slideUp">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">
          {testCase ? 'Edit Test Case' : 'Create New Test Case'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title: *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Enter test case title..."
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea-field"
            placeholder="Enter test case description..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Precondition(s):
          </label>
          <textarea
            value={preconditions}
            onChange={(e) => setPreconditions(e.target.value)}
            className="textarea-field"
            placeholder="Enter preconditions for this test..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Test Steps:
          </label>
          <textarea
            value={testSteps}
            onChange={(e) => setTestSteps(e.target.value)}
            className="textarea-field"
            placeholder="1. First step&#10;2. Second step&#10;3. Third step..."
            rows={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Expected Result:
          </label>
          <textarea
            value={expectedResult}
            onChange={(e) => setExpectedResult(e.target.value)}
            className="textarea-field"
            placeholder="Enter expected result..."
            rows={4}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            {testCase ? 'Update Test Case' : 'Create Test Case'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

