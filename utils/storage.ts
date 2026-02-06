import { User, Project, TestSuite, TestCase, TestRun, TestRunResult } from '@/types'
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
      username: 'Comitqa',
      password: 'Comitqa123',
      name: 'Comit Team'
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
    const filtered = allTestCases.filter(tc => tc.suiteId === suiteId)

    // Migration: Add order field if missing
    const withOrder = filtered.map((tc, index) => ({
      ...tc,
      order: tc.order !== undefined ? tc.order : index
    }))

    // Save migrated data back to storage if any changes were made
    if (filtered.some(tc => tc.order === undefined)) {
      const allCases = await loadTestCases()
      const updated = allCases.map(tc => {
        const migrated = withOrder.find(w => w.id === tc.id)
        return migrated || tc
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem('qa_test_cases', JSON.stringify(updated))
      }
    }

    return withOrder
  }

  try {
    const q = query(collection(db, 'testCases'), where('suiteId', '==', suiteId))
    const querySnapshot = await getDocs(q)
    const testCases = querySnapshot.docs.map((doc, index) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        order: data.order !== undefined ? data.order : index
      } as TestCase
    })

    // Migration: Update Firebase documents that don't have order field
    const needsUpdate = querySnapshot.docs.filter(doc => doc.data().order === undefined)
    if (needsUpdate.length > 0) {
      await Promise.all(
        needsUpdate.map((doc, index) =>
          updateDoc(doc.ref, { order: index })
        )
      )
    }

    return testCases
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

// Batch update test case orders
export const updateTestCaseOrders = async (updates: { id: string; order: number }[]): Promise<void> => {
  if (!isFirebaseConfigured() || !db) {
    // Fallback to local storage
    const testCases = await loadTestCases()
    const updated = testCases.map(tc => {
      const update = updates.find(u => u.id === tc.id)
      return update ? { ...tc, order: update.order, updatedAt: new Date().toISOString() } : tc
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_cases', JSON.stringify(updated))
    }
    return
  }

  try {
    // Update all test cases in Firebase
    if (!db) throw new Error('Firestore not initialized')

    await Promise.all(
      updates.map(({ id, order }) =>
        updateDoc(doc(db!, 'testCases', id), {
          order,
          updatedAt: new Date().toISOString()
        })
      )
    )
  } catch (error) {
    console.error('Error updating test case orders in Firebase:', error)
    throw error
  }
}

// ============================================
// TEST RUNS (Firebase or Local Storage)
// ============================================
export const loadTestRuns = async (): Promise<TestRun[]> => {
  if (!isFirebaseConfigured() || !db) {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('qa_test_runs')
    return data ? JSON.parse(data) : []
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'testRuns'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestRun))
  } catch (error) {
    console.error('Error loading test runs from Firebase:', error)
    return []
  }
}

export const loadTestRunsByProject = async (projectId: string): Promise<TestRun[]> => {
  if (!isFirebaseConfigured() || !db) {
    const allTestRuns = await loadTestRuns()
    return allTestRuns.filter(tr => tr.projectId === projectId)
  }

  try {
    const q = query(collection(db, 'testRuns'), where('projectId', '==', projectId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestRun))
  } catch (error) {
    console.error('Error loading test runs by project from Firebase:', error)
    return []
  }
}

export const saveTestRun = async (testRun: Omit<TestRun, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured() || !db) {
    const newTestRun = { ...testRun, id: Date.now().toString() }
    const testRuns = await loadTestRuns()
    const updated = [...testRuns, newTestRun]
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_runs', JSON.stringify(updated))
    }
    return newTestRun.id
  }

  try {
    const docRef = await addDoc(collection(db, 'testRuns'), testRun)
    return docRef.id
  } catch (error) {
    console.error('Error saving test run to Firebase:', error)
    throw error
  }
}

export const updateTestRun = async (testRunId: string, data: Partial<TestRun>): Promise<void> => {
  if (!isFirebaseConfigured() || !db) {
    const testRuns = await loadTestRuns()
    const updated = testRuns.map(tr =>
      tr.id === testRunId ? { ...tr, ...data, updatedAt: new Date().toISOString() } : tr
    )
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_runs', JSON.stringify(updated))
    }
    return
  }

  try {
    await updateDoc(doc(db!, 'testRuns', testRunId), {
      ...data,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating test run in Firebase:', error)
    throw error
  }
}

export const deleteTestRun = async (testRunId: string): Promise<void> => {
  if (!isFirebaseConfigured() || !db) {
    const testRuns = await loadTestRuns()
    const updated = testRuns.filter(tr => tr.id !== testRunId)
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_runs', JSON.stringify(updated))
    }
    return
  }

  try {
    await deleteDoc(doc(db, 'testRuns', testRunId))
  } catch (error) {
    console.error('Error deleting test run from Firebase:', error)
    throw error
  }
}

export const subscribeToTestRuns = (projectId: string, callback: (testRuns: TestRun[]) => void): Unsubscribe | null => {
  if (!isFirebaseConfigured() || !db) return null

  try {
    const q = query(collection(db, 'testRuns'), where('projectId', '==', projectId))
    return onSnapshot(q, (snapshot) => {
      const testRuns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TestRun))
      callback(testRuns)
    })
  } catch (error) {
    console.error('Error subscribing to test runs:', error)
    return null
  }
}

// ============================================
// TEST RUN RESULTS (Firebase or Local Storage)
// ============================================
export const loadTestRunResults = async (): Promise<TestRunResult[]> => {
  if (!isFirebaseConfigured() || !db) {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem('qa_test_run_results')
    return data ? JSON.parse(data) : []
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'testRunResults'))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestRunResult))
  } catch (error) {
    console.error('Error loading test run results from Firebase:', error)
    return []
  }
}

export const loadTestRunResultsByTestRun = async (testRunId: string): Promise<TestRunResult[]> => {
  if (!isFirebaseConfigured() || !db) {
    const allResults = await loadTestRunResults()
    return allResults.filter(r => r.testRunId === testRunId)
  }

  try {
    const q = query(collection(db, 'testRunResults'), where('testRunId', '==', testRunId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TestRunResult))
  } catch (error: any) {
    console.error('❌ Error loading test run results from Firebase:', error)
    console.error('Error code:', error?.code)
    console.warn('⚠️ Falling back to localStorage for loading')
    
    // Fallback to localStorage if Firebase fails
    const allResults = await loadTestRunResults()
    return allResults.filter(r => r.testRunId === testRunId)
  }
}

export const saveTestRunResult = async (result: Omit<TestRunResult, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured() || !db) {
    const newResult = { ...result, id: Date.now().toString() }
    const results = await loadTestRunResults()
    const updated = [...results, newResult]
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_run_results', JSON.stringify(updated))
    }
    return newResult.id
  }

  try {
    // Remove undefined fields for Firebase
    const cleanResult: any = {}
    Object.keys(result).forEach(key => {
      const value = (result as any)[key]
      if (value !== undefined) {
        cleanResult[key] = value
      }
    })
    
    console.log('🔥 Attempting to save to Firebase:', cleanResult)
    const docRef = await addDoc(collection(db, 'testRunResults'), cleanResult)
    console.log('✅ Saved to Firebase with ID:', docRef.id)
    return docRef.id
  } catch (error: any) {
    console.error('❌ Error saving test run result to Firebase:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
    
    // Fallback to localStorage if Firebase fails
    console.warn('⚠️ Falling back to localStorage')
    const newResult = { ...result, id: Date.now().toString() }
    const results = await loadTestRunResults()
    const updated = [...results, newResult]
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_run_results', JSON.stringify(updated))
    }
    return newResult.id
  }
}

export const updateTestRunResult = async (resultId: string, data: Partial<TestRunResult>): Promise<void> => {
  if (!isFirebaseConfigured() || !db) {
    const results = await loadTestRunResults()
    const updated = results.map(r =>
      r.id === resultId ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
    )
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_run_results', JSON.stringify(updated))
    }
    return
  }

  try {
    // Remove undefined fields for Firebase
    const cleanData: any = { updatedAt: new Date().toISOString() }
    Object.keys(data).forEach(key => {
      const value = (data as any)[key]
      if (value !== undefined) {
        cleanData[key] = value
      }
    })
    
    console.log('🔥 Attempting to update Firebase document:', resultId, cleanData)
    await updateDoc(doc(db!, 'testRunResults', resultId), cleanData)
    console.log('✅ Firebase document updated')
  } catch (error: any) {
    console.error('❌ Error updating test run result in Firebase:', error)
    console.error('Error code:', error?.code)
    console.error('Error message:', error?.message)
    
    // Fallback to localStorage if Firebase fails
    console.warn('⚠️ Falling back to localStorage for update')
    const results = await loadTestRunResults()
    const updated = results.map(r =>
      r.id === resultId ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
    )
    if (typeof window !== 'undefined') {
      localStorage.setItem('qa_test_run_results', JSON.stringify(updated))
    }
  }
}

export const upsertTestRunResult = async (testRunId: string, testCaseId: string, data: Partial<TestRunResult>): Promise<void> => {
  console.log('💾 upsertTestRunResult called:', { testRunId, testCaseId, status: data.status })
  
  // Check if result already exists
  const results = await loadTestRunResultsByTestRun(testRunId)
  const existing = results.find(r => r.testCaseId === testCaseId)

  if (existing) {
    console.log('📝 Updating existing result:', existing.id)
    await updateTestRunResult(existing.id, data)
  } else {
    console.log('➕ Creating new result')
    const newResult: any = {
      testRunId,
      testCaseId,
      status: data.status || 'not_run',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Only add optional fields if they have values
    if (data.comment) newResult.comment = data.comment
    if (data.bugId) newResult.bugId = data.bugId
    if (data.executedAt) newResult.executedAt = data.executedAt
    if (data.executedBy) newResult.executedBy = data.executedBy
    
    await saveTestRunResult(newResult)
  }
  
  console.log('✅ upsertTestRunResult completed')
}

export const subscribeToTestRunResults = (testRunId: string, callback: (results: TestRunResult[]) => void): Unsubscribe | null => {
  if (!isFirebaseConfigured() || !db) return null

  try {
    const q = query(collection(db, 'testRunResults'), where('testRunId', '==', testRunId))
    return onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TestRunResult))
      callback(results)
    })
  } catch (error) {
    console.error('Error subscribing to test run results:', error)
    return null
  }
}
