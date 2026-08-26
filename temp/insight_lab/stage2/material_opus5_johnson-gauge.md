# [opus5] MATERIAL — Johnson's Reweighting Is a Gauge Transformation  ·  form: **puzzle**

_Why this form:_ The telescoping identity turns into a yes/no question with an objectively wrong-but-irresistible answer ('just add a big constant'), and the one-line proof is fully head-solvable; earning the impossibility yourself is what makes the gauge reveal land as discovery rather than assertion.

## Material
```json
{
  "setup": "Johnson's algorithm removes negative edge weights without disturbing shortest paths. The trick: pick any number h(v) on each vertex — a 'potential' — and replace every edge weight w(u,v) by w'(u,v) = w(u,v) + h(u) − h(v). Shortest paths between fixed endpoints keep their ranking, because along a path from s to t all the interior h-terms cancel and only h(s) − h(t) survives, the same constant for every s→t path. Now take the smallest possible test case: three vertices A, B, C, with directed edges A→B of weight 1, B→C of weight 1, and C→A of weight −3. One negative edge, that's all.",
  "question": "Does there exist a choice of h(A), h(B), h(C) — any real numbers you like, arbitrarily large, arbitrarily lopsided — that makes all three reweighted weights w' nonnegative?",
  "answer_format": "yes/no (plus, if no, the one-line reason)",
  "correct_answer": "No. No choice of vertex potentials can do it.",
  "the_trap": "The tempting answer is 'obviously yes'. Two seductive routes: (1) 'just add 3 to every edge weight' — the standard instinct for killing negatives, and it does make everything nonnegative; (2) 'crank h(C) way up, that pumps up the −3 edge'. Route (1) is the real seducer because it feels like the same kind of move, but adding a constant c to every edge is *not* of the form h(u) − h(v) — it shifts the total weight of a k-edge cycle by k·c, so it changes the object we were promised was untouched (and indeed it can flip which s→t path is shortest, when paths have different edge counts). Route (2) fails for a subtler reason: raising h(C) adds to edge C→A but subtracts the very same amount from edge B→C. Every potential you raise gives with one hand and takes with the other.",
  "solution_path": "Add up the three reweighted weights around the cycle A→B→C→A. Each h(v) appears exactly twice: once with a plus sign (on the edge leaving v) and once with a minus sign (on the edge entering v). Everything cancels. So w'(A,B) + w'(B,C) + w'(C,A) = 1 + 1 − 3 = −1, no matter what h you chose. Three nonnegative numbers cannot sum to −1. Done — no algebra, just telescoping around a loop. And nothing here used the number 3 or the number of vertices: the total weight of *every* closed walk is invariant under reweighting, so a negative cycle anywhere is an absolute obstruction. Gallai's theorem says that is the *only* obstruction: a feasible potential exists if and only if no cycle is negative — and Bellman–Ford, run from a super-source, hands you the potential h(v) = dist(v) when one exists, and hands you the offending negative cycle when it doesn't.",
  "payoff": "The vertex potential you invented as a hack is a gauge choice. w' − w = δh is a pure gradient (a coboundary) on the graph; the quantities it cannot touch are the cycle sums — the holonomies, the discrete field strength. So 'shortest paths are preserved' is gauge invariance, 'feasible potential' is a gauge in which the connection looks flat, and 'negative cycle' is nonzero curvature: trapped flux that no change of gauge can ever remove. Bellman–Ford is not merely a shortest-path routine; it is a gauge-fixing search, and its failure report is a topological obstruction — the discrete Poincaré lemma, returning an error code in a contest problem."
}
```

## Evolving diagram (5 beats)
- **step 1** — shows: Three vertices A, B, C in a triangle with directed arrows A→B labelled 1, B→C labelled 1, C→A labelled −3. The −3 is drawn in red.  
  _change:_ initial
- **step 2** — shows: Same triangle, now with a boxed symbol h(A), h(B), h(C) beside each vertex, and each edge label rewritten as '1 + h(A) − h(B)', '1 + h(B) − h(C)', '−3 + h(C) − h(A)'.  
  _change:_ added vertex potentials and rewrote all three edge labels in reweighted form
- **step 3** — shows: The same labels, but every h-term now carries a small cancellation mark: +h(A) on one edge struck through against −h(A) on another, same for h(B), h(C), with faint arcs pairing them.  
  _change:_ added strike-throughs and pairing arcs showing each potential appearing once with each sign
- **step 4** — shows: The triangle interior shaded, with a single central label 'cycle sum = −1, invariant' and the three edge labels collapsed back to 1, 1, −3.  
  _change:_ removed h-terms entirely, shaded the enclosed region, added the invariant total in the middle
- **step 5** — shows: Identical shaded triangle, relabelled in gauge language: vertex boxes annotated 'scalar potential χ', edge labels annotated 'A → A + ∇χ', the shaded interior labelled 'flux / curvature — cannot be gauged away'.  
  _change:_ relabelled the same unchanged picture with the electromagnetic dictionary; geometry untouched