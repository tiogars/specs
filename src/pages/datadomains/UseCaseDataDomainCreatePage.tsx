import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import type { ProjectRepository } from '../../projectRepository'

type UseCaseDataDomainCreatePageProps = {
  repository: ProjectRepository
}

type FormValues = {
  domain: string
  description: string
}

const UseCaseDataDomainCreatePage = ({ repository }: UseCaseDataDomainCreatePageProps) => {
  const { projectId, ucValue } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedUseCase = ucValue ? decodeURIComponent(ucValue) : ''
  const id = Number(projectId)

  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { domain: '', description: '' },
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
      const trimmed = values.domain.trim()
      const description = values.description.trim()
      // Create the domain on the project, then link it to the use case
      const updated = await repository.addProjectDataDomain(id, trimmed, description)
      if (!updated) {
        setError('Unable to create data domain. Project may have been deleted.')
        return
      }
      await repository.addUseCaseDataDomain(id, decodedUseCase, trimmed)
      navigate(`/projects/${projectId}/use-cases/${ucValue}/data-domains`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create and link data domain.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        Create &amp; link data domain{projectName ? ` — ${projectName}` : ''}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Use case: <strong>{decodedUseCase}</strong>
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="Data domain"
              {...register('domain', { required: 'Data domain is required' })}
              error={Boolean(formState.errors.domain)}
              helperText={formState.errors.domain?.message}
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              {...register('description')}
            />
            <Stack direction="row" spacing={1}>
              <Button disabled={isSaving} type="submit" startIcon={<AddCircleIcon />} variant="contained">
                Create &amp; link data domain
              </Button>
              <Button
                component={RouterLink}
                to={`/projects/${projectId}/use-cases/${ucValue}/data-domains`}
                variant="outlined"
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default UseCaseDataDomainCreatePage
