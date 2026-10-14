# Establishing recurrence relations

Let's put some formal names to the tools we are using. 

That step-by-step equation we built—where we defined $T_n = 2T_{n-1} + 1$, along with the starting point $T_0 = 0$—mathematicians call this a **recurrence** or a **recurrence relation**.

As someone who writes Rust, you know this intimately as a recursive function. It requires two things to be mathematically complete: a boundary value (your base case, so the logic doesn't loop forever backwards), and an equation for the general value in terms of earlier ones.

But as we just noticed, computing a recurrence for a large $n$ is painfully inefficient. To find the 64th term, you have to compute the 63rd, which requires the 62nd, and so on. That's why we want what we just guessed: $T_n = 2^n - 1$. This is what we call a **closed-form expression**. A closed form lets you compute the answer directly, independent of any previous terms.

In discrete math, this is the core workflow: you model a complex system by setting up a recurrence relation, and then you try to solve that recurrence to find the neat, efficient closed form.

We have our recurrence, and we have our suspected closed form. But a strong hunch based on $n=6$ is not a mathematical truth. How do we rigorously prove that our closed form satisfies the recurrence for every $n$ up to infinity?

---
**Blackboard:** clear the board. write the heading 'recurrence relation' and below it the equations: t_0 = 0 and t_n = 2t_{n-1} + 1 (for n > 0). below that, write the heading 'closed-form expression' and the equation t_n = 2^n - 1. draw a bold arrow pointing from the recurrence to the closed form, with a large question mark floating above the arrow.
