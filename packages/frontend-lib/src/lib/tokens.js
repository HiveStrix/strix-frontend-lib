// The tokens, a second time, as a string.
//
// WHY THIS EXISTS AND IS NOT A DUPLICATE
//
// Strix ships two kinds of frontend and they consume tokens differently:
//
//   • A SvelteKit app (the Shell, Sarion) loads `tokens.css` into the document.
//     Custom properties inherit down normally and everything just works.
//
//   • A Core module is a Svelte custom element rendering in an OPEN SHADOW ROOT
//     under a strict CSP. Custom properties DO inherit across the shadow
//     boundary, so a module mounted inside the Shell picks the document's
//     tokens up for free — but a module must also work when nothing above it
//     defined them, and it cannot @import a stylesheet the CSP forbids. So it
//     needs to carry its own copy on `:host`.
//
// Keeping the copy here, generated from one source of truth, is the difference
// between "two places to change a colour" and "one place, two shapes". The CSS
// file is written from THIS object at build time — never edit tokens.css by
// hand; edit `TOKENS` and run `npm run tokens`.

/** The light theme: role tokens, tones, and the scales. */
export const TOKENS = {
  // Neutrals. Very slightly cool, never blue-grey.
  '--sx-n-0': '#FFFFFF',
  '--sx-n-50': '#F5F6F7',
  '--sx-n-100': '#EAECED',
  '--sx-n-150': '#DFE1E3',
  '--sx-n-200': '#CFD2D4',
  '--sx-n-300': '#B2B6B9',
  '--sx-n-400': '#8B9094',
  '--sx-n-500': '#6C7175',
  '--sx-n-700': '#3C4145',
  '--sx-n-800': '#24282B',
  '--sx-n-900': '#14181A',

  // Surfaces and ink, named by ROLE so a dark theme is a re-binding.
  '--sx-ground': 'var(--sx-n-50)',
  '--sx-surface': 'var(--sx-n-0)',
  '--sx-sunk': 'var(--sx-n-100)',
  '--sx-line': 'var(--sx-n-150)',
  '--sx-edge': 'var(--sx-n-200)',
  '--sx-ink': 'var(--sx-n-900)',
  '--sx-ink-2': 'var(--sx-n-700)',
  '--sx-ink-3': 'var(--sx-n-500)',
  '--sx-ink-on': 'var(--sx-n-0)',

  // The accent SLOT. Unbound: resolves to near-black, a real usable primary.
  // A product overrides these four once, at its root.
  '--sx-accent': 'var(--sx-n-900)',
  '--sx-accent-ink': 'var(--sx-n-0)',
  '--sx-accent-soft': 'var(--sx-n-100)',
  '--sx-accent-edge': 'var(--sx-n-200)',

  // Semantic tones. Fixed across every product: "vencido" must look identical
  // in maintenance, billing and inventory or the vocabulary stops being one.
  '--sx-positive': '#2E6B3E',
  '--sx-positive-band': '#E4EFE2',
  '--sx-positive-edge': '#C3D8C4',
  '--sx-attention': '#8A5A00',
  '--sx-attention-band': '#FBEEDA',
  '--sx-attention-edge': '#E8D4A6',
  '--sx-critical': '#B3261E',
  '--sx-critical-band': '#FBE0DC',
  '--sx-critical-edge': '#EFC2BC',
  // Muted indigo, deliberately not blue: blue chrome is what every ERP already
  // looks like, and this is the one convention the system declines.
  '--sx-info': '#4A4E7A',
  '--sx-info-band': '#E7E7F2',
  '--sx-info-edge': '#C9CADD',
  '--sx-neutral': 'var(--sx-n-500)',
  '--sx-neutral-band': 'var(--sx-n-100)',
  '--sx-neutral-edge': 'var(--sx-n-200)',

  // Depth comes from light, not outlines. Real offset, soft blur — a
  // zero-offset halo is glow, which is decoration.
  '--sx-e-1': '0 1px 2px rgba(20,24,26,.06), 0 1px 1px rgba(20,24,26,.04)',
  '--sx-e-2': '0 6px 16px -4px rgba(20,24,26,.10), 0 2px 6px -2px rgba(20,24,26,.06)',
  '--sx-e-3': '0 24px 48px -16px rgba(20,24,26,.26), 0 6px 14px -6px rgba(20,24,26,.12)',
  '--sx-e-inset': 'inset 0 1px 0 rgba(255,255,255,.6)',

  // Nothing square, and nothing nearly-square: 2px reads as a rendering error.
  '--sx-r-1': '7px',
  '--sx-r-2': '11px',
  '--sx-r-3': '16px',
  '--sx-r-pill': '999px',

  // Major third off 15 — the smallest size that survives a dirty screen at
  // arm's length.
  '--sx-t-2xs': '11px',
  '--sx-t-xs': '12.5px',
  '--sx-t-sm': '13.5px',
  '--sx-t-md': '15px',
  '--sx-t-lg': '19px',
  '--sx-t-xl': '25px',
  '--sx-t-2xl': '33px',
  '--sx-t-3xl': '46px',
  '--sx-w-normal': '400',
  '--sx-w-medium': '550',
  '--sx-w-semi': '620',
  '--sx-w-bold': '700',

  // A system stack by constraint: @font-face inside a shadow root is ignored by
  // Chrome and Safari, so an embedded face would silently not load in exactly
  // the surfaces this library exists to serve. Personality comes from
  // treatment — weight contrast, negative tracking, tabular figures.
  '--sx-font':
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI Variable Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  '--sx-font-mono':
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Roboto Mono", monospace',

  // Quarters of a 16 rhythm. Every gap in the system is one of these.
  '--sx-s-1': '4px', '--sx-s-2': '8px', '--sx-s-3': '12px', '--sx-s-4': '16px',
  '--sx-s-5': '20px', '--sx-s-6': '24px', '--sx-s-8': '32px', '--sx-s-10': '40px',
  '--sx-s-12': '48px', '--sx-s-16': '64px', '--sx-s-20': '80px',

  // Motion earns its place by doing a job. Never ambience.
  '--sx-ease': 'cubic-bezier(.2, .8, .2, 1)',
  '--sx-fast': '120ms',
  '--sx-beat': '220ms',
  '--sx-slow': '380ms',

  // The veil behind anything that took the screen. It is a ROLE and not a mix
  // of the neutral ramp, because the ramp does NOT re-bind in dark: mixing
  // `--sx-n-900` over an `--sx-n-900` ground is exactly nothing, at any
  // percentage, and three components had independently discovered that and
  // patched around it three different ways.
  '--sx-scrim': 'rgba(20, 24, 26, .46)',

  '--sx-touch': '44px',
  '--sx-z-sticky': '40',
  '--sx-z-overlay': '900',
  '--sx-z-toast': '1100'
};

/** Dark is a re-binding of the roles, never a second stylesheet. */
export const TOKENS_DARK = {
  '--sx-ground': 'var(--sx-n-900)',
  '--sx-surface': 'var(--sx-n-800)',
  '--sx-sunk': '#1B1F22',
  '--sx-line': '#2C3134',
  '--sx-edge': '#3A3F43',
  '--sx-ink': '#EDEFF0',
  '--sx-ink-2': '#BCC1C4',
  '--sx-ink-3': '#8E9498',
  '--sx-ink-on': 'var(--sx-n-900)',
  '--sx-accent': '#EDEFF0',
  '--sx-accent-ink': 'var(--sx-n-900)',
  '--sx-accent-soft': '#2C3134',
  '--sx-accent-edge': '#3A3F43',
  // The bands invert to low-chroma fills: a pale band with dark text does not
  // survive being dropped onto a dark ground.
  '--sx-positive': '#8FCB9B', '--sx-positive-band': '#1D2C21', '--sx-positive-edge': '#2E4436',
  '--sx-attention': '#E7BE72', '--sx-attention-band': '#2E2415', '--sx-attention-edge': '#48381E',
  '--sx-critical': '#F0A79E', '--sx-critical-band': '#331B18', '--sx-critical-edge': '#4D2823',
  '--sx-info': '#ACADD6', '--sx-info-band': '#1F2033', '--sx-info-edge': '#33344F',
  '--sx-neutral': 'var(--sx-n-400)', '--sx-neutral-band': '#23272A', '--sx-neutral-edge': '#3A3F43',
  // Heavier in dark, and pure black rather than the ramp: on a near-black ground
  // the only thing that still reads as «behind» is more absence of light.
  '--sx-scrim': 'rgba(0, 0, 0, .62)',
  '--sx-e-1': '0 1px 2px rgba(0,0,0,.4)',
  '--sx-e-2': '0 6px 16px -4px rgba(0,0,0,.5), 0 2px 6px -2px rgba(0,0,0,.4)',
  '--sx-e-3': '0 24px 48px -16px rgba(0,0,0,.6), 0 6px 14px -6px rgba(0,0,0,.45)',
  '--sx-e-inset': 'inset 0 1px 0 rgba(255,255,255,.05)'
};

const decls = (o) => Object.entries(o).map(([k, v]) => `  ${k}: ${v};`).join('\n');

/**
 * The tokens as a CSS block for a given selector.
 *
 * A Core module calls `hostTokens()` and drops the result into its root
 * component's own <style>, so the very first paint is already themed and the
 * module owes the document nothing. A SvelteKit app imports `tokens.css`
 * instead and never touches this.
 */
export const hostTokens = (selector = ':host') =>
  `${selector} {\n${decls(TOKENS)}\n}\n`;

export const hostTokensDark = (selector = ':host([data-sx-theme="dark"])') =>
  `${selector} {\n${decls(TOKENS_DARK)}\n}\n`;

/**
 * The three type registers, the focus rule and the screen-reader-only rule, as
 * a string, for the same reason `hostTokens` exists.
 *
 * Components in this library write `class="sx-cap"`, `class="sx-num"`,
 * `class="sx-id"` and `class="sx-sr"` on their own markup. In a document those
 * classes come from `base.css`. In a shadow root they come from NOWHERE unless
 * the module carries them, and the failure is silent and ugly: labels stop
 * being uppercase, figures stop lining up, and every visually-hidden name in a
 * Table paints itself on screen. So a Core inlines `hostTokens() + hostBase()`
 * in its root component's `<style>` and the classes are true in both shapes.
 *
 * The reset (`box-sizing`, `body`) is deliberately NOT here: a shadow root has
 * no body, and `*` inside one is the module's own business.
 */
export const hostBase = () => `
.sx-cap {
  font-size: var(--sx-t-2xs);
  font-weight: var(--sx-w-semi);
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--sx-ink-3);
}
.sx-id { font-family: var(--sx-font-mono); font-size: .94em; letter-spacing: -.015em; }
.sx-num {
  font-variant-numeric: tabular-nums lining-nums slashed-zero;
  font-feature-settings: "tnum" 1, "lnum" 1, "zero" 1;
}
.sx-sr {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap; border: 0;
}
:focus-visible { outline: 2px solid var(--sx-ink); outline-offset: 2px; border-radius: var(--sx-r-1); }
:host([data-sx-theme="dark"]) :focus-visible { outline-color: var(--sx-n-0); }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}
`;

/** What `tokens.css` is generated from. Keeps the two shapes honest. */
export const stylesheet = () =>
  `${hostTokens(':root')}\n${hostTokensDark(':root[data-sx-theme="dark"], .sx-dark')}`;
