# [gemini31] MATERIAL v2 — Johnson's Reweighting Is a Gauge Transformation  ·  **story**

_Why this form:_ The insight reveals a hidden equivalence ('A is secretly B') between a well-known algorithmic trick and a deep concept in mathematical physics. Because there is no active disagreement or contested interpretation to adjudicate, this is fundamentally a structural reveal best delivered as a Story.

## Prerequisites (footing, defined in-document)
- **Johnson's Reweighting** — A technique in graph algorithms to eliminate negative edge weights by assigning a value h(v) to each vertex and replacing every edge weight w(u,v) with w'(u,v) = w(u,v) + h(u) - h(v).
- **Bellman-Ford Algorithm** — A pathfinding algorithm capable of handling negative edge weights; it is often used as a preliminary step to find the vertex potentials h(v) needed for Johnson's reweighting, or to detect if a graph contains a negative cycle.
- **Negative Cycle** — A closed loop in a graph where the sum of all edge weights along the loop is strictly less than zero. They break shortest-path algorithms because you can loop infinitely to keep lowering the total cost.
- **Telescoping Sum** — A mathematical sum where consecutive intermediate terms cancel each other out, leaving only the initial and final boundary terms (e.g., (A - B) + (B - C) = A - C).
- **Gauge Transformation** — In physics, a mathematical operation that shifts the underlying numbers (like adding a gradient to a scalar potential) without changing any physically observable reality (like the resulting magnetic field).

## Delivery
```json
{
  "hook": "For decades, computer science students have learned Johnson's algorithm as a clever algebraic hack to 'fix' graphs with negative edge weights so Dijkstra can run. But this trick is not just an algorithmic convenience—it is literally a discrete implementation of electromagnetic gauge theory.",
  "beats": [
    {
      "label": "The Telescoping Hack",
      "content": "To run fast pathfinding algorithms, all edge weights must be non-negative. If a graph has negative edges, Johnson's algorithm introduces a workaround: you invent a 'potential' value, h(v), for every vertex. Then, you alter every edge weight w(u,v) by adding the starting potential and subtracting the ending potential: w'(u,v) = w(u,v) + h(u) - h(v). The genius of this trick is that it preserves the ordering of shortest paths. Imagine a path from vertex A to B to C. The new total cost is (w(A,B) + h(A) - h(B)) + (w(B,C) + h(B) - h(C)). The intermediate h(B) terms perfectly cancel out in a telescoping sum. The new path cost is exactly the old path cost, plus h(A) minus h(C). Because every possible path between A and C is offset by the exact same constant, whatever path was cheapest before is still the cheapest now."
    },
    {
      "label": "The Cycle Invariant",
      "content": "The true power of this reweighting reveals itself when you look at closed loops, or cycles. Suppose a path starts at vertex A, wanders through the graph, and eventually loops back to end at vertex A. By the telescoping rule we just established, the new weight of this cycle is its old weight plus h(A) minus h(A). The h(A) terms cancel. This means the total weight of *every single cycle* in the graph is completely immune to our reweighting. You can choose absolutely any numbers you want for the vertex potentials h(v), and while the individual edge weights will swing wildly, the sum of any closed loop will remain exactly the same."
    },
    {
      "label": "The Physics Translation",
      "content": "This exact mathematical structure governs electromagnetism. In physics, you can shift a system's scalar potential (voltage) and vector potential without changing the actual, observable magnetic and electric fields. This is called a gauge transformation. On our graph, the vertex values h(v) act as the discrete scalar potential. The difference h(u) - h(v) is a discrete gradient (or coboundary). Modifying the edges this way is a pure gauge transformation: you are changing the local, unobservable numbers (the individual edge weights) while leaving the global, observable reality (the invariant cycle weights) entirely untouched."
    },
    {
      "label": "The Topological Obstruction",
      "content": "The explicit goal of Johnson's algorithm is to find a specific 'gauge choice'—a set of h(v) values—that makes every single edge weight non-negative, a state called a 'feasible potential'. But because cycle sums are gauge-invariant, if your graph contains a cycle that sums to -5, *no possible choice* of potentials can ever make all its edges positive. If they were all positive, their sum would be positive, and we know the sum must remain -5. Therefore, a negative cycle is an intrinsic, mathematical obstruction. When you run Bellman-Ford to find these h(v) potentials, you are actually searching for a gauge in which the space looks mathematically 'flat' (non-negative everywhere). If Bellman-Ford fails and reports a negative cycle, it hasn't just encountered an algorithm-breaking bug; it has found the discrete equivalent of trapped magnetic flux."
    }
  ],
  "the_reveal": "The vertex potentials you invent as an algorithmic hack are literally a gauge choice, and 'negative cycle' is the same kind of object as nonzero field strength: the one fundamental topological property that no change of gauge can ever erase.",
  "lingering": "If graph pathfinding is secretly discrete differential geometry, what fundamental laws of physics are hiding inside other purely 'algorithmic' concepts like maximum flow or minimum spanning trees?"
}
```

**The turn:** 

**Narrator notes:** When walking through the telescoping sum in Beat 1, keep the pacing deliberate. The cancellation of the intermediate 'h' terms is the mechanical fulcrum of the entire insight. Treat the phrase 'gauge transformation' with weight—it's the bridge linking two completely separate disciplines.

## Evolving diagram (4 beats)
- **step 1** — shows: A small directed graph with weights on edges, some negative. A path A -> B -> C is highlighted.  
  _change:_ initial
- **step 2** — shows: Scalar values h(v) appear next to each node. The edges visually update to show the new weights w'(u,v) = w + h(u) - h(v).  
  _change:_ Node potentials are added, and edge formulas are updated.
- **step 3** — shows: The equation for the path A -> B -> C expands below the graph, showing the -h(B) and +h(B) explicitly crossing out (telescoping), leaving just +h(A) and -h(C).  
  _change:_ The telescoping cancellation of intermediate node potentials is animated.
- **step 4** — shows: The path is extended to loop back to A, forming a cycle A -> B -> C -> A. The equation expands to show +h(A) at the start and -h(A) at the end crossing out. The cycle sum is highlighted in a glowing box labeled 'Gauge-Invariant Field Strength'.  
  _change:_ The path becomes a closed loop, proving the total cycle weight is perfectly unchanged by the node potentials.