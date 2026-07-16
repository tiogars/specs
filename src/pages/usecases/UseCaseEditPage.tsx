import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import type { ProjectRepository } from '../../projectRepository'

type UseCaseEditPageProps = {
  repository: ProjectRepository
}

type UseCaseFormValues = {
  useCase: string
  description: string
}

const UseCaseEditPage = ({ repository }: UseCaseEditPageProps) => {
  const { projectId, ucValue } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedUseCase = ucValue ? decodeURIComponent(ucValue) : ''

  const { register, handleSubmit, formState, setValue } = useForm<UseCaseFormValues>({
    defaultValues: { useCase: decodedUseCase, description: '' },
  })

  useEffect(() => {
    const id = Number(projectId)
    if (!Number.isFinite(id)) return
    repository.getProject(id).then((project) => {
      if (project) {
        setProjectName(project.name)
        const existingUseCase = project.useCases.find((useCase) => useCase.name === decodedUseCase)
        if (existingUseCase) {
          setValue('description', existingUseCase.description)
        }
      }
    })
  }, [projectId, repository, decodedUseCase, setValue])

  const onSubmit = handleSubmit(async (values) => {
    const id = Number(projectId)
    if (!Number.isFinite(id)) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await repository.updateProjectUseCase(
        id,
        decodedUseCase,
        values.useCase.trim(),
        values.description.trim(),
      )
      if (!updated) {
        setError('Unable to update use case. Project may have been deleted.')
        return
      }
      navigate(`/projects/${id}/use-cases`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update this use case.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Edit use case{projectName ? ` — ${projectName}` : ''}</Typography>
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
            <TextField label="Use case description" multiline minRows={2} {...register('description')} />
            <Stack direction="row" spacing={1}>
              <Button disabled={isSaving} type="submit" startIcon={<SaveIcon />} variant="contained">
                Save use case
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

export default UseCaseEditPage
