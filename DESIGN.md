# Metis — Design Language

This document is the source of truth for the look and feel of the Metis frontend. Read it
before you add a screen, a modal, or any new surface. The goal is simple: a new contributor
(human or agent) should be able to build something that feels like it was always part of the
app, without inventing new visual vocabulary.

If you find yourself reaching for a color, font, radius, or animation that isn't described
here, stop — either it already exists under a different name, or it's a deliberate enough
choice that it should be added to this document first.

---

## 1. The feeling we're going for

Metis is named after the Greek goddess of cunning wisdom. The interface is meant to read like
a **private athenaeum** — a quiet, literary study, not a SaaS dashboard. Concretely:

- **Editorial, not appy.** Think printed page: mastheads, folio numbers, drop caps, a colophon
  at the foot of the page. The chrome stays out of the way; typography and whitespace lead.
- **Warm and paper-like.** Off-white parchment backgrounds, ink-brown text, a single amber
  accent that behaves like a fountain-pen flourish. No bright blues, no neon, no gradients-as-decoration.
- **Calm motion.** Things *blur in* and *draw in* rather than slide and bounce. Animation is a
  reveal, never a spectacle.
- **Restraint.** Soft shadows, hairline rules at low opacity, transparent + blurred bars. When
  in doubt, do less.

The interface should disappear so the content (the journey, the lesson, the conversation) is
what the user sees.

---

## 2. Foundations (tokens)

All design tokens live as CSS variables in [`src/index.css`](src/index.css) and are surfaced to
Tailwind in [`tailwind.config.ts`](tailwind.config.ts). **Always use tokens — never hardcode
a hex color or a raw font name.** Light and dark are both defined; if you use the tokens, dark
mode comes for free.

### Color

| Token (Tailwind class)        | Role |
|-------------------------------|------|
| `bg-background`               | The page. Warm off-white / near-black in dark. |
| `bg-card`                     | Raised opaque surfaces (true white in light). |
| `bg-surface` / `bg-surface-hover` | Insets: inputs, list rows, staged items, hover fills. |
| `text-foreground`             | Primary text & headings (ink brown). |
| `text-text-secondary`         | Body copy, secondary prose. |
| `text-text-tertiary`          | Metadata: mastheads, folios, whisper labels, hints. |
| `border-border`               | All rules and outlines. **Almost always used with an opacity** (`/40`, `/30`, `/20`). |
| `amber` (`text-amber`, `bg-amber-soft`, `bg-amber-muted`) | The **one** accent. See below. |

**The amber rule.** Amber (`hsl(var(--amber))`) is the only chromatic accent in the app. Use it
sparingly and intentionally: the drawn rule under a heading, the active-nav underline/dot, a
progress arc, thinking dots, a focused drop-zone. It is a flourish, not a fill. For one-off
strengths/opacities, apply it inline so the intent is visible:

```tsx
<div
  className="h-px w-12 mt-5 mb-4 animate-reveal-line"
  style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
/>
```

Tints `amber-soft` / `amber-muted` exist for backgrounds (e.g. an active drop zone). Do not
invent new accent hues.

### Typography

Two families, loaded in `index.css`:

- **`font-display` → Lora** (serif). Headings, brand, and — importantly — *italic body voice*.
  Metis "speaks" in serif italic.
- **`font-sans` → Plus Jakarta Sans** (default `body`). UI text, controls, dense data.

Reusable type utilities (defined in `index.css`):

- **`.display-hero`** — Lora 600 italic, tight tracking, `0.95` line-height. The brand wordmark
  and page hero titles. Pair with a size: `display-hero text-5xl`.
- **`.label-whisper`** — 10px, weight 300, `0.15em` tracking, uppercase. Eyebrow labels above
  headings and section kickers. Always `text-text-tertiary`.
- **`mastheadStyle`** (from [`src/lib/editorial.ts`](src/lib/editorial.ts)) — the inline style for
  the top/bottom rails (10px, `0.22em` tracking, uppercase).
- **`font-display italic`** — used directly for Metis's prose voice, subtitles, button labels in
  conversational surfaces, and dialog descriptions.

Rules of thumb:
- Page/section **titles** → `display-hero` or `font-display`.
- Metis's **voice / literary prose** → `font-display italic`.
- **UI, forms, metadata, controls** → sans (the default).
- Use `text-balance` on headings that wrap.

### Radius, shadow, spacing

- Radius scales off `--radius` (0.75rem). `rounded-xl` for inputs and interactive elements,
  `rounded-lg` for cards/dialogs, `rounded-2xl` for large drop zones, `rounded-full` for dots,
  pills, and the floating task button.
- Shadows: `shadow-soft` → `shadow-medium` → `shadow-large` only. They are warm and faint by
  design; don't substitute Tailwind's default `shadow-*` on editorial surfaces.
- Spacing uses the standard 4/6/8/10/12 rhythm. Section gap inside a page is `py-10 md:py-12`;
  hero block bottom margin is `mb-12`.

---

## 3. The page skeleton

Almost every full page follows the same four-part editorial structure. Use
[`JourneysPage.tsx`](src/pages/JourneysPage.tsx) as the reference implementation.

```tsx
<div className="paper-texture relative min-h-[calc(100vh-57px)] overflow-hidden flex flex-col pb-20 md:pb-0">
  <div className="relative mx-auto w-full max-w-3xl flex-1 flex flex-col px-6 md:px-8">

    {/* 1. MASTHEAD — page identity + dateline + hairline */}
    <header className="pt-8 md:pt-10">
      <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
        <span>Metis · Log of Journeys</span>
        <span className="hidden sm:inline">
          {masthead.weekday} · {masthead.day} {masthead.month} · {masthead.yearRoman}
        </span>
      </div>
      <div className="mt-3 h-px w-full bg-border/40" />
    </header>

    <main className="flex-1 py-10 md:py-12">

      {/* 2. HERO — whisper kicker, display title, drawn amber rule, italic subtitle */}
      <section className="mb-12 animate-blur-in">
        <p className="label-whisper text-text-tertiary mb-3">Paths</p>
        <h1 className="display-hero text-5xl text-foreground">Journeys</h1>
        <div
          className="h-px w-12 mt-5 mb-4 animate-reveal-line"
          style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
        />
        <p className="font-display italic text-base text-text-secondary leading-relaxed max-w-md">
          Courses set, and the steps you've taken along them.
        </p>
      </section>

      {/* 3. CONTENT */}
    </main>

    {/* 4. COLOPHON — hairline + greek etymology + folio number */}
    <footer className="pb-8 md:pb-10">
      <div className="h-px w-full bg-border/30 mb-4" />
      <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
        <span>μῆτις · gr. mêtis — cunning intelligence</span>
        <span>—  fol. iii  —</span>
      </div>
    </footer>

  </div>
</div>
```

Key conventions baked into the skeleton:

- **`paper-texture`** on the outermost element for the faint paper grain.
- **`min-h-[calc(100vh-57px)]`** accounts for the desktop top nav height.
- **Content width**: `max-w-3xl` is the default reading column; `max-w-2xl` for focused
  detail/teaching, `max-w-5xl` for the library grid. Horizontal padding is `px-6 md:px-8`
  (the home cover page goes wider with `px-16`).
- **`pb-20 md:pb-0`** leaves room for the fixed mobile bottom nav.
- **Folio numbers** (`fol. i`, `fol. ii`, …) use `toRoman`/lowercase roman from `editorial.ts`
  and increment per page across the app. Mastheads & colophon use `mastheadStyle`.
- The hero block animates in with `animate-blur-in`; the amber rule draws with
  `animate-reveal-line`.

Decorative extras seen on cover/conversation surfaces: a giant low-opacity Lora **"M" watermark**
(`fontSize: "44vh"`, `color: "hsl(var(--foreground) / 0.022)"`) pinned to a corner.

---

## 4. Navigation & app shell

- Routing and the global provider stack live in [`App.tsx`](src/App.tsx). The chrome is
  [`AppNav`](src/components/AppNav.tsx), with the floating
  [`BackgroundTasksPanel`](src/components/BackgroundTasksPanel.tsx) and the global
  [`AgentInputDialog`](src/components/AgentInputDialog.tsx) mounted alongside.
- `AppNav` is **responsive by inversion**: a fixed bottom bar on mobile (icons + amber active
  dot) and a static top bar on desktop (`md:`) with text labels and an **amber bottom-border**
  on the active link. Both use `bg-*/opacity` + `backdrop-blur-xl` rather than a solid fill.
- Active-state convention: `text-foreground` + amber indicator when active, `text-text-tertiary`
  when not; lucide icon stroke `2` active / `1.5` inactive; `transition-colors duration-200`.
- The brand wordmark uses `display-hero`. The full-screen loading state is the word **Metis** in
  `font-display ... italic animate-pulse`.

Floating elements (nav, task button, sticky composer bars) are translucent + blurred:
`bg-background/90 backdrop-blur-xl` or `bg-card/80 backdrop-blur-xl`.

---

## 5. Modals & dialogs

Built on shadcn's Radix [`ui/dialog.tsx`](src/components/ui/dialog.tsx) (centered, `bg-black/80`
overlay, zoom+fade in). [`AgentInputDialog`](src/components/AgentInputDialog.tsx) is the canonical
Metis-styled dialog — match it:

- **Reset the default chrome**: `DialogContent` gets `p-0 overflow-hidden gap-0` and you lay out
  your own sections so you control padding and dividers.
- **Header** = whisper eyebrow + serif title (+ optional muted description):
  ```tsx
  <div className="px-6 pt-6 pb-4">
    <p className="label-whisper text-text-tertiary mb-2">Metis is asking</p>
    <DialogTitle className="font-display text-2xl text-foreground">{title}</DialogTitle>
    <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
      {prompt}
    </DialogDescription>
  </div>
  ```
- **Body** on `bg-surface` insets with `rounded-xl`; items entering a list animate with
  `animate-blur-in`.
- **Footer** is a divided action rail: `border-t border-border bg-surface/40 px-6 py-3`,
  right-aligned. The primary CTA is `bg-foreground text-background ... shadow-soft`; disabled is
  `bg-surface text-text-tertiary cursor-not-allowed`.
- Destructive confirmations use shadcn `AlertDialog`, but restyle the text to the serif voice
  (`font-display italic text-sm`), as the journey delete flow does.

Use `Dialog` for "Metis is asking" / focused input, `AlertDialog` for confirmations, and the
floating `Popover` pattern (see tasks panel) for ambient/background status — `align="end"
side="top" p-0`, then divided rows.

---

## 6. Motion

Defined once in `tailwind.config.ts` + `index.css`. Use these; don't write new keyframes for
one-offs.

| Animation | Use it for |
|-----------|-----------|
| `animate-blur-in` | **The default entrance.** Heroes, cards, list items, dialogue exchanges. Stagger with `style={{ animationDelay: \`${i * 60}ms\` }}` and cap the delay (`Math.min(i * 45, 400)`). |
| `animate-reveal-line` | The amber rule drawing in under a heading (`transformOrigin: "left"`). |
| `animate-fade-in` | Plain opacity reveal where blur is too much. |
| `animate-scale-enter` | Small interactive elements appearing. |
| `animate-pulse-soft` | Inline text cursor, gentle idle pulse. |
| `.thinking-dot` ×3 | The waiting/loading indicator (three `h-1.5 w-1.5 rounded-full bg-current` dots). Prefer this over spinners on editorial surfaces. |
| `math-pop` / `.metis-dropcap` / `.chat-image` | Conversation-surface specifics (KaTeX reveal, drop cap on Metis's first line, grayscale blended images). |

Easing is `cubic-bezier(0.16, 1, 0.3, 1)` — snappy-out, no bounce. Keep durations short.

---

## 7. Components & utilities

- **shadcn/ui** lives in [`src/components/ui`](src/components/ui). It's the structural foundation
  (Button, Card, Dialog, Popover, Badge, …) and inherits our tokens automatically. Prefer
  composing these over hand-rolling.
- Compose classes with **`cn()`** from [`src/lib/utils.ts`](src/lib/utils.ts) (clsx + tailwind-merge)
  so conditional/override classes resolve cleanly. Variant-driven components use `cva`
  (see `ui/button.tsx`).
- Editorial helpers — `useMasthead`, `mastheadStyle`, `toRoman` / `toRomanLower`, `journeyGlyph`,
  `GLYPHS` — all live in [`src/lib/editorial.ts`](src/lib/editorial.ts). Reuse them; don't
  re-derive datelines, roman numerals, or glyph mappings.
- **Glyphs** (`∑ ∂ λ ∫ ⊥ ∇ Θ ◈ ◇ ψ`) are the app's iconography for journeys, empty states, and
  mode indicators — assigned via `journeyGlyph(id)`, rendered in `font-display italic`, with
  opacity tied to state (e.g. completion progress). Prefer a glyph over a generic icon for
  content identity.

**Empty states**: a large faded glyph + a short italic line, e.g.
`display-hero text-[8rem] text-foreground/[0.06]` over
`font-display italic text-base text-foreground/70 max-w-sm leading-relaxed`. Never a bare
"No items found."

---

## 8. Checklist for a new screen or modal

Before you open a PR, confirm:

- [ ] Built from tokens only — no raw hex, no raw font names, dark mode works untouched.
- [ ] **New page**: has the masthead → hero → main → colophon skeleton, `paper-texture`,
  `max-w-3xl` (or a justified alternative) reading column, and an incrementing `fol.` number.
- [ ] **Hero**: whisper kicker (`label-whisper`) + `display-hero`/`font-display` title + drawn
  amber `animate-reveal-line` rule + italic serif subtitle.
- [ ] Metis's voice/prose is **serif italic**; UI/controls/metadata are **sans**.
- [ ] Amber appears **once or twice as a flourish**, not as a fill.
- [ ] Entrances use `animate-blur-in` (staggered + capped); waiting states use `.thinking-dot`,
  not a spinner.
- [ ] **New modal**: shadcn `Dialog` with `p-0 gap-0`, whisper-eyebrow + serif title header,
  `bg-surface` body insets, a divided footer rail with `bg-foreground` primary CTA.
- [ ] Borders use `border-border` **with an opacity**; surfaces use `surface`/`card`; floating
  bars are translucent + `backdrop-blur-xl`.
- [ ] Radii follow the scale (`rounded-xl` controls, `rounded-lg` cards); shadows are
  `soft`/`medium`/`large`.
- [ ] Empty states use a faded glyph + an italic line.
- [ ] Reused `editorial.ts` helpers and `cn()`; didn't reinvent mastheads, romans, or glyphs.

When in doubt, open [`JourneysPage.tsx`](src/pages/JourneysPage.tsx) (pages) or
[`AgentInputDialog.tsx`](src/components/AgentInputDialog.tsx) (modals) and follow the pattern.
