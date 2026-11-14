---
name: Endless Keep
description: A painted storybook meadow framed by a quiet, lamplit forest-green interface.
colors:
  night-forest: "#141d19"
  deep-moss: "#1f2c26"
  lichen-moss: "#2a3a32"
  mossy-line: "#3a4f44"
  old-parchment: "#f1e6c8"
  faded-parchment: "#b7ae93"
  keep-gold: "#e9b949"
  keep-gold-deep: "#b98a22"
  keep-gold-bright: "#f3c95e"
  gold-ink: "#2a1d05"
  hearth-ember: "#e2683e"
  ember-glow: "#ffc1a8"
  heart-rose: "#f08a7a"
  frost: "#94d6ea"
  spring-leaf: "#8cc06a"
  leaf-on: "#3c5444"
  leaf-on-ink: "#e4f5d6"
  meadow: "#5e9444"
  dark-lord-violet: "#c58bff"
  dark-lord-edge: "#7a4a9a"
  dark-lord-night: "#2c2338"
  dark-lord-ink: "#e3d2ff"
  wing-blue: "#6c8fb0"
  rarity-common: "#c9bf9f"
  rarity-rare: "#6fb6e0"
typography:
  display:
    fontFamily: "Uncial Antiqua, Palatino Linotype, Georgia, serif"
    fontSize: "1.9rem"
    fontWeight: 400
    lineHeight: 1.1
  headline:
    fontFamily: "Uncial Antiqua, Palatino Linotype, Georgia, serif"
    fontSize: "1.7rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  title:
    fontFamily: "Uncial Antiqua, Palatino Linotype, Georgia, serif"
    fontSize: "1.15rem"
    fontWeight: 400
  body:
    fontFamily: "Alegreya Sans, Trebuchet MS, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
  body-strong:
    fontFamily: "Alegreya Sans, Trebuchet MS, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 800
  stat:
    fontFamily: "Alegreya Sans, Trebuchet MS, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 800
    fontFeature: "tnum"
  small:
    fontFamily: "Alegreya Sans, Trebuchet MS, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 400
  label:
    fontFamily: "Alegreya Sans, Trebuchet MS, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0.08em"
  code:
    fontFamily: "ui-monospace, Menlo, monospace"
    fontSize: "2.4rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.18em"
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "14px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  panel: "14px"
  card: "20px 22px"
components:
  button:
    backgroundColor: "{colors.lichen-moss}"
    textColor: "{colors.old-parchment}"
    rounded: "{rounded.md}"
    padding: "7px 12px"
  button-primary:
    backgroundColor: "{colors.keep-gold}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.md}"
    padding: "7px 12px"
  button-primary-hover:
    backgroundColor: "{colors.keep-gold-bright}"
    textColor: "{colors.gold-ink}"
  button-on:
    backgroundColor: "{colors.leaf-on}"
    textColor: "{colors.leaf-on-ink}"
    rounded: "{rounded.md}"
  button-versus:
    backgroundColor: "{colors.dark-lord-night}"
    textColor: "{colors.dark-lord-ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  stat:
    backgroundColor: "{colors.deep-moss}"
    textColor: "{colors.old-parchment}"
    rounded: "{rounded.md}"
    padding: "5px 12px"
  panel:
    backgroundColor: "{colors.deep-moss}"
    textColor: "{colors.old-parchment}"
    rounded: "{rounded.xl}"
    padding: "{spacing.panel}"
  card:
    backgroundColor: "{colors.deep-moss}"
    textColor: "{colors.faded-parchment}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card}"
  input:
    backgroundColor: "{colors.night-forest}"
    textColor: "{colors.old-parchment}"
    rounded: "{rounded.md}"
    padding: "9px 12px"
  chip:
    backgroundColor: "{colors.lichen-moss}"
    textColor: "{colors.old-parchment}"
    rounded: "{rounded.pill}"
    padding: "2px 10px 2px 4px"
  toast:
    backgroundColor: "{colors.night-forest}"
    textColor: "{colors.old-parchment}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
---

# Design System: Endless Keep

## Overview

**Creative North Star: "Storybook at Dusk"**

Endless Keep is a painted meadow seen through a window of dark forest. The game board is the bright page of a storybook: seasonal grass, a sandy road, flowers, ponds and a blue-roofed castle, all drawn on canvas. Around it the interface is dusk: deep moss-green panels, parchment-coloured text and a little lamplit gold. The contrast is the system. The board holds the saturated colour and the life; the frame stays quiet and dark so the eye goes back to the meadow.

The interface is a **quiet frame**. Panels, stats and buttons sit in tonal greens, separated by thin mossy borders rather than shadows. They light up only for two things: the next action you should take (solid gold) and rewards (gold glow, rarity colours). Display type is an uncial storybook hand, Uncial Antiqua, used only for names and headings. Everything you actually read or tap is set in the warm, friendly humanist sans Alegreya Sans, with tabular figures wherever numbers change.

Density is moderate and touch-first. Controls are compact but thumb-sized, the layout reflows from a board-plus-sidebar on desktop to a stacked column on phones, and a full-screen mode fits the board to the viewport in either orientation. The current implementation is a single dark theme, set with `color-scheme: dark`.

**Key Characteristics:**
- A bright painted board inside a dark, calm forest-green frame.
- Gold is rare and means "act now" or "this is special".
- Uncial display type for names and headings only; humanist sans for everything else.
- Flat tonal panels with thin borders; shadows only on things that float.
- Fixed-size controls whose labels change but whose positions never do.
- Colour-coded families: ember for danger and bosses, frost for tower roles, leaf for good things, violet for the Dark Lord.

## Colors

A dusk palette: near-black greens and parchment, with lamplit gold and a few small, meaningful colour families.

### Primary
- **Keep Gold**: the lamp in the dark. It fills the one primary action on screen (Start level, New game, Resume, Play again), sets every heading in panels and cards, marks costs and the top leaderboard rank, and is the focus outline. **Keep Gold Deep** borders gold buttons and dashed room codes; **Keep Gold Bright** is the primary button's hover. Text on gold is always **Gold Ink**.

### Secondary
- **Hearth Ember**: danger and bosses. It borders boss chips and bad events and colours costs you can't afford. Its light partner **Ember Glow** is the readable text colour for boss names and bad-event titles. **Heart Rose** is the castle's hearts count.
- **Frost**: tower knowledge. Tower role labels ("Best against") and the info callout use it, often as a translucent tint (8% fill, 25% border).
- **Spring Leaf**: good news. It marks upgrade gains, good events and toggles that are on (with **Leaf On** fill and **Leaf On Ink** text).

### Tertiary
- **Dark Lord Violet**: belongs to the Dark Lord. It colours dread, spell costs and summon costs, and the Epic heirloom rarity. **Dark Lord Edge**, **Dark Lord Night** and **Dark Lord Ink** make up the two-player button and spell cards.
- **Rarity colours** for heirlooms, set per item through the `--rc` custom property: Common (**rarity-common**), Rare (**rarity-rare**), Epic (Dark Lord Violet) and Legendary (Keep Gold).
- **Wing Blue**: borders the chips and tags of flying monsters.

### Neutral
- **Night Forest**: page background, inputs, text areas and the full-screen backdrop.
- **Deep Moss**: panels, cards and HUD stats.
- **Lichen Moss**: buttons, chips, events and Bestiary entries, one step lighter than the panel they sit on.
- **Mossy Line**: every 1px border.
- **Old Parchment**: primary text.
- **Faded Parchment**: secondary text, hints, labels, card body copy and hover borders.
- **Meadow**: the board's background before the canvas paints it.

### Named Rules
**The Gold Means Act Rule.** Solid Keep Gold is reserved for the single main next action on a screen and for top rewards (Legendary heirlooms, first place, highlighted buttons). Don't use it as decoration or for a second competing button. Gold headings are the one standing exception, because they label rather than ask.

**The Dark Lord Owns Violet Rule.** The violet family belongs to the Dark Lord, two-player mode and Epic heirlooms, and nothing else. A violet element anywhere else reads as "the enemy's".

**The Board Carries the Colour Rule.** Saturated colour lives on the canvas board (grass, flowers, monsters, seasons). The interface stays in moss and parchment, adding colour only as small semantic accents (borders, numbers, tags).

## Typography

**Display Font:** Uncial Antiqua (with Palatino Linotype, Georgia, serif)
**Body Font:** Alegreya Sans (with Trebuchet MS, system-ui, sans-serif)
**Label/Mono Font:** ui-monospace, Menlo, monospace, only for room codes and export codes

**Character:** A storybook uncial for the names of things (the game, cards, panels, heirlooms, monsters, events) paired with a warm humanist sans that stays easy to read at small sizes on a phone. Both load from Google Fonts. The fallbacks keep the same tone offline: a classical serif and a friendly sans.

### Hierarchy
- **Display** (400, 1.9rem, 1.1; 1.4rem on phones): card headings over the board ("Endless Keep", "Paused", "The keep has fallen"), balanced wrapping, gold.
- **Headline** (400, 1.7rem, 1; 1.35rem on phones): the game's name in the top bar, gold.
- **Title** (400, 1.05–1.4rem): panel headings, Bestiary entries, heirloom names and event titles, in the display font.
- **Body** (400, 16px, 1.45): rules text, card copy and hints (0.95rem in panels). Option names and stats step up to 700–800.
- **Stat** (800, 1.15rem, tabular): HUD numbers, with fixed minimum widths so they never jitter.
- **Small** (400, 0.78–0.85rem): descriptions under options, chips, fine print and board notes.
- **Label** (700–800, 0.68–0.78rem, 0.05–0.1em tracking, uppercase): stat captions, field labels, sub-headings, rarity names and monster tags.

### Named Rules
**The Uncial Names Things Rule.** The display font is only for names and headings. Never set a sentence, a number, a button label or anything the player must parse quickly in Uncial Antiqua.

**The Numbers Hold Still Rule.** Every number that changes during play (gold, level, hearts, costs, scores, stats) uses tabular figures, and the HUD numbers have minimum widths.

## Layout

The page is a centred grid, at most 1320px wide with 12px gaps: a top bar (title, HUD stats, controls), then a two-column layout of the board column (`minmax(0, 1fr)`) and a 310px sidebar of panels. The board keeps a fixed 960 × 560 aspect ratio. Below it, the defender palette is a 5-column grid of tiles. The body has 16px side padding, which grows with the safe-area insets.

- **Top controls** are a fixed grid: the primary button is 1.8fr and six others are 1fr each. That becomes 4 columns at 820px or narrower (primary spans 2), and 3 columns at 520px or narrower (primary spans the full row). Labels truncate with an ellipsis; they never reflow the grid.
- **At 900px or narrower** the layout stacks to one column. Between 620 and 900px the sidebar panels sit two across.
- **Full-screen mode** fixes the wrap to the viewport, respects all safe-area insets and sizes the board with container queries to the largest 960:560 rectangle that fits. Below 520px of height (landscape phones) it hides the title, narrows the sidebar to 230px and shrinks the palette tiles to icons only. In portrait at 900px or narrower it stacks, and the sidebar scrolls.
- **Modals** (heirlooms, export/import, Bestiary, two-player) cover the viewport with a dark scrim and centre a card up to 780px wide, which scrolls inside `100dvh`.

Spacing is a tight 4–14px rhythm: 6px between controls, tiles and chips; 8–10px inside rows and lists; 12px between panels; 14px panel padding; 20–22px card padding (14px on phones).

### Named Rules
**The Buttons Never Move Rule.** The top control grid is a fixed size. Labels change ("Sound: off", "Level 12 under way") but no button ever moves, resizes or reflows. New controls must fit the grid or go elsewhere.

**The Thumb First Rule.** Every layout is checked at phone width and phone landscape height first. The board always stays fully visible at its true aspect ratio.

## Elevation & Depth

The interface is flat. Depth comes from tone: Night Forest page, then Deep Moss panels, then Lichen Moss controls, each lighter step sitting on the darker one and edged with a 1px Mossy Line border. Shadows appear only on things that physically float above the page: the board, cards and modals over it, and a tower being dragged. A warm gold glow is a separate signal that marks something special, not depth.

### Shadow Vocabulary
- **Board lift** (`box-shadow: 0 10px 30px rgba(0,0,0,.35)`): the game board, so it reads as the page of the book.
- **Card float** (`box-shadow: 0 12px 40px rgba(0,0,0,.45)`): overlay and modal cards.
- **Drag lift** (`filter: drop-shadow(0 4px 6px rgba(0,0,0,.4))`): the defender following your finger while dragging.
- **Gold glow** (`box-shadow: 0 0 12px rgba(233,185,73,.35)` on buttons, `0 0 18px` on Legendary heirlooms): "look here", for highlighted buttons and the rarest rewards.

### Named Rules
**The Flat Until It Floats Rule.** Panels, stats, chips and buttons never get drop shadows. Add a shadow only to something that floats over other content; otherwise separate with tone and a border.

**The Glow Is a Reward Rule.** Gold glow is for the special few (a highlighted next step, a Legendary heirloom), never for ordinary hover or focus.

## Shapes

Soft, friendly rounded rectangles throughout, with no sharp corners and no exaggerated blobs. Radius grows with the size of the surface: 8px for small rows and selects, 10px for buttons, inputs, stats, events and callouts, 12px for Bestiary entries, dynasty boxes and room codes, and 14px for panels, cards and the board. Chips, tags and toasts are full pills. Borders are 1px Mossy Line by default; heirloom cards use a 2px rarity-coloured border, perk rows a 4px rarity-coloured left edge, and the room code a 2px dashed gold border. Bestiary portraits sit in a radial vignette from moss to night.

## Components

### Buttons
Quiet, solid and thumb-friendly; gold only when it's the move.
- **Shape:** gently rounded (10px), 1px Mossy Line border, bold label (700), `touch-action: manipulation`.
- **Default:** Lichen Moss fill with Old Parchment text.
- **Primary:** Keep Gold fill, Gold Ink text and a Keep Gold Deep border; it brightens to Keep Gold Bright on hover. Use at most one per group.
- **On (toggled):** Leaf On fill, Spring Leaf border and Leaf On Ink text, for Sound, Music and Auto when on.
- **Glow:** gold border and text with the gold glow, for drawing attention to a pending reward or choice.
- **Versus:** the full-width two-player button in Dark Lord Night, Dark Lord Edge and Dark Lord Ink.
- **Hover / Focus:** hover lifts the border to Faded Parchment. Focus is a 2px Keep Gold outline offset by 2px. Disabled buttons fade to 45% opacity.

### Chips
- **Style:** a pill on Lichen Moss with a Mossy Line border and 0.82rem text, usually led by a 26px canvas portrait of the monster.
- **Variants:** boss (Hearth Ember border, Ember Glow text) and flying (Wing Blue border). Linked chips get a gold border on hover and focus. Chips under "Later" are dimmed to 80%.

### Cards / Containers
- **Panels:** Deep Moss, 14px radius, 1px border, 14px padding, a display-font gold title, and hints in Faded Parchment.
- **Overlay cards:** Deep Moss on a translucent night scrim over the board, up to 440px wide (780px in modals), 20–22px padding, Card float shadow, and scroll inside when tall.
- **Events:** a Lichen Moss row with a coloured border that names its kind: ember (bad), leaf (good) or gold (a choice). The title is in the display font.
- **Heirloom cards:** a 2px rarity border, a top-down rarity tint gradient (20% of the rarity colour into Lichen Moss) and a small uppercase rarity label. They rise 3px on hover over 0.15s. Legendary adds the gold glow.

### Inputs / Fields
- **Style:** a Night Forest well with a 1px Mossy Line border, 10px radius, Parchment text and a 1.05rem font. Field labels are small uppercase Faded Parchment captions.
- **Focus:** the same 2px Keep Gold outline as buttons.
- **Codes:** room codes and code entry use the monospace face at 800 weight with wide tracking. A room code sits in a dashed gold frame and selects all on tap.

### Navigation
There is no navigation chrome. The top bar is the HUD (stat pills) plus the fixed control grid, and the sidebar is a stack of panels. Secondary screens open as modals or as cards over the board.

### HUD Stat
A Deep Moss pill (10px radius) with a tiny uppercase caption and a large tabular 800-weight number. Gold is coloured Keep Gold, the castle's hearts Heart Rose, and the Dark Lord's dread Dark Lord Violet.

### Defender Tile
A palette button with a 44px canvas portrait, a name and a Frost uppercase role label underneath, and the gold cost below that. A tile you can't afford fades to 55% with an ember cost; a locked tile fades to 45%; the active tile gets a gold border on a lighter moss fill. Tiles are drag sources: `touch-action: none`, no text selection, and a grab cursor.

### Leaderboard Row
Four columns (rank, name, level, badges) on a faint alternating stripe. Your own row gets a 14% gold tint, and first place has a gold rank.

## Do's and Don'ts

### Do:
- **Do** keep saturated colour on the canvas board, and keep the interface in Night Forest, Deep Moss and Lichen Moss with Parchment text.
- **Do** give each screen or group at most one solid Keep Gold primary button, the next thing to do.
- **Do** use the existing semantic families: Hearth Ember for danger and bosses, Frost for tower roles and info, Spring Leaf for gains and good events, and Dark Lord Violet only for the Dark Lord, two-player mode and Epic.
- **Do** set names and headings in Uncial Antiqua at weight 400, and everything else in Alegreya Sans with tabular figures for changing numbers.
- **Do** separate surfaces with a one-step tonal lift and a 1px Mossy Line border, and keep shadows for things that float.
- **Do** use the 2px Keep Gold focus outline (2px offset) on every interactive element.
- **Do** check every change at phone width, in phone landscape (520px tall or less) and in full-screen mode.

### Don't:
- **Don't** move, resize or reflow the top control grid when a label or state changes.
- **Don't** use violet for anything but the Dark Lord, two-player mode and Epic heirlooms.
- **Don't** use solid gold as decoration or for two competing buttons, or use gold glow for ordinary hover states.
- **Don't** put drop shadows on panels, buttons, chips or stats.
- **Don't** set body text, numbers or button labels in the uncial display font.
- **Don't** load images or new external assets for the interface. Art is drawn on canvas, and the only outside resource is the two Google Fonts.
