**Mode:** puzzle

## Prerequisites

- **Fair coin flip.** Each flip is independent and lands H or T with probability $1/2$. "Independent" means earlier flips tell you nothing about later ones.
- **Expected value (expectation).** The long-run average of a random quantity. If a random number $X$ takes value $v$ with probability $p_v$, then $E[X] = \sum_v v\,p_v$. For waiting times we almost never compute this sum directly — we use the next two tools instead.
- **Conditioning / law of total expectation.** If the first step of a process can go several ways, the overall average is the weighted average of the averages that follow: $E[X] = \sum_i P(\text{case } i)\, E[X \mid \text{case } i]$. In words: "flip once, see what happened, then ask how much longer you expect to wait."
- **State (of a partial match).** While hunting for a pattern, all you need to remember is *how much of the pattern you currently have as a suffix of what you've flipped*. That summary is the "state." The process moving between states is a Markov chain: the future depends only on the current state, not the whole history.
- **Linear recurrence / small linear system.** Writing one equation per state ("expected remaining wait from here") gives a handful of simultaneous linear equations; solving them by substitution gives the answer.
- **KMP failure function (optional but illuminating).** In the Knuth–Morris–Pratt string-searching algorithm, for each prefix of the pattern you precompute the length of the longest proper suffix of that prefix that is also a prefix of the pattern. That is exactly "how far do I fall back when the next character mismatches." Self-overlap of a pattern is the whole story there too.
- **Non-transitivity.** A relation "A beats B" is transitive if A beats B and B beats C forces A beats C. Non-transitive means the beating relation can cycle, like rock–paper–scissors.

---

## The puzzle

Take a fair coin. Flip it repeatedly, and stop the moment the last two flips are **H then H**. Count your flips.

Now start over. Flip repeatedly, and stop the moment the last two flips are **H then T**. Count again.

**Which pattern takes longer on average — and by how much?**

Before you answer, notice the trap. On any *given* pair of consecutive flips, HH and HT are equally likely: each has probability $1/4$. HH is not a rarer event than HT. Every window of two flips is as friendly to one as to the other. So a first instinct — a very good instinct, honestly — says the two waits must be equal.

Sit with it a moment. Maybe simulate it in your head. Maybe flip a real coin ten times and write down where each pattern first appeared.

.

.

.

**Answer:** waiting for HH takes **6 flips** on average. Waiting for HT takes **4**. A 50% penalty for asking for two heads in a row instead of a head then a tail, even though both are $1/4$ per window.

Let's prove it, then understand it, then watch it explode into something much stranger.

---

## Part 1: Compute the two waits

The trick is to stop thinking about "windows of two flips" and start thinking about **progress**. At any moment, the only thing that matters is how much of the target pattern I've already got sitting at the end of my flip sequence. That's my state.

### Waiting for HT

States:

- **$S_0$** — no useful progress. Either I haven't flipped yet, or my last flip was a T.
- **$S_1$** — my last flip was an H. I'm one character into HT.
- **Done** — I've just seen HT.

Let $a$ = expected number of *further* flips needed from $S_0$, and $b$ = expected further flips from $S_1$.

From $S_0$: I flip once (cost 1). With probability $1/2$ it's an H and I move to $S_1$; with probability $1/2$ it's a T and I'm still in $S_0$ (a T gives me no progress toward HT, and it doesn't matter that there was a T before — a T is a T).

$$a = 1 + \tfrac12 b + \tfrac12 a$$

From $S_1$ (last flip was H): I flip once. With probability $1/2$ it's a T — **done**. With probability $1/2$ it's an H — and now my last flip is still an H, so I am *still in $S_1$*. This is the key line. Getting an H when I wanted a T costs me a flip but destroys nothing.

$$b = 1 + \tfrac12 \cdot 0 + \tfrac12 b$$

Solve the second: $b - \tfrac12 b = 1 \Rightarrow \tfrac12 b = 1 \Rightarrow b = 2$.

Solve the first: $a - \tfrac12 a = 1 + \tfrac12 (2) = 2 \Rightarrow \tfrac12 a = 2 \Rightarrow a = 4$.

$$\boxed{E[\text{wait for HT}] = 4}$$

### Waiting for HH

Same states, same meaning ($S_1$ = last flip was H = one character into HH).

From $S_0$: identical logic.

$$a = 1 + \tfrac12 b + \tfrac12 a$$

From $S_1$: I flip once. With probability $1/2$ it's an H — **done**. With probability $1/2$ it's a T — and now my progress is *gone*. A T is not a prefix of HH. I'm back in $S_0$, fully reset.

$$b = 1 + \tfrac12 \cdot 0 + \tfrac12 a$$

Substitute. From the first equation, $\tfrac12 a = 1 + \tfrac12 b$, so $a = 2 + b$. Plug into the second:

$$b = 1 + \tfrac12(2 + b) = 2 + \tfrac12 b \Rightarrow \tfrac12 b = 2 \Rightarrow b = 4, \quad a = 6.$$

$$\boxed{E[\text{wait for HH}] = 6}$$

The two computations differ in **exactly one place**: the fate of the "wrong" flip from state $S_1$. For HT, a wrong flip leaves you at $S_1$. For HH, a wrong flip throws you to $S_0$. That single difference — reset vs. no reset — is worth two whole flips.

### Sanity check by brute force

Let me verify $E[\text{HT}] = 4$ a second way, without recurrences, because a surprising answer deserves two proofs.

HT first occurs at flip $n$ exactly when the sequence is $\text{T}^i \text{H}^j \text{T}$ with $i + j + 1 = n$, $j \ge 1$: some run of tails, then a run of heads, then the first tail after that. (Any sequence *not* yet containing HT is a block of tails followed by a block of heads — as soon as an H is followed by a T you're done.) So

$$P(N = n) = \sum_{\substack{i\ge 0,\ j\ge 1 \\ i+j = n-1}} 2^{-n} = (n-1)\,2^{-n},$$

since $i$ can be $0,1,\dots,n-2$, giving $n-1$ choices. Check it sums to 1: $\sum_{n\ge2}(n-1)2^{-n} = \sum_{m\ge1} m\,2^{-m-1} = \tfrac12 \cdot 2 = 1$. ✓

Now the mean: $E[N] = \sum_{n \ge 2} n(n-1)2^{-n}$. Using $\sum_{m\ge1} m(m+1)x^{m} = \frac{2x}{(1-x)^3}$ with $x = 1/2$ (substituting $m = n-1$, so $n(n-1) = (m+1)m$ and $2^{-n} = \tfrac12 2^{-m}$):

$$E[N] = \tfrac12 \sum_{m\ge1} m(m+1)2^{-m} = \tfrac12 \cdot \frac{2 \cdot \tfrac12}{(\tfrac12)^3} = \tfrac12 \cdot \frac{1}{1/8} = \tfrac12 \cdot 8 = 4. ✓$$

Good. The recurrence wasn't lying.

---

## Part 2: Why, intuitively — the self-overlap

Here's the sentence that makes it click:

> **HH overlaps itself. HT does not.**

Concretely: chop the last character off HH and you get "H", which is also the *start* of HH. So a failed attempt at HH can still be a partial success — but more importantly, the flip that *fails* you (a T) is a character that appears nowhere in the pattern's beginning, so it costs you everything you had.

Compare HT. Once you have an H in hand, look at your two possible futures:
- Next flip is T → you finish. 
- Next flip is H → you didn't finish, but your last flip is *still an H*, which is still exactly one character of progress. You lost a flip, not a position.

Once you're one H into HT, **you can never be knocked back**. Progress is a ratchet. You will finish on the very first T that ever follows.

For HH, once you're one H in, you're standing on a trapdoor. Half the time the next flip is a T and you're at zero, having to earn that first H all over again.

### The KMP framing

If you've written a Knuth–Morris–Pratt string matcher, this is the failure function and nothing else. KMP precomputes, for each prefix of the pattern, *where to fall back to* on a mismatch: the longest proper suffix of that prefix that is also a prefix of the pattern. The automaton I wrote above **is** the KMP automaton for a two-character pattern over the alphabet $\{H,T\}$, and the expected waiting time is just the expected number of steps for a random walk over that automaton to reach the accept state.

For pattern HT, mismatching at position 2 (you wanted T, got H): the character you just read, H, restarts the pattern, so you fall back to length 1, not 0. For pattern HH, mismatching at position 2 (you wanted H, got T): T restarts nothing, fall back to 0.

Patterns whose "wrong" characters happen to be useful prefixes are cheap to find. Patterns that self-overlap tend to be expensive, because the character that breaks them is a character that gives you nothing.

A tidy general fact worth carrying home (it can be proved with a martingale argument due to Shuo-Yen Robert Li, 1980 — the "ABRACADABRA" argument): for a fair coin and a pattern $P$ of length $L$,

$$E[\text{wait for }P] = \sum_{k=1}^{L} 2^k \cdot [\,\text{the first } k \text{ characters of } P = \text{the last } k \text{ characters of } P\,].$$

That is: add $2^k$ for every $k$ such that $P$'s length-$k$ prefix equals its length-$k$ suffix. Check it:

- **HT**: $k=2$ overlaps trivially (whole string with itself): $+4$. $k=1$: prefix "H" vs suffix "T" — no. Total $4$. ✓
- **HH**: $k=2$: $+4$. $k=1$: "H" vs "H" — yes, $+2$. Total $6$. ✓
- **HHH**: $8 + 4 + 2 = 14$.
- **THH**: $8$ only (prefix "T" ≠ suffix "H"; "TH" ≠ "HH"). So $8$.
- **HTH**: $8 + 2 = 10$.

So HHH takes on average 14 flips to appear and THH takes 8. Self-overlap is *expensive*, and this formula shows you exactly why: each self-overlap of length $k$ is an extra debt of $2^k$.

*Why the formula is true, in one paragraph:* imagine a casino where, at every time step, a new gambler walks in and bets \$1 that the pattern starts right now — she bets on the first character at fair 1:1 odds, and if she wins she parlays her \$2 onto the second character, and so on, so a gambler who sees the whole pattern from her start point walks away with $2^L$ and every other gambler walks away with \$0. The game is fair, so at the stopping time the casino's expected profit is zero: expected money in ($=E[N]$, one dollar per gambler) equals money out. When the pattern first completes at time $N$, who is holding money? The gambler who started $L$ steps ago has $2^L$. A gambler who started $k$ steps ago (for $k<L$) is still alive exactly when the last $k$ characters flipped match the first $k$ characters of the pattern — i.e., exactly when $P$ has a self-overlap of length $k$ — and she holds $2^k$. Sum up: $E[N] = \sum 2^k$ over self-overlaps. That's it.

---

## Part 3: Now make it a race, and things get weird

Averages are one thing. Racing is another, and the difference is where the real fun lives.

**Penney's game** (Walter Penney, 1969): you and I each pick a three-flip pattern. Then we flip a fair coin repeatedly, generating one shared stream. Whoever's pattern appears first in that stream wins. I generously let you choose first.

You reason: heads-heads-heads feels strong, or maybe I should pick something with a short waiting time. Say you pick **HHH**.

I pick **THH**. And I win with probability $\mathbf{7/8}$.

### Why THH crushes HHH — no algebra needed

For HHH to win, it must appear before THH does. Consider the *very first* occurrence of HHH in the stream. What are the three characters right before it? If HHH is not at the very start of the sequence, then whatever character precedes the winning run, look at the flip immediately before the first H of that HHH run. It cannot be an H (or HHH would have completed one step earlier). So it must be a **T**. But then the stream contains **T**, **H**, **H** consecutively — THH — finishing *one flip before* HHH does. THH already won.

So HHH can only win in the single scenario where the sequence *begins* HHH — there's no character in front of it to be a T. That happens with probability $\tfrac{1}{2}^3 = \tfrac18$.

$$P(\text{THH beats HHH}) = 1 - \tfrac18 = \tfrac{7}{8}.$$

Not "slightly better." Seven to one. And notice this is a *pure structural* argument: THH is parasitic on HHH. It lurks one step upstream. Any occurrence of HHH is, except at the very beginning of time, preceded by an occurrence of THH.

Note also that this has nothing to do with average waiting time being smaller — though here it happens to be ($8 < 14$). Racing and averaging are genuinely different questions, and one of the delights of Penney's game is that they can disagree. It's perfectly possible for pattern A to have a longer solo waiting time than B and still beat B head-to-head, because a race is decided by *who ambushes whom*, not by who is faster in isolation.

### The general recipe (and the non-transitivity)

For any three-character pattern your opponent picks, say $x\,y\,z$, you answer with

$$\bar{y}\,x\,y$$

where $\bar y$ is the opposite of $y$. You take their first two characters and glue a flipped version of their *second* character onto the front. Your pattern's last two characters are their first two, so you lurk one step upstream: almost any time their pattern appears, yours appeared one flip earlier.

Examples:
- They pick HHH → you pick **THH**, win $7/8$.
- They pick HHT → you pick **THH**, win $3/4$.
- They pick HTH → you pick **HHT**, win $2/3$.
- They pick HTT → you pick **HHT**, win $2/3$.
- (And mirror-image everything by swapping H↔T.)

Now stack the consequences:

$$\text{THH beats HHT} \quad (3/4)$$
$$\text{HHT beats HTT} \quad (2/3)$$
$$\text{HTT beats TTH} \quad (3/4)$$
$$\text{TTH beats THH} \quad (2/3)$$

Follow that chain around: THH → HHT → HTT → TTH → back to THH. **A cycle.** "Beats" is not transitive. There is no strongest three-flip pattern — for *every* pattern, there is another that beats it, and the recipe above hands it to you in two seconds of mental work. This is rock-paper-scissors hiding inside a fair coin, and the only asymmetry it feeds on is the overlap structure of strings.

Which is the punchline worth keeping: the coin is perfectly symmetric, every triple has probability exactly $1/8$ per window, and yet the patterns form a dominance cycle. All the structure came from *how patterns can overlap each other*, not from the coin.

### For the completists: computing any matchup, and why 3/4

For general pairs you can use **Conway's leading-number algorithm**. Define, for patterns $A$ and $B$, the correlation
$$A{:}B \;=\; \sum_{k=1}^{|B|} 2^{k-1}\cdot[\,\text{last } k \text{ chars of } A \;=\; \text{first } k \text{ chars of } B\,]$$
(so $A{:}A$ measures self-overlap; note the powers here are $2^{k-1}$, a convention that cancels out in the ratio). Then the odds that $B$ beats $A$ are
$$\frac{P(B \text{ wins})}{P(A \text{ wins})} \;=\; \frac{A{:}A - A{:}B}{B{:}B - B{:}A}.$$

Try $A = $ HHT, $B = $ THH.

- $A{:}A$ (HHT vs HHT): $k=1$: last char T vs first char H — no. $k=2$: "HT" vs "HH" — no. $k=3$: "HHT" vs "HHT" — yes, $+2^2 = 4$. So $A{:}A = 4$.
- $A{:}B$ (last $k$ of HHT vs first $k$ of THH): $k=1$: T vs T — yes, $+1$. $k=2$: "HT" vs "TH" — no. $k=3$: "HHT" vs "THH" — no. So $A{:}B = 1$.
- $B{:}B$ (THH vs THH): $k=1$: H vs T — no. $k=2$: "HH" vs "TH" — no. $k=3$: yes, $+4$. So $B{:}B = 4$.
- $B{:}A$ (last $k$ of THH vs first $k$ of HHT): $k=1$: H vs H — yes, $+1$. $k=2$: "HH" vs "HH" — yes, $+2$. $k=3$: "THH" vs "HHT" — no. So $B{:}A = 3$.

Odds $= \dfrac{4-1}{4-3} = \dfrac{3}{1}$. So THH beats HHT three times out of four. ✓ Exactly as claimed.

And check the flagship: $A = $ HHH, $B = $ THH.
- $A{:}A$: $k=1$ H=H ✓ $+1$; $k=2$ "HH"="HH" ✓ $+2$; $k=3$ ✓ $+4$. Total $7$.
- $A{:}B$: last $k$ of HHH vs first $k$ of THH: H vs T no; "HH" vs "TH" no; "HHH" vs "THH" no. Total $0$.
- $B{:}B = 4$ (computed above).
- $B{:}A$: last $k$ of THH vs first $k$ of HHH: H vs H ✓ $+1$; "HH" vs "HH" ✓ $+2$; "THH" vs "HHH" no. Total $3$.

Odds $= \dfrac{7-0}{4-3} = 7$. THH beats HHH $7{:}1$, i.e. probability $7/8$. ✓

Notice what the formula is telling you. The numerator $A{:}A - A{:}B$ says: *$A$'s handicap is its own self-overlap (expensive, per Part 2) minus how much it helps set up $B$.* HHH is maximally self-overlapping ($7$) and gives $B=$ THH no head start at all ($0$), so it is maximally doomed. The very property that made HH slow in the two-flip puzzle — self-overlap — is the same property that makes HHH a sitting duck in the race.

---

## The shape of the whole thing

1. Two patterns can be equally likely in any fixed window and still have different expected first-appearance times, because waiting is about *how a partial match survives a bad flip*, not about window probabilities.
2. The mechanism is self-overlap. Overlapping patterns can be knocked back to zero; non-overlapping ones ratchet forward. Quantitatively: $E[\text{wait}] = \sum_k 2^k$ over self-overlaps.
3. This is literally the KMP failure function — the fallback table of a string matcher — reinterpreted as a random walk.
4. In head-to-head races, patterns can ambush each other by sitting one step upstream, and the resulting dominance relation cycles. There is no best three-flip pattern.
5. Let your opponent choose first. Always.