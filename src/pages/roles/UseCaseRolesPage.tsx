import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import GroupsIcon from '@mui/icons-material/Groups'
import type { ProjectRepository, Role } from '../../projectRepository'

type UseCaseRolesPageProps = {
  repository: ProjectRepository
}

const UseCaseRolesPage = ({ repository }: UseCaseRolesPageProps) => {
  const { projectId, ucValue } = useParams()
  const [loading, setLoading] = useState(true)
  const [projectName, setProjectName] = useState('')
  const [linkedRoles, setLinkedRoles] = useState<Role[]>([])
  const [projectNotFound, setProjectNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedUseCase = ucValue ? decodeURIComponent(ucValue) : ''

  useEffect(() => {
    let cancelled = false
    const id = Number(projectId)

    if (!Number.isFinite(id) || !decodedUseCase) {
      setProjectNotFound(true)
      setLoading(false)
      return () => {
        cancelled = true
      }
    }

    setLoading(true)
    Promise.all([repository.getProject(id), repository.getUseCaseRoles(id, decodedUseCase)])
      .then(([project, roles]) => {
        if (!cancelled) {
          if (!project) {
            setProjectNotFound(true)
          } else {
            setProjectName(project.name)
            setLinkedRoles(roles)
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId, decodedUseCase, repository])

  if (loading) return <Typography>Loading...</Typography>

  if (projectNotFound) {
    return (
      <Alert severity="warning">
        Project not found.{' '}
        <Link component={RouterLink} to="/projects">
          Back to projects
        </Link>
      </Alert>
    )
  }

  const id = Number(projectId)

  const handleRemoveRole = async (role: string) => {
    setError(null)
    try {
      const updated = await repository.removeUseCaseRole(id, decodedUseCase, role)
      setLinkedRoles(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove role.')
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Roles - {projectName}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Use case: <strong>{decodedUseCase}</strong>
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            component={RouterLink}
            to={`/projects/${projectId}/use-cases/${ucValue}/roles/link`}
            startIcon={<AddCircleIcon />}
            variant="contained"
          >
            Link role
          </Button>
        </Stack>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <CardContent>
          {linkedRoles.length === 0 ? (
            <Typography color="text.secondary">
              No roles linked to this use case yet. Use the button above to link one.
            </Typography>
          ) : (
            <List>
              {linkedRoles.map((role) => (
                <ListItem
                  key={role.name}
                  disableGutters
                  secondaryAction={
                    <IconButton
                      aria-label={`Remove role link: ${role.name}`}
                      onClick={() => handleRemoveRole(role.name)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <GroupsIcon />
                  </ListItemIcon>
                  <ListItemText primary={role.name} secondary={role.description || undefined} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Divider />
      <Stack direction="row" spacing={1}>
        <Chip
          component={RouterLink}
          to={`/projects/${projectId}/use-cases`}
          label="Back to use cases"
          clickable
          variant="outlined"
        />
        <Chip
          component={RouterLink}
          to={`/projects/${projectId}/roles`}
          label="Manage all roles"
          clickable
          variant="outlined"
        />
      </Stack>
    </Stack>
  )
}

export default UseCaseRolesPage
