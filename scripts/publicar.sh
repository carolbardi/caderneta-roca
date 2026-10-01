#!/bin/sh
# Compila o app e envia a pasta dist para o ramo gh-pages (GitHub Pages: Deploy from a branch).
# Usa .env.local para a URL e a chave publishable do Supabase.
set -e
cd "$(dirname "$0")/.."

npm run build

INDICE="$(mktemp)"
rm -f "$INDICE"
export GIT_INDEX_FILE="$INDICE"
git --work-tree=dist add -A
ARVORE="$(git write-tree)"
unset GIT_INDEX_FILE
rm -f "$INDICE"

PAI=""
if git rev-parse -q --verify refs/remotes/origin/gh-pages >/dev/null; then
  PAI="-p refs/remotes/origin/gh-pages"
fi
COMMIT="$(echo "Publicar $(date '+%Y-%m-%d %H:%M')" | git commit-tree "$ARVORE" $PAI)"
git push origin "$COMMIT:refs/heads/gh-pages"
git fetch -q origin gh-pages
echo "Publicado: https://carolbardi.github.io/caderneta-roca/"
