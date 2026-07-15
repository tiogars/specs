import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import type { CreateProjectInput, Project, ProjectRepository } from './projectRepository'

class InMemoryProjectRepository implements ProjectRepository {
  private projects: Project[] = []
  private nextId = 1

  private normalizeAndValidateTextField(value: string, fieldLabel: string) {
    const normalizedValue = value.trim()
    if (!normalizedValue) {
      throw new Error(`${fieldLabel} is required`)
    }

    if (normalizedValue.length > 255) {
      throw new Error(`${fieldLabel} exceeds maximum length of 255 characters`)
    }

    return normalizedValue
  }

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

    const normalizedRole = this.normalizeAndValidateTextField(role, 'Role')
    const updatedProject = project.roles.includes(normalizedRole)
      ? project
      : { ...project, roles: [...project.roles, normalizedRole] }

    if (updatedProject !== project) {
      this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    }

    return updatedProject
  }

  async updateProjectRole(projectId: number, currentRole: string, nextRole: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedCurrentRole = this.normalizeAndValidateTextField(currentRole, 'Role')
    const normalizedNextRole = this.normalizeAndValidateTextField(nextRole, 'Role')
    const currentIndex = project.roles.findIndex((value) => value === normalizedCurrentRole)
    if (currentIndex < 0) {
      throw new Error('Role not found')
    }

    if (normalizedCurrentRole !== normalizedNextRole && project.roles.some((value) => value === normalizedNextRole)) {
      throw new Error('Role already exists')
    }

    const updatedRoles = [...project.roles]
    updatedRoles[currentIndex] = normalizedNextRole
    const updatedProject = { ...project, roles: updatedRoles }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return updatedProject
  }

  async removeProjectRole(projectId: number, role: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedRole = this.normalizeAndValidateTextField(role, 'Role')
    if (!project.roles.includes(normalizedRole)) {
      throw new Error('Role not found')
    }

    const updatedProject = {
      ...project,
      roles: project.roles.filter((value) => value !== normalizedRole),
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return updatedProject
  }

  async addProjectUseCase(projectId: number, useCase: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedUseCase = this.normalizeAndValidateTextField(useCase, 'Use case')
    const updatedProject = project.useCases.includes(normalizedUseCase)
      ? project
      : { ...project, useCases: [...project.useCases, normalizedUseCase] }

    if (updatedProject !== project) {
      this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    }

    return updatedProject
  }

  async updateProjectUseCase(projectId: number, currentUseCase: string, nextUseCase: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedCurrentUseCase = this.normalizeAndValidateTextField(currentUseCase, 'Use case')
    const normalizedNextUseCase = this.normalizeAndValidateTextField(nextUseCase, 'Use case')
    const currentIndex = project.useCases.findIndex((value) => value === normalizedCurrentUseCase)
    if (currentIndex < 0) {
      throw new Error('Use case not found')
    }

    if (
      normalizedCurrentUseCase !== normalizedNextUseCase &&
      project.useCases.some((value) => value === normalizedNextUseCase)
    ) {
      throw new Error('Use case already exists')
    }

    const updatedUseCases = [...project.useCases]
    updatedUseCases[currentIndex] = normalizedNextUseCase
    const updatedProject = { ...project, useCases: updatedUseCases }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return updatedProject
  }

  async removeProjectUseCase(projectId: number, useCase: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedUseCase = this.normalizeAndValidateTextField(useCase, 'Use case')
    if (!project.useCases.includes(normalizedUseCase)) {
      throw new Error('Use case not found')
    }

    const updatedProject = {
      ...project,
      useCases: project.useCases.filter((value) => value !== normalizedUseCase),
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return updatedProject
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
    fireEvent.change(screen.getByLabelText('New role'), { target: { value: ' Manager ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add role' }))
    fireEvent.change(screen.getByLabelText('New use case'), { target: { value: 'Approve payment' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add use case' }))
    fireEvent.change(screen.getByLabelText('New use case'), { target: { value: ' Approve payment ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add use case' }))

    await waitFor(() => {
      expect(screen.getByText('Manager')).toBeInTheDocument()
      expect(screen.getByText('Approve payment')).toBeInTheDocument()
      expect(screen.getAllByText('Manager')).toHaveLength(1)
      expect(screen.getAllByText('Approve payment')).toHaveLength(1)
    })

    const approvePaymentListItem = screen.getByText('Approve payment').closest('li')
    if (!approvePaymentListItem) {
      throw new Error('Approve payment list item not found')
    }

    fireEvent.click(within(approvePaymentListItem).getByRole('button', { name: 'Edit use case: Approve payment' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Edit use case' }), { target: { value: 'Approve refund' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Approve refund')).toBeInTheDocument()
      expect(screen.queryByText('Approve payment')).not.toBeInTheDocument()
    })

    const approveRefundListItem = screen.getByText('Approve refund').closest('li')
    if (!approveRefundListItem) {
      throw new Error('Approve refund list item not found')
    }

    fireEvent.click(within(approveRefundListItem).getByRole('button', { name: 'Delete use case: Approve refund' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete use case' }))

    await waitFor(() => {
      expect(screen.queryByText('Approve refund')).not.toBeInTheDocument()
    })
  })

  it('edits and deletes a role', async () => {
    const repository = new InMemoryProjectRepository()

    render(
      <MemoryRouter initialEntries={['/']}>
        <App repository={repository} />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'Billing' } })
    fireEvent.change(screen.getByLabelText('Roles (one per line)'), { target: { value: 'Admin' } })
    fireEvent.change(screen.getByLabelText('Use cases (one per line)'), { target: { value: 'Create invoice' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save project' }))

    const projectLink = await screen.findByRole('link', { name: 'Billing' })
    fireEvent.click(projectLink)

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })

    const adminListItem = screen.getByText('Admin').closest('li')
    if (!adminListItem) {
      throw new Error('Admin list item not found')
    }

    fireEvent.click(within(adminListItem).getByRole('button', { name: 'Edit role: Admin' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Edit role' }), { target: { value: 'Auditor' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Auditor')).toBeInTheDocument()
      expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    })

    const auditorListItem = screen.getByText('Auditor').closest('li')
    if (!auditorListItem) {
      throw new Error('Auditor list item not found')
    }

    fireEvent.click(within(auditorListItem).getByRole('button', { name: 'Delete role: Auditor' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete role' }))

    await waitFor(() => {
      expect(screen.queryByText('Auditor')).not.toBeInTheDocument()
    })
  })
})
