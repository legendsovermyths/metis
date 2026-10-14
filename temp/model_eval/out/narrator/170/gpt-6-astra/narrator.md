# Why a CDF Cannot Fall

Our interval calculation tells us something about the *entire shape* of a CDF. Let’s derive its rules directly from
$$F(x)=P(X\le x).$$
We won’t assume $X$ is discrete: these arguments work for **every real-valued random variable**.

First, because $F(x)$ is a probability,
$$0\le F(x)\le 1.$$
Now take any two thresholds $a<b$. Look at the nested regions on the board. If an outcome satisfies $X\le a$, it certainly satisfies $X\le b$. Raising the threshold cannot eject an outcome that already qualified.

More precisely, we have the disjoint decomposition
$$\{X\le b\}=\{X\le a\}\cup\{a<X\le b\}.$$
Additivity of probability gives
$$F(b)=F(a)+P(a<X\le b).$$
The added probability is nonnegative, so
$$\boxed{F(a)\le F(b).}$$
That’s **nondecreasing**, not necessarily strictly increasing: if the interval contains no probability, the CDF stays flat.

Notice the proof strategy: **translate a statement about function values into a relationship between events**. The graph behaves this way because those events are nested.

Now, our bounded latency example eventually reaches $1$. But that needs a qualification: an unbounded random variable might have some probability beyond *every* finite threshold. Its CDF need never actually reach $1$.

So what guarantees that it at least *approaches* $1$? We need to understand what happens when events keep growing.

---
**Blackboard:** replace the existing graph with a nested-event diagram. draw a large rectangle labeled ω: all outcomes. inside it draw a large oval labeled b = {ω : x(ω) ≤ b}. entirely inside b draw a smaller oval labeled a = {ω : x(ω) ≤ a}. put the condition a < b above the diagram. color a light blue. color the portion of b outside a light orange and label it b \ a = {ω : a < x(ω) ≤ b}, using a leader line if necessary. leave the part of ω outside b uncolored. below the diagram write f(b) = f(a) + p(a < x ≤ b), color the final probability term orange, and annotate it '≥ 0'. under that display the boxed conclusion f(a) ≤ f(b). add a small separate note at the bottom: 'cdf bounds: 0 ≤ f(x) ≤ 1'.
