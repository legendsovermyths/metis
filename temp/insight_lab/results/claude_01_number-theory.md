# [claude] The Sieve Lies By 12%

*domain area: number theory & multiplicative structure (primes, modular arithmetic, arithmetic functions)*

## Insight
Model primality the obvious way: a random n ≤ N is prime iff it survives division by every prime p ≤ √N, and 'divisible by p' should be an independent event of probability 1/p. Then the density of primes is ∏_{p≤√N}(1−1/p), which by Mertens' third theorem is ~ e^{−γ}/ln√N = 2e^{−γ}/ln N ≈ 1.1229/ln N. But the Prime Number Theorem says the true density is 1/ln N. The heuristic isn't asymptotically right-with-a-fudge: it is provably wrong by the constant 2e^{−γ}, forever, by about 12% — even though every single one of its ingredients (each prime kills a 1/p fraction) is exactly correct.

- **The turn:** The naive sieve heuristic and the truth disagree by a computable irrational constant, so treating divisibility by distinct primes as independent is not a harmless simplification — it's a permanent 12% error you can name.
- **Domain:** analytic number theory / sieve theory
- **Taste match:** He has written the sieve of Eratosthenes a hundred times for contests and read Prime Obsession's love affair with 1/ln N; this shows the two don't line up, and hands him γ and Mertens as the culprits.
- **Level fit:** Needs only ∏(1−1/p), a log, and the PNT statement — all within Concrete Mathematics reach — but the conclusion (independence fails by a fixed constant) is a research-level idea, the seed of Brun's sieve and the parity problem.
- **Grounding (truth-check):** Mertens' third theorem: ∏_{p≤x}(1−1/p) ~ e^{−γ}/ln x. Prime Number Theorem: π(N) ~ N/ln N. Ratio of heuristic to truth = 2e^{−γ} ≈ 1.1229. This discrepancy is the classical failure of the Legendre sieve (inclusion–exclusion over 2^{π(√N)} terms), which motivated Brun's sieve and Selberg's sieve; the same factor-of-2 gap appears in Selberg's linear sieve bounds.
- **Form hint:** argument — the punch comes from watching two short correct computations land on different constants.

<details><summary>raw json</summary>

```json
{
  "title": "The Sieve Lies By 12%",
  "insight": "Model primality the obvious way: a random n ≤ N is prime iff it survives division by every prime p ≤ √N, and 'divisible by p' should be an independent event of probability 1/p. Then the density of primes is ∏_{p≤√N}(1−1/p), which by Mertens' third theorem is ~ e^{−γ}/ln√N = 2e^{−γ}/ln N ≈ 1.1229/ln N. But the Prime Number Theorem says the true density is 1/ln N. The heuristic isn't asymptotically right-with-a-fudge: it is provably wrong by the constant 2e^{−γ}, forever, by about 12% — even though every single one of its ingredients (each prime kills a 1/p fraction) is exactly correct.",
  "the_turn": "The naive sieve heuristic and the truth disagree by a computable irrational constant, so treating divisibility by distinct primes as independent is not a harmless simplification — it's a permanent 12% error you can name.",
  "domain": "analytic number theory / sieve theory",
  "taste_match": "He has written the sieve of Eratosthenes a hundred times for contests and read Prime Obsession's love affair with 1/ln N; this shows the two don't line up, and hands him γ and Mertens as the culprits.",
  "level_fit": "Needs only ∏(1−1/p), a log, and the PNT statement — all within Concrete Mathematics reach — but the conclusion (independence fails by a fixed constant) is a research-level idea, the seed of Brun's sieve and the parity problem.",
  "grounding": "Mertens' third theorem: ∏_{p≤x}(1−1/p) ~ e^{−γ}/ln x. Prime Number Theorem: π(N) ~ N/ln N. Ratio of heuristic to truth = 2e^{−γ} ≈ 1.1229. This discrepancy is the classical failure of the Legendre sieve (inclusion–exclusion over 2^{π(√N)} terms), which motivated Brun's sieve and Selberg's sieve; the same factor-of-2 gap appears in Selberg's linear sieve bounds.",
  "form_hint": "argument — the punch comes from watching two short correct computations land on different constants."
}
```
</details>