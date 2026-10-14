# The Invisible Pressure Shift

Yes: the four columns add to the zero vector. Equivalently, if

$$\mathbf{1}=\begin{bmatrix}1\\1\\1\\1\end{bmatrix},$$

then

$$A\mathbf{1}=\mathbf{0}.$$

That has a wonderfully concrete meaning. Suppose $x$ is one set of tank pressures satisfying $Ax=b$. Now raise *every* tank pressure by the same amount $c$. The new pressure vector is

$$x+c\mathbf{1}.$$

Apply our matrix:

$$A(x+c\mathbf{1})=Ax+cA\mathbf{1}=b+c\mathbf{0}=b.$$

Every pipe sensor reports exactly the same difference. Of course it does: raising both ends of a pipe by, say, $10$ units cannot change the difference between them.

So our original goal—recovering the absolute pressures—cannot quite be achieved. The measurements determine the pressures only up to a common additive constant. This is not bad sensor data or numerical error; it is structural ambiguity built into the network.

But here is the sharper question: is that the *only* ambiguity? Could two pressure assignments produce identical pipe readings without differing by one common constant? The connectivity of the network is about to answer that for us.

---
**Blackboard:** keep the directed graph of four tanks and five pipes and the 5 by 4 matrix a. highlight the fact that each row contains one -1 and one +1. to the right, write the column vector 1 = [1,1,1,1]^t and the equation a1 = 0. below, write a(x + c1) = ax + ca1 = b, with x and x + c1 shown as two pressure assignments producing the same pipe-difference vector b.
