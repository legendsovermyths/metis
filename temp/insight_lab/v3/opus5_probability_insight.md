# [opus5] HH Waits Longer Than HT

## Insight
Flip a fair coin until you see HH; on average it takes 6 flips. Do it for HT and it takes only 4 — even though on any single pair of flips, HH and HT are equally likely. The asymmetry is self-overlap: when you're one H into HT, no flip can ever destroy your progress (a T finishes you, an H keeps you one-H-in), but when you're one H into HH, a T wipes you back to zero. Push this and it gets worse: pattern-first races are non-transitive, so in a three-flip duel there is no best pattern — whatever your opponent commits to, you can name one that beats it, and THH beats HHH with probability 7/8.

- **The turn:** Two patterns with identical probability per trial have different expected waiting times — and the 'strength' ordering of patterns is a rock-paper-scissors cycle, so there is no strongest pattern.
- **Domain:** discrete probability / expected waiting times (Penney's game)
- **Taste match:** It's a self-contained trick with a mechanism you can feel (prefix-overlap, exactly the KMP failure-function intuition from contest string algorithms), and it pays off in a game-theoretic punchline — manipulation-heavy discrete probability of the Concrete Mathematics flavour.
- **Level fit:** Assumes only expectation, conditioning on states, and solving a tiny linear recurrence between automaton states; the KMP/failure-function analogy is available to a competitive programmer and makes the 'why' click without heavy machinery.
- **Grounding:** Standard Markov-chain waiting-time computation gives E[HH]=6, E[HT]=4 for a fair coin. Penney's game (Walter Penney, 1969) is non-transitive for length-3 patterns; THH beats HHH with probability 7/8. Conway's leading-number algorithm computes the odds between any two patterns; the correlation/overlap structure is the same object as the KMP failure function, and Li's martingale argument (1980) gives the ABRACADABRA-style proofs.
- **Form hint:** puzzle — 'which takes longer on average, HH or HT?' has an objective, counterintuitive, head-solvable answer that opens straight into the non-transitivity reveal

```json
{
  "title": "HH Waits Longer Than HT",
  "insight": "Flip a fair coin until you see HH; on average it takes 6 flips. Do it for HT and it takes only 4 — even though on any single pair of flips, HH and HT are equally likely. The asymmetry is self-overlap: when you're one H into HT, no flip can ever destroy your progress (a T finishes you, an H keeps you one-H-in), but when you're one H into HH, a T wipes you back to zero. Push this and it gets worse: pattern-first races are non-transitive, so in a three-flip duel there is no best pattern — whatever your opponent commits to, you can name one that beats it, and THH beats HHH with probability 7/8.",
  "the_turn": "Two patterns with identical probability per trial have different expected waiting times — and the 'strength' ordering of patterns is a rock-paper-scissors cycle, so there is no strongest pattern.",
  "domain": "discrete probability / expected waiting times (Penney's game)",
  "taste_match": "It's a self-contained trick with a mechanism you can feel (prefix-overlap, exactly the KMP failure-function intuition from contest string algorithms), and it pays off in a game-theoretic punchline — manipulation-heavy discrete probability of the Concrete Mathematics flavour.",
  "level_fit": "Assumes only expectation, conditioning on states, and solving a tiny linear recurrence between automaton states; the KMP/failure-function analogy is available to a competitive programmer and makes the 'why' click without heavy machinery.",
  "grounding": "Standard Markov-chain waiting-time computation gives E[HH]=6, E[HT]=4 for a fair coin. Penney's game (Walter Penney, 1969) is non-transitive for length-3 patterns; THH beats HHH with probability 7/8. Conway's leading-number algorithm computes the odds between any two patterns; the correlation/overlap structure is the same object as the KMP failure function, and Li's martingale argument (1980) gives the ABRACADABRA-style proofs.",
  "form_hint": "puzzle — 'which takes longer on average, HH or HT?' has an objective, counterintuitive, head-solvable answer that opens straight into the non-transitivity reveal"
}
```