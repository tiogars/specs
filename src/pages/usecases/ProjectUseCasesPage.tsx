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
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import type { ProjectRepository } from '../../projectRepository'

type ProjectUseCasesPageProps = {
  repository: ProjectRepository
}

const ProjectUseCasesPage = ({ repository }: ProjectUseCasesPageProps) => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Awaited<ReturnType<ProjectRepository['getProject']>>>(null)
  const [error, setError] = useState<string | null>(null)
  const [useCasePendingDeletion, setUseCasePendingDeletion] = useState<string | null>(null)

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

  const handleConfirmDeleteUseCase = async () => {
    if (!useCasePendingDeletion) return
    setError(null)
    try {
      const updated = await repository.removeProjectUseCase(project.id, useCasePendingDeletion)
      if (!updated) {
        setError('Unable to delete use case. Project may have been deleted.')
        return
      }
      setProject(updated)
      setUseCasePendingDeletion(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update this project.')
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4">Use cases — {project.name}</Typography>
        <Button
          component={RouterLink}
          to={`/projects/${project.id}/use-cases/new`}
          startIcon={<AddCircleIcon />}
          variant="contained"
        >
          Add use case
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <CardContent>
          {project.useCases.length === 0 ? (
            <Typography color="text.secondary">No use cases yet. Add your first use case above.</Typography>
          ) : (
            <List>
              {project.useCases.map((useCase) => (
                <ListItem
                  key={useCase}
                  disableGutters
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        aria-label={`Edit use case: ${useCase}`}
                        onClick={() =>
                          navigate(
                            `/projects/${project.id}/use-cases/edit/${encodeURIComponent(useCase)}`,
                          )
                        }
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete use case: ${useCase}`}
                        onClick={() => setUseCasePendingDeletion(useCase)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemIcon>
                    <AutoStoriesIcon />
                  </ListItemIcon>
                  <ListItemText primary={useCase} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(useCasePendingDeletion)} onClose={() => setUseCasePendingDeletion(null)}>
        <DialogTitle>Delete use case</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to delete "${useCasePendingDeletion}" from this project?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUseCasePendingDeletion(null)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDeleteUseCase} variant="contained">
            Confirm delete use case
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default ProjectUseCasesPage
