# Why a CDF Can Only Rise

That prefix-sum viewpoint already hints at our first structural property: a CDF can never go downward. Let’s prove it cleanly.

Take any two real numbers $a<b$. If an outcome satisfies $X\le a$, then it automatically satisfies $X\le b$. In event language,

$$\{X\le a\}\subseteq\{X\le b\}.$$

Probability respects containment: if $A\subseteq B$, then $P(A)\le P(B)$. Therefore,

$$F(a)=P(X\le a)\le P(X\le b)=F(b).$$

So $F$ is **nondecreasing**. It may climb smoothly, jump abruptly, or remain flat—but it cannot fall. Once probability has accumulated, it never leaks back out. A wonderfully boring data structure.

We also immediately know that

$$0\le F(x)\le 1,$$

because every $F(x)$ is the probability of an event.

Now push the threshold farther and farther right. The events $\{X\le b\}$ eventually capture every possible finite value of $X$, so their probabilities approach $1$:

$$\lim_{b\to\infty}F(b)=1.$$

Push the threshold toward negative infinity, and the captured event shrinks toward the empty set:

$$\lim_{b\to-\infty}F(b)=0.$$

Those endpoint limits feel visually obvious—but underneath them sits a precise theorem about nested events. Let’s expose that machinery next.

---
**Blackboard:** replace the current board with a two-panel figure. left panel: draw a real number line with a < b marked, shade the ray (-infinity, a] in dark blue and the additional interval (a, b] in light blue; label the nesting {x <= a} subset {x <= b}. right panel: draw a generic nondecreasing cdf from x = -6 to 6, including one smooth rising section, one flat section, and two upward jumps; label the vertical axis f(x) from 0 to 1, add dashed horizontal asymptotes at 0 and 1, and annotate 'never decreases', 'f(x) -> 0' on the far left, and 'f(x) -> 1' on the far right.
