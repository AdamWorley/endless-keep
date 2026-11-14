#!/bin/sh
# Builds a self-hostable, installable copy of the game into ../dist.
# The game source (endless-keep.html) is a body-only page for the Claude artifact; this wraps it in a full
# document head with the manifest, icons and service worker so it can be installed as a PWA.
set -e
cd "$(dirname "$0")"
OUT=../dist
mkdir -p "$OUT"
{
  cat <<'HEAD'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#141d19">
<meta name="description" content="Hold the castle against endless waves of goblins, trolls and dragons.">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Endless Keep">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="icon" href="icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>body{margin:0}[hidden]:not([hidden=until-found i]){display:none!important}</style>
<script>if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));</script>
</head>
<body>
HEAD
  cat ../endless-keep.html
  printf '\n</body>\n</html>\n'
} > "$OUT/index.html"
cp manifest.webmanifest sw.js icon.svg icon-192.png icon-512.png apple-touch-icon.png "$OUT/"
# bump the cache name so installed copies pick up the new build
# (written via a temp file so it works with both macOS and Linux sed; CI passes BUILD_ID, locally it's the time)
sed "s/endless-keep-v1/endless-keep-${BUILD_ID:-$(date +%Y%m%d%H%M%S)}/" sw.js > "$OUT/sw.js"
echo "Built $OUT — serve it over https (or http://localhost) and the browser will offer to install it."
