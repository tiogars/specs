import { useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppBar, Box, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import MenuIcon from '@mui/icons-material/Menu'
import { createPgliteProjectRepository } from '../projectRepository'
import AppDrawer, { DRAWER_WIDTH } from '../components/AppDrawer'
import ProjectsListPage from '../pages/projects/ProjectsListPage'
import ProjectCreatePage from '../pages/projects/ProjectCreatePage'
import ProjectDetailPage from '../pages/projects/ProjectDetailPage'
import ProjectRolesPage from '../pages/roles/ProjectRolesPage'
import RoleCreatePage from '../pages/roles/RoleCreatePage'
import RoleEditPage from '../pages/roles/RoleEditPage'
import ProjectUseCasesPage from '../pages/usecases/ProjectUseCasesPage'
import UseCaseCreatePage from '../pages/usecases/UseCaseCreatePage'
import UseCaseEditPage from '../pages/usecases/UseCaseEditPage'
import type { AppProps } from './App.types'

const App = ({ repository }: AppProps) => {
  const resolvedRepository = useMemo(() => repository ?? createPgliteProjectRepository(), [repository])
  const docsHref = `${import.meta.env.BASE_URL}docs/`
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex' }}>
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{ zIndex: theme.zIndex.drawer + 1 }}
          color="transparent"
          elevation={0}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open navigation menu"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Specs
            </Typography>
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
          </Toolbar>
        </AppBar>
      )}

      <AppDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          maxWidth: 'md',
          ...(isMobile ? { mt: 8 } : { ml: `${DRAWER_WIDTH}px` }),
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsListPage repository={resolvedRepository} />} />
          <Route path="/projects/new" element={<ProjectCreatePage repository={resolvedRepository} />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage repository={resolvedRepository} />} />
          <Route
            path="/projects/:projectId/roles"
            element={<ProjectRolesPage repository={resolvedRepository} />}
          />
          <Route
            path="/projects/:projectId/roles/new"
            element={<RoleCreatePage repository={resolvedRepository} />}
          />
          <Route
            path="/projects/:projectId/roles/edit/:roleValue"
            element={<RoleEditPage repository={resolvedRepository} />}
          />
          <Route
            path="/projects/:projectId/use-cases"
            element={<ProjectUseCasesPage repository={resolvedRepository} />}
          />
          <Route
            path="/projects/:projectId/use-cases/new"
            element={<UseCaseCreatePage repository={resolvedRepository} />}
          />
          <Route
            path="/projects/:projectId/use-cases/edit/:ucValue"
            element={<UseCaseEditPage repository={resolvedRepository} />}
          />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
