# [claude] The Optimal SAT Solver You Can Already Write

*domain area: complexity theory (P vs NP intuition, reductions, pseudorandomness, hardness)*

## Insight
You can sit down today and write a SAT solver that is provably within a constant factor of the fastest SAT solver that will ever exist. Levin's trick: enumerate all programs, run program number i at speed 2^-i in a dovetailed simulation, and whenever any of them coughs up an assignment, check it in polynomial time and halt. The true champion algorithm is somewhere in that enumeration, say at index k, so you pay at most a 2^k slowdown — a constant, independent of input size. So if P = NP, this hundred-line program is a polynomial-time SAT solver, and it has been one all along; nobody knows which, or how big the constant is.

- **The turn:** An optimal algorithm for the canonical hard problem is not merely known to exist — it's short enough to write, yet tells you nothing about whether the problem is hard, because all the ignorance is hiding inside a constant factor.
- **Domain:** computational complexity / algorithm design (Levin's universal search)
- **Taste match:** It's a self-contained clever trick of exactly the contest-reference flavour, implementable in Rust in an afternoon, and it lands a philosophical punch about P vs NP with zero hand-waving.
- **Level fit:** Requires only 'NP = poly-time-checkable' plus comfort with dovetailing and geometric time-slicing — all within reach, but the conclusion (optimality decoupled from complexity) needs real thought to absorb.
- **Grounding (truth-check):** Levin's universal search (Leonid Levin, 1973), standard as 'optimal search algorithm for NP-relations'; the constant-factor-optimality statement appears in Arora–Barak and is generalised by Hutter's speedup theorem. Formally: for any NP search problem with poly verifier there is an algorithm U such that for every correct algorithm A, time_U(x) ≤ c_A · time_A(x) + poly(|x|), with c_A ≈ 2^{|A|}.
- **Form hint:** puzzle — pose 'could you write an optimal SAT solver without solving P vs NP?' and let the dovetailing construction be the reveal.

<details><summary>raw json</summary>

```json
{
  "title": "The Optimal SAT Solver You Can Already Write",
  "insight": "You can sit down today and write a SAT solver that is provably within a constant factor of the fastest SAT solver that will ever exist. Levin's trick: enumerate all programs, run program number i at speed 2^-i in a dovetailed simulation, and whenever any of them coughs up an assignment, check it in polynomial time and halt. The true champion algorithm is somewhere in that enumeration, say at index k, so you pay at most a 2^k slowdown — a constant, independent of input size. So if P = NP, this hundred-line program is a polynomial-time SAT solver, and it has been one all along; nobody knows which, or how big the constant is.",
  "the_turn": "An optimal algorithm for the canonical hard problem is not merely known to exist — it's short enough to write, yet tells you nothing about whether the problem is hard, because all the ignorance is hiding inside a constant factor.",
  "domain": "computational complexity / algorithm design (Levin's universal search)",
  "taste_match": "It's a self-contained clever trick of exactly the contest-reference flavour, implementable in Rust in an afternoon, and it lands a philosophical punch about P vs NP with zero hand-waving.",
  "level_fit": "Requires only 'NP = poly-time-checkable' plus comfort with dovetailing and geometric time-slicing — all within reach, but the conclusion (optimality decoupled from complexity) needs real thought to absorb.",
  "grounding": "Levin's universal search (Leonid Levin, 1973), standard as 'optimal search algorithm for NP-relations'; the constant-factor-optimality statement appears in Arora–Barak and is generalised by Hutter's speedup theorem. Formally: for any NP search problem with poly verifier there is an algorithm U such that for every correct algorithm A, time_U(x) ≤ c_A · time_A(x) + poly(|x|), with c_A ≈ 2^{|A|}.",
  "form_hint": "puzzle — pose 'could you write an optimal SAT solver without solving P vs NP?' and let the dovetailing construction be the reveal."
}
```
</details>