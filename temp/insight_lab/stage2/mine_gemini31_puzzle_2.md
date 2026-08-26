# [gemini31] (puzzle) The Chameleon's Modulo Invariant

## Insight
An island has 13 red, 15 green, and 17 blue chameleons; when two of different colors meet, they both instantly become the third color. Can they ever all become a single color? The answer is no, and you can prove it in your head by finding the system's hidden invariant. Notice that when a red and green chameleon meet, both populations drop by one, leaving the difference between them completely unchanged. If any other pair meets, one count drops by one and the other jumps by two, meaning their difference changes by exactly three. Because every meeting preserves the differences between populations modulo 3, and the starting differences (15-13=2, 17-15=2) are not multiples of 3, it is mathematically impossible to reach a state where two populations are exactly zero.

- **The turn:** The puzzle tricks you into trying to simulate a chaotic sequence of forward state changes, but it is instantly defeated by identifying a modular arithmetic invariant that proves the target state unreachable.
- **Domain:** Combinatorial Number Theory
- **Taste match:** For a Rust developer and competitive programmer, this perfectly mirrors how type systems and loop invariants work: you rule out invalid states mathematically by design, without ever needing to 'run' the code.
- **Level fit:** Requires zero paper to solve, but demands exactly the mathematical maturity cultivated by Erickson and Knuth to immediately look past the noise and hunt for a conserved quantity.
- **Grounding:** The classic Chameleon Puzzle, demonstrating the use of state invariants and modular arithmetic to prove unreachability in state transition graphs.
- **Form hint:** puzzle | It poses a concrete yes/no question that initially feels like an impossible brute-force simulation, but collapses beautifully into a single, purely mental observation.

<details><summary>raw json</summary>

```json
{
  "title": "The Chameleon's Modulo Invariant",
  "insight": "An island has 13 red, 15 green, and 17 blue chameleons; when two of different colors meet, they both instantly become the third color. Can they ever all become a single color? The answer is no, and you can prove it in your head by finding the system's hidden invariant. Notice that when a red and green chameleon meet, both populations drop by one, leaving the difference between them completely unchanged. If any other pair meets, one count drops by one and the other jumps by two, meaning their difference changes by exactly three. Because every meeting preserves the differences between populations modulo 3, and the starting differences (15-13=2, 17-15=2) are not multiples of 3, it is mathematically impossible to reach a state where two populations are exactly zero.",
  "the_turn": "The puzzle tricks you into trying to simulate a chaotic sequence of forward state changes, but it is instantly defeated by identifying a modular arithmetic invariant that proves the target state unreachable.",
  "domain": "Combinatorial Number Theory",
  "taste_match": "For a Rust developer and competitive programmer, this perfectly mirrors how type systems and loop invariants work: you rule out invalid states mathematically by design, without ever needing to 'run' the code.",
  "level_fit": "Requires zero paper to solve, but demands exactly the mathematical maturity cultivated by Erickson and Knuth to immediately look past the noise and hunt for a conserved quantity.",
  "grounding": "The classic Chameleon Puzzle, demonstrating the use of state invariants and modular arithmetic to prove unreachability in state transition graphs.",
  "form_hint": "puzzle | It poses a concrete yes/no question that initially feels like an impossible brute-force simulation, but collapses beautifully into a single, purely mental observation."
}
```
</details>