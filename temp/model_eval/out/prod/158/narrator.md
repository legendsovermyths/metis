# The Nullspace of the Incidence Matrix

Look closely at the columns of our matrix $A$ on the board. What happens if you add them straight across?

In row 1, you have a $-1$, a $+1$, and two zeros. They sum to zero. Row 2? $-1$, $+1$, and two zeros. They sum to zero, too. 

In fact, because every single pipe starts at exactly one tank and ends at exactly one other tank, every row has exactly one $-1$ and one $+1$. The columns perfectly cancel each other out.

In the language of linear algebra, a combination of the columns that yields the zero vector means that $x = [1, 1, 1, 1]^T$ is in the nullspace. $Ax = 0$. And if you can multiply by $1$, you can multiply by any constant $c$. The entire line of vectors $x = [c, c, c, c]^T$ lives in the nullspace.

What does that mean physically for our tanks? Remember, $Ax$ computes the pressure *differences*. If $x = [c, c, c, c]^T$, the pressure in every tank is exactly $c$. If all tanks are at the exact same pressure, nothing flows. All differences are zero.

And that answers our engineering problem: can you deduce the absolute pressures from the differences alone? No. If we pump an extra $50$ units of pressure into *every single tank*, the differences between them don't change a bit. The physics matches the math perfectly: because the matrix has a non-empty nullspace, $Ax = b$ does not have a unique solution. You can always add the nullspace—an arbitrary constant $c$—to your answer, just like the $+C$ when you integrate in calculus.

This beautiful structure is called an **incidence matrix**. It translates a physical graph into a mathematical object. Our matrix has $4$ columns, but because its nullspace is $1$-dimensional, its rank is only $4 - 1 = 3$.

But let's flip the question around. If our sensors hand us a vector of five pressure differences $b$, is there *always* a valid set of tank pressures that could have produced them? Or do the pipe differences have to follow some hidden rules?

---
**Blackboard:** keep the graph of 4 tanks and 5 pipes. keep the 5x4 matrix a. below the matrix, write the nullspace equation: a [c, c, c, c]^t = [0, 0, 0, 0, 0]^t, and label the vector [c, c, c, c]^t as 'nullspace'.
