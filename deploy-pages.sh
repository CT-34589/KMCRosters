#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-gh-pages}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ROOT="$(cd "$REPO_ROOT/.." && pwd)/kmc-rosters-pages-deploy"
DIST_ROOT="$REPO_ROOT/dist"

cd "$REPO_ROOT"

npm run build

rm -rf "$DEPLOY_ROOT"

if ! git worktree add "$DEPLOY_ROOT" "$BRANCH"; then
  git worktree add --detach "$DEPLOY_ROOT"
  (
    cd "$DEPLOY_ROOT"
    git checkout --orphan "$BRANCH"
    git rm -rf . >/dev/null 2>&1 || true
  )
fi

find "$DEPLOY_ROOT" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R "$DIST_ROOT"/. "$DEPLOY_ROOT"/

(
  cd "$DEPLOY_ROOT"
  git add -A

  if ! git diff --cached --quiet; then
    git commit -m "Deploy frontend"
  fi

  git push origin "$BRANCH:$BRANCH"
)

git worktree remove "$DEPLOY_ROOT" --force
