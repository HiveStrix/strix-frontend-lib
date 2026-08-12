// ═════════════════════════════════════════════════════════════════════════
// STRIX — the library's public surface.
//
// A consumer imports from HERE, never from a file path inside src/lib. That is
// what lets a component move, be renamed or be rewritten without breaking every
// app in the ecosystem — and it is the difference between a library and a
// folder of Svelte files that happen to live in one repo.
//
//   import { Button, Table, Pill, hostTokens } from '@strix/frontend-lib';
//   import { Field, Input, Select }            from '@strix/frontend-lib/form';
//
// Both work. The per-family entries exist because a Core module that only needs
// three form controls should not pull the table in, and the family index is
// also where the argument for that family is written down — read those headers
// before choosing a component; they are the actual documentation.
//
// This file used to export two things out of fifty-four, which meant that in
// practice nobody could consume the library at all.
// ═════════════════════════════════════════════════════════════════════════

// ── The system itself ────────────────────────────────────────────────────
// The tokens as data and as CSS-for-a-shadow-root; the five tone marks; the
// three type registers. See README.md for which shape a given app needs.
export { TOKENS, TOKENS_DARK, hostTokens, hostTokensDark, hostBase, stylesheet } from './tokens.js';
export { MARKS, TONES, markOf } from './marks.js';

// ── The signature ────────────────────────────────────────────────────────
// A tone + a mark + a word, and never fewer than all three. Every Strix product
// says «vencido» this way. It sits at the root of src/lib rather than in a
// family because it is the vocabulary the families speak, not a member of one.
export { default as Pill } from './Pill.svelte';

// ── shell · the quiet family ─────────────────────────────────────────────
// Surfaces, depth, air and order. Nothing here says anything, so that the
// things that DO say something are the only things on screen with an opinion.
export {
  Card, Panel, Well, Stack, Row, Divider, Toolbar, Sheet, Tooltip,
  Glyph, GLYPHS, GLYPH_PATHS
} from './shell/index.js';

// ── action · what makes something happen ─────────────────────────────────
// One primary per view. That is why Button's default variant is `outline`.
export { Button, ButtonGroup, IconButton, Menu, SplitButton } from './action/index.js';

// ── form · everything a person answers with ──────────────────────────────
// Field is the wrapper; every text-like control is that Field plus one element,
// which is why they line up without anybody arranging them.
export {
  Field, Input, NumberInput, Textarea, Select, Combobox,
  Checkbox, Radio, Switch, DateInput, FileDrop, ChoiceCards, today
} from './form/index.js';

// ── nav · where am I, what am I looking at, how do I get to the other thing ─
export {
  PageHeader, Breadcrumb, Tabs, Segmented, FilterChips,
  SearchField, Pagination, SideRail, ShortcutOverlay
} from './nav/index.js';

// ── data · the surfaces that show many records at once ───────────────────
export { Table, DataList, DataState, DataSkeleton } from './data/index.js';

// ── feedback · everything the system says back ───────────────────────────
export {
  Dialog, Confirm, Toast, Alert, EmptyState, ErrorState,
  Skeleton, Progress, ReviewPanel
} from './feedback/index.js';

// ── metric · the figures ─────────────────────────────────────────────────
export {
  Stat, StatStrip, Bar, StackedBar, Sparkline,
  fmtNum, fmtShare, isBlank, numOf
} from './metric/index.js';
