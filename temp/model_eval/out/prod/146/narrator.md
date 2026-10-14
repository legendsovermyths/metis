# The Fundamental Theorem of Linear Algebra

Let's step back and look at the whole board, Anirudh. We didn't just find four separate mathematical objects. We've uncovered the complete anatomy of a matrix.

Think about what an $m \times n$ matrix $A$ actually does. It takes a vector with $n$ components and transforms it into a vector with $m$ components. It's a bridge between two different worlds: the domain $\mathbf{R}^n$, and the target space $\mathbf{R}^m$.

Where do our four subspaces live?

In the domain $\mathbf{R}^n$, we have the row space $C(A^T)$ with dimension $r$, and the nullspace $N(A)$ with dimension $n - r$. Notice how beautifully those dimensions snap together? $r + (n - r) = n$. They perfectly partition the entire input space.

Over in the target space $\mathbf{R}^m$, we have the column space $C(A)$ with dimension $r$, and the left nullspace $N(A^T)$ with dimension $m - r$. Once again, $r + (m - r) = m$. They perfectly partition the output space.

This isn't just a neat piece of bookkeeping. It is the **Fundamental Theorem of Linear Algebra, Part I**. Every matrix, no matter how massive or chaotic it seems, cleaves its domain and its target space into these exact pairs of subspaces.

Look at how I've asked the assistant to draw them on the board. Inside each space, the two lines are drawn at a strict 90-degree angle to one another. We know their dimensions complement each other perfectly, but why would I draw them as strictly perpendicular? We'll get to that geometry soon. But first, let's test drive this beautifully symmetric machine on the absolute simplest matrices that exist.

---
**Blackboard:** draw a large bipartite diagram. on the left, draw a bounding box labeled 'domain r^n'. inside it, draw two intersecting lines strictly perpendicular to each other. label one 'row space c(a^t), dim = r' and the other 'nullspace n(a), dim = n - r'. on the right, draw a bounding box labeled 'codomain r^m'. inside it, draw two intersecting perpendicular lines. label one 'column space c(a), dim = r' and the other 'left nullspace n(a^t), dim = m - r'. draw an arrow labeled 'a' mapping a general point on the row space line to a point on the column space line, and another arrow mapping the entire nullspace line to the origin (0) of the codomain.
