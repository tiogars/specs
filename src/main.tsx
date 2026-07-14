import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

registerSW({ immediate: true })

function getRouterBasename(baseUrl: string) {
  return baseUrl === '/' ? baseUrl : baseUrl.replace(/\/$/, '')
}

const routerBasename = getRouterBasename(import.meta.env.BASE_URL)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter basename={routerBasename}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
