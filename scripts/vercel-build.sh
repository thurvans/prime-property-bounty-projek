#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
START_DIR="$(pwd)"

cd "${ROOT_DIR}/client"
npm run build

cd "${ROOT_DIR}"
rm -rf dist
cp -R client/dist dist

cd "${ROOT_DIR}/server"
npm run prisma:generate

case "${START_DIR}" in
  "${ROOT_DIR}/server"*)
    rm -rf "${ROOT_DIR}/server/dist"
    cp -R "${ROOT_DIR}/client/dist" "${ROOT_DIR}/server/dist"
    ;;
esac
