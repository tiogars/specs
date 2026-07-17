import JSZip from 'jszip'
import type { DataDomain, DataDomainAttribute, Project } from './projectRepository'

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
  const rolesList = project.roles.map((role) => toMarkdownListItem(role.name)).join('\n')
  const useCasesList = project.useCases.map((useCase) => toMarkdownListItem(useCase.name)).join('\n')
  const dataDomainsList = project.dataDomains.map((d) => toMarkdownListItem(d.name)).join('\n')
  const descriptionLines = project.description ? [project.description, ''] : []

  return [
    `# ${project.name}`,
    '',
    ...descriptionLines,
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

function buildRoleDoc(role: { name: string; description: string }): string {
  const lines: string[] = [`# ${role.name}`, '']
  if (role.description) {
    lines.push(role.description, '')
  }
  return lines.join('\n')
}

function buildUseCaseDoc(useCase: { name: string; description: string }, dataDomains: string[]): string {
  const lines: string[] = [`# ${useCase.name}`, '']
  if (useCase.description) {
    lines.push(useCase.description, '')
  }
  const listBody =
    dataDomains.length > 0 ? dataDomains.map(toMarkdownListItem).join('\n') : '_No related data domains defined._'
  lines.push('## Related Data Domains', '', listBody, '')
  return lines.join('\n')
}

function buildDataDomainDoc(domain: DataDomain, attributes: DataDomainAttribute[]): string {
  const lines: string[] = [`# ${domain.name}`, '']
  if (domain.description) {
    lines.push(domain.description, '')
  }
  const listBody =
    attributes.length > 0 ? attributes.map((a) => toMarkdownListItem(a.name)).join('\n') : '_No attributes defined._'
  lines.push('## Attributes', '', listBody, '')
  return lines.join('\n')
}

export async function generateProjectDocZip(project: Project): Promise<ArrayBuffer> {
  const projectSlug = toSlug(project.name) || 'project'
  const zip = new JSZip()

  zip.file(`${projectSlug}/README.md`, buildReadme(project))

  project.roles.forEach((role, index) => {
    const slug = toSlug(role.name) || `role-${index + 1}`
    zip.file(`${projectSlug}/roles/${slug}/index.md`, buildRoleDoc(role))
  })

  project.useCases.forEach((useCase, index) => {
    const slug = toSlug(useCase.name) || `use-case-${index + 1}`
    const relatedDomains = project.useCaseDataDomains[useCase.name] ?? []
    zip.file(`${projectSlug}/use-cases/${slug}/index.md`, buildUseCaseDoc(useCase, relatedDomains))
  })

  project.dataDomains.forEach((domain, domainIndex) => {
    const slug = toSlug(domain.name) || `data-domain-${domainIndex + 1}`
    const attributes = project.dataDomainAttributes[domain.name] ?? []
    zip.file(`${projectSlug}/data-domains/${slug}/index.md`, buildDataDomainDoc(domain, attributes))
  })

  return zip.generateAsync({ type: 'arraybuffer' })
}
