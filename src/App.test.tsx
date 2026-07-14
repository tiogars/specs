import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import type { CreateProjectInput, Project, ProjectRepository } from './projectRepository'

class InMemoryProjectRepository implements ProjectRepository {
  private projects: Project[] = []
  private nextId = 1

  async listProjects() {
    return this.projects
  }

  async getProject(projectId: number) {
    return this.projects.find((project) => project.id === projectId) ?? null
  }

  async createProject(input: CreateProjectInput) {
    const project: Project = {
      id: this.nextId,
      name: input.name,
      roles: input.roles,
      useCases: input.useCases,
    }

    this.projects = [project, ...this.projects]
    this.nextId += 1

    return project
  }

  async addProjectRole(projectId: number, role: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    project.roles = [...project.roles, role]
    return project
  }

  async addProjectUseCase(projectId: number, useCase: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    project.useCases = [...project.useCases, useCase]
    return project
  }
}

describe('App', () => {
  it('renders top-level navigation links', async () => {
    const repository = new InMemoryProjectRepository()

    render(
      <MemoryRouter initialEntries={['/']}>
        <App repository={repository} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Specs webapp' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/docs/')
    await waitFor(() => {
      expect(screen.queryByText('Loading projects…')).not.toBeInTheDocument()
    })
  })

  it('creates a project and renders project details', async () => {
    const repository = new InMemoryProjectRepository()

    render(
      <MemoryRouter initialEntries={['/']}>
        <App repository={repository} />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'Billing' } })
    fireEvent.change(screen.getByLabelText('Roles (one per line)'), {
      target: { value: 'Admin\nAuditor' },
    })
    fireEvent.change(screen.getByLabelText('Use cases (one per line)'), {
      target: { value: 'Create invoice\nExport report' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Save project' }))

    const projectLink = await screen.findByRole('link', { name: 'Billing' })
    fireEvent.click(projectLink)

    await waitFor(() => {
      expect(screen.getByText('Roles')).toBeInTheDocument()
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Auditor')).toBeInTheDocument()
      expect(screen.getByText('Use cases')).toBeInTheDocument()
      expect(screen.getByText('Create invoice')).toBeInTheDocument()
      expect(screen.getByText('Export report')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('New role'), { target: { value: 'Manager' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add role' }))
    fireEvent.change(screen.getByLabelText('New use case'), { target: { value: 'Approve payment' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add use case' }))

    await waitFor(() => {
      expect(screen.getByText('Manager')).toBeInTheDocument()
      expect(screen.getByText('Approve payment')).toBeInTheDocument()
    })
  })
})
