# [gemini31] MATERIAL v2 — The Monkey's Overlap  ·  **puzzle**

_Why this form:_ The insight hinges on a direct, concrete question with a highly counterintuitive exact numerical answer, making it a perfect puzzle. The solution path naturally introduces an elegant proof mechanic (Conway's Martingale) that entirely reframes how the reader sees probability.

## Prerequisites (footing, defined in-document)
- **Expected Value** — The long-run average outcome of a random process. If you roll a standard die repeatedly, the expected number of rolls to get a 6 is 6.
- **Linearity of Expectation** — The mathematical rule that the expected value of a sum of variables is equal to the sum of their individual expected values, regardless of whether those variables influence each other.
- **Fair Game (Martingale)** — A betting scenario where neither the player nor the house has an edge. On average, the total amount of money wagered by players must exactly equal the total amount paid out by the casino.

## Delivery
```json
{
  "setup": "Imagine a monkey typing uniformly at random on a standard 26-letter keyboard. We are waiting for the monkey to type the exact 11-letter word 'ABRACADABRA'.",
  "question": "What is the expected number of keystrokes until 'ABRACADABRA' first appears? A) Exactly 26^11, B) Less than 26^11, or C) More than 26^11?",
  "answer_format": "Multiple choice (A, B, or C).",
  "correct_answer": "C) More than 26^11 (specifically, exactly 26^11 + 26^4 + 26^1).",
  "the_trap": "It is overwhelmingly tempting to choose A. Every single 11-letter combination has the exact same probability of being typed in any given 11-key window: (1/26)^11. Therefore, naive probability suggests you should have to wait exactly 26^11 keystrokes for *any* specific 11-letter sequence. But this assumes the sequences are independent, ignoring the hidden penalty of self-overlap.",
  "solution_path": "To find the exact expected time without solving a massive, chaotic state machine, we can use an incredibly elegant trick known as Conway's Martingale. Imagine a casino where a new gambler walks in right before every single keystroke.\n\nGambler 1 walks in, bets $1 that the next key will be 'A'. If the monkey types 'A', the casino pays 26-to-1, giving them $26. They leave that $26 on the table, betting the next key will be 'B'. If they win, they have $26^2, and bet it on 'R', and so on. If a gambler ever guesses wrong, they lose everything and go home. The casino stops the game the exact moment 'ABRACADABRA' is typed.\n\nWhen the game ends, what does the casino have to pay out?\n\nGambler 1 (who walked in 11 keystrokes ago) guessed all 11 letters correctly. They win $26^{11}.\n\nBut look closely at the word ABRACADABRA. The last four letters ('ABRA') match the first four letters. That means Gambler 8, who walked in 4 keystrokes ago, bet on 'A', then 'B', then 'R', then 'A'. They *also* won, collecting $26^4!\n\nSimilarly, the last letter is 'A'. Gambler 11 walked in just before the final keystroke, bet on 'A', and won $26^1.\n\nAll other gamblers lost their money. So, on the day the game ends, the casino pays out exactly $26^{11} + 26^4 + 26^1. \n\nBecause this is a mathematically fair casino, the total payout must equal the total amount of money brought in. Exactly $1 comes in per keystroke. Therefore, the expected number of $1 bets (keystrokes) required to break the bank is exactly 26^{11} + 26^4 + 26^1.",
  "why_it_works": "The expected time to type a word isn't just about its length; it is dictated by its self-overlap (autocorrelation). When you are trying to type a word that rhymes with its own prefix, partial successes stack up in the background. If you get to 'ABRACADABR' and the monkey types 'X', you didn't just fail to finish the 11-letter word. You simultaneously annihilated the 4-letter backup plan ('ABRA') and the 1-letter backup plan ('A') that were forming concurrently. Because a single typo destroys multiple stacked attempts at once, self-overlapping words take mathematically longer to recover from and complete.",
  "payoff": "Randomness tracks overlapping states. A string's expected wait time perfectly encodes its exact self-similarity, because in a random walk, the cost of a mistake is equal to all the partial progress it destroys.",
  "extension": "Compare 'ABRACADABRA' to 'ABCDEFGHIJK'. The latter has no self-overlap. Only the gambler who guesses all 11 letters wins anything. Thus, the expected time for 'ABCDEFGHIJK' is exactly 26^11. It is literally faster to stumble into a non-overlapping word than a self-overlapping one."
}
```

**The turn:** The expected time to randomly generate a string is not solely dictated by its length, but by its autocorrelation; words that overlap with their own prefixes take longer to generate because a single typo destroys multiple concurrent partial matches at once.

**Narrator notes:** When delivering the solution, emphasize the arrival of the *new* gamblers. The magic of the Martingale proof is realizing that the casino doesn't just evaluate the 11-letter word; it evaluates every possible trailing suffix simultaneously. Lean heavily on the dramatic tragedy of step 5: a single typo doesn't just cost you the big win, it bankrupts your backups.

## Evolving diagram (5 beats)
- **step 1** — shows: The word 'ABRACADABRA' in large monospace font, with an empty space beneath it.  
  _change:_ initial
- **step 2** — shows: The word 'ABRACADABRA' with the prefix 'ABRA' and the suffix 'ABRA' highlighted in matching blue. The final 'A' is also given a subtle secondary highlight in green.  
  _change:_ Highlighting the structural self-overlap (autocorrelation) of the string.
- **step 3** — shows: Below the word, a massive vertical bar chart labeled 'Gambler 1 Payout: $26^11' spans the entire width of the 11 letters.  
  _change:_ Introducing the primary winning bet when the full sequence is typed.
- **step 4** — shows: Two new bars appear nested under the right side of the word. Under the final 'ABRA', a medium bar labeled 'Gambler 8 Payout: $26^4'. Under the final 'A', a tiny bar labeled 'Gambler 11 Payout: $26^1'.  
  _change:_ Revealing the hidden, nested payouts caused by the string's self-overlap.
- **step 5** — shows: The text changes to 'ABRACADABR' followed by a red 'X'. In the exact same frame, all three payout bars completely shatter into dust.  
  _change:_ Demonstrating the penalty: a single wrong keystroke destroys the main word and simultaneously wipes out all nested backup plans.