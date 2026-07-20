# KMC Rosters Frontend

React/Vite frontend for the KMC qualification rosters.

## Local Development

```sh
npm install
npm run dev
```

The app uses the live roster API by default.

## GitHub Pages

The repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

In the GitHub repo settings:

- Go to `Settings > Pages`.
- Set source to `GitHub Actions`.
- Builds use `https://leaderboard.104thbattalionmilsim.com/api/rosters` by default.
- To override it, add a repository variable named `VITE_ROSTERS_API_BASE_URL` with the backend origin.

If the Pages site uses a custom domain or a user/org Pages repo ending in `.github.io`, no base path override is needed.

If the automatic asset base path is wrong, add a repository variable:

```text
VITE_BASE_PATH=/your-repo-name/
```

## Manual Deploy

If GitHub Actions is unavailable, build and deploy from your Mac:

```sh
chmod +x deploy-pages.sh
./deploy-pages.sh
```

Then set GitHub Pages to deploy from:

```text
Branch: gh-pages
Folder: / (root)
```

## Production Build

```sh
npm run build
```
