import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import type { CreateProjectInput, DataDomain, Project, ProjectRepository } from './projectRepository'

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
      isDefault: false,
      roles: input.roles,
      useCases: input.useCases,
      dataDomains: [],
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

  async addProjectDataDomain(projectId: number, domain: string, description: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedDomain = this.normalizeAndValidateTextField(domain, 'Data domain')
    const updatedProject = project.dataDomains.some((d) => d.name === normalizedDomain)
      ? project
      : { ...project, dataDomains: [...project.dataDomains, { name: normalizedDomain, description: description.trim() }] }

    if (updatedProject !== project) {
      this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    }

    return updatedProject
  }

  async updateProjectDataDomain(projectId: number, currentDomain: string, nextDomain: string, nextDescription: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedCurrent = this.normalizeAndValidateTextField(currentDomain, 'Data domain')
    const normalizedNext = this.normalizeAndValidateTextField(nextDomain, 'Data domain')
    const currentIndex = project.dataDomains.findIndex((d) => d.name === normalizedCurrent)
    if (currentIndex < 0) {
      throw new Error('Data domain not found')
    }

    if (normalizedCurrent !== normalizedNext && project.dataDomains.some((d) => d.name === normalizedNext)) {
      throw new Error('Data domain already exists')
    }

    const updatedDomains: DataDomain[] = [...project.dataDomains]
    updatedDomains[currentIndex] = { name: normalizedNext, description: nextDescription.trim() }
    const updatedProject = { ...project, dataDomains: updatedDomains }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return updatedProject
  }

  async removeProjectDataDomain(projectId: number, domain: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedDomain = this.normalizeAndValidateTextField(domain, 'Data domain')
    if (!project.dataDomains.some((d) => d.name === normalizedDomain)) {
      throw new Error('Data domain not found')
    }

    const updatedProject = {
      ...project,
      dataDomains: project.dataDomains.filter((d) => d.name !== normalizedDomain),
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return updatedProject
  }

  private useCaseDomains: Map<string, DataDomain[]> = new Map()

  private useCaseDomainKey(projectId: number, useCase: string) {
    return `${projectId}::${useCase}`
  }

  async getUseCaseDataDomains(projectId: number, useCase: string) {
    return this.useCaseDomains.get(this.useCaseDomainKey(projectId, useCase)) ?? []
  }

  async addUseCaseDataDomain(projectId: number, useCase: string, domain: string) {
    const key = this.useCaseDomainKey(projectId, useCase)
    const current = this.useCaseDomains.get(key) ?? []
    if (!current.some((d) => d.name === domain)) {
      const project = this.projects.find((p) => p.id === projectId)
      const description = project?.dataDomains.find((d) => d.name === domain)?.description ?? ''
      this.useCaseDomains.set(key, [...current, { name: domain, description }])
    }
    return this.useCaseDomains.get(key) ?? []
  }

  async removeUseCaseDataDomain(projectId: number, useCase: string, domain: string) {
    const key = this.useCaseDomainKey(projectId, useCase)
    const current = this.useCaseDomains.get(key) ?? []
    if (!current.some((d) => d.name === domain)) {
      throw new Error('Data domain link not found')
    }
    const updated = current.filter((d) => d.name !== domain)
    this.useCaseDomains.set(key, updated)
    return updated
  }
}

describe('App', () => {
  it('renders drawer navigation links', async () => {
    const repository = new InMemoryProjectRepository()

    render(
      <MemoryRouter initialEntries={['/projects']}>
        <App repository={repository} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/projects')
    expect(screen.getByRole('link', { name: 'Create project' })).toHaveAttribute('href', '/projects/new')
    expect(screen.getByText(/Specs Builder — v\d+\.\d+\.\d+(?:\+\d+\.[0-9a-f]{7})?/)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('Loading projects…')).not.toBeInTheDocument()
    })
  })

  it('creates a project and navigates to project detail', async () => {
    const repository = new InMemoryProjectRepository()

    render(
      <MemoryRouter initialEntries={['/projects/new']}>
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

    // After save, redirected to project detail page
    await waitFor(() => {
      expect(screen.getByText('Billing')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Manage roles' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Manage use cases' })).toBeInTheDocument()
    })

    // Navigate to roles page
    fireEvent.click(screen.getByRole('link', { name: 'Manage roles' }))

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument()
      expect(screen.getByText('Auditor')).toBeInTheDocument()
    })

    // Add a new role via the Add role link
    fireEvent.click(screen.getAllByRole('link', { name: 'Add role' })[0])

    await waitFor(() => {
      expect(screen.getByLabelText('Role name')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Role name'), { target: { value: 'Manager' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add role' }))

    await waitFor(() => {
      expect(screen.getByText('Manager')).toBeInTheDocument()
    })

    // Navigate to use cases page via drawer
    const useCasesDrawerLink = screen.getByRole('link', { name: 'View use cases' })
    fireEvent.click(useCasesDrawerLink)

    await waitFor(() => {
      expect(screen.getByText('Create invoice')).toBeInTheDocument()
      expect(screen.getByText('Export report')).toBeInTheDocument()
    })

    // Add a use case
    fireEvent.click(screen.getAllByRole('link', { name: 'Add use case' })[0])

    await waitFor(() => {
      expect(screen.getByLabelText('Use case')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Use case'), { target: { value: 'Approve payment' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add use case' }))

    await waitFor(() => {
      expect(screen.getByText('Approve payment')).toBeInTheDocument()
    })

    // Edit the use case via the edit button (navigates to edit page)
    const approvePaymentListItem = screen.getByText('Approve payment').closest('li')
    if (!approvePaymentListItem) {
      throw new Error('Approve payment list item not found')
    }

    fireEvent.click(within(approvePaymentListItem).getByRole('button', { name: 'Edit use case: Approve payment' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Use case')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Use case'), { target: { value: 'Approve refund' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save use case' }))

    await waitFor(() => {
      expect(screen.getByText('Approve refund')).toBeInTheDocument()
      expect(screen.queryByText('Approve payment')).not.toBeInTheDocument()
    })

    // Delete the use case
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
      <MemoryRouter initialEntries={['/projects/new']}>
        <App repository={repository} />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'Billing' } })
    fireEvent.change(screen.getByLabelText('Roles (one per line)'), { target: { value: 'Admin' } })
    fireEvent.change(screen.getByLabelText('Use cases (one per line)'), { target: { value: 'Create invoice' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save project' }))

    // Navigate to roles page
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Manage roles' })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('link', { name: 'Manage roles' }))

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument()
    })

    // Edit via the edit button (navigates to edit page)
    const adminListItem = screen.getByText('Admin').closest('li')
    if (!adminListItem) {
      throw new Error('Admin list item not found')
    }

    fireEvent.click(within(adminListItem).getByRole('button', { name: 'Edit role: Admin' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Role name')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Role name'), { target: { value: 'Auditor' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save role' }))

    await waitFor(() => {
      expect(screen.getByText('Auditor')).toBeInTheDocument()
      expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    })

    // Delete the role
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
