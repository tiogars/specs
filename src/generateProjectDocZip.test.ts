import JSZip from 'jszip'
import { describe, expect, it } from 'vitest'
import { generateProjectDocZip } from './generateProjectDocZip'
import type { Project } from './projectRepository'

const baseProject: Project = {
  id: 1,
  name: 'My Project',
  description: 'My project description',
  isDefault: false,
  roles: [
    { name: 'Admin', description: 'Can administer the system.' },
    { name: 'End User', description: '' },
  ],
  useCases: [
    { name: 'Create invoice', description: 'Allows invoice creation.' },
    { name: 'Export report', description: '' },
  ],
  dataDomains: [],
  useCaseDataDomains: {},
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

describe('generateProjectDocZip', () => {
  it('returns a valid ZIP containing the expected files', async () => {
    const zip = await generateProjectDocZip(baseProject)
    const files = await readZipFiles(zip)

    expect(Object.keys(files).sort()).toEqual([
      'my-project/README.md',
      'my-project/roles/admin/index.md',
      'my-project/roles/end-user/index.md',
      'my-project/use-cases/create-invoice/index.md',
      'my-project/use-cases/export-report/index.md',
    ])
  })

  it('README.md lists roles, use cases, and data domains', async () => {
    const zip = await generateProjectDocZip(baseProject)
    const files = await readZipFiles(zip)
    const readme = files['my-project/README.md']

    expect(readme).toContain('# My Project')
    expect(readme).toContain('My project description')
    expect(readme).toContain('## Roles')
    expect(readme).toContain('- Admin')
    expect(readme).toContain('- End User')
    expect(readme).toContain('## Use Cases')
    expect(readme).toContain('- Create invoice')
    expect(readme).toContain('- Export report')
    expect(readme).toContain('## Data Domains')
    expect(readme).toContain('_No data domains defined._')
  })

  it('role file contains a heading with the role name and description', async () => {
    const zip = await generateProjectDocZip(baseProject)
    const files = await readZipFiles(zip)
    const adminDoc = files['my-project/roles/admin/index.md']

    expect(adminDoc).toContain('# Admin')
    expect(adminDoc).toContain('Can administer the system.')
  })

  it('use case file contains a heading with the use case name and description', async () => {
    const zip = await generateProjectDocZip(baseProject)
    const files = await readZipFiles(zip)
    const useCaseDoc = files['my-project/use-cases/create-invoice/index.md']

    expect(useCaseDoc).toContain('# Create invoice')
    expect(useCaseDoc).toContain('Allows invoice creation.')
  })

  it('handles a project with no roles or use cases', async () => {
    const project: Project = { ...baseProject, roles: [], useCases: [] }
    const zip = await generateProjectDocZip(project)
    const files = await readZipFiles(zip)

    expect(Object.keys(files)).toEqual(['my-project/README.md'])

    const readme = files['my-project/README.md']
    expect(readme).toContain('_No roles defined._')
    expect(readme).toContain('_No use cases defined._')
  })

  it('uses project name as the root folder slug', async () => {
    const project: Project = { ...baseProject, name: 'Billing & Payments' }
    const zip = await generateProjectDocZip(project)
    const files = await readZipFiles(zip)

    expect(Object.keys(files)).toContain('billing-payments/README.md')
  })

  it('generates data domain files in data-domains/ folder', async () => {
    const project: Project = {
      ...baseProject,
      dataDomains: [
        { name: 'Billing', description: 'Handles all billing related data.' },
        { name: 'User Profile', description: '' },
      ],
    }
    const zip = await generateProjectDocZip(project)
    const files = await readZipFiles(zip)

    expect(files['my-project/data-domains/billing/index.md']).toBeDefined()
    expect(files['my-project/data-domains/user-profile/index.md']).toBeDefined()
  })

  it('data domain file starts with heading then description', async () => {
    const project: Project = {
      ...baseProject,
      dataDomains: [{ name: 'Billing', description: 'Handles all billing related data.' }],
    }
    const zip = await generateProjectDocZip(project)
    const files = await readZipFiles(zip)
    const doc = files['my-project/data-domains/billing/index.md']

    expect(doc).toContain('# Billing')
    expect(doc).toContain('Handles all billing related data.')
    expect(doc.indexOf('# Billing')).toBeLessThan(doc.indexOf('Handles all billing related data.'))
  })

  it('data domain file without description contains heading and empty attributes', async () => {
    const project: Project = {
      ...baseProject,
      dataDomains: [{ name: 'Inventory', description: '' }],
    }
    const zip = await generateProjectDocZip(project)
    const files = await readZipFiles(zip)
    const doc = files['my-project/data-domains/inventory/index.md']

    expect(doc).toContain('# Inventory')
    expect(doc).toContain('## Attributes')
    expect(doc).toContain('_No attributes defined._')
  })

  it('README.md lists data domain names', async () => {
    const project: Project = {
      ...baseProject,
      dataDomains: [
        { name: 'Billing', description: 'Billing description.' },
        { name: 'Inventory', description: '' },
      ],
    }
    const zip = await generateProjectDocZip(project)
    const files = await readZipFiles(zip)
    const readme = files['my-project/README.md']

    expect(readme).toContain('- Billing')
    expect(readme).toContain('- Inventory')
  })

  it('use case file includes Related Data Domains section with linked domain names', async () => {
    const project: Project = {
      ...baseProject,
      useCaseDataDomains: { 'Create invoice': ['Billing', 'User Profile'] },
    }
    const zip = await generateProjectDocZip(project)
    const files = await readZipFiles(zip)
    const doc = files['my-project/use-cases/create-invoice/index.md']

    expect(doc).toContain('## Related Data Domains')
    expect(doc).toContain('- Billing')
    expect(doc).toContain('- User Profile')
  })

  it('use case file shows empty placeholder when no related data domains', async () => {
    const zip = await generateProjectDocZip(baseProject)
    const files = await readZipFiles(zip)
    const doc = files['my-project/use-cases/create-invoice/index.md']

    expect(doc).toContain('## Related Data Domains')
    expect(doc).toContain('_No related data domains defined._')
  })

  it('data domain file includes Attributes section with attribute names', async () => {
    const project: Project = {
      ...baseProject,
      dataDomains: [{ name: 'Billing', description: 'Billing description.' }],
      dataDomainAttributes: {
        Billing: [
          { name: 'invoice_id', description: '' },
          { name: 'amount', description: 'Total amount.' },
        ],
      },
    }
    const zip = await generateProjectDocZip(project)
    const files = await readZipFiles(zip)
    const doc = files['my-project/data-domains/billing/index.md']

    expect(doc).toContain('## Attributes')
    expect(doc).toContain('- invoice_id')
    expect(doc).toContain('- amount')
  })
})
