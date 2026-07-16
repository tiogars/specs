import type { ProjectRepository } from '../../projectRepository'

export type HeaderProps = {
  docsHref: string
  repository: ProjectRepository
  showMenuButton?: boolean
  onMenuClick?: () => void
}
