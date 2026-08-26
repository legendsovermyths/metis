# [opus5] (argument) The Algorithm We Already Have

## Insight
Knuth says he expects P = NP but that we'll never see a usable algorithm — the proof will be nonconstructive, and precedent exists: Robertson–Seymour guarantees an O(n³) test for every minor-closed graph property while leaving the obstruction sets unknown, so we know algorithms exist that nobody can write down. But for SAT the opposite is true, and this is the sting: Levin's universal search is a program you could write in Rust this afternoon — dovetail every possible program, check each candidate certificate, halt on the first that verifies. It provably runs within a constant factor of the fastest possible algorithm for the problem, so if P = NP, *that code already solves SAT in polynomial time today*. Nothing about the code would change if the proof arrived; the only thing we'd gain is permission to believe its runtime — which forces the question of what 'having an algorithm' even means.

- **The turn:** For SAT, a proof of P = NP wouldn't hand us an algorithm — we already have the optimal one; it would only tell us the program we can already run is fast.
- **Domain:** Computational complexity / foundations of algorithms
- **Taste match:** Anirudh lives in the gap between contest recipes and the theory underneath (Erickson) and loves narrative math controversy (Derbyshire); this pits Knuth's heresy against a five-line dovetailing trick that a competitive programmer can fully picture.
- **Level fit:** Requires knowing NP-completeness, certificates, and asymptotic constants — all standard from Erickson — but pushes into optimality-up-to-constants and nonconstructive existence, which is a genuine step past contest material.
- **Grounding:** Levin's universal search (Levin 1973) and its optimality up to multiplicative constant plus additive verification time; Robertson–Seymour graph minor theorem yielding cubic-time nonconstructive algorithms for minor-closed properties (Fellows–Langston on nonconstructive tools); Knuth's stated belief that P = NP with a nonconstructive proof, from 'Twenty Questions for Donald Knuth' (InformIT, 2014).
- **Form hint:** argument — the reader must actually pick a side on whether an unbounded-but-provably-optimal program counts as possessing an algorithm.

<details><summary>raw json</summary>

```json
{
  "title": "The Algorithm We Already Have",
  "insight": "Knuth says he expects P = NP but that we'll never see a usable algorithm — the proof will be nonconstructive, and precedent exists: Robertson–Seymour guarantees an O(n³) test for every minor-closed graph property while leaving the obstruction sets unknown, so we know algorithms exist that nobody can write down. But for SAT the opposite is true, and this is the sting: Levin's universal search is a program you could write in Rust this afternoon — dovetail every possible program, check each candidate certificate, halt on the first that verifies. It provably runs within a constant factor of the fastest possible algorithm for the problem, so if P = NP, *that code already solves SAT in polynomial time today*. Nothing about the code would change if the proof arrived; the only thing we'd gain is permission to believe its runtime — which forces the question of what 'having an algorithm' even means.",
  "the_turn": "For SAT, a proof of P = NP wouldn't hand us an algorithm — we already have the optimal one; it would only tell us the program we can already run is fast.",
  "domain": "Computational complexity / foundations of algorithms",
  "taste_match": "Anirudh lives in the gap between contest recipes and the theory underneath (Erickson) and loves narrative math controversy (Derbyshire); this pits Knuth's heresy against a five-line dovetailing trick that a competitive programmer can fully picture.",
  "level_fit": "Requires knowing NP-completeness, certificates, and asymptotic constants — all standard from Erickson — but pushes into optimality-up-to-constants and nonconstructive existence, which is a genuine step past contest material.",
  "grounding": "Levin's universal search (Levin 1973) and its optimality up to multiplicative constant plus additive verification time; Robertson–Seymour graph minor theorem yielding cubic-time nonconstructive algorithms for minor-closed properties (Fellows–Langston on nonconstructive tools); Knuth's stated belief that P = NP with a nonconstructive proof, from 'Twenty Questions for Donald Knuth' (InformIT, 2014).",
  "form_hint": "argument — the reader must actually pick a side on whether an unbounded-but-provably-optimal program counts as possessing an algorithm."
}
```
</details>