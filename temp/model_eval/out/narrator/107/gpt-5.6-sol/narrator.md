# A Space Inside a Space

So the blue plane has inherited the full vector-space machinery from $\mathbf{R}^3$, while the red plane has not. That is the pattern hiding in plain sight: sometimes a subset of a vector space is itself a vector space under the *same* addition and scaling operations.

We call such a subset a **subspace**.

Formally, a nonempty subset $W$ of a vector space $V$ is a subspace when, for every $x,y\in W$ and every scalar $c$,

$$x+y\in W \qquad\text{and}\qquad cx\in W.$$

Equivalently—and this is often the cleanest test—every linear combination remains inside:

$$ax+by\in W$$

for all $x,y\in W$ and all scalars $a,b$.

Notice one immediate consequence. Set $c=0$. Then $0x=0$ must belong to $W$. So **every subspace contains the zero vector**. This instantly disqualifies the hovering plane $z=1$: it does not pass through the origin.

In $\mathbf{R}^3$, the familiar possibilities are beautifully rigid: the origin alone, any line through the origin, any plane through the origin, and all of $\mathbf{R}^3$. But containing the origin is only necessary, not sufficient. Some origin-containing sets still break under addition—and those are the sneaky ones worth testing next.

---
**Blackboard:** replace the previous drawing with a clean 3d coordinate system showing four nested examples of subspaces of r^3: label the origin {0}; draw and label a green line l through the origin; shade and label a translucent blue plane p through the origin containing that line; label the surrounding 3d space r^3. on the side, write the subspace test: x,y in w and a,b in r implies ax+by in w. beneath it, emphasize 0 in w.
