import { Link as RouterLink, useLocation, useMatch } from 'react-router-dom'
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import FolderIcon from '@mui/icons-material/Folder'
import GroupsIcon from '@mui/icons-material/Groups'
import ListIcon from '@mui/icons-material/List'

export const DRAWER_WIDTH = 240

type AppDrawerProps = {
  open: boolean
  onClose: () => void
  variant: 'temporary' | 'permanent'
}

type NavItem = {
  label: string
  icon: React.ReactNode
  to: string
  disabled?: boolean
  disabledReason?: string
}

type NavSection = {
  title: string
  items: NavItem[]
}

const AppDrawer = ({ open, onClose, variant }: AppDrawerProps) => {
  const location = useLocation()
  const projectMatch = useMatch('/projects/:id/*')
  const projectId = projectMatch?.params.id

  const sections: NavSection[] = [
    {
      title: 'Projects',
      items: [
        { label: 'All projects', icon: <ListIcon />, to: '/projects' },
        { label: 'Create project', icon: <AddCircleIcon />, to: '/projects/new' },
      ],
    },
    {
      title: 'Roles',
      items: [
        {
          label: 'View roles',
          icon: <GroupsIcon />,
          to: projectId ? `/projects/${projectId}/roles` : '/projects',
          disabled: !projectId,
          disabledReason: 'Select a project first',
        },
        {
          label: 'Add role',
          icon: <AddCircleIcon />,
          to: projectId ? `/projects/${projectId}/roles/new` : '/projects',
          disabled: !projectId,
          disabledReason: 'Select a project first',
        },
      ],
    },
    {
      title: 'Use cases',
      items: [
        {
          label: 'View use cases',
          icon: <AutoStoriesIcon />,
          to: projectId ? `/projects/${projectId}/use-cases` : '/projects',
          disabled: !projectId,
          disabledReason: 'Select a project first',
        },
        {
          label: 'Add use case',
          icon: <AddCircleIcon />,
          to: projectId ? `/projects/${projectId}/use-cases/new` : '/projects',
          disabled: !projectId,
          disabledReason: 'Select a project first',
        },
      ],
    },
  ]

  const drawerContent = (
    <Box>
      <Toolbar>
        <FolderIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap>
          Specs
        </Typography>
      </Toolbar>
      <Divider />
      {sections.map((section, index) => (
        <Box key={section.title}>
          {index > 0 && <Divider />}
          <Typography
            variant="overline"
            sx={{ px: 2, pt: 1.5, pb: 0.5, display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}
          >
            {section.title}
          </Typography>
          <List disablePadding>
            {section.items.map((item) => {
              const isSelected = location.pathname === item.to && !item.disabled
              const button = (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    component={item.disabled ? 'div' : RouterLink}
                    to={item.disabled ? undefined : item.to}
                    selected={isSelected}
                    disabled={item.disabled}
                    onClick={item.disabled ? undefined : onClose}
                    sx={{ borderRadius: 1, mx: 0.5, my: 0.25 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} slotProps={{ primary: { variant: 'body2' } }} />
                  </ListItemButton>
                </ListItem>
              )

              return item.disabled && item.disabledReason ? (
                <Tooltip key={item.label} title={item.disabledReason} placement="right">
                  <span>{button}</span>
                </Tooltip>
              ) : (
                button
              )
            })}
          </List>
        </Box>
      ))}
    </Box>
  )

  return (
    <Drawer
      variant={variant}
      open={variant === 'permanent' ? true : open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default AppDrawer
