# [gemini31] Regexes are Shortest Paths

## Insight
Finding the shortest routes on a map and extracting a Regular Expression from a state machine seem like fundamentally different tasks. But underneath, they are solved by the exact same dynamic programming algorithm: Floyd-Warshall. The classic three nested loops that update graph distances—dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])—are mathematically identical to the Kleene construction for regexes: R[i][j] = R[i][j] | (R[i][k] R[k][k]* R[k][j]). By simply swapping the 'min-plus' algebra of distances for the 'OR-concatenate' algebra of strings, you reveal that a regular expression is literally just the algebraic shortest path through a language.

- **The turn:** By swapping out the underlying algebraic operators from addition and minimum to concatenation and OR, a classic graph-routing algorithm instantly becomes a string-parsing algorithm.
- **Domain:** Algorithm Design / Semirings
- **Taste match:** Unifies a standard competitive programming trick (Floyd-Warshall) with theoretical computer science (automata) using the elegant algebraic abstractions found in Concrete Mathematics.
- **Level fit:** Assumes familiarity with DP, graph shortest paths, and state machines, elevating them to the unifying theory of the Algebraic Path Problem over semirings.
- **Grounding:** The Algebraic Path Problem and the mathematical equivalence of the Floyd-Warshall algorithm and Kleene's algorithm (McNaughton-Yamada) over closed semirings.
- **Form hint:** teach | Unveils a structural isomorphism between two algorithms they already know by heart.

```json
{
  "title": "Regexes are Shortest Paths",
  "insight": "Finding the shortest routes on a map and extracting a Regular Expression from a state machine seem like fundamentally different tasks. But underneath, they are solved by the exact same dynamic programming algorithm: Floyd-Warshall. The classic three nested loops that update graph distances—dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])—are mathematically identical to the Kleene construction for regexes: R[i][j] = R[i][j] | (R[i][k] R[k][k]* R[k][j]). By simply swapping the 'min-plus' algebra of distances for the 'OR-concatenate' algebra of strings, you reveal that a regular expression is literally just the algebraic shortest path through a language.",
  "the_turn": "By swapping out the underlying algebraic operators from addition and minimum to concatenation and OR, a classic graph-routing algorithm instantly becomes a string-parsing algorithm.",
  "domain": "Algorithm Design / Semirings",
  "taste_match": "Unifies a standard competitive programming trick (Floyd-Warshall) with theoretical computer science (automata) using the elegant algebraic abstractions found in Concrete Mathematics.",
  "level_fit": "Assumes familiarity with DP, graph shortest paths, and state machines, elevating them to the unifying theory of the Algebraic Path Problem over semirings.",
  "grounding": "The Algebraic Path Problem and the mathematical equivalence of the Floyd-Warshall algorithm and Kleene's algorithm (McNaughton-Yamada) over closed semirings.",
  "form_hint": "teach | Unveils a structural isomorphism between two algorithms they already know by heart."
}
```