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
import { buildMkdocsConfig, generateProjectDocZip } from '../src/generateProjectDocZip.ts'
import {
  DEFAULT_PROJECT_ACTION_TYPES,
  DEFAULT_PROJECT_DATA_DOMAINS,
  DEFAULT_PROJECT_DATA_DOMAIN_ATTRIBUTES,
  DEFAULT_PROJECT_NAME,
  DEFAULT_PROJECT_ROLES,
  DEFAULT_PROJECT_USE_CASE_ACTION_TYPES,
  DEFAULT_PROJECT_USE_CASES,
  DEFAULT_PROJECT_USE_CASE_DATA_DOMAINS,
  DEFAULT_PROJECT_USE_CASE_ROLES,
} from '../src/projectRepository.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const docsDir = path.join(repoRoot, 'docs')
const mkdocsPath = path.join(repoRoot, 'mkdocs.yml')

const defaultProject = {
  id: 1,
  name: DEFAULT_PROJECT_NAME,
  description: '',
  isDefault: true,
  roles: DEFAULT_PROJECT_ROLES,
  useCases: DEFAULT_PROJECT_USE_CASES,
  actionTypes: DEFAULT_PROJECT_ACTION_TYPES,
  dataDomains: DEFAULT_PROJECT_DATA_DOMAINS,
  useCaseDataDomains: DEFAULT_PROJECT_USE_CASE_DATA_DOMAINS,
  useCaseRoles: DEFAULT_PROJECT_USE_CASE_ROLES,
  useCaseActionTypes: DEFAULT_PROJECT_USE_CASE_ACTION_TYPES,
  dataDomainAttributes: DEFAULT_PROJECT_DATA_DOMAIN_ATTRIBUTES,
}

const zipBuffer = await generateProjectDocZip(defaultProject)
const zip = await JSZip.loadAsync(zipBuffer)

fs.rmSync(docsDir, { recursive: true, force: true })
fs.mkdirSync(docsDir, { recursive: true })

for (const [zipPath, file] of Object.entries(zip.files)) {
  if (file.dir) continue

  // Strip the project root folder (e.g. "specs-default/roles/admin/index.md" -> "roles/admin/index.md")
  const relativePath = zipPath.split('/').slice(1).join('/')
  if (!relativePath) continue

  const fullPath = path.join(docsDir, relativePath)

  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  const content = await file.async('nodebuffer')
  fs.writeFileSync(fullPath, content)
}

fs.writeFileSync(
  mkdocsPath,
  buildMkdocsConfig(defaultProject, {
    siteName: 'Specs Documentation',
    siteDescription: 'Documentation generated from the Specs webapp workflow',
    siteUrl: 'https://specs.tiogars.fr/docs/',
    repoUrl: 'https://github.com/tiogars/specs',
  }),
  'utf8',
)

console.log(`Generated documentation for "${DEFAULT_PROJECT_NAME}" in ${docsDir}`)
