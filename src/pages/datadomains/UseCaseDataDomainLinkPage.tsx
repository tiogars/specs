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
import type { ProjectRepository } from '../../projectRepository'

type UseCaseDataDomainLinkPageProps = {
  repository: ProjectRepository
}

const UseCaseDataDomainLinkPage = ({ repository }: UseCaseDataDomainLinkPageProps) => {
  const { projectId, ucValue } = useParams()
  const navigate = useNavigate()
  const [projectName, setProjectName] = useState('')
  const [availableDomains, setAvailableDomains] = useState<string[]>([])
  const [linkedDomains, setLinkedDomains] = useState<string[]>([])
  const [selectedDomain, setSelectedDomain] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decodedUseCase = ucValue ? decodeURIComponent(ucValue) : ''
  const id = Number(projectId)

  useEffect(() => {
    if (!Number.isFinite(id) || !decodedUseCase) return
    Promise.all([repository.getProject(id), repository.getUseCaseDataDomains(id, decodedUseCase)]).then(
      ([project, domains]) => {
        if (project) {
          setProjectName(project.name)
          setAvailableDomains(project.dataDomains)
        }
        setLinkedDomains(domains)
      },
    )
  }, [id, decodedUseCase, repository])

  const unlinkableDomains = availableDomains.filter((d) => !linkedDomains.includes(d))

  const handleLink = async () => {
    if (!selectedDomain) return
    setIsSaving(true)
    setError(null)
    try {
      await repository.addUseCaseDataDomain(id, decodedUseCase, selectedDomain)
      navigate(`/projects/${projectId}/use-cases/${ucValue}/data-domains`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to link data domain.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">
        Link data domain{projectName ? ` — ${projectName}` : ''}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Use case: <strong>{decodedUseCase}</strong>
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {unlinkableDomains.length === 0 ? (
              <Typography color="text.secondary">
                All project data domains are already linked to this use case, or no data domains exist.{' '}
                <RouterLink to={`/projects/${projectId}/use-cases/${ucValue}/data-domains/new`}>
                  Create a new data domain
                </RouterLink>{' '}
                to link it.
              </Typography>
            ) : (
              <>
                <FormControl fullWidth>
                  <InputLabel id="domain-select-label">Data domain</InputLabel>
                  <Select
                    labelId="domain-select-label"
                    label="Data domain"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                  >
                    {unlinkableDomains.map((domain) => (
                      <MenuItem key={domain} value={domain}>
                        {domain}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                  <Button
                    disabled={isSaving || !selectedDomain}
                    onClick={handleLink}
                    startIcon={<LinkIcon />}
                    variant="contained"
                  >
                    Link data domain
                  </Button>
                  <Button
                    component={RouterLink}
                    to={`/projects/${projectId}/use-cases/${ucValue}/data-domains`}
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

export default UseCaseDataDomainLinkPage
