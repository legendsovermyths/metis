# Defining recurrence relations and closed forms

Before we bridge that gap, let's put a proper name to the step-by-step machine we built.

In computer science, when a function calls itself, you call it recursion. In mathematics, a set of equations like $T_n = 2T_{n-1} + 1$, paired with a starting point like $T_0 = 0$, is called a **recurrence relation**, or just a **recurrence**.

It has two structural parts. The boundary value—or base case—gives us a firm place to stand. The general equation tells us how to take a step. Together, they uniquely define the entire sequence. Nothing deep here, it is just the formal terminology for the logic you already know how to write in code.

But as we just noticed, a recurrence only gives us *local* information. It tells us how to get to the next step, not how to jump to the end. Our goal in discrete math is almost always to start with a recurrence—because it perfectly captures the local, physical rules of the problem—and then solve it to find a **closed form**. That's our $T_n = 2^n - 1$. No loops, no previous states, just a direct $O(1)$ map from $n$ to the answer.

So, we have our recurrence, and we have our closed-form guess. How do we prove they are perfectly mathematically equivalent?

---
**Blackboard:** clear the previous sequence. on the left side, write 'recurrence relation' with the equations t_0 = 0 and t_n = 2t_{n-1} + 1 below it, labeling them 'boundary value' and 'general equation'. on the right side, write 'closed form' with t_n = 2^n - 1 below it. draw an arrow with a large question mark connecting the recurrence on the left to the closed form on the right.
