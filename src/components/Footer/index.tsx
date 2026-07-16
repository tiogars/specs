import { Box, Divider, Link, Tooltip, Typography } from '@mui/material'
import BugReportIcon from '@mui/icons-material/BugReport'
import GitHubIcon from '@mui/icons-material/GitHub'

const INCEPTION_YEAR = 2026
const GITHUB_REPO_URL = 'https://github.com/tiogars/specs'
const GITHUB_ISSUES_URL = 'https://github.com/tiogars/specs/issues'

const POWERED_BY = [
  { label: 'pnpm', href: 'https://pnpm.io' },
  { label: 'MUI', href: 'https://mui.com' },
  { label: 'MUI Icons', href: 'https://mui.com/material-ui/material-icons/' },
  { label: 'React Router', href: 'https://reactrouter.com' },
  { label: 'React Hook Form', href: 'https://react-hook-form.com' },
]

const Footer = () => (
  <Box component="footer" sx={{ mt: 4 }}>
    <Divider />
    <Box
      sx={{
        pt: 2,
        pb: 1,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
        color: 'text.secondary',
      }}
    >
      <Typography variant="caption">© {INCEPTION_YEAR} Specs Builder — v{__APP_VERSION__}</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="GitHub repository">
          <Link
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
            aria-label="GitHub repository"
          >
            <GitHubIcon sx={{ fontSize: 16 }} />
          </Link>
        </Tooltip>
        <Tooltip title="Report an issue">
          <Link
            href={GITHUB_ISSUES_URL}
            target="_blank"
            rel="noreferrer"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
            aria-label="GitHub issues"
          >
            <BugReportIcon sx={{ fontSize: 16 }} />
          </Link>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="caption">Powered by</Typography>
        {POWERED_BY.map((lib, index) => (
          <span key={lib.label}>
            <Link href={lib.href} target="_blank" rel="noreferrer" variant="caption" color="inherit">
              {lib.label}
            </Link>
            {index < POWERED_BY.length - 1 && (
              <Typography component="span" variant="caption">
                {' '}
                ·{' '}
              </Typography>
            )}
          </span>
        ))}
      </Box>
    </Box>
  </Box>
)

export default Footer
