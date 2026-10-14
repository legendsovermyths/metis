# Subspaces

Look at the board. The $xy$-plane is a perfectly closed system. In a way, it's type-safe—you input two things from the set, apply an operation, and the output is guaranteed to still belong to the set. 

The $z=1$ plane, on the other hand, throws the mathematical equivalent of a type error the second you try to add or scale.

Actually, there is a massive shortcut to see why the $z=1$ plane was doomed from the start. If a subset is truly closed under scalar multiplication, you must be able to multiply by *any* real number. What happens when you choose the scalar $0$? You get the zero vector, $(0,0,0)$. This gives us a golden rule: **every valid closed system must contain the origin.** The $z=1$ plane doesn't, so it's instantly disqualified.

This idea—a subset that is perfectly sealed off under linear combinations—is called a **subspace**. 

A subspace is simply a vector space in its own right, living inside a larger host space. Because the host space already obeys all the weird algebraic rules (like $x+y=y+x$), all we ever have to check is closure: do addition and scalar multiplication keep us inside the room?

If we apply this to $\mathbf{R}^3$, the geometry is beautiful. The only possible subspaces are the whole 3D space itself, any flat plane that passes through the origin, any straight line through the origin, and the zero vector alone.

---
**Blackboard:** clear the previous vectors. draw a clean 3d coordinate system. draw three distinct geometric objects to illustrate valid subspaces: a green plane tilted slightly but passing exactly through the origin, an orange line intersecting the origin at a steep angle, and a bright white dot exactly at the origin (0,0,0). label them 'plane through origin', 'line through origin', and 'zero vector'.
