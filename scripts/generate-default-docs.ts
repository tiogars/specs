/**
 * Generates MkDocs-ready documentation files from the "specs (default)" project and writes them
 * to the /docs directory, replacing any existing content.
 *
 * Run with:  node --experimental-strip-types scripts/generate-default-docs.ts
 */

import JSZip from 'jszip'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateProjectDocZip, toSlug } from '../src/generateProjectDocZip.ts'
import {
  DEFAULT_PROJECT_DATA_DOMAINS,
  DEFAULT_PROJECT_DATA_DOMAIN_ATTRIBUTES,
  DEFAULT_PROJECT_NAME,
  DEFAULT_PROJECT_ROLES,
  DEFAULT_PROJECT_USE_CASES,
  DEFAULT_PROJECT_USE_CASE_DATA_DOMAINS,
} from '../src/projectRepository.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const docsDir = path.join(repoRoot, 'docs')

const defaultProject = {
  id: 1,
  name: DEFAULT_PROJECT_NAME,
  description: '',
  isDefault: true,
  roles: DEFAULT_PROJECT_ROLES,
  useCases: DEFAULT_PROJECT_USE_CASES,
  dataDomains: DEFAULT_PROJECT_DATA_DOMAINS,
}

const zipBuffer = await generateProjectDocZip(defaultProject)
const zip = await JSZip.loadAsync(zipBuffer)

fs.rmSync(docsDir, { recursive: true, force: true })
fs.mkdirSync(docsDir, { recursive: true })

for (const [zipPath, file] of Object.entries(zip.files)) {
  if (file.dir) continue

  // Strip the project root folder (e.g. "specs-default/roles/admin.md" → "roles/admin.md")
  const relativePath = zipPath.split('/').slice(1).join('/')
  if (!relativePath) continue

  // MkDocs requires index.md as the home page; map README.md accordingly
  const targetPath = relativePath === 'README.md' ? 'index.md' : relativePath
  const fullPath = path.join(docsDir, targetPath)

  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  const content = await file.async('nodebuffer')
  fs.writeFileSync(fullPath, content)
}

function appendListSection(content: string, heading: string, values: string[], emptyText: string): string {
  const listBody = values.length > 0 ? values.map((value) => `- ${value}`).join('\n') : emptyText
  return `${content.trimEnd()}\n\n## ${heading}\n\n${listBody}\n`
}

for (const useCase of DEFAULT_PROJECT_USE_CASES) {
  const relatedDataDomains = DEFAULT_PROJECT_USE_CASE_DATA_DOMAINS[useCase.name] ?? []
  const relativePath = path.join('use-cases', toSlug(useCase.name), 'index.md')
  const fullPath = path.join(docsDir, relativePath)
  if (!fs.existsSync(fullPath)) continue

  const original = fs.readFileSync(fullPath, 'utf8')
  if (original.includes('## Related Data Domains')) continue
  fs.writeFileSync(
    fullPath,
    appendListSection(original, 'Related Data Domains', relatedDataDomains, '_No related data domains defined._'),
  )
}

for (const dataDomain of DEFAULT_PROJECT_DATA_DOMAINS) {
  const attributes = (DEFAULT_PROJECT_DATA_DOMAIN_ATTRIBUTES[dataDomain.name] ?? []).map((a) => a.name)
  const relativePath = path.join('data-domains', toSlug(dataDomain.name), 'index.md')
  const fullPath = path.join(docsDir, relativePath)
  if (!fs.existsSync(fullPath)) continue

  const original = fs.readFileSync(fullPath, 'utf8')
  if (original.includes('## Attributes')) continue
  fs.writeFileSync(fullPath, appendListSection(original, 'Attributes', attributes, '_No attributes defined._'))
}

console.log(`Generated documentation for "${DEFAULT_PROJECT_NAME}" in ${docsDir}`)
