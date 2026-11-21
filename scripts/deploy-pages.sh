#!/usr/bin/env bash
# Build the static site and publish it to the gh-pages branch.
# GitHub Pages serves that branch. There is no CI: run this locally.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BASE_PATH="${PAGES_BASE_PATH:-/Aperture}"
REMOTE_URL="$(git remote get-url origin)"
SLUG="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"

echo "Building static site with base path ${BASE_PATH}…"
(
  cd "$ROOT/apps/web"
  NEXT_PUBLIC_BASE_PATH="$BASE_PATH" bun run build
)

OUT="$ROOT/apps/web/out"
if [ ! -f "$OUT/index.html" ]; then
  echo "No static export at $OUT" >&2
  exit 1
fi

# GitHub Pages runs Jekyll by default, which drops the _next directory.
touch "$OUT/.nojekyll"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
cp -R "$OUT"/. "$TMP"/

cd "$TMP"
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy site"
git push --force "$REMOTE_URL" HEAD:gh-pages

echo "Pushed gh-pages."

if [ -n "$SLUG" ]; then
  gh api --method POST "repos/${SLUG}/pages" \
    -f "source[branch]=gh-pages" -f "source[path]=/" >/dev/null 2>&1 || true
  OWNER="$(echo "$SLUG" | cut -d/ -f1 | tr '[:upper:]' '[:lower:]')"
  REPO="$(echo "$SLUG" | cut -d/ -f2)"
  echo "Site: https://${OWNER}.github.io/${REPO}/"
fi
