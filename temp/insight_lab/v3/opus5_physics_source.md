**Mode:** teach

## Prerequisites

- **Simple random walk on a lattice.** A walker sits at a point of a grid (the integers $\mathbb{Z}$, the square grid $\mathbb{Z}^2$, the cubic grid $\mathbb{Z}^3$). Each step, it picks one of the neighbouring points uniformly at random and moves there. In $\mathbb{Z}^2$ there are 4 neighbours (probability $1/4$ each); in $\mathbb{Z}^3$ there are 6.

- **Recurrent vs. transient.** The walk is *recurrent* if, with probability 1, it returns to its starting point (and hence, by repeating the argument, returns infinitely often). It is *transient* if there is some positive probability that it wanders off and never comes back. Pólya's theorem (1921): the walk is recurrent in dimensions 1 and 2, transient in dimension 3 and above. "A drunk man will find his way home; a drunk bird may get lost forever."

- **Degree.** The number of edges at a vertex. $\deg = 2d$ on the lattice $\mathbb{Z}^d$.

- **Harmonic function / discrete Laplacian.** A function $v$ on the vertices of a graph is *harmonic* at a vertex $x$ if its value there equals the average of its values at the neighbours: $v(x) = \frac{1}{\deg(x)}\sum_{y\sim x} v(y)$. Equivalently the discrete Laplacian $\Delta v(x) = \sum_{y\sim x}\big(v(y)-v(x)\big)$ vanishes. The key fact we will use is the **maximum principle**: a function harmonic everywhere on a finite region attains its extreme values on the boundary, and consequently a harmonic function is completely determined by its boundary values. (Sketch of why: if an interior vertex held a strict maximum, it couldn't equal the average of its neighbours; and if two harmonic functions agreed on the boundary, their difference would be harmonic with boundary value 0, hence identically 0.)

- **Ohm's law and Kirchhoff's laws.** In a resistor network, current $i$ through a resistor of resistance $R$ with voltage difference $V$ across it satisfies $V = iR$. At any node with no external current injected, currents in equal currents out (Kirchhoff's node law).

- **Series and parallel resistance.** Resistors in a chain add: $R = R_1 + R_2 + \cdots$. Resistors side by side combine by reciprocals: $1/R = 1/R_1 + 1/R_2 + \cdots$. In particular $n$ resistors of $1\,\Omega$ in parallel give $1/n\ \Omega$.

- **Effective resistance.** Between two nodes $a$ and $b$ of a network, the whole tangle behaves like a single resistor $R_{\text{eff}}(a\leftrightarrow b)$: apply a voltage, measure the current, take the ratio.

- **Series convergence facts.** $\sum_{n\ge1} \frac1n = \infty$ (the harmonic series diverges — it grows like $\ln N$). $\sum_{n\ge1}\frac{1}{n^2} = \pi^2/6 < \infty$. More generally $\sum 1/n^p$ converges exactly when $p>1$.

---

# Drunkards, Solved With Resistors

## The question, and the wrong tool

Here is Pólya's question. Drop a walker at the origin of the square grid. It staggers randomly forever. Does it come home?

The naive attack is combinatorial: count the paths. Let $p_n$ be the probability of being back at the origin after $n$ steps, sum them up, and compare $\sum p_n$ to infinity. This works — in $\mathbb{Z}^2$, $p_{2n} \approx \frac{1}{\pi n}$ and the sum diverges; in $\mathbb{Z}^3$, $p_{2n}\approx c\, n^{-3/2}$ and it converges — but it costs you central binomial coefficients, Stirling's formula, and in three dimensions a genuinely fiddly multinomial estimate. It's a computation, not an idea.

Here is the idea. **Turn the lattice into a circuit.** Replace every edge of the grid by a 1-ohm resistor. Then:

> The walk is recurrent **exactly when** the resistance from the origin out to infinity is infinite.

And resistance is *easy* to estimate, because of one absurdly cheap principle:

> **Shorting** nodes together (soldering them into one) can only *lower* resistance.
> **Cutting** edges (snipping wires) can only *raise* it.

So to prove recurrence you sabotage your network into something simpler with *smaller* resistance and show even that is infinite. To prove transience you sabotage in the other direction and show even the *bigger* resistance is finite. Both sabotages, in the lattices we care about, reduce to a series or a parallel sum you can do on a napkin. That's the whole trick. Let's earn it.

---

## Part 1: Voltages *are* probabilities

Take any finite connected graph. Pick two special vertices, $a$ and $b$. Two apparently unrelated questions:

**Electrical question.** Make every edge a 1-ohm resistor. Hold $a$ at 1 volt and $b$ at 0 volts. What's the voltage $v(x)$ at every other node?

**Probabilistic question.** Start a random walker at $x$. It walks until it first hits $a$ or $b$. What's the probability $h(x)$ that it hits $a$ first?

**Claim: $v = h$.** They are the same function. Not analogous — equal.

*Why.* Both functions are harmonic at every vertex other than $a,b$, and both have the same values at $a$ and $b$. Since a harmonic function is pinned down by its boundary values (maximum principle, above), they coincide.

Check the harmonicity of each:

*The voltage.* Let $x$ be a node other than $a,b$; no current is injected there. Every edge at $x$ has resistance 1, so the current flowing out of $x$ along the edge to neighbour $y$ is $\big(v(x)-v(y)\big)/1$. Kirchhoff says the net outflow is zero:
$$\sum_{y\sim x}\big(v(x)-v(y)\big)=0 \quad\Longleftrightarrow\quad v(x)=\frac{1}{\deg(x)}\sum_{y\sim x}v(y).$$
That's exactly harmonic. And $v(a)=1$, $v(b)=0$.

*The probability.* From $x$, the walker's first step goes to a uniformly random neighbour $y$, and then it's just a walker starting at $y$:
$$h(x)=\frac{1}{\deg(x)}\sum_{y\sim x}h(y).$$
Harmonic again. And $h(a)=1$ (already there), $h(b)=0$.

Same equation, same boundary data, so the same function. **Voltage is a hitting probability.** Kirchhoff's laws and the random walk are two dialects of one language, the graph Laplacian.

This is worth pausing on. A voltmeter is a probability-measuring device. Put 1 volt on your house and 0 volts on the pub, and the reading at any lamppost tells you the chance a stumbling walker starting there reaches home before the pub.

---

## Part 2: The escape probability formula

Now the quantitative version. Same finite graph, walker starts at $a$, and we ask about *escape*: the probability it reaches $b$ **before** returning to $a$. Call it $p_{\text{esc}}$.

**Claim.**
$$\boxed{\,p_{\text{esc}} = \frac{1}{\deg(a)\cdot R_{\text{eff}}(a\leftrightarrow b)}\,}$$

*Why.* Set up the circuit as before: $v(a)=1$, $v(b)=0$, $v$ harmonic elsewhere. Consider the total current $I$ flowing out of $a$ into the network. By Ohm's law on each edge at $a$,
$$I = \sum_{y\sim a}\big(v(a)-v(y)\big) = \sum_{y\sim a}\big(1-v(y)\big) = \deg(a)\cdot\Big(1 - \frac{1}{\deg(a)}\sum_{y\sim a}v(y)\Big).$$
Now read the parenthesis probabilistically. By Part 1, $v(y)$ is the probability that a walker at $y$ hits $a$ before $b$; so $\frac{1}{\deg(a)}\sum_{y\sim a}v(y)$ is exactly the probability that a walker *starting at $a$* — after taking its first random step to some neighbour $y$ — gets back to $a$ before reaching $b$. That is $1-p_{\text{esc}}$. Therefore
$$I = \deg(a)\cdot p_{\text{esc}}.$$
But also, by the definition of effective resistance, with a 1-volt drop from $a$ to $b$ the current is $I = 1/R_{\text{eff}}(a\leftrightarrow b)$. Equate:
$$\frac{1}{R_{\text{eff}}} = \deg(a)\, p_{\text{esc}} \qquad\Longrightarrow\qquad p_{\text{esc}} = \frac{1}{\deg(a)\,R_{\text{eff}}}.$$

Beautiful and rigid. High resistance means low escape probability: the walker, like the current, finds it hard to get out.

### Passing to infinity

Our lattices are infinite, so do it by exhaustion. Let $B_n$ be the ball of radius $n$ around the origin in the lattice, and let $b$ be the single node obtained by soldering together everything on the boundary sphere of radius $n$ (call this shorted node "$\partial_n$"). Let
$$R_n = R_{\text{eff}}(0 \leftrightarrow \partial_n).$$
These $R_n$ increase with $n$ (you're adding more resistance between the origin and a farther-away target). Define $R_\infty = \lim_{n\to\infty} R_n \in (0,\infty]$: **the resistance from the origin to infinity.**

Correspondingly, let $p_n$ = probability the walker reaches distance $n$ before returning to the origin $=\frac{1}{2d\,R_n}$. As $n\to\infty$, the event "reach distance $n$ before returning" shrinks down to the event "never return" (a walker that never returns must eventually pass every distance; a walker that returns fails for all large $n$). So
$$p_{\text{escape forever}} = \lim_{n\to\infty} p_n = \frac{1}{2d\,R_\infty}.$$

Hence:

> **Recurrence** ($p_{\text{escape}}=0$) $\iff R_\infty = \infty$.
> **Transience** ($p_{\text{escape}}>0$) $\iff R_\infty < \infty$.

The drunkard's fate is a resistance measurement. Now we need to measure it — and here the miracle is that we don't need to measure it, only bound it crudely.

---

## Part 3: Rayleigh monotonicity — why crude bounds suffice

Two facts, both intuitive, both provable in a line from the right principle.

**Shorting law.** Solder two nodes together (declare them one node, a perfect wire between them). The effective resistance between any two remaining terminals can only *decrease* or stay the same.

**Cutting law.** Delete an edge (or raise its resistance). The effective resistance can only *increase* or stay the same.

Intuitively: giving current more ways through helps; taking ways away hurts. But we want this to be airtight, because the entire proof rests on it. The clean route is **Thomson's principle**.

### Thomson's principle

For a unit of current flowing in at $a$ and out at $b$, define the *energy* of any candidate current pattern (any assignment of currents $j_e$ to edges, with directions, obeying Kirchhoff's node law everywhere except at $a$ and $b$, where net 1 unit enters/leaves) as
$$E(j)=\sum_e R_e\, j_e^2 .$$
**Claim: the true electrical current $i$ is the unique such flow minimizing $E$, and $E(i) = R_{\text{eff}}(a\leftrightarrow b)$.**

*Why it minimizes.* Let $j = i + f$ be any other unit flow; then $f$ is a flow with zero net input everywhere (a "circulation"). Expand:
$$E(j) = \sum_e R_e (i_e+f_e)^2 = E(i) + 2\sum_e R_e i_e f_e + \sum_e R_e f_e^2 .$$
The cross term vanishes: $R_e i_e$ is the voltage drop $v(x)-v(y)$ across edge $e=(x,y)$, so
$$\sum_e R_e i_e f_e = \sum_{e=(x,y)} \big(v(x)-v(y)\big) f_e = \sum_x v(x)\cdot(\text{net }f\text{ out of }x) = 0,$$
since a circulation has zero net outflow everywhere. (This regrouping is just bookkeeping: each edge contributes $v(x)f_e$ at its tail and $-v(y)f_e$ at its head.) So $E(j) = E(i) + \sum_e R_e f_e^2 \ge E(i)$, with equality only if $f\equiv 0$. Done.

*Why $E(i)=R_{\text{eff}}$.* With unit current in at $a$ and out at $b$, the voltage difference is $V = R_{\text{eff}}\cdot 1$. And $E(i)=\sum_e R_e i_e^2 = \sum_e (\text{drop})\cdot i_e$, which by the same regrouping equals $\sum_x v(x)\cdot(\text{net current out of } x) = v(a)\cdot 1 + v(b)\cdot(-1) = V = R_{\text{eff}}$.

### Now the two laws fall out

**Cutting raises resistance.** Cut an edge from network $N$ to get $N'$. Any unit flow in $N'$ is also a unit flow in $N$ (it just happens to send 0 along the cut edge), with the same energy. So the set of candidate flows in $N'$ is a *subset* of those in $N$; minimizing over a smaller set gives a bigger (or equal) minimum. Hence $R'_{\text{eff}} \ge R_{\text{eff}}$. ∎

**Shorting lowers resistance.** Solder $x$ and $y$ together. Now flows are allowed to violate Kirchhoff's law at $x$ and at $y$ individually, as long as the combined node $\{x,y\}$ balances — because current may pass freely through the solder. So the candidate set got *bigger*, and the minimum can only drop. Hence $R^{\text{short}}_{\text{eff}} \le R_{\text{eff}}$. ∎

That's the whole toolkit. Note how *forgiving* it is: we may mutilate the lattice as brutally as we like, as long as we mutilate in the direction that makes our desired conclusion harder, not easier. We get a free pass on all the geometric complexity.

---

## Part 4: The 2D drunk gets home

**Goal:** show $R_\infty = \infty$ for $\mathbb{Z}^2$. Since shorting only *lowers* resistance, if we short things and *still* get infinity, we're done.

**The sabotage.** Solder together every lattice point at the same $\ell^\infty$ distance from the origin — i.e. collapse each square "ring" $S_n=\{x: \max(|x_1|,|x_2|)=n\}$ into a single node. The network becomes a simple chain: node $S_0$ (the origin) — node $S_1$ — node $S_2$ — ⋯, where consecutive nodes are joined by all the original edges that ran between consecutive rings, now in parallel.

**Count the edges between ring $n$ and ring $n+1$.** Ring $n$ is the boundary of the square of side $2n+1$, containing $8n$ points (for $n\ge1$). Each point of ring $n$ has at most 3 edges going outward to ring $n+1$ (corner points have 3, edge points have 1 — the exact count doesn't matter). So the number of connecting edges is at most $3\cdot 8n = 24n$; call it $c_n \le 24n$. (For $n = 0$: 4 edges.)

**Combine.** Those $c_n$ unit resistors sit in parallel between the soldered rings, giving resistance $1/c_n$. The rings are in series, so
$$R_\infty^{\text{shorted}} = \sum_{n\ge 0}\frac{1}{c_n} \ \ge\ \frac14 + \sum_{n\ge1}\frac{1}{24n} \ =\ \frac14 + \frac{1}{24}\sum_{n\ge1}\frac1n \ = \ \infty.$$

The harmonic series diverges — and it diverges *just barely*, logarithmically. That single fact is the whole reason the 2D drunk comes home.

Since shorting lowers resistance, the true resistance satisfies $R_\infty \ge R_\infty^{\text{shorted}} = \infty$. So $R_\infty = \infty$, so
$$p_{\text{escape}} = \frac{1}{4\cdot\infty} = 0.$$
**The 2D walk is recurrent.** The drunk always finds home.

(For $\mathbb{Z}^1$ it's even blunter: no shorting needed, the network *is* a chain of unit resistors, $R_n = n \to \infty$. Recurrent.)

Notice the geometric story hidden in the arithmetic: in the plane, the number of exit routes at distance $n$ grows like $n$, i.e. like the perimeter — and $\sum 1/n$ diverges. The plane simply does not widen fast enough to let current, or drunks, leak away.

---

## Part 5: The 3D drunk is lost forever

**Goal:** show $R_\infty < \infty$ for $\mathbb{Z}^3$. Since cutting only *raises* resistance, if we snip the lattice down to something whose resistance is *still finite*, we're done.

Here's the elegant version of the sabotage. We snip until what remains is a **tree of disjoint escape paths**, and then we simply add up their parallel resistances.

**The construction (Doyle–Snell's "NW-tree" idea, in spirit).** Think of the sphere-like shells $S_n$ around the origin in $\mathbb{Z}^3$; the number of lattice points at distance about $n$ grows like $n^2$ (surface area). We want to route, from the origin outward, a large family of **edge-disjoint infinite paths**, and keep only those paths, deleting every other edge of $\mathbb{Z}^3$.

Concretely, build a branching tree: from the origin, a single path runs out for a while; at successive stages each strand splits into 2 (using disjoint sets of lattice edges, which is possible because the shells grow quadratically — there is plenty of room in three dimensions to fan out without collisions). Let the strand-count double at the shells $n \approx 2^k$: after the $k$-th branching there are $2^k$ strands, and the segment of each strand between the $k$-th and $(k{+}1)$-th branchings has length about $2^{k+1}-2^k = 2^k$ edges.

Why is doubling at radius $2^k$ geometrically legal? At radius $r=2^k$ the sphere has about $r^2 = 4^k$ lattice sites, but we only need $2^k$ strands to pass through it — a vanishing fraction, roughly $2^{-k}$, so the strands can be kept comfortably apart. Three dimensions has room to spare; this is exactly what two dimensions lacks, where the sphere only offers $\sim r$ sites and doubling would jam.

**Compute the resistance of the tree.** Because the strands are edge-disjoint, the tree is a pure series–parallel object. Level $k$ consists of $2^k$ parallel segments, each of resistance $\approx 2^k$ (that many unit resistors in series). So level $k$ contributes
$$R_k \approx \frac{2^k}{2^k} = 1?$$
That would diverge — so let's be a little more aggressive, and this reveals the right tuning. Instead, branch **faster**: let the strand count double every time the radius increases by a fixed amount... no, cleanest is to let each strand split into **4** at each stage, matching the $r^2$ growth of the shells. Redo it: split into 4 at radius $2^k$, so there are $4^k$ strands at radius $2^k$ — exactly the order of the number of available sites, still fine to route with a constant fraction of room. The segment at level $k$ again has length $\approx 2^k$. Then
$$R_k \approx \frac{2^k}{4^k} = 2^{-k},$$
and the levels are in series:
$$R_{\text{tree}} \approx \sum_{k\ge0} 2^{-k} = 2 < \infty.$$

A finite number. (If you'd rather avoid geometric bookkeeping altogether, the same conclusion follows from shells: keep only "monotone-ish" disjoint routes and note the parallel count at radius $n$ grows like $n^2$, so the series-of-parallels sum behaves like $\sum_n 1/n^2 = \pi^2/6 < \infty$. That is the honest heart of it: **in 3D the escape capacity at distance $n$ grows like $n^2$, and $\sum 1/n^2$ converges.**)

**Conclude.** $\mathbb{Z}^3$ contains this tree as a subnetwork; the tree was obtained by *deleting* edges. Cutting only raises resistance, so
$$R_\infty(\mathbb{Z}^3) \ \le\ R_{\text{tree}} \ <\ \infty.$$
Therefore
$$p_{\text{escape}} = \frac{1}{6\, R_\infty} \ >\ 0.$$
**The 3D walk is transient.** With positive probability the drunken bird never comes home — and then, since each fresh visit to the origin gives it another independent shot at escaping, it returns only finitely often, almost surely. (If the escape chance is $p>0$, the number of returns is geometric with mean $1/p - 1 <\infty$.)

And once $\mathbb{Z}^3$ is transient, so is $\mathbb{Z}^d$ for every $d\ge 3$: $\mathbb{Z}^d$ contains a copy of $\mathbb{Z}^3$ as a subnetwork, and cutting away the rest only raises resistance, which was already finite. One line, no new work. Compare that to redoing multinomial asymptotics in dimension 17.

---

## Part 6: What actually happened

Look at the shape of the argument:

| | 2D | 3D |
|---|---|---|
| Want to prove | $R_\infty=\infty$ | $R_\infty<\infty$ |
| Safe sabotage | **short** (lowers $R$) | **cut** (raises $R$) |
| Reduces to | $\sum \frac{1}{n}$ | $\sum \frac{1}{n^2}$ |
| Verdict | diverges → recurrent | converges → transient |

Three things made this work, and each is worth naming:

1. **The dictionary.** Harmonic functions are the fixed point of *both* the averaging step of a random walk and Kirchhoff's node law. That's not a coincidence or a metaphor; both are the statement $\Delta v = 0$ for the same graph Laplacian. So voltages are hitting probabilities, and the whole electrical calculus — Ohm, Kirchhoff, series, parallel — becomes probability calculus for free.

2. **The bridge formula.** $p_{\text{esc}} = 1/(\deg\cdot R_{\text{eff}})$ converts a limit of infinitely many path-probabilities into one number you can bound.

3. **Monotonicity is the real gift.** Effective resistance is a *one-sided* quantity under mutilation: shorting can only help, cutting can only hurt. That means we never had to compute the real resistance of $\mathbb{Z}^2$ or $\mathbb{Z}^3$ — famously hard problems, involving elliptic integrals and lattice Green's functions. We only had to compute the resistance of a chain of parallel bundles, and of a branching tree. Sloppiness in the safe direction is free.

Pólya's theorem is often taught as a triumph of asymptotic combinatorics. It is really a statement about how fast space widens: at distance $n$, the plane offers $\sim n$ channels of escape and the harmonic series diverges; three-dimensional space offers $\sim n^2$ and $\sum 1/n^2$ converges. The resistor network is the instrument that lets you *hear* that difference — the difference between $\ln n$ and a constant, between a drunk who always stumbles home and a bird lost in the sky.

**Footnote for the ambitious.** The cutting law has a sharpened form, the **Nash–Williams inequality**: if $\Pi_1,\Pi_2,\dots$ are disjoint edge cutsets separating the origin from infinity, then
$$R_\infty \ \ge\ \sum_k \frac{1}{|\Pi_k|}.$$
Our 2D argument is exactly this with $\Pi_n$ = the edges between ring $n$ and ring $n+1$, and it's the same computation — which shows that "shorting the rings" *is* Nash–Williams in disguise. And the whole framework generalizes: put conductance $c_e$ on edge $e$ and you describe any reversible Markov chain, with transition probabilities proportional to the conductances. Recurrence is always "resistance to infinity is infinite." The drunkard's question, in every version, is a question for a voltmeter.