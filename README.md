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

- `.github/workflows/deploy-webapp.yml` builds the webapp, writes the configured custom domain into the Pages artifact, and publishes MkDocs under `/docs`
- deployed builds append the GitHub Actions run number and short commit SHA to the package version shown in the webapp footer

### Update `specs (default)` values for generated docs

1. Update the default project values in `src/projectRepository.ts`:
   - `DEFAULT_PROJECT_ROLES`
   - `DEFAULT_PROJECT_USE_CASES`
2. Commit and push to `main` (or run the **Deploy Pages** workflow manually with `workflow_dispatch`).
3. During the GitHub workflow, the `Generate self-documentation` step runs `scripts/generate-default-docs.ts`, reloads values from the `specs (default)` seed, and rebuilds `/docs` before publishing.
