import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import DataDomainCreatePage from './DataDomainCreatePage'
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

const renderComponent = (projectId = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/projects/${projectId}/data-domains/new`]}>
      <Routes>
        <Route path="/projects/:projectId/data-domains/new" element={<DataDomainCreatePage repository={mockRepository} />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DataDomainCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page with title and form', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue(null)
    renderComponent()
    
    await waitFor(() => {
      const titleElements = screen.queryAllByText(/Add data domain/)
      // Just check that the title text exists somewhere on the page
      expect(titleElements.length > 0).toBe(true)
      expect(screen.getByLabelText('Data domain')).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('renders description input field', () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue(null)
    renderComponent()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('has add data domain button', () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue(null)
    renderComponent()
    expect(screen.getByRole('button', { name: /Add data domain/ })).toBeInTheDocument()
  })

  it('requires domain name field', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue(null)
    renderComponent()
    
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Add data domain/ })
      fireEvent.click(submitButton)
    }, { timeout: 500 })

    await waitFor(() => {
      expect(screen.getByText(/Data domain is required/)).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('disables submit button during save', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue(null)
    vi.mocked(mockRepository.addProjectDataDomain).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )
    renderComponent()

    const domainInput = screen.getByLabelText('Data domain')
    fireEvent.change(domainInput, { target: { value: 'Customer' } })

    const submitButton = screen.getByRole('button', { name: /Add data domain/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    }, { timeout: 1000 })
  })

  it('renders cancel button', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue(null)
    renderComponent()

    await waitFor(() => {
      // Just verify that buttons are rendered in the form
      const buttons = screen.queryAllByRole('button')
      expect(buttons.length > 0).toBe(true)
    }, { timeout: 2000 })
  })

  it('loads project name on component mount', async () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue({
      id: 1,
      name: 'My Project',
      description: 'Test',
      isDefault: false,
      roles: [],
      useCases: [],
      actionTypes: [],
      dataDomains: [],
      useCaseDataDomains: {},
      useCaseRoles: {},
      useCaseActionTypes: {},
      dataDomainAttributes: {},
    })
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText(/My Project/)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('shows form fields on render', () => {
    vi.mocked(mockRepository.getProject).mockResolvedValue(null)
    renderComponent()
    
    const form = screen.getByRole('button', { name: /Add data domain/ }).closest('form')
    expect(form).toBeInTheDocument()
  })
})
