# The Four Spaces, One Picture

Now step back and look at the whole machine.

For an $m\times n$ matrix $A$, two spaces live in the **input world** $\mathbf{R}^n$:

$$C(A^T),\qquad \dim C(A^T)=r,$$
$$N(A),\qquad \dim N(A)=n-r.$$

These aren’t merely two spaces whose dimensions happen to add to $n$. They are perpendicular. Every $x\in N(A)$ satisfies $Ax=0$, so its dot product with every row of $A$ is zero. Thus

$$N(A)=C(A^T)^\perp.$$

The other two spaces live in the **output world** $\mathbf{R}^m$:

$$C(A),\qquad \dim C(A)=r,$$
$$N(A^T),\qquad \dim N(A^T)=m-r.$$

They are perpendicular too. If $b=Ax$ lies in the column space and $y\in N(A^T)$, then

$$y^Tb=y^TAx=(A^Ty)^Tx=0.$$

Therefore $N(A^T)=C(A)^\perp$.

So $A$ takes the row-space part of an input and sends it into the column space; it completely destroys the nullspace part. Two orthogonal decompositions, joined by one linear map. That is the **four fundamental subspaces**—not four unrelated definitions, but one tightly written story. No sloppy subplot survives.

Now let’s turn the rank all the way down to $r=1$. What kind of matrix remains when the entire transformation has only one surviving direction?

---
**Blackboard:** draw a two-world diagram. on the left, label a large oval r^n (input space), split orthogonally into the row space c(a^t) of dimension r and the nullspace n(a) of dimension n-r; mark a right-angle symbol between them. on the right, label a large oval r^m (output space), split orthogonally into the column space c(a) of dimension r and the left nullspace n(a^t) of dimension m-r; mark a right-angle symbol. draw an arrow labeled a from c(a^t) to c(a), and an arrow from n(a) collapsing to the zero vector in r^m. write beneath: n(a)=c(a^t)^perp and n(a^t)=c(a)^perp.
