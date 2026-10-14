# Defining a Subspace

Look at what happened on the board. The $z=0$ plane is a perfectly self-contained little universe. You can add and scale all day long, and you never leave. 

If we think in Rust terms, it's type-safe. The operations take inputs from the $z=0$ set and guarantee an output in the same $z=0$ set. The $z=1$ plane, on the other hand, immediately breaks the type signature.

This self-contained universe is exactly what mathematicians call a **subspace**. It's a subset of a vector space that is a valid vector space in its own right. To check if a subset is a subspace, we just need to verify two things are "closed":
1. If you add two vectors in the set, the sum stays in the set.
2. If you multiply a vector in the set by *any* scalar, the result stays in the set.

But there's a brilliantly simple shortcut hidden in rule number two. Think about it. If the set must be closed under *any* scalar... what happens if we choose the scalar 0?

Any vector multiplied by 0 gives the zero vector. That means **every subspace must contain the origin.** It's a hard, non-negotiable requirement. That hovering plane at $z=1$ never stood a chance! It doesn't contain $(0,0,0)$, so it fundamentally cannot be a subspace.

Now, let me throw a slightly trickier one at you. Let's drop down to 2D space, $\mathbf{R}^2$. What if we take just the first quadrant—all vectors where $x \ge 0$ and $y \ge 0$? It contains the origin. If you add two vectors in the first quadrant, the sum is still in the first quadrant. But is it a subspace?

---
**Blackboard:** clear the 3d planes. draw a standard 2d x-y coordinate system. shade the entire first quadrant (where x >= 0 and y >= 0) in light green. draw a vector v=(1, 2) in the first quadrant. draw a dashed line extending backwards from v, through the origin, and into the third quadrant. end it with an arrowhead at -v=(-1, -2), and paint this negative vector in red to highlight that it escapes the green zone.
