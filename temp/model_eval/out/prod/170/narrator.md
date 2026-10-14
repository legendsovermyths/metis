# Universal limits of the CDF

Look back at the board, Anirudh. We have our definition: $F(x) = P(X \le x)$. Let's pull this apart and rigorously derive the universal rules that govern every CDF.

First, let's pick two values, $a$ and $b$, where $a < b$. The event $\{X \le a\}$ is completely contained within the event $\{X \le b\}$. Think about it: if a query finishes in 50ms, it inherently finished in 80ms. Because the first event is a subset of the second, its probability cannot be larger. 

So, $P(X \le a) \le P(X \le b)$, which means $F(a) \le F(b)$. The CDF is always **nondecreasing**. It can stay flat, but it can never, ever go down.

Now, let's push the boundaries. What happens as $x$ approaches infinity? Let's take a sequence of boundaries $b_n$ that increase toward infinity. The events $\{X \le b_n\}$ get larger and larger, and their union covers the entire sample space, $\{X < \infty\}$. 

By the continuity of probabilities, we can evaluate the limit of the sequence: 
$\lim_{n \to \infty} P(X \le b_n) = P(X < \infty) = 1$.
So, $\lim_{x \to \infty} F(x) = 1$.

Conversely, if we take a sequence $b_n$ decreasing to negative infinity, the intersection of those events is the empty set—it's impossible for a real-valued variable to be less than negative infinity. 
So, $\lim_{n \to \infty} P(X \le b_n) = P(\emptyset) = 0$. Meaning $\lim_{x \to -\infty} F(x) = 0$.

Every valid CDF is anchored at 0 on the left, reaches 1 on the right, and only ever climbs. But there's one more subtle property hidden in those exact moments where the function jumps. Do you see it?

---
**Blackboard:** keep the existing step function and annotations. extend the x-axis significantly to the left and right. draw a horizontal dashed line along y = 0 on the far left, labeled 'lim x->-∞ f(x) = 0'. draw a horizontal dashed line at y = 1 on the far right, labeled 'lim x->∞ f(x) = 1'.
