export interface User {
  id: string
  username: string
  password: string
  name: string
}

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface TestCase {
  id: string
  projectId: string
  title: string
  description: string
  preconditions: string
  testSteps: string
  expectedResult: string
  createdAt: string
  updatedAt: string
}

export interface AppState {
  currentUser: User | null
  projects: Project[]
  testCases: TestCase[]
}
