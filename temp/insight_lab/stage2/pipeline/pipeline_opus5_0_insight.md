# [opus5] (puzzle — pose the race, invite the reader to predict the leader and guess where it first flips, then reveal the squares as the hidden thumb on the scale.) The Rigged Prime Race

## Insight
Split the odd primes by remainder mod 4. Dirichlet says both classes get exactly half in the limit — yet if you actually run the race, 3-mod-4 leads almost the whole way: the first x where 1-mod-4 pulls ahead is 26,861, and under GRH the 3s lead for logarithmic density 0.9959 of all x. The culprit is that every square of an odd prime is 1 mod 4, so the 'fair' count is really the primes plus a phantom crowd of prime squares stuffed entirely into one lane; subtract that x^{1/2}/log x ghost term and the race levels out. So the bias is not a fact about primes at all — it's a fact about squares leaking into your scoreboard.

- **The turn:** Two classes with provably equal asymptotic density still produce a race with a near-permanent leader, and the leader is chosen not by the primes but by the prime *squares* silently biasing the count.
- **Domain:** analytic number theory — Chebyshev's bias / comparative prime number theory
- **Taste match:** Anirudh read Prime Obsession for the story under the primes; this is the same machinery (explicit formula, error terms, GRH) delivered as a concrete race you could literally code up in Rust in twenty lines and watch the counter refuse to flip until 26,861.
- **Level fit:** Needs only 'primes mod 4 are equidistributed' and comfort with an x^{1/2}/log x error term dominating a difference — exactly the asymptotic-manipulation reflex Concrete Mathematics builds, without requiring the analysis to prove it.
- **Grounding:** Chebyshev's 1853 observation; Dirichlet's theorem on primes in arithmetic progressions; Littlewood (1914) proved π(x;4,3) − π(x;4,1) changes sign infinitely often; Leech (1957) found the first sign change at x = 26861; Rubinstein–Sarnak (1994) computed logarithmic density ≈ 0.9959 under GRH plus linear independence of zeros; the bias arises because the natural weighted count (Chebyshev's ψ over prime powers) places all odd prime squares in the class 1 mod 4.
- **Form hint:** puzzle — pose the race, invite the reader to predict the leader and guess where it first flips, then reveal the squares as the hidden thumb on the scale.

<details><summary>raw json</summary>

```json
{
  "title": "The Rigged Prime Race",
  "insight": "Split the odd primes by remainder mod 4. Dirichlet says both classes get exactly half in the limit — yet if you actually run the race, 3-mod-4 leads almost the whole way: the first x where 1-mod-4 pulls ahead is 26,861, and under GRH the 3s lead for logarithmic density 0.9959 of all x. The culprit is that every square of an odd prime is 1 mod 4, so the 'fair' count is really the primes plus a phantom crowd of prime squares stuffed entirely into one lane; subtract that x^{1/2}/log x ghost term and the race levels out. So the bias is not a fact about primes at all — it's a fact about squares leaking into your scoreboard.",
  "the_turn": "Two classes with provably equal asymptotic density still produce a race with a near-permanent leader, and the leader is chosen not by the primes but by the prime *squares* silently biasing the count.",
  "domain": "analytic number theory — Chebyshev's bias / comparative prime number theory",
  "taste_match": "Anirudh read Prime Obsession for the story under the primes; this is the same machinery (explicit formula, error terms, GRH) delivered as a concrete race you could literally code up in Rust in twenty lines and watch the counter refuse to flip until 26,861.",
  "level_fit": "Needs only 'primes mod 4 are equidistributed' and comfort with an x^{1/2}/log x error term dominating a difference — exactly the asymptotic-manipulation reflex Concrete Mathematics builds, without requiring the analysis to prove it.",
  "grounding": "Chebyshev's 1853 observation; Dirichlet's theorem on primes in arithmetic progressions; Littlewood (1914) proved π(x;4,3) − π(x;4,1) changes sign infinitely often; Leech (1957) found the first sign change at x = 26861; Rubinstein–Sarnak (1994) computed logarithmic density ≈ 0.9959 under GRH plus linear independence of zeros; the bias arises because the natural weighted count (Chebyshev's ψ over prime powers) places all odd prime squares in the class 1 mod 4.",
  "form_hint": "puzzle — pose the race, invite the reader to predict the leader and guess where it first flips, then reveal the squares as the hidden thumb on the scale."
}
```
</details>