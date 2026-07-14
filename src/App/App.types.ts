import type { ProjectRepository } from '../projectRepository'

export type ProjectFormValues = {
  name: string
  roles: string
  useCases: string
}

export type ProjectsPageProps = {
  repository: ProjectRepository
}

export type ProjectDetailPageProps = {
  repository: ProjectRepository
}

export type AppProps = {
  repository?: ProjectRepository
}
