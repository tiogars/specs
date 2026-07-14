import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Alert,
  AppBar,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import FolderIcon from '@mui/icons-material/Folder'
import GroupsIcon from '@mui/icons-material/Groups'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import HomeIcon from '@mui/icons-material/Home'
import { createPgliteProjectRepository, type ProjectRepository } from './projectRepository'
import { parseLines } from './parseLines'

type ProjectFormValues = {
  name: string
  roles: string
  useCases: string
}

function ProjectsPage({ repository }: { repository: ProjectRepository }) {
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
                <Chip color="primary" icon={<FolderIcon />} label={`${project.roles.length} roles`} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}

function ProjectDetailPage({ repository }: { repository: ProjectRepository }) {
  const { projectId } = useParams()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<Awaited<ReturnType<ProjectRepository['getProject']>>>(null)

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

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <HomeIcon fontSize="small" />
        <Link component={RouterLink} to="/">
          Back to projects
        </Link>
      </Stack>
      <Typography variant="h4">{project.name}</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Roles
          </Typography>
          <List>
            {project.roles.map((role) => (
              <ListItem key={role} disableGutters>
                <ListItemIcon>
                  <GroupsIcon />
                </ListItemIcon>
                <ListItemText primary={role} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Use cases
          </Typography>
          <List>
            {project.useCases.map((useCase) => (
              <ListItem key={useCase} disableGutters>
                <ListItemIcon>
                  <AutoStoriesIcon />
                </ListItemIcon>
                <ListItemText primary={useCase} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  )
}

function App({ repository }: { repository?: ProjectRepository }) {
  const resolvedRepository = useMemo(() => repository ?? createPgliteProjectRepository(), [repository])
  const docsHref = `${import.meta.env.BASE_URL}docs/`

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            Specs webapp
          </Typography>
          <Button component={RouterLink} to="/" startIcon={<FolderIcon />}>
            Projects
          </Button>
          <Button component="a" href={docsHref} startIcon={<AutoStoriesIcon />} target="_blank" rel="noreferrer">
            Documentation
          </Button>
        </Toolbar>
      </AppBar>
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
