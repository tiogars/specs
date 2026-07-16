import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import DownloadIcon from '@mui/icons-material/Download'
import GroupsIcon from '@mui/icons-material/Groups'
import StorageIcon from '@mui/icons-material/Storage'
import type { ProjectRepository } from '../../projectRepository'
import { generateProjectDocZip, toSlug } from '../../generateProjectDocZip'

type ProjectDetailPageProps = {
  repository: ProjectRepository
}

const ProjectDetailPage = ({ repository }: ProjectDetailPageProps) => {
  const { projectId } = useParams()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Awaited<ReturnType<ProjectRepository['getProject']>>>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const id = Number(projectId)

    if (!Number.isFinite(id)) {
      setProject(null)
      setLoading(false)
      return () => {
        cancelled = true
      }
    }

    setLoading(true)
    repository
      .getProject(id)
      .then((value) => {
        if (!cancelled) setProject(value)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId, repository])

  const handleDownloadDocs = async () => {
    if (!project) return
    setIsDownloading(true)
    try {
      const zipBuffer = await generateProjectDocZip(project)
      const blob = new Blob([zipBuffer], { type: 'application/zip' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${toSlug(project.name) || 'project'}.zip`
      anchor.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
    }
  }

  if (loading) {
    return <Typography>Loading project…</Typography>
  }

  if (!project) {
    return (
      <Alert severity="warning">
        Project not found.{' '}
        <Link component={RouterLink} to="/projects">
          Back to projects
        </Link>
      </Alert>
    )
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">{project.name}</Typography>
        <Tooltip title="Download documentation as ZIP">
          <span>
            <Button
              disabled={isDownloading}
              onClick={handleDownloadDocs}
              startIcon={<DownloadIcon />}
              variant="outlined"
            >
              Download docs
            </Button>
          </span>
        </Tooltip>
      </Stack>
      {project.description ? <Typography color="text.secondary">{project.description}</Typography> : null}

      <Stack direction="row" spacing={2}>
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <GroupsIcon color="action" />
                <Typography variant="h6">Roles</Typography>
              </Stack>
              <Chip
                color="primary"
                label={`${project.roles.length} roles`}
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              />
              <Button component={RouterLink} to={`/projects/${project.id}/roles`} size="small" variant="contained">
                Manage roles
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <AutoStoriesIcon color="action" />
                <Typography variant="h6">Use cases</Typography>
              </Stack>
              <Chip
                color="secondary"
                label={`${project.useCases.length} use cases`}
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              />
              <Button
                component={RouterLink}
                to={`/projects/${project.id}/use-cases`}
                size="small"
                variant="contained"
              >
                Manage use cases
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <StorageIcon color="action" />
                <Typography variant="h6">Data domains</Typography>
              </Stack>
              <Chip
                color="info"
                label={`${project.dataDomains.length} data domains`}
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              />
              <Button
                component={RouterLink}
                to={`/projects/${project.id}/data-domains`}
                size="small"
                variant="contained"
              >
                Manage data domains
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  )
}

export default ProjectDetailPage
