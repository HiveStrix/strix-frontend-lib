<script>
  // A PLACEHOLDER THAT HAS THE SHAPE OF THE ANSWER.
  //
  // A spinner says "wait". A skeleton says "wait, and here is where the code,
  // the machine and the total are going to be" — so when the data lands nothing
  // moves, and a person who already started reading the header keeps reading.
  // That is the whole argument: a skeleton is not decoration, it is a promise
  // about layout that the real row then keeps.
  //
  // Two rules it must obey to be worth having:
  //   • It never claims a width it cannot honour. Give a column its real width,
  //     not a random one — a 40 % bar where a ₡1.480.000 goes teaches a lie.
  //   • It is invisible to assistive tech. The loading state announces itself
  //     ONCE, as a sentence, from whatever owns the region; forty shimmering
  //     bars announcing themselves is a denial-of-service on a screen reader.
  //
  //   <DataSkeleton w="9ch" />
  //   <DataSkeleton w="60%" h="var(--sx-s-5)" />

  /** Width of the bar. A `ch` value is usually the honest one. */
  export let w = '100%';
  /** Height. Defaults to a line of small text. */
  export let h = '';
  /** A round blob — an avatar, a status dot, a thumbnail. */
  export let round = false;
</script>

<span
  class="sk"
  class:round
  style="--sk-w:{w}{h ? `;--sk-h:${h}` : ''}"
  aria-hidden="true"
></span>

<style>
  /* Sunk, not surface: the placeholder is a hole in the card, and a hole reads
     as "not yet" where a raised block reads as "here is a thing". */
  .sk {
    display: block;
    width: var(--sk-w, 100%);
    height: var(--sk-h, .8em);
    border-radius: var(--sx-r-1);
    background: var(--sx-sunk);
    background-image: linear-gradient(
      90deg,
      var(--sx-sunk) 0%,
      var(--sx-line) 45%,
      var(--sx-line) 55%,
      var(--sx-sunk) 100%
    );
    background-size: 220% 100%;
    background-repeat: no-repeat;
    animation: sk-sweep 1.5s var(--sx-ease) infinite;
  }

  .sk.round { border-radius: var(--sx-r-pill); }

  @keyframes sk-sweep {
    from { background-position: 140% 0; }
    to   { background-position: -40% 0; }
  }

  /* Declared here and not left to base.css on purpose: a Core module renders in
     a shadow root, and the document's reduced-motion rule does not cross that
     boundary. Every component in this family carries its own. Stopped, not
     hidden — the shape is the useful half. */
  @media (prefers-reduced-motion: reduce) {
    .sk { animation: none; background-image: none; }
  }
</style>
