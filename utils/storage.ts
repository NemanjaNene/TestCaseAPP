import { User, Project, TestSuite, TestCase } from '@/types'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

// ============================================
// USERS (kept in local storage for simplicity)
// ============================================
export const loadUsers = (): User[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('qa_users')
  if (!data) {
    const defaultUsers = [{ 
      id: '1', 
      username: 'admin', 
      password: 'admin123',
      name: 'Administrator' 
    }]
    saveUsers(defaultUsers)
    return defaultUsers
  }
  return JSON.parse(data)
}

export const saveUsers = (users: User[]): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('qa_users', JSON.stringify(users))
}

// Current User
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem('qa_current_user')
  return data ? JSON.parse(data) : null
}

export const setCurrentUser = (user: User | null): void => {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem('qa_current_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('qa_current_user')
  }
}

// ============================================
// PROJECTS (Firebase or Local Storage)
// ============================================
export const loadProjects = async (): Promise<Project[]> => {
  if (!isFirebaseConfigured() || !db) {
    // Fallback to local storage
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('qa_projects')
    return data ? JSON.parse(data) : []
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'projects'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Project))
  } catch (error) {
    console.error('Error loading projects from Firebase:', error)
    return []
  }
}

export const saveProject = async (project: Omit<Project, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured() || !db) {
    // Fallback to local storage
    const newProject = { ...project, id: Date.now().toString() }
    const projects = await loadProjects()
    const updated = [...projects, newProject]
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_projects', JSON.stringify(updated))
    }
    return newProject.id
  }

  try {
    const docRef = await addDoc(collection(db, 'projects'), project)
    return docRef.id
  } catch (error) {
    console.error('Error saving project to Firebase:', error)
    throw error
  }
}

export const deleteProject = async (projectId: string): Promise<void> => {
  if (!isFirebaseConfigured() || !db) {
    // Fallback to local storage
    const projects = await loadProjects()
    const updated = projects.filter(p => p.id !== projectId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_projects', JSON.stringify(updated))
    }
    return
  }

  try {
    await deleteDoc(doc(db, 'projects', projectId))
  } catch (error) {
    console.error('Error deleting project from Firebase:', error)
    throw error
  }
}

export const subscribeToProjects = (callback: (projects: Project[]) => void): Unsubscribe | null => {
  if (!isFirebaseConfigured() || !db) return null

  try {
    return onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project))
      callback(projects)
    })
  } catch (error) {
    console.error('Error subscribing to projects:', error)
    return null
  }
}

// ============================================
// TEST SUITES (Firebase or Local Storage)
// ============================================
export const loadTestSuites = async (): Promise<TestSuite[]> => {
  if (!isFirebaseConfigured() || !db) {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('qa_test_suites')
    return data ? JSON.parse(data) : []
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'testSuites'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestSuite))
  } catch (error) {
    console.error('Error loading test suites from Firebase:', error)
    return []
  }
}

export const loadTestSuitesByProject = async (projectId: string): Promise<TestSuite[]> => {
  if (!isFirebaseConfigured() || !db) {
    const allSuites = await loadTestSuites()
    return allSuites.filter(s => s.projectId === projectId)
  }

  try {
    const q = query(collection(db, 'testSuites'), where('projectId', '==', projectId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestSuite))
  } catch (error) {
    console.error('Error loading test suites by project from Firebase:', error)
    return []
  }
}

export const saveTestSuite = async (testSuite: Omit<TestSuite, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured() || !db) {
    const newSuite = { ...testSuite, id: Date.now().toString() }
    const suites = await loadTestSuites()
    const updated = [...suites, newSuite]
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_suites', JSON.stringify(updated))
    }
    return newSuite.id
  }

  try {
    const docRef = await addDoc(collection(db, 'testSuites'), testSuite)
    return docRef.id
  } catch (error) {
    console.error('Error saving test suite to Firebase:', error)
    throw error
  }
}

export const deleteTestSuite = async (suiteId: string): Promise<void> => {
  if (!isFirebaseConfigured() || !db) {
    const suites = await loadTestSuites()
    const updated = suites.filter(s => s.id !== suiteId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_suites', JSON.stringify(updated))
    }
    return
  }

  try {
    await deleteDoc(doc(db, 'testSuites', suiteId))
  } catch (error) {
    console.error('Error deleting test suite from Firebase:', error)
    throw error
  }
}

export const subscribeToTestSuites = (projectId: string, callback: (suites: TestSuite[]) => void): Unsubscribe | null => {
  if (!isFirebaseConfigured() || !db) return null

  try {
    const q = query(collection(db, 'testSuites'), where('projectId', '==', projectId))
    return onSnapshot(q, (snapshot) => {
      const suites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TestSuite))
      callback(suites)
    })
  } catch (error) {
    console.error('Error subscribing to test suites:', error)
    return null
  }
}

// ============================================
// TEST CASES (Firebase or Local Storage)
// ============================================
export const loadTestCases = async (): Promise<TestCase[]> => {
  if (!isFirebaseConfigured() || !db) {
    // Fallback to local storage
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('qa_test_cases')
    return data ? JSON.parse(data) : []
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'testCases'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestCase))
  } catch (error) {
    console.error('Error loading test cases from Firebase:', error)
    return []
  }
}

export const loadTestCasesByProject = async (projectId: string): Promise<TestCase[]> => {
  if (!isFirebaseConfigured() || !db) {
    // Fallback to local storage
    const allTestCases = await loadTestCases()
    return allTestCases.filter(tc => tc.projectId === projectId)
  }

  try {
    const q = query(collection(db, 'testCases'), where('projectId', '==', projectId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestCase))
  } catch (error) {
    console.error('Error loading test cases by project from Firebase:', error)
    return []
  }
}

export const loadTestCasesBySuite = async (suiteId: string): Promise<TestCase[]> => {
  if (!isFirebaseConfigured() || !db) {
    const allTestCases = await loadTestCases()
    return allTestCases.filter(tc => tc.suiteId === suiteId)
  }

  try {
    const q = query(collection(db, 'testCases'), where('suiteId', '==', suiteId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestCase))
  } catch (error) {
    console.error('Error loading test cases by suite from Firebase:', error)
    return []
  }
}

export const saveTestCase = async (testCase: Omit<TestCase, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured() || !db) {
    // Fallback to local storage
    const newTestCase = { ...testCase, id: Date.now().toString() }
    const testCases = await loadTestCases()
    const updated = [...testCases, newTestCase]
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_cases', JSON.stringify(updated))
    }
    return newTestCase.id
  }

  try {
    const docRef = await addDoc(collection(db, 'testCases'), testCase)
    return docRef.id
  } catch (error) {
    console.error('Error saving test case to Firebase:', error)
    throw error
  }
}

export const updateTestCase = async (testCaseId: string, data: Partial<TestCase>): Promise<void> => {
  if (!isFirebaseConfigured() || !db) {
    // Fallback to local storage
    const testCases = await loadTestCases()
    const updated = testCases.map(tc => 
      tc.id === testCaseId ? { ...tc, ...data, updatedAt: new Date().toISOString() } : tc
    )
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_cases', JSON.stringify(updated))
    }
    return
  }

  try {
    await updateDoc(doc(db, 'testCases', testCaseId), {
      ...data,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating test case in Firebase:', error)
    throw error
  }
}

export const deleteTestCase = async (testCaseId: string): Promise<void> => {
  if (!isFirebaseConfigured() || !db) {
    // Fallback to local storage
    const testCases = await loadTestCases()
    const updated = testCases.filter(tc => tc.id !== testCaseId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_cases', JSON.stringify(updated))
    }
    return
  }

  try {
    await deleteDoc(doc(db, 'testCases', testCaseId))
  } catch (error) {
    console.error('Error deleting test case from Firebase:', error)
    throw error
  }
}

export const subscribeToTestCases = (projectId: string, callback: (testCases: TestCase[]) => void): Unsubscribe | null => {
  if (!isFirebaseConfigured() || !db) return null

  try {
    const q = query(collection(db, 'testCases'), where('projectId', '==', projectId))
    return onSnapshot(q, (snapshot) => {
      const testCases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TestCase))
      callback(testCases)
    })
  } catch (error) {
    console.error('Error subscribing to test cases:', error)
    return null
  }
}

export const subscribeToTestCasesBySuite = (suiteId: string, callback: (testCases: TestCase[]) => void): Unsubscribe | null => {
  if (!isFirebaseConfigured() || !db) return null

  try {
    const q = query(collection(db, 'testCases'), where('suiteId', '==', suiteId))
    return onSnapshot(q, (snapshot) => {
      const testCases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TestCase))
      callback(testCases)
    })
  } catch (error) {
    console.error('Error subscribing to test cases by suite:', error)
    return null
  }
}
