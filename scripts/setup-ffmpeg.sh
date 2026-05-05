#!/bin/bash
# FFmpeg für macOS ARM herunterladen
set -e

FFMPEG_DIR="$(dirname "$0")/../bin"
FFMPEG_BIN="$FFMPEG_DIR/ffmpeg"

if [ -f "$FFMPEG_BIN" ]; then
  echo "FFmpeg bereits vorhanden: $($FFMPEG_BIN -version 2>&1 | head -1)"
  exit 0
fi

echo "Lade FFmpeg herunter..."
mkdir -p "$FFMPEG_DIR"

# Versuche system ffmpeg zuerst
if command -v ffmpeg &> /dev/null; then
  echo "System-FFmpeg gefunden: $(ffmpeg -version 2>&1 | head -1)"
  exit 0
fi

# macOS ARM download
curl -L "https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip" -o /tmp/ffmpeg.zip
unzip -q /tmp/ffmpeg.zip -d /tmp/ffmpeg-download
mv /tmp/ffmpeg-download/ffmpeg "$FFMPEG_BIN"
chmod +x "$FFMPEG_BIN"
rm -rf /tmp/ffmpeg.zip /tmp/ffmpeg-download

echo "FFmpeg installiert: $($FFMPEG_BIN -version 2>&1 | head -1)"
