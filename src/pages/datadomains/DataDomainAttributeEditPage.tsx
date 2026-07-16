import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import type { ProjectRepository } from '../../projectRepository'

type DataDomainAttributeEditPageProps = {
  repository: ProjectRepository
}

type AttributeFormValues = {
  attribute: string
  description: string
}

const DataDomainAttributeEditPage = ({ repository }: DataDomainAttributeEditPageProps) => {
  const { projectId, domainValue, attributeValue } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedDomain = domainValue ? decodeURIComponent(domainValue) : ''
  const decodedAttribute = attributeValue ? decodeURIComponent(attributeValue) : ''
  const id = Number(projectId)

  const { register, handleSubmit, formState, reset } = useForm<AttributeFormValues>({
    defaultValues: { attribute: decodedAttribute, description: '' },
  })

  useEffect(() => {
    if (!Number.isFinite(id)) return
    Promise.all([repository.getProject(id), repository.getDataDomainAttributes(id, decodedDomain)]).then(
      ([project, attrs]) => {
        if (project) setProjectName(project.name)
        const current = attrs.find((a) => a.name === decodedAttribute)
        if (current) {
          reset({ attribute: current.name, description: current.description })
        }
      },
    )
  }, [id, repository, decodedDomain, decodedAttribute, reset])

  const onSubmit = handleSubmit(async (values) => {
    if (!Number.isFinite(id)) return
    setIsSaving(true)
    setError(null)
    try {
      await repository.updateDataDomainAttribute(
        id,
        decodedDomain,
        decodedAttribute,
        values.attribute.trim(),
        values.description.trim(),
      )
      navigate(`/projects/${projectId}/data-domains/${domainValue}/attributes`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update this attribute.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Edit attribute{projectName ? ` — ${projectName}` : ''}</Typography>
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
              <Button disabled={isSaving} type="submit" startIcon={<SaveIcon />} variant="contained">
                Save attribute
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

export default DataDomainAttributeEditPage
