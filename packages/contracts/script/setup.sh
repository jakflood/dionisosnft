#!/usr/bin/env bash
set -euo pipefail

# Install Foundry deps for contracts package.
# This script is idempotent.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v forge >/dev/null 2>&1; then
  echo "[contracts] forge not found. Install Foundry first: https://book.getfoundry.sh/getting-started/installation" >&2
  exit 1
fi

install_if_missing() {
  local dir="$1"
  local repo="$2"
  if [ ! -d "$dir" ]; then
    echo "[contracts] Installing ${repo}..."
    forge install "$repo" --no-commit
  else
    echo "[contracts] ${repo} already installed."
  fi
}

install_if_missing "lib/openzeppelin-contracts" "OpenZeppelin/openzeppelin-contracts"
install_if_missing "lib/forge-std" "foundry-rs/forge-std"

# Ensure remappings are present
if [ ! -f remappings.txt ]; then
  cat > remappings.txt <<'TXT'
openzeppelin-contracts/=lib/openzeppelin-contracts/
forge-std/=lib/forge-std/src/
TXT
fi

echo "[contracts] Setup complete."
