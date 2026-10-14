# Is discarding the shadowed blocks the whole rule?

Let's make sure our 'pop the smaller blocks' rule is bulletproof. We'll stress-test it on the final prefix of the third sample. 

Imagine we've processed up to a block of 9 zeros, followed by 1 one. Our stack has `(zero, 9)` at the bottom and `(one, 1)` on top. Now, a new block arrives: 2 zeros. So $L = 2$.

Let's follow our exact rule. The top of the stack is 1, which is $\le 2$. We pop it, setting our obstacle $y = 1$. The next top is `(zero, 9)`. Since 9 is *not* $\le 2$, our rule says we stop popping. We push the `(zero, 2)` and read the bottom of the stack: 9. 

But check the problem description. The actual answer for this prefix is 10. We failed. Why?

Because we forgot our own formula! We have a left block of zeros $x=9$, a right block $z=2$, and the obstacle we just cleared was $y=1$. The condition for fusion is $y \le \min(x, z)$. Is $1 \le \min(9, 2)$? Yes! They *do* fuse, and their combined lifetime is $9 + 2 - 1 = 10$. 

Our pop rule stopped too early because it only looked at size. If the new block shares a color with the top of the stack, they merge—even if the top block outlives the new one. And when they merge, the obstacle $y$ resets to 0, because they are now one contiguous block. Furthermore, because their combined lifetime just grew to 10, this newly fused block might now dominate even larger blocks further down, meaning we must continue evaluating the stack.

---
**Blackboard:** draw a stack with a large block (zero, 9) at the bottom and a small block (one, 1) above it. show a new block (zero, 2) arriving. cross out the (one, 1) block and label it 'y = 1'. draw a bright fusion animation combining the (zero, 9) and the new (zero, 2) into a massive block labeled '(zero, 10)'.
