# KMC Rosters Frontend

React/Vite frontend for the KMC qualification rosters.

## Local Development

```sh
npm install
npm run dev
```

In dev mode, the app uses `public/mock-rosters.json` automatically.

## GitHub Pages

The repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

In the GitHub repo settings:

- Go to `Settings > Pages`.
- Set source to `GitHub Actions`.
- Add a repository variable named `VITE_ROSTERS_API_BASE_URL` with the backend origin, for example `https://xp.104thbattalionmilsim.com`.

If the Pages site uses a custom domain or a user/org Pages repo ending in `.github.io`, no base path override is needed.

If the automatic asset base path is wrong, add a repository variable:

```text
VITE_BASE_PATH=/your-repo-name/
```

## Production Build

```sh
npm run build
```
