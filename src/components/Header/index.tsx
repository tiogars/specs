import { Link as RouterLink } from 'react-router-dom'
import { AppBar, Button, Toolbar, Typography } from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import type { HeaderProps } from './Header.types'

const Header = ({ docsHref }: HeaderProps) => (
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
)

export default Header
