'use client'

import { useState, useEffect } from 'react'
import { User, Project } from '@/types'
import { LogOut, Plus, FolderOpen, User as UserIcon } from 'lucide-react'
import { loadProjects, saveProject, deleteProject, subscribeToProjects, canViewProject, canEditProject } from '@/utils/storage'
import ProjectView from './ProjectView'
import CreateProjectModal from './CreateProjectModal'

interface DashboardProps {
  user: User
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load initial projects
    loadProjects().then(data => {
      // Filter projects based on user access
      const filteredProjects = data.filter(project => canViewProject(user, project.name))
      setProjects(filteredProjects)
      setLoading(false)
    })

    // Subscribe to real-time updates
    const unsubscribe = subscribeToProjects((updatedProjects) => {
      // Filter projects based on user access
      const filteredProjects = updatedProjects.filter(project => canViewProject(user, project.name))
      setProjects(filteredProjects)
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [user])

  const handleCreateProject = async (name: string, description: string) => {
    const newProject: Omit<Project, 'id'> = {
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    try {
      const projectId = await saveProject(newProject)
      // If not using real-time updates (local storage), manually update
      if (!subscribeToProjects(() => {})) {
        setProjects([...projects, { ...newProject, id: projectId }])
      }
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId)
      // If not using real-time updates (local storage), manually update
      if (!subscribeToProjects(() => {})) {
        setProjects(projects.filter(p => p.id !== projectId))
      }
      if (selectedProject?.id === projectId) {
        setSelectedProject(null)
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }

  const handleBackToProjects = () => {
    setSelectedProject(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading w-32 h-32 rounded-full"></div>
      </div>
    )
  }

  if (selectedProject) {
    return (
      <ProjectView
        project={selectedProject}
        user={user}
        onBack={handleBackToProjects}
        onDelete={handleDeleteProject}
      />
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              QA Test Case Manager
            </h1>
            <p className="text-gray-400 text-lg">
              Welcome back, {user.name}!
            </p>
          </div>
          <div className="flex gap-3">
            {canEditProject(user) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Project
              </button>
            )}
            <button
              onClick={onLogout}
              className="btn-secondary flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="card mb-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <UserIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  user.role === 'admin' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : user.role === 'global_viewer'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                }`}>
                  {user.role === 'admin' ? 'QA Team' : user.role === 'global_viewer' ? 'Global Viewer' : 'Project Viewer'}
                </span>
              </div>
              <p className="text-gray-400">@{user.username}</p>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <FolderOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-3xl font-bold">Your Projects</h2>
            <span className="text-sm text-gray-500">({projects.length})</span>
          </div>

          {projects.length === 0 ? (
            <div className="card text-center py-16">
              <FolderOpen className="w-20 h-20 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-400">
                {canEditProject(user) ? 'No projects yet' : 'No projects available'}
              </h3>
              <p className="text-gray-500 mb-6">
                {canEditProject(user) 
                  ? 'Create your first project to start managing test cases'
                  : 'You do not have access to any projects at this time'}
              </p>
              {canEditProject(user) && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create First Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="card cursor-pointer hover:border-blue-500/50"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-1 truncate">{project.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Project Modal */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateProject}
          />
        )}
      </div>
    </main>
  )
}
