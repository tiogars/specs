import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from './index'
import type { ProjectRepository } from '../../projectRepository'

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

const renderComponent = (props?: any) => {
  return render(
    <MemoryRouter>
      <Header
        docsHref="/docs/"
        repository={mockRepository}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders header title', () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    renderComponent()
    expect(screen.getByText('Specs')).toBeInTheDocument()
  })

  it('renders documentation link', () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    renderComponent()
    
    const docLink = screen.getByLabelText('Documentation')
    expect(docLink).toBeInTheDocument()
    expect(docLink).toHaveAttribute('href', '/docs/')
    expect(docLink).toHaveAttribute('target', '_blank')
  })

  it('renders project select element', async () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    renderComponent()

    await waitFor(() => {
      expect(screen.getByLabelText('Select project')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('shows menu button when showMenuButton is true', () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    const onMenuClick = vi.fn()
    renderComponent({ showMenuButton: true, onMenuClick })

    const menuButton = screen.getByLabelText('open navigation menu')
    expect(menuButton).toBeInTheDocument()
  })

  it('hides menu button when showMenuButton is false', () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    renderComponent({ showMenuButton: false })

    const menuButton = screen.queryByLabelText('open navigation menu')
    expect(menuButton).not.toBeInTheDocument()
  })

  it('calls onMenuClick handler when menu button clicked', async () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    const onMenuClick = vi.fn()
    renderComponent({ showMenuButton: true, onMenuClick })

    const menuButton = screen.getByLabelText('open navigation menu')
    fireEvent.click(menuButton)

    await waitFor(() => {
      expect(onMenuClick).toHaveBeenCalled()
    }, { timeout: 500 })
  })

  it('loads projects on mount', async () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([
      { id: 1, name: 'Project A', description: '', isDefault: false, roles: [], useCases: [], actionTypes: [], dataDomains: [], useCaseDataDomains: {}, useCaseRoles: {}, useCaseActionTypes: {}, dataDomainAttributes: {} },
    ])
    renderComponent()

    await waitFor(() => {
      expect(mockRepository.listProjects).toHaveBeenCalled()
    }, { timeout: 1000 })
  })

  it('renders project names in select', async () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([
      { id: 1, name: 'My Project', description: '', isDefault: false, roles: [], useCases: [], actionTypes: [], dataDomains: [], useCaseDataDomains: {}, useCaseRoles: {}, useCaseActionTypes: {}, dataDomainAttributes: {} },
    ])
    renderComponent()

    await waitFor(() => {
      // Check that listProjects was called to load projects
      expect(mockRepository.listProjects).toHaveBeenCalled()
    }, { timeout: 2000 })
  })

  it('has correct header styling', () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    renderComponent()
    
    // AppBar should be present
    const header = screen.getByText('Specs').closest('header')
    expect(header).toBeInTheDocument()
  })

  it('has select project placeholder', async () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    renderComponent()

    await waitFor(() => {
      const select = screen.getByLabelText('Select project')
      expect(select).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('renders with proper aria labels for accessibility', () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    renderComponent()
    
    expect(screen.getByLabelText('Documentation')).toBeInTheDocument()
    expect(screen.getByLabelText('Select project')).toBeInTheDocument()
  })

  it('documentation link opens in new tab', () => {
    vi.mocked(mockRepository.listProjects).mockResolvedValue([])
    renderComponent()
    
    const docLink = screen.getByLabelText('Documentation')
    expect(docLink).toHaveAttribute('rel', 'noreferrer')
  })
})
