import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import type { ActionType, ProjectRepository } from '../../projectRepository'

type UseCaseActionTypeLinkPageProps = {
  repository: ProjectRepository
}

const UseCaseActionTypeLinkPage = ({ repository }: UseCaseActionTypeLinkPageProps) => {
  const { projectId, ucValue } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [availableActionTypes, setAvailableActionTypes] = useState<ActionType[]>([])
  const [linkedActionTypes, setLinkedActionTypes] = useState<ActionType[]>([])
  const [selectedActionType, setSelectedActionType] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedUseCase = ucValue ? decodeURIComponent(ucValue) : ''
  const id = Number(projectId)

  useEffect(() => {
    if (!Number.isFinite(id) || !decodedUseCase) return
    Promise.all([repository.getProject(id), repository.getUseCaseActionTypes(id, decodedUseCase)]).then(
      ([project, actionTypes]) => {
        if (project) {
          setProjectName(project.name)
          setAvailableActionTypes(project.actionTypes)
        }
        setLinkedActionTypes(actionTypes)
      },
    )
  }, [id, decodedUseCase, repository])

  const linkableActionTypes = availableActionTypes.filter(
    (actionType) => !linkedActionTypes.some((linkedActionType) => linkedActionType.name === actionType.name),
  )

  const handleLink = async () => {
    if (!selectedActionType) return
    setIsSaving(true)
    setError(null)
    try {
      await repository.addUseCaseActionType(id, decodedUseCase, selectedActionType)
      navigate(`/projects/${projectId}/use-cases/${ucValue}/action-types`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to link action type.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        Link action type{projectName ? ` - ${projectName}` : ''}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Use case: <strong>{decodedUseCase}</strong>
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {linkableActionTypes.length === 0 ? (
              <Typography color="text.secondary">
                All project action types are already linked to this use case, or no action types exist.{' '}
                <RouterLink to={`/projects/${projectId}/use-cases/${ucValue}/action-types/new`}>Create and link a new action type</RouterLink>{' '}
                or manage action types at{' '}
                <RouterLink to={`/projects/${projectId}/action-types/new`}>project action types</RouterLink>.
              </Typography>
            ) : (
              <>
                <FormControl fullWidth>
                  <InputLabel id="action-type-select-label">Action type</InputLabel>
                  <Select
                    labelId="action-type-select-label"
                    label="Action type"
                    value={selectedActionType}
                    onChange={(e) => setSelectedActionType(e.target.value)}
                  >
                    {linkableActionTypes.map((actionType) => (
                      <MenuItem key={actionType.name} value={actionType.name}>
                        {actionType.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                  <Button
                    disabled={isSaving || !selectedActionType}
                    onClick={handleLink}
                    startIcon={<LinkIcon />}
                    variant="contained"
                  >
                    Link action type
                  </Button>
                  <Button
                    component={RouterLink}
                    to={`/projects/${projectId}/use-cases/${ucValue}/action-types`}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default UseCaseActionTypeLinkPage
