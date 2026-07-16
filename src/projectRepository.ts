import { PGlite } from '@electric-sql/pglite'

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

// v4 includes project/role/use case description columns with backward-compatible empty-string defaults.
const DEFAULT_PROJECT_SEED_VERSION = '4'

export const DEFAULT_PROJECT_NAME = 'specs (default)'

export const DEFAULT_PROJECT_ROLES = ['End User', 'Developer', 'DevOps Engineer']

export const DEFAULT_PROJECT_USE_CASES = [
  'Create a project',
  'View saved projects',
  'Add a role to a project',
  'Edit a role in a project',
  'Delete a role from a project',
  'Add a use case to a project',
  'Edit a use case in a project',
  'Delete a use case from a project',
  'Create a data domain',
  'Edit a data domain',
  'Delete a data domain',
  'View a data domain',
  'View saved data domains',
  'Add a data domain to a use case',
  'Create a data domain then add to a use case',
  'Download documentation as ZIP',
  'Use the app offline (PWA)',
  'Deploy app to GitHub Pages',
]

const ALLOWED_VALUE_TABLES = ['project_roles', 'project_use_cases', 'project_data_domains'] as const
type ValueTable = (typeof ALLOWED_VALUE_TABLES)[number]

async function batchInsertValues(db: PGlite, table: ValueTable, projectId: number, values: string[]) {
  if (values.length === 0) return
  if (!ALLOWED_VALUE_TABLES.includes(table)) {
    throw new Error(`Invalid table: ${table}`)
  }
  const params: (number | string)[] = []
  const placeholders = values.map((value, index) => {
    params.push(projectId, value)
    return `($${index * 2 + 1}, $${index * 2 + 2})`
  })
  await db.query(`INSERT INTO ${table} (project_id, value) VALUES ${placeholders.join(', ')}`, params)
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
      `)
      await seedDefaultProject(db)
      return db
    })()
  }

  return dbPromise
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
  }
}
