import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './index'
import type { ProjectRepository } from '../projectRepository'

const mockRepository: ProjectRepository = {
  listProjects: vi.fn(),
  getProject: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  addProjectRole: vi.fn(),
  updateProjectRole: vi.fn(),
  removeProjectRole: vi.fn(),
  addProjectUseCase: vi.fn(),
  updateProjectUseCase: vi.fn(),
  removeProjectUseCase: vi.fn(),
  addProjectActionType: vi.fn(),
  updateProjectActionType: vi.fn(),
  removeProjectActionType: vi.fn(),
  addProjectDataDomain: vi.fn(),
  updateProjectDataDomain: vi.fn(),
  removeProjectDataDomain: vi.fn(),
  getUseCaseDataDomains: vi.fn(),
  addUseCaseDataDomain: vi.fn(),
  removeUseCaseDataDomain: vi.fn(),
  getUseCaseRoles: vi.fn(),
  addUseCaseRole: vi.fn(),
  removeUseCaseRole: vi.fn(),
  getUseCaseActionTypes: vi.fn(),
  addUseCaseActionType: vi.fn(),
  removeUseCaseActionType: vi.fn(),
  getDataDomainAttributes: vi.fn(),
  addDataDomainAttribute: vi.fn(),
  updateDataDomainAttribute: vi.fn(),
  removeDataDomainAttribute: vi.fn(),
}

const renderComponent = (repository?: ProjectRepository) => {
  return render(
    <MemoryRouter>
      <App repository={repository} />
    </MemoryRouter>,
  )
}

describe('App (basic rendering)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the app with header and main content', async () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    renderComponent(mockRepository)
    
    await waitFor(() => {
      const headerTitle = screen.queryAllByText('Specs').filter(el => el.tagName === 'H6')[0]
      expect(headerTitle).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('renders documentation link', async () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    renderComponent(mockRepository)

    await waitFor(() => {
      const docLink = screen.getByLabelText('Documentation')
      expect(docLink).toHaveAttribute('href', '/docs/')
    }, { timeout: 2000 })
  })

  it('calls listProjects on mount', async () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    renderComponent(mockRepository)

    await waitFor(() => {
      expect(mockRepository.listProjects).toHaveBeenCalled()
    }, { timeout: 2000 })
  })

  it('renders project selector when repository provided', async () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([
      { 
        id: 1, 
        name: 'Test Project', 
        description: 'Test', 
        isDefault: false, 
        roles: [], 
        useCases: [], 
        actionTypes: [],
        dataDomains: [], 
        useCaseDataDomains: {}, 
        useCaseRoles: {}, 
        useCaseActionTypes: {},
        dataDomainAttributes: {} 
      },
    ])
    renderComponent(mockRepository)

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('creates default repository if none provided', async () => {
    renderComponent(undefined)

    await waitFor(() => {
      const headerTitle = screen.queryAllByText('Specs').filter(el => el.tagName === 'H6')[0]
      expect(headerTitle).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})
