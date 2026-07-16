import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import StorageIcon from '@mui/icons-material/Storage'
import type { ProjectRepository } from '../../projectRepository'

type UseCaseDataDomainsPageProps = {
  repository: ProjectRepository
}

const UseCaseDataDomainsPage = ({ repository }: UseCaseDataDomainsPageProps) => {
  const { projectId, ucValue } = useParams()
  const [loading, setLoading] = useState(true)
  const [projectName, setProjectName] = useState('')
  const [linkedDomains, setLinkedDomains] = useState<string[]>([])
  const [projectNotFound, setProjectNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedUseCase = ucValue ? decodeURIComponent(ucValue) : ''

  useEffect(() => {
    let cancelled = false
    const id = Number(projectId)

    if (!Number.isFinite(id) || !decodedUseCase) {
      setProjectNotFound(true)
      setLoading(false)
      return () => {
        cancelled = true
      }
    }

    setLoading(true)
    Promise.all([repository.getProject(id), repository.getUseCaseDataDomains(id, decodedUseCase)])
      .then(([project, domains]) => {
        if (!cancelled) {
          if (!project) {
            setProjectNotFound(true)
          } else {
            setProjectName(project.name)
            setLinkedDomains(domains)
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId, decodedUseCase, repository])

  if (loading) return <Typography>Loading…</Typography>

  if (projectNotFound) {
    return (
      <Alert severity="warning">
        Project not found.{' '}
        <Link component={RouterLink} to="/projects">
          Back to projects
        </Link>
      </Alert>
    )
  }

  const id = Number(projectId)

  const handleRemoveDomain = async (domain: string) => {
    setError(null)
    try {
      const updated = await repository.removeUseCaseDataDomain(id, decodedUseCase, domain)
      setLinkedDomains(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove data domain.')
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Data domains — {projectName}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Use case: <strong>{decodedUseCase}</strong>
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            component={RouterLink}
            to={`/projects/${projectId}/use-cases/${ucValue}/data-domains/link`}
            startIcon={<AddCircleIcon />}
            variant="outlined"
          >
            Link domain
          </Button>
          <Button
            component={RouterLink}
            to={`/projects/${projectId}/use-cases/${ucValue}/data-domains/new`}
            startIcon={<AddCircleIcon />}
            variant="contained"
          >
            Create &amp; link
          </Button>
        </Stack>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <CardContent>
          {linkedDomains.length === 0 ? (
            <Typography color="text.secondary">
              No data domains linked to this use case yet. Use the buttons above to link one.
            </Typography>
          ) : (
            <List>
              {linkedDomains.map((domain) => (
                <ListItem
                  key={domain}
                  disableGutters
                  secondaryAction={
                    <IconButton
                      aria-label={`Remove data domain link: ${domain}`}
                      onClick={() => handleRemoveDomain(domain)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText primary={domain} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Divider />
      <Stack direction="row" spacing={1}>
        <Chip
          component={RouterLink}
          to={`/projects/${projectId}/use-cases`}
          label="Back to use cases"
          clickable
          variant="outlined"
        />
        <Chip
          component={RouterLink}
          to={`/projects/${projectId}/data-domains`}
          label="Manage all data domains"
          clickable
          variant="outlined"
        />
      </Stack>
    </Stack>
  )
}

export default UseCaseDataDomainsPage
