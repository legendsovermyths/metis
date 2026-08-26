# [opus5] MATERIAL — The Model Its Author Disowned  ·  form: **story**

_Why this form:_ The punch is a human reversal — a man correctly proving his own idea worthless and walking away — and the counting argument only lands emotionally once you feel that abandonment. There is nothing to solve; there is something to realise.

## Material
```json
{
  "hook": "In 1925 a young physicist proved his own model could never do the one thing it was built to explain. He believed the proof, gave up research, and went to teach high school. The proof was correct. The conclusion was catastrophically wrong.",
  "beats": [
    {
      "beat": 1,
      "label": "setup — the model and the mission",
      "content": "Ernst Ising's doctoral thesis (Zeitschrift für Physik 31, 1925) studied the simplest imaginable magnet: a row of arrows, each either up or down, each paying an energy penalty only if it disagrees with its immediate neighbour. The question was whether such a thing could spontaneously magnetise — whether, cooled below some temperature, the arrows would agree with each other on their own. This was the whole point: to explain ferromagnetism from a minimal microscopic rule."
    },
    {
      "beat": 2,
      "label": "complication — the proof that kills it",
      "content": "In one dimension, Ising showed the answer is never. The argument in modern form is pure bookkeeping. Take a chain of N spins, all up. Introduce a single defect: pick one bond and flip everything to its right. Energy cost: exactly one broken bond — a fixed amount, independent of N. Entropy gain: you could have put that defect at any of about N places, so the free energy changes by (fixed cost) minus (temperature × log N). For any temperature above zero, log N eventually beats the fixed cost. Defects are free, they proliferate, order dissolves. No magnetism at any positive temperature."
    },
    {
      "beat": 3,
      "label": "the human turn — he believed himself",
      "content": "Ising took the result at face value: the model was wrong, too crude to describe real magnets. He published nothing further on it. He left research, taught school, survived the Nazi years, and eventually became a teaching professor in the United States. His model sat in the literature as a documented negative result — a tidy, correct, dead end."
    },
    {
      "beat": 4,
      "label": "reveal — the proof depended on the dimension",
      "content": "In 1936 Rudolf Peierls redid the bookkeeping on a square lattice. Now a defect is not a point but a closed loop — a domain wall separating up from down. Cost: proportional to the wall's length L, since every bond it crosses is broken. Entropy: a wall of length L is a self-avoiding closed path, and at each step it has at most about 3 choices of direction, so the number of such walls grows like 3^L; entropy pays about L·log 3. Both sides now scale with L. Energy and entropy are in a fair fight, and whoever has the better coefficient wins. Below a critical temperature, energy wins: long walls are exponentially suppressed, order survives. Onsager solved the 2D model exactly in 1944 and produced the critical temperature in closed form."
    },
    {
      "beat": 5,
      "label": "resonance — the discovery of his own fame",
      "content": "Ising reportedly learned around 1949, by reading the literature, that the model he had discarded as a failure had become one of the most-studied objects in physics — the canonical laboratory for phase transitions, critical exponents, and universality. The final irony: finding ground states of the 3D Ising model with general couplings is NP-hard (Barahona, 1982), so the object he judged too simple to be interesting is now a standard vehicle for encoding computationally intractable problems."
    }
  ],
  "the_reveal": "Ising's proof never said 'this model has no magnetism.' It said 'in a line, a defect costs fixed energy and buys log N entropy.' The word 'line' was doing invisible work — and in a plane the same bookkeeping flips sign: a wall costs energy proportional to its length and earns entropy only about length × log 3, so cold enough, order holds.",
  "lingering": "How many correct proofs are quietly load-bearing on an assumption nobody named — and what does it cost to stop working on something because your own argument convinced you?"
}
```

## Evolving diagram (5 beats)
- **step 1** — shows: A horizontal row of ~12 up-arrows on a line, all aligned, with small bond marks between neighbours. Label: '1D chain, all agree'.  
  _change:_ initial
- **step 2** — shows: Same chain, but everything to the right of one bond is flipped down; that single bond is highlighted in red and labelled 'cost: 1 bond'. A brace under the whole chain reads 'N places to put it → entropy ≈ log N'.  
  _change:_ Added the flipped right half, the red broken bond, and the entropy brace.
- **step 3** — shows: Same picture with an inequality annotation appearing beneath: 'fixed cost − T·log N < 0 for any T > 0', and the chain now shown speckled with several defects (mixed up/down) to signal dissolution of order.  
  _change:_ Added the free-energy inequality and multiplied the defects; the aligned chain is gone.
- **step 4** — shows: The line is replaced by a square lattice of arrows, mostly up, with one closed loop (domain wall) drawn on the dual lattice enclosing a shaded region of down-arrows. The loop is labelled 'length L'.  
  _change:_ Dimension changed from 1D to 2D; point defect became a closed loop bounding a shaded flipped island.
- **step 5** — shows: Same lattice and loop, now annotated on both sides: energy 'cost ∝ L' beside the red loop, and 'number of such loops ≈ 3^L → entropy ≈ L·log 3'; a small caption 'both scale with L → a fair fight → T_c exists'.  
  _change:_ Added the matched energy/entropy scalings and the critical-temperature verdict; diagram otherwise unchanged.