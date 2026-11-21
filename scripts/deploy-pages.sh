#!/usr/bin/env bash
# Build the static site into docs/ and publish it from main.
# GitHub Pages serves main /docs. There is no CI: run this locally.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BASE_PATH="${PAGES_BASE_PATH:-/Aperture}"
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

# Replace only the generated parts of docs/. Hand-written files such as
# docs/catalog.md and docs/assets/ are kept.
echo "Copying the export into docs/…"
rm -rf \
  "$ROOT/docs/_next" \
  "$ROOT/docs/_not-found" \
  "$ROOT/docs/r" \
  "$ROOT/docs/docs" \
  "$ROOT/docs/index.html" \
  "$ROOT/docs/index.txt" \
  "$ROOT/docs/404.html" \
  "$ROOT/docs/404" \
  "$ROOT/docs/aperture.css"
rm -f "$ROOT/docs"/__next.*.txt
cp -R "$OUT"/. "$ROOT/docs"/

# GitHub Pages runs Jekyll by default, which drops the _next directory.
touch "$ROOT/docs/.nojekyll"

git add docs
if git diff --cached --quiet -- docs; then
  echo "No Pages changes to commit."
  exit 0
fi

git commit -m "Update GitHub Pages export" -- docs
git push origin main
echo "Pushed docs/ to main."

if [ -n "$SLUG" ]; then
  gh api --method PUT "repos/${SLUG}/pages" \
    -f "source[branch]=main" -f "source[path]=/docs" >/dev/null
  OWNER="$(echo "$SLUG" | cut -d/ -f1 | tr '[:upper:]' '[:lower:]')"
  REPO="$(echo "$SLUG" | cut -d/ -f2)"
  echo "Site: https://${OWNER}.github.io/${REPO}/"
fi
