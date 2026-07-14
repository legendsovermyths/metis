// The italic "M" monogram — a faint stamp pinned to the viewport, behind the content.
// `fixed` so it stays put while the page scrolls; `-z-10` so it sits above the page
// background but beneath the (transparent-backed) content; its own overflow-hidden layer
// clips the bleed so it never adds a scrollbar.
export function Watermark() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden md:block" aria-hidden>
      <span
        className="absolute -bottom-16 -right-6 select-none font-display font-light italic leading-none"
        style={{ fontSize: "44vh", color: "hsl(var(--foreground) / 0.022)", lineHeight: 0.8 }}
      >
        M
      </span>
    </div>
  );
}
