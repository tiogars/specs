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

- `.github/workflows/deploy-webapp.yml` deploys the webapp to GitHub Pages root
- `.github/workflows/deploy-docs.yml` builds MkDocs Material docs and deploys them to `/doc`
