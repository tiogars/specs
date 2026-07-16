import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import type { ProjectRepository } from '../../projectRepository'
import { parseLines } from '../../parseLines'

type ProjectCreatePageProps = {
  repository: ProjectRepository
}

type ProjectFormValues = {
  name: string
  roles: string
  useCases: string
}

const ProjectCreatePage = ({ repository }: ProjectCreatePageProps) => {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState } = useForm<ProjectFormValues>({
    defaultValues: { name: '', roles: '', useCases: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true)
    setError(null)

    try {
      const project = await repository.createProject({
        name: values.name.trim(),
        roles: parseLines(values.roles),
        useCases: parseLines(values.useCases),
      })
      navigate(`/projects/${project.id}`)
    } catch {
      setError('Unable to save this project locally.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Create a project</Typography>
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
            <TextField
              label="Roles (one per line)"
              multiline
              minRows={3}
              {...register('roles', { required: 'At least one role is required' })}
              error={Boolean(formState.errors.roles)}
              helperText={formState.errors.roles?.message}
            />
            <TextField
              label="Use cases (one per line)"
              multiline
              minRows={3}
              {...register('useCases', { required: 'At least one use case is required' })}
              error={Boolean(formState.errors.useCases)}
              helperText={formState.errors.useCases?.message}
            />
            <Button disabled={isSaving} type="submit" startIcon={<AddCircleIcon />} variant="contained">
              Save project
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default ProjectCreatePage
