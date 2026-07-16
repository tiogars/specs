import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import type { ProjectRepository } from '../../projectRepository'

type DataDomainAttributeCreatePageProps = {
  repository: ProjectRepository
}

type AttributeFormValues = {
  attribute: string
  description: string
}

const DataDomainAttributeCreatePage = ({ repository }: DataDomainAttributeCreatePageProps) => {
  const { projectId, domainValue } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedDomain = domainValue ? decodeURIComponent(domainValue) : ''
  const id = Number(projectId)

  const { register, handleSubmit, formState } = useForm<AttributeFormValues>({
    defaultValues: { attribute: '', description: '' },
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
      await repository.addDataDomainAttribute(id, decodedDomain, values.attribute.trim(), values.description.trim())
      navigate(`/projects/${projectId}/data-domains/${domainValue}/attributes`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add this attribute.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Add attribute{projectName ? ` — ${projectName}` : ''}</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Data domain: <strong>{decodedDomain}</strong>
        </Typography>
      </Stack>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="Attribute name"
              {...register('attribute', { required: 'Attribute name is required' })}
              error={Boolean(formState.errors.attribute)}
              helperText={formState.errors.attribute?.message}
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              {...register('description')}
            />
            <Stack direction="row" spacing={1}>
              <Button disabled={isSaving} type="submit" startIcon={<AddCircleIcon />} variant="contained">
                Add attribute
              </Button>
              <Button
                component={RouterLink}
                to={`/projects/${projectId}/data-domains/${domainValue}/attributes`}
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

export default DataDomainAttributeCreatePage
