import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import EditIcon from '@mui/icons-material/Edit'
import StorageIcon from '@mui/icons-material/Storage'
import type { ProjectRepository } from '../../projectRepository'

type ProjectDataDomainsPageProps = {
  repository: ProjectRepository
}

const ProjectDataDomainsPage = ({ repository }: ProjectDataDomainsPageProps) => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Awaited<ReturnType<ProjectRepository['getProject']>>>(null)
  const [error, setError] = useState<string | null>(null)
  const [domainPendingDeletion, setDomainPendingDeletion] = useState<string | null>(null)

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

  if (loading) return <Typography>Loading…</Typography>

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

  const handleConfirmDeleteDomain = async () => {
    if (!domainPendingDeletion) return
    setError(null)
    try {
      const updated = await repository.removeProjectDataDomain(project.id, domainPendingDeletion)
      if (!updated) {
        setError('Unable to delete data domain. Project may have been deleted.')
        return
      }
      setProject(updated)
      setDomainPendingDeletion(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update this project.')
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Data domains — {project.name}</Typography>
        <Button
          component={RouterLink}
          to={`/projects/${project.id}/data-domains/new`}
          startIcon={<AddCircleIcon />}
          variant="contained"
        >
          Add data domain
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <CardContent>
          {project.dataDomains.length === 0 ? (
            <Typography color="text.secondary">No data domains yet. Add your first data domain above.</Typography>
          ) : (
            <List>
              {project.dataDomains.map((domain) => (
                <ListItem
                  key={domain.name}
                  disableGutters
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        aria-label={`Edit data domain: ${domain.name}`}
                        onClick={() =>
                          navigate(
                            `/projects/${project.id}/data-domains/edit/${encodeURIComponent(domain.name)}`,
                          )
                        }
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete data domain: ${domain.name}`}
                        onClick={() => setDomainPendingDeletion(domain.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemIcon>
                    <StorageIcon />
                  </ListItemIcon>
                  <ListItemText primary={domain.name} secondary={domain.description || undefined} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(domainPendingDeletion)} onClose={() => setDomainPendingDeletion(null)}>
        <DialogTitle>Delete data domain</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to delete "${domainPendingDeletion}" from this project? It will also be removed from any linked use cases.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDomainPendingDeletion(null)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDeleteDomain} variant="contained">
            Confirm delete data domain
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default ProjectDataDomainsPage
