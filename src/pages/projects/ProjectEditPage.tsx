import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import type { ProjectRepository } from '../../projectRepository'

type ProjectEditPageProps = {
  repository: ProjectRepository
}

type ProjectFormValues = {
  name: string
  description: string
}

const ProjectEditPage = ({ repository }: ProjectEditPageProps) => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState, setValue } = useForm<ProjectFormValues>({
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    const id = Number(projectId)
    if (!Number.isFinite(id)) return
    repository.getProject(id).then((project) => {
      if (project) {
        setValue('name', project.name)
        setValue('description', project.description)
      }
    })
  }, [projectId, repository, setValue])

  const onSubmit = handleSubmit(async (values) => {
    const id = Number(projectId)
    if (!Number.isFinite(id)) return
    setIsSaving(true)
    setError(null)
    try {
      const updated = await repository.updateProject(id, values.name.trim(), values.description.trim())
      if (!updated) {
        setError('Unable to update project. It may have been deleted.')
        return
      }
      navigate(`/projects/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update this project.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Edit project</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="Project name"
              {...register('name', { required: 'Project name is required' })}
              error={Boolean(formState.errors.name)}
              helperText={formState.errors.name?.message}
            />
            <TextField label="Project description" multiline minRows={2} {...register('description')} />
            <Stack direction="row" spacing={1}>
              <Button disabled={isSaving} type="submit" startIcon={<SaveIcon />} variant="contained">
                Save project
              </Button>
              <Button component={RouterLink} to={`/projects/${projectId}`} variant="outlined">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default ProjectEditPage
