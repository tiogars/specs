import { useEffect, useState } from 'react'
import { useNavigate, useMatch } from 'react-router-dom'
import { AppBar, IconButton, MenuItem, Select, Toolbar, Tooltip, Typography, useScrollTrigger } from '@mui/material'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import MenuIcon from '@mui/icons-material/Menu'
import type { Project } from '../../projectRepository'
import type { HeaderProps } from './Header.types'

const Header = ({ docsHref, repository, showMenuButton = false, onMenuClick }: HeaderProps) => {
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 0 })
  const navigate = useNavigate()
  const projectMatch = useMatch('/projects/:id/*')
  const currentProjectId = projectMatch?.params.id ?? ''
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    let cancelled = false
    repository.listProjects().then((list) => {
      if (!cancelled) setProjects(list)
    })
    return () => {
      cancelled = true
    }
  }, [repository])

  return (
    <AppBar position="fixed" color="default" elevation={trigger ? 4 : 0}>
      <Toolbar>
        {showMenuButton && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open navigation menu"
            onClick={onMenuClick}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" sx={{ mr: 2, flexShrink: 0 }}>
          Specs
        </Typography>
        <Select
          value={currentProjectId}
          displayEmpty
          size="small"
          onChange={(e) => {
            const id = e.target.value
            if (id) navigate(`/projects/${id}`)
          }}
          renderValue={(value) => {
            if (!value) return <em>Select project</em>
            const project = projects.find((p) => String(p.id) === value)
            return project?.name ?? value
          }}
          sx={{ minWidth: 160, maxWidth: 300, flexGrow: 1, mr: 'auto' }}
          inputProps={{ 'aria-label': 'Select project' }}
        >
          {projects.map((project) => (
            <MenuItem key={project.id} value={String(project.id)}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
        <Tooltip title="Documentation">
          <IconButton
            component="a"
            href={docsHref}
            target="_blank"
            rel="noreferrer"
            color="inherit"
            aria-label="Documentation"
          >
            <AutoStoriesIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}

export default Header
