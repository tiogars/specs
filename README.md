# specs

Offline-first web application to describe software projects by **roles** and **use cases**.

## Stack

- pnpm
- React + TypeScript + Vite
- MUI + MUI icons
- React Router
- React Hook Form
- PGlite local persistence
- PWA with service worker

## Development

```bash
pnpm install
pnpm dev
```

## Validation

```bash
pnpm lint
pnpm test:run
pnpm build
```

## Deployment

- `.github/workflows/deploy-webapp.yml` builds the webapp, publishes it at the GitHub Pages root, and publishes MkDocs under `/docs`
