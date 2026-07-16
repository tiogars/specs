import { useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { createPgliteProjectRepository } from '../projectRepository'
import AppDrawer, { DRAWER_WIDTH } from '../components/AppDrawer'
import Header from '../components/Header'
import ProjectsListPage from '../pages/projects/ProjectsListPage'
import ProjectCreatePage from '../pages/projects/ProjectCreatePage'
import ProjectDetailPage from '../pages/projects/ProjectDetailPage'
import ProjectRolesPage from '../pages/roles/ProjectRolesPage'
import RoleCreatePage from '../pages/roles/RoleCreatePage'
import RoleEditPage from '../pages/roles/RoleEditPage'
import ProjectUseCasesPage from '../pages/usecases/ProjectUseCasesPage'
import UseCaseCreatePage from '../pages/usecases/UseCaseCreatePage'
import UseCaseEditPage from '../pages/usecases/UseCaseEditPage'
import ProjectDataDomainsPage from '../pages/datadomains/ProjectDataDomainsPage'
import DataDomainCreatePage from '../pages/datadomains/DataDomainCreatePage'
import DataDomainEditPage from '../pages/datadomains/DataDomainEditPage'
import UseCaseDataDomainsPage from '../pages/datadomains/UseCaseDataDomainsPage'
import UseCaseDataDomainLinkPage from '../pages/datadomains/UseCaseDataDomainLinkPage'
import UseCaseDataDomainCreatePage from '../pages/datadomains/UseCaseDataDomainCreatePage'
import Footer from '../components/Footer'
import type { AppProps } from './App.types'

const App = ({ repository }: AppProps) => {
  const resolvedRepository = useMemo(() => repository ?? createPgliteProjectRepository(), [repository])
  const docsHref = `${import.meta.env.BASE_URL}docs/`
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex' }}>
      <Header
        docsHref={docsHref}
        repository={resolvedRepository}
        showMenuButton={isMobile}
        onMenuClick={() => setDrawerOpen(true)}
      />

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
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          mt: 8,
          ...(isMobile ? {} : { ml: `${DRAWER_WIDTH}px` }),
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
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
            <Route
              path="/projects/:projectId/use-cases/:ucValue/data-domains"
              element={<UseCaseDataDomainsPage repository={resolvedRepository} />}
            />
            <Route
              path="/projects/:projectId/use-cases/:ucValue/data-domains/link"
              element={<UseCaseDataDomainLinkPage repository={resolvedRepository} />}
            />
            <Route
              path="/projects/:projectId/use-cases/:ucValue/data-domains/new"
              element={<UseCaseDataDomainCreatePage repository={resolvedRepository} />}
            />
            <Route
              path="/projects/:projectId/data-domains"
              element={<ProjectDataDomainsPage repository={resolvedRepository} />}
            />
            <Route
              path="/projects/:projectId/data-domains/new"
              element={<DataDomainCreatePage repository={resolvedRepository} />}
            />
            <Route
              path="/projects/:projectId/data-domains/edit/:domainValue"
              element={<DataDomainEditPage repository={resolvedRepository} />}
            />
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Box>
  )
}

export default App

