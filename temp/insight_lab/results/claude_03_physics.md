# [claude] Johnson's Reweighting Is a Gauge Transformation

*domain area: mathematical structure hidden in physics (symmetry, conservation, potentials, gauge)*

## Insight
In Johnson's algorithm you kill negative edge weights by picking a potential h on vertices and replacing w(u,v) with w(u,v)+h(u)−h(v). Shortest paths survive because along any closed walk the h-terms telescope to zero: the total weight of every cycle is untouched. That is precisely the structure of electromagnetic gauge freedom — h is the scalar potential, the change you make to the weights is a pure gradient (a coboundary), and the cycle sums are the gauge-invariant field. And the punchline is the discrete Poincaré lemma: a feasible potential exists if and only if no cycle has negative total weight — Bellman–Ford is not merely a shortest-path routine, it is a search for a gauge in which the connection looks flat, and the negative cycle it reports is exactly the obstruction, the trapped flux you can never gauge away.

- **The turn:** The vertex potentials you invent as an algorithmic hack are literally a gauge choice, and 'negative cycle' is the same kind of object as nonzero field strength: the one thing no change of gauge can remove.
- **Domain:** discrete differential geometry / graph algorithms / gauge theory
- **Taste match:** He has Bellman–Ford and Johnson's algorithm in his fingers from contests and Erickson, and Prime Obsession taste for the deep structure under the story; being told his DSU-with-offsets and reweighting tricks are cohomology in disguise is exactly the 'wait — really?' he wants.
- **Level fit:** Requires knowing what a feasible potential and a negative cycle are (contest-standard), and the telescoping proof fits in one line in the head; the gauge/cohomology framing is new but demands no physics machinery.
- **Grounding (truth-check):** Johnson's algorithm reweighting w'(u,v)=w(u,v)+h(u)−h(v) preserves cycle weights and shortest-path orderings; Gallai's feasible-potential theorem (equivalently LP duality / Farkas): a potential making all reweighted edges nonnegative exists iff there is no negative cycle. Formally w'−w = δh is a coboundary in graph cochain complex C^0→C^1, so w and w' lie in the same class in H^1(G;R), whose pairing with cycle space gives the invariant cycle sums — the discrete analogue of gauge equivalence A → A + ∇χ leaving the field strength (and holonomy) fixed.
- **Form hint:** argument — the one-line telescoping proof plus the iff-condition is what makes the unity feel earned rather than asserted.

<details><summary>raw json</summary>

```json
{
  "title": "Johnson's Reweighting Is a Gauge Transformation",
  "insight": "In Johnson's algorithm you kill negative edge weights by picking a potential h on vertices and replacing w(u,v) with w(u,v)+h(u)−h(v). Shortest paths survive because along any closed walk the h-terms telescope to zero: the total weight of every cycle is untouched. That is precisely the structure of electromagnetic gauge freedom — h is the scalar potential, the change you make to the weights is a pure gradient (a coboundary), and the cycle sums are the gauge-invariant field. And the punchline is the discrete Poincaré lemma: a feasible potential exists if and only if no cycle has negative total weight — Bellman–Ford is not merely a shortest-path routine, it is a search for a gauge in which the connection looks flat, and the negative cycle it reports is exactly the obstruction, the trapped flux you can never gauge away.",
  "the_turn": "The vertex potentials you invent as an algorithmic hack are literally a gauge choice, and 'negative cycle' is the same kind of object as nonzero field strength: the one thing no change of gauge can remove.",
  "domain": "discrete differential geometry / graph algorithms / gauge theory",
  "taste_match": "He has Bellman–Ford and Johnson's algorithm in his fingers from contests and Erickson, and Prime Obsession taste for the deep structure under the story; being told his DSU-with-offsets and reweighting tricks are cohomology in disguise is exactly the 'wait — really?' he wants.",
  "level_fit": "Requires knowing what a feasible potential and a negative cycle are (contest-standard), and the telescoping proof fits in one line in the head; the gauge/cohomology framing is new but demands no physics machinery.",
  "grounding": "Johnson's algorithm reweighting w'(u,v)=w(u,v)+h(u)−h(v) preserves cycle weights and shortest-path orderings; Gallai's feasible-potential theorem (equivalently LP duality / Farkas): a potential making all reweighted edges nonnegative exists iff there is no negative cycle. Formally w'−w = δh is a coboundary in graph cochain complex C^0→C^1, so w and w' lie in the same class in H^1(G;R), whose pairing with cycle space gives the invariant cycle sums — the discrete analogue of gauge equivalence A → A + ∇χ leaving the field strength (and holonomy) fixed.",
  "form_hint": "argument — the one-line telescoping proof plus the iff-condition is what makes the unity feel earned rather than asserted."
}
```
</details>