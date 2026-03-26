# Lumity

Personal "second brain" meets content sharing — a desktop-first web app where Save = Post. The same content object exists privately or publicly via a visibility toggle. The aesthetic sits "between Notion and Instagram" — calm, editorial, intentional.

## Product Philosophy

Lumity is a media platform for people who think for themselves. It is not a social network. It is not a productivity tool. It is a home — a place where your intellectual life lives, and where you connect with others who share your commitment to thoughtful engagement with ideas.

### The Two Layers

Lumity has a private layer and a public layer. They are distinct and both matter.

**Private (Mind):** Personal tracking, reading states, saved items, notes. This is the user's own library. Sacred. Never shown to others unless explicitly made public. Should feel warm, personal, and lived-in.

**Public (Profile/Stream):** Collections, shared recommendations, public shelves. This is how a user presents their intellectual identity to the community. Should feel curated and intentional, not performative.

### Cultural North Star

"A home for people who think for themselves."

Every design and product decision should ladder up to this. When in doubt, ask: does this make Lumity feel more like a home, or more like a platform?

### The Community We're Building

Our ICP is not a demographic — it's a worldview. They are politically thoughtful, not partisan. Strong beliefs loosely held. Tired of noise and polarization. They want to protect their attention, engage across disagreement with curiosity, and be part of something that takes ideas seriously.

### Design Principles

- Warm over sterile. Lived-in over minimal.
- Depth over virality. Taste over popularity.
- Privacy is a feature, not a footnote.
- Empty states are cultural moments, not placeholders.
- The founder's voice and worldview should be subtly present throughout.
- Never optimize for engagement at the expense of intentionality.

### Language

- Users → Community members or Curators
- "Follow" → "Join X's community"
- Avoid vanity metric language
- Write like a thoughtful person, not a growth team

## Project Structure

All source code lives in this directory (`/Users/jeffreykeil/Dev/LUMITY ONE SHOT/`).

## Stack

- **React 19** + **TypeScript** (strict mode, ES2023 target)
- **Vite 8** with `@vitejs/plugin-react` (Oxc transform)
- **Tailwind CSS v4** via `@tailwindcss/vite` — uses `@theme` directive and cascade layers
- **React Router v7** — flat 4-page routing (Home, Stream, Mind, Self)
- **Lucide React** for icons
- **No backend** — all data is mock (`src/data/mock.ts`)

## Architecture

```
src/
├── pages/           # Route-level views: Home, Stream, Mind, Self
├── components/      # Shared UI: NavRail, ContextPanel, CaptureSheet, panels
│   └── cards/       # ContentCard (large/medium/compact), AvatarCircle, carousel, etc.
├── context/         # AppContext (all app state), ThemeContext (theme switching)
├── data/            # mock.ts — types, mock data, helper functions
├── assets/          # Static images/SVGs
├── App.tsx          # Router + layout shell
├── main.tsx         # React root
└── index.css        # Tailwind @import + @theme tokens + custom animations
```

**Layout:** 220px NavRail (left) + main canvas (max 960px) + 400px conditional ContextPanel (right). Notifications and Messages panels are overlays. CaptureSheet is a modal.

## Design System

### Themes

Three themes selected via `data-theme` attribute on `<html>`:

| Theme | Surface | Accent | Vibe |
|-------|---------|--------|------|
| **Lumity** (default) | warm cream `#F6F5F1` | terracotta `#B5603B` | editorial, warm |
| **Midnight Compass** | very dark `#0E0E13` | gold `#C9A84C` | focused, nocturnal |
| **Stone & Sage** | pale beige `#F0EDE7` | olive `#4A6741` | grounded, natural |

### Tokens

- **Surfaces:** `surface-0` through `surface-3` (background layers, lightest to darkest)
- **Ink:** `ink-1` through `ink-4` (text hierarchy, strongest to faintest)
- **Borders:** `rule`, `rule-faint`
- **Accent:** `warm`, `warm-hover`, `warm-surface`
- **Fonts:** Inter (`--font-sans`) for UI, Lora (`--font-reading`) for reading content

### CSS Rules

- All custom CSS must go inside `@layer base` to avoid overriding Tailwind utilities
- Use Tailwind utility classes — no CSS modules or CSS-in-JS
- Color classes reference tokens: `bg-surface-1`, `text-ink-2`, `border-rule`
- Custom animations available: `.anim-fade-up`, `.anim-fade-in`, `.anim-slide-right`, `.anim-scale-in`
- Base font size: 15px

## State Management

Two React Context providers, no external state library:

- **AppContext** (`useApp()`) — view modes, selected item, panel visibility, feed/library data, filters, capture sheet state. `addItem()` pushes to frontend arrays only.
- **ThemeContext** (`useTheme()`) — current theme, `isTelos` boolean (true for midnight/stone themes, used to vary branding language)

## Key Patterns

### Content Model

```typescript
type ContentItem = {
  type: 'article' | 'book' | 'podcast' | 'video' | 'thought'
  title?: string        // thoughts have no title
  source?: string
  caption?: string
  visibility: 'private' | 'public'
  state: 'saved' | 'in-progress' | 'completed' | 'favorites'
  interests: string[]
  collections: string[]
  // ... plus thumbnail, author, likes, comments, dates, isPinned
}

interface Collection {
  id: string
  name: string
  count: number           // display count (not derived from libraryItems)
  description?: string    // editorial description shown in overview + room header
  visibility: 'private' | 'public'
}
```

- **Thoughts** render differently: warm-surface background, italic caption, no title
- **External content** (articles, books, etc.): title, source, thumbnail, type label
- **feedItems** must NOT have `collections` values set — collections are personal library data only. Feed items that get pulled into `libraryItems` via `feedItems.slice(0, n)` will inherit collections tags, causing phantom items.

### ContentCard Sizes

- `large` — full-width hero cards in stream view
- `medium` — fixed 260px, used in carousels (default)
- `compact` — grid cells, minimal layout
- `fluid` prop — card fills its grid cell width

### View Modes

- **Stream:** "Scroll" (vertical feed) vs "Scan" (interest-grouped carousels)
- **Mind (Library):** Sidebar with reading states (Saved / In Progress / Completed / Favorites) + Collections nav. Main area has Grid/List toggle. `libraryFilter === 'all' && !libraryCollection` renders the collections overview grid. Clicking a collection sets `libraryCollection` and shows the room view.
- **Self (Profile):** "At a Glance" (shelves/carousels) vs "Feed" (vertical)

### CollectionMosaic

Defined locally in `Mind.tsx`. Fills its parent container — always wrap in a sized `div`. Smart layout by thumbnail count:

| Count | Layout |
|-------|--------|
| 0 | Placeholder (warm-surface + library icon) |
| 1 | Single full image |
| 2 | Side-by-side (`grid-cols-2`, 1 row) |
| 3–4 | 2×2 grid (`grid-cols-2 grid-rows-2`) — `grid-rows-2` is required for correct height in a fixed container |

`getCollectionMosaicThumbnails(name, max)` in `mock.ts` returns up to `max` thumbnails from `libraryItems` for a given collection name.

## Naming Conventions

- Components: PascalCase files and exports (`ContentCard.tsx`)
- Context hooks: `useApp()`, `useTheme()`
- Helper functions: camelCase (`getFriendActivity()`, `getRecommendations()`)
- Mock data helpers live in `src/data/mock.ts` alongside type definitions

## Dev Server

```bash
npm run dev
# Runs on http://localhost:5173 by default
# .claude/launch.json configures Claude Code preview on port 5174
```

## Important Notes

- Design is the product — aesthetic choices are intentional and load-bearing, not decoration
- Desktop-first layout with fixed widths; not mobile-responsive yet
- Z-index layering: panels at z-40, modals at z-50–61
- No persistence or API calls — everything is in-memory mock data
