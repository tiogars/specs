import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { parseLines } from '../../parseLines'
import type { ProjectRepository } from '../../projectRepository'

type UseCaseActionTypeCreatePageProps = {
  repository: ProjectRepository
}

type FormValues = {
  actionType: string
  description: string
  acceptanceCriteria: string
}

const UseCaseActionTypeCreatePage = ({ repository }: UseCaseActionTypeCreatePageProps) => {
  const { projectId, ucValue } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedUseCase = ucValue ? decodeURIComponent(ucValue) : ''
  const id = Number(projectId)

  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { actionType: '', description: '', acceptanceCriteria: '' },
  })

  useEffect(() => {
    if (!Number.isFinite(id)) return
    repository.getProject(id).then((project) => {
      if (project) setProjectName(project.name)
    })
  }, [id, repository])

  const onSubmit = handleSubmit(async (values) => {
    if (!Number.isFinite(id)) return
    setIsSaving(true)
    setError(null)
    try {
      const name = values.actionType.trim()
      const description = values.description.trim()
      const acceptanceCriteria = parseLines(values.acceptanceCriteria)
      const updated = await repository.addProjectActionType(id, name, description, acceptanceCriteria)
      if (!updated) {
        setError('Unable to create action type. Project may have been deleted.')
        return
      }
      await repository.addUseCaseActionType(id, decodedUseCase, name)
      navigate(`/projects/${projectId}/use-cases/${ucValue}/action-types`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create and link action type.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        Create and link action type{projectName ? ` - ${projectName}` : ''}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Use case: <strong>{decodedUseCase}</strong>
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="Action type"
              {...register('actionType', { required: 'Action type is required' })}
              error={Boolean(formState.errors.actionType)}
              helperText={formState.errors.actionType?.message}
            />
            <TextField label="Description" multiline minRows={2} {...register('description')} />
            <TextField
              label="Acceptance criteria (one per line)"
              multiline
              minRows={4}
              {...register('acceptanceCriteria')}
            />
            <Stack direction="row" spacing={1}>
              <Button disabled={isSaving} type="submit" startIcon={<AddCircleIcon />} variant="contained">
                Create and link action type
              </Button>
              <Button component={RouterLink} to={`/projects/${projectId}/use-cases/${ucValue}/action-types`} variant="outlined">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default UseCaseActionTypeCreatePage
