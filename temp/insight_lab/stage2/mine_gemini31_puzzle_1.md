# [gemini31] (puzzle) Coin Flips and State Machines

## Insight
If you flip a coin, which sequence takes longer to appear on average: Heads-Tails (HT) or Heads-Heads (HH)? Since any two-flip sequence has a 25% chance of occurring, intuition screams they should both take 4 flips. But HT takes 4 flips, while HH takes 6. The reason becomes obvious if you picture it as a state machine. When aiming for HT, rolling the 'wrong' face (an H) after your first Heads leaves you exactly where you were: still holding an H, one step from victory. But when aiming for HH, rolling the 'wrong' face (a T) destroys your progress completely, sending you all the way back to the start.

- **The turn:** The symmetric probability of independent coin flips is broken by the self-overlapping structure of the target string, creating asymmetric penalties for failure.
- **Domain:** Discrete Probability
- **Taste match:** Bridges his competitive programming background with probability: mapping a stochastic process to a deterministic finite state machine makes the math instantly, visually intuitive.
- **Level fit:** Sits exactly at the intersection of dynamic programming and 'Concrete Mathematics', turning a heavy Markov recurrence relation into a pure, head-solvable structural insight.
- **Grounding:** Conway's algorithm for expected hitting times of overlapping sequences in Markov Chains.
- **Form hint:** puzzle | Pose the HT vs HH expectation, let them assume parity, then spring the state-machine trapdoor.

<details><summary>raw json</summary>

```json
{
  "title": "Coin Flips and State Machines",
  "insight": "If you flip a coin, which sequence takes longer to appear on average: Heads-Tails (HT) or Heads-Heads (HH)? Since any two-flip sequence has a 25% chance of occurring, intuition screams they should both take 4 flips. But HT takes 4 flips, while HH takes 6. The reason becomes obvious if you picture it as a state machine. When aiming for HT, rolling the 'wrong' face (an H) after your first Heads leaves you exactly where you were: still holding an H, one step from victory. But when aiming for HH, rolling the 'wrong' face (a T) destroys your progress completely, sending you all the way back to the start.",
  "the_turn": "The symmetric probability of independent coin flips is broken by the self-overlapping structure of the target string, creating asymmetric penalties for failure.",
  "domain": "Discrete Probability",
  "taste_match": "Bridges his competitive programming background with probability: mapping a stochastic process to a deterministic finite state machine makes the math instantly, visually intuitive.",
  "level_fit": "Sits exactly at the intersection of dynamic programming and 'Concrete Mathematics', turning a heavy Markov recurrence relation into a pure, head-solvable structural insight.",
  "grounding": "Conway's algorithm for expected hitting times of overlapping sequences in Markov Chains.",
  "form_hint": "puzzle | Pose the HT vs HH expectation, let them assume parity, then spring the state-machine trapdoor."
}
```
</details>