import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import type { ProjectRepository } from '../../projectRepository'

type DataDomainCreatePageProps = {
  repository: ProjectRepository
}

type DataDomainFormValues = {
  domain: string
  description: string
}

const DataDomainCreatePage = ({ repository }: DataDomainCreatePageProps) => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState } = useForm<DataDomainFormValues>({
    defaultValues: { domain: '', description: '' },
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
      const updated = await repository.addProjectDataDomain(id, values.domain.trim(), values.description.trim())
      if (!updated) {
        setError('Unable to add data domain. Project may have been deleted.')
        return
      }
      navigate(`/projects/${id}/data-domains`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add this data domain.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Add data domain{projectName ? ` — ${projectName}` : ''}</Typography>
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
                Add data domain
              </Button>
              <Button component={RouterLink} to={`/projects/${projectId}/data-domains`} variant="outlined">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default DataDomainCreatePage
