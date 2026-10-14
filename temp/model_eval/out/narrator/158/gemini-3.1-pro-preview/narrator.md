# The Nullspace and Relative Pressure

Look at the board. Scan across any row of that matrix. Every single row has exactly one $-1$ and one $+1$. The rest are zeros. 

So what happens if you simply add all four columns together? Every row's $-1$ cancels perfectly with its $+1$. The columns add up to a column of pure zeros. 

In the language of linear algebra, that means the vector $x = [1, 1, 1, 1]^T$ is in the nullspace of $A$. And because any multiple works, the entire line of vectors $x = [c, c, c, c]^T$ is in the nullspace. $Ax = 0$.

But what does that mean *physically* for our water tanks? 

It means if we increase the pressure in *every* single tank by the exact same amount—say, adding some constant $c$ to all of them—the *difference* between any two tanks doesn't change one bit. The flow stays exactly the same.

So, back to our engineering problem: can we figure out the exact absolute pressure just from the differential sensors? 

No. We can't. Because $A$ has a non-trivial nullspace, $Ax = b$ cannot have a unique solution. The true pressures are floating. The math is telling us exactly what the physics dictates: differences alone only give us *relative* pressure. To lock in absolute numbers, we'd have to physically ground one of the tanks—say, declare Tank 4 to be zero pressure.

Now, let's flip it around and look at the column space. For which sensor readings $b$ is this system actually solvable?

---
**Blackboard:** keep the previous 4-tank graph and the 5x4 matrix a. next to the matrix, write out the equation a * [c, c, c, c]^t = [0, 0, 0, 0, 0]^t to visually demonstrate the nullspace containing the constant vector.
