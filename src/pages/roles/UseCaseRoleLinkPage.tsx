import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import type { ProjectRepository, Role } from '../../projectRepository'

type UseCaseRoleLinkPageProps = {
  repository: ProjectRepository
}

const UseCaseRoleLinkPage = ({ repository }: UseCaseRoleLinkPageProps) => {
  const { projectId, ucValue } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [linkedRoles, setLinkedRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedUseCase = ucValue ? decodeURIComponent(ucValue) : ''
  const id = Number(projectId)

  useEffect(() => {
    if (!Number.isFinite(id) || !decodedUseCase) return
    Promise.all([repository.getProject(id), repository.getUseCaseRoles(id, decodedUseCase)]).then(
      ([project, roles]) => {
        if (project) {
          setProjectName(project.name)
          setAvailableRoles(project.roles)
        }
        setLinkedRoles(roles)
      },
    )
  }, [id, decodedUseCase, repository])

  const linkableRoles = availableRoles.filter((role) => !linkedRoles.some((linkedRole) => linkedRole.name === role.name))

  const handleLink = async () => {
    if (!selectedRole) return
    setIsSaving(true)
    setError(null)
    try {
      await repository.addUseCaseRole(id, decodedUseCase, selectedRole)
      navigate(`/projects/${projectId}/use-cases/${ucValue}/roles`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to link role.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        Link role{projectName ? ` - ${projectName}` : ''}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Use case: <strong>{decodedUseCase}</strong>
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {linkableRoles.length === 0 ? (
              <Typography color="text.secondary">
                All project roles are already linked to this use case, or no roles exist.{' '}
                <RouterLink to={`/projects/${projectId}/roles/new`}>Add a new role</RouterLink> and then link it.
              </Typography>
            ) : (
              <>
                <FormControl fullWidth>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    label="Role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    {linkableRoles.map((role) => (
                      <MenuItem key={role.name} value={role.name}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                  <Button
                    disabled={isSaving || !selectedRole}
                    onClick={handleLink}
                    startIcon={<LinkIcon />}
                    variant="contained"
                  >
                    Link role
                  </Button>
                  <Button
                    component={RouterLink}
                    to={`/projects/${projectId}/use-cases/${ucValue}/roles`}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default UseCaseRoleLinkPage
