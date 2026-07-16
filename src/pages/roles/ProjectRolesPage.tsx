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
import GroupsIcon from '@mui/icons-material/Groups'
import type { ProjectRepository } from '../../projectRepository'

type ProjectRolesPageProps = {
  repository: ProjectRepository
}

const ProjectRolesPage = ({ repository }: ProjectRolesPageProps) => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Awaited<ReturnType<ProjectRepository['getProject']>>>(null)
  const [error, setError] = useState<string | null>(null)
  const [rolePendingDeletion, setRolePendingDeletion] = useState<string | null>(null)

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

  const handleConfirmDeleteRole = async () => {
    if (!rolePendingDeletion) return
    setError(null)
    try {
      const updated = await repository.removeProjectRole(project.id, rolePendingDeletion)
      if (!updated) {
        setError('Unable to delete role. Project may have been deleted.')
        return
      }
      setProject(updated)
      setRolePendingDeletion(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update this project.')
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Roles — {project.name}</Typography>
        <Button
          component={RouterLink}
          to={`/projects/${project.id}/roles/new`}
          startIcon={<AddCircleIcon />}
          variant="contained"
        >
          Add role
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <CardContent>
          {project.roles.length === 0 ? (
            <Typography color="text.secondary">No roles yet. Add your first role above.</Typography>
          ) : (
            <List>
              {project.roles.map((role) => (
                <ListItem
                  key={role.name}
                  disableGutters
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        aria-label={`Edit role: ${role.name}`}
                        onClick={() =>
                          navigate(`/projects/${project.id}/roles/edit/${encodeURIComponent(role.name)}`)
                        }
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete role: ${role.name}`}
                        onClick={() => setRolePendingDeletion(role.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemIcon>
                    <GroupsIcon />
                  </ListItemIcon>
                  <ListItemText primary={role.name} secondary={role.description || undefined} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(rolePendingDeletion)} onClose={() => setRolePendingDeletion(null)}>
        <DialogTitle>Delete role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to delete "${rolePendingDeletion}" from this project?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRolePendingDeletion(null)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDeleteRole} variant="contained">
            Confirm delete role
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default ProjectRolesPage
