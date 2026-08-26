# [gemini31] The Autocorrelation Penalty

## Insight
If you flip a fair coin, any three-flip sequence—like HTT or HTH—has an exactly equal 1/8 chance of appearing. So you'd expect to flip the coin the same number of times to see either one, right? Actually, it takes an average of 8 flips to see HTT, but 10 flips to see HTH. The culprit isn't the probability of the sequence, but its autocorrelation. Because HTH overlaps with itself, a near-miss is mathematically punishing: if you have HT and roll a T instead of an H, you've completely destroyed your progress and must start from scratch. But if you are waiting for HTT, a near-miss like HTH actually leaves you holding an H—the very first step of your next attempt. In probability, self-overlapping patterns sabotage their own expected waiting times.

- **The turn:** Sequences with the exact same probability have different expected waiting times because self-overlapping patterns punish failure more severely.
- **Domain:** Discrete Probability
- **Taste match:** It perfectly connects the discrete expectation of Concrete Mathematics with the prefix-overlap logic he already knows from KMP string matching in competitive programming.
- **Level fit:** Requires no calculus but demands a solid intuition for linearity of expectation and state transitions, sitting right at the ceiling of contest-level probability tricks.
- **Grounding:** Conway's algorithm for expected waiting times of coin flip patterns (derived via Martingales).
- **Form hint:** teach | beautifully bridges algorithmic string logic with discrete probability without needing a contrived narrative.

```json
{
  "title": "The Autocorrelation Penalty",
  "insight": "If you flip a fair coin, any three-flip sequence—like HTT or HTH—has an exactly equal 1/8 chance of appearing. So you'd expect to flip the coin the same number of times to see either one, right? Actually, it takes an average of 8 flips to see HTT, but 10 flips to see HTH. The culprit isn't the probability of the sequence, but its autocorrelation. Because HTH overlaps with itself, a near-miss is mathematically punishing: if you have HT and roll a T instead of an H, you've completely destroyed your progress and must start from scratch. But if you are waiting for HTT, a near-miss like HTH actually leaves you holding an H—the very first step of your next attempt. In probability, self-overlapping patterns sabotage their own expected waiting times.",
  "the_turn": "Sequences with the exact same probability have different expected waiting times because self-overlapping patterns punish failure more severely.",
  "domain": "Discrete Probability",
  "taste_match": "It perfectly connects the discrete expectation of Concrete Mathematics with the prefix-overlap logic he already knows from KMP string matching in competitive programming.",
  "level_fit": "Requires no calculus but demands a solid intuition for linearity of expectation and state transitions, sitting right at the ceiling of contest-level probability tricks.",
  "grounding": "Conway's algorithm for expected waiting times of coin flip patterns (derived via Martingales).",
  "form_hint": "teach | beautifully bridges algorithmic string logic with discrete probability without needing a contrived narrative."
}
```