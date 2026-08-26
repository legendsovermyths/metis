# [gemini31] MATERIAL — Johnson's Reweighting Is a Gauge Transformation  ·  form: **story**

_Why this form:_ While the hint suggests an argument, the core insight is a profound 'this turned out to be X' structural realization. It doesn't present a contested debate with an unresolved crux; rather, it offers a mind-expanding reveal that a familiar algorithmic hack is secretly a deep physical invariant.

## Material
```json
{
  "hook": "The clever mathematical hack that saves Johnson's shortest-path algorithm from negative numbers isn't just a computer science trick—it is theoretical physics in disguise.",
  "beats": [
    "To deal with negative edge weights, Johnson's algorithm assigns a 'potential' h to each vertex, replacing every original edge weight w(u,v) with a new weight w(u,v) + h(u) - h(v).",
    "This shift preserves the true shortest paths, but look closely at what happens to a closed loop. As you trace any cycle, the h terms perfectly telescope: +h(u) - h(v) + h(v) - h(x)... ending up at exactly zero.",
    "The total weight of any cycle is completely untouched by the vertex potentials. This isn't just a neat algebra trick—this is the exact structure of an electromagnetic gauge transformation.",
    "The vertex values h act as a scalar potential, the weight adjustment is a pure gradient (a coboundary), and the invariant cycle sum is the physical field.",
    "Which means Bellman-Ford isn't just a routing algorithm. It is actively searching for a flat gauge. And when it fails and reports a 'negative cycle', it has found an absolute obstruction—trapped flux that no change of gauge can ever wash away."
  ],
  "the_reveal": "The realization that a 'negative cycle' is not an algorithmic error, but a physical invariant: the trapped flux that no gauge transformation can remove.",
  "lingering": "How many other clever 'optimizations' in computer science are actually deep topological invariants waiting for the right physicist to look at them?"
}
```

## Evolving diagram (5 beats)
- **step 1** — shows: A simple directed triangle graph with vertices A, B, C and edge weights w(A,B)=-2, w(B,C)=4, w(C,A)=-1. The total cycle sum is explicitly shown as 1.  
  _change:_ initial
- **step 2** — shows: The same triangle, but now vertices have scalar potentials: h(A)=3, h(B)=1, h(C)=4. The reweighting formula w'(u,v) = w(u,v) + h(u) - h(v) floats nearby.  
  _change:_ add vertex potentials and the reweighting formula
- **step 3** — shows: The edge weights update to their new, non-negative values: w'(A,B)=0, w'(B,C)=1, w'(C,A)=0. The edges turn green to indicate they are now valid for standard shortest-path algorithms.  
  _change:_ update edge weights to reweighted values and color them green
- **step 4** — shows: The cycle A -> B -> C -> A is highlighted. The sum of the new green edges (0 + 1 + 0) is calculated, showing it equals exactly the original sum: 1. The telescoping h terms cross out visually.  
  _change:_ highlight the cycle edges and display the invariant sum, crossing out the intermediate h terms
- **step 5** — shows: The graph is superimposed with a glowing magnetic field line piercing the center of the triangular cycle, labeled 'Trapped Flux (Gauge Invariant)'.  
  _change:_ add a physical visual metaphor (a flux line) passing through the interior of the cycle