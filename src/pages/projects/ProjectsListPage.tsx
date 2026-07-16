import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Alert, Button, Card, CardContent, Chip, Stack, Tooltip, Typography } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import FolderIcon from '@mui/icons-material/Folder'
import type { ProjectRepository } from '../../projectRepository'

type ProjectsListPageProps = {
  repository: ProjectRepository
}

const ProjectsListPage = ({ repository }: ProjectsListPageProps) => {
  const [projects, setProjects] = useState<Awaited<ReturnType<ProjectRepository['listProjects']>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    repository
      .listProjects()
      .then((value) => {
        if (!cancelled) setProjects(value)
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load projects. Try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [repository])

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Projects</Typography>
        <Button component={RouterLink} to="/projects/new" startIcon={<AddCircleIcon />} variant="contained">
          New project
        </Button>
      </Stack>
      <Typography color="text.secondary">
        Describe each project through roles and use cases. Everything is stored locally with PGlite so it works offline.
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {loading ? <Typography>Loading projects…</Typography> : null}
      {!loading && projects.length === 0 ? (
        <Typography color="text.secondary">
          No projects yet.{' '}
          <RouterLink to="/projects/new">Create your first project.</RouterLink>
        </Typography>
      ) : null}

      {projects.map((project) => (
        <Card key={project.id} variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                component={RouterLink}
                to={`/projects/${project.id}`}
                sx={{ textDecoration: 'none' }}
                variant="h6"
              >
                {project.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                {project.isDefault ? (
                  <Tooltip title="This project describes the webapp itself and is reset on each deploy">
                    <Chip color="secondary" label="Default" size="small" />
                  </Tooltip>
                ) : null}
                <Chip color="primary" icon={<FolderIcon />} label={`${project.roles.length} roles`} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}

export default ProjectsListPage
