#!/usr/bin/env bash
# Re-downloads the published Framer site into raw_site_export/
# Run after making changes in Framer and publishing.

set -euo pipefail

SITE="https://strong-motivation-722518.framer.app"
DIR="$(dirname "$0")/raw_site_export"

mkdir -p "$DIR"

wget "$SITE/" -O "$DIR/index.html"
wget "$SITE/contact" -O "$DIR/contact.html"
wget "$SITE/journal" -O "$DIR/journal.html"
