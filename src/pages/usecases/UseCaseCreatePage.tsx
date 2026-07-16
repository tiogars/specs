import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import type { ProjectRepository } from '../../projectRepository'

type UseCaseCreatePageProps = {
  repository: ProjectRepository
}

type UseCaseFormValues = {
  useCase: string
}

const UseCaseCreatePage = ({ repository }: UseCaseCreatePageProps) => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState } = useForm<UseCaseFormValues>({
    defaultValues: { useCase: '' },
  })

  useEffect(() => {
    const id = Number(projectId)
    if (!Number.isFinite(id)) return
    repository.getProject(id).then((project) => {
      if (project) setProjectName(project.name)
    })
  }, [projectId, repository])

  const onSubmit = handleSubmit(async (values) => {
    const id = Number(projectId)
    if (!Number.isFinite(id)) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await repository.addProjectUseCase(id, values.useCase.trim())
      if (!updated) {
        setError('Unable to add use case. Project may have been deleted.')
        return
      }
      navigate(`/projects/${id}/use-cases`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add this use case.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Add use case{projectName ? ` — ${projectName}` : ''}</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="Use case"
              {...register('useCase', { required: 'Use case is required' })}
              error={Boolean(formState.errors.useCase)}
              helperText={formState.errors.useCase?.message}
            />
            <Stack direction="row" spacing={1}>
              <Button disabled={isSaving} type="submit" startIcon={<AddCircleIcon />} variant="contained">
                Add use case
              </Button>
              <Button component={RouterLink} to={`/projects/${projectId}/use-cases`} variant="outlined">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default UseCaseCreatePage
