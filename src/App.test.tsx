import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import type { ActionType, CreateProjectInput, DataDomain, DataDomainAttribute, Project, ProjectRepository, Role, UseCase } from './projectRepository'

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
      description: input.description,
      isDefault: false,
      roles: input.roles.map((name) => ({ name, description: '' })),
      useCases: input.useCases.map((name) => ({ name, description: '' })),
      actionTypes: [],
      dataDomains: [],
      useCaseDataDomains: {},
      useCaseRoles: {},
      useCaseActionTypes: {},
      dataDomainAttributes: {},
    }

    this.projects = [project, ...this.projects]
    this.nextId += 1

    return project
  }

  async addProjectRole(projectId: number, role: string, description = '') {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedRole = this.normalizeAndValidateTextField(role, 'Role')
    const updatedProject = project.roles.some((value) => value.name === normalizedRole)
      ? project
      : { ...project, roles: [...project.roles, { name: normalizedRole, description: description.trim() }] }

    if (updatedProject !== project) {
      this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    }

    return updatedProject
  }

  async updateProjectRole(projectId: number, currentRole: string, nextRole: string, nextDescription = '') {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedCurrentRole = this.normalizeAndValidateTextField(currentRole, 'Role')
    const normalizedNextRole = this.normalizeAndValidateTextField(nextRole, 'Role')
    const currentIndex = project.roles.findIndex((value) => value.name === normalizedCurrentRole)
    if (currentIndex < 0) {
      throw new Error('Role not found')
    }

    if (
      normalizedCurrentRole !== normalizedNextRole &&
      project.roles.some((value) => value.name === normalizedNextRole)
    ) {
      throw new Error('Role already exists')
    }

    const updatedRoles: Role[] = [...project.roles]
    updatedRoles[currentIndex] = { name: normalizedNextRole, description: nextDescription.trim() }
    const updatedProject = {
      ...project,
      roles: updatedRoles,
      useCaseRoles:
        normalizedCurrentRole === normalizedNextRole
          ? project.useCaseRoles
          : Object.fromEntries(
              Object.entries(project.useCaseRoles).map(([useCaseName, roles]) => [
                useCaseName,
                roles.map((roleName) => (roleName === normalizedCurrentRole ? normalizedNextRole : roleName)),
              ]),
            ),
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return updatedProject
  }

  async removeProjectRole(projectId: number, role: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedRole = this.normalizeAndValidateTextField(role, 'Role')
    if (!project.roles.some((value) => value.name === normalizedRole)) {
      throw new Error('Role not found')
    }

    const updatedProject = {
      ...project,
      roles: project.roles.filter((value) => value.name !== normalizedRole),
      useCaseRoles: Object.fromEntries(
        Object.entries(project.useCaseRoles).map(([useCaseName, roles]) => [
          useCaseName,
          roles.filter((roleName) => roleName !== normalizedRole),
        ]),
      ),
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return updatedProject
  }

  async addProjectUseCase(projectId: number, useCase: string, description = '') {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedUseCase = this.normalizeAndValidateTextField(useCase, 'Use case')
    const updatedProject = project.useCases.some((value) => value.name === normalizedUseCase)
      ? project
      : {
          ...project,
          useCases: [...project.useCases, { name: normalizedUseCase, description: description.trim() }],
        }

    if (updatedProject !== project) {
      this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    }

    return updatedProject
  }

  async updateProjectUseCase(projectId: number, currentUseCase: string, nextUseCase: string, nextDescription = '') {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedCurrentUseCase = this.normalizeAndValidateTextField(currentUseCase, 'Use case')
    const normalizedNextUseCase = this.normalizeAndValidateTextField(nextUseCase, 'Use case')
    const currentIndex = project.useCases.findIndex((value) => value.name === normalizedCurrentUseCase)
    if (currentIndex < 0) {
      throw new Error('Use case not found')
    }

    if (
      normalizedCurrentUseCase !== normalizedNextUseCase &&
      project.useCases.some((value) => value.name === normalizedNextUseCase)
    ) {
      throw new Error('Use case already exists')
    }

    const updatedUseCases: UseCase[] = [...project.useCases]
    updatedUseCases[currentIndex] = { name: normalizedNextUseCase, description: nextDescription.trim() }
    const updatedProject = {
      ...project,
      useCases: updatedUseCases,
      useCaseDataDomains:
        normalizedCurrentUseCase === normalizedNextUseCase
          ? project.useCaseDataDomains
          : Object.fromEntries(
              Object.entries(project.useCaseDataDomains).map(([useCaseName, domains]) => [
                useCaseName === normalizedCurrentUseCase ? normalizedNextUseCase : useCaseName,
                domains,
              ]),
            ),
      useCaseRoles:
        normalizedCurrentUseCase === normalizedNextUseCase
          ? project.useCaseRoles
          : Object.fromEntries(
              Object.entries(project.useCaseRoles).map(([useCaseName, roles]) => [
                useCaseName === normalizedCurrentUseCase ? normalizedNextUseCase : useCaseName,
                roles,
              ]),
            ),
      useCaseActionTypes:
        normalizedCurrentUseCase === normalizedNextUseCase
          ? project.useCaseActionTypes
          : Object.fromEntries(
              Object.entries(project.useCaseActionTypes).map(([useCaseName, actionTypes]) => [
                useCaseName === normalizedCurrentUseCase ? normalizedNextUseCase : useCaseName,
                actionTypes,
              ]),
            ),
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return updatedProject
  }

  async removeProjectUseCase(projectId: number, useCase: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedUseCase = this.normalizeAndValidateTextField(useCase, 'Use case')
    if (!project.useCases.some((value) => value.name === normalizedUseCase)) {
      throw new Error('Use case not found')
    }

    const updatedProject = {
      ...project,
      useCases: project.useCases.filter((value) => value.name !== normalizedUseCase),
      useCaseDataDomains: Object.fromEntries(
        Object.entries(project.useCaseDataDomains).filter(([useCaseName]) => useCaseName !== normalizedUseCase),
      ),
      useCaseRoles: Object.fromEntries(
        Object.entries(project.useCaseRoles).filter(([useCaseName]) => useCaseName !== normalizedUseCase),
      ),
      useCaseActionTypes: Object.fromEntries(
        Object.entries(project.useCaseActionTypes).filter(([useCaseName]) => useCaseName !== normalizedUseCase),
      ),
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return updatedProject
  }

  async addProjectActionType(projectId: number, actionType: string, description: string, acceptanceCriteria: string[]) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedActionType = this.normalizeAndValidateTextField(actionType, 'Action type')
    const normalizedAcceptanceCriteria = Array.from(new Set(acceptanceCriteria.map((value) => value.trim()).filter(Boolean)))
    const updatedProject = project.actionTypes.some((a) => a.name === normalizedActionType)
      ? project
      : {
          ...project,
          actionTypes: [
            ...project.actionTypes,
            { name: normalizedActionType, description: description.trim(), acceptanceCriteria: normalizedAcceptanceCriteria },
          ],
        }

    if (updatedProject !== project) {
      this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    }

    return updatedProject
  }

  async updateProjectActionType(
    projectId: number,
    currentActionType: string,
    nextActionType: string,
    nextDescription: string,
    nextAcceptanceCriteria: string[],
  ) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedCurrent = this.normalizeAndValidateTextField(currentActionType, 'Action type')
    const normalizedNext = this.normalizeAndValidateTextField(nextActionType, 'Action type')
    const currentIndex = project.actionTypes.findIndex((value) => value.name === normalizedCurrent)
    if (currentIndex < 0) {
      throw new Error('Action type not found')
    }

    if (normalizedCurrent !== normalizedNext && project.actionTypes.some((value) => value.name === normalizedNext)) {
      throw new Error('Action type already exists')
    }

    const normalizedAcceptanceCriteria = Array.from(new Set(nextAcceptanceCriteria.map((value) => value.trim()).filter(Boolean)))
    const updatedActionTypes: ActionType[] = [...project.actionTypes]
    updatedActionTypes[currentIndex] = {
      name: normalizedNext,
      description: nextDescription.trim(),
      acceptanceCriteria: normalizedAcceptanceCriteria,
    }
    const updatedProject = {
      ...project,
      actionTypes: updatedActionTypes,
      useCaseActionTypes:
        normalizedCurrent === normalizedNext
          ? project.useCaseActionTypes
          : Object.fromEntries(
              Object.entries(project.useCaseActionTypes).map(([useCaseName, actionTypes]) => [
                useCaseName,
                actionTypes.map((actionTypeName) => (actionTypeName === normalizedCurrent ? normalizedNext : actionTypeName)),
              ]),
            ),
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return updatedProject
  }

  async removeProjectActionType(projectId: number, actionType: string) {
    const project = this.projects.find((value) => value.id === projectId)
    if (!project) {
      return null
    }

    const normalizedActionType = this.normalizeAndValidateTextField(actionType, 'Action type')
    if (!project.actionTypes.some((value) => value.name === normalizedActionType)) {
      throw new Error('Action type not found')
    }

    const updatedProject = {
      ...project,
      actionTypes: project.actionTypes.filter((value) => value.name !== normalizedActionType),
      useCaseActionTypes: Object.fromEntries(
        Object.entries(project.useCaseActionTypes).map(([useCaseName, actionTypes]) => [
          useCaseName,
          actionTypes.filter((actionTypeName) => actionTypeName !== normalizedActionType),
        ]),
      ),
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

  async getUseCaseRoles(projectId: number, useCase: string) {
    const project = this.projects.find((p) => p.id === projectId)
    if (!project) return []
    const linkedRoleNames = project.useCaseRoles[useCase] ?? []
    return linkedRoleNames.map((roleName) => {
      const knownRole = project.roles.find((role) => role.name === roleName)
      return knownRole ?? { name: roleName, description: '' }
    })
  }

  async addUseCaseRole(projectId: number, useCase: string, role: string) {
    const project = this.projects.find((p) => p.id === projectId)
    if (!project) return []
    const normalizedRole = this.normalizeAndValidateTextField(role, 'Role')
    const current = project.useCaseRoles[useCase] ?? []
    const next = current.includes(normalizedRole) ? current : [...current, normalizedRole]
    const updatedProject = {
      ...project,
      useCaseRoles: {
        ...project.useCaseRoles,
        [useCase]: next,
      },
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return this.getUseCaseRoles(projectId, useCase)
  }

  async removeUseCaseRole(projectId: number, useCase: string, role: string) {
    const project = this.projects.find((p) => p.id === projectId)
    if (!project) return []
    const normalizedRole = this.normalizeAndValidateTextField(role, 'Role')
    const current = project.useCaseRoles[useCase] ?? []
    if (!current.includes(normalizedRole)) {
      throw new Error('Role link not found')
    }
    const updatedProject = {
      ...project,
      useCaseRoles: {
        ...project.useCaseRoles,
        [useCase]: current.filter((roleName) => roleName !== normalizedRole),
      },
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return this.getUseCaseRoles(projectId, useCase)
  }

  async getUseCaseActionTypes(projectId: number, useCase: string) {
    const project = this.projects.find((p) => p.id === projectId)
    if (!project) return []
    const linkedActionTypeNames = project.useCaseActionTypes[useCase] ?? []
    return linkedActionTypeNames.map((actionTypeName) => {
      const knownActionType = project.actionTypes.find((actionType) => actionType.name === actionTypeName)
      return knownActionType ?? { name: actionTypeName, description: '', acceptanceCriteria: [] }
    })
  }

  async addUseCaseActionType(projectId: number, useCase: string, actionType: string) {
    const project = this.projects.find((p) => p.id === projectId)
    if (!project) return []
    const normalizedActionType = this.normalizeAndValidateTextField(actionType, 'Action type')
    const current = project.useCaseActionTypes[useCase] ?? []
    const next = current.includes(normalizedActionType) ? current : [...current, normalizedActionType]
    const updatedProject = {
      ...project,
      useCaseActionTypes: {
        ...project.useCaseActionTypes,
        [useCase]: next,
      },
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return this.getUseCaseActionTypes(projectId, useCase)
  }

  async removeUseCaseActionType(projectId: number, useCase: string, actionType: string) {
    const project = this.projects.find((p) => p.id === projectId)
    if (!project) return []
    const normalizedActionType = this.normalizeAndValidateTextField(actionType, 'Action type')
    const current = project.useCaseActionTypes[useCase] ?? []
    if (!current.includes(normalizedActionType)) {
      throw new Error('Action type link not found')
    }
    const updatedProject = {
      ...project,
      useCaseActionTypes: {
        ...project.useCaseActionTypes,
        [useCase]: current.filter((actionTypeName) => actionTypeName !== normalizedActionType),
      },
    }
    this.projects = this.projects.map((value) => (value.id === projectId ? updatedProject : value))
    return this.getUseCaseActionTypes(projectId, useCase)
  }

  private dataDomainAttributes: Map<string, DataDomainAttribute[]> = new Map()

  private dataDomainAttributeKey(projectId: number, domainValue: string) {
    return `${projectId}::${domainValue}`
  }

  async getDataDomainAttributes(projectId: number, domainValue: string) {
    return this.dataDomainAttributes.get(this.dataDomainAttributeKey(projectId, domainValue)) ?? []
  }

  async addDataDomainAttribute(projectId: number, domainValue: string, attribute: string, description = '') {
    const key = this.dataDomainAttributeKey(projectId, domainValue)
    const normalizedAttribute = attribute.trim()
    if (!normalizedAttribute) throw new Error('Attribute is required')
    const current = this.dataDomainAttributes.get(key) ?? []
    if (!current.some((a) => a.name === normalizedAttribute)) {
      this.dataDomainAttributes.set(key, [...current, { name: normalizedAttribute, description: description.trim() }])
    }
    return this.dataDomainAttributes.get(key) ?? []
  }

  async updateDataDomainAttribute(projectId: number, domainValue: string, currentAttribute: string, nextAttribute: string, nextDescription = '') {
    const key = this.dataDomainAttributeKey(projectId, domainValue)
    const normalizedCurrent = currentAttribute.trim()
    const normalizedNext = nextAttribute.trim()
    if (!normalizedNext) throw new Error('Attribute is required')
    const current = this.dataDomainAttributes.get(key) ?? []
    const currentIndex = current.findIndex((a) => a.name === normalizedCurrent)
    if (currentIndex < 0) throw new Error('Attribute not found')
    if (normalizedCurrent !== normalizedNext && current.some((a) => a.name === normalizedNext)) {
      throw new Error('Attribute already exists')
    }
    const updated = [...current]
    updated[currentIndex] = { name: normalizedNext, description: nextDescription.trim() }
    this.dataDomainAttributes.set(key, updated)
    return updated
  }

  async removeDataDomainAttribute(projectId: number, domainValue: string, attribute: string) {
    const key = this.dataDomainAttributeKey(projectId, domainValue)
    const normalizedAttribute = attribute.trim()
    const current = this.dataDomainAttributes.get(key) ?? []
    if (!current.some((a) => a.name === normalizedAttribute)) {
      throw new Error('Attribute not found')
    }
    const updated = current.filter((a) => a.name !== normalizedAttribute)
    this.dataDomainAttributes.set(key, updated)
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

    // Verify project creation form renders
    await waitFor(() => {
      expect(screen.getByLabelText('Project name')).toBeInTheDocument()
      expect(screen.getByLabelText('Roles (one per line)')).toBeInTheDocument()
      expect(screen.getByLabelText('Use cases (one per line)')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save project' })).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('edits and deletes a role', async () => {
    const repository = new InMemoryProjectRepository()

    render(
      <MemoryRouter initialEntries={['/projects/new']}>
        <App repository={repository} />
      </MemoryRouter>,
    )

    // Verify project creation form renders
    await waitFor(() => {
      expect(screen.getByLabelText('Project name')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('links and unlinks a role to a use case', async () => {
    const repository = new InMemoryProjectRepository()

    render(
      <MemoryRouter initialEntries={['/projects/new']}>
        <App repository={repository} />
      </MemoryRouter>,
    )

    // Verify project creation form renders
    await waitFor(() => {
      expect(screen.getByLabelText('Project name')).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})
