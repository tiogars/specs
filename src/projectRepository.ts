import { PGlite } from '@electric-sql/pglite'

export type DataDomainAttribute = {
  name: string
  description: string
}

export type DataDomain = {
  name: string
  description: string
}

export type Role = {
  name: string
  description: string
}

export type UseCase = {
  name: string
  description: string
}

export type Project = {
  id: number
  name: string
  description: string
  isDefault: boolean
  roles: Role[]
  useCases: UseCase[]
  dataDomains: DataDomain[]
}

export type CreateProjectInput = {
  name: string
  description: string
  roles: string[]
  useCases: string[]
}

export type ProjectRepository = {
  listProjects: () => Promise<Project[]>
  getProject: (projectId: number) => Promise<Project | null>
  createProject: (input: CreateProjectInput) => Promise<Project>
  addProjectRole: (projectId: number, role: string, description?: string) => Promise<Project | null>
  updateProjectRole: (
    projectId: number,
    currentRole: string,
    nextRole: string,
    nextDescription?: string,
  ) => Promise<Project | null>
  removeProjectRole: (projectId: number, role: string) => Promise<Project | null>
  addProjectUseCase: (projectId: number, useCase: string, description?: string) => Promise<Project | null>
  updateProjectUseCase: (
    projectId: number,
    currentUseCase: string,
    nextUseCase: string,
    nextDescription?: string,
  ) => Promise<Project | null>
  removeProjectUseCase: (projectId: number, useCase: string) => Promise<Project | null>
  addProjectDataDomain: (projectId: number, domain: string, description: string) => Promise<Project | null>
  updateProjectDataDomain: (projectId: number, currentDomain: string, nextDomain: string, nextDescription: string) => Promise<Project | null>
  removeProjectDataDomain: (projectId: number, domain: string) => Promise<Project | null>
  getUseCaseDataDomains: (projectId: number, useCase: string) => Promise<DataDomain[]>
  addUseCaseDataDomain: (projectId: number, useCase: string, domain: string) => Promise<DataDomain[]>
  removeUseCaseDataDomain: (projectId: number, useCase: string, domain: string) => Promise<DataDomain[]>
  getDataDomainAttributes: (projectId: number, domainValue: string) => Promise<DataDomainAttribute[]>
  addDataDomainAttribute: (projectId: number, domainValue: string, attribute: string, description?: string) => Promise<DataDomainAttribute[]>
  updateDataDomainAttribute: (projectId: number, domainValue: string, currentAttribute: string, nextAttribute: string, nextDescription?: string) => Promise<DataDomainAttribute[]>
  removeDataDomainAttribute: (projectId: number, domainValue: string, attribute: string) => Promise<DataDomainAttribute[]>
}

type DbProject = {
  id: number
  name: string
  description: string
  is_default: boolean
}

type DbEntityValue = {
  value: string
  description: string
}

// v7 adds descriptions to seeded roles, use cases, data domains, and data domain attributes.
const DEFAULT_PROJECT_SEED_VERSION = '7'

export const DEFAULT_PROJECT_NAME = 'specs (default)'

export const DEFAULT_PROJECT_ROLES: { name: string; description: string }[] = [
  { name: 'End User', description: 'A person who uses the app to create and manage project specifications' },
  { name: 'Developer', description: 'A software developer who builds and maintains the application' },
  { name: 'DevOps Engineer', description: 'An engineer responsible for deployment, infrastructure, and CI/CD pipelines' },
]

export const DEFAULT_PROJECT_USE_CASES: { name: string; description: string }[] = [
  { name: 'Create a project', description: 'Create a new project with a name, description, roles, and use cases' },
  { name: 'View saved projects', description: 'Browse and open previously created projects' },
  { name: 'Add a role to a project', description: 'Assign a new actor or user type to the project' },
  { name: 'Edit a role in a project', description: 'Rename or update the description of an existing role' },
  { name: 'Delete a role from a project', description: 'Remove a role that is no longer needed' },
  { name: 'Add a use case to a project', description: 'Define a new interaction or workflow for the project' },
  { name: 'Edit a use case in a project', description: 'Rename or update the description of an existing use case' },
  { name: 'Delete a use case from a project', description: 'Remove a use case that is no longer relevant' },
  { name: 'Create a data domain', description: 'Define a new logical grouping of related data' },
  { name: 'Edit a data domain', description: 'Rename or update the description of a data domain' },
  { name: 'Delete a data domain', description: 'Remove a data domain and its attributes' },
  { name: 'View a data domain', description: 'Inspect the details and attributes of a data domain' },
  { name: 'View saved data domains', description: 'Browse all data domains defined in the project' },
  { name: 'Add a data domain to a use case', description: 'Link an existing data domain to a use case' },
  { name: 'Create a data domain then add to a use case', description: 'Create a new data domain and immediately link it to a use case' },
  { name: 'Add a data domain attribute', description: 'Define a new property for a data domain' },
  { name: 'Edit a data domain attribute', description: 'Rename or update the description of a data domain attribute' },
  { name: 'Delete a data domain attribute', description: 'Remove a property from a data domain' },
  { name: 'Download documentation as ZIP', description: 'Export the full project specification as a ZIP archive of markdown files' },
  { name: 'Use the app offline (PWA)', description: 'Install and use the application without an internet connection' },
  { name: 'Deploy app to GitHub Pages', description: 'Publish the application to GitHub Pages via CI/CD' },
]

export const DEFAULT_PROJECT_DATA_DOMAINS: { name: string; description: string }[] = [
  { name: 'Project', description: 'A collection of roles, use cases, and data domains that define an application specification' },
  { name: 'Role', description: 'An actor or user type that participates in use cases' },
  { name: 'Use Case', description: 'A specific interaction or workflow performed by one or more roles' },
  { name: 'Data Domain', description: 'A logical grouping of related data with typed attributes' },
  { name: 'Data Domain Attribute', description: 'A named property of a data domain with an optional description' },
]

export const DEFAULT_PROJECT_DATA_DOMAIN_ATTRIBUTES: Record<string, { name: string; description: string }[]> = {
  'Project': [
    { name: 'id', description: 'Unique identifier for the project' },
    { name: 'name', description: 'Human-readable project name' },
    { name: 'description', description: 'Optional description of the project' },
    { name: 'is_default', description: 'Whether this is the pre-seeded default project' },
  ],
  'Role': [
    { name: 'name', description: 'The role\'s display name' },
    { name: 'description', description: 'Optional description of the role' },
  ],
  'Use Case': [
    { name: 'name', description: 'The use case\'s display name' },
    { name: 'description', description: 'Optional description of the use case' },
  ],
  'Data Domain': [
    { name: 'name', description: 'The data domain\'s display name' },
    { name: 'description', description: 'Optional description of the data domain' },
  ],
  'Data Domain Attribute': [
    { name: 'name', description: 'The attribute\'s display name' },
    { name: 'description', description: 'Optional description of the attribute' },
  ],
}

export const DEFAULT_PROJECT_USE_CASE_DATA_DOMAINS: Record<string, string[]> = {
  'Create a project': ['Project'],
  'View saved projects': ['Project'],
  'Add a role to a project': ['Project', 'Role'],
  'Edit a role in a project': ['Project', 'Role'],
  'Delete a role from a project': ['Project', 'Role'],
  'Add a use case to a project': ['Project', 'Use Case'],
  'Edit a use case in a project': ['Project', 'Use Case'],
  'Delete a use case from a project': ['Project', 'Use Case'],
  'Create a data domain': ['Data Domain'],
  'Edit a data domain': ['Data Domain'],
  'Delete a data domain': ['Data Domain'],
  'View a data domain': ['Data Domain'],
  'View saved data domains': ['Data Domain'],
  'Add a data domain to a use case': ['Data Domain', 'Use Case'],
  'Create a data domain then add to a use case': ['Data Domain', 'Use Case'],
  'Add a data domain attribute': ['Data Domain', 'Data Domain Attribute'],
  'Edit a data domain attribute': ['Data Domain', 'Data Domain Attribute'],
  'Delete a data domain attribute': ['Data Domain', 'Data Domain Attribute'],
  'Download documentation as ZIP': ['Project'],
}

const ALLOWED_VALUE_TABLES = ['project_roles', 'project_use_cases', 'project_data_domains'] as const
type ValueTable = (typeof ALLOWED_VALUE_TABLES)[number]

async function batchInsertValues(db: PGlite, table: ValueTable, projectId: number, values: { name: string; description: string }[]) {
  if (values.length === 0) return
  if (!ALLOWED_VALUE_TABLES.includes(table)) {
    throw new Error(`Invalid table: ${table}`)
  }
  const params: (number | string)[] = []
  const placeholders = values.map((entry, index) => {
    params.push(projectId, entry.name, entry.description)
    return `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
  })
  await db.query(`INSERT INTO ${table} (project_id, value, description) VALUES ${placeholders.join(', ')}`, params)
}

async function batchInsertDataDomainAttributes(
  db: PGlite,
  projectId: number,
  attributes: Record<string, { name: string; description: string }[]>,
) {
  for (const [domainValue, entries] of Object.entries(attributes)) {
    if (entries.length === 0) continue
    const params: (number | string)[] = []
    const placeholders = entries.map((entry, index) => {
      params.push(projectId, domainValue, entry.name, entry.description)
      return `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
    })
    await db.query(
      `INSERT INTO data_domain_attributes (project_id, domain_value, value, description) VALUES ${placeholders.join(', ')}`,
      params,
    )
  }
}

async function batchInsertUseCaseDataDomains(
  db: PGlite,
  projectId: number,
  links: Record<string, string[]>,
) {
  for (const [useCaseValue, domainValues] of Object.entries(links)) {
    if (domainValues.length === 0) continue
    const params: (number | string)[] = []
    const placeholders = domainValues.map((domainValue, index) => {
      params.push(projectId, useCaseValue, domainValue)
      return `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
    })
    await db.query(
      `INSERT INTO use_case_data_domains (project_id, use_case_value, domain_value) VALUES ${placeholders.join(', ')} ON CONFLICT DO NOTHING`,
      params,
    )
  }
}

async function seedDefaultProject(db: PGlite) {
  const versionResult = await db.query<{ value: string }>(
    "SELECT value FROM metadata WHERE key = 'default_project_seed_version' LIMIT 1",
  )
  const storedVersion = versionResult.rows[0]?.value

  if (storedVersion === DEFAULT_PROJECT_SEED_VERSION) {
    return
  }

  const defaultProjectResult = await db.query<{ id: number }>(
    'SELECT id FROM projects WHERE is_default = TRUE LIMIT 1',
  )
  const defaultProject = defaultProjectResult.rows[0]

  let projectId: number
  if (defaultProject) {
    projectId = defaultProject.id
    await db.query('DELETE FROM project_roles WHERE project_id = $1', [projectId])
    await db.query('DELETE FROM project_use_cases WHERE project_id = $1', [projectId])
    // use_case_data_domains and data_domain_attributes reference projects(id), not
    // project_data_domains(id), so they must be deleted explicitly before re-seeding.
    await db.query('DELETE FROM data_domain_attributes WHERE project_id = $1', [projectId])
    await db.query('DELETE FROM use_case_data_domains WHERE project_id = $1', [projectId])
    await db.query('DELETE FROM project_data_domains WHERE project_id = $1', [projectId])
  } else {
    const insertResult = await db.query<{ id: number }>(
      'INSERT INTO projects (name, is_default) VALUES ($1, TRUE) RETURNING id',
      [DEFAULT_PROJECT_NAME],
    )
    const inserted = insertResult.rows[0]
    if (!inserted) {
      throw new Error('Unable to create default project')
    }
    projectId = inserted.id
  }

  await batchInsertValues(db, 'project_roles', projectId, DEFAULT_PROJECT_ROLES)
  await batchInsertValues(db, 'project_use_cases', projectId, DEFAULT_PROJECT_USE_CASES)
  await batchInsertValues(db, 'project_data_domains', projectId, DEFAULT_PROJECT_DATA_DOMAINS)
  await batchInsertDataDomainAttributes(db, projectId, DEFAULT_PROJECT_DATA_DOMAIN_ATTRIBUTES)
  await batchInsertUseCaseDataDomains(db, projectId, DEFAULT_PROJECT_USE_CASE_DATA_DOMAINS)

  await db.query(
    "INSERT INTO metadata (key, value) VALUES ('default_project_seed_version', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [DEFAULT_PROJECT_SEED_VERSION],
  )
}

let dbPromise: Promise<PGlite> | null = null

async function getDatabase() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = new PGlite('idb://specs-projects-db')
      await db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS project_roles (
          id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS project_use_cases (
          id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          value TEXT NOT NULL
        );

        ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;
        ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

        CREATE TABLE IF NOT EXISTS metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS project_data_domains (
          id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS use_case_data_domains (
          id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          use_case_value TEXT NOT NULL,
          domain_value TEXT NOT NULL,
          UNIQUE (project_id, use_case_value, domain_value)
        );

        -- Adds the description column for existing databases; DEFAULT '' ensures backward-compatible
        -- migration without needing to back-fill rows — empty string is the correct default for
        -- a description that has never been set.
        ALTER TABLE project_data_domains ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
        ALTER TABLE project_roles ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
        ALTER TABLE project_use_cases ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

        CREATE TABLE IF NOT EXISTS data_domain_attributes (
          id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
          project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          domain_value TEXT NOT NULL,
          value TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          UNIQUE (project_id, domain_value, value)
        );
      `)
      await seedDefaultProject(db)
      return db
    })()
  }

  return dbPromise
}

async function readDataDomainAttributeList(db: PGlite, projectId: number, domainValue: string): Promise<DataDomainAttribute[]> {
  const result = await db.query<{ value: string; description: string }>(
    'SELECT value, description FROM data_domain_attributes WHERE project_id = $1 AND domain_value = $2 ORDER BY id ASC',
    [projectId, domainValue],
  )
  return result.rows.map((row) => ({ name: row.value, description: row.description }))
}

async function readList(db: PGlite, table: 'project_roles' | 'project_use_cases', projectId: number) {
  const result = await db.query<DbEntityValue>(
    `SELECT value, description FROM ${table} WHERE project_id = $1 ORDER BY id ASC`,
    [projectId],
  )

  return result.rows.map((entry) => ({ name: entry.value, description: entry.description }))
}

async function readDataDomains(db: PGlite, projectId: number): Promise<DataDomain[]> {
  const result = await db.query<{ value: string; description: string }>(
    'SELECT value, description FROM project_data_domains WHERE project_id = $1 ORDER BY id ASC',
    [projectId],
  )
  return result.rows.map((row) => ({ name: row.value, description: row.description }))
}

async function hydrateProject(db: PGlite, project: DbProject): Promise<Project> {
  const [roles, useCases, dataDomains] = await Promise.all([
    readList(db, 'project_roles', project.id),
    readList(db, 'project_use_cases', project.id),
    readDataDomains(db, project.id),
  ])

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    isDefault: project.is_default,
    roles,
    useCases,
    dataDomains,
  }
}

function normalizeAndValidateTextField(value: string, fieldLabel: string) {
  const normalizedValue = value.trim()
  if (!normalizedValue) {
    throw new Error(`${fieldLabel} is required`)
  }

  if (normalizedValue.length > 255) {
    throw new Error(`${fieldLabel} exceeds maximum length of 255 characters`)
  }

  return normalizedValue
}

export function createPgliteProjectRepository(): ProjectRepository {
  return {
    async listProjects() {
      const db = await getDatabase()
      const result = await db.query<DbProject>('SELECT id, name, description, is_default FROM projects ORDER BY id DESC')
      return Promise.all(result.rows.map((project) => hydrateProject(db, project)))
    },

    async getProject(projectId) {
      const db = await getDatabase()
      const result = await db.query<DbProject>('SELECT id, name, description, is_default FROM projects WHERE id = $1', [
        projectId,
      ])
      const project = result.rows[0]
      if (!project) {
        return null
      }

      return hydrateProject(db, project)
    },

    async createProject(input) {
      const db = await getDatabase()
      const result = await db.query<DbProject>(
        'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING id, name, description, is_default',
        [input.name, (input.description || '').trim()],
      )
      const project = result.rows[0]

      if (!project) {
        throw new Error('Unable to create project')
      }

      await Promise.all(
        input.roles.map((role) =>
          db.query('INSERT INTO project_roles (project_id, value, description) VALUES ($1, $2, $3)', [
            project.id,
            role,
            '',
          ]),
        ),
      )

      await Promise.all(
        input.useCases.map((useCase) =>
          db.query('INSERT INTO project_use_cases (project_id, value, description) VALUES ($1, $2, $3)', [
            project.id,
            useCase,
            '',
          ]),
        ),
      )

      return hydrateProject(db, project)
    },

    async addProjectRole(projectId, role, description = '') {
      const db = await getDatabase()
      // hydrateProject needs id, name, and is_default to return a complete project payload after update.
      const project = await db.query<DbProject>('SELECT id, name, description, is_default FROM projects WHERE id = $1', [
        projectId,
      ])
      if (!project.rows[0]) {
        return null
      }

      const normalizedRole = normalizeAndValidateTextField(role, 'Role')
      const existingRole = await db.query<{ id: number }>(
        'SELECT id FROM project_roles WHERE project_id = $1 AND value = $2 LIMIT 1',
        [projectId, normalizedRole],
      )

      if (existingRole.rows.length === 0) {
        await db.query('INSERT INTO project_roles (project_id, value, description) VALUES ($1, $2, $3)', [
          projectId,
          normalizedRole,
          description.trim(),
        ])
      }

      return hydrateProject(db, project.rows[0])
    },

    async updateProjectRole(projectId, currentRole, nextRole, nextDescription = '') {
      const db = await getDatabase()
      const project = await db.query<DbProject>('SELECT id, name, description, is_default FROM projects WHERE id = $1', [
        projectId,
      ])
      if (!project.rows[0]) {
        return null
      }

      const normalizedCurrentRole = normalizeAndValidateTextField(currentRole, 'Role')
      const normalizedNextRole = normalizeAndValidateTextField(nextRole, 'Role')

      const currentRoleResult = await db.query<{ id: number }>(
        'SELECT id FROM project_roles WHERE project_id = $1 AND value = $2 LIMIT 1',
        [projectId, normalizedCurrentRole],
      )
      const currentRoleRecord = currentRoleResult.rows[0]
      if (!currentRoleRecord) {
        throw new Error('Role not found')
      }

      if (normalizedCurrentRole !== normalizedNextRole) {
        const duplicateRole = await db.query<{ id: number }>(
          'SELECT id FROM project_roles WHERE project_id = $1 AND value = $2 LIMIT 1',
          [projectId, normalizedNextRole],
        )
        if (duplicateRole.rows.length > 0) {
          throw new Error('Role already exists')
        }
      }

      await db.query('UPDATE project_roles SET value = $1, description = $2 WHERE id = $3', [
        normalizedNextRole,
        nextDescription.trim(),
        currentRoleRecord.id,
      ])

      return hydrateProject(db, project.rows[0])
    },

    async removeProjectRole(projectId, role) {
      const db = await getDatabase()
      const project = await db.query<DbProject>('SELECT id, name, description, is_default FROM projects WHERE id = $1', [
        projectId,
      ])
      if (!project.rows[0]) {
        return null
      }

      const normalizedRole = normalizeAndValidateTextField(role, 'Role')
      const deleteResult = await db.query<{ id: number }>(
        'DELETE FROM project_roles WHERE project_id = $1 AND value = $2 RETURNING id',
        [projectId, normalizedRole],
      )

      if (deleteResult.rows.length === 0) {
        throw new Error('Role not found')
      }

      return hydrateProject(db, project.rows[0])
    },

    async addProjectUseCase(projectId, useCase, description = '') {
      const db = await getDatabase()
      // hydrateProject needs id, name, and is_default to return a complete project payload after update.
      const project = await db.query<DbProject>('SELECT id, name, description, is_default FROM projects WHERE id = $1', [
        projectId,
      ])
      if (!project.rows[0]) {
        return null
      }

      const normalizedUseCase = normalizeAndValidateTextField(useCase, 'Use case')
      const existingUseCase = await db.query<{ id: number }>(
        'SELECT id FROM project_use_cases WHERE project_id = $1 AND value = $2 LIMIT 1',
        [projectId, normalizedUseCase],
      )

      if (existingUseCase.rows.length === 0) {
        await db.query('INSERT INTO project_use_cases (project_id, value, description) VALUES ($1, $2, $3)', [
          projectId,
          normalizedUseCase,
          description.trim(),
        ])
      }

      return hydrateProject(db, project.rows[0])
    },

    async updateProjectUseCase(projectId, currentUseCase, nextUseCase, nextDescription = '') {
      const db = await getDatabase()
      const project = await db.query<DbProject>('SELECT id, name, description, is_default FROM projects WHERE id = $1', [
        projectId,
      ])
      if (!project.rows[0]) {
        return null
      }

      const normalizedCurrentUseCase = normalizeAndValidateTextField(currentUseCase, 'Use case')
      const normalizedNextUseCase = normalizeAndValidateTextField(nextUseCase, 'Use case')

      const currentUseCaseResult = await db.query<{ id: number }>(
        'SELECT id FROM project_use_cases WHERE project_id = $1 AND value = $2 LIMIT 1',
        [projectId, normalizedCurrentUseCase],
      )
      const currentUseCaseRecord = currentUseCaseResult.rows[0]
      if (!currentUseCaseRecord) {
        throw new Error('Use case not found')
      }

      if (normalizedCurrentUseCase !== normalizedNextUseCase) {
        const duplicateUseCase = await db.query<{ id: number }>(
          'SELECT id FROM project_use_cases WHERE project_id = $1 AND value = $2 LIMIT 1',
          [projectId, normalizedNextUseCase],
        )
        if (duplicateUseCase.rows.length > 0) {
          throw new Error('Use case already exists')
        }
      }

      await db.query('UPDATE project_use_cases SET value = $1, description = $2 WHERE id = $3', [
        normalizedNextUseCase,
        nextDescription.trim(),
        currentUseCaseRecord.id,
      ])

      return hydrateProject(db, project.rows[0])
    },

    async removeProjectUseCase(projectId, useCase) {
      const db = await getDatabase()
      const project = await db.query<DbProject>('SELECT id, name, description, is_default FROM projects WHERE id = $1', [
        projectId,
      ])
      if (!project.rows[0]) {
        return null
      }

      const normalizedUseCase = normalizeAndValidateTextField(useCase, 'Use case')
      const deleteResult = await db.query<{ id: number }>(
        'DELETE FROM project_use_cases WHERE project_id = $1 AND value = $2 RETURNING id',
        [projectId, normalizedUseCase],
      )

      if (deleteResult.rows.length === 0) {
        throw new Error('Use case not found')
      }

      return hydrateProject(db, project.rows[0])
    },

    async addProjectDataDomain(projectId, domain, description) {
      const db = await getDatabase()
      const project = await db.query<DbProject>('SELECT id, name, description, is_default FROM projects WHERE id = $1', [
        projectId,
      ])
      if (!project.rows[0]) {
        return null
      }

      const normalizedDomain = normalizeAndValidateTextField(domain, 'Data domain')
      const normalizedDescription = description.trim()
      const existing = await db.query<{ id: number }>(
        'SELECT id FROM project_data_domains WHERE project_id = $1 AND value = $2 LIMIT 1',
        [projectId, normalizedDomain],
      )

      if (existing.rows.length === 0) {
        await db.query('INSERT INTO project_data_domains (project_id, value, description) VALUES ($1, $2, $3)', [
          projectId,
          normalizedDomain,
          normalizedDescription,
        ])
      }

      return hydrateProject(db, project.rows[0])
    },

    async updateProjectDataDomain(projectId, currentDomain, nextDomain, nextDescription) {
      const db = await getDatabase()
      const project = await db.query<DbProject>('SELECT id, name, description, is_default FROM projects WHERE id = $1', [
        projectId,
      ])
      if (!project.rows[0]) {
        return null
      }

      const normalizedCurrent = normalizeAndValidateTextField(currentDomain, 'Data domain')
      const normalizedNext = normalizeAndValidateTextField(nextDomain, 'Data domain')
      const normalizedDescription = nextDescription.trim()

      const currentRecord = await db.query<{ id: number }>(
        'SELECT id FROM project_data_domains WHERE project_id = $1 AND value = $2 LIMIT 1',
        [projectId, normalizedCurrent],
      )
      if (!currentRecord.rows[0]) {
        throw new Error('Data domain not found')
      }

      if (normalizedCurrent !== normalizedNext) {
        const duplicate = await db.query<{ id: number }>(
          'SELECT id FROM project_data_domains WHERE project_id = $1 AND value = $2 LIMIT 1',
          [projectId, normalizedNext],
        )
        if (duplicate.rows.length > 0) {
          throw new Error('Data domain already exists')
        }
      }

      await db.query('UPDATE project_data_domains SET value = $1, description = $2 WHERE id = $3', [
        normalizedNext,
        normalizedDescription,
        currentRecord.rows[0].id,
      ])

      // Also update any use_case_data_domains references
      await db.query(
        'UPDATE use_case_data_domains SET domain_value = $1 WHERE project_id = $2 AND domain_value = $3',
        [normalizedNext, projectId, normalizedCurrent],
      )

      // Also update any data_domain_attributes references
      await db.query(
        'UPDATE data_domain_attributes SET domain_value = $1 WHERE project_id = $2 AND domain_value = $3',
        [normalizedNext, projectId, normalizedCurrent],
      )

      return hydrateProject(db, project.rows[0])
    },

    async removeProjectDataDomain(projectId, domain) {
      const db = await getDatabase()
      const project = await db.query<DbProject>('SELECT id, name, description, is_default FROM projects WHERE id = $1', [
        projectId,
      ])
      if (!project.rows[0]) {
        return null
      }

      const normalizedDomain = normalizeAndValidateTextField(domain, 'Data domain')
      const deleteResult = await db.query<{ id: number }>(
        'DELETE FROM project_data_domains WHERE project_id = $1 AND value = $2 RETURNING id',
        [projectId, normalizedDomain],
      )

      if (deleteResult.rows.length === 0) {
        throw new Error('Data domain not found')
      }

      // Also remove any use_case_data_domains references
      await db.query('DELETE FROM use_case_data_domains WHERE project_id = $1 AND domain_value = $2', [
        projectId,
        normalizedDomain,
      ])

      // Also remove any data_domain_attributes for this domain
      await db.query('DELETE FROM data_domain_attributes WHERE project_id = $1 AND domain_value = $2', [
        projectId,
        normalizedDomain,
      ])

      return hydrateProject(db, project.rows[0])
    },

    async getUseCaseDataDomains(projectId, useCase) {
      const db = await getDatabase()
      const result = await db.query<{ domain_value: string; description: string }>(
        `SELECT ucd.domain_value, COALESCE(pdd.description, '') AS description
         FROM use_case_data_domains ucd
         LEFT JOIN project_data_domains pdd ON pdd.project_id = ucd.project_id AND pdd.value = ucd.domain_value
         WHERE ucd.project_id = $1 AND ucd.use_case_value = $2
         ORDER BY ucd.id ASC`,
        [projectId, useCase],
      )
      return result.rows.map((row) => ({ name: row.domain_value, description: row.description }))
    },

    async addUseCaseDataDomain(projectId, useCase, domain) {
      const db = await getDatabase()
      const normalizedDomain = normalizeAndValidateTextField(domain, 'Data domain')

      await db.query(
        'INSERT INTO use_case_data_domains (project_id, use_case_value, domain_value) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [projectId, useCase, normalizedDomain],
      )

      const result = await db.query<{ domain_value: string; description: string }>(
        `SELECT ucd.domain_value, COALESCE(pdd.description, '') AS description
         FROM use_case_data_domains ucd
         LEFT JOIN project_data_domains pdd ON pdd.project_id = ucd.project_id AND pdd.value = ucd.domain_value
         WHERE ucd.project_id = $1 AND ucd.use_case_value = $2
         ORDER BY ucd.id ASC`,
        [projectId, useCase],
      )
      return result.rows.map((row) => ({ name: row.domain_value, description: row.description }))
    },

    async removeUseCaseDataDomain(projectId, useCase, domain) {
      const db = await getDatabase()
      const normalizedDomain = normalizeAndValidateTextField(domain, 'Data domain')

      const deleteResult = await db.query<{ id: number }>(
        'DELETE FROM use_case_data_domains WHERE project_id = $1 AND use_case_value = $2 AND domain_value = $3 RETURNING id',
        [projectId, useCase, normalizedDomain],
      )

      if (deleteResult.rows.length === 0) {
        throw new Error('Data domain link not found')
      }

      const result = await db.query<{ domain_value: string; description: string }>(
        `SELECT ucd.domain_value, COALESCE(pdd.description, '') AS description
         FROM use_case_data_domains ucd
         LEFT JOIN project_data_domains pdd ON pdd.project_id = ucd.project_id AND pdd.value = ucd.domain_value
         WHERE ucd.project_id = $1 AND ucd.use_case_value = $2
         ORDER BY ucd.id ASC`,
        [projectId, useCase],
      )
      return result.rows.map((row) => ({ name: row.domain_value, description: row.description }))
    },

    async getDataDomainAttributes(projectId, domainValue) {
      const db = await getDatabase()
      return readDataDomainAttributeList(db, projectId, domainValue)
    },

    async addDataDomainAttribute(projectId, domainValue, attribute, description = '') {
      const db = await getDatabase()
      const normalizedAttribute = normalizeAndValidateTextField(attribute, 'Attribute')
      const existing = await db.query<{ id: number }>(
        'SELECT id FROM data_domain_attributes WHERE project_id = $1 AND domain_value = $2 AND value = $3 LIMIT 1',
        [projectId, domainValue, normalizedAttribute],
      )

      if (existing.rows.length === 0) {
        await db.query(
          'INSERT INTO data_domain_attributes (project_id, domain_value, value, description) VALUES ($1, $2, $3, $4)',
          [projectId, domainValue, normalizedAttribute, description.trim()],
        )
      }

      return readDataDomainAttributeList(db, projectId, domainValue)
    },

    async updateDataDomainAttribute(projectId, domainValue, currentAttribute, nextAttribute, nextDescription = '') {
      const db = await getDatabase()
      const normalizedCurrent = normalizeAndValidateTextField(currentAttribute, 'Attribute')
      const normalizedNext = normalizeAndValidateTextField(nextAttribute, 'Attribute')

      const currentRecord = await db.query<{ id: number }>(
        'SELECT id FROM data_domain_attributes WHERE project_id = $1 AND domain_value = $2 AND value = $3 LIMIT 1',
        [projectId, domainValue, normalizedCurrent],
      )
      if (!currentRecord.rows[0]) {
        throw new Error('Attribute not found')
      }

      if (normalizedCurrent !== normalizedNext) {
        const duplicate = await db.query<{ id: number }>(
          'SELECT id FROM data_domain_attributes WHERE project_id = $1 AND domain_value = $2 AND value = $3 LIMIT 1',
          [projectId, domainValue, normalizedNext],
        )
        if (duplicate.rows.length > 0) {
          throw new Error('Attribute already exists')
        }
      }

      await db.query('UPDATE data_domain_attributes SET value = $1, description = $2 WHERE id = $3', [
        normalizedNext,
        nextDescription.trim(),
        currentRecord.rows[0].id,
      ])

      return readDataDomainAttributeList(db, projectId, domainValue)
    },

    async removeDataDomainAttribute(projectId, domainValue, attribute) {
      const db = await getDatabase()
      const normalizedAttribute = normalizeAndValidateTextField(attribute, 'Attribute')

      const deleteResult = await db.query<{ id: number }>(
        'DELETE FROM data_domain_attributes WHERE project_id = $1 AND domain_value = $2 AND value = $3 RETURNING id',
        [projectId, domainValue, normalizedAttribute],
      )

      if (deleteResult.rows.length === 0) {
        throw new Error('Attribute not found')
      }

      return readDataDomainAttributeList(db, projectId, domainValue)
    },
  }
}
