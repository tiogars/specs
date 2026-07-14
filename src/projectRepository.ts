import { PGlite } from '@electric-sql/pglite'

export type Project = {
  id: number
  name: string
  roles: string[]
  useCases: string[]
}

export type CreateProjectInput = {
  name: string
  roles: string[]
  useCases: string[]
}

export type ProjectRepository = {
  listProjects: () => Promise<Project[]>
  getProject: (projectId: number) => Promise<Project | null>
  createProject: (input: CreateProjectInput) => Promise<Project>
}

type DbProject = {
  id: number
  name: string
}

type DbValue = {
  value: string
}

let dbPromise: Promise<PGlite> | null = null

async function getDatabase() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = new PGlite('idb://specs-projects-db')
      await db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS project_roles (
          id INTEGER PRIMARY KEY,
          project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS project_use_cases (
          id INTEGER PRIMARY KEY,
          project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          value TEXT NOT NULL
        );
      `)
      return db
    })()
  }

  return dbPromise
}

async function readList(db: PGlite, table: 'project_roles' | 'project_use_cases', projectId: number) {
  const result = await db.query<DbValue>(
    `SELECT value FROM ${table} WHERE project_id = $1 ORDER BY id ASC`,
    [projectId],
  )

  return result.rows.map((entry) => entry.value)
}

async function hydrateProject(db: PGlite, project: DbProject): Promise<Project> {
  const [roles, useCases] = await Promise.all([
    readList(db, 'project_roles', project.id),
    readList(db, 'project_use_cases', project.id),
  ])

  return {
    id: project.id,
    name: project.name,
    roles,
    useCases,
  }
}

export function createPgliteProjectRepository(): ProjectRepository {
  return {
    async listProjects() {
      const db = await getDatabase()
      const result = await db.query<DbProject>('SELECT id, name FROM projects ORDER BY id DESC')
      return Promise.all(result.rows.map((project) => hydrateProject(db, project)))
    },

    async getProject(projectId) {
      const db = await getDatabase()
      const result = await db.query<DbProject>('SELECT id, name FROM projects WHERE id = $1', [projectId])
      const project = result.rows[0]
      if (!project) {
        return null
      }

      return hydrateProject(db, project)
    },

    async createProject(input) {
      const db = await getDatabase()
      const result = await db.query<DbProject>(
        'INSERT INTO projects (name) VALUES ($1) RETURNING id, name',
        [input.name],
      )
      const project = result.rows[0]

      if (!project) {
        throw new Error('Unable to create project')
      }

      for (const role of input.roles) {
        await db.query('INSERT INTO project_roles (project_id, value) VALUES ($1, $2)', [project.id, role])
      }

      for (const useCase of input.useCases) {
        await db.query('INSERT INTO project_use_cases (project_id, value) VALUES ($1, $2)', [project.id, useCase])
      }

      return hydrateProject(db, project)
    },
  }
}
