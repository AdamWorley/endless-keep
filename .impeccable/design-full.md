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

## Overview

**Creative North Star: "The Family Board Game"**

Endless Keep is a boxed board game opened on the kitchen table. The page ground is the box insert's warm cardboard tan. Every surface on it is a piece of card stock with a die-cut edge that shows its thickness. The header is the red box lid with a navy rim, and it carries the title and a score track. The board is printed, with the road ruled into spaces like a track. The player's defenders are round punch-out tokens lying in a navy plastic tray. Rule cards stand beside the board on wide screens and stack under it on phones.

The system is light, tactile and plainly printed. Ink is navy, titles are Uncial in lid red, and body text is a friendly humanist sans. Depth comes from physical thickness: pieces show an edge and cast a soft shadow, and pressing one pushes it down onto the table. Colour is sparse and means something. Gold marks the next move and nothing else, violet belongs to the Dark Lord, and danger red, rose and green carry game state.

The interface is the box the game came in, and the board leads. It is a family game first, for one thumb on a phone, so pieces are big, labels are short, and nothing moves or resizes when a label changes.

**Key Characteristics:**
- Cardboard tan table, card-stock pieces, red box lid with a navy rim, navy token tray.
- Depth is card thickness: a tan edge under the piece plus a blurred cast shadow.
- Gold appears only on the next move.
- Navy ink, Uncial titles in lid red, Alegreya Sans for everything else.
- Light only. Night is a season on the board, never a page theme.

## Colors

A warm, printed palette: tan cardboard, cream card stock, a saturated lid red and a deep navy, with one gold kept for the next move.

### Primary
- **Box-Lid Red** (lid-red): the header band and the app's theme colour. Its darker partner **Lid-Ink Red** (lid-ink) sets Uncial titles on card: card headings, rule-card titles, bestiary names.
- **Tray Navy** (tray-navy): the ink of the interface. It colours button text, labels, the lid's bottom rim, score-slot borders, focus outlines, the "you" row on the Hall of Heroes, and the token tray. **Deep Tray Navy** (tray-navy-deep) is the tray's own lip.

### Secondary
- **Next-Move Gold** (move-gold): the one button that says what to do next, and the gold ring on a lifted token. **Deep Gold** (move-gold-deep) is the primary button's edge and the border of gold-tinted callouts (dynasty, choice events). **Bright Gold** (move-gold-bright) is the primary hover and the token prices on the navy tray. **Gold Text** (gold-text) is the readable gold for numbers on card: gold count, prices, the top Hall rank. **Gold Ink** (gold-ink) is the text on a gold button.

### Tertiary
- **Dark Lord Violet** (dark-lord-violet, with -light, -edge, -night and -ink): reserved for the Dark Lord and two-player mode. The versus button prints on Dark Lord Night with violet-ink text; spells take a violet border; the Dark Lord's dread count and summon prices are violet.
- **Rarity colours**: heirlooms are Common (rarity-common), Rare (rarity-rare), Epic (rarity-epic) and Legendary (rarity-legendary). They were tuned to read on light card and are used as a border, a gentle top-tint into the well, and a rarity label mixed 70% with ink.

### Neutral
- **Table Tan** (table-tan): the page ground and the app's background colour. **Table Edge** (table-edge) is the visible thickness under every card piece and the scrollbar.
- **Card Stock** (card-stock): every surface: buttons, rule cards, overlay cards, score slots, tokens. **Pressed Card** (card-pressed) is a piece pushed down: toggles that are on, disabled buttons, the open More button, alternate Hall rows. **Card Line** (card-line) is the die-cut rule on inputs, chips and event boxes. **Well** (well) is the lighter inset for inputs, chips and boxes inside a card.
- **Ink** (ink) and **Dim Ink** (ink-dim): body text and secondary text on card.
- **State colours**: danger (with danger-soft and danger-light), good (with good-soft), heart-rose for castle hearts, wing-blue for flying monsters, frost for token roles on the tray, meadow for the board's default ground.

### Named Rules
**The Next Move Rule.** Gold is only ever the next move. The waiting Start button is gold. When a pause or game-over card covers the board, Start prints as plain pressed card. New game is gold only when there is nothing to continue; when Continue shows, New game is plain card. A disabled primary is neutral pressed card. Choosing owed heirlooms is a next move, so that button takes a gold edge and glow while picks are waiting. Legendary rarity is a colour, never a glow.

**The Dark Lord's Colour Rule.** Violet belongs to the Dark Lord, two-player mode and Epic heirlooms. Nothing else is violet.

**The Board-Only Night Rule.** The page is light only (`color-scheme: light`). The night season darkens the printed board; the box, cards and tray never change.

## Typography

**Display Font:** Uncial Antiqua (with Palatino Linotype, Georgia)
**Body Font:** Alegreya Sans, weights 400, 500, 700 and 800 (with Trebuchet MS, system-ui)
**Label/Mono Font:** ui-monospace, Menlo, only for room codes and export codes

**Character:** Uncial is the game's printed name on the box and the heading on each card; it is used at one weight and never for running text. Alegreya Sans does all the reading, and its heavy 800 weight is the board-game label voice.

### Hierarchy
- **Display** (400, 1.9rem, 1.1): the box-lid title and the heading of an overlay card. Shrinks to 1.6rem (lid) and 1.4rem (card) on phones. Sits in white with a 2px navy print offset on the lid, and in lid-ink red on card.
- **Headline** (400, 1.4rem, 1.15): a bestiary entry's name.
- **Title** (400, 1.15rem, 1.15): rule-card titles and heirloom names; event titles at 1.05rem.
- **Body** (400, 16px, 1.45): rules, hints and card copy, `text-wrap: pretty`. Emphasis is 700 to 800, never a new face.
- **Body small** (.82rem to .95rem): option descriptions, chips, notes, token names.
- **Label** (800, .72rem, .1em tracking, uppercase, navy): score-track slot names, field labels, small section labels inside rule cards, heirloom rarity.
- **Score** (800, 1.15rem, tabular figures): numbers on the score track; all counts and prices use tabular figures.

### Named Rules
**The Printed Title Rule.** Uncial is for names: the game, cards, beasts, heirlooms and events. It never sets a sentence, a button or a number.

**The Steady Numbers Rule.** Every changing number uses tabular figures and a reserved minimum width, so the score track never shifts as values change.

## Layout

The page is a single centred column up to 1320px wide, with a 16px side gutter (or the safe-area inset, whichever is larger) and a 14px gap between the lid, the play area and the cards. Within pieces the rhythm is 6, 8, 10 and 14px.

- **Wide (above 900px):** the lid runs across the top. Below it, a two-column grid: the game column (board, then controls, then the token tray) and a 320px column of rule cards.
- **900px and below:** one column; the rule cards sit under the tray, two to a row between 620px and 900px.
- **Controls sit under the board at every width.** They form a fixed grid where Start takes 1.8fr and every other button an equal share; labels change but no button moves or resizes. At 820px wide or 520px tall and below, the row keeps Start (2fr), Speed, Pause and a 48px More button. Auto, Sound, Music, Buzz and Fullscreen fold into a More popover (a card under the row, `aria-expanded` on its button).
- **520px and below:** the lid runs edge to edge with only its lower corners rounded, the title takes its own line, and the score track becomes three equal-ish slots.
- **Phones, 700px and below:** an open card grows the board's frame downward instead of scrolling inside it.
- **Fullscreen:** the game fills the viewport and the page cannot scroll. The board scales to the space that is left at its true 960:560 shape, with a 290px card column.
- **Short landscape fullscreen (520px tall and below):** one grid. Row 1 holds the score track (the title is hidden) and the controls. Row 2 holds the board, a 70px vertical token tray that shows only token prices, and a 220px column of rule cards.
- **Portrait fullscreen (900px wide and below):** stacks top to bottom, with the cards taking what remains and scrolling.

## Elevation & Depth

Depth is cardboard thickness. A piece is lifted off the table by a hard tan edge directly under it plus a blurred, warm-brown cast shadow; pressing it moves it 2px down, thins the edge to 1px and tightens the shadow. A piece that is "on" stays pressed, with a soft inner shadow. The tray is the one recessed surface: navy with an inner shadow. There are no glows except on the owed-heirlooms button, and no cool or neutral grey shadows.

### Shadow Vocabulary
- **Card edge** (`box-shadow: 0 3px 0 #8e6f42, 0 8px 14px -6px rgba(74, 48, 16, .45)`): every button and rule card at rest.
- **Pressed** (`box-shadow: 0 1px 0 #8e6f42, 0 3px 6px -3px rgba(74, 48, 16, .4)` with `translateY(2px)`): a button while pressed.
- **Pressed and on** (`box-shadow: inset 0 2px 4px rgba(74, 48, 16, .3), 0 1px 0 #8e6f42` with `translateY(2px)`): toggles that are on, the open More button.
- **Gold edge** (`box-shadow: 0 3px 0 #b98a22, 0 8px 14px -6px rgba(74, 48, 16, .45)`): the primary button.
- **Overlay card** (`box-shadow: 0 4px 0 #8e6f42, 0 18px 40px -8px rgba(40, 24, 6, .6)`): cards over the board and in modals.
- **Board frame** (`box-shadow: 0 0 0 8px #f2ede3, 0 11px 0 6px #8e6f42, 0 22px 30px -6px rgba(74, 48, 16, .5)`): the printed board mounted in a card frame.
- **Token** (`box-shadow: 0 3px 0 #b8ab92, 0 6px 8px -3px rgba(0, 0, 0, .5)`): a punch-out token in the tray; lifted, it rises 5px and its edge deepens to 8px.
- **Tray well** (`box-shadow: inset 0 3px 8px rgba(5, 15, 35, .55), 0 2px 0 #142a52`): the navy token tray.

### Named Rules
**The Cardboard Rule.** Every raised piece shows its thickness as a tan edge plus a blurred shadow. A new surface that floats without an edge, or glows, is not from this box.

**The Press Down Rule.** On means pushed down. Toggles that are on are pressed card with navy ink; there is no green or coloured "on" state.

## Shapes

Shapes are die-cut card with modest rounding: 4px for printed elements (the board, Hall rows), 6px for small pieces (buttons, score slots, inputs), 8px for cards, 10px for the box lid and the tray. Chips and tags are full pills. Tokens and bestiary portraits are circles; tokens carry a dashed die-cut ring 3px outside the disc. Inline rules are 2px solid borders in card-line, or in the state colour they report. The road on the board is printed as a track: a cream band outlined in the season's ink and ruled into spaces.

## Components

### Buttons
Printed card that pushes down.
- **Shape:** gently rounded (6px), no border, the card edge shadow.
- **Card (default):** card stock with navy 800-weight text, 8px 12px padding (9px 6px in the controls row, 11px 14px in card button rows). Hover lightens to white; press moves 2px down.
- **Primary (next move):** next-move gold with gold-ink text and a deep-gold edge; hover brightens. See the Next Move Rule for when it reverts to card.
- **On:** pressed card with navy text and an inner shadow.
- **Disabled:** pressed card with dim ink, flat at 1px edge, `not-allowed` cursor.
- **Versus:** full-width Dark Lord night card with violet-ink text.
- **Focus:** 2px navy outline, 2px offset (white on the navy tray).

### Score Track
Three slots in the box lid (Level, Gold, Castle): card stock with a 2px navy border, a navy uppercase label and a tabular 800-weight number. Gold's number is gold-text; Castle's is heart-rose. When the walls are low, the Castle slot turns danger red with white text and a white border, and the label reads "Low!". Hits jolt the slot (scale and colour flash; colour only under reduced motion).

### Cards / Containers
- **Rule cards:** card stock, 8px radius, 14px 16px 16px padding, card edge shadow, Uncial title in lid-ink.
- **Overlay cards:** card stock, 8px radius, 20px 22px padding (14px on phones), up to 440px wide (780px in modals), over a 45% warm-brown scrim (60% for modals).
- **Event boxes and callouts:** well background with a 2px border in card-line, or tinted with danger, good or gold for bad, good and choice events and for the dynasty box.
- **Heirloom cards:** a button bordered in the rarity colour, its tint fading from the top into the well; hover lifts it 3px with a deeper edge.

### Inputs / Fields
- **Style:** well background, 2px card-line border, 6px radius, ink text, 9px 12px padding.
- **Focus:** the border turns navy, plus the 2px navy focus outline.
- Room codes print in large monospace on well inside a dashed navy border.

### Chips
Pills of well with a 2px card-line border and a small creature portrait. Boss chips take a danger border and text; flying chips a wing-blue border. Later levels' chips fade to 80%.

### Navigation (controls and More)
The controls row is the game's only navigation. On narrow and short screens the More button (three dots, 48px) opens a card popover of full-width, left-aligned buttons; while it is open the More button is pressed. Keyboard help is hidden on touch-only devices (coarse pointer, no hover).

### Token Tray (signature)
A navy tray of five punch-out defender tokens. Each token is a 54px card disc with a dashed ring and a tan edge, its name in white, its role in frost, its price in bright gold. Hover raises a token 2px. The picked-up token rises 5px, its edge deepens, and a 3px gold ring appears around it. Tokens the player can't afford or hasn't unlocked fade to 45%, and an unaffordable price turns danger-light. Motion is short and eased (`cubic-bezier(.16, 1, .3, 1)`, 120 to 180ms) and drops the lift under reduced motion.

### Printed Board
The board sits in an 8px card frame with a tan edge. The road is a board-game track: a cream band (the season's road and space colours) outlined and ruled into spaces in the season's ink, with a printed rule around the board's edge. Seasons change the ground, road and ink; night darkens only the board.

## Do's and Don'ts

### Do:
- **Do** give every raised piece the card edge: a tan edge under it plus a blurred warm shadow, and press it 2px down on press.
- **Do** keep gold for the single next move, and turn it back to plain card the moment something else is the next move.
- **Do** show "on" as pressed card with navy ink.
- **Do** set titles in Uncial in lid-ink red on card, and everything else in Alegreya Sans.
- **Do** use tabular figures and reserved widths for every number that changes.
- **Do** keep the controls under the board and fold extras under More at 820px wide or 520px tall.
- **Do** keep violet for the Dark Lord, two-player mode and Epic.

### Don't:
- **Don't** add a dark page theme; night belongs to the board only.
- **Don't** use gold for selection, decoration or rarity glow.
- **Don't** use green or another colour for a toggle that is on.
- **Don't** float a surface without its cardboard edge, or use cool grey shadows.
- **Don't** let a label change move or resize a button.
- **Don't** bring back the moss, parchment-on-dark or stone of a fantasy-RPG frame.
