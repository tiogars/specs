import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import EditIcon from '@mui/icons-material/Edit'
import LabelIcon from '@mui/icons-material/Label'
import type { DataDomainAttribute, ProjectRepository } from '../../projectRepository'

type DataDomainAttributesPageProps = {
  repository: ProjectRepository
}

const DataDomainAttributesPage = ({ repository }: DataDomainAttributesPageProps) => {
  const { projectId, domainValue } = useParams()
  const [loading, setLoading] = useState(true)
  const [projectName, setProjectName] = useState('')
  const [attributes, setAttributes] = useState<DataDomainAttribute[]>([])
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attributePendingDeletion, setAttributePendingDeletion] = useState<string | null>(null)

  const decodedDomain = domainValue ? decodeURIComponent(domainValue) : ''
  const id = Number(projectId)

  useEffect(() => {
    let cancelled = false

    if (!Number.isFinite(id) || !decodedDomain) {
      setNotFound(true)
      setLoading(false)
      return () => {
        cancelled = true
      }
    }

    setLoading(true)
    Promise.all([repository.getProject(id), repository.getDataDomainAttributes(id, decodedDomain)])
      .then(([project, attrs]) => {
        if (!cancelled) {
          if (!project) {
            setNotFound(true)
          } else {
            setProjectName(project.name)
            setAttributes(attrs)
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId, decodedDomain, repository, id])

  if (loading) return <Typography>Loading…</Typography>

  if (notFound) {
    return (
      <Alert severity="warning">
        Project not found.{' '}
        <Link component={RouterLink} to="/projects">
          Back to projects
        </Link>
      </Alert>
    )
  }

  const handleConfirmDelete = async () => {
    if (!attributePendingDeletion) return
    setError(null)
    try {
      const updated = await repository.removeDataDomainAttribute(id, decodedDomain, attributePendingDeletion)
      setAttributes(updated)
      setAttributePendingDeletion(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete attribute.')
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Attributes — {projectName}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Data domain: <strong>{decodedDomain}</strong>
          </Typography>
        </Stack>
        <Button
          component={RouterLink}
          to={`/projects/${projectId}/data-domains/${domainValue}/attributes/new`}
          startIcon={<AddCircleIcon />}
          variant="contained"
        >
          Add attribute
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <CardContent>
          {attributes.length === 0 ? (
            <Typography color="text.secondary">No attributes yet. Add your first attribute above.</Typography>
          ) : (
            <List>
              {attributes.map((attr) => (
                <ListItem
                  key={attr.name}
                  disableGutters
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        aria-label={`Edit attribute: ${attr.name}`}
                        component={RouterLink}
                        to={`/projects/${projectId}/data-domains/${domainValue}/attributes/edit/${encodeURIComponent(attr.name)}`}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete attribute: ${attr.name}`}
                        onClick={() => setAttributePendingDeletion(attr.name)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemIcon>
                    <LabelIcon />
                  </ListItemIcon>
                  <ListItemText primary={attr.name} secondary={attr.description || undefined} />
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
          to={`/projects/${projectId}/data-domains`}
          label="Back to data domains"
          clickable
          variant="outlined"
        />
      </Stack>

      <Dialog open={Boolean(attributePendingDeletion)} onClose={() => setAttributePendingDeletion(null)}>
        <DialogTitle>Delete attribute</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`Are you sure you want to delete the attribute "${attributePendingDeletion}" from this data domain?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttributePendingDeletion(null)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete} variant="contained">
            Confirm delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default DataDomainAttributesPage
