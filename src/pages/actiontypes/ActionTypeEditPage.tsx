import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { parseLines } from '../../parseLines'
import type { ProjectRepository } from '../../projectRepository'

type ActionTypeEditPageProps = {
  repository: ProjectRepository
}

type ActionTypeFormValues = {
  actionType: string
  description: string
  acceptanceCriteria: string
}

const ActionTypeEditPage = ({ repository }: ActionTypeEditPageProps) => {
  const { projectId, actionTypeValue } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedActionType = actionTypeValue ? decodeURIComponent(actionTypeValue) : ''

  const { register, handleSubmit, formState, reset } = useForm<ActionTypeFormValues>({
    defaultValues: { actionType: decodedActionType, description: '', acceptanceCriteria: '' },
  })

  useEffect(() => {
    const id = Number(projectId)
    if (!Number.isFinite(id)) return
    repository.getProject(id).then((project) => {
      if (project) {
        setProjectName(project.name)
        const current = project.actionTypes.find((a) => a.name === decodedActionType)
        if (current) {
          reset({
            actionType: current.name,
            description: current.description,
            acceptanceCriteria: current.acceptanceCriteria.join('\n'),
          })
        }
      }
    })
  }, [projectId, repository, decodedActionType, reset])

  const onSubmit = handleSubmit(async (values) => {
    const id = Number(projectId)
    if (!Number.isFinite(id)) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await repository.updateProjectActionType(
        id,
        decodedActionType,
        values.actionType.trim(),
        values.description.trim(),
        parseLines(values.acceptanceCriteria),
      )
      if (!updated) {
        setError('Unable to update action type. Project may have been deleted.')
        return
      }
      navigate(`/projects/${id}/action-types`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update this action type.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Edit action type{projectName ? ` — ${projectName}` : ''}</Typography>
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
              <Button disabled={isSaving} type="submit" startIcon={<SaveIcon />} variant="contained">
                Save action type
              </Button>
              <Button component={RouterLink} to={`/projects/${projectId}/action-types`} variant="outlined">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default ActionTypeEditPage
