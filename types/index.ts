export type UserRole = 'admin' | 'global_viewer' | 'project_viewer'

export interface User {
  id: string
  username: string
  password: string
  name: string
  role: UserRole
  projectAccess?: string[] // For project_viewer role - array of project IDs or names
}

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface TestSuite {
  id: string
  projectId: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface TestCase {
  id: string
  projectId: string
  suiteId: string
  title: string
  description: string
  preconditions: string
  testSteps: string
  expectedResult: string
  order: number
  createdAt: string
  updatedAt: string
}

export type TestRunStatus = 'in_progress' | 'completed'
export type TestResultStatus = 'pass' | 'fail' | 'skip' | 'blocked' | 'not_run'

export interface TestRun {
  id: string
  name: string
  description: string
  projectId: string
  suiteIds: string[]
  createdBy: string
  startedAt: string
  completedAt?: string
  status: TestRunStatus
  createdAt: string
  updatedAt: string
}

export interface TestRunResult {
  id: string
  testRunId: string
  testCaseId: string
  status: TestResultStatus
  comment?: string
  bugId?: string
  executedAt?: string
  executedBy?: string
  createdAt: string
  updatedAt: string
}

export interface AppState {
  currentUser: User | null
  projects: Project[]
  testSuites: TestSuite[]
  testCases: TestCase[]
  testRuns: TestRun[]
  testRunResults: TestRunResult[]
}
