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
import FactCheckIcon from '@mui/icons-material/FactCheck'
import type { ActionType, ProjectRepository } from '../../projectRepository'

type UseCaseActionTypesPageProps = {
  repository: ProjectRepository
}

const UseCaseActionTypesPage = ({ repository }: UseCaseActionTypesPageProps) => {
  const { projectId, ucValue } = useParams()
  const [loading, setLoading] = useState(true)
  const [projectName, setProjectName] = useState('')
  const [linkedActionTypes, setLinkedActionTypes] = useState<ActionType[]>([])
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
    Promise.all([repository.getProject(id), repository.getUseCaseActionTypes(id, decodedUseCase)])
      .then(([project, actionTypes]) => {
        if (!cancelled) {
          if (!project) {
            setProjectNotFound(true)
          } else {
            setProjectName(project.name)
            setLinkedActionTypes(actionTypes)
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

  if (loading) return <Typography>Loading...</Typography>

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

  const handleRemoveActionType = async (actionType: string) => {
    setError(null)
    try {
      const updated = await repository.removeUseCaseActionType(id, decodedUseCase, actionType)
      setLinkedActionTypes(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove action type.')
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Action types - {projectName}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Use case: <strong>{decodedUseCase}</strong>
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            component={RouterLink}
            to={`/projects/${projectId}/use-cases/${ucValue}/action-types/link`}
            startIcon={<AddCircleIcon />}
            variant="outlined"
          >
            Link action type
          </Button>
          <Button
            component={RouterLink}
            to={`/projects/${projectId}/use-cases/${ucValue}/action-types/new`}
            startIcon={<AddCircleIcon />}
            variant="contained"
          >
            Create and link
          </Button>
        </Stack>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <CardContent>
          {linkedActionTypes.length === 0 ? (
            <Typography color="text.secondary">
              No action types linked to this use case yet. Use the button above to link one.
            </Typography>
          ) : (
            <List>
              {linkedActionTypes.map((actionType) => (
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
                      secondary={actionType.description || `${actionType.acceptanceCriteria.length} criteria`}
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
                      aria-label={`Remove action type link: ${actionType.name}`}
                      onClick={() => handleRemoveActionType(actionType.name)}
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
          to={`/projects/${projectId}/action-types`}
          label="Manage all action types"
          clickable
          variant="outlined"
        />
      </Stack>
    </Stack>
  )
}

export default UseCaseActionTypesPage
