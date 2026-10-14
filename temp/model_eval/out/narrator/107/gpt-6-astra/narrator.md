# A Vector Space Inside a Vector Space

Pause for a moment. The blue plane isn't just a collection of vectors that happen to share a coordinate. **It supports the same operations as the surrounding space, without ever needing to leave the plane.** It's a vector space living inside another vector space.

We call that a **subspace**.

Precisely, a nonempty subset $S$ of a vector space $V$ is a subspace if:

- Whenever $u,v\in S$, we have $u+v\in S$.
- Whenever $v\in S$ and $c\in\mathbb{R}$, we have $cv\in S$.

These are the two **closure conditions**. We don't need to recheck associativity or distributivity: we're using the surrounding space's operations, so those identities are inherited.

Let's check the blue plane for *arbitrary* vectors, not just our examples. If $u=(a,b,0)$ and $v=(p,q,0)$, then
$$u+v=(a+p,b+q,0),\qquad cu=(ca,cb,0).$$
Both still have last coordinate zero. That proves closure.

Here's an immediate consequence: **every subspace contains the zero vector.** Why? Nonemptiness gives us some $v\in S$; closure under scaling gives $0v=0\in S$.

So the hovering plane was doomed before we even tried adding anything—it misses the origin!

But be careful: containing zero is necessary, not sufficient. Could a set contain the origin and still let our operations escape?

---
**Blackboard:** replace the board with two side-by-side 3d coordinate diagrams, each with axes labeled x, y, z and origin labeled o=(0,0,0). left panel: title 'closed under addition and scaling'. shade a blue rectangular patch representing the infinite plane z=0, labeled 's={(a,b,0): a,b real}'. draw arrows from o to v=(1,2,0), w=(3,-1,0), v+w=(4,1,0), and -v=(-1,-2,0); label each endpoint. add dashed parallelogram edges from v and w to v+w. highlight o with a solid blue dot and label '0 belongs to s'. right panel: title 'missing zero: not a subspace'. shade a red rectangular patch representing the infinite plane z=1, with the z-axis visibly piercing it at (0,0,1). draw an arrow from o to a=(1,2,1), labeling a. highlight o below the plane with a solid black dot and label '0a=0, outside the red plane'. beneath both diagrams write 'subspace = nonempty subset + closure under addition + closure under every real scalar'.
