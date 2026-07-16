import JSZip from 'jszip'
import type { DataDomain, Project } from './projectRepository'

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}

function toMarkdownListItem(value: string): string {
  return `- ${value}`
}

function buildReadme(project: Project): string {
  const rolesList = project.roles.map(toMarkdownListItem).join('\n')
  const useCasesList = project.useCases.map(toMarkdownListItem).join('\n')
  const dataDomainsList = project.dataDomains.map((d) => toMarkdownListItem(d.name)).join('\n')

  return [
    `# ${project.name}`,
    '',
    '## Roles',
    '',
    rolesList || '_No roles defined._',
    '',
    '## Use Cases',
    '',
    useCasesList || '_No use cases defined._',
    '',
    '## Data Domains',
    '',
    dataDomainsList || '_No data domains defined._',
    '',
  ].join('\n')
}

function buildRoleDoc(role: string): string {
  return [`# ${role}`, ''].join('\n')
}

function buildUseCaseDoc(useCase: string): string {
  return [`# ${useCase}`, ''].join('\n')
}

function buildDataDomainDoc(domain: DataDomain): string {
  const lines: string[] = [`# ${domain.name}`, '']
  if (domain.description) {
    lines.push(domain.description, '')
  }
  return lines.join('\n')
}

export async function generateProjectDocZip(project: Project): Promise<ArrayBuffer> {
  const projectSlug = toSlug(project.name) || 'project'
  const zip = new JSZip()

  zip.file(`${projectSlug}/README.md`, buildReadme(project))

  project.roles.forEach((role, index) => {
    const slug = toSlug(role) || `role-${index + 1}`
    zip.file(`${projectSlug}/roles/${slug}.md`, buildRoleDoc(role))
  })

  project.useCases.forEach((useCase, index) => {
    const slug = toSlug(useCase) || `use-case-${index + 1}`
    zip.file(`${projectSlug}/use-cases/${slug}.md`, buildUseCaseDoc(useCase))
  })

  project.dataDomains.forEach((domain, index) => {
    const slug = toSlug(domain.name) || `data-domain-${index + 1}`
    zip.file(`${projectSlug}/data-domains/${slug}.md`, buildDataDomainDoc(domain))
  })

  return zip.generateAsync({ type: 'arraybuffer' })
}
