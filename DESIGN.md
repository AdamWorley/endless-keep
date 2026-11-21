---
name: Endless Keep
description: A boxed family board game laid out on a cardboard table, with a red box lid, card-stock pieces and a navy token tray.
colors:
  table-tan: "#c9a874"
  table-edge: "#8e6f42"
  card-stock: "#f2ede3"
  card-pressed: "#e7dfcf"
  card-line: "#d3c6ad"
  well: "#fbf8f2"
  lid-red: "#d63a2c"
  lid-ink: "#b02a1e"
  tray-navy: "#1f3b6e"
  tray-navy-deep: "#142a52"
  ink: "#1f1b16"
  ink-dim: "#5f5649"
  move-gold: "#e9b949"
  move-gold-deep: "#b98a22"
  move-gold-bright: "#f3c95e"
  gold-ink: "#2a1d05"
  gold-text: "#855e00"
  danger: "#b3301b"
  danger-soft: "#f7d9cf"
  danger-light: "#ffb8a6"
  good: "#3a7428"
  good-soft: "#dcebcf"
  heart-rose: "#c2364a"
  wing-blue: "#4f7aa6"
  frost: "#9edcf0"
  meadow: "#7db75a"
  dark-lord-violet: "#7a3fb5"
  dark-lord-violet-light: "#c58bff"
  dark-lord-violet-edge: "#7a4a9a"
  dark-lord-night: "#2c2338"
  dark-lord-ink: "#e3d2ff"
  rarity-common: "#9a8a66"
  rarity-rare: "#2f86c2"
  rarity-epic: "#8b4fd6"
  rarity-legendary: "#d9a22a"
typography:
  display:
    fontFamily: "Uncial Antiqua, Palatino Linotype, Georgia, serif"
    fontSize: "1.9rem"
    fontWeight: 400
    lineHeight: 1.1
  headline:
    fontFamily: "Uncial Antiqua, Palatino Linotype, Georgia, serif"
    fontSize: "1.4rem"
    fontWeight: 400
    lineHeight: 1.15
  title:
    fontFamily: "Uncial Antiqua, Palatino Linotype, Georgia, serif"
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1.15
  body:
    fontFamily: "Alegreya Sans, Trebuchet MS, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  body-small:
    fontFamily: "Alegreya Sans, Trebuchet MS, system-ui, sans-serif"
    fontSize: ".82rem"
    fontWeight: 400
    lineHeight: 1.3
  label:
    fontFamily: "Alegreya Sans, Trebuchet MS, system-ui, sans-serif"
    fontSize: ".72rem"
    fontWeight: 800
    letterSpacing: ".1em"
  score:
    fontFamily: "Alegreya Sans, Trebuchet MS, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 800
    fontFeature: "tnum"
rounded:
  print: "4px"
  card-sm: "6px"
  card: "8px"
  box: "10px"
  pill: "999px"
  token: "50%"
spacing:
  xs: "6px"
  sm: "8px"
  md: "10px"
  lg: "14px"
  gutter: "16px"
components:
  button-card:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.tray-navy}"
    rounded: "{rounded.card-sm}"
    padding: "8px 12px"
  button-card-hover:
    backgroundColor: "#ffffff"
  button-card-on:
    backgroundColor: "{colors.card-pressed}"
    textColor: "{colors.tray-navy}"
  button-card-disabled:
    backgroundColor: "{colors.card-pressed}"
    textColor: "{colors.ink-dim}"
  button-primary:
    backgroundColor: "{colors.move-gold}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.card-sm}"
    padding: "8px 12px"
  button-primary-hover:
    backgroundColor: "{colors.move-gold-bright}"
  button-versus:
    backgroundColor: "{colors.dark-lord-night}"
    textColor: "{colors.dark-lord-ink}"
    rounded: "{rounded.card-sm}"
    padding: "11px 14px"
  box-lid:
    backgroundColor: "{colors.lid-red}"
    textColor: "#ffffff"
    rounded: "{rounded.box}"
    padding: "12px 16px 14px"
  score-slot:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.ink}"
    typography: "{typography.score}"
    rounded: "{rounded.card-sm}"
    padding: "4px 10px"
  rule-card:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "14px 16px 16px"
  overlay-card:
    backgroundColor: "{colors.card-stock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px 22px"
  token-tray:
    backgroundColor: "{colors.tray-navy}"
    textColor: "#ffffff"
    rounded: "{rounded.box}"
    padding: "12px 8px 10px"
  token:
    backgroundColor: "{colors.card-stock}"
    rounded: "{rounded.token}"
    size: "54px"
  text-field:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card-sm}"
    padding: "9px 12px"
  chip:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "2px 10px 2px 4px"
---

# Design System: Endless Keep

<!-- impeccable:design-map -->
Name: Endless Keep
Colors: primary: lid-red #d63a2c; secondary: move-gold #e9b949; tertiary: dark-lord-violet #7a3fb5; neutral: table-tan #c9a874; primary: lid-ink #b02a1e; primary: tray-navy #1f3b6e (+29 more in the sidecar)
Fonts: Uncial Antiqua (display, headline, title); Alegreya Sans (body, body-small, label, score)
Spacing: xs 6px, sm 8px, md 10px, lg 14px, gutter 16px
Radius: print 4px, card-sm 6px, card 8px, box 10px, pill 999px, token 50%
North Star: "The Family Board Game"
Rules:
- The Next Move Rule. Gold is only ever the next move.
- The Dark Lord's Colour Rule. Violet belongs to the Dark Lord, two-player mode and Epic heirlooms.
- The Board-Only Night Rule. The page is light only (`color-scheme: light`).
- The Printed Title Rule. Uncial is for names: the game, cards, beasts, heirlooms and events.
- The Steady Numbers Rule. Every changing number uses tabular figures and a reserved minimum width, so the score track never shifts as values change.
- The Cardboard Rule. Every raised piece shows its thickness as a tan edge plus a blurred shadow.
- The Press Down Rule. On means pushed down.
Elevation:
- Card edge: 0 3px 0 #8e6f42, 0 8px 14px -6px rgba(74, 48, 16, .45)
- Pressed: 0 1px 0 #8e6f42, 0 3px 6px -3px rgba(74, 48, 16, .4)
- Pressed and on: inset 0 2px 4px rgba(74, 48, 16, .3), 0 1px 0 #8e6f42
- Gold edge: 0 3px 0 #b98a22, 0 8px 14px -6px rgba(74, 48, 16, .45)
- Overlay card: 0 4px 0 #8e6f42, 0 18px 40px -8px rgba(40, 24, 6, .6)
- Board frame: 0 0 0 8px #f2ede3, 0 11px 0 6px #8e6f42, 0 22px 30px -6px rgba(74, 48, 16, .5)
- Token: 0 3px 0 #b8ab92, 0 6px 8px -3px rgba(0, 0, 0, .5)
- Tray well: inset 0 3px 8px rgba(5, 15, 35, .55), 0 2px 0 #142a52
Don't:
- Don't add a dark page theme; night belongs to the board only.
- Don't use gold for selection, decoration or rarity glow.
- Don't use green or another colour for a toggle that is on.
- Don't float a surface without its cardboard edge, or use cool grey shadows.
- Don't let a label change move or resize a button.
- Don't bring back the moss, parchment-on-dark or stone of a fantasy-RPG frame.
Do:
- Do give every raised piece the card edge: a tan edge under it plus a blurred warm shadow, and press it 2px down on press.
- (+6 more)
Full: .impeccable/design-full.md (read a section when you need its detail)
