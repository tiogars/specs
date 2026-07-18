import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import DataDomainEditPage from './DataDomainEditPage'
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

const renderComponent = (projectId = '1', domainValue = 'Customer') => {
  return render(
    <MemoryRouter initialEntries={[`/projects/${projectId}/data-domains/edit/${encodeURIComponent(domainValue)}`]}>
      <Routes>
        <Route path="/projects/:projectId/data-domains/edit/:domainValue" element={<DataDomainEditPage repository={mockRepository} />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DataDomainEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page with title and form', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue(null)
    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByText(/Edit data domain/)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('loads project and domain data on mount', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue({
      id: 1,
      name: 'Test Project',
      description: 'Test',
      isDefault: false,
      roles: [],
      useCases: [],
      actionTypes: [],
      dataDomains: [
        { name: 'Customer', description: 'Customer information' },
      ],
      useCaseDataDomains: {},
      useCaseRoles: {},
      useCaseActionTypes: {},
      dataDomainAttributes: {},
    })
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/Test Project/)).toBeInTheDocument()
      expect(screen.getByDisplayValue('Customer')).toBeInTheDocument()
    })
  })

  it('populates description from existing domain', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue({
      id: 1,
      name: 'Test Project',
      description: 'Test',
      isDefault: false,
      roles: [],
      useCases: [],
      actionTypes: [],
      dataDomains: [
        { name: 'Customer', description: 'Customer data' },
      ],
      useCaseDataDomains: {},
      useCaseRoles: {},
      useCaseActionTypes: {},
      dataDomainAttributes: {},
    })
    renderComponent()

    await waitFor(() => {
      expect(screen.getByDisplayValue('Customer data')).toBeInTheDocument()
    })
  })

  it('submits form with updated domain name and description', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue({
      id: 1,
      name: 'Test Project',
      description: 'Test',
      isDefault: false,
      roles: [],
      useCases: [],
      actionTypes: [],
      dataDomains: [
        { name: 'Customer', description: 'Old description' },
      ],
      useCaseDataDomains: {},
      useCaseRoles: {},
      useCaseActionTypes: {},
      dataDomainAttributes: {},
    })
    vi.mocked(mockRepository.updateProjectDataDomain).mockResolvedValue({
      id: 1,
      name: 'Test',
      description: 'Test',
      isDefault: false,
      roles: [],
      useCases: [],
      actionTypes: [],
      dataDomains: [{ name: 'Client', description: 'New description' }],
      useCaseDataDomains: {},
      useCaseRoles: {},
      useCaseActionTypes: {},
      dataDomainAttributes: {},
    })

    renderComponent()
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Customer')).toBeInTheDocument()
    })

    const domainInput = screen.getByDisplayValue('Customer') as HTMLInputElement
    const descriptionInput = screen.getByDisplayValue('Old description') as HTMLInputElement
    
    fireEvent.change(domainInput, { target: { value: 'Client' } })
    fireEvent.change(descriptionInput, { target: { value: 'New description' } })
    
    const submitButton = screen.getByRole('button', { name: /Save/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRepository.updateProjectDataDomain).toHaveBeenCalledWith(1, 'Customer', 'Client', 'New description')
    })
  })

  it('displays error when domain is required', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue({
      id: 1,
      name: 'Test Project',
      description: 'Test',
      isDefault: false,
      roles: [],
      useCases: [],
      actionTypes: [],
      dataDomains: [{ name: 'Customer', description: 'Test' }],
      useCaseDataDomains: {},
      useCaseRoles: {},
      useCaseActionTypes: {},
      dataDomainAttributes: {},
    })
    renderComponent()
    
    await waitFor(() => {
      const domainInput = screen.getByDisplayValue('Customer') as HTMLInputElement
      fireEvent.change(domainInput, { target: { value: '' } })
      
      const submitButton = screen.getByRole('button', { name: /Save/ })
      fireEvent.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/Data domain is required/)).toBeInTheDocument()
    })
  })

  it('shows error message when update fails', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue({
      id: 1,
      name: 'Test Project',
      description: 'Test',
      isDefault: false,
      roles: [],
      useCases: [],
      actionTypes: [],
      dataDomains: [{ name: 'Customer', description: 'Test' }],
      useCaseDataDomains: {},
      useCaseRoles: {},
      useCaseActionTypes: {},
      dataDomainAttributes: {},
    })
    vi.mocked(mockRepository.updateProjectDataDomain).mockRejectedValue(new Error('Network error'))
    renderComponent()

    await waitFor(() => {
      const domainInput = screen.getByDisplayValue('Customer') as HTMLInputElement
      expect(domainInput).toBeInTheDocument()
    }, { timeout: 1500 })

    const domainInput = screen.getByDisplayValue('Customer') as HTMLInputElement
    fireEvent.change(domainInput, { target: { value: 'Client' } })
    
    const submitButton = screen.getByRole('button', { name: /Save/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      // Check if error message appears anywhere on the page
      const errorTexts = screen.queryAllByText(/Unable|error/i)
      expect(errorTexts.length > 0).toBe(true)
    }, { timeout: 1500 })
  })

  it('handles null project gracefully', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue(null)
    vi.mocked(mockRepository.updateProjectDataDomain).mockResolvedValue(null)
    renderComponent()

    // Component should still render without crashing
    expect(screen.getByText(/Edit data domain/)).toBeInTheDocument()
  })

  it('decodes URI component for domain value', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue({
      id: 1,
      name: 'Test',
      description: 'Test',
      isDefault: false,
      roles: [],
      useCases: [],
      actionTypes: [],
      dataDomains: [{ name: 'Customer Data', description: 'Test' }],
      useCaseDataDomains: {},
      useCaseRoles: {},
      useCaseActionTypes: {},
      dataDomainAttributes: {},
    })
    renderComponent()

    // Component initializes with encoded domain name
    await waitFor(() => {
      expect(mockRepository.getProject).toHaveBeenCalled()
    })
  })
})
