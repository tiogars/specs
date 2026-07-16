import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import type { ProjectRepository } from '../../projectRepository'

type RoleCreatePageProps = {
  repository: ProjectRepository
}

type RoleFormValues = {
  role: string
  description: string
}

const RoleCreatePage = ({ repository }: RoleCreatePageProps) => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState } = useForm<RoleFormValues>({
    defaultValues: { role: '', description: '' },
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
      const updated = await repository.addProjectRole(id, values.role.trim(), values.description.trim())
      if (!updated) {
        setError('Unable to add role. Project may have been deleted.')
        return
      }
      navigate(`/projects/${id}/roles`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add this role.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Add role{projectName ? ` — ${projectName}` : ''}</Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <TextField
              label="Role name"
              {...register('role', { required: 'Role name is required' })}
              error={Boolean(formState.errors.role)}
              helperText={formState.errors.role?.message}
            />
            <TextField label="Role description" multiline minRows={2} {...register('description')} />
            <Stack direction="row" spacing={1}>
              <Button disabled={isSaving} type="submit" startIcon={<AddCircleIcon />} variant="contained">
                Add role
              </Button>
              <Button component={RouterLink} to={`/projects/${projectId}/roles`} variant="outlined">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default RoleCreatePage
