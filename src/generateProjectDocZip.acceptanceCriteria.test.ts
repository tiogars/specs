import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { generateProjectDocZip, toSlug } from './generateProjectDocZip'
import type { Project } from './projectRepository'

const baseProject: Project = {
  id: 1,
  name: 'Intent Test Project',
  description: '',
  isDefault: false,
  roles: [],
  useCases: [],
  dataDomains: [{ name: 'Project', description: 'Project data.' }],
  useCaseDataDomains: {},
  useCaseRoles: {},
  dataDomainAttributes: {},
}

async function readZipFiles(zip: ArrayBuffer): Promise<Record<string, string>> {
  const loaded = await JSZip.loadAsync(zip)
  const result: Record<string, string> = {}
  for (const [path, file] of Object.entries(loaded.files)) {
    if (!file.dir) {
      result[path] = await file.async('text')
    }
  }
  return result
}

async function generateUseCaseDoc(useCaseName: string): Promise<string> {
  const project: Project = {
    ...baseProject,
    useCases: [{ name: useCaseName, description: 'Use case description.' }],
    useCaseDataDomains: { [useCaseName]: ['Project'] },
  }
  const zip = await generateProjectDocZip(project)
  const files = await readZipFiles(zip)
  const useCaseSlug = toSlug(useCaseName) || 'use-case-1'
  return files[`intent-test-project/use-cases/${useCaseSlug}/index.md`]
}

describe('generateProjectDocZip acceptance criteria routing', () => {
  it('uses create criteria for create use cases', async () => {
    const doc = await generateUseCaseDoc('Create a project')
    expect(doc).toContain('- A new entity can be created with required fields only.')
  })

  it('uses add or link criteria for add or link use cases', async () => {
    const doc = await generateUseCaseDoc('Add a role to a project')
    expect(doc).toContain('- The user can create or link the target entity with valid input.')
  })

  it('uses edit criteria for edit use cases', async () => {
    const doc = await generateUseCaseDoc('Edit a role in a project')
    expect(doc).toContain('- The target entity can be updated with validated input.')
  })

  it('uses delete criteria for delete use cases', async () => {
    const doc = await generateUseCaseDoc('Delete a role from a project')
    expect(doc).toContain('- A confirmation step prevents accidental deletion.')
  })

  it('uses view criteria for browse or view use cases', async () => {
    const doc = await generateUseCaseDoc('View saved projects')
    expect(doc).toContain('- The user can open the relevant listing or detail page from navigation.')
  })

  it('uses deploy criteria for deployment use cases', async () => {
    const doc = await generateUseCaseDoc('Deploy app to GitHub Pages')
    expect(doc).toContain('- The deployment workflow completes without errors.')
  })

  it('uses offline criteria for pwa use cases', async () => {
    const doc = await generateUseCaseDoc('Use the app offline (PWA)')
    expect(doc).toContain('- The application can be installed as a PWA in a supported browser.')
  })

  it('uses download criteria for documentation export use cases', async () => {
    const doc = await generateUseCaseDoc('Download documentation as ZIP')
    expect(doc).toContain('- The archive includes root index.md and section folders for roles, use cases, and data domains.')
  })

  it('uses default generic criteria when no category matches', async () => {
    const doc = await generateUseCaseDoc('Coordinate stakeholder workshop')
    expect(doc).toContain('- The actor can complete the full flow without ambiguity.')
  })
})
