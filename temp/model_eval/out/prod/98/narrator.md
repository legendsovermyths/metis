# What must that overtaking move look like?

Since we know we are hunting for exactly one leap that puts Elsie strictly ahead, let's look at the anatomy of that leap. We have two types of bridges to choose from. The natural first instinct is to wonder: could Elsie just tailgate Bessie and overtake her using the standard $+1$ main bridges?

Let's try it. Suppose Elsie is at island $u$, which is currently behind Bessie. She takes a main bridge to $u+1$. Can $u+1$ be strictly ahead of Bessie? Mathematically, no. If $u$ is behind Bessie, $u+1$ is at best *exactly* the island Bessie is currently standing on.

Is a tie good enough? Look at the rules: if Elsie lands on Bessie's island, Bessie simply takes her next turn, steps forward, the island collapses beneath them, and Elsie is eliminated. Stepping onto Bessie's current square isn't a tie; it is suicide.

That failure tells us something massive. A main bridge can *never* be the overtaking move. The winning leap must be a single alternative bridge that soars cleanly over Bessie's head.

And that gives us the exact shape of Elsie's entire strategy. She isn't playing a complex tactical game of positioning. She is picking one specific alternative bridge, running from island $1$ to its tail as fast as physically possible, and pulling the trigger. Everything before the jump is just a pure, greedy sprint.

---
**Blackboard:** draw a number line of islands. place bessie on island 4. show elsie on island 3 trying to take a short main bridge to island 4; draw a red 'x' over this arrow with a skull icon. then draw a long, sweeping alternative bridge from island 2 to island 6, soaring over bessie, marked with a bright green checkmark.
