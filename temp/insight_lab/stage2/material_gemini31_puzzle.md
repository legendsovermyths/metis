# [gemini31] MATERIAL — Equally Common, Unequally Awaited  ·  form: **puzzle**

_Why this form:_ The insight is a counterintuitive mathematical truth that can be solved purely mentally by breaking down the expectation, making it a perfect puzzle.

## Material
```json
{
  "setup": "You flip a fair coin repeatedly. In Game 1, you stop as soon as you see the sequence Heads-Tails (HT). In Game 2, you stop as soon as you see Heads-Heads (HH).",
  "question": "What is the expected number of flips to finish Game 1, and Game 2? (Provide two integers).",
  "correct_answer": "HT takes 4 flips. HH takes 6 flips.",
  "the_trap": "Assuming both take exactly 4 flips because both patterns have a 1/4 chance of appearing in any two flips, and over a long sequence, both patterns occur with the exact same frequency.",
  "solution_path": "Calculate HT in your head: wait for your first Heads (takes 2 flips on average). Now wait for a Tails. If you flip a Heads while waiting, your progress isn't ruined—you still have a Heads! So that's 2 more flips, totaling 4. For HH: wait for your first Heads (2 flips). Now you need another. If you flip a Tails, your progress is completely erased and you start over. This reset penalty pushes the wait time to 6.",
  "payoff": "Over a million flips, HH and HT happen exactly as often (averaging once every 4 flips). But because HH overlaps itself (H-H-H is two HHs in just three flips), it arrives in tight clumps. To keep the same overall frequency, the droughts between HH clumps must be much longer. When you start a game from scratch, you drop into a random gap, and you are statistically much more likely to fall into a long drought!"
}
```

## Evolving diagram (4 beats)
- **step 1** — shows: Two empty timelines labeled 'Wait for HT' and 'Wait for HH'.  
  _change:_ initial
- **step 2** — shows: HT timeline partitioned into two successful phases.  
  _change:_ Add checkpoints to the HT timeline: a jump to 'First H' labeled '2 flips', and a jump to 'First T' labeled '+2 flips = 4'.
- **step 3** — shows: HH timeline with a reset mechanic.  
  _change:_ Add a checkpoint for 'First H' on the HH timeline, but draw a red arrow looping back to start labeled 'If T, lose progress', revealing the total is 6.
- **step 4** — shows: A long string of coin flips comparing the spacing of HT and HH occurrences.  
  _change:_ Reveal a long sequence of H and T. Highlight HT occurrences with evenly spaced boxes, and HH occurrences with overlapping boxes (e.g. H-H-H) separated by long, empty gaps.