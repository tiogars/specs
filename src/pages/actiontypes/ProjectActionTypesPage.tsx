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
import FactCheckIcon from '@mui/icons-material/FactCheck'
import type { ProjectRepository } from '../../projectRepository'

type ProjectActionTypesPageProps = {
  repository: ProjectRepository
}

const ProjectActionTypesPage = ({ repository }: ProjectActionTypesPageProps) => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Awaited<ReturnType<ProjectRepository['getProject']>>>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionTypePendingDeletion, setActionTypePendingDeletion] = useState<string | null>(null)

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

  const handleConfirmDeleteActionType = async () => {
    if (!actionTypePendingDeletion) return
    setError(null)
    try {
      const updated = await repository.removeProjectActionType(project.id, actionTypePendingDeletion)
      if (!updated) {
        setError('Unable to delete action type. Project may have been deleted.')
        return
      }
      setProject(updated)
      setActionTypePendingDeletion(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update this project.')
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Action types — {project.name}</Typography>
        <Button
          component={RouterLink}
          to={`/projects/${project.id}/action-types/new`}
          startIcon={<AddCircleIcon />}
          variant="contained"
        >
          Add action type
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <CardContent>
          {project.actionTypes.length === 0 ? (
            <Typography color="text.secondary">No action types yet. Add your first action type above.</Typography>
          ) : (
            <List>
              {project.actionTypes.map((actionType) => (
                <ListItem
                  key={actionType.name}
                  disableGutters
                  sx={{
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 },
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ minWidth: 0, flex: 1, width: '100%' }}>
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                      <FactCheckIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={actionType.name}
                      secondary={
                        actionType.description
                          ? `${actionType.description} (${actionType.acceptanceCriteria.length} criteria)`
                          : `${actionType.acceptanceCriteria.length} criteria`
                      }
                    />
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      pl: { xs: 5, sm: 0 },
                      ml: { sm: 'auto' },
                      alignSelf: { xs: 'flex-start', sm: 'center' },
                    }}
                  >
                    <IconButton
                      aria-label={`Edit action type: ${actionType.name}`}
                      onClick={() =>
                        navigate(`/projects/${project.id}/action-types/edit/${encodeURIComponent(actionType.name)}`)
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label={`Delete action type: ${actionType.name}`}
                      onClick={() => setActionTypePendingDeletion(actionType.name)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(actionTypePendingDeletion)} onClose={() => setActionTypePendingDeletion(null)}>
        <DialogTitle>Delete action type</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to delete "${actionTypePendingDeletion}" from this project? It will also be removed from linked use cases.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionTypePendingDeletion(null)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDeleteActionType} variant="contained">
            Confirm delete action type
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default ProjectActionTypesPage
