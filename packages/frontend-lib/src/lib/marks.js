// THE FIVE SHAPES. One alphabet, one file.
//
// A tone in this system never travels alone: it arrives as a tone, a MARK and a
// word. The mark is the half that survives a photocopy, a dirty screen in the
// sun, and a reader who cannot separate green from amber — so it is drawn to be
// told apart by SHAPE at 9px, and the five shapes never change meaning:
//
//   positive   a tick        it is done, it is fine, it is within the plan
//   attention  a triangle    look at this before it becomes the next one
//   critical   a square      it is over the line
//   info       a ring        this is a fact about the record, not about its state
//   neutral    a bar         a count, a group, a thing with no state at all
//
// These lived in Pill.svelte AND in Alert.svelte, character for character, with
// a comment in each saying the other copy existed. Two copies of an alphabet is
// how a system ends up teaching two alphabets: somebody fixes the triangle on
// the pill and the banner keeps the old one, and now «revisar» is two shapes.
//
// Everything is inner SVG markup on a 12×12 grid, stroked or filled with
// `currentColor`, so a mark can never disagree with the tone it sits in. That is
// the same contract Menu's item icons use, one grid up (24×24).
export const MARKS = {
  positive:  '<path d="M1 6.5 4.5 10 11 2.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  attention: '<path d="M6 .8 11.6 10.8H.4z" fill="currentColor"/>',
  critical:  '<rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor"/>',
  info:      '<circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/>',
  neutral:   '<rect x="1.5" y="5" width="9" height="2" rx="1" fill="currentColor"/>'
};

/** The five names, in the order the catalogue shows them. */
export const TONES = ['positive', 'attention', 'critical', 'info', 'neutral'];

/** The mark for a tone, falling back to the one that claims nothing. */
export const markOf = (tone) => MARKS[tone] ?? MARKS.neutral;
