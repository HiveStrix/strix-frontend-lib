// How a figure becomes text, in one place.
//
// WHY THIS FILE EXISTS: every component in this family prints numbers, and a
// strip where one figure says «4 820 000» and the one beside it says
// «4,820,000» has stopped being one instrument. Costa Rica groups with a space
// and separates decimals with a comma, so the locale is `es-CR` and it is
// stated once rather than six times.
//
// NOTE FOR THE UNIFYING PASS: this is a metric-family copy of something the
// whole ecosystem needs. If a shared `src/lib/format.js` lands, delete this and
// import from there — nothing here is metric-specific.

const cache = new Map();

/** An `Intl.NumberFormat` per decimal setting, built once. */
function nf(decimals) {
  const key = decimals ?? 'auto';
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(
      'es-CR',
      decimals == null
        ? { maximumFractionDigits: 1 }
        : { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
    );
    cache.set(key, f);
  }
  return f;
}

/**
 * A value as a figure. Strings pass through untouched — a caller that already
 * formatted money («₡4 820 000») knows more about it than this file does.
 *
 * `null`, `undefined` and `''` are NOT zero and never become «0»: they return
 * an em dash, and the component decides what sentence goes beside it.
 */
export function fmtNum(v, decimals) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'string') return v;
  const n = Number(v);
  return Number.isFinite(n) ? nf(decimals).format(n) : '—';
}

/** True when a value is absent — which is a different fact from being zero. */
export const isBlank = (v) => v === null || v === undefined || v === '' || Number.isNaN(v);

/** The numeric part of a value, or `null` when there is not one to be had. */
export function numOf(v) {
  if (isBlank(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** A share, already rounded for reading: 0.8342 → «83 %». */
export const fmtShare = (part, whole) => {
  const p = numOf(part);
  const w = numOf(whole);
  if (p === null || !w) return '';
  return `${nf(0).format(Math.round((p / w) * 100))} %`;
};
