**Mode:** teach

## Prerequisites

*   **Expected Value:** The long-run average of a random outcome. If you roll a standard six-sided die infinitely many times, the mathematical average of all your rolls will be exactly 3.5. We call this the "expected value."
*   **Linearity of Expectation (Fair Game):** In a perfectly fair casino game with no house edge, the expected amount of money you put into the game equals the expected amount of money you take out. The casino's expected profit is zero.
*   **State Transitions:** A way of modeling a process by breaking it into a series of "states" and the rules for moving between them. Think of it like a board game: depending on what you roll, you either advance a square toward the finish line, or hit a trap that sends you back to start. 
*   **Prefix and Suffix:** In a sequence of letters, a prefix is any chunk at the very beginning, and a suffix is any chunk at the very end. For the sequence `HTH`, `H` is both a prefix and a suffix. We say the sequence "overlaps with itself" (or has *autocorrelation*).

***

If you sit down with a fair coin and flip it three times, there are exactly eight possible outcomes (HHH, HHT, HTH, etc.). Because the coin is fair, every single one of those three-flip sequences has an identical $\frac{1}{8}$ probability of appearing. 

So, if you decide to flip a coin repeatedly until you see the sequence **HTT**, you should expect to wait the same number of flips as someone waiting to see **HTH**, right?

Actually, no. 

If you do the math—or just sit down and flip coins for an afternoon—you will find that it takes an average of **8 flips** to see HTT, but it takes an average of **10 flips** to see HTH. 

The culprit isn't the probability of the sequence itself. The culprit is what happens when you fail. 

### The Punishment of a Near-Miss

To understand the gap between 8 and 10, look at how each sequence handles a near-miss. 

Imagine you are trying to roll **HTH**. You flip an `H`, then a `T`. You are exactly one step away! You need an `H` to win. But you flip the coin and it lands on `T`. Your sequence is now `HTT`. 
You failed. Worse, you look at the sequence you currently have—`HTT`—and ask: *How much of my target (`HTH`) is salvaged here?* The answer is zero. `HTT` does not end in `H`, nor `HT`. You have completely destroyed your progress and must walk all the way back to the starting line.

Now imagine you are trying to roll **HTT**. You flip an `H`, then a `T`. You are one step away! You need a `T` to win. But the coin betrays you and lands on `H`. Your sequence is now `HTH`. 
You failed. But look at what you are left holding: `HTH`. What is the last letter of that failure? It's an `H`. And what is the first letter you need for your target (`HTT`)? An `H`! 
Your near-miss actually left you holding the very first step of your *next* attempt. You are saved from dropping all the way back to zero.

Because **HTH** overlaps with itself—its suffix is identical to its prefix—its failure states are mathematically punishing. **HTT** does not overlap with itself, so its failure states act as safety nets. 

### Conway's Magic Casino

The state transitions explain the *feel* of the wait, but how do we prove exactly *why* the expected flips are exactly 8 and exactly 10? For that, we can use a brilliantly simple thought experiment invented by mathematician John Horton Conway. 

Imagine a casino where a dealer is flipping a coin. 
* Before every flip, a new gambler walks through the doors. 
* The gambler pays $1 to the house, and bets that $1 on the first letter of your target sequence. 
* If they are right, the house pays fair 2-to-1 odds—meaning they get their $1 back plus $1 in profit, leaving them with $2. 
* The gambler takes that $2 and lets it ride, betting the whole thing on the *second* letter of the sequence. If they win, they have $4, which they bet on the third letter. If they win again, they have $8. 
* If a gambler guesses wrong at any point, the house takes their money and they go home. 

Crucially, because a coin is 50/50 and the house doubles your money on a win, this is a mathematically **fair game**. The casino has no edge. Therefore, the expected amount of money the casino collects must exactly equal the expected amount of money the casino pays out.

Furthermore, the game abruptly ends the exact moment your target sequence appears.

#### Calculating HTT

Let's say the target sequence is **HTT**. 
Let $N$ be the expected number of flips before the game ends. Because one gambler walks in every flip and pays $1, the casino takes in exactly $N$ dollars. 

Now, who gets paid out? 
When the game ends, the last three flips on the table are exactly `H T T`. 
* **Gambler A** walked in three flips ago. They bet on `H` (won $2), then `T` (won $4), then `T` (won $8). They take home $8.
* **Gambler B** walked in two flips ago. Their first bet is always the start of the sequence, so they bet on `H`. But the second-to-last flip was a `T`. They lost.
* **Gambler C** walked in one flip ago. They also bet on `H`. The final flip was a `T`. They lost.

Total payout = $8.
Because Money In = Money Out, the expected wait time $N$ is exactly **8 flips**.

#### Calculating HTH

Now let's change the target to **HTH**.
Let $M$ be the expected number of flips. The casino collects $M$ dollars. 

Who gets paid out when the game ends on `H T H`?
* **Gambler A** walked in three flips ago. They bet `H`, `T`, `H`. They won all three and take home $8.
* **Gambler B** walked in two flips ago. They bet `H`. The flip was `T`. They lost.
* **Gambler C** walked in one flip ago. They bet `H`. The final flip was `H`. **They won!**

Because the sequence ends in the same letter it begins with, Gambler C casually walks in on the final flip, places a $1 bet on `H`, and wins. They haven't finished the sequence, but they survived their first round, so the casino must hand them $2. 

Total payout = $8 + $2 = $10.
Because Money In = Money Out, the expected wait time $M$ is exactly **10 flips**.

### The Autocorrelation Penalty

The overlapping nature of **HTH** forces the casino to pay out "consolation prizes" to ghost gamblers at the exact moment the main jackpot is won. To balance the books for those extra payouts, the fair casino *must* run the game for a longer time to collect enough $1 entry fees. 

If you try to wait for **HHH**, the wait time is even worse. When `H H H` hits, Gambler A wins $8, Gambler B (who arrived on the second `H`) wins $4, and Gambler C (who arrived on the final `H`) wins $2. The expected wait is $8 + $4 + $2 = 14 flips!

In probability, this is the Autocorrelation Penalty. Self-overlapping patterns essentially clump together. Because **HTH** overlaps with itself, when you see one, you are highly likely to see another one immediately after (e.g., `HTHTH` contains two `HTH`s in just 5 flips). But if the overall probability of seeing the pattern across millions of flips must remain mathematically anchored at $\frac{1}{8}$, the only way to balance out those sudden, dense clumps is if the dry spells *between* the clumps are longer. 

Therefore, starting from a blank slate, the more a pattern overlaps with itself, the longer you will wait to see it.