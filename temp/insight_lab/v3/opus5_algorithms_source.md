**Mode:** teach

## Prerequisites

- **Comparison sort.** An algorithm that learns about its input only by asking "is $a \le b$?" and rearranging accordingly. Quicksort, mergesort, insertion sort are all of this kind.
- **The $n!$ intuition.** There are $n!$ possible orderings of $n$ distinct items. Any comparison-based method must, in principle, be able to distinguish all of them — which is why "just test every case" is hopeless: $16! \approx 2.09 \times 10^{13}$, about twenty trillion.
- **Comparator (compare-and-swap).** A gadget acting on two values $(a,b)$ that outputs them in sorted order: $(\min(a,b), \max(a,b))$. It never looks at anything else and never decides *whether* to act — it always acts.
- **Sorting network.** A fixed, hardwired list of comparators applied to $n$ wires, in a fixed order, regardless of the data. No `if`, no loops that depend on values, no branching. Same comparisons every single run. This is called *oblivious* computation: the control flow is blind to the input.
- **Monotone (nondecreasing) function.** A function $f:\mathbb{R}\to\mathbb{R}$ (or from any ordered set to any ordered set) with the property that $u \le v \implies f(u) \le f(v)$. It may flatten things out — it need not be strictly increasing.
- **Indicator / threshold function.** For a fixed real number $t$, the function
  $$f_t(v) = [\,v \ge t\,] = \begin{cases}1 & v \ge t\\ 0 & v < t\end{cases}$$
  It outputs only $0$ or $1$, and it is monotone: once you're above the threshold you stay above.
- **"Sorted" means nondecreasing.** A sequence $y_1,\dots,y_n$ is sorted if $y_1 \le y_2 \le \cdots \le y_n$. It is *un*sorted precisely when some adjacent pair is out of order: $y_i > y_{i+1}$ for some $i$.

---

## A circuit that sorts, and the awful cost of trusting it

Here is a strange kind of sorting algorithm. You have $n$ wires, each carrying a number. You have a fixed list of comparators — say wire 1 vs wire 3, then wire 2 vs wire 4, then wire 1 vs wire 2, and so on. Each comparator grabs its two wires, puts the smaller value on the upper wire and the larger on the lower, and passes them along. When the list is exhausted, you claim the wires are in sorted order.

Notice what's missing: any decision. A normal sorting algorithm asks a question and *chooses what to do next* based on the answer. This thing asks the same questions in the same order every time. It's a sieve, not a strategy. That's exactly what makes it beautiful for hardware, for GPUs, for constant-time cryptographic code: nothing about the timing or the memory access pattern leaks anything about the data, because nothing about the *control flow* depends on the data.

But now suppose someone hands you a proposed 16-wire network with sixty comparators and says "this sorts." How do you check?

Your first instinct: the network can only respond to the *relative order* of the inputs, so all that matters is which of the $16!$ orderings you feed it. Test all of them. That's $20{,}922{,}789{,}888{,}000$ tests — twenty trillion. At a billion tests per second, most of a day; at $n = 20$ it's $2.4 \times 10^{18}$ and you're finished never.

The actual answer: you need $2^{16} = 65{,}536$ tests. Feed it every sequence of sixteen bits. If it sorts all of those, it provably sorts every input — every list of reals, every list of strings, every list of anything with an order on it. Sixty-five thousand instead of twenty trillion, and it's not an approximation or a heuristic. It's a theorem.

**The hardest inputs for a comparison circuit are sequences of zeros and ones.** Let's see why.

## The key observation: comparators don't care about relabelling

Take any monotone function $f$. The whole proof rests on this single fact:

$$f(\min(a,b)) = \min(f(a), f(b)) \qquad\text{and}\qquad f(\max(a,b)) = \max(f(a), f(b)).$$

Why? Say $a \le b$ (the other case is symmetric, just swap names). Then $\min(a,b) = a$, so the left side of the first equation is $f(a)$. And since $f$ is monotone, $f(a) \le f(b)$, so $\min(f(a),f(b)) = f(a)$ too. Same value. The max statement is identical reasoning: $\max(a,b) = b$ gives $f(b)$, and $f(a)\le f(b)$ gives $\max(f(a),f(b)) = f(b)$. Done.

Read it in words: *a monotone function commutes with min and max.* Applying $f$ and then taking the smaller gives the same result as taking the smaller and then applying $f$. You can relabel first or sort first; the answer is the same. That's it. That's the entire engine.

Let's make it concrete. Take $a = 3$, $b = 7$, and let $f(v) = [v \ge 5]$, so $f(3) = 0$, $f(7) = 1$.

- Sort first: $(\min,\max) = (3,7)$, then apply $f$: $(0,1)$.
- Apply $f$ first: $(0,1)$, then sort: $(0,1)$. ✓

Now take $a = 7$, $b = 3$, same $f$.

- Sort first: $(3,7)$, then $f$: $(0,1)$.
- Apply $f$ first: $(1,0)$, then sort: $(0,1)$. ✓

And a case where $f$ collapses the two values, $a=3$, $b=4$, still $f(v)=[v\ge 5]$:

- Sort first: $(3,4)$, then $f$: $(0,0)$.
- Apply $f$ first: $(0,0)$, then sort: $(0,0)$. ✓

A comparator, in other words, is *blind to what the numbers are* — it only responds to their order, and $f$ never scrambles the order.

## Lifting it from one comparator to the whole network

Write $N(x)$ for the output of the network on the input vector $x = (x_1,\dots,x_n)$. And write $f(x)$ for applying $f$ to each coordinate: $f(x) = (f(x_1),\dots,f(x_n))$.

**Claim.** For every monotone $f$ and every input $x$:
$$N(f(x)) = f(N(x)).$$

*Proof by induction on the number of comparators.*

Base case: a network with zero comparators is the identity, so both sides are $f(x)$. ✓

Inductive step: suppose the claim holds for the first $k$ comparators of the network; call that partial network $N_k$, so $N_k(f(x)) = f(N_k(x))$. Now apply comparator number $k+1$, which acts on wires $i$ and $j$.

Start from the vector $f(N_k(x))$ — the same thing as $N_k(f(x))$, by hypothesis. The comparator replaces the entries on wires $i$ and $j$. In $f(N_k(x))$, those entries are $f(u)$ and $f(v)$, where $u,v$ are the values on wires $i,j$ in $N_k(x)$. The comparator turns them into
$$\big(\min(f(u),f(v)),\ \max(f(u),f(v))\big) = \big(f(\min(u,v)),\ f(\max(u,v))\big)$$
using our one-line fact. But $\big(\min(u,v), \max(u,v)\big)$ is exactly what the comparator would have produced acting on $N_k(x)$. So the wires $i,j$ now hold $f$ applied to the correct post-comparator values, and every other wire was untouched and already held $f$ of the correct value. Hence $N_{k+1}(f(x)) = f(N_{k+1}(x))$. ∎

So the picture is a commuting square you can slide $f$ across freely:

> Run the network, then relabel every value through $f$ — or relabel first and then run the network. Identical outcomes. The network cannot tell the difference.

Note we needed nothing about $f$ except monotonicity. It can be wildly discontinuous, constant on huge stretches, whatever — as long as it never inverts an order.

## The kill shot: manufacture a bit-string counterexample

Now suppose the network is *not* a correct sorter. Then there's some input $x$ whose output $y = N(x)$ is not sorted. Unsorted means precisely: there is a position $i$ with
$$y_i > y_{i+1}.$$

We want to produce a **0-1** input that the network also fails on. Here's the whole move: choose the threshold at the offending gap. Let
$$t = y_i, \qquad f(v) = [\,v \ge t\,].$$

Then:
- $f(y_i) = 1$, because $y_i \ge t$ (it equals $t$).
- $f(y_{i+1}) = 0$, because $y_{i+1} < y_i = t$.

So the vector $f(y)$ has a $1$ immediately followed by a $0$ at positions $i, i+1$. It is unsorted.

But $f(y) = f(N(x)) = N(f(x))$ by the commuting claim. So $N(f(x))$ is unsorted — and $f(x)$ is a vector of zeros and ones, because $f$ only ever outputs $0$ or $1$.

**We have converted an arbitrary failing input into a failing bit-string.** If the network fails anywhere, it fails on some 0-1 input. Contrapositive: if it succeeds on all $2^n$ bit-strings, it succeeds everywhere.

That's the **0-1 principle** (Knuth, *TAOCP* Vol. 3, §5.3.4, Theorem Z): *a comparator network sorts all inputs if and only if it sorts all 0-1 inputs.* The "only if" direction is trivial — bit-strings are inputs. The "if" direction is the argument above.

### A worked instance, so nothing feels like sleight of hand

Suppose your network, on input $x = (5.5,\ 2,\ 9,\ 1.25)$, wrongly outputs $y = (1.25,\ 5.5,\ 9,\ 2)$. The offense is at $i=3$: $y_3 = 9 > 2 = y_4$.

Set $t = 9$, $f(v) = [v \ge 9]$. Then:
- $f(x) = (0, 0, 1, 0)$ — a legitimate 0-1 input.
- $f(y) = (0, 0, 1, 0)$ — unsorted, as promised.

And the theorem guarantees that if you actually run the network on $(0,0,1,0)$, out comes $(0,0,1,0)$: the same bug, exposed by a four-bit test. You didn't need to find the real numbers. You never needed real numbers at all.

## Why this is the right kind of surprise

Two things are worth savouring here.

**First, the collapse.** Correctness over all of $\mathbb{R}^n$ — an uncountable space — collapses to correctness over the vertices of the binary cube $\{0,1\}^n$. And within that, the $n!$ orderings collapse to $2^n$ bit-strings, because a bit-string with $k$ ones is really just "where are the ones?" — and sorting it correctly means pushing all $k$ ones to the end. There are $\binom{n}{k}$ such patterns for each $k$, and $\sum_k \binom{n}{k} = 2^n$. The exponential is still an exponential, but $2^{16} = 65{,}536$ versus $16! \approx 2\times10^{13}$ is a factor of about **319 million**. A verification job that was a day's compute becomes a fraction of a millisecond.

**Second, where obliviousness earns its keep.** The proof leans hard on the fact that the network's structure is fixed. A branching algorithm can behave one way on $(5.5, 2, 9, 1.25)$ and a completely different way on $(0,0,1,0)$ — it *chooses* its next comparison based on answers, so a run on $f(x)$ need not shadow the run on $x$ at all, and the commuting square breaks. It is exactly because the sorting network refuses to make decisions that its behaviour on relabelled data is forced. **The rigidity that makes the circuit dumb is the rigidity that makes it provable.** Give up branching and you gain a proof technique.

And notice the shape of the argument: we didn't test cases, we found a *structure-preserving map* between them. The threshold function is a lens that projects any counterexample down onto the binary cube without losing the thing that made it a counterexample. Every possible failure, no matter how baroque the real numbers involved, casts a shadow made of bits — and the shadow is still a failure.

Sixty-five thousand tests, and you're certain.