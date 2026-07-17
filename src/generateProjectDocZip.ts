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

function escapeMarkdownTableCell(value: string): string {
  return value.replace(/\|/g, '\\|')
}

function withFallback(value: string, fallback: string): string {
  const trimmed = value.trim()
  return trimmed || fallback
}

function toYamlSingleQuoted(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

type MkdocsConfigOptions = {
  siteName?: string
  siteDescription?: string
  siteUrl?: string
  repoUrl?: string
}

export function buildMkdocsConfig(project: Project, options: MkdocsConfigOptions = {}): string {
  const siteName = withFallback(options.siteName ?? `${withFallback(project.name, 'Project')} Documentation`, 'Project Documentation')
  const siteDescription = withFallback(
    options.siteDescription ?? project.description,
    'Documentation generated from the web app workflow.',
  )
  const lines: string[] = [
    `site_name: ${toYamlSingleQuoted(siteName)}`,
    `site_description: ${toYamlSingleQuoted(siteDescription)}`,
  ]

  if (options.siteUrl) {
    lines.push(`site_url: ${options.siteUrl}`)
  }

  if (options.repoUrl) {
    lines.push(`repo_url: ${options.repoUrl}`)
  }

  lines.push(
    '',
    'theme:',
    '  name: material',
    '',
    'nav:',
    '  - Home: index.md',
  )

  if (project.roles.length > 0) {
    lines.push('  - Roles:')
    for (const role of project.roles) {
      lines.push(`      - ${toYamlSingleQuoted(role.name)}: roles/${toSlug(role.name) || 'role'}/index.md`)
    }
  }

  if (project.useCases.length > 0) {
    lines.push('  - Use Cases:')
    for (const useCase of project.useCases) {
      lines.push(`      - ${toYamlSingleQuoted(useCase.name)}: use-cases/${toSlug(useCase.name) || 'use-case'}/index.md`)
    }
  }

  if (project.dataDomains.length > 0) {
    lines.push('  - Data Domains:')
    for (const domain of project.dataDomains) {
      lines.push(`      - ${toYamlSingleQuoted(domain.name)}: data-domains/${toSlug(domain.name) || 'data-domain'}/index.md`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

function buildAcceptanceCriteria(useCaseName: string): string[] {
  const normalized = useCaseName.trim().toLowerCase()

  if (normalized.includes('download documentation')) {
    return [
      'The generated ZIP downloads successfully from the project detail page.',
      'The archive includes root index.md and section folders for roles, use cases, and data domains.',
      'Generated markdown files contain valid relative links across related entities.',
    ]
  }

  if (normalized.includes('offline') || normalized.includes('pwa')) {
    return [
      'The application can be installed as a PWA in a supported browser.',
      'Core navigation and previously saved project data remain available without network access.',
      'Returning online does not corrupt locally persisted data.',
    ]
  }

  if (normalized.includes('deploy')) {
    return [
      'The deployment workflow completes without errors.',
      'Both web app and MkDocs output are accessible on the configured Pages domain.',
      'The published version metadata reflects the current build number and commit SHA.',
    ]
  }

  if (normalized.includes('delete') || normalized.includes('remove')) {
    return [
      'A confirmation step prevents accidental deletion.',
      'The deleted entity is removed from listings and related references.',
      'No orphaned links or stale associations remain after deletion.',
    ]
  }

  if (normalized.includes('edit') || normalized.includes('update') || normalized.includes('rename')) {
    return [
      'The target entity can be updated with validated input.',
      'Existing references continue to resolve to the updated entity.',
      'Updated values are persisted and visible after reload.',
    ]
  }

  if (normalized.includes('view') || normalized.includes('browse') || normalized.includes('saved')) {
    return [
      'The user can open the relevant listing or detail page from navigation.',
      'Displayed details match persisted data.',
      'Empty states are clear and actionable when no records exist.',
    ]
  }

  if (normalized.includes('add') || normalized.includes('link') || normalized.includes('assign')) {
    return [
      'The user can create or link the target entity with valid input.',
      'Duplicate additions are prevented or safely ignored.',
      'The new relationship appears in both source and related views.',
    ]
  }

  if (normalized.includes('create')) {
    return [
      'A new entity can be created with required fields only.',
      'The created entity appears immediately in listings and detail views.',
      'Persisted data remains available after page refresh.',
    ]
  }

  return [
    'The actor can complete the full flow without ambiguity.',
    'The expected data changes are captured in the related data domains.',
    'Error and empty-state behavior are documented when applicable.',
  ]
}

function buildReadme(project: Project): string {
  const rolesList = project.roles
    .map((role) => toMarkdownListItem(`[${role.name}](roles/${toSlug(role.name) || 'role'}/): ${withFallback(role.description, 'No description.')}`))
    .join('\n')
  const useCasesList = project.useCases
    .map(
      (useCase) =>
        toMarkdownListItem(
          `[${useCase.name}](use-cases/${toSlug(useCase.name) || 'use-case'}/): ${withFallback(useCase.description, 'No description.')}`,
        ),
    )
    .join('\n')
  const dataDomainsList = project.dataDomains
    .map(
      (domain) =>
        toMarkdownListItem(
          `[${domain.name}](data-domains/${toSlug(domain.name) || 'data-domain'}/): ${withFallback(domain.description, 'No description.')}`,
        ),
    )
    .join('\n')
  const descriptionLines = project.description ? [project.description, ''] : []

  return [
    `# ${project.name}`,
    '',
    ...descriptionLines,
    '## Overview',
    '',
    `- Roles: ${project.roles.length}`,
    `- Use Cases: ${project.useCases.length}`,
    `- Data Domains: ${project.dataDomains.length}`,
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

function buildRoleDoc(role: { name: string; description: string }): string {
  const lines: string[] = [
    `# ${role.name}`,
    '',
    '## Summary',
    '',
    withFallback(role.description, 'No description provided.'),
    '',
    '## Responsibilities',
    '',
    '- Define this role contribution to each relevant use case.',
    '- Keep role permissions and expectations explicit and testable.',
    '',
  ]
  return lines.join('\n')
}

function buildUseCaseDoc(useCase: { name: string; description: string }, dataDomains: DataDomain[]): string {
  const lines: string[] = [
    `# ${useCase.name}`,
    '',
    '## Goal',
    '',
    withFallback(useCase.description, 'No description provided.'),
    '',
  ]

  const listBody =
    dataDomains.length > 0
      ? dataDomains
          .map(
            (domain) =>
              toMarkdownListItem(
                `[${domain.name}](../../data-domains/${toSlug(domain.name) || 'data-domain'}/): ${withFallback(domain.description, 'No description.')}`,
              ),
          )
          .join('\n')
      : '_No related data domains defined._'
  lines.push('## Related Data Domains', '', listBody, '')
  const acceptanceCriteria = buildAcceptanceCriteria(useCase.name)
  lines.push(
    '## Suggested Acceptance Criteria',
    '',
    ...acceptanceCriteria.map(toMarkdownListItem),
    '',
  )
  return lines.join('\n')
}

function buildDataDomainDoc(domain: DataDomain, attributes: DataDomainAttribute[], relatedUseCases: { name: string }[]): string {
  const lines: string[] = [
    `# ${domain.name}`,
    '',
    '## Purpose',
    '',
    withFallback(domain.description, 'No description provided.'),
    '',
  ]

  if (attributes.length === 0) {
    lines.push('## Attributes', '', '_No attributes defined._', '')
  } else {
    const attributeRows = attributes.map(
      (attribute) =>
        `| ${escapeMarkdownTableCell(attribute.name)} | ${escapeMarkdownTableCell(withFallback(attribute.description, 'No description.'))} |`,
    )
    lines.push('## Attributes', '', '| Attribute | Description |', '| --- | --- |', ...attributeRows, '')
  }

  const relatedUseCaseList =
    relatedUseCases.length > 0
      ? relatedUseCases
          .map((useCase) => toMarkdownListItem(`[${useCase.name}](../../use-cases/${toSlug(useCase.name) || 'use-case'}/)`))
          .join('\n')
      : '_No related use cases defined._'

  lines.push('## Related Use Cases', '', relatedUseCaseList, '')
  return lines.join('\n')
}

export async function generateProjectDocZip(project: Project): Promise<ArrayBuffer> {
  const projectSlug = toSlug(project.name) || 'project'
  const zip = new JSZip()

  zip.file(`${projectSlug}/index.md`, buildReadme(project))
  zip.file(`${projectSlug}/mkdocs.yml`, buildMkdocsConfig(project))

  project.roles.forEach((role, index) => {
    const slug = toSlug(role.name) || `role-${index + 1}`
    zip.file(`${projectSlug}/roles/${slug}/index.md`, buildRoleDoc(role))
  })

  project.useCases.forEach((useCase, index) => {
    const slug = toSlug(useCase.name) || `use-case-${index + 1}`
    const relatedDomainNames = project.useCaseDataDomains[useCase.name] ?? []
    const relatedDomains = relatedDomainNames.map((domainName) => {
      const knownDomain = project.dataDomains.find((domain) => domain.name === domainName)
      return knownDomain ?? { name: domainName, description: '' }
    })
    zip.file(`${projectSlug}/use-cases/${slug}/index.md`, buildUseCaseDoc(useCase, relatedDomains))
  })

  project.dataDomains.forEach((domain, domainIndex) => {
    const slug = toSlug(domain.name) || `data-domain-${domainIndex + 1}`
    const attributes = project.dataDomainAttributes[domain.name] ?? []
    const relatedUseCases = project.useCases.filter((useCase) => {
      const linkedDomains = project.useCaseDataDomains[useCase.name] ?? []
      return linkedDomains.includes(domain.name)
    })
    zip.file(`${projectSlug}/data-domains/${slug}/index.md`, buildDataDomainDoc(domain, attributes, relatedUseCases))
  })

  return zip.generateAsync({ type: 'arraybuffer' })
}
