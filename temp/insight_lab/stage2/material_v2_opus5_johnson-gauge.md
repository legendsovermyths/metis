# [opus5] MATERIAL v2 — Johnson's Reweighting Is a Gauge Transformation  ·  **story**

_Why this form:_ There is no live disagreement here — it is a structural reveal ('the hack you use in contests is literally a gauge choice') that the reader realises rather than solves. The telescoping proof and the iff-theorem are the evidence that makes the reveal land, not two competing sides.

## Prerequisites (footing, defined in-document)
- **Directed weighted graph** — A set of vertices V with directed edges E, each edge (u,v) carrying a real number w(u,v) called its weight. Weights may be negative.
- **Walk, path, cycle** — A walk is any sequence of vertices joined by edges; a path is a walk with no repeated vertex; a cycle is a closed walk that returns to its start. The weight of a walk is the sum of the weights of its edges.
- **Negative cycle** — A directed cycle whose edge weights sum to a negative number. If one exists and is reachable, 'shortest path' becomes meaningless — you can loop around it forever and drive the cost to −∞.
- **Feasible potential** — A function h: V→ℝ on vertices satisfying h(v) ≤ h(u) + w(u,v) for every edge (u,v) — i.e. h obeys the triangle inequality on every edge. Equivalently w(u,v) + h(u) − h(v) ≥ 0 for all edges.
- **Dijkstra's algorithm** — The greedy single-source shortest-path algorithm; it is correct only when all edge weights are nonnegative, because it finalises a vertex's distance the moment it is popped.
- **Bellman–Ford algorithm** — Repeatedly relax every edge |V|−1 times to compute single-source shortest distances even with negative weights; if any edge still relaxes on a |V|-th pass, it reports a negative cycle.
- **Johnson's algorithm** — All-pairs shortest paths on a sparse graph with negative edges: run Bellman–Ford once to get a potential h, use h to reweight every edge so that all weights are nonnegative, then run Dijkstra from each vertex.
- **Telescoping sum** — A sum of consecutive differences in which intermediate terms cancel: (a₁−a₂)+(a₂−a₃)+…+(a_{n−1}−a_n) = a₁ − a_n. If the sequence closes up (a_n = a₁) the total is exactly zero.
- **Gradient / scalar potential (continuum)** — For a scalar function χ on a region, its gradient ∇χ is the vector field of its directional rates of change. Its defining property is the fundamental theorem of calculus for line integrals: ∫_γ ∇χ·dl = χ(end) − χ(start), so its integral around any closed loop is zero.
- **Gauge freedom in electromagnetism** — The vector potential A is not physically unique: replacing A by A + ∇χ for any scalar χ leaves the magnetic field B = ∇×A and all loop integrals ∮A·dl unchanged. A is 'the gauge', the invariant field strength is what physics actually sees, and choosing a convenient χ is called gauge fixing.
- **Holonomy / flux around a loop** — The line integral ∮_γ A·dl around a closed loop; by Stokes' theorem it equals the flux of the field strength through the loop. It is gauge-invariant and is the only local data about A that is.
- **Flat connection** — A potential whose field strength vanishes everywhere (all loop integrals zero). Locally a flat connection is 'pure gauge': it is the gradient of something, so a change of gauge can set it to zero.
- **Poincaré lemma (statement only)** — On a simply connected region, a closed differential form is exact: if all its loop integrals vanish, it is the gradient/differential of a potential function. Nontrivial loops in the space are exactly what can break this.
- **Cochain complex on a graph, δ and H¹** — C⁰ = functions on vertices, C¹ = functions on edges, with the coboundary map δ: C⁰→C¹ given by (δh)(u,v) = h(u) − h(v). Elements of the image of δ are 'coboundaries' (discrete gradients); H¹ = C¹/im δ is the space of edge-functions modulo gradients.
- **Cycle space of a graph** — The vector space spanned by the graph's cycles (viewed as ±1 combinations of edges); for a connected graph it has dimension |E| − |V| + 1. Pairing an edge-function with a cycle means summing the function's values along that cycle.
- **LP duality / Farkas' lemma (flavour only)** — A system of linear inequalities either has a solution, or there is a nonnegative combination of the inequalities that adds up to a flat contradiction — and that certificate is the only obstruction.

## Delivery
```json
{
  "hook": "Every competitive programmer learns the same trick: negative edge weights break Dijkstra, so you invent a number h(v) at each vertex, replace w(u,v) by w(u,v)+h(u)−h(v), and the negatives vanish. It feels like a bookkeeping stunt — a change of variables you'd be embarrassed to call deep. It is, letter for letter, the gauge transformation of electromagnetism, and the negative cycle your Bellman–Ford reports is a trapped magnetic flux.",
  "beats": [
    {
      "label": "The problem and the hack",
      "content": "You want all-pairs shortest paths on a sparse directed graph, some weights negative. Floyd–Warshall costs Θ(V³); Dijkstra from each vertex would cost O(VE log V), much better on sparse graphs, but Dijkstra is only correct with nonnegative weights (it finalises a vertex on pop, and a later negative edge could have improved it). Johnson's algorithm buys the nonnegativity. Pick any function h: V→ℝ — call it a potential — and define the reweighted graph w′(u,v) = w(u,v) + h(u) − h(v). Notice the shape of the correction: it depends only on the *endpoints*, one plus and one minus. That single structural fact is the whole story."
    },
    {
      "label": "Why paths survive, exactly",
      "content": "Take any walk P = v₀ → v₁ → … → v_k. Its reweighted length is Σᵢ [w(v_{i−1},vᵢ) + h(v_{i−1}) − h(vᵢ)] = w(P) + Σᵢ [h(v_{i−1}) − h(vᵢ)]. The second sum telescopes: everything cancels except the first and last term, leaving h(v₀) − h(v_k). So w′(P) = w(P) + h(v₀) − h(v_k). The correction depends only on the endpoints, not on the route. Therefore *all* walks from u to v are shifted by the same constant h(u) − h(v); their ordering by length is untouched; the argmin is untouched. Reweighting cannot change which path is shortest — it only changes the numbers by a bookkeeping offset you subtract off at the end: d(u,v) = d′(u,v) − h(u) + h(v)."
    },
    {
      "label": "Why cycle weights are literally invariant",
      "content": "Now close the walk up: v_k = v₀. Then h(v₀) − h(v_k) = 0, so w′(C) = w(C) for every closed walk C. Not 'approximately', not 'up to shifts' — every cycle in the graph has exactly the same total weight before and after reweighting, no matter what h you chose. The set of cycle sums is the part of the weight function that is *invariant* under the entire family of reweightings. Everything else — the individual edge weights — is convention."
    },
    {
      "label": "Making the hack work: where h comes from",
      "content": "You want an h making every w′(u,v) ≥ 0, i.e. h(v) ≤ h(u) + w(u,v) for every edge: a feasible potential. Johnson's construction: add a super-source s with a 0-weight edge to every vertex, run Bellman–Ford from s, set h(v) = dist(s,v). These distances are finite (every vertex is reachable via s) and satisfy the triangle inequality along every edge by definition of a shortest distance — dist(s,v) ≤ dist(s,u) + w(u,v) — so w′ ≥ 0 automatically. Worked example: vertices a,b,c with a→b of weight 4, b→c of weight −2, c→a of weight 1. Bellman–Ford from the super-source gives h(a) = −1, h(b) = 0, h(c) = −2. Reweight: a→b becomes 4 + (−1) − 0 = 3; b→c becomes −2 + 0 − (−2) = 0; c→a becomes 1 + (−2) − (−1) = 0. All nonnegative, Dijkstra is happy. And the cycle: originally 4 − 2 + 1 = 3; after reweighting 3 + 0 + 0 = 3. Unchanged, as promised."
    },
    {
      "label": "The iff: when no h can exist",
      "content": "Now change c→a to weight −3. The cycle sum is 4 − 2 − 3 = −1. No feasible potential can exist, and the proof is the invariance we just established: if h made every w′ ≥ 0, then w′(C) would be a sum of nonnegative numbers, hence ≥ 0; but w′(C) = w(C) = −1 < 0. Contradiction. So a negative cycle forbids reweighting, forever, for every possible h. The converse is the substantive half (Gallai's feasible-potential theorem, equivalently the Farkas/LP-duality certificate for this system of difference inequalities): if there is *no* negative cycle, a feasible potential always exists. Sketch, complete: with no negative cycles, the minimum weight over walks from s to v is attained by a simple path, because any cycle inside a walk can be excised without increasing its weight; there are finitely many simple paths, so dist(s,v) is a well-defined finite real number; and shortest distances always satisfy dist(s,v) ≤ dist(s,u) + w(u,v), since concatenating the best walk to u with the edge (u,v) is one candidate walk to v. That h is feasible. So: **a feasible potential exists if and only if no cycle has negative total weight**, and Bellman–Ford is exactly the constructive search — returning either the potential or the obstruction."
    },
    {
      "label": "Same equations, other subject",
      "content": "Write electromagnetism in the same notation. The vector potential A assigns a number to each infinitesimal displacement — an edge. Gauge freedom says A → A + ∇χ for a scalar χ defined on points — vertices. Why is this harmless? Because ∫_γ ∇χ·dl = χ(end) − χ(start): the correction depends only on the endpoints and *telescopes*. Around a closed loop it is zero, so the holonomy ∮A·dl — equivalently, by Stokes, the flux of the field strength through the loop — is gauge-invariant. Compare line by line: h is χ, the scalar potential on vertices; w is A, the connection on edges; the correction δh(u,v) = h(u) − h(v) is the discrete gradient, a pure coboundary; the fundamental theorem of calculus for gradients is our telescoping sum; and the invariant cycle sums are the field strength. This is not an analogy of mood. It is the same identity, δ² = 0 / Stokes' theorem, in a category where the manifold is a graph."
    },
    {
      "label": "The cohomology, stated precisely",
      "content": "Formally: let C⁰ be functions on vertices and C¹ functions on edges, with coboundary (δh)(u,v) = h(u) − h(v). Johnson's reweighting is exactly w ↦ w + δh. So the entire family of reweightings of w is the coset w + im δ — a single class in H¹ = C¹/im δ. Pairing an edge-function with a cycle (sum along the cycle) kills every coboundary — that is Stokes' theorem — so this pairing is well defined on H¹, and for a connected graph it is an isomorphism onto the dual of the cycle space, of dimension |E| − |V| + 1. Translation: *the cycle sums ARE the cohomology class*, they are the complete list of reweighting-invariants, and two weightings are reachable from each other by potentials precisely when all their cycle sums agree. The kernel of δ is the constants (on a connected graph), which is the residual gauge freedom: shifting h by a constant changes no edge weight — exactly like the constant ambiguity in a scalar potential."
    },
    {
      "label": "The discrete Poincaré lemma, and the tropical twist",
      "content": "Push it one notch further. If *every* cycle sum is zero, then w itself is a coboundary: fix a spanning tree, set h by summing weights along tree paths from a root, and the zero-cycle condition guarantees this is consistent on the non-tree edges too, giving w = δh, so reweighting can flatten w to identically zero. That is the discrete Poincaré lemma: closed ⟹ exact, with the graph's independent cycles playing the role of the non-simply-connected directions where it can fail. A flat connection is pure gauge. Now Johnson's theorem is the *one-sided*, min-plus (tropical) version of the same statement: you cannot always gauge w to zero, but you can gauge it into the nonnegative orthant exactly when no cycle sum is negative. Nonnegativity, not vanishing, is the relevant flatness — because in shortest paths the operative semiring is (min, +), and 'looks flat enough for Dijkstra' means 'no downhill loops'."
    },
    {
      "label": "What Bellman–Ford was really doing",
      "content": "Reread the algorithm in this language. Bellman–Ford does not merely compute distances; it searches for a gauge in which the connection has no negative edges — a gauge fix. Its relaxation steps are successive local adjustments of the potential h. When it succeeds, it hands you the gauge and Dijkstra runs. When it fails, it does not fail vaguely: it hands you a specific closed loop with negative total weight, and by the invariance theorem that loop is a *certificate* that no gauge whatsoever can work. It is the trapped flux — the nonzero field strength you cannot gauge away, only redistribute among edges. The negative-cycle report is not an error message; it is a topological/cohomological obstruction, an element of H¹ that no choice of χ can touch."
    }
  ],
  "the_reveal": "The vertex potentials you invent as an algorithmic hack are literally a gauge choice, and 'negative cycle' is the same kind of object as nonzero field strength — the one thing no change of gauge can remove.",
  "lingering": "If Bellman–Ford is gauge fixing and the negative cycle is trapped flux, what are the *nonabelian* graph algorithms? Replace numbers on edges by matrices (a connection with values in a group), and 'reweighting' becomes conjugation by vertex-wise group elements while cycle products become genuine holonomies — that is the setting of lattice gauge theory, of DSU-with-offsets generalised to DSU-with-group-elements, and of consistency checking in matrix-product constraint systems. Which of those admit a Bellman–Ford?"
}
```

**The turn:** Johnson's reweighting w ↦ w + (h(u) − h(v)) is a gauge transformation of a connection on a graph: cycle sums are the gauge-invariant field strength, and a negative cycle is a flux no gauge can remove.

**Narrator notes:** Do the telescoping algebra out loud and slowly — it is one line and it is the entire proof; the reveal only earns its keep if the reader has personally watched the h-terms cancel. Land the numeric example (h = −1, 0, −2 → weights 3, 0, 0, cycle stays 3) before any physics vocabulary appears; the graph reader must feel the algorithm is fully understood first. Hold the electromagnetism comparison to strict line-by-line correspondence — h↔χ, edges↔displacements, telescoping↔fundamental theorem of calculus, cycle sum↔holonomy — and explicitly say 'this is the same identity, not a metaphor'. When the negative cycle appears, emphasise that the impossibility proof is two sentences and uses only the invariance already established: sum of nonnegatives can't be negative. End on the reframing of Bellman–Ford's failure output as a certificate, not an error.

## Evolving diagram (8 beats)
- **step 1** — shows: A small directed graph: three vertices a, b, c in a triangle with edge labels a→b: 4, b→c: −2, c→a: 1. The negative label is highlighted in red.  
  _change:_ initial
- **step 2** — shows: The same graph with each vertex now carrying a boxed potential value: h(a) = −1, h(b) = 0, h(c) = −2, and a formula caption w′(u,v) = w(u,v) + h(u) − h(v).  
  _change:_ Vertex potentials and the reweighting formula added; edge labels unchanged so far.
- **step 3** — shows: Edge labels replaced by their reweighted values 3, 0, 0, all in black (no red left); the old values shown small and greyed beside them.  
  _change:_ Edge weights updated to w′; the negative weight has disappeared.
- **step 4** — shows: The triangle traced as a highlighted closed loop with two totals stacked beside it: Σw = 4 − 2 + 1 = 3 and Σw′ = 3 + 0 + 0 = 3, joined by an equals sign; small ±h(a), ±h(b), ±h(c) annotations along the loop shown cancelling in pairs.  
  _change:_ Cycle highlighted; the telescoping cancellation of the h-terms drawn explicitly, and cycle-sum invariance asserted.
- **step 5** — shows: A panel added beside the graph: the complex C⁰ --δ--> C¹ with (δh)(u,v) = h(u) − h(v), and the pairing ⟨·, cycle⟩ from C¹ to ℝ, with 'δ then pair = 0 (Stokes)' beneath, and 'w and w′ live in the same class in H¹'.  
  _change:_ Cochain-complex panel introduced; the graph is now labelled as C⁰ (vertices) and C¹ (edges).
- **step 6** — shows: A twin panel on the other side of the graph in the same layout: χ on points, A on displacements, A → A + ∇χ, ∮(A+∇χ)·dl = ∮A·dl, with dotted lines matching h↔χ, w↔A, cycle sum↔holonomy/flux.  
  _change:_ Electromagnetic mirror panel added with correspondence lines drawn to the graph picture.
- **step 7** — shows: The c→a label changed from 1 to −3; the loop total now reads Σw = −1 with a red 'flux trapped' badge, and the caption 'no h exists: Σw′ ≥ 0 would be forced'. All vertex potential boxes are struck through.  
  _change:_ One edge weight altered to create a negative cycle; potentials crossed out to show the obstruction survives every gauge.
- **step 8** — shows: Final frame: the same figure with a two-line summary banner — 'feasible potential exists ⟺ no negative cycle' and 'all cycle sums zero ⟺ w = δh (discrete Poincaré lemma)' — plus a tag on the graph reading 'Bellman–Ford = gauge fixing'.  
  _change:_ Summary banner and the flat-connection/exactness statement added; diagram otherwise held fixed.