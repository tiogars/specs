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
import { generateProjectDocZip } from '../src/generateProjectDocZip.ts'
import { DEFAULT_PROJECT_NAME, DEFAULT_PROJECT_ROLES, DEFAULT_PROJECT_USE_CASES } from '../src/projectRepository.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const docsDir = path.join(repoRoot, 'docs')

const defaultProject = {
  id: 1,
  name: DEFAULT_PROJECT_NAME,
  isDefault: true,
  roles: DEFAULT_PROJECT_ROLES,
  useCases: DEFAULT_PROJECT_USE_CASES,
  dataDomains: [],
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

console.log(`Generated documentation for "${DEFAULT_PROJECT_NAME}" in ${docsDir}`)
