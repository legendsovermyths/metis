# [gemini31] MATERIAL — The Model Its Author Disowned  ·  form: **story**

_Why this form:_ The core of the insight is a dramatic historical irony—a scientist abandoning his own creation because of a geometric technicality, only to discover its fame decades later. This perfectly fits a narrative arc of setup, turn, and reveal.

## Material
```json
{
  "hook": "In 1925, a physicist mathematically proved his own model was a failure, quit research, and became a high school teacher—only to discover 25 years later that his name was famous.",
  "beats": [
    "Ernst Ising invented a simple mathematical model for magnetism: a lattice of atomic spins that want to align with their neighbors.",
    "He solved it for a 1D chain and found a fatal flaw. Above absolute zero, a flipped spin costs a tiny, fixed amount of energy, but creates enormous entropy because it can happen anywhere. In 1D, thermal disorder always wins.",
    "Because real magnets stay magnetic at room temperature, Ising concluded his model was physically wrong. He abandoned it, published nothing more on it, and left academia.",
    "But the math changes in 2D. Rudolf Peierls realized that on a 2D grid, a defect isn't just a point—it's a boundary wall around a flipped region. The energy cost grows with the length of the wall, which overpowers the entropy. The magnetism survives.",
    "In 1949, Ising was reading a physics journal and discovered his 'failed' model had been solved by Lars Onsager and was now the cornerstone of statistical mechanics.",
    "The ultimate irony came decades later: finding the lowest energy state of the 3D version was proven to be NP-hard. The model Ising abandoned for being too simple is actually computationally intractable."
  ],
  "the_reveal": "The model wasn't broken, the dimension was: moving from a 1D line to a 2D plane changed a defect from a point with fixed energy into a boundary whose energy scales with its length.",
  "lingering": "How many other discarded 'failed' models are just waiting for someone to look at them in a different dimension?"
}
```

## Evolving diagram (6 beats)
- **step 1** — shows: A 1D horizontal chain of arrows pointing UP.  
  _change:_ initial
- **step 2** — shows: The same 1D chain, but half the arrows are now pointing DOWN. The single boundary point between UP and DOWN is highlighted in red.  
  _change:_ Flipped half the arrows and highlighted the single, fixed-size defect.
- **step 3** — shows: A 2D grid of UP arrows.  
  _change:_ Expanded the 1D line into a 2D plane.
- **step 4** — shows: The 2D grid with an irregular 'island' of DOWN arrows in the center. The perimeter (domain wall) is highlighted in thick red.  
  _change:_ Flipped a 2D region of arrows and traced its boundary, showing the defect is now a perimeter with a scaling length.
- **step 5** — shows: A 3D lattice of arrows with a highly complex, jagged boundary separating UP and DOWN regions, with 'NP-HARD' text hovering.  
  _change:_ Extruded the grid into a 3D cube, making the boundary a complex, tangled surface.