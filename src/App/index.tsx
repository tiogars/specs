import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import EditIcon from '@mui/icons-material/Edit'
import FolderIcon from '@mui/icons-material/Folder'
import GroupsIcon from '@mui/icons-material/Groups'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import HomeIcon from '@mui/icons-material/Home'
import { createPgliteProjectRepository, type ProjectRepository } from '../projectRepository'
import { parseLines } from '../parseLines'
import { generateProjectDocZip, toSlug } from '../generateProjectDocZip'
import Header from '../components/Header'
import type { AppProps, ProjectDetailPageProps, ProjectFormValues, ProjectsPageProps } from './App.types'

const ProjectsPage = ({ repository }: ProjectsPageProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [projects, setProjects] = useState<Awaited<ReturnType<ProjectRepository['listProjects']>>>([])
  const [loading, setLoading] = useState(true)

  const { register, reset, handleSubmit, formState } = useForm<ProjectFormValues>({
    defaultValues: {
      name: '',
      roles: '',
      useCases: '',
    },
  })

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    repository
      .listProjects()
      .then((value) => {
        if (!cancelled) {
          setProjects(value)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load projects. Try again.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [refreshKey, repository])

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true)
    setError(null)

    try {
      await repository.createProject({
        name: values.name.trim(),
        roles: parseLines(values.roles),
        useCases: parseLines(values.useCases),
      })
      reset()
      setRefreshKey((current) => current + 1)
    } catch {
      setError('Unable to save this project locally.')
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Project specs builder</Typography>
      <Typography color="text.secondary">
        Describe each project through roles and use cases. Everything is stored locally with PGlite so it works offline.
      </Typography>

      <Card>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={onSubmit}>
            <Typography variant="h6">Create a project</Typography>
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

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Stack spacing={2}>
        <Typography variant="h6">Saved projects</Typography>
        {loading ? <Typography>Loading projects…</Typography> : null}
        {!loading && projects.length === 0 ? (
          <Typography color="text.secondary">No projects yet. Create your first project above.</Typography>
        ) : null}
        {projects.map((project) => (
          <Card key={project.id} variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography component={RouterLink} to={`/projects/${project.id}`} sx={{ textDecoration: 'none' }} variant="h6">
                  {project.name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  {project.isDefault ? (
                    <Tooltip title="This project describes the webapp itself and is reset on each deploy">
                      <Chip color="secondary" label="Default" size="small" />
                    </Tooltip>
                  ) : null}
                  <Chip color="primary" icon={<FolderIcon />} label={`${project.roles.length} roles`} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}

const ProjectDetailPage = ({ repository }: ProjectDetailPageProps) => {
  const { projectId } = useParams()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Awaited<ReturnType<ProjectRepository['getProject']>>>(null)
  const [newRole, setNewRole] = useState('')
  const [newUseCase, setNewUseCase] = useState('')
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [editedRoleValue, setEditedRoleValue] = useState('')
  const [rolePendingDeletion, setRolePendingDeletion] = useState<string | null>(null)
  const [editingUseCase, setEditingUseCase] = useState<string | null>(null)
  const [editedUseCaseValue, setEditedUseCaseValue] = useState('')
  const [useCasePendingDeletion, setUseCasePendingDeletion] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const id = Number(projectId)

    if (!Number.isFinite(id)) {
      setProject(null)
      setLoading(false)
      return () => {
        cancelled = true
      }
    }

    setLoading(true)
    repository
      .getProject(id)
      .then((value) => {
        if (!cancelled) {
          setProject(value)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [projectId, repository])

  if (loading) {
    return <Typography>Loading project…</Typography>
  }

  if (!project) {
    return (
      <Alert severity="warning">
        Project not found. <Link component={RouterLink} to="/">Back to projects</Link>
      </Alert>
    )
  }

  const handleAddRole = async () => {
    if (!newRole.trim()) {
      return
    }

    setSaveError(null)

    try {
      const updatedProject = await repository.addProjectRole(project.id, newRole)
      if (!updatedProject) {
        setSaveError('Project not found.')
        return
      }

      setProject(updatedProject)
      setNewRole('')
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSaveError(error.message)
        return
      }

      setSaveError('Unable to update this project.')
    }
  }

  const handleStartEditRole = (role: string) => {
    setSaveError(null)
    setEditingRole(role)
    setEditedRoleValue(role)
  }

  const handleCancelEditRole = () => {
    setEditingRole(null)
    setEditedRoleValue('')
  }

  const handleSaveEditedRole = async () => {
    if (!editingRole) {
      return
    }

    setSaveError(null)

    try {
      const updatedProject = await repository.updateProjectRole(project.id, editingRole, editedRoleValue)
      if (!updatedProject) {
        setSaveError('Project not found.')
        return
      }

      setProject(updatedProject)
      setEditingRole(null)
      setEditedRoleValue('')
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSaveError(error.message)
        return
      }

      setSaveError('Unable to update this project.')
    }
  }

  const handleRequestDeleteRole = (role: string) => {
    setSaveError(null)
    setRolePendingDeletion(role)
  }

  const handleCancelDeleteRole = () => {
    setRolePendingDeletion(null)
  }

  const handleConfirmDeleteRole = async () => {
    if (!rolePendingDeletion) {
      return
    }

    setSaveError(null)

    try {
      const updatedProject = await repository.removeProjectRole(project.id, rolePendingDeletion)
      if (!updatedProject) {
        setSaveError('Project not found.')
        return
      }

      setProject(updatedProject)
      if (editingRole === rolePendingDeletion) {
        setEditingRole(null)
        setEditedRoleValue('')
      }
      setRolePendingDeletion(null)
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSaveError(error.message)
        return
      }

      setSaveError('Unable to update this project.')
    }
  }

  const handleAddUseCase = async () => {
    if (!newUseCase.trim()) {
      return
    }

    setSaveError(null)

    try {
      const updatedProject = await repository.addProjectUseCase(project.id, newUseCase)
      if (!updatedProject) {
        setSaveError('Project not found.')
        return
      }

      setProject(updatedProject)
      setNewUseCase('')
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSaveError(error.message)
        return
      }

      setSaveError('Unable to update this project.')
    }
  }

  const handleStartEditUseCase = (useCase: string) => {
    setSaveError(null)
    setEditingUseCase(useCase)
    setEditedUseCaseValue(useCase)
  }

  const handleCancelEditUseCase = () => {
    setEditingUseCase(null)
    setEditedUseCaseValue('')
  }

  const handleSaveEditedUseCase = async () => {
    if (!editingUseCase) {
      return
    }

    setSaveError(null)

    try {
      const updatedProject = await repository.updateProjectUseCase(project.id, editingUseCase, editedUseCaseValue)
      if (!updatedProject) {
        setSaveError('Project not found.')
        return
      }

      setProject(updatedProject)
      setEditingUseCase(null)
      setEditedUseCaseValue('')
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSaveError(error.message)
        return
      }

      setSaveError('Unable to update this project.')
    }
  }

  const handleRequestDeleteUseCase = (useCase: string) => {
    setSaveError(null)
    setUseCasePendingDeletion(useCase)
  }

  const handleCancelDeleteUseCase = () => {
    setUseCasePendingDeletion(null)
  }

  const handleConfirmDeleteUseCase = async () => {
    if (!useCasePendingDeletion) {
      return
    }

    setSaveError(null)

    try {
      const updatedProject = await repository.removeProjectUseCase(project.id, useCasePendingDeletion)
      if (!updatedProject) {
        setSaveError('Project not found.')
        return
      }

      setProject(updatedProject)
      if (editingUseCase === useCasePendingDeletion) {
        setEditingUseCase(null)
        setEditedUseCaseValue('')
      }
      setUseCasePendingDeletion(null)
    } catch (error) {
      if (error instanceof Error && error.message) {
        setSaveError(error.message)
        return
      }

      setSaveError('Unable to update this project.')
    }
  }

  const handleDownloadDocs = async () => {
    if (!project) {
      return
    }

    setIsDownloading(true)

    try {
      const zipBuffer = await generateProjectDocZip(project)
      const blob = new Blob([zipBuffer], { type: 'application/zip' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${toSlug(project.name) || 'project'}.zip`
      anchor.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <HomeIcon fontSize="small" />
        <Link component={RouterLink} to="/">
          Back to projects
        </Link>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>{project.name}</Typography>
        <Tooltip title="Download documentation as ZIP">
          <span>
            <Button
              disabled={isDownloading}
              onClick={handleDownloadDocs}
              startIcon={<DownloadIcon />}
              variant="outlined"
            >
              Download docs
            </Button>
          </span>
        </Tooltip>
      </Stack>
      {saveError ? <Alert severity="error">{saveError}</Alert> : null}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Roles
          </Typography>
          <List>
            {project.roles.map((role) => (
              <ListItem
                key={role}
                disableGutters
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton aria-label={`Edit role: ${role}`} onClick={() => handleStartEditRole(role)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label={`Delete role: ${role}`} onClick={() => handleRequestDeleteRole(role)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemIcon>
                  <GroupsIcon />
                </ListItemIcon>
                <ListItemText primary={role} />
              </ListItem>
            ))}
          </List>
          {editingRole ? (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Edit role"
                size="small"
                value={editedRoleValue}
                onChange={(event) => setEditedRoleValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleSaveEditedRole()
                  }
                }}
              />
              <Button variant="outlined" onClick={handleSaveEditedRole}>
                Save
              </Button>
              <Button variant="text" onClick={handleCancelEditRole}>
                Cancel
              </Button>
            </Stack>
          ) : null}
          <Stack direction="row" spacing={1}>
            <TextField
              label="New role"
              size="small"
              value={newRole}
              onChange={(event) => setNewRole(event.target.value)}
            />
            <Button variant="outlined" onClick={handleAddRole}>
              Add role
            </Button>
          </Stack>
          <Dialog open={Boolean(rolePendingDeletion)} onClose={handleCancelDeleteRole}>
            <DialogTitle>Delete role</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {`Are you sure you want to delete "${rolePendingDeletion}" from this project?`}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDeleteRole}>Cancel</Button>
              <Button color="error" onClick={handleConfirmDeleteRole} variant="contained">
                Confirm delete role
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Use cases
          </Typography>
          <List>
            {project.useCases.map((useCase) => (
              <ListItem
                key={useCase}
                disableGutters
                secondaryAction={
                  <Stack direction="row" spacing={1}>
                    <IconButton aria-label={`Edit use case: ${useCase}`} onClick={() => handleStartEditUseCase(useCase)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label={`Delete use case: ${useCase}`}
                      onClick={() => handleRequestDeleteUseCase(useCase)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemIcon>
                  <AutoStoriesIcon />
                </ListItemIcon>
                <ListItemText primary={useCase} />
              </ListItem>
            ))}
          </List>
          {editingUseCase ? (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                label="Edit use case"
                size="small"
                value={editedUseCaseValue}
                onChange={(event) => setEditedUseCaseValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    void handleSaveEditedUseCase()
                  }
                }}
              />
              <Button variant="outlined" onClick={handleSaveEditedUseCase}>
                Save
              </Button>
              <Button variant="text" onClick={handleCancelEditUseCase}>
                Cancel
              </Button>
            </Stack>
          ) : null}
          <Stack direction="row" spacing={1}>
            <TextField
              label="New use case"
              size="small"
              value={newUseCase}
              onChange={(event) => setNewUseCase(event.target.value)}
            />
            <Button variant="outlined" onClick={handleAddUseCase}>
              Add use case
            </Button>
          </Stack>
          <Dialog open={Boolean(useCasePendingDeletion)} onClose={handleCancelDeleteUseCase}>
            <DialogTitle>Delete use case</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {`Are you sure you want to delete "${useCasePendingDeletion}" from this project?`}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDeleteUseCase}>Cancel</Button>
              <Button color="error" onClick={handleConfirmDeleteUseCase} variant="contained">
                Confirm delete use case
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Stack>
  )
}

const App = ({ repository }: AppProps) => {
  const resolvedRepository = useMemo(() => repository ?? createPgliteProjectRepository(), [repository])
  const docsHref = `${import.meta.env.BASE_URL}docs/`

  return (
    <>
      <Header docsHref={docsHref} />
      <Container sx={{ py: 4 }} maxWidth="md">
        <Routes>
          <Route path="/" element={<ProjectsPage repository={resolvedRepository} />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage repository={resolvedRepository} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
