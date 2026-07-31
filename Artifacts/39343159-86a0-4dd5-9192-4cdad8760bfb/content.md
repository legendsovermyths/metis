<!-- PAGE 1 -->

[Image: The top third of the page contains a large, stylized number "2" in a dark gray serif font. The background is a photograph of a modern architectural structure featuring light blue glass panels, complex white and gray structural beams, and reflective surfaces against a bright sky.]

# 2 Limits and Continuity

**OVERVIEW** Mathematicians of the seventeenth century were keenly interested in the study of motion for objects on or near the earth and the motion of planets and stars. This study involved both the speed of the object and its direction of motion at any instant, and they knew the direction at a given instant was along a line tangent to the path of motion. The concept of a limit is fundamental to finding the velocity of a moving object and the tangent to a curve. In this chapter we develop the limit, first intuitively and then formally. We use limits to describe the way a function varies. Some functions vary continuously; small changes in $x$ produce only small changes in $f(x)$. Other functions can have values that jump, vary erratically, or tend to increase or decrease without bound. The notion of limit gives a precise way to distinguish between these behaviors.

## 2.1 Rates of Change and Tangents to Curves

Calculus is a tool that helps us understand how a change in one quantity is related to a change in another. How does the speed of a falling object change as a function of time? How does the level of water in a barrel change as a function of the amount of liquid poured into it? We see change occurring in nearly everything we observe in the world and universe, and powerful modern instruments help us see more and more. In this section we introduce the ideas of average and instantaneous rates of change, and show that they are closely related to the slope of a curve at a point $P$ on the curve. We give precise developments of these important concepts in the next chapter, but for now we use an informal approach so you will see how they lead naturally to the main idea of this chapter, the *limit*. The idea of a limit plays a foundational role throughout calculus.

### Average and Instantaneous Speed

**HISTORICAL BIOGRAPHY***
Galileo Galilei
(1564–1642)

In the late sixteenth century, Galileo discovered that a solid object dropped from rest (not moving) near the surface of the earth and allowed to fall freely will fall a distance proportional to the square of the time it has been falling. This type of motion is called **free fall**. It assumes negligible air resistance to slow the object down, and that gravity is the only force acting on the falling object. If $y$ denotes the distance fallen in feet after $t$ seconds, then Galileo’s law is
$$y = 16t^2,$$
where 16 is the (approximate) constant of proportionality. (If $y$ is measured in meters, the constant is 4.9.)

A moving object’s **average speed** during an interval of time is found by dividing the distance covered by the time elapsed. The unit of measure is length per unit time: kilometers per hour, feet (or meters) per second, or whatever is appropriate to the problem at hand.

\*To learn more about the historical figures mentioned in the text and the development of many major elements and topics of calculus, visit www.aw.com/thomas.

<!-- PAGE 2 -->

**EXAMPLE 1** A rock breaks loose from the top of a tall cliff. What is its average speed
(a) during the first 2 sec of fall?
(b) during the 1-sec interval between second 1 and second 2?

**Solution** The average speed of the rock during a given time interval is the change in distance, $\Delta y$, divided by the length of the time interval, $\Delta t$. (Increments like $\Delta y$ and $\Delta t$ are reviewed in Appendix 3, and pronounced "delta y" and "delta t.") Measuring distance in feet and time in seconds, we have the following calculations:

(a) For the first 2 sec: $\frac{\Delta y}{\Delta t} = \frac{16(2)^2 - 16(0)^2}{2 - 0} = 32 \frac{\text{ft}}{\text{sec}}$
(b) From sec 1 to sec 2: $\frac{\Delta y}{\Delta t} = \frac{16(2)^2 - 16(1)^2}{2 - 1} = 48 \frac{\text{ft}}{\text{sec}}$

We want a way to determine the speed of a falling object at a single instant $t_0$, instead of using its average speed over an interval of time. To do this, we examine what happens when we calculate the average speed over shorter and shorter time intervals starting at $t_0$. The next example illustrates this process. Our discussion is informal here, but it will be made precise in Chapter 3.

**EXAMPLE 2** Find the speed of the falling rock in Example 1 at $t = 1$ and $t = 2$ sec.

**Solution** We can calculate the average speed of the rock over a time interval $[t_0, t_0 + h]$, having length $\Delta t = h$, as
$$\frac{\Delta y}{\Delta t} = \frac{16(t_0 + h)^2 - 16t_0^2}{h} \quad (1)$$
We cannot use this formula to calculate the "instantaneous" speed at the exact moment $t_0$ by simply substituting $h = 0$, because we cannot divide by zero. But we can use it to calculate average speeds over increasingly short time intervals starting at $t_0 = 1$ and $t_0 = 2$. When we do so, by taking smaller and smaller values of $h$, we see a pattern (Table 2.1).

**TABLE 2.1** Average speeds over short time intervals $[t_0, t_0 + h]$
Average speed: $\frac{\Delta y}{\Delta t} = \frac{16(t_0 + h)^2 - 16t_0^2}{h}$

| Length of time interval $h$ | Average speed over interval of length $h$ starting at $t_0 = 1$ | Average speed over interval of length $h$ starting at $t_0 = 2$ |
|:---|:---|:---|
| 1 | 48 | 80 |
| 0.1 | 33.6 | 65.6 |
| 0.01 | 32.16 | 64.16 |
| 0.001 | 32.016 | 64.016 |
| 0.0001 | 32.0016 | 64.0016 |

The average speed on intervals starting at $t_0 = 1$ seems to approach a limiting value of 32 as the length of the interval decreases. This suggests that the rock is falling at a speed of 32 ft/sec at $t_0 = 1$ sec. Let's confirm this algebraically.

<!-- PAGE 3 -->

## 2.1 Rates of Change and Tangents to Curves

If we set $t_0 = 1$ and then expand the numerator in Equation (1) and simplify, we find that
$$\frac{\Delta y}{\Delta t} = \frac{16(1 + h)^2 - 16(1)^2}{h} = \frac{16(1 + 2h + h^2) - 16}{h}$$
$$= \frac{32h + 16h^2}{h} = 32 + 16h.$$

For values of $h$ different from 0, the expressions on the right and left are equivalent and the average speed is $32 + 16h$ ft/sec. We can now see why the average speed has the limiting value $32 + 16(0) = 32$ ft/sec as $h$ approaches 0.

Similarly, setting $t_0 = 2$ in Equation (1), the procedure yields
$$\frac{\Delta y}{\Delta t} = 64 + 16h$$
for values of $h$ different from 0. As $h$ gets closer and closer to 0, the average speed has the limiting value 64 ft/sec when $t_0 = 2$ sec, as suggested by Table 2.1.

The average speed of a falling object is an example of a more general idea which we discuss next.

### Average Rates of Change and Secant Lines

Given any function $y = f(x)$, we calculate the average rate of change of $y$ with respect to $x$ over the interval $[x_1, x_2]$ by dividing the change in the value of $y$, $\Delta y = f(x_2) - f(x_1)$, by the length $\Delta x = x_2 - x_1 = h$ of the interval over which the change occurs. (We use the symbol $h$ for $\Delta x$ to simplify the notation here and later on.)

**DEFINITION** The average rate of change of $y = f(x)$ with respect to $x$ over the interval $[x_1, x_2]$ is
$$\frac{\Delta y}{\Delta x} = \frac{f(x_2) - f(x_1)}{x_2 - x_1} = \frac{f(x_1 + h) - f(x_1)}{h}, h \neq 0.$$

Geometrically, the rate of change of $f$ over $[x_1, x_2]$ is the slope of the line through the points $P(x_1, f(x_1))$ and $Q(x_2, f(x_2))$ (Figure 2.1). In geometry, a line joining two points of a curve is a **secant** to the curve. Thus, the average rate of change of $f$ from $x_1$ to $x_2$ is identical with the slope of secant $PQ$. Let’s consider what happens as the point $Q$ approaches the point $P$ along the curve, so the length $h$ of the interval over which the change occurs approaches zero. We will see that this procedure leads to defining the slope of a curve at a point.

[FIGURE 2.1 description: A coordinate plane showing a curve $y = f(x)$ in blue. A point $P(x_1, f(x_1))$ and a point $Q(x_2, f(x_2))$ are marked on the curve. A blue line (the secant) passes through $P$ and $Q$. A dashed red horizontal line extends from $P$ to the right, and a dashed red vertical line extends from $Q$ down to meet it, forming a right triangle. The horizontal leg is labeled $\Delta x = h$ and the vertical leg is labeled $\Delta y$. The x-axis shows values $x_1$ and $x_2$. Caption: FIGURE 2.1 A secant to the graph $y = f(x)$. Its slope is $\Delta y/\Delta x$, the average rate of change of $f$ over the interval $[x_1, x_2]$.]

### Defining the Slope of a Curve

We know what is meant by the slope of a straight line, which tells us the rate at which it rises or falls—its rate of change as a linear function. But what is meant by the slope of a curve at a point $P$ on the curve? If there is a tangent line to the curve at $P$—a line that just touches the curve like the tangent to a circle—it would be reasonable to identify the slope of the tangent as the slope of the curve at $P$. So we need a precise meaning for the tangent at a point on a curve.

For circles, tangency is straightforward. A line $L$ is tangent to a circle at a point $P$ if $L$ passes through $P$ perpendicular to the radius at $P$ (Figure 2.2). Such a line just touches the circle. But what does it mean to say that a line $L$ is tangent to some other curve $C$ at a point $P$?

[FIGURE 2.2 description: A circle with center $O$. A radius is drawn from $O$ to a point $P$ on the circle. A line $L$ is drawn passing through $P$ such that it is perpendicular to the radius $OP$. A right-angle symbol is shown at $P$. Caption: FIGURE 2.2 $L$ is tangent to the circle at $P$ if it passes through $P$ perpendicular to radius $OP$.]

<!-- PAGE 4 -->

**62 Chapter 2: Limits and Continuity**

To define tangency for general curves, we need an approach that takes into account the behavior of the secants through $P$ and nearby points $Q$ as $Q$ moves toward $P$ along the curve (Figure 2.3). Here is the idea:

1. Start with what we can calculate, namely the slope of the secant $PQ$.
2. Investigate the limiting value of the secant slope as $Q$ approaches $P$ along the curve. (We clarify the limit idea in the next section.)
3. If the limit exists, take it to be the slope of the curve at $P$ and define the tangent to the curve at $P$ to be the line through $P$ with this slope.

This procedure is what we were doing in the falling-rock problem discussed in Example 2. The next example illustrates the geometric idea for the tangent to a curve.

**HISTORICAL BIOGRAPHY**
Pierre de Fermat
(1601–1665)

[FIGURE 2.3 description: Two separate diagrams showing a light blue curve. In the left diagram, a point $P$ is fixed, and a point $Q$ is shown further down the curve. Multiple red secant lines are drawn passing through $P$ and different positions of $Q$ as $Q$ moves toward $P$ from the right. A final solid red line represents the Tangent at $P$. In the right diagram, the point $Q$ is shown approaching $P$ from the left, with multiple red secant lines converging toward the same red Tangent line at $P$. Caption: FIGURE 2.3 The tangent to the curve at $P$ is the line through $P$ whose slope is the limit of the secant slopes as $Q \rightarrow P$ from either side.]

**EXAMPLE 3** Find the slope of the parabola $y = x^2$ at the point $P(2, 4)$. Write an equation for the tangent to the parabola at this point.

**Solution** We begin with a secant line through $P(2, 4)$ and $Q(2 + h, (2 + h)^2)$ nearby. We then write an expression for the slope of the secant $PQ$ and investigate what happens to the slope as $Q$ approaches $P$ along the curve:
$$\text{Secant slope} = \frac{\Delta y}{\Delta x} = \frac{(2 + h)^2 - 2^2}{h} = \frac{h^2 + 4h + 4 - 4}{h}$$
$$= \frac{h^2 + 4h}{h} = h + 4.$$

If $h > 0$, then $Q$ lies above and to the right of $P$, as in Figure 2.4. If $h < 0$, then $Q$ lies to the left of $P$ (not shown). In either case, as $Q$ approaches $P$ along the curve, $h$ approaches zero and the secant slope $h + 4$ approaches 4. We take 4 to be the parabola’s slope at $P$.

[FIGURE 2.4 description: A graph showing the parabola $y = x^2$ in light blue on a coordinate system. Point $P(2, 4)$ is marked. A nearby point $Q(2 + h, (2 + h)^2)$ is marked on the curve. A red secant line is drawn through $P$ and $Q$. A dashed red horizontal line of length $\Delta x = h$ and a dashed red vertical line of length $\Delta y = (2 + h)^2 - 4$ form a right triangle between $P$ and $Q$. A solid red tangent line is shown passing through $P$. Text annotations indicate: "Tangent slope = 4", "Secant slope is $\frac{(2+h)^2 - 4}{h} = h+4$", and "NOT TO SCALE". The x-axis shows points 2 and $2+h$. Caption: FIGURE 2.4 Finding the slope of the parabola $y = x^2$ at the point $P(2, 4)$ as the limit of secant slopes (Example 3).]

<!-- PAGE 5 -->

## 2.1 Rates of Change and Tangents to Curves

The tangent to the parabola at $P$ is the line through $P$ with slope 4:

$y = 4 + 4(x - 2)$ Point-slope equation
$y = 4x - 4$.

### Instantaneous Rates of Change and Tangent Lines

The rates at which the rock in Example 2 was falling at the instants $t = 1$ and $t = 2$ are called **instantaneous rates of change**. Instantaneous rates and slopes of tangent lines are closely connected, as we see in the following examples.

**EXAMPLE 4** Figure 2.5 shows how a population $p$ of fruit flies (*Drosophila*) grew in a 50-day experiment. The number of flies was counted at regular intervals, the counted values plotted with respect to time $t$, and the points joined by a smooth curve (colored blue in Figure 2.5). Find the average growth rate from day 23 to day 45.

**Solution** There were 150 flies on day 23 and 340 flies on day 45. Thus the number of flies increased by $340 - 150 = 190$ in $45 - 23 = 22$ days. The average rate of change of the population from day 23 to day 45 was

Average rate of change: $\frac{\Delta p}{\Delta t} = \frac{340 - 150}{45 - 23} = \frac{190}{22} \approx 8.6$ flies/day.

[Figure 2.5: A coordinate graph showing the growth of a fruit fly population. The horizontal axis (t) is labeled "Time (days)" and ranges from 0 to 50 in increments of 10. The vertical axis (p) is labeled "Number of flies" and ranges from 0 to 350 in increments of 50. A blue curve rises from the origin, becoming steeper until around day 30, then tapering its slope. A point $P(23, 150)$ is marked on the curve. A second point $Q(45, 340)$ is marked further up the curve. A blue secant line is drawn through $P$ and $Q$. A right triangle is formed below the secant line with a horizontal leg labeled $\Delta t = 22$ and a vertical leg labeled $\Delta p = 190$. An annotation points to the secant line stating $\frac{\Delta p}{\Delta t} \approx 8.6$ flies/day. Caption: FIGURE 2.5 Growth of a fruit fly population in a controlled experiment. The average rate of change over 22 days is the slope $\Delta p / \Delta t$ of the secant line (Example 4).]

This average is the slope of the secant through the points $P$ and $Q$ on the graph in Figure 2.5.

The average rate of change from day 23 to day 45 calculated in Example 4 does not tell us how fast the population was changing on day 23 itself. For that we need to examine time intervals closer to the day in question.

**EXAMPLE 5** How fast was the number of flies in the population of Example 4 growing on day 23?

**Solution** To answer this question, we examine the average rates of change over increasingly short time intervals starting at day 23. In geometric terms, we find these rates by calculating the slopes of secants from $P$ to $Q$, for a sequence of points $Q$ approaching $P$ along the curve (Figure 2.6).

<!-- PAGE 6 -->

## 64 Chapter 2: Limits and Continuity

| Q | Slope of $PQ = \Delta p / \Delta t$ (flies/day) |
|---|---|
| $(45, 340)$ | $\frac{340 - 150}{45 - 23} \approx 8.6$ |
| $(40, 330)$ | $\frac{330 - 150}{40 - 23} \approx 10.6$ |
| $(35, 310)$ | $\frac{310 - 150}{35 - 23} \approx 13.3$ |
| $(30, 265)$ | $\frac{265 - 150}{30 - 23} \approx 16.4$ |

[Figure 2.6: A coordinate graph showing multiple secant lines and a tangent line for the fruit fly population data. The axes are the same as Figure 2.5: horizontal axis $t$ (Time (days)) 0 to 50, vertical axis $p$ (Number of flies) 0 to 350. The blue curve represents the population growth. Point $P(23, 150)$ is the fixed point of interest. Four blue secant lines are drawn from $P$ to different points $Q$ on the curve: $Q(45, 340)$, $(40, 330)$, $(35, 310)$, and $(30, 265)$. A red line represents the tangent at point $P$. This red line passes through points labeled $A(14, 0)$ and $B(35, 350)$. Caption: FIGURE 2.6 The positions and slopes of four secants through the point $P$ on the fruit fly graph (Example 5).]

The values in the table show that the secant slopes rise from 8.6 to 16.4 as the $t$-coordinate of $Q$ decreases from 45 to 30, and we would expect the slopes to rise slightly higher as $t$ continued on toward 23. Geometrically, the secants rotate counterclockwise about $P$ and seem to approach the red tangent line in the figure. Since the line appears to pass through the points $(14, 0)$ and $(35, 350)$, it has slope

$\frac{350 - 0}{35 - 14} = 16.7$ flies/day (approximately).

On day 23 the population was increasing at a rate of about 16.7 flies/day.

The instantaneous rates in Example 2 were found to be the values of the average speeds, or average rates of change, as the time interval of length $h$ approached 0. That is, the instantaneous rate is the value the average rate approaches as the length $h$ of the interval over which the change occurs approaches zero. The average rate of change corresponds to the slope of a secant line; the instantaneous rate corresponds to the slope of the tangent line as the independent variable approaches a fixed value. In Example 2, the independent variable $t$ approached the values $t = 1$ and $t = 2$. In Example 3, the independent variable $x$ approached the value $x = 2$. So we see that instantaneous rates and slopes of tangent lines are closely connected. We investigate this connection thoroughly in the next chapter, but to do so we need the concept of a limit.

## Exercises 2.1

### Average Rates of Change

[Exercises omitted]

### Slope of a Curve at a Point

[Exercises omitted]

<!-- PAGE 7 -->
[Exercises omitted]

<!-- PAGE 8 -->
## Chapter 2: Limits and Continuity

[Exercises omitted]

## 2.2 Limit of a Function and Limit Laws

In Section 2.1 we saw that limits arise when finding the instantaneous rate of change of a function or the tangent to a curve. Here we begin with an informal definition of limit and show how we can calculate the values of limits. A precise definition is presented in the next section.

### HISTORICAL ESSAY
**Limits**

### Limits of Function Values

Frequently when studying a function $y = f(x)$, we find ourselves interested in the function’s behavior near a particular point $c$, but not at $c$. This might be the case, for instance, if $c$ is an irrational number, like $\pi$ or $\sqrt{2}$, whose values can only be approximated by “close” rational numbers at which we actually evaluate the function instead. Another situation occurs when trying to evaluate a function at $c$ leads to division by zero, which is undefined. We encountered this last circumstance when seeking the instantaneous rate of change in $y$ by considering the quotient function $\Delta y / h$ for $h$ closer and closer to zero. Here’s a specific example in which we explore numerically how a function behaves near a particular point at which we cannot directly evaluate the function.

**EXAMPLE 1** How does the function
$$f(x) = \frac{x^2 - 1}{x - 1}$$
behave near $x = 1$?

**Solution** The given formula defines $f$ for all real numbers $x$ except $x = 1$ (we cannot divide by zero). For any $x \neq 1$, we can simplify the formula by factoring the numerator and canceling common factors:
$$f(x) = \frac{(x - 1)(x + 1)}{x - 1} = x + 1 \text{ for } x \neq 1.$$
The graph of $f$ is the line $y = x + 1$ with the point $(1, 2)$ removed. This removed point is shown as a “hole” in Figure 2.7. Even though $f(1)$ is not defined, it is clear that we can make the value of $f(x)$ as close as we want to 2 by choosing $x$ close enough to 1 (Table 2.2). $\blacksquare$

[Figure 2.7 consists of two side-by-side Cartesian coordinate graphs.
Left Graph: Labeled $y = f(x) = \frac{x^2 - 1}{x - 1}$. It shows a blue line with a positive slope (slope = 1) passing through the y-axis at $1$ and the x-axis at $-1$. There is an open circle (a hole) at the point $(1, 2)$. The x-axis has tick marks at $0$ and $1$. The y-axis has tick marks at $1$ and $2$.
Right Graph: Labeled $y = x + 1$. It shows the same blue line passing through the same points, but it is continuous at the point $(1, 2)$, with no hole. The axes and tick marks are identical to the left graph.
Caption: FIGURE 2.7 The graph of $f$ is identical with the line $y = x + 1$ except at $x = 1$, where $f$ is not defined (Example 1).]

<!-- PAGE 9 -->

## 2.2 Limit of a Function and Limit Laws

Generalizing the idea illustrated in Example 1, suppose $f(x)$ is defined on an open interval about $c$, except possibly at $c$ itself. If $f(x)$ is arbitrarily close to the number $L$ (as close to $L$ as we like) for all $x$ sufficiently close to $c$, we say that $f$ approaches the **limit** $L$ as $x$ approaches $c$, and write

$$\lim_{x \to c} f(x) = L,$$

which is read "the limit of $f(x)$ as $x$ approaches $c$ is $L$." For instance, in Example 1 we would say that $f(x)$ approaches the limit 2 as $x$ approaches 1, and write

$$\lim_{x \to 1} f(x) = 2, \text{ or } \lim_{x \to 1} \frac{x^2 - 1}{x - 1} = 2.$$

Essentially, the definition says that the values of $f(x)$ are close to the number $L$ whenever $x$ is close to $c$ (on either side of $c$).

Our definition here is "informal" because phrases like *arbitrarily close* and *sufficiently close* are imprecise; their meaning depends on the context. (To a machinist manufacturing a piston, close may mean within a few thousandths of an inch. To an astronomer studying distant galaxies, close may mean within a few thousand light-years.) Nevertheless, the definition is clear enough to enable us to recognize and evaluate limits of many specific functions. We will need the precise definition given in Section 2.3, however, when we set out to prove theorems about limits or study complicated functions. Here are several more examples exploring the idea of limits.

**TABLE 2.2** As $x$ gets closer to 1, $f(x)$ gets closer to 2.

| x | $f(x) = \frac{x^2 - 1}{x - 1}$ |
| :--- | :--- |
| 0.9 | 1.9 |
| 1.1 | 2.1 |
| 0.99 | 1.99 |
| 1.01 | 2.01 |
| 0.999 | 1.999 |
| 1.001 | 2.001 |
| 0.999999 | 1.999999 |
| 1.000001 | 2.000001 |

**EXAMPLE 2** The limit value of a function does not depend on how the function is defined at the point being approached. Consider the three functions in Figure 2.8. The function $f$ has limit 2 as $x \to 1$ even though $f$ is not defined at $x = 1$. The function $g$ has limit 2 as $x \to 1$ even though $2 \neq g(1)$. The function $h$ is the only one of the three functions in Figure 2.8 whose limit as $x \to 1$ equals its value at $x = 1$. For $h$, we have $\lim_{x \to 1} h(x) = h(1)$. This equality of limit and function value is of special importance, and we return to it in Section 2.5.

[Figure 2.8 displays three coordinate graphs showing limits as $x$ approaches 1. 
Graph (a) labeled "$f(x) = \frac{x^2 - 1}{x - 1}$": Shows a linear function $y = x + 1$ with a hole (open circle) at the point (1, 2). The x-axis is labeled from -1 to 1, and the y-axis is labeled 1 and 2.
Graph (b) labeled "$g(x) = \begin{cases} \frac{x^2 - 1}{x - 1}, & x \neq 1 \\ 1, & x = 1 \end{cases}$": Shows the same linear function with a hole at (1, 2), but there is a solid point at (1, 1).
Graph (c) labeled "$h(x) = x + 1$": Shows a solid continuous line passing through (1, 2) without any holes.
The caption for Figure 2.8 reads: "FIGURE 2.8 The limits of $f(x)$, $g(x)$, and $h(x)$ all equal 2 as $x$ approaches 1. However, only $h(x)$ has the same function value as its limit at $x = 1$ (Example 2)."]

**EXAMPLE 3**
(a) If $f$ is the **identity function** $f(x) = x$, then for any value of $c$ (Figure 2.9a),
$$\lim_{x \to c} f(x) = \lim_{x \to c} x = c.$$

(b) If $f$ is the **constant function** $f(x) = k$ (function with the constant value $k$), then for any value of $c$ (Figure 2.9b),
$$\lim_{x \to c} f(x) = \lim_{x \to c} k = k.$$

[Figure 2.9 displays two coordinate graphs. 
Graph (a) labeled "(a) Identity function": Shows the line $y = x$ passing through the origin. A vertical dashed line from $x = c$ meets a horizontal dashed line from $y = c$ at the line $y = x$.
Graph (b) labeled "(b) Constant function": Shows a horizontal line $y = k$. A vertical dashed line from $x = c$ meets the line at $y = k$.
The caption for Figure 2.9 reads: "FIGURE 2.9 The functions in Example 3 have limits at all points $c$."]

<!-- PAGE 10 -->

For instances of each of these rules we have
$$\lim_{x \to 3} x = 3 \quad \text{and} \quad \lim_{x \to -7} (4) = \lim_{x \to 2} (4) = 4.$$

We prove these rules in Example 3 in Section 2.3.

A function may not have a limit at a particular point. Some ways that limits can fail to exist are illustrated in Figure 2.10 and described in the next example.

[Figure 2.10 displays three coordinate graphs showing functions where limits do not exist as $x \to 0$.
Graph (a) labeled "(a) Unit step function $U(x)$": Shows a piecewise function with a horizontal segment at $y=0$ for $x < 0$ and a solid point at $(0, 1)$ continuing as a horizontal segment at $y=1$ for $x \ge 0$. The equation shown is $y = \begin{cases} 0, & x < 0 \\ 1, & x \ge 0 \end{cases}$.
Graph (b) labeled "(b) $g(x)$": Shows a function with vertical asymptotes at $x=0$. The curve approaches positive infinity as $x$ approaches 0 from both sides, but there is a solid point at $(0, 0)$. The equation shown is $y = \begin{cases} \frac{1}{x}, & x \neq 0 \\ 0, & x = 0 \end{cases}$. (Note: The visual shows $1/x^2$ or absolute value behavior as both sides go up, but the label says $1/x$).
Graph (c) labeled "(c) $f(x)$": Shows a function that oscillates rapidly between $y=1$ and $y=-1$ as it approaches $x=0$ from the right, and is $y=0$ for $x \le 0$. The equation shown is $y = \begin{cases} 0, & x \le 0 \\ \sin \frac{1}{x}, & x > 0 \end{cases}$.
The caption for Figure 2.10 reads: "FIGURE 2.10 None of these functions has a limit as $x$ approaches 0 (Example 4)."]

**EXAMPLE 4** Discuss the behavior of the following functions, explaining why they have no limit as $x \to 0$.

(a) $U(x) = \begin{cases} 0, & x < 0 \\ 1, & x \ge 0 \end{cases}$

(b) $g(x) = \begin{cases} \frac{1}{x}, & x \neq 0 \\ 0, & x = 0 \end{cases}$

(c) $f(x) = \begin{cases} 0, & x \le 0 \\ \sin \frac{1}{x}, & x > 0 \end{cases}$

**Solution**
(a) *It jumps:* The unit step function $U(x)$ has no limit as $x \to 0$ because its values jump at $x = 0$. For negative values of $x$ arbitrarily close to zero, $U(x) = 0$. For positive values of $x$ arbitrarily close to zero, $U(x) = 1$. There is no single value $L$ approached by $U(x)$ as $x \to 0$ (Figure 2.10a).

(b) *It grows too "large" to have a limit:* $g(x)$ has no limit as $x \to 0$ because the values of $g$ grow arbitrarily large in absolute value as $x \to 0$ and do not stay close to any fixed real number (Figure 2.10b). We say the function is *not bounded*.

(c) *It oscillates too much to have a limit:* $f(x)$ has no limit as $x \to 0$ because the function's values oscillate between $+1$ and $-1$ in every open interval containing 0. The values do not stay close to any one number as $x \to 0$ (Figure 2.10c).

<!-- PAGE 11 -->

## 2.2 Limit of a Function and Limit Laws

### The Limit Laws

To calculate limits of functions that are arithmetic combinations of functions having known limits, we can use several fundamental rules.

**THEOREM 1—Limit Laws** If $L, M, c,$ and $k$ are real numbers and
$\lim_{x \to c} f(x) = L$ and $\lim_{x \to c} g(x) = M$, then

1. **Sum Rule:** $\lim_{x \to c} (f(x) + g(x)) = L + M$
2. **Difference Rule:** $\lim_{x \to c} (f(x) - g(x)) = L - M$
3. **Constant Multiple Rule:** $\lim_{x \to c} (k \cdot f(x)) = k \cdot L$
4. **Product Rule:** $\lim_{x \to c} (f(x) \cdot g(x)) = L \cdot M$
5. **Quotient Rule:** $\lim_{x \to c} \frac{f(x)}{g(x)} = \frac{L}{M}, M \neq 0$
6. **Power Rule:** $\lim_{x \to c} [f(x)]^n = L^n, n$ a positive integer
7. **Root Rule:** $\lim_{x \to c} \sqrt[n]{f(x)} = \sqrt[n]{L} = L^{1/n}, n$ a positive integer
(If $n$ is even, we assume that $\lim_{x \to c} f(x) = L > 0$.)

In words, the Sum Rule says that the limit of a sum is the sum of the limits. Similarly, the next rules say that the limit of a difference is the difference of the limits; the limit of a constant times a function is the constant times the limit of the function; the limit of a product is the product of the limits; the limit of a quotient is the quotient of the limits (provided that the limit of the denominator is not 0); the limit of a positive integer power (or root) of a function is the integer power (or root) of the limit (provided that the root of the limit is a real number).

It is reasonable that the properties in Theorem 1 are true (although these intuitive arguments do not constitute proofs). If $x$ is sufficiently close to $c$, then $f(x)$ is close to $L$ and $g(x)$ is close to $M$, from our informal definition of a limit. It is then reasonable that $f(x) + g(x)$ is close to $L + M$; $f(x) - g(x)$ is close to $L - M$; $kf(x)$ is close to $kL$; $f(x)g(x)$ is close to $LM$; and $f(x)/g(x)$ is close to $L/M$ if $M$ is not zero. We prove the Sum Rule in Section 2.3, based on a precise definition of limit. Rules 2–5 are proved in Appendix 4. Rule 6 is obtained by applying Rule 4 repeatedly. Rule 7 is proved in more advanced texts. The Sum, Difference, and Product Rules can be extended to any number of functions, not just two.

**EXAMPLE 5** Use the observations $\lim_{x \to c} k = k$ and $\lim_{x \to c} x = c$ (Example 3) and the fundamental rules of limits to find the following limits.

(a) $\lim_{x \to c} (x^3 + 4x^2 - 3)$

(b) $\lim_{x \to c} \frac{x^4 + x^2 - 1}{x^2 + 5}$

(c) $\lim_{x \to -2} \sqrt{4x^2 - 3}$

<!-- PAGE 12 -->

**Solution**

(a) $\lim_{x \to c} (x^3 + 4x^2 - 3) = \lim_{x \to c} x^3 + \lim_{x \to c} 4x^2 - \lim_{x \to c} 3$ (Sum and Difference Rules)
$= c^3 + 4c^2 - 3$ (Power and Multiple Rules)

(b) $\lim_{x \to c} \frac{x^4 + x^2 - 1}{x^2 + 5} = \frac{\lim_{x \to c} (x^4 + x^2 - 1)}{\lim_{x \to c} (x^2 + 5)}$ (Quotient Rule)
$= \frac{\lim_{x \to c} x^4 + \lim_{x \to c} x^2 - \lim_{x \to c} 1}{\lim_{x \to c} x^2 + \lim_{x \to c} 5}$ (Sum and Difference Rules)
$= \frac{c^4 + c^2 - 1}{c^2 + 5}$ (Power or Product Rule)

(c) $\lim_{x \to -2} \sqrt{4x^2 - 3} = \sqrt{\lim_{x \to -2} (4x^2 - 3)}$ (Root Rule with $n = 2$)
$= \sqrt{\lim_{x \to -2} 4x^2 - \lim_{x \to -2} 3}$ (Difference Rule)
$= \sqrt{4(-2)^2 - 3}$ (Product and Multiple Rules)
$= \sqrt{16 - 3}$
$= \sqrt{13}$

Theorem 1 simplifies the task of calculating limits of polynomials and rational functions. To evaluate the limit of a polynomial function as $x$ approaches $c$, merely substitute $c$ for $x$ in the formula for the function. To evaluate the limit of a rational function as $x$ approaches a point $c$ at which the denominator is not zero, substitute $c$ for $x$ in the formula for the function. (See Examples 5a and 5b.) We state these results formally as theorems.

**THEOREM 2—Limits of Polynomials**
If $P(x) = a_n x^n + a_{n-1}x^{n-1} + \dots + a_0$, then
$$\lim_{x \to c} P(x) = P(c) = a_n c^n + a_{n-1}c^{n-1} + \dots + a_0.$$

**THEOREM 3—Limits of Rational Functions**
If $P(x)$ and $Q(x)$ are polynomials and $Q(c) \neq 0$, then
$$\lim_{x \to c} \frac{P(x)}{Q(x)} = \frac{P(c)}{Q(c)}.$$

**EXAMPLE 6** The following calculation illustrates Theorems 2 and 3:
$$\lim_{x \to -1} \frac{x^3 + 4x^2 - 3}{x^2 + 5} = \frac{(-1)^3 + 4(-1)^2 - 3}{(-1)^2 + 5} = \frac{0}{6} = 0$$

### Eliminating Common Factors from Zero Denominators

Theorem 3 applies only if the denominator of the rational function is not zero at the limit point $c$. If the denominator is zero, canceling common factors in the numerator and denominator may reduce the fraction to one whose denominator is no longer zero at $c$. If this happens, we can find the limit by substitution in the simplified fraction.

[Note: There is a sidebar box on the left of the page.]

**Identifying Common Factors**
It can be shown that if $Q(x)$ is a polynomial and $Q(c) = 0$, then $(x - c)$ is a factor of $Q(x)$. Thus, if the numerator and denominator of a rational function of $x$ are both zero at $x = c$, they have $(x - c)$ as a common factor.

<!-- PAGE 13 -->

## 2.2 Limit of a Function and Limit Laws

**EXAMPLE 7** Evaluate

$$\lim_{x \to 1} \frac{x^{2} + x - 2}{x^{2} - x}$$

**Solution** We cannot substitute $x = 1$ because it makes the denominator zero. We test the numerator to see if it, too, is zero at $x = 1$. It is, so it has a factor of $(x - 1)$ in common with the denominator. Canceling this common factor gives a simpler fraction with the same values as the original for $x \neq 1$:

$$\frac{x^{2} + x - 2}{x^{2} - x} = \frac{(x - 1)(x + 2)}{x(x - 1)} = \frac{x + 2}{x}, \text{ if } x \neq 1.$$

Using the simpler fraction, we find the limit of these values as $x \to 1$ by Theorem 3:

$$\lim_{x \to 1} \frac{x^{2} + x - 2}{x^{2} - x} = \lim_{x \to 1} \frac{x + 2}{x} = \frac{1 + 2}{1} = 3.$$

See Figure 2.11.

[Figure 2.11 contains two coordinate graphs, labeled (a) and (b), showing the comparison between two functions.
Graph (a) shows the function $y = \frac{x^2 + x - 2}{x^2 - x}$. The graph is a blue curve that looks like a hyperbola. It passes through the point $(-2, 0)$ and has a hole (open circle) at the coordinates $(1, 3)$. The x-axis is labeled with $-2, 0, 1$ and the y-axis is labeled with $3$.
Graph (b) shows the function $y = \frac{x + 2}{x}$. The graph is a blue curve identical in shape to graph (a). However, instead of a hole at $(1, 3)$, it has a solid point at $(1, 3)$. The axes are labeled the same way as in (a).
Caption: **FIGURE 2.11** The graph of $f(x) = (x^{2} + x - 2)/(x^{2} - x)$ in part (a) is the same as the graph of $g(x) = (x + 2)/x$ in part (b) except at $x = 1$, where $f$ is undefined. The functions have the same limit as $x \to 1$ (Example 7).]

### Using Calculators and Computers to Estimate Limits

When we cannot use the Quotient Rule in Theorem 1 because the limit of the denominator is zero, we can try using a calculator or computer to guess the limit numerically as $x$ gets closer and closer to $c$. We used this approach in Example 1, but calculators and computers can sometimes give false values and misleading impressions for functions that are undefined at a point or fail to have a limit there. Usually the problem is associated with rounding errors, as we now illustrate.

**EXAMPLE 8** Estimate the value of $\lim_{x \to 0} \frac{\sqrt{x^{2} + 100} - 10}{x^{2}}$.

**Solution** Table 2.3 lists values of the function obtained on a calculator for several points approaching $x = 0$. As $x$ approaches 0 through the points $\pm 1, \pm 0.5, \pm 0.10, \text{ and } \pm 0.01$, the function seems to approach the number 0.05.

As we take even smaller values of $x, \pm 0.0005, \pm 0.0001, \pm 0.00001, \text{ and } \pm 0.000001$, the function appears to approach the number 0.

Is the answer 0.05 or 0, or some other value? We resolve this question in the next example.

**TABLE 2.3** Computed values of $f(x) = \frac{\sqrt{x^{2} + 100} - 10}{x^{2}}$ near $x = 0$

| x | f(x) |
|---|---|
| $\pm 1$ | 0.049876 |
| $\pm 0.5$ | 0.049969 |
| $\pm 0.1$ | 0.049999 |
| $\pm 0.01$ | 0.050000 |
| (Note: above values) | approaches 0.05? |
| $\pm 0.0005$ | 0.050000 |
| $\pm 0.0001$ | 0.000000 |
| $\pm 0.00001$ | 0.000000 |
| $\pm 0.000001$ | 0.000000 |
| (Note: above values) | approaches 0? |

<!-- PAGE 14 -->

Using a computer or calculator may give ambiguous results, as in the last example. The calculator could not keep track of enough digits to avoid rounding errors in computing the values of $f(x)$ when $x$ is very small. We cannot substitute $x = 0$ in the problem, and the numerator and denominator have no obvious common factors (as they did in Example 7). Sometimes, however, we can create a common factor algebraically.

**EXAMPLE 9** Evaluate

$$\lim_{x \to 0} \frac{\sqrt{x^{2} + 100} - 10}{x^{2}}$$

**Solution** This is the limit we considered in Example 8. We can create a common factor by multiplying both numerator and denominator by the conjugate radical expression $\sqrt{x^{2} + 100} + 10$ (obtained by changing the sign after the square root). The preliminary algebra rationalizes the numerator:

$$\frac{\sqrt{x^{2} + 100} - 10}{x^{2}} = \frac{\sqrt{x^{2} + 100} - 10}{x^{2}} \cdot \frac{\sqrt{x^{2} + 100} + 10}{\sqrt{x^{2} + 100} + 10}$$
$$= \frac{x^{2} + 100 - 100}{x^{2}(\sqrt{x^{2} + 100} + 10)}$$
$$= \frac{x^{2}}{x^{2}(\sqrt{x^{2} + 100} + 10)} \quad \text{Common factor } x^{2}$$
$$= \frac{1}{\sqrt{x^{2} + 100} + 10} \quad \text{Cancel } x^{2} \text{ for } x \neq 0.$$

Therefore,

$$\lim_{x \to 0} \frac{\sqrt{x^{2} + 100} - 10}{x^{2}} = \lim_{x \to 0} \frac{1}{\sqrt{x^{2} + 100} + 10}$$
$$= \frac{1}{\sqrt{0^{2} + 100} + 10} \quad \text{Denominator not 0 at } x = 0; \text{ substitute.}$$
$$= \frac{1}{20} = 0.05.$$

This calculation provides the correct answer, in contrast to the ambiguous computer results in Example 8.

We cannot always algebraically resolve the problem of finding the limit of a quotient where the denominator becomes zero. In some cases the limit might then be found with the aid of some geometry applied to the problem (see the proof of Theorem 7 in Section 2.4), or through methods of calculus (illustrated in Section 4.5). The next theorems give helpful tools by using function comparisons.

### The Sandwich Theorem

The following theorem enables us to calculate a variety of limits. It is called the Sandwich Theorem because it refers to a function $f$ whose values are sandwiched between the values of two other functions $g$ and $h$ that have the same limit $L$ at a point $c$. Being trapped between the values of two functions that approach $L$, the values of $f$ must also approach $L$ (Figure 2.12). You will find a proof in Appendix 4.

[Figure 2.12 shows a Cartesian coordinate system. Three continuous curves are plotted. The top curve is labeled $h$, the bottom curve is labeled $g$, and the middle curve, which is trapped between them, is labeled $f$. All three functions converge at a single point $(c, L)$. A vertical dashed line descends from this intersection point to the x-axis at $x = c$. A horizontal dashed line goes from the intersection point to the y-axis at $y = L$. The origin is marked with $0$.
Caption: **FIGURE 2.12** The graph of $f$ is sandwiched between the graphs of $g$ and $h$.]

<!-- PAGE 15 -->

## 2.2 Limit of a Function and Limit Laws

**THEOREM 4—The Sandwich Theorem**
Suppose that $g(x) \leq f(x) \leq h(x)$ for all $x$ in some open interval containing $c$, except possibly at $x = c$ itself. Suppose also that
$$\lim_{x \to c} g(x) = \lim_{x \to c} h(x) = L.$$
Then $\lim_{x \to c} f(x) = L$.

The Sandwich Theorem is also called the Squeeze Theorem or the Pinching Theorem.

**EXAMPLE 10** Given that
$$1 - \frac{x^2}{4} \leq u(x) \leq 1 + \frac{x^2}{2} \text{ for all } x \neq 0,$$
find $\lim_{x \to 0} u(x)$, no matter how complicated $u$ is.

**Solution** Since
$$\lim_{x \to 0} \left(1 - \frac{x^2}{4}\right) = 1 \text{ and } \lim_{x \to 0} \left(1 + \frac{x^2}{2}\right) = 1,$$
the Sandwich Theorem implies that $\lim_{x \to 0} u(x) = 1$ (Figure 2.13).

[Figure 2.13: This coordinate graph shows the behavior of three functions near $x = 0$. The x-axis is labeled from -1 to 1, and the y-axis shows values up to 2. A blue curve, opening upward, represents $y = 1 + \frac{x^2}{2}$. A yellow curve, opening downward, represents $y = 1 - \frac{x^2}{4}$. Both curves have their vertex at the point (0, 1). A red, slightly irregular curve represents $y = u(x)$, which is trapped between the blue and yellow parabolas. As the x-value approaches 0 from either side, all three curves converge at the point (0, 1). The caption reads: "FIGURE 2.13 Any function $u(x)$ whose graph lies in the region between $y = 1 + (x^2/2)$ and $y = 1 - (x^2/4)$ has limit 1 as $x \to 0$ (Example 10)."]

**EXAMPLE 11** The Sandwich Theorem helps us establish several important limit rules:
(a) $\lim_{\theta \to 0} \sin \theta = 0$
(b) $\lim_{\theta \to 0} \cos \theta = 1$
(c) For any function $f$, $\lim_{x \to c} |f(x)| = 0$ implies $\lim_{x \to c} f(x) = 0$.

**Solution**
(a) In Section 1.3 we established that $-|\theta| \leq \sin \theta \leq |\theta|$ for all $\theta$ (see Figure 2.14a). Since $\lim_{\theta \to 0} (-|\theta|) = \lim_{\theta \to 0} |\theta| = 0$, we have
$$\lim_{\theta \to 0} \sin \theta = 0.$$
(b) From Section 1.3, $0 \leq 1 - \cos \theta \leq |\theta|$ for all $\theta$ (see Figure 2.14b), and we have $\lim_{\theta \to 0} (1 - \cos \theta) = 0$ or
$$\lim_{\theta \to 0} \cos \theta = 1.$$
(c) Since $-|f(x)| \leq f(x) \leq |f(x)|$ and $-|f(x)|$ and $|f(x)|$ have limit 0 as $x \to c$, it follows that $\lim_{x \to c} f(x) = 0$.

[Figure 2.14: This figure contains two separate graphs labeled (a) and (b). 
Graph (a): Shows a coordinate system with $\theta$ on the horizontal axis and $y$ on the vertical axis. The $\theta$-axis is marked at $-\pi$ and $\pi$. It plots a blue V-shaped function $y = |\theta|$, a red inverted V-shaped function $y = -|\theta|$, and a yellow sinusoidal curve $y = \sin \theta$. The yellow curve stays between the blue and red lines and all three pass through the origin (0,0).
Graph (b): Shows a coordinate system with $\theta$ on the horizontal axis and $y$ on the vertical axis. The horizontal axis is marked from -2 to 2, and the vertical axis is marked 1 and 2. It plots a blue V-shaped function $y = |\theta|$ and a red inverted V-shaped function $y = -|\theta|$. A yellow curve representing $y = 1 - \cos \theta$ is shown starting at (0,0) and staying between the $y=0$ axis and the blue $y = |\theta|$ line for values near the origin.
The caption for both reads: "FIGURE 2.14 The Sandwich Theorem confirms the limits in Example 11."]

Another important property of limits is given by the next theorem. A proof is given in the next section.

**THEOREM 5** If $f(x) \leq g(x)$ for all $x$ in some open interval containing $c$, except possibly at $x = c$ itself, and the limits of $f$ and $g$ both exist as $x$ approaches $c$, then
$$\lim_{x \to c} f(x) \leq \lim_{x \to c} g(x).$$

**Caution** The assertion resulting from replacing the less than or equal to ($\leq$) inequality by the strict less than ($<$) inequality in Theorem 5 is false. Figure 2.14a shows that for $\theta \neq 0$, $-|\theta| < \sin \theta < |\theta|$. So $\lim_{\theta \to 0} \sin \theta = 0 = \lim_{\theta \to 0} |\theta|$, not $\lim_{\theta \to 0} \sin \theta < \lim_{\theta \to 0} |\theta|$.

<!-- PAGE 16 -->

[Exercises omitted]

<!-- PAGE 17 -->

## 2.2 Limit of a Function and Limit Laws

[Exercises omitted]

### Limits with trigonometric functions

[Exercises omitted]

### Using Limit Rules

[Exercises omitted]

### Limits of Average Rates of Change

Because of their connection with secant lines, tangents, and instantaneous rates, limits of the form

$$\lim_{h \to 0} \frac{f(x + h) - f(x)}{h}$$

occur frequently in calculus. In Exercises 57–62, evaluate this limit for the given value of $x$ and function $f$.

[Exercises omitted]

### Using the Sandwich Theorem

[Exercises omitted]

<!-- PAGE 18 -->

[Exercises omitted]

<!-- PAGE 19 -->

[Exercises omitted]

## 2.3 The Precise Definition of a Limit

We now turn our attention to the precise definition of a limit. We replace vague phrases like “gets arbitrarily close to” in the informal definition with specific conditions that can be applied to any particular example. With a precise definition, we can avoid misunderstandings, prove the limit properties given in the preceding section, and establish many important limits.

To show that the limit of $f(x)$ as $x \to c$ equals the number $L$, we need to show that the gap between $f(x)$ and $L$ can be made “as small as we choose” if $x$ is kept “close enough” to $c$. Let us see what this would require if we specified the size of the gap between $f(x)$ and $L$.

**EXAMPLE 1** Consider the function $y = 2x - 1$ near $x = 4$. Intuitively it appears that $y$ is close to 7 when $x$ is close to 4, so $\lim_{x \to 4} (2x - 1) = 7$. However, how close to $x = 4$ does $x$ have to be so that $y = 2x - 1$ differs from 7 by, say, less than 2 units?

**Solution** We are asked: For what values of $x$ is $|y - 7| < 2$? To find the answer we first express $|y - 7|$ in terms of $x$:

$$|y - 7| = |(2x - 1) - 7| = |2x - 8|.$$

The question then becomes: what values of $x$ satisfy the inequality $|2x - 8| < 2$? To find out, we solve the inequality:

$$|2x - 8| < 2$$
$$-2 < 2x - 8 < 2$$
$$6 < 2x < 10$$
$$3 < x < 5 \quad \text{Solve for } x.$$
$$-1 < x - 4 < 1 \quad \text{Solve for } x - 4.$$

Keeping $x$ within 1 unit of $x = 4$ will keep $y$ within 2 units of $y = 7$ (Figure 2.15).

[Figure 2.15: A Cartesian coordinate graph showing the line $f(x) = 2x - 1$. The x-axis has values marked at 3, 4, and 5. The y-axis has values marked at 5, 7, and 9. A point is plotted at (4, 7). A horizontal yellow shaded band extends from $y=5$ to $y=9$, labeled "Upper bound: $y = 9$", "Lower bound: $y = 5$", and "To satisfy this". A vertical blue shaded band extends from $x=3$ to $x=5$, labeled "Restrict to this". Arrows indicate that restricting $x$ to the interval $(3, 5)$ keeps the function values within the interval $(5, 9)$.]

**FIGURE 2.15** Keeping $x$ within 1 unit of $x = 4$ will keep $y$ within 2 units of $y = 7$ (Example 1).

<!-- PAGE 20 -->

In the previous example we determined how close $x$ must be to a particular value $c$ to ensure that the outputs $f(x)$ of some function lie within a prescribed interval about a limit value $L$. To show that the limit of $f(x)$ as $x \to c$ actually equals $L$, we must be able to show that the gap between $f(x)$ and $L$ can be made less than any prescribed error, no matter how small, by holding $x$ close enough to $c$.

### Definition of Limit

Suppose we are watching the values of a function $f(x)$ as $x$ approaches $c$ (without taking on the value of $c$ itself). Certainly we want to be able to say that $f(x)$ stays within one-tenth of a unit from $L$ as soon as $x$ stays within some distance $\delta$ of $c$ (Figure 2.16). But that in itself is not enough, because as $x$ continues on its course toward $c$, what is to prevent $f(x)$ from jittering about within the interval from $L - (1/10)$ to $L + (1/10)$ without tending toward $L$?

We can be told that the error can be no more than $1/100$ or $1/1000$ or $1/100,000$. Each time, we find a new $\delta$-interval about $c$ so that keeping $x$ within that interval satisfies the new error tolerance. And each time the possibility exists that $f(x)$ jitters away from $L$ at some stage.

The figures on the next page illustrate the problem. You can think of this as a quarrel between a skeptic and a scholar. The skeptic presents $\epsilon$-challenges to prove that the limit does not exist or, more precisely, that there is room for doubt. The scholar answers every challenge with a $\delta$-interval around $c$ that keeps the function values within $\epsilon$ of $L$.

How do we stop this seemingly endless series of challenges and responses? We can do so by proving that for every error tolerance $\epsilon$ that the challenger can produce, we can present a matching distance $\delta$ that keeps $x$ “close enough” to $c$ to keep $f(x)$ within that $\epsilon$-tolerance of $L$ (Figure 2.17). This leads us to the precise definition of a limit.

[Figure 2.16: A conceptual graph illustrating the limit definition with a specific error of 1/10. The y-axis shows a center point $L$ with an interval marked by $L - 1/10$ and $L + 1/10$. A horizontal band is shaded between these two bounds, labeled "$f(x)$ lies in here". The x-axis shows a center point $c$ with an interval marked by $c - \delta$ and $c + \delta$. A vertical band is shaded between these bounds, labeled "for all $x \neq c$ in here". A function curve $f(x)$ passes through the region. Brackets on the x-axis indicate the distance $\delta$ on either side of $c$.]

**FIGURE 2.16** How should we define $\delta > 0$ so that keeping $x$ within the interval $(c - \delta, c + \delta)$ will keep $f(x)$ within the interval $(L - 1/10, L + 1/10)$?

[Figure 2.17: A conceptual graph similar to Figure 2.16 but using the general variable $\epsilon$. The y-axis shows $L$ with bounds $L - \epsilon$ and $L + \epsilon$, with the region labeled "$f(x)$ lies in here". The x-axis shows $c$ with bounds $c - \delta$ and $c + \delta$, labeled "for all $x \neq c$ in here". Arrows indicate that any $x$ chosen within the $\delta$ distance of $c$ (but not $c$ itself) results in an $f(x)$ value within the $\epsilon$ distance of $L$.]

**FIGURE 2.17** The relation of $\delta$ and $\epsilon$ in the definition of limit.

**DEFINITION** Let $f(x)$ be defined on an open interval about $c$, except possibly at $c$ itself. We say that the limit of $f(x)$ as $x$ approaches $c$ is the number $L$, and write

$$\lim_{x \to c} f(x) = L,$$

if, for every number $\epsilon > 0$, there exists a corresponding number $\delta > 0$ such that for all $x$,

$$0 < |x - c| < \delta \implies |f(x) - L| < \epsilon.$$

One way to think about the definition is to suppose we are machining a generator shaft to a close tolerance. We may try for diameter $L$, but since nothing is perfect, we must be satisfied with a diameter $f(x)$ somewhere between $L - \epsilon$ and $L + \epsilon$. The $\delta$ is the measure of how accurate our control setting for $x$ must be to guarantee this degree of accuracy in the diameter of the shaft. Notice that as the tolerance for error becomes stricter, we may have to adjust $\delta$. That is, the value of $\delta$, how tight our control setting must be, depends on the value of $\epsilon$, the error tolerance.

### Examples: Testing the Definition

The formal definition of limit does not tell how to find the limit of a function, but it enables us to verify that a conjectured limit value is correct. The following examples show how the definition can be used to verify limit statements for specific functions. However, the real purpose of the definition is not to do calculations like this, but rather to prove general theorems so that the calculation of specific limits can be simplified, such as the theorems stated in the previous section.

<!-- PAGE 21 -->

## 2.3 The Precise Definition of a Limit

[Note: The top two-thirds of the page contains a sequence of nine graphs illustrating the "epsilon-delta challenge" for a function $y = f(x)$ at $x = c$.

**Graph 1:** Shows a function $y = f(x)$ passing through $(c, L)$. A horizontal yellow band of width $2(1/10)$ is centered at $L$.
- Labels: $y$-axis: $L + \frac{1}{10}$, $L$, $L - \frac{1}{10}$; $x$-axis: $0$, $c$.
- Caption: The challenge: Make $|f(x) - L| < \epsilon = \frac{1}{10}$

**Graph 2:** Same as Graph 1, but adds a blue vertical band of width $2\delta_{1/10}$ centered at $c$ that maps into the yellow horizontal band.
- Labels: $x$-axis: $c - \delta_{1/10}$, $c$, $c + \delta_{1/10}$.
- Caption: Response: $|x - c| < \delta_{1/10}$ (a number)

**Graph 3:** Epsilon is reduced. A narrower horizontal yellow band of width $2(1/100)$ is centered at $L$.
- Labels: $y$-axis: $L + \frac{1}{100}$, $L$, $L - \frac{1}{100}$; $x$-axis: $0$, $c$.
- Caption: New challenge: Make $|f(x) - L| < \epsilon = \frac{1}{100}$

**Graph 4:** Same as Graph 3, showing the corresponding narrower blue vertical band of width $2\delta_{1/100}$.
- Labels: $x$-axis: $c - \delta_{1/100}$, $c$, $c + \delta_{1/100}$.
- Caption: Response: $|x - c| < \delta_{1/100}$

**Graph 5:** Epsilon is reduced further to $1/1000$.
- Labels: $y$-axis: $L + \frac{1}{1000}$, $L$, $L - \frac{1}{1000}$; $x$-axis: $0$, $c$.
- Caption: New challenge: $\epsilon = \frac{1}{1000}$

**Graph 6:** Shows the corresponding blue vertical band for $\epsilon = 1/1000$.
- Labels: $y$-axis: $L + \epsilon$, $L - \epsilon$.
- Caption: Response: $|x - c| < \delta_{1/1000}$

**Graph 7:** Epsilon is reduced to $1/100,000$. The yellow band is very thin.
- Labels: $y$-axis: $L + \frac{1}{100,000}$, $L - \frac{1}{100,000}$.
- Caption: New challenge: $\epsilon = \frac{1}{100,000}$

**Graph 8:** Shows the corresponding extremely narrow blue vertical band.
- Caption: Response: $|x - c| < \delta_{1/100,000}$

**Graph 9:** A general representation with an arbitrary $\epsilon$.
- Labels: $y$-axis: $L + \epsilon$, $L$, $L - \epsilon$.
- Caption: New challenge: $\epsilon = \dots$]

**EXAMPLE 2** Show that
$$\lim_{x \to 1} (5x - 3) = 2.$$

**Solution** Set $c = 1$, $f(x) = 5x - 3$, and $L = 2$ in the definition of limit. For any given $\epsilon > 0$, we have to find a suitable $\delta > 0$ so that if $x \neq 1$ and $x$ is within distance $\delta$ of $c = 1$, that is, whenever
$$0 < |x - 1| < \delta,$$
it is true that $f(x)$ is within distance $\epsilon$ of $L = 2$, so
$$|f(x) - 2| < \epsilon.$$

<!-- PAGE 22 -->

We find $\delta$ by working backward from the $\epsilon$-inequality:
$$|(5x - 3) - 2| = |5x - 5| < \epsilon$$
$$5|x - 1| < \epsilon$$
$$|x - 1| < \epsilon/5.$$

Thus, we can take $\delta = \epsilon/5$ (Figure 2.18). If $0 < |x - 1| < \delta = \epsilon/5$, then
$$|(5x - 3) - 2| = |5x - 5| = 5|x - 1| < 5(\epsilon/5) = \epsilon,$$
which proves that $\lim_{x \to 1}(5x - 3) = 2$.

The value of $\delta = \epsilon/5$ is not the only value that will make $0 < |x - 1| < \delta$ imply $|5x - 5| < \epsilon$. Any smaller positive $\delta$ will do as well. The definition does not ask for a "best" positive $\delta$, just one that will work.

[Note: **FIGURE 2.18** is a graph of the line $y = 5x - 3$. 
- Vertical axis: Marks at $2 + \epsilon$, $2$, $2 - \epsilon$, and $-3$ (the y-intercept).
- Horizontal axis: Marks at $0$, $1 - \frac{\epsilon}{5}$, $1$, and $1 + \frac{\epsilon}{5}$. 
- A yellow horizontal band of width $2\epsilon$ is centered at $y=2$. A blue vertical band of width $2\epsilon/5$ is centered at $x=1$. 
- Text in image: "NOT TO SCALE".
- Caption: **FIGURE 2.18** If $f(x) = 5x - 3$, then $0 < |x - 1| < \epsilon/5$ guarantees that $|f(x) - 2| < \epsilon$ (Example 2).]

**EXAMPLE 3** Prove the following results presented graphically in Section 2.2.
(a) $\lim_{x \to c} x = c$
(b) $\lim_{x \to c} k = k$ ($k$ constant)

**Solution**
(a) Let $\epsilon > 0$ be given. We must find $\delta > 0$ such that for all $x$
$$0 < |x - c| < \delta \implies |x - c| < \epsilon.$$
The implication will hold if $\delta$ equals $\epsilon$ or any smaller positive number (Figure 2.19). This proves that $\lim_{x \to c} x = c$.

(b) Let $\epsilon > 0$ be given. We must find $\delta > 0$ such that for all $x$
$$0 < |x - c| < \delta \implies |k - k| < \epsilon.$$
Since $k - k = 0$, we can use any positive number for $\delta$ and the implication will hold (Figure 2.20). This proves that $\lim_{x \to c} k = k$.

[Note: **FIGURE 2.19** is a graph of the identity function $y = x$. 
- Labels: $y$-axis: $c+\epsilon, c+\delta, c, c-\delta, c-\epsilon$. $x$-axis: $c-\delta, c, c+\delta$.
- The graph shows a yellow horizontal band and a blue vertical band meeting at the line $y=x$.
- Caption: **FIGURE 2.19** For the function $f(x) = x$, we find that $0 < |x - c| < \delta$ will guarantee $|f(x) - c| < \epsilon$ whenever $\delta \le \epsilon$ (Example 3a).]

[Note: **FIGURE 2.20** is a graph of the constant function $y = k$.
- Labels: $y$-axis: $k+\epsilon, k, k-\epsilon$. $x$-axis: $c-\delta, c, c+\delta$.
- A yellow horizontal band is shown around the line $y=k$. A blue vertical band of width $2\delta$ is shown centered at $c$.
- Caption: **FIGURE 2.20** For the function $f(x) = k$, we find that $|f(x) - k| < \epsilon$ for any positive $\delta$ (Example 3b).]

### Finding Deltas Algebraically for Given Epsilons

In Examples 2 and 3, the interval of values about $c$ for which $|f(x) - L|$ was less than $\epsilon$ was symmetric about $c$ and we could take $\delta$ to be half the length of that interval. When such symmetry is absent, as it usually is, we can take $\delta$ to be the distance from $c$ to the interval's nearer endpoint.

**EXAMPLE 4** For the limit $\lim_{x \to 5} \sqrt{x - 1} = 2$, find a $\delta > 0$ that works for $\epsilon = 1$. That is, find a $\delta > 0$ such that for all $x$
$$0 < |x - 5| < \delta \implies |\sqrt{x - 1} - 2| < 1.$$

**Solution** We organize the search into two steps.
1. Solve the inequality $|\sqrt{x - 1} - 2| < 1$ to find an interval containing $x = 5$ on which the inequality holds for all $x \neq 5$.
$$|\sqrt{x - 1} - 2| < 1$$
$$-1 < \sqrt{x - 1} - 2 < 1$$
$$1 < \sqrt{x - 1} < 3$$
$$1 < x - 1 < 9$$
$$2 < x < 10$$

<!-- PAGE 23 -->

## 2.3 The Precise Definition of a Limit

The inequality holds for all $x$ in the open interval $(2, 10)$, so it holds for all $x \neq 5$ in this interval as well.

2. **Find a value of $\delta > 0$** to place the centered interval $5 - \delta < x < 5 + \delta$ (centered at $x = 5$) inside the interval $(2, 10)$. The distance from 5 to the nearer endpoint of $(2, 10)$ is 3 (Figure 2.21). If we take $\delta = 3$ or any smaller positive number, then the inequality $0 < |x - 5| < \delta$ will automatically place $x$ between 2 and 10 to make $|\sqrt{x - 1} - 2| < 1$ (Figure 2.22):

$$0 < |x - 5| < 3 \implies |\sqrt{x - 1} - 2| < 1.$$

[Figure 2.21: A horizontal number line representing $x$. There is an open interval indicated by parentheses between $x=2$ and $x=10$. The center point is $x=5$. The distance between 2 and 5 is labeled as 3, and the distance between 5 and 8 is also labeled as 3. Caption: FIGURE 2.21 An open interval of radius 3 about $x = 5$ will lie inside the open interval $(2, 10)$.]

[Figure 2.22: A graph on a Cartesian coordinate plane showing the function $y = \sqrt{x - 1}$. The x-axis has labels at 0, 1, 2, 5, 8, and 10. The y-axis has labels at 1, 2, and 3. The point $(5, 2)$ is on the curve. A horizontal dashed line extends from $y=1$ to the curve at $x=2$, and from $y=3$ to the curve at $x=10$. The interval on the x-axis from 2 to 8 is marked with two segments of length 3 each, centered at $x=5$. A note below the graph says "NOT TO SCALE". Caption: FIGURE 2.22 The function and intervals in Example 4.]

### How to Find Algebraically a $\delta$ for a Given $f, L, c$, and $\epsilon > 0$

The process of finding a $\delta > 0$ such that for all $x$

$$0 < |x - c| < \delta \implies |f(x) - L| < \epsilon$$

can be accomplished in two steps.

1. **Solve the inequality $|f(x) - L| < \epsilon$** to find an open interval $(a, b)$ containing $c$ on which the inequality holds for all $x \neq c$.
2. **Find a value of $\delta > 0$** that places the open interval $(c - \delta, c + \delta)$ centered at $c$ inside the interval $(a, b)$. The inequality $|f(x) - L| < \epsilon$ will hold for all $x \neq c$ in this $\delta$-interval.

**EXAMPLE 5** Prove that $\lim_{x \to 2} f(x) = 4$ if

$$f(x) = \begin{cases} x^2, & x \neq 2 \\ 1, & x = 2. \end{cases}$$

**Solution** Our task is to show that given $\epsilon > 0$ there exists a $\delta > 0$ such that for all $x$

$$0 < |x - 2| < \delta \implies |f(x) - 4| < \epsilon.$$

1. **Solve the inequality $|f(x) - 4| < \epsilon$** to find an open interval containing $x = 2$ on which the inequality holds for all $x \neq 2$.

For $x \neq c = 2$, we have $f(x) = x^2$, and the inequality to solve is $|x^2 - 4| < \epsilon$:

$$|x^2 - 4| < \epsilon$$
$$-\epsilon < x^2 - 4 < \epsilon$$
$$4 - \epsilon < x^2 < 4 + \epsilon$$
$$\sqrt{4 - \epsilon} < |x| < \sqrt{4 + \epsilon} \quad \text{Assumes } \epsilon < 4; \text{ see below.}$$
$$\sqrt{4 - \epsilon} < x < \sqrt{4 + \epsilon}. \quad \text{An open interval about } x = 2 \text{ that solves the inequality}$$

The inequality $|f(x) - 4| < \epsilon$ holds for all $x \neq 2$ in the open interval $(\sqrt{4 - \epsilon}, \sqrt{4 + \epsilon})$ (Figure 2.23).

2. **Find a value of $\delta > 0$** that places the centered interval $(2 - \delta, 2 + \delta)$ inside the interval $(\sqrt{4 - \epsilon}, \sqrt{4 + \epsilon})$.

Take $\delta$ to be the distance from $x = 2$ to the nearer endpoint of $(\sqrt{4 - \epsilon}, \sqrt{4 + \epsilon})$. In other words, take $\delta = \min \{ 2 - \sqrt{4 - \epsilon}, \sqrt{4 + \epsilon} - 2 \}$, the minimum (the

[Figure 2.23: A graph of the parabola $y = x^2$. The y-axis shows a value 4, with a surrounding band from $4 - \epsilon$ to $4 + \epsilon$. There is a point $(2, 4)$ with an open circle on the curve, and a solid point $(2, 1)$ below it. Dashed lines project from the y-axis values $4 - \epsilon$ and $4 + \epsilon$ to the curve and then down to the x-axis at $\sqrt{4 - \epsilon}$ and $\sqrt{4 + \epsilon}$. A blue interval centered at $x=2$ is shown on the x-axis. Caption: FIGURE 2.23 An interval containing $x = 2$ so that the function in Example 5 satisfies $|f(x) - 4| < \epsilon$.]

<!-- PAGE 24 -->

## Chapter 2: Limits and Continuity

smaller) of the two numbers $2 - \sqrt{4 - \epsilon}$ and $\sqrt{4 + \epsilon} - 2$. If $\delta$ has this or any smaller positive value, the inequality $0 < |x - 2| < \delta$ will automatically place $x$ between $\sqrt{4 - \epsilon}$ and $\sqrt{4 + \epsilon}$ to make $|f(x) - 4| < \epsilon$. For all $x$,

$$0 < |x - 2| < \delta \implies |f(x) - 4| < \epsilon.$$

This completes the proof for $\epsilon < 4$.

If $\epsilon \ge 4$, then we take $\delta$ to be the distance from $x = 2$ to the nearer endpoint of the interval $(0, \sqrt{4 + \epsilon})$. In other words, take $\delta = \min \{ 2, \sqrt{4 + \epsilon} - 2 \}$. (See Figure 2.23.)

### Using the Definition to Prove Theorems

We do not usually rely on the formal definition of limit to verify specific limits such as those in the preceding examples. Rather, we appeal to general theorems about limits, in particular the theorems of Section 2.2. The definition is used to prove these theorems (Appendix 5). As an example, we prove part 1 of Theorem 1, the Sum Rule.

**EXAMPLE 6** Given that $\lim_{x \to c} f(x) = L$ and $\lim_{x \to c} g(x) = M$, prove that

$$\lim_{x \to c} (f(x) + g(x)) = L + M.$$

**Solution** Let $\epsilon > 0$ be given. We want to find a positive number $\delta$ such that for all $x$

$$0 < |x - c| < \delta \implies |f(x) + g(x) - (L + M)| < \epsilon.$$

Regrouping terms, we get

$$|f(x) + g(x) - (L + M)| = |(f(x) - L) + (g(x) - M)|$$
$$\le |f(x) - L| + |g(x) - M|.$$

[Note in margin: Triangle Inequality: $|a + b| \le |a| + |b|$]

Since $\lim_{x \to c} f(x) = L$, there exists a number $\delta_1 > 0$ such that for all $x$

$$0 < |x - c| < \delta_1 \implies |f(x) - L| < \epsilon/2.$$

Similarly, since $\lim_{x \to c} g(x) = M$, there exists a number $\delta_2 > 0$ such that for all $x$

$$0 < |x - c| < \delta_2 \implies |g(x) - M| < \epsilon/2.$$

Let $\delta = \min \{ \delta_1, \delta_2 \}$, the smaller of $\delta_1$ and $\delta_2$. If $0 < |x - c| < \delta$ then $|x - c| < \delta_1$, so $|f(x) - L| < \epsilon/2$, and $|x - c| < \delta_2$, so $|g(x) - M| < \epsilon/2$. Therefore

$$|f(x) + g(x) - (L + M)| < \frac{\epsilon}{2} + \frac{\epsilon}{2} = \epsilon.$$

This shows that $\lim_{x \to c} (f(x) + g(x)) = L + M$.

Next we prove Theorem 5 of Section 2.2.

**EXAMPLE 7** Given that $\lim_{x \to c} f(x) = L$ and $\lim_{x \to c} g(x) = M$, and that $f(x) \le g(x)$ for all $x$ in an open interval containing $c$ (except possibly $c$ itself), prove that $L \le M$.

**Solution** We use the method of proof by contradiction. Suppose, on the contrary, that $L > M$. Then by the limit of a difference property in Theorem 1,

$$\lim_{x \to c} (g(x) - f(x)) = M - L.$$

<!-- PAGE 25 -->

## 2.3 The Precise Definition of a Limit

Therefore, for any $\epsilon > 0$, there exists $\delta > 0$ such that

$$|(g(x) - f(x)) - (M - L)| < \epsilon \quad \text{whenever} \quad 0 < |x - c| < \delta.$$

Since $L - M > 0$ by hypothesis, we take $\epsilon = L - M$ in particular and we have a number $\delta > 0$ such that

$$|(g(x) - f(x)) - (M - L)| < L - M \quad \text{whenever} \quad 0 < |x - c| < \delta.$$

Since $a \le |a|$ for any number $a$, we have

$$(g(x) - f(x)) - (M - L) < L - M \quad \text{whenever} \quad 0 < |x - c| < \delta$$

which simplifies to

$$g(x) < f(x) \quad \text{whenever} \quad 0 < |x - c| < \delta.$$

But this contradicts $f(x) \le g(x)$. Thus the inequality $L > M$ must be false. Therefore $L \le M$. ■

## Exercises 2.3

[Exercises omitted]

<!-- PAGE 26 -->

[Exercises omitted]

<!-- PAGE 27 -->

## 2.3 The Precise Definition of a Limit

[Exercises omitted]

### When Is a Number $L$ Not the Limit of $f(x)$ as $x \to c$?

**Showing $L$ is not a limit** We can prove that $\lim_{x \to c} f(x) \neq L$ by providing an $\epsilon > 0$ such that no possible $\delta > 0$ satisfies the condition
$$ \text{for all } x, \quad 0 < |x - c| < \delta \implies |f(x) - L| < \epsilon. $$
We accomplish this for our candidate $\epsilon$ by showing that for each $\delta > 0$ there exists a value of $x$ such that
$$ 0 < |x - c| < \delta \quad \text{and} \quad |f(x) - L| \geq \epsilon. $$

[Figure: A graph illustrating the failure of a limit. The x-axis shows a point $c$ with a symmetric interval $(c - \delta, c + \delta)$. The y-axis shows a value $L$ with a horizontal band of width $2\epsilon$ shaded in light green, bounded by $L + \epsilon$ and $L - \epsilon$. A blue curve represents $y = f(x)$. Within the interval $(c - \delta, c)$, a specific point $x$ is identified. The function value at this $x$, denoted by a red dot at $(x, f(x))$, falls below the shaded band, meaning $f(x) < L - \epsilon$. A label points to the red dot stating: "a value of $x$ for which $0 < |x - c| < \delta$ and $|f(x) - L| \geq \epsilon$".]

## Theory and Examples

[Exercises omitted]

<!-- PAGE 28 -->

[Exercises omitted]

## 2.4 One-Sided Limits

In this section we extend the limit concept to **one-sided limits**, which are limits as $x$ approaches the number $c$ from the left-hand side (where $x < c$) or the right-hand side ($x > c$) only.

### Approaching a Limit from One Side

To have a limit $L$ as $x$ approaches $c$, a function $f$ must be defined on both sides of $c$ and its values $f(x)$ must approach $L$ as $x$ approaches $c$ from either side. That is, $f$ must be defined in some open interval about $c$, but not necessarily at $c$. Because of this, ordinary limits are called **two-sided**.

<!-- PAGE 29 -->

## 2.4 One-Sided Limits

If $f$ fails to have a two-sided limit at $c$, it may still have a one-sided limit, that is, a limit if the approach is only from one side. If the approach is from the right, the limit is a **right-hand limit**. From the left, it is a **left-hand limit**.

The function $f(x) = x/|x|$ (Figure 2.24) has limit 1 as $x$ approaches 0 from the right, and limit $-1$ as $x$ approaches 0 from the left. Since these one-sided limit values are not the same, there is no single number that $f(x)$ approaches as $x$ approaches 0. So $f(x)$ does not have a (two-sided) limit at 0.

Intuitively, if $f(x)$ is defined on an interval $(c, b)$, where $c < b$, and approaches arbitrarily close to $L$ as $x$ approaches $c$ from within that interval, then $f$ has **right-hand limit $L$ at $c$**. We write
$$\lim_{x \to c^+} f(x) = L.$$
The symbol "$x \to c^+$" means that we consider only values of $x$ greater than $c$.

Similarly, if $f(x)$ is defined on an interval $(a, c)$, where $a < c$, and approaches arbitrarily close to $M$ as $x$ approaches $c$ from within that interval, then $f$ has **left-hand limit $M$ at $c$**. We write
$$\lim_{x \to c^-} f(x) = M.$$
The symbol "$x \to c^-$" means that we consider only $x$-values less than $c$.

These informal definitions of one-sided limits are illustrated in Figure 2.25. For the function $f(x) = x/|x|$ in Figure 2.24 we have
$$\lim_{x \to 0^+} f(x) = 1 \quad \text{and} \quad \lim_{x \to 0^-} f(x) = -1.$$

[Figure 2.24: A graph shows the function $y = \frac{x}{|x|}$ on a Cartesian plane. The graph consists of two horizontal rays. For $x > 0$, the ray is at $y = 1$ starting from an open circle at $(0, 1)$. For $x < 0$, the ray is at $y = -1$ starting from an open circle at $(0, -1)$. A blue arrow on the x-axis points toward the origin from the right, and another from the left.]

**FIGURE 2.24** Different right-hand and left-hand limits at the origin.

[Figure 2.25: Two diagrams labeled (a) and (b). Panel (a) titled "$\lim_{x \to c^+} f(x) = L$" shows a curve $f(x)$ approaching a height $L$ as $x$ moves toward $c$ from the right. A red arrow on the x-axis indicates $x \to c$ from the right, and a bracket labels the interval $(c, x)$. Panel (b) titled "$\lim_{x \to c^-} f(x) = M$" shows a curve $f(x)$ approaching a height $M$ as $x$ moves toward $c$ from the left. A red arrow on the x-axis indicates $x \to c$ from the left, and a bracket labels the interval $(x, c)$.]

**FIGURE 2.25** (a) Right-hand limit as $x$ approaches $c$. (b) Left-hand limit as $x$ approaches $c$.

**EXAMPLE 1** The domain of $f(x) = \sqrt{4 - x^2}$ is $[-2, 2]$; its graph is the semicircle in Figure 2.26. We have
$$\lim_{x \to -2^+} \sqrt{4 - x^2} = 0 \quad \text{and} \quad \lim_{x \to 2^-} \sqrt{4 - x^2} = 0.$$
The function does not have a left-hand limit at $x = -2$ or a right-hand limit at $x = 2$. It does not have a two-sided limit at either $-2$ or 2 because each point does not belong to an open interval over which $f$ is defined.

[Figure 2.26: A graph shows the function $y = \sqrt{4 - x^2}$ on a Cartesian plane. The graph is a blue semicircle starting at $(-2, 0)$ on the x-axis, peaking at $(0, 2)$ on the y-axis, and ending at $(2, 0)$ on the x-axis. A blue arrow on the x-axis points from $-2$ toward 0, and another points from 2 toward 0.]

**FIGURE 2.26** The function $f(x) = \sqrt{4 - x^2}$ has right-hand limit 0 at $x = -2$ and left-hand limit 0 at $x = 2$ (Example 1).

One-sided limits have all the properties listed in Theorem 1 in Section 2.2. The right-hand limit of the sum of two functions is the sum of their right-hand limits, and so on. The theorems for limits of polynomials and rational functions hold with one-sided limits, as do the Sandwich Theorem and Theorem 5. One-sided limits are related to limits in the following way.

**THEOREM 6** A function $f(x)$ has a limit as $x$ approaches $c$ if and only if it has left-hand and right-hand limits there and these one-sided limits are equal:
$$\lim_{x \to c} f(x) = L \iff \lim_{x \to c^-} f(x) = L \quad \text{and} \quad \lim_{x \to c^+} f(x) = L.$$

<!-- PAGE 30 -->

88 Chapter 2: Limits and Continuity

**EXAMPLE 2** For the function graphed in Figure 2.27,

*   **At $x = 0$:** $\lim_{x \to 0^+} f(x) = 1$, $\lim_{x \to 0^-} f(x)$ and $\lim_{x \to 0} f(x)$ do not exist. The function is not defined to the left of $x = 0$.
*   **At $x = 1$:** $\lim_{x \to 1^-} f(x) = 0$ even though $f(1) = 1$, $\lim_{x \to 1^+} f(x) = 1$, $\lim_{x \to 1} f(x)$ does not exist. The right- and left-hand limits are not equal.
*   **At $x = 2$:** $\lim_{x \to 2^-} f(x) = 1$, $\lim_{x \to 2^+} f(x) = 1$, $\lim_{x \to 2} f(x) = 1$ even though $f(2) = 2$.
*   **At $x = 3$:** $\lim_{x \to 3^-} f(x) = \lim_{x \to 3^+} f(x) = \lim_{x \to 3} f(x) = f(3) = 2$.
*   **At $x = 4$:** $\lim_{x \to 4^-} f(x) = 1$ even though $f(4) \neq 1$, $\lim_{x \to 4^+} f(x)$ and $\lim_{x \to 4} f(x)$ do not exist. The function is not defined to the right of $x = 4$.

At every other point $c$ in $[0, 4]$, $f(x)$ has limit $f(c)$.

[Figure 2.27: A Cartesian coordinate system showing a piecewise function $y = f(x)$. The x-axis is labeled from 0 to 4. From $x=0$ to $x=1$, the graph is a line segment from an open circle at $(0, 1)$ to an open circle at $(1, 0)$. A solid dot is at $(1, 1)$. From $x=1$ to $x=2$, a segment goes from $(1, 0)$ to $(2, 1)$. A solid dot is at $(2, 2)$. From $x=2$ to $x=3$, a segment goes from $(2, 1)$ to $(3, 2)$. A solid dot is at $(3, 2)$. From $x=3$ to $x=4$, a segment goes from $(3, 2)$ to an open circle at $(4, 1)$. A solid dot is at $(4, 0.5)$.]

**FIGURE 2.27** Graph of the function in Example 2.

### Precise Definitions of One-Sided Limits

The formal definition of the limit in Section 2.3 is readily modified for one-sided limits.

**DEFINITIONS** We say that $f(x)$ has **right-hand limit $L$ at $c$**, and write
$$\lim_{x \to c^+} f(x) = L \quad \text{(see Figure 2.28)}$$
if for every number $\epsilon > 0$ there exists a corresponding number $\delta > 0$ such that for all $x$
$$c < x < c + \delta \implies |f(x) - L| < \epsilon.$$
We say that $f$ has **left-hand limit $L$ at $c$**, and write
$$\lim_{x \to c^-} f(x) = L \quad \text{(see Figure 2.29)}$$
if for every number $\epsilon > 0$ there exists a corresponding number $\delta > 0$ such that for all $x$
$$c - \delta < x < c \implies |f(x) - L| < \epsilon.$$

[Figure 2.28: A graph illustrating the formal definition of a right-hand limit. A curve $f(x)$ is shown. On the y-axis, a value $L$ is surrounded by an interval $(L - \epsilon, L + \epsilon)$. On the x-axis, a value $c$ is shown with a range to its right marked $\delta$, defining the interval $(c, c + \delta)$. The area between $c$ and $c + \delta$ is shaded pink, and the area between $L - \epsilon$ and $L + \epsilon$ is shaded blue. The graph $f(x)$ stays within the horizontal blue band for all $x$ in the vertical pink band.]

**FIGURE 2.28** Intervals associated with the definition of right-hand limit.

[Figure 2.29: A graph illustrating the formal definition of a left-hand limit. Similar to Figure 2.28, a value $L$ on the y-axis has an interval $(L - \epsilon, L + \epsilon)$ shaded blue. On the x-axis, the value $c$ has a range to its left marked $\delta$, defining the interval $(c - \delta, c)$ which is shaded pink. The graph $f(x)$ stays within the horizontal blue band for all $x$ in the vertical pink band.]

**FIGURE 2.29** Intervals associated with the definition of left-hand limit.

**EXAMPLE 3** Prove that
$$\lim_{x \to 0^+} \sqrt{x} = 0.$$

**Solution** Let $\epsilon > 0$ be given. Here $c = 0$ and $L = 0$, so we want to find a $\delta > 0$ such that for all $x$
$$0 < x < \delta \implies |\sqrt{x} - 0| < \epsilon,$$
or
$$0 < x < \delta \implies \sqrt{x} < \epsilon.$$

<!-- PAGE 31 -->

## 2.4 One-Sided Limits

Squaring both sides of this last inequality gives

$x < \epsilon^2$ if $0 < x < \delta$.

If we choose $\delta = \epsilon^2$ we have

$0 < x < \delta = \epsilon^2 \implies \sqrt{x} < \epsilon$,

or

$0 < x < \epsilon^2 \implies |\sqrt{x} - 0| < \epsilon$.

According to the definition, this shows that $\lim_{x \to 0^+} \sqrt{x} = 0$ (Figure 2.30).

[Figure 2.30: A graph showing the function $f(x) = \sqrt{x}$ in the first quadrant of a Cartesian coordinate system. The curve starts at the origin $(0,0)$ and curves upwards to the right. The origin is labeled $L=0$. On the $y$-axis, a point $\epsilon$ is marked, with $f(x)$ indicated slightly below it. On the $x$-axis, a point $\delta = \epsilon^2$ is marked, with a value $x$ between $0$ and $\delta$. A light yellow rectangular region is shaded between the origin and the point $(\delta, \epsilon)$. Caption: **FIGURE 2.30** $\lim_{x \to 0^+} \sqrt{x} = 0$ in Example 3.]

The functions examined so far have had some kind of limit at each point of interest. In general, that need not be the case.

**EXAMPLE 4** Show that $y = \sin(1/x)$ has no limit as $x$ approaches zero from either side (Figure 2.31).

[Figure 2.31: A graph of the function $y = \sin(1/x)$. The graph consists of a blue line that oscillates rapidly between $y = 1$ and $y = -1$ as $x$ approaches zero from both the left and right. The frequency of the oscillations increases infinitely as the curve gets closer to the $y$-axis ($x=0$). The $y$-axis has tick marks at $1, 0,$ and $-1$. Caption: **FIGURE 2.31** The function $y = \sin(1/x)$ has neither a right-hand nor a left-hand limit as $x$ approaches zero (Example 4). The graph here omits values very near the $y$-axis.]

**Solution** As $x$ approaches zero, its reciprocal, $1/x$, grows without bound and the values of $\sin(1/x)$ cycle repeatedly from $-1$ to $1$. There is no single number $L$ that the function's values stay increasingly close to as $x$ approaches zero. This is true even if we restrict $x$ to positive values or to negative values. The function has neither a right-hand limit nor a left-hand limit at $x = 0$.

### Limits Involving $(\sin \theta)/\theta$

A central fact about $(\sin \theta)/\theta$ is that in radian measure its limit as $\theta \to 0$ is $1$. We can see this in Figure 2.32 and confirm it algebraically using the Sandwich Theorem. You will see the importance of this limit in Section 3.5, where instantaneous rates of change of the trigonometric functions are studied.

[Figure 2.32: A graph of the function $f(\theta) = (\sin \theta)/\theta$. The curve is symmetric about the $y$-axis, having a maximum value of $1$ at $\theta = 0$. As $\theta$ increases or decreases from zero, the curve oscillates with decreasing amplitude, crossing the $\theta$-axis at $\pm \pi, \pm 2\pi, \pm 3\pi$. The horizontal $\theta$-axis is labeled with these values. A note below the axis says "NOT TO SCALE". Caption: **FIGURE 2.32** The graph of $f(\theta) = (\sin \theta)/\theta$ suggests that the right- and left-hand limits as $\theta$ approaches 0 are both 1.]

<!-- PAGE 32 -->

**Chapter 2:** Limits and Continuity

**THEOREM 7—Limit of the Ratio $\sin \theta / \theta$ as $\theta \to 0$**

$$\lim_{\theta \to 0} \frac{\sin \theta}{\theta} = 1 \quad (\theta \text{ in radians}) \quad (1)$$

*Proof.* The plan is to show that the right-hand and left-hand limits are both 1. Then we will know that the two-sided limit is 1 as well.

To show that the right-hand limit is 1, we begin with positive values of $\theta$ less than $\pi/2$ (Figure 2.33). Notice that

Area $\Delta OAP <$ area sector $OAP <$ area $\Delta OAT$.

We can express these areas in terms of $\theta$ as follows:

Area $\Delta OAP = \frac{1}{2} \text{base} \times \text{height} = \frac{1}{2}(1)(\sin \theta) = \frac{1}{2} \sin \theta$

Area sector $OAP = \frac{1}{2} r^2 \theta = \frac{1}{2}(1)^2 \theta = \frac{\theta}{2} \quad (2)$

Area $\Delta OAT = \frac{1}{2} \text{base} \times \text{height} = \frac{1}{2}(1)(\tan \theta) = \frac{1}{2} \tan \theta$.

Thus,

$$\frac{1}{2} \sin \theta < \frac{1}{2} \theta < \frac{1}{2} \tan \theta.$$

[Side note: Equation (2) is where radian measure comes in: The area of sector $OAP$ is $\theta/2$ only if $\theta$ is measured in radians.]

[Figure 2.33: A geometric diagram on a Cartesian coordinate system. A unit circle is centered at the origin $O$. A point $A$ is at $(1, 0)$ on the $x$-axis. A point $P$ lies on the circle in the first quadrant, forming angle $\theta$ with $OA$. A line $PQ$ is dropped perpendicular to the $x$-axis from $P$, with $OQ = \cos \theta$ and $PQ = \sin \theta$. A line $AT$ is tangent to the circle at $A$ and meets the extension of radius $OP$ at point $T$. $OA = 1$ and $AT = \tan \theta$. Three regions are compared: the triangle $OAP$, the circular sector $OAP$, and the larger triangle $OAT$. Caption: **FIGURE 2.33** The figure for the proof of Theorem 7. By definition, $TA/OA = \tan \theta$, but $OA = 1$, so $TA = \tan \theta$.]

This last inequality goes the same way if we divide all three terms by the number $(1/2) \sin \theta$, which is positive, since $0 < \theta < \pi/2$:

$$1 < \frac{\theta}{\sin \theta} < \frac{1}{\cos \theta}.$$

Taking reciprocals reverses the inequalities:

$$1 > \frac{\sin \theta}{\theta} > \cos \theta.$$

Since $\lim_{\theta \to 0^+} \cos \theta = 1$ (Example 11b, Section 2.2), the Sandwich Theorem gives

$$\lim_{\theta \to 0^+} \frac{\sin \theta}{\theta} = 1.$$

To consider the left-hand limit, we recall that $\sin \theta$ and $\theta$ are both odd functions (Section 1.1). Therefore, $f(\theta) = (\sin \theta)/\theta$ is an even function, with a graph symmetric about the $y$-axis (see Figure 2.32). This symmetry implies that the left-hand limit at 0 exists and has the same value as the right-hand limit:

$$\lim_{\theta \to 0^-} \frac{\sin \theta}{\theta} = 1 = \lim_{\theta \to 0^+} \frac{\sin \theta}{\theta},$$

so $\lim_{\theta \to 0} (\sin \theta)/\theta = 1$ by Theorem 6.

**EXAMPLE 5** Show that **(a)** $\lim_{h \to 0} \frac{\cos h - 1}{h} = 0$ and **(b)** $\lim_{x \to 0} \frac{\sin 2x}{5x} = \frac{2}{5}$.

<!-- PAGE 33 -->
## 2.4 One-Sided Limits

**Solution**
(a) Using the half-angle formula $\cos h = 1 - 2\sin^2(h/2)$, we calculate

$$\lim_{h \to 0} \frac{\cos h - 1}{h} = \lim_{h \to 0} \frac{-2\sin^2(h/2)}{h}$$
$$= -\lim_{\theta \to 0} \frac{\sin \theta}{\theta} \sin \theta \quad \text{Let } \theta = h/2.$$
$$= -(1)(0) = 0. \quad \text{Eq. (1) and Example 11a in Section 2.2}$$

(b) Equation (1) does not apply to the original fraction. We need a $2x$ in the denominator, not a $5x$. We produce it by multiplying numerator and denominator by $2/5$:

$$\lim_{x \to 0} \frac{\sin 2x}{5x} = \lim_{x \to 0} \frac{(2/5) \cdot \sin 2x}{(2/5) \cdot 5x}$$
$$= \frac{2}{5} \lim_{x \to 0} \frac{\sin 2x}{2x} \quad \text{Now, Eq. (1) applies with } \theta = 2x.$$
$$= \frac{2}{5}(1) = \frac{2}{5}$$

**EXAMPLE 6** Find $\lim_{t \to 0} \frac{\tan t \sec 2t}{3t}$.

**Solution** From the definition of $\tan t$ and $\sec 2t$, we have

$$\lim_{t \to 0} \frac{\tan t \sec 2t}{3t} = \lim_{t \to 0} \frac{1}{3} \cdot \frac{1}{t} \cdot \frac{\sin t}{\cos t} \cdot \frac{1}{\cos 2t}$$
$$= \frac{1}{3} \lim_{t \to 0} \frac{\sin t}{t} \cdot \frac{1}{\cos t} \cdot \frac{1}{\cos 2t}$$
$$= \frac{1}{3}(1)(1)(1) = \frac{1}{3}. \quad \text{Eq. (1) and Example 11b in Section 2.2}$$

## Exercises 2.4

[Exercises omitted]

<!-- PAGE 34 -->
[Exercises omitted]

<!-- PAGE 35 -->

## 2.5 Continuity

[Exercises omitted]

## 2.5 Continuity

When we plot function values generated in a laboratory or collected in the field, we often connect the plotted points with an unbroken curve to show what the function’s values are likely to have been at the points we did not measure (Figure 2.34). In doing so, we are assuming that we are working with a *continuous function*, so its outputs vary regularly and consistently with the inputs, and do not jump abruptly from one value to another without taking on the values in between. Intuitively, any function $y = f(x)$ whose graph can be sketched over its domain in one unbroken motion is an example of a continuous function. Such functions play an important role in the study of calculus and its applications.

### Continuity at a Point

To understand continuity, it helps to consider a function like that in Figure 2.35, whose limits we investigated in Example 2 in the last section.

[Figure 2.34: A line graph titled "Connecting plotted points by an unbroken curve from experimental data $Q_{1}, Q_{2}, Q_{3}, \dots$ for a falling object." The horizontal axis is labeled "Elapsed time (sec)" ($t$) ranging from 0 to 10. The vertical axis is labeled "Distance fallen (m)" ($y$) ranging from 0 to 500. There are four specific points plotted: $Q_{1}$ (near $t=5, y=125$), $Q_{2}$ (near $t=7, y=250$), $Q_{3}$ (near $t=9, y=375$), and $Q_{4}$ (at $t=10, y=500$). These points are connected by a smooth, upward-curving line starting from the origin $(0,0)$.]

<!-- PAGE 36 -->

**EXAMPLE 1** At which numbers does the function $f$ in Figure 2.35 appear to be not continuous? Explain why. What occurs at other numbers in the domain?

*Solution* First we observe that the domain of the function is the closed interval $[0, 4]$, so we will be considering the numbers $x$ within that interval. From the figure, we notice right away that there are breaks in the graph at the numbers $x = 1$, $x = 2$, and $x = 4$. The breaks appear as jumps, which we identify later as "jump discontinuities." These are numbers for which the function is not continuous, and we discuss each in turn.

#### Numbers at which the graph of $f$ has breaks:

At $x = 1$, the function fails to have a limit. It does have both a left-hand limit, $\lim_{x \to 1^-} f(x) = 0$, as well as a right-hand limit, $\lim_{x \to 1^+} f(x) = 1$, but the limit values are different, resulting in a jump in the graph. The function is not continuous at $x = 1$.

At $x = 2$, the function does have a limit, $\lim_{x \to 2} f(x) = 1$, but the value of the function is $f(2) = 2$. The limit and function values are not the same, so there is a break in the graph and $f$ is not continuous at $x = 2$.

At $x = 4$, the function does have a left-hand limit at this right endpoint, $\lim_{x \to 4^-} f(x) = 1$, but again the value of the function $f(4) = \frac{1}{2}$ differs from the value of the limit. We see again a break in the graph of the function at this endpoint and the function is not continuous from the left.

#### Numbers at which the graph of $f$ has no breaks:

At $x = 0$, the function has a right-hand limit at this left endpoint, $\lim_{x \to 0^+} f(x) = 1$, and the value of the function is the same, $f(0) = 1$. So no break occurs in the graph of the function at this endpoint, and the function is continuous from the right at $x = 0$.

At $x = 3$, the function has a limit, $\lim_{x \to 3} f(x) = 2$. Moreover, the limit is the same value as the function there, $f(3) = 2$. No break occurs in the graph and the function is continuous at $x = 3$.

At all other numbers $x = c$ in the domain, which we have not considered, the function has a limit equal to the value of the function at the point, so $\lim_{x \to c} f(x) = f(c)$. For example, $\lim_{x \to 5/2} f(x) = f(\frac{5}{2}) = \frac{3}{2}$. No breaks appear in the graph of the function at any of these remaining numbers and the function is continuous at each of them.

[Figure 2.35: A coordinate graph of a piecewise function $y = f(x)$ on the domain $[0, 4]$. The x-axis has markings at 0, 1, 2, 3, 4. The y-axis has markings at 1 and 2. 
- At $x=0$, there is a solid point at $(0, 1)$.
- From $x=0$ to $x=1$, there is a horizontal blue line at $y=1$.
- At $x=1$, there is an open circle at $(1, 0)$ and a solid point at $(1, 1)$.
- From $x=1$ to $x=2$, there is a horizontal blue line at $y=1$.
- At $x=2$, there is an open circle at $(2, 1)$ and a solid point at $(2, 2)$.
- From $x=2$ to $x=3$, the graph is a diagonal line segment from $(2, 1)$ toward $(3, 2)$.
- At $x=3$, there is a solid point at $(3, 2)$.
- From $x=3$ to $x=4$, the graph is a diagonal line segment decreasing from $(3, 2)$ toward $x=4$.
- At $x=4$, there is an open circle at $(4, 1)$ and a solid point at $(4, 0.5)$.
Caption: "Figure 2.35 The function is not continuous at $x = 1, x = 2$, and $x = 4$ (Example 1)."]

The following definitions capture the continuity ideas we observed in Example 1.

**DEFINITIONS** Let $c$ be a real number on the $x$-axis.

The function $f$ is **continuous at $c$** if
$$\lim_{x \to c} f(x) = f(c).$$
The function $f$ is **right-continuous at $c$** (or **continuous from the right**) if
$$\lim_{x \to c^+} f(x) = f(c).$$
The function $f$ is **left-continuous at $c$** (or **continuous from the left**) if
$$\lim_{x \to c^-} f(x) = f(c).$$

[Figure 2.36: A coordinate graph illustrating different types of continuity. A curve $y=f(x)$ is shown between $x=a$ and $x=b$.
- At $x=a$ (the left endpoint), the graph has a solid point, labeled "Continuity from the right".
- At $x=c$ (an interior point), the curve is unbroken, labeled "Two-sided continuity".
- At $x=b$ (the right endpoint), the graph has a solid point, labeled "Continuity from the left".
Caption: "Figure 2.36 Continuity at points $a, b,$ and $c$."]

From Theorem 6, it follows immediately that a function $f$ is continuous at an interior point $c$ of its domain if and only if it is both right-continuous and left-continuous at $c$ (Figure 2.36). We say that a function is **continuous over a closed interval $[a, b]$** if it is right-continuous at $a$, left-continuous at $b$, and continuous at all interior points of the interval.

<!-- PAGE 37 -->

## 2.5 Continuity

This definition applies to the infinite closed intervals $[a, \infty)$ and $(-\infty, b]$ as well, but only one endpoint is involved. If a function is not continuous at an interior point $c$ of its domain, we say that $f$ is **discontinuous at $c$**, and that $c$ is a **point of discontinuity** of $f$. Note that a function $f$ can be continuous, right-continuous, or left-continuous only at a point $c$ for which $f(c)$ is defined.

**EXAMPLE 2** The function $f(x) = \sqrt{4 - x^2}$ is continuous over its domain $[-2, 2]$ (Figure 2.37). It is right-continuous at $x = -2$, and left-continuous at $x = 2$.

[**FIGURE 2.37** A function that is continuous over its domain (Example 2). Detailed description: A coordinate plane showing a blue semi-circle centered at the origin with radius 2. The curve starts at $(-2, 0)$, reaches a peak at $(0, 2)$, and ends at $(2, 0)$. The equation $y = \sqrt{4 - x^2}$ is labeled next to the curve.]

**EXAMPLE 3** The unit step function $U(x)$, graphed in Figure 2.38, is right-continuous at $x = 0$, but is neither left-continuous nor continuous there. It has a jump discontinuity at $x = 0$.

[**FIGURE 2.38** A function that has a jump discontinuity at the origin (Example 3). Detailed description: A graph of the unit step function $U(x)$. For $x < 0$, the function value is 0, indicated by a blue line on the negative x-axis with an open circle at $(0, 0)$. For $x \ge 0$, the function value is 1, indicated by a solid blue dot at $(0, 1)$ and a blue line extending to the right. The equation $y = U(x)$ is labeled.]

We summarize continuity at an interior point in the form of a test.

### Continuity Test

A function $f(x)$ is continuous at a point $x = c$ if and only if it meets the following three conditions.

1. $f(c)$ exists ($c$ lies in the domain of $f$).
2. $\lim_{x \to c} f(x)$ exists ($f$ has a limit as $x \to c$).
3. $\lim_{x \to c} f(x) = f(c)$ (the limit equals the function value).

For one-sided continuity and continuity at an endpoint of an interval, the limits in parts 2 and 3 of the test should be replaced by the appropriate one-sided limits.

**EXAMPLE 4** The function $y = [x]$ introduced in Section 1.1 is graphed in Figure 2.39. It is discontinuous at every integer because the left-hand and right-hand limits are not equal as $x \to n$:

$$\lim_{x \to n^-} [x] = n - 1 \quad \text{and} \quad \lim_{x \to n^+} [x] = n.$$

Since $[n] = n$, the greatest integer function is right-continuous at every integer $n$ (but not left-continuous).

The greatest integer function is continuous at every real number other than the integers. For example,

$$\lim_{x \to 1.5} [x] = 1 = [1.5].$$

In general, if $n - 1 < c < n$, $n$ an integer, then

$$\lim_{x \to c} [x] = n - 1 = [c].$$

[**FIGURE 2.39** The greatest integer function is continuous at every noninteger point. It is right-continuous, but not left-continuous, at every integer point (Example 4). Detailed description: A graph showing the "staircase" pattern of the greatest integer function $y = [x]$. It consists of horizontal blue segments. Each segment has a solid blue dot at its left endpoint $(n, n)$ and an open blue circle at its right endpoint $(n+1, n)$. Segments are shown for $y$ values from $-2$ up to $4$.]

Figure 2.40 displays several common types of discontinuities. The function in Figure 2.40a is continuous at $x = 0$. The function in Figure 2.40b would be continuous if it had $f(0) = 1$. The function in Figure 2.40c would be continuous if $f(0)$ were 1 instead of 2. The discontinuity in Figure 2.40c is **removable**. The function has a limit as $x \to 0$, and we can remove the discontinuity by setting $f(0)$ equal to this limit.

The discontinuities in Figure 2.40d through f are more serious: $\lim_{x \to 0} f(x)$ does not exist, and there is no way to improve the situation by changing $f$ at 0. The step function in Figure 2.40d has a **jump discontinuity**: The one-sided limits exist but have different values. The function $f(x) = 1/x^2$ in Figure 2.40e has an **infinite discontinuity**. The function in Figure 2.40f has an **oscillating discontinuity**: It oscillates too much to have a limit as $x \to 0$.

<!-- PAGE 38 -->

96 Chapter 2: Limits and Continuity

[**FIGURE 2.40** The function in (a) is continuous at $x = 0$; the functions in (b) through (f) are not. Detailed description: Six small coordinate graphs labeled (a) through (f).
(a) A continuous blue line $y = f(x)$ passing through the origin.
(b) A blue line $y = f(x)$ with an open circle at $(0, 1)$, indicating the function is undefined at $x = 0$.
(c) A blue line $y = f(x)$ with an open circle at $(0, 1)$ and a separate solid blue dot at $(0, 2)$.
(d) A jump discontinuity: a horizontal blue line at $y = 0$ for $x \le 0$ ending in a solid dot at the origin, and a horizontal blue line at $y = 1$ for $x > 0$ starting with an open circle at $(0, 1)$.
(e) The graph of $y = f(x) = 1/x^2$, showing two symmetric blue curves in the upper quadrants that approach the y-axis as a vertical asymptote.
(f) The graph of $y = \sin(1/x)$, showing a blue curve that oscillates infinitely rapidly between $y = 1$ and $y = -1$ as $x$ approaches 0 from both sides.]

### Continuous Functions

Generally, we want to describe the continuity behavior of a function throughout its entire domain, not only at a single point. We know how to do that if the domain is a closed interval. In the same way, we define a **continuous function** as one that is continuous at every point in its domain. This is a property of the *function*. A function always has a specified domain, so if we change the domain, we change the function, and this may change its continuity property as well. If a function is discontinuous at one or more points of its domain, we say it is a **discontinuous function**.

**EXAMPLE 5**
(a) The function $y = 1/x$ (Figure 2.41) is a continuous function because it is continuous at every point of its domain. It has a point of discontinuity at $x = 0$, however, because it is not defined there; that is, it is discontinuous on any interval containing $x = 0$.
(b) The identity function $f(x) = x$ and constant functions are continuous everywhere by Example 3, Section 2.3.

Algebraic combinations of continuous functions are continuous wherever they are defined.

[**FIGURE 2.41** The function $y = 1/x$ is continuous over its natural domain. It has a point of discontinuity at the origin, so it is discontinuous on any interval containing $x = 0$ (Example 5). Detailed description: A coordinate plane showing the graph of $y = 1/x$. It features two blue hyperbolic curves: one in the first quadrant and one in the third quadrant, with the $x$ and $y$ axes as asymptotes.]

#### THEOREM 8—Properties of Continuous Functions
If the functions $f$ and $g$ are continuous at $x = c$, then the following algebraic combinations are continuous at $x = c$.

1. **Sums:** $f + g$
2. **Differences:** $f - g$
3. **Constant multiples:** $k \cdot f$, for any number $k$
4. **Products:** $f \cdot g$
5. **Quotients:** $f/g$, provided $g(c) \neq 0$
6. **Powers:** $f^n$, $n$ a positive integer
7. **Roots:** $\sqrt[n]{f}$, provided it is defined on an open interval containing $c$, where $n$ is a positive integer

<!-- PAGE 39 -->

## 2.5 Continuity

Most of the results in Theorem 8 follow from the limit rules in Theorem 1, Section 2.2. For instance, to prove the sum property we have

$$\lim_{x \to c} (f + g)(x) = \lim_{x \to c} (f(x) + g(x))$$
$$= \lim_{x \to c} f(x) + \lim_{x \to c} g(x) \quad \text{Sum Rule, Theorem 1}$$
$$= f(c) + g(c) \quad \text{Continuity of } f, g \text{ at } c$$
$$= (f + g)(c).$$

This shows that $f + g$ is continuous.

**EXAMPLE 6**
(a) Every polynomial $P(x) = a_n x^n + a_{n-1} x^{n-1} + \dots + a_0$ is continuous because $\lim_{x \to c} P(x) = P(c)$ by Theorem 2, Section 2.2.
(b) If $P(x)$ and $Q(x)$ are polynomials, then the rational function $P(x)/Q(x)$ is continuous wherever it is defined ($Q(c) \neq 0$) by Theorem 3, Section 2.2.

**EXAMPLE 7** The function $f(x) = |x|$ is continuous. If $x > 0$, we have $f(x) = x$, a polynomial. If $x < 0$, we have $f(x) = -x$, another polynomial. Finally, at the origin, $\lim_{x \to 0} |x| = 0 = |0|$.

The functions $y = \sin x$ and $y = \cos x$ are continuous at $x = 0$ by Example 11 of Section 2.2. Both functions are, in fact, continuous everywhere (see Exercise 70). It follows from Theorem 8 that all six trigonometric functions are then continuous wherever they are defined. For example, $y = \tan x$ is continuous on $\dots \cup (-\pi/2, \pi/2) \cup (\pi/2, 3\pi/2) \cup \dots$.

### Inverse Functions and Continuity

The inverse function of any function continuous on an interval is continuous over its domain. This result is suggested by the observation that the graph of $f^{-1}$, being the reflection of the graph of $f$ across the line $y = x$, cannot have any breaks in it when the graph of $f$ has no breaks. A rigorous proof that $f^{-1}$ is continuous whenever $f$ is continuous on an interval is given in more advanced texts. It follows that the inverse trigonometric functions are all continuous over their domains.

We defined the exponential function $y = a^x$ in Section 1.5 informally by its graph. Recall that the graph was obtained from the graph of $y = a^x$ for $x$ a rational number by "filling in the holes" at the irrational points $x$, so the function $y = a^x$ was defined to be continuous over the entire real line. The inverse function $y = \log_a x$ is also continuous. In particular, the natural exponential function $y = e^x$ and the natural logarithm function $y = \ln x$ are both continuous over their domains.

### Composites

All composites of continuous functions are continuous. The idea is that if $f(x)$ is continuous at $x = c$ and $g(x)$ is continuous at $x = f(c)$, then $g \circ f$ is continuous at $x = c$ (Figure 2.42). In this case, the limit as $x \to c$ is $g(f(c))$.

[Figure 2.42: A diagram titled "Composites of continuous functions are continuous." It illustrates the mapping of points through functions $f$ and $g$. A point $c$ on a horizontal line is mapped by an arrow labeled $f$ to a point $f(c)$ on a second horizontal line. This mapping is labeled "Continuous at $c$". The point $f(c)$ is then mapped by an arrow labeled $g$ to a point $g(f(c))$ on a third horizontal line. This mapping is labeled "Continuous at $f(c)$". A large overhead arc labeled $g \circ f$ connects point $c$ directly to $g(f(c))$, labeled as "Continuous at $c$".]

<!-- PAGE 40 -->

**THEOREM 9—Composite of Continuous Functions** If $f$ is continuous at $c$ and $g$ is continuous at $f(c)$, then the composite $g \circ f$ is continuous at $c$.

Intuitively, Theorem 9 is reasonable because if $x$ is close to $c$, then $f(x)$ is close to $f(c)$, and since $g$ is continuous at $f(c)$, it follows that $g(f(x))$ is close to $g(f(c))$.

The continuity of composites holds for any finite number of functions. The only requirement is that each function be continuous where it is applied. For an outline of a proof of Theorem 9, see Exercise 6 in Appendix 4.

**EXAMPLE 8** Show that the following functions are continuous on their natural domains.
(a) $y = \sqrt{x^2 - 2x - 5}$
(b) $y = \frac{x^{2/3}}{1 + x^4}$
(c) $y = \left| \frac{x - 2}{x^2 - 2} \right|$
(d) $y = \left| \frac{x \sin x}{x^2 + 2} \right|$

**Solution**
(a) The square root function is continuous on $[0, \infty)$ because it is a root of the continuous identity function $f(x) = x$ (Part 7, Theorem 8). The given function is then the composite of the polynomial $f(x) = x^2 - 2x - 5$ with the square root function $g(t) = \sqrt{t}$, and is continuous on its natural domain.
(b) The numerator is the cube root of the identity function squared; the denominator is an everywhere-positive polynomial. Therefore, the quotient is continuous.
(c) The quotient $(x - 2)/(x^2 - 2)$ is continuous for all $x \neq \pm \sqrt{2}$, and the function is the composition of this quotient with the continuous absolute value function (Example 7).
(d) Because the sine function is everywhere-continuous (Exercise 70), the numerator term $x \sin x$ is the product of continuous functions, and the denominator term $x^2 + 2$ is an everywhere-positive polynomial. The given function is the composite of a quotient of continuous functions with the continuous absolute value function (Figure 2.43).

[Figure 2.43: A graph of the function $y = |(x \sin x)/(x^2 + 2)|$. The y-axis is scaled from 0 to 0.4. The x-axis shows ticks at $-2\pi, -\pi, 0, \pi, 2\pi$. The graph consists of a series of arches above the x-axis, symmetric about the y-axis. The function is zero at $x=0, \pm\pi, \pm 2\pi$. The peaks of the arches decrease in height as $|x|$ increases. The caption reads: "FIGURE 2.43 The graph suggests that $y = |(x \sin x)/(x^2 + 2)|$ is continuous (Example 8d)."]

Theorem 9 is actually a consequence of a more general result, which we now state and prove.

**THEOREM 10—Limits of Continuous Functions** If $g$ is continuous at the point $b$ and $\lim_{x \to c} f(x) = b$, then
$$\lim_{x \to c} g(f(x)) = g(b) = g(\lim_{x \to c} f(x)).$$

*Proof.* Let $\epsilon > 0$ be given. Since $g$ is continuous at $b$, there exists a number $\delta_1 > 0$ such that
$$|g(y) - g(b)| < \epsilon \text{ whenever } 0 < |y - b| < \delta_1.$$
Since $\lim_{x \to c} f(x) = b$, there exists a $\delta > 0$ such that
$$|f(x) - b| < \delta_1 \text{ whenever } 0 < |x - c| < \delta.$$
If we let $y = f(x)$, we then have that
$$|y - b| < \delta_1 \text{ whenever } 0 < |x - c| < \delta,$$
which implies from the first statement that $|g(y) - g(b)| = |g(f(x)) - g(b)| < \epsilon$ whenever $0 < |x - c| < \delta$. From the definition of limit, this proves that $\lim_{x \to c} g(f(x)) = g(b)$. ■

<!-- PAGE 41 -->

## 2.5 Continuity

**EXAMPLE 9** As an application of Theorem 10, we have the following calculations.

(a) $\lim_{x \to \pi/2} \cos \left( 2x + \sin \left( \frac{3\pi}{2} + x \right) \right) = \cos \left( \lim_{x \to \pi/2} 2x + \lim_{x \to \pi/2} \sin \left( \frac{3\pi}{2} + x \right) \right)$
$= \cos (\pi + \sin 2\pi) = \cos \pi = -1$.

(b) $\lim_{x \to 1} \sin^{-1} \left( \frac{1-x}{1-x^2} \right) = \sin^{-1} \left( \lim_{x \to 1} \frac{1-x}{1-x^2} \right)$ [Arcsine is continuous.]
$= \sin^{-1} \left( \lim_{x \to 1} \frac{1}{1+x} \right)$ [Cancel common factor $(1-x)$.]
$= \sin^{-1} \frac{1}{2} = \frac{\pi}{6}$

(c) $\lim_{x \to 0} \sqrt{x+1} e^{\tan x} = \lim_{x \to 0} \sqrt{x+1} \cdot \exp \left( \lim_{x \to 0} \tan x \right)$ [Exponential is continuous.]
$= 1 \cdot e^0 = 1$

[Note: We sometimes denote $e^u$ by $\exp u$ when $u$ is a complicated mathematical expression.]

### Intermediate Value Theorem for Continuous Functions

Functions that are continuous on intervals have properties that make them particularly useful in mathematics and its applications. One of these is the *Intermediate Value Property*. A function is said to have the **Intermediate Value Property** if whenever it takes on two values, it also takes on all the values in between.

**THEOREM 11—The Intermediate Value Theorem for Continuous Functions** If $f$ is a continuous function on a closed interval $[a, b]$, and if $y_0$ is any value between $f(a)$ and $f(b)$, then $y_0 = f(c)$ for some $c$ in $[a, b]$.

[Figure Description: A graph shows a continuous blue curve $y = f(x)$ on a coordinate plane. The x-axis is labeled with points $a$, $c$, and $b$. The y-axis is labeled with $f(a)$, $y_0$, and $f(b)$. A horizontal dashed line starts from $y_0$ on the y-axis and intersects the curve at a point. A vertical dashed line drops from this intersection point to the x-axis at $c$. The interval $[a, b]$ is highlighted on the x-axis.]

Theorem 11 says that continuous functions over finite closed intervals have the Intermediate Value Property. Geometrically, the Intermediate Value Theorem says that any horizontal line $y = y_0$ crossing the y-axis between the numbers $f(a)$ and $f(b)$ will cross the curve $y = f(x)$ at least once over the interval $[a, b]$.

The proof of the Intermediate Value Theorem depends on the completeness property of the real number system (Appendix 7) and can be found in more advanced texts.

The continuity of $f$ on the interval is essential to Theorem 11. If $f$ is discontinuous at even one point of the interval, the theorem's conclusion may fail, as it does for the function graphed in Figure 2.44 (choose $y_0$ as any number between 2 and 3).

[FIGURE 2.44 Description: A coordinate graph shows a piecewise function $f(x)$. For $1 \le x < 2$, the function is a blue line segment starting at $(1, 0)$ and ending at an open circle at $(2, 2)$. For $2 \le x \le 4$, the function is a horizontal blue line segment at $y=3$ starting from a closed circle at $(2, 3)$ and ending at $(4, 3)$. The gap between $y=2$ and $y=3$ is not covered.]

**FIGURE 2.44** The function
$$f(x) = \begin{cases} 2x - 2, & 1 \le x < 2 \\ 3, & 2 \le x \le 4 \end{cases}$$
does not take on all values between $f(1) = 0$ and $f(4) = 3$; it misses all the values between 2 and 3.

**A Consequence for Graphing: Connectedness** Theorem 11 implies that the graph of a function continuous on an interval cannot have any breaks over the interval. It will be **connected**—a single, unbroken curve. It will not have jumps like the graph of the greatest integer function (Figure 2.39), or separate branches like the graph of $1/x$ (Figure 2.41).

<!-- PAGE 42 -->

**A Consequence for Root Finding** We call a solution of the equation $f(x) = 0$ a **root** of the equation or **zero** of the function $f$. The Intermediate Value Theorem tells us that if $f$ is continuous, then any interval on which $f$ changes sign contains a zero of the function.

In practical terms, when we see the graph of a continuous function cross the horizontal axis on a computer screen, we know it is not stepping across. There really is a point where the function's value is zero.

**EXAMPLE 10** Show that there is a root of the equation $x^3 - x - 1 = 0$ between 1 and 2.

**Solution** Let $f(x) = x^3 - x - 1$. Since $f(1) = 1 - 1 - 1 = -1 < 0$ and $f(2) = 2^3 - 2 - 1 = 5 > 0$, we see that $y_0 = 0$ is a value between $f(1)$ and $f(2)$. Since $f$ is continuous, the Intermediate Value Theorem says there is a zero of $f$ between 1 and 2. Figure 2.45 shows the result of zooming in to locate the root near $x = 1.32$.

[FIGURE 2.45 Description: Four graphs (labeled a, b, c, d) show a function $f(x) = x^3 - x - 1$ and the process of zooming in on its zero.
- (a) shows the curve on a standard scale from $x = -1$ to $2$ and $y = -2$ to $5$. The curve crosses the x-axis between 1 and 2.
- (b) zooms in to $x$ between $1$ and $1.6$, $y$ between $-1$ and $1$.
- (c) zooms in further to $x$ between $1.320$ and $1.330$, $y$ between $-0.02$ and $0.02$.
- (d) shows a very tight zoom to $x$ between $1.3240$ and $1.3248$, $y$ between $-0.003$ and $0.003$. The root is shown crossing the axis near $1.3247$.]

**FIGURE 2.45** Zooming in on a zero of the function $f(x) = x^3 - x - 1$. The zero is near $x = 1.3247$ (Example 10).

**EXAMPLE 11** Use the Intermediate Value Theorem to prove that the equation
$$\sqrt{2x + 5} = 4 - x^2$$
has a solution (Figure 2.46).

**Solution** We rewrite the equation as
$$\sqrt{2x + 5} + x^2 = 4,$$
and set $f(x) = \sqrt{2x + 5} + x^2$. Now $g(x) = \sqrt{2x + 5}$ is continuous on the interval $[-5/2, \infty)$ since it is the composite of the square root function with the nonnegative linear function $y = 2x + 5$. Then $f$ is the sum of the function $g$ and the quadratic function $y = x^2$, and the quadratic function is continuous for all values of $x$. It follows that $f(x) = \sqrt{2x + 5} + x^2$ is continuous on the interval $[-5/2, \infty)$. By trial and error, we find the function values $f(0) = \sqrt{5} \approx 2.24$ and $f(2) = \sqrt{9} + 4 = 7$, and note that $f$ is also continuous on the finite closed interval $[0, 2] \subset [-5/2, \infty)$. Since the value $y_0 = 4$ is between the numbers 2.24 and 7, by the Intermediate Value Theorem there is a number $c \in [0, 2]$ such that $f(c) = 4$. That is, the number $c$ solves the original equation.

[FIGURE 2.46 Description: A graph on a coordinate plane showing two curves intersecting. The first curve is a red concave down parabola labeled $y = 4 - x^2$. The second curve is a blue radical function labeled $y = \sqrt{2x + 5}$. They intersect at a point labeled $(c, f(c))$ or simply by a vertical dashed line down to $x = c$. The y-axis coordinate of the intersection is marked as 4. Labels on the axes include $0, 1, 2, 3, 4$ on the y-axis and $0, 2$ on the x-axis.]

**FIGURE 2.46** The curves $y = \sqrt{2x + 5}$ and $y = 4 - x^2$ have the same value at $x = c$ where $\sqrt{2x + 5} = 4 - x^2$ (Example 11).

<!-- PAGE 43 -->
## 2.5 Continuity 101

### Continuous Extension to a Point

Sometimes the formula that describes a function $f$ does not make sense at a point $x = c$. It might nevertheless be possible to extend the domain of $f$, to include $x = c$, creating a new function that is continuous at $x = c$. For example, the function $y = f(x) = (\sin x)/x$ is continuous at every point except $x = 0$, since the origin is not in its domain. Since $y = (\sin x)/x$ has a finite limit as $x \to 0$ (Theorem 7), we can extend the function's domain to include the point $x = 0$ in such a way that the extended function is continuous at $x = 0$. We define the new function

$$F(x) = \begin{cases} \frac{\sin x}{x}, & x \neq 0 \\ 1, & x = 0 \end{cases}$$

The function $F(x)$ is continuous at $x = 0$ because

$$\lim_{x \to 0} \frac{\sin x}{x} = F(0),$$

so it meets the requirements for continuity (Figure 2.47).

[Figure 2.47 contains two graphs, (a) and (b), plotted on a Cartesian coordinate system with $x$-axes labeled from $-\pi/2$ to $\pi/2$ and $y$-axes showing a peak at 1. 
Graph (a) shows the function $f(x) = (\sin x)/x$. The curve is symmetric across the $y$-axis, starting at $(-\pi/2, 2/\pi)$, reaching toward $(0, 1)$, and ending at $(\pi/2, 2/\pi)$. There is an open circle (a hole) at the point $(0, 1)$, indicating the function is undefined there. 
Graph (b) shows the function $F(x)$. The curve is identical to graph (a), but the hole at $(0, 1)$ is replaced by a solid blue dot, indicating the function is defined and continuous at $x = 0$. 
Annotations include coordinates $(-\pi/2, 2/\pi)$, $(0, 1)$, and $(\pi/2, 2/\pi)$.]

**FIGURE 2.47** The graph (a) of $f(x) = (\sin x)/x$ for $-\pi/2 \le x \le \pi/2$ does not include the point $(0, 1)$ because the function is not defined at $x = 0$. (b) We can remove the discontinuity from the graph by defining the new function $F(x)$ with $F(0) = 1$ and $F(x) = f(x)$ everywhere else. Note that $F(0) = \lim_{x \to 0} f(x)$.

More generally, a function (such as a rational function) may have a limit at a point where it is not defined. If $f(c)$ is not defined, but $\lim_{x \to c} f(x) = L$ exists, we can define a new function $F(x)$ by the rule

$$F(x) = \begin{cases} f(x), & \text{if } x \text{ is in the domain of } f \\ L, & \text{if } x = c \end{cases}$$

The function $F$ is continuous at $x = c$. It is called the **continuous extension** of $f$ to $x = c$. For rational functions $f$, continuous extensions are often found by canceling common factors in the numerator and denominator.

**EXAMPLE 12** Show that

$$f(x) = \frac{x^2 + x - 6}{x^2 - 4}, x \neq 2$$

has a continuous extension to $x = 2$, and find that extension.

**Solution** Although $f(2)$ is not defined, if $x \neq 2$ we have

$$f(x) = \frac{x^2 + x - 6}{x^2 - 4} = \frac{(x - 2)(x + 3)}{(x - 2)(x + 2)} = \frac{x + 3}{x + 2}.$$

The new function

$$F(x) = \frac{x + 3}{x + 2}$$

[Figure 2.48 contains two graphs, (a) and (b), plotted on a Cartesian coordinate system with $x$-axes from $-1$ to $4$ and $y$-axes from $0$ to $2$.
Graph (a) shows $y = \frac{x^2+x-6}{x^2-4}$. The curve passes through $(0, 1.5)$ and approaches $(2, 1.25)$. There is an open circle (a hole) at the point $(2, 1.25)$.
Graph (b) shows $y = \frac{x+3}{x+2}$. The curve is identical but the hole at $(2, 1.25)$ is filled, representing a continuous line.
Annotations show the equations for each graph and specific points like $(0, 1.5)$ and $(2, 1.25)$ marked as $5/4$.]

**FIGURE 2.48** (a) The graph of $f(x)$ and (b) the graph of its continuous extension $F(x)$ (Example 12).

<!-- PAGE 44 -->
102 Chapter 2: Limits and Continuity

is equal to $f(x)$ for $x \neq 2$, but is continuous at $x = 2$, having there the value of $5/4$. Thus $F$ is the continuous extension of $f$ to $x = 2$, and

$$\lim_{x \to 2} \frac{x^2 + x - 6}{x^2 - 4} = \lim_{x \to 2} f(x) = \frac{5}{4}.$$

The graph of $f$ is shown in Figure 2.48. The continuous extension $F$ has the same graph except with no hole at $(2, 5/4)$. Effectively, $F$ is the function $f$ with its point of discontinuity at $x = 2$ removed.

## Exercises 2.5

[Exercises omitted]

<!-- PAGE 45 -->
[Exercises omitted]

<!-- PAGE 46 -->
[Exercises omitted]

## 2.6 Limits Involving Infinity; Asymptotes of Graphs

In this section we investigate the behavior of a function when the magnitude of the independent variable $x$ becomes increasingly large, or $x \to \pm\infty$. We further extend the concept of limit to infinite limits, which are not limits as before, but rather a new use of the term limit. Infinite limits provide useful symbols and language for describing the behavior of functions whose values become arbitrarily large in magnitude. We use these limit ideas to analyze the graphs of functions having horizontal or vertical asymptotes.

### Finite Limits as $x \to \pm\infty$

The symbol for infinity $(\infty)$ does not represent a real number. We use $\infty$ to describe the behavior of a function when the values in its domain or range outgrow all finite bounds. For example, the function $f(x) = 1/x$ is defined for all $x \neq 0$ (Figure 2.49). When $x$ is positive and becomes increasingly large, $1/x$ becomes increasingly small. When $x$ is negative and its magnitude becomes increasingly large, $1/x$ again becomes small. We summarize these observations by saying that $f(x) = 1/x$ has limit 0 as $x \to \infty$ or $x \to -\infty$, or that 0 is a limit of $f(x) = 1/x$ at infinity and negative infinity. Here are precise definitions.

[Figure 2.49: A Cartesian coordinate graph showing the function $y = 1/x$. The graph consists of two hyperbola branches. One branch is in the first quadrant, starting near the positive $y$-axis and curving downward to approach the positive $x$-axis as $x$ increases. The second branch is in the third quadrant, starting near the negative $y$-axis and curving upward to approach the negative $x$-axis as $x$ decreases. The $x$-axis has tick marks labeled -1, 1, 2, 3, 4. The $y$-axis has tick marks labeled -1, 1, 2, 3, 4. The text "$y = \frac{1}{x}$" is labeled next to the first-quadrant branch. The caption reads: "FIGURE 2.49 The graph of $y = 1/x$ approaches 0 as $x \to \infty$ or $x \to -\infty$."]

<!-- PAGE 47 -->

## 2.6 Limits Involving Infinity; Asymptotes of Graphs

### DEFINITIONS

**1.** We say that $f(x)$ has the **limit $L$ as $x$ approaches infinity** and write
$$\lim_{x \to \infty} f(x) = L$$
if, for every number $\epsilon > 0$, there exists a corresponding number $M$ such that for all $x$
$$x > M \Rightarrow |f(x) - L| < \epsilon.$$

**2.** We say that $f(x)$ has the **limit $L$ as $x$ approaches minus infinity** and write
$$\lim_{x \to -\infty} f(x) = L$$
if, for every number $\epsilon > 0$, there exists a corresponding number $N$ such that for all $x$
$$x < N \Rightarrow |f(x) - L| < \epsilon.$$

Intuitively, $\lim_{x \to \infty} f(x) = L$ if, as $x$ moves increasingly far from the origin in the positive direction, $f(x)$ gets arbitrarily close to $L$. Similarly, $\lim_{x \to -\infty} f(x) = L$ if, as $x$ moves increasingly far from the origin in the negative direction, $f(x)$ gets arbitrarily close to $L$.

The strategy for calculating limits of functions as $x \to \pm \infty$ is similar to the one for finite limits in Section 2.2. There we first found the limits of the constant and identity functions $y = k$ and $y = x$. We then extended these results to other functions by applying Theorem 1 on limits of algebraic combinations. Here we do the same thing, except that the starting functions are $y = k$ and $y = 1/x$ instead of $y = k$ and $y = x$.

The basic facts to be verified by applying the formal definition are
$$\lim_{x \to \pm \infty} k = k \quad \text{and} \quad \lim_{x \to \pm \infty} \frac{1}{x} = 0. \quad (1)$$

We prove the second result in Example 1, and leave the first to Exercises 87 and 88.

**EXAMPLE 1** Show that
(a) $\lim_{x \to \infty} \frac{1}{x} = 0$
(b) $\lim_{x \to -\infty} \frac{1}{x} = 0$.

**Solution**
(a) Let $\epsilon > 0$ be given. We must find a number $M$ such that for all $x$
$$x > M \Rightarrow \left| \frac{1}{x} - 0 \right| = \left| \frac{1}{x} \right| < \epsilon.$$
The implication will hold if $M = 1/\epsilon$ or any larger positive number (Figure 2.50). This proves $\lim_{x \to \infty} (1/x) = 0$.

(b) Let $\epsilon > 0$ be given. We must find a number $N$ such that for all $x$
$$x < N \Rightarrow \left| \frac{1}{x} - 0 \right| = \left| \frac{1}{x} \right| < \epsilon.$$
The implication will hold if $N = -1/\epsilon$ or any number less than $-1/\epsilon$ (Figure 2.50). This proves $\lim_{x \to -\infty} (1/x) = 0$.

[Figure 2.50 Description: A graph shows the function $y = 1/x$ plotted on a Cartesian coordinate system. A horizontal band of width $2\epsilon$ is shaded in light blue, centered on the x-axis (from $y = -\epsilon$ to $y = \epsilon$). On the right side, a vertical dashed line marks $M = 1/\epsilon$; for $x > M$, the curve $y = 1/x$ stays within the blue band. A callout states: "No matter what positive number $\epsilon$ is, the graph enters this band at $x = 1/\epsilon$ and stays." On the left side, a vertical dashed line marks $N = -1/\epsilon$; for $x < N$, the curve stays within the blue band. A callout states: "No matter what positive number $\epsilon$ is, the graph enters this band at $x = -1/\epsilon$ and stays."]

**FIGURE 2.50** The geometry behind the argument in Example 1.

Limits at infinity have properties similar to those of finite limits.

**THEOREM 12** All the Limit Laws in Theorem 1 are true when we replace $\lim_{x \to c}$ by $\lim_{x \to \infty}$ or $\lim_{x \to -\infty}$. That is, the variable $x$ may approach a finite number $c$ or $\pm \infty$.

<!-- PAGE 48 -->

**EXAMPLE 2** The properties in Theorem 12 are used to calculate limits in the same way as when $x$ approaches a finite number $c$.

(a) $\lim_{x \to \infty} \left( 5 + \frac{1}{x} \right) = \lim_{x \to \infty} 5 + \lim_{x \to \infty} \frac{1}{x} = 5 + 0 = 5$ (Sum Rule; Known limits)

(b) $\lim_{x \to -\infty} \frac{\pi\sqrt{3}}{x^2} = \lim_{x \to -\infty} \pi\sqrt{3} \cdot \frac{1}{x} \cdot \frac{1}{x}$
$= \lim_{x \to -\infty} \pi\sqrt{3} \cdot \lim_{x \to -\infty} \frac{1}{x} \cdot \lim_{x \to -\infty} \frac{1}{x}$ (Product Rule)
$= \pi\sqrt{3} \cdot 0 \cdot 0 = 0$ (Known limits)

### Limits at Infinity of Rational Functions

To determine the limit of a rational function as $x \to \pm \infty$, we first divide the numerator and denominator by the highest power of $x$ in the denominator. The result then depends on the degrees of the polynomials involved.

**EXAMPLE 3** These examples illustrate what happens when the degree of the numerator is less than or equal to the degree of the denominator.

(a) $\lim_{x \to \infty} \frac{5x^2 + 8x - 3}{3x^2 + 2} = \lim_{x \to \infty} \frac{5 + (8/x) - (3/x^2)}{3 + (2/x^2)}$ (Divide numerator and denominator by $x^2$)
$= \frac{5 + 0 - 0}{3 + 0} = \frac{5}{3}$ (See Fig. 2.51)

(b) $\lim_{x \to -\infty} \frac{11x + 2}{2x^3 - 1} = \lim_{x \to -\infty} \frac{(11/x^2) + (2/x^3)}{2 - (1/x^3)}$ (Divide numerator and denominator by $x^3$)
$= \frac{0 + 0}{2 - 0} = 0$ (See Fig. 2.52)

Cases for which the degree of the numerator is greater than the degree of the denominator are illustrated in Examples 10 and 14.

### Horizontal Asymptotes

If the distance between the graph of a function and some fixed line approaches zero as a point on the graph moves increasingly far from the origin, we say that the graph approaches the line asymptotically and that the line is an **asymptote** of the graph.

Looking at $f(x) = 1/x$ (see Figure 2.49), we observe that the x-axis is an asymptote of the curve on the right because
$$\lim_{x \to \infty} \frac{1}{x} = 0$$
and on the left because
$$\lim_{x \to -\infty} \frac{1}{x} = 0.$$
We say that the x-axis is a **horizontal asymptote** of the graph of $f(x) = 1/x$.

**DEFINITION** A line $y = b$ is a **horizontal asymptote** of the graph of a function $y = f(x)$ if either
$$\lim_{x \to \infty} f(x) = b \quad \text{or} \quad \lim_{x \to -\infty} f(x) = b.$$

[Figure 2.51 Description: Graph of the rational function $y = \frac{5x^2 + 8x - 3}{3x^2 + 2}$. The curve has a y-intercept at -1.5. As $x \to \infty$ and $x \to -\infty$, the curve levels off. A horizontal dashed red line is drawn at $y = 5/3$. The caption reads: "The graph of the function in Example 3a. The graph approaches the line $y = 5/3$ as $|x|$ increases." The plot is marked "NOT TO SCALE".]

[Figure 2.52 Description: Graph of the rational function $y = \frac{11x + 2}{2x^3 - 1}$. The graph has a vertical asymptote near $x = 0.8$. On the right side, the curve decreases towards the x-axis. On the left side, the curve increases from negative values toward the x-axis. The x-axis ($y=0$) acts as a horizontal asymptote. The caption reads: "The graph of the function in Example 3b. The graph approaches the x-axis as $|x|$ increases."]

<!-- PAGE 49 -->

## 2.6 Limits Involving Infinity; Asymptotes of Graphs

The graph of the function

$$f(x) = \frac{5x^2 + 8x - 3}{3x^2 + 2}$$

sketched in Figure 2.51 (Example 3a) has the line $y = 5/3$ as a horizontal asymptote on both the right and the left because

$$\lim_{x \to \infty} f(x) = \frac{5}{3} \text{ and } \lim_{x \to -\infty} f(x) = \frac{5}{3}.$$

**EXAMPLE 4** Find the horizontal asymptotes of the graph of

$$f(x) = \frac{x^3 - 2}{|x|^3 + 1}.$$

**Solution** We calculate the limits as $x \to \pm\infty$.

For $x \ge 0$: $\lim_{x \to \infty} \frac{x^3 - 2}{|x|^3 + 1} = \lim_{x \to \infty} \frac{x^3 - 2}{x^3 + 1} = \lim_{x \to \infty} \frac{1 - (2/x^3)}{1 + (1/x^3)} = 1$.

For $x < 0$: $\lim_{x \to -\infty} \frac{x^3 - 2}{|x|^3 + 1} = \lim_{x \to -\infty} \frac{x^3 - 2}{(-x)^3 + 1} = \lim_{x \to -\infty} \frac{1 - (2/x^3)}{-1 + (1/x^3)} = -1$.

The horizontal asymptotes are $y = -1$ and $y = 1$. The graph is displayed in Figure 2.53. Notice that the graph crosses the horizontal asymptote $y = -1$ for a positive value of $x$.

[Figure 2.53: A coordinate plane showing the graph of $f(x) = \frac{x^3 - 2}{|x|^3 + 1}$. The x-axis ranges from negative to positive, and the y-axis ranges from $-2$ to $2$. There are two horizontal dashed lines labeled $y = 1$ and $y = -1$. The blue curve approaches $y = 1$ as $x \to \infty$ and approaches $y = -1$ as $x \to -\infty$. The curve passes through $(0, -2)$ and crosses the line $y = -1$ once for a positive $x$ value before curving back down towards the asymptote. Caption: FIGURE 2.53 The graph of the function in Example 4 has two horizontal asymptotes.]

**EXAMPLE 5** The $x$-axis (the line $y = 0$) is a horizontal asymptote of the graph of $y = e^x$ because

$$\lim_{x \to -\infty} e^x = 0.$$

To see this, we use the definition of a limit as $x$ approaches $-\infty$. So let $\epsilon > 0$ be given, but arbitrary. We must find a constant $N$ such that for all $x$,

$$x < N \implies |e^x - 0| < \epsilon.$$

Now $|e^x - 0| = e^x$, so the condition that needs to be satisfied whenever $x < N$ is

$$e^x < \epsilon.$$

Let $x = N$ be the number where $e^x = \epsilon$. Since $e^x$ is an increasing function, if $x < N$, then $e^x < \epsilon$. We find $N$ by taking the natural logarithm of both sides of the equation $e^N = \epsilon$, so $N = \ln \epsilon$ (see Figure 2.54). With this value of $N$ the condition is satisfied, and we conclude that $\lim_{x \to -\infty} e^x = 0$.

[Figure 2.54: A coordinate plane showing the graph of $y = e^x$. The curve is blue, starting very close to the x-axis for negative $x$ values and rising sharply as $x$ increases, passing through $(0, 1)$. A horizontal line at $y = \epsilon$ intersects the curve at a point. A vertical dashed line from this point meets the x-axis at $x = N = \ln \epsilon$. The area $x < N$ corresponds to the part of the curve where $y < \epsilon$. Caption: FIGURE 2.54 The graph of $y = e^x$ approaches the x-axis as $x \to -\infty$ (Example 5).]

**EXAMPLE 6** Find **(a)** $\lim_{x \to \infty} \sin(1/x)$ and **(b)** $\lim_{x \to \pm\infty} x \sin(1/x)$.

**Solution**
**(a)** We introduce the new variable $t = 1/x$. From Example 1, we know that $t \to 0^+$ as $x \to \infty$ (see Figure 2.49). Therefore,

$$\lim_{x \to \infty} \sin \frac{1}{x} = \lim_{t \to 0^+} \sin t = 0.$$

<!-- PAGE 50 -->

108 Chapter 2: Limits and Continuity

**(b)** We calculate the limits as $x \to \infty$ and $x \to -\infty$:

$$\lim_{x \to \infty} x \sin \frac{1}{x} = \lim_{t \to 0^+} \frac{\sin t}{t} = 1 \text{ and } \lim_{x \to -\infty} x \sin \frac{1}{x} = \lim_{t \to 0^-} \frac{\sin t}{t} = 1.$$

The graph is shown in Figure 2.55, and we see that the line $y = 1$ is a horizontal asymptote.

[Figure 2.55: A coordinate plane showing the graph of $y = x \sin(1/x)$. The curve is blue and symmetrical about the y-axis. As $x$ increases or decreases away from zero, the curve approaches the horizontal dashed line $y = 1$. Near $x = 0$, the function is undefined, but the graph shows the curve oscillating as it approaches the y-axis from both sides. Labels include $1$ and $-1$ on the x-axis. Caption: FIGURE 2.55 The line $y = 1$ is a horizontal asymptote of the function graphed here (Example 6b).]

Likewise, we can investigate the behavior of $y = f(1/x)$ as $x \to 0$ by investigating $y = f(t)$ as $t \to \pm\infty$, where $t = 1/x$.

**EXAMPLE 7** Find $\lim_{x \to 0^-} e^{1/x}$.

**Solution** We let $t = 1/x$. From Figure 2.49, we can see that $t \to -\infty$ as $x \to 0^-$. (We make this idea more precise further on.) Therefore,

$$\lim_{x \to 0^-} e^{1/x} = \lim_{t \to -\infty} e^t = 0 \quad \text{Example 5}$$

(Figure 2.56).

[Figure 2.56: A coordinate plane showing the graph of $y = e^{1/x}$ for $x < 0$. The x-axis is labeled $-3, -2, -1, 0$. The y-axis is labeled from $0$ to $1$ in increments of $0.2$. The blue curve starts near $y = 1$ for very negative $x$ values and slopes downward toward $0$ as $x$ approaches $0$ from the left. Caption: FIGURE 2.56 The graph of $y = e^{1/x}$ for $x < 0$ shows $\lim_{x \to 0^-} e^{1/x} = 0$ (Example 7).]

The Sandwich Theorem also holds for limits as $x \to \pm\infty$. You must be sure, though, that the function whose limit you are trying to find stays between the bounding functions at very large values of $x$ in magnitude consistent with whether $x \to \infty$ or $x \to -\infty$.

**EXAMPLE 8** Using the Sandwich Theorem, find the horizontal asymptote of the curve

$$y = 2 + \frac{\sin x}{x}.$$

**Solution** We are interested in the behavior as $x \to \pm\infty$. Since

$$0 \le \left| \frac{\sin x}{x} \right| \le \left| \frac{1}{x} \right|$$

and $\lim_{x \to \pm\infty} |1/x| = 0$, we have $\lim_{x \to \pm\infty} (\sin x)/x = 0$ by the Sandwich Theorem. Hence,

$$\lim_{x \to \pm\infty} \left( 2 + \frac{\sin x}{x} \right) = 2 + 0 = 2,$$

and the line $y = 2$ is a horizontal asymptote of the curve on both left and right (Figure 2.57).

This example illustrates that a curve may cross one of its horizontal asymptotes many times.

[Figure 2.57: A coordinate plane showing the graph of $y = 2 + \frac{\sin x}{x}$. The x-axis is labeled with multiples of $\pi$: $-3\pi, -2\pi, -\pi, 0, \pi, 2\pi, 3\pi$. A horizontal dashed line is at $y = 2$. The blue curve oscillates around this dashed line, with the amplitude of the oscillations decreasing as $|x|$ increases. The curve crosses the asymptote $y = 2$ at every multiple of $\pi$ except $x=0$. Caption: FIGURE 2.57 A curve may cross one of its asymptotes infinitely often (Example 8).]

**EXAMPLE 9** Find $\lim_{x \to \infty} (x - \sqrt{x^2 + 16})$.

**Solution** Both of the terms $x$ and $\sqrt{x^2 + 16}$ approach infinity as $x \to \infty$, so what happens to the difference in the limit is unclear (we cannot subtract $\infty$ from $\infty$ because the symbol does not represent a real number). In this situation we can multiply the numerator and the denominator by the conjugate radical expression to obtain an equivalent algebraic result:

$$\lim_{x \to \infty} (x - \sqrt{x^2 + 16}) = \lim_{x \to \infty} (x - \sqrt{x^2 + 16}) \frac{x + \sqrt{x^2 + 16}}{x + \sqrt{x^2 + 16}}$$

$$= \lim_{x \to \infty} \frac{x^2 - (x^2 + 16)}{x + \sqrt{x^2 + 16}} = \lim_{x \to \infty} \frac{-16}{x + \sqrt{x^2 + 16}}.$$

<!-- PAGE 51 -->

## 2.6 Limits Involving Infinity; Asymptotes of Graphs

As $x \to \infty$, the denominator in this last expression becomes arbitrarily large, so we see that the limit is 0. We can also obtain this result by a direct calculation using the Limit Laws:

$$\lim_{x \to \infty} \frac{-16}{x + \sqrt{x^2 + 16}} = \lim_{x \to \infty} \frac{-\frac{16}{x}}{1 + \sqrt{\frac{x^2}{x^2} + \frac{16}{x^2}}} = \frac{0}{1 + \sqrt{1 + 0}} = 0.$$

### Oblique Asymptotes

If the degree of the numerator of a rational function is 1 greater than the degree of the denominator, the graph has an **oblique** or **slant line asymptote**. We find an equation for the asymptote by dividing numerator by denominator to express $f$ as a linear function plus a remainder that goes to zero as $x \to \pm\infty$.

**EXAMPLE 10** Find the oblique asymptote of the graph of

$$f(x) = \frac{x^2 - 3}{2x - 4}$$

in Figure 2.58.

[Figure 2.58: The graph of the function $f(x) = \frac{x^2 - 3}{2x - 4}$ is shown on a coordinate system. The x-axis ranges from -1 to 4 and the y-axis from -3 to 6. A vertical dashed line at $x = 2$ represents a vertical asymptote. A slanted dashed line representing the oblique asymptote $y = \frac{x}{2} + 1$ is also shown. The function's curve has two branches: one in the upper-right region and one in the lower-left. An annotation with an arrow pointing to the gap between the curve and the slanted line says "The vertical distance between curve and line goes to zero as $x \to \infty$". The equation $y = \frac{x}{2} + 1 + \frac{1}{2x - 4}$ is labeled next to the curve.]

**Solution** We are interested in the behavior as $x \to \pm\infty$. We divide $(2x - 4)$ into $(x^2 - 3)$:

$$
\begin{array}{r}
\frac{x}{2} + 1 \\
2x - 4 \overline{) x^2 + 0x - 3} \\
\underline{x^2 - 2x \phantom{-3}} \\
2x - 3 \\
\underline{2x - 4} \\
1
\end{array}
$$

This tells us that

$$f(x) = \frac{x^2 - 3}{2x - 4} = \underbrace{\left( \frac{x}{2} + 1 \right)}_{\text{linear } g(x)} + \underbrace{\left( \frac{1}{2x - 4} \right)}_{\text{remainder}}.$$

As $x \to \pm\infty$, the remainder, whose magnitude gives the vertical distance between the graphs of $f$ and $g$, goes to zero, making the slanted line

$$g(x) = \frac{x}{2} + 1$$

an asymptote of the graph of $f$ (Figure 2.58). The line $y = g(x)$ is an asymptote both to the right and to the left. The next subsection will confirm that the function $f(x)$ grows arbitrarily large in absolute value as $x \to 2$ (where the denominator is zero), as shown in the graph.

Notice in Example 10 that if the degree of the numerator in a rational function is greater than the degree of the denominator, then the limit as $|x|$ becomes large is $+\infty$ or $-\infty$, depending on the signs assumed by the numerator and denominator.

### Infinite Limits

Let us look again at the function $f(x) = 1/x$. As $x \to 0^+$, the values of $f$ grow without bound, eventually reaching and surpassing every positive real number. That is, given any positive real number $B$, however large, the values of $f$ become larger still (Figure 2.59).

[Figure 2.59: A graph of $y = 1/x$ showing one-sided infinite limits. On the right side ($x > 0$), as $x$ approaches 0, the curve goes upward. A point $(x, y)$ is marked with $B$ on the y-axis; text says "You can get as high as you want by taking $x$ close enough to 0. No matter how high $B$ is, the graph goes higher." On the left side ($x < 0$), as $x$ approaches 0 from the left, the curve goes downward. A point is marked with $-B$ on the y-axis; text says "You can get as low as you want by taking $x$ close enough to 0. No matter how low $-B$ is, the graph goes lower." Caption: One-sided infinite limits: $\lim_{x \to 0^+} \frac{1}{x} = \infty$ and $\lim_{x \to 0^-} \frac{1}{x} = -\infty$.]

<!-- PAGE 52 -->

Thus, $f$ has no limit as $x \to 0^+$. It is nevertheless convenient to describe the behavior of $f$ by saying that $f(x)$ approaches $\infty$ as $x \to 0^+$. We write

$$\lim_{x \to 0^+} f(x) = \lim_{x \to 0^+} \frac{1}{x} = \infty.$$

In writing this equation, we are not saying that the limit exists. Nor are we saying that there is a real number $\infty$, for there is no such number. Rather, we are saying that $\lim_{x \to 0^+} (1/x)$ does not exist because $1/x$ becomes arbitrarily large and positive as $x \to 0^+$.

As $x \to 0^-$, the values of $f(x) = 1/x$ become arbitrarily large and negative. Given any negative real number $-B$, the values of $f$ eventually lie below $-B$. (See Figure 2.59.) We write

$$\lim_{x \to 0^-} f(x) = \lim_{x \to 0^-} \frac{1}{x} = -\infty.$$

Again, we are not saying that the limit exists and equals the number $-\infty$. There is no real number $-\infty$. We are describing the behavior of a function whose limit as $x \to 0^-$ does not exist because its values become arbitrarily large and negative.

[Figure 2.60: The graph of $y = \frac{1}{x - 1}$ is shown. It is a hyperbola with a vertical asymptote at $x = 1$. As $x$ approaches 1 from the right, the curve goes to $+\infty$. As $x$ approaches 1 from the left, it goes to $-\infty$. The graph is a horizontal shift of $y = 1/x$ by 1 unit to the right. Caption: **FIGURE 2.60** Near $x = 1$, the function $y = 1/(x - 1)$ behaves the way the function $y = 1/x$ behaves near $x = 0$. Its graph is the graph of $y = 1/x$ shifted 1 unit to the right (Example 11).]

**EXAMPLE 11** Find $\lim_{x \to 1^+} \frac{1}{x - 1}$ and $\lim_{x \to 1^-} \frac{1}{x - 1}$.

**Geometric Solution** The graph of $y = 1/(x - 1)$ is the graph of $y = 1/x$ shifted 1 unit to the right (Figure 2.60). Therefore, $y = 1/(x - 1)$ behaves near 1 exactly the way $y = 1/x$ behaves near 0:

$$\lim_{x \to 1^+} \frac{1}{x - 1} = \infty \text{ and } \lim_{x \to 1^-} \frac{1}{x - 1} = -\infty.$$

**Analytic Solution** Think about the number $x - 1$ and its reciprocal. As $x \to 1^+$, we have $(x - 1) \to 0^+$ and $1/(x - 1) \to \infty$. As $x \to 1^-$, we have $(x - 1) \to 0^-$ and $1/(x - 1) \to -\infty$.

**EXAMPLE 12** Discuss the behavior of

$$f(x) = \frac{1}{x^2} \text{ as } x \to 0.$$

**Solution** As $x$ approaches zero from either side, the values of $1/x^2$ are positive and become arbitrarily large (Figure 2.61). This means that

$$\lim_{x \to 0} f(x) = \lim_{x \to 0} \frac{1}{x^2} = \infty.$$

The function $y = 1/x$ shows no consistent behavior as $x \to 0$. We have $1/x \to \infty$ if $x \to 0^+$, but $1/x \to -\infty$ if $x \to 0^-$. All we can say about $\lim_{x \to 0} (1/x)$ is that it does not exist. The function $y = 1/x^2$ is different. Its values approach infinity as $x$ approaches zero from either side, so we can say that $\lim_{x \to 0} (1/x^2) = \infty$.

[Figure 2.61: The graph of $f(x) = 1/x^2$ is shown. Both branches of the curve approach the y-axis ($x=0$) and go toward $+\infty$. A point $B$ is marked on the y-axis with the text "No matter how high $B$ is, the graph goes higher." Caption: **FIGURE 2.61** The graph of $f(x)$ in Example 12 approaches infinity as $x \to 0$.]

**EXAMPLE 13** These examples illustrate that rational functions can behave in various ways near zeros of the denominator.

(a) $\lim_{x \to 2} \frac{(x - 2)^2}{x^2 - 4} = \lim_{x \to 2} \frac{(x - 2)^2}{(x - 2)(x + 2)} = \lim_{x \to 2} \frac{x - 2}{x + 2} = 0$

(b) $\lim_{x \to 2} \frac{x - 2}{x^2 - 4} = \lim_{x \to 2} \frac{x - 2}{(x - 2)(x + 2)} = \lim_{x \to 2} \frac{1}{x + 2} = \frac{1}{4}$

<!-- PAGE 53 -->

## 2.6 Limits Involving Infinity; Asymptotes of Graphs

(c) $\lim_{x \to 2^+} \frac{x - 3}{x^2 - 4} = \lim_{x \to 2^+} \frac{x - 3}{(x - 2)(x + 2)} = -\infty$ [The values are negative for $x > 2$, $x$ near 2.]

(d) $\lim_{x \to 2^-} \frac{x - 3}{x^2 - 4} = \lim_{x \to 2^-} \frac{x - 3}{(x - 2)(x + 2)} = \infty$ [The values are positive for $x < 2$, $x$ near 2.]

(e) $\lim_{x \to 2} \frac{x - 3}{x^2 - 4} = \lim_{x \to 2} \frac{x - 3}{(x - 2)(x + 2)}$ does not exist. [See parts (c) and (d).]

(f) $\lim_{x \to 2} \frac{2 - x}{(x - 2)^3} = \lim_{x \to 2} \frac{-(x - 2)}{(x - 2)^3} = \lim_{x \to 2} \frac{-1}{(x - 2)^2} = -\infty$

In parts (a) and (b) the effect of the zero in the denominator at $x = 2$ is canceled because the numerator is zero there also. Thus a finite limit exists. This is not true in part (f), where cancellation still leaves a zero factor in the denominator.

**EXAMPLE 14** Find $\lim_{x \to -\infty} \frac{2x^5 - 6x^4 + 1}{3x^2 + x - 7}$.

**Solution** We are asked to find the limit of a rational function as $x \to -\infty$, so we divide the numerator and denominator by $x^2$, the highest power of $x$ in the denominator:

$$\lim_{x \to -\infty} \frac{2x^5 - 6x^4 + 1}{3x^2 + x - 7} = \lim_{x \to -\infty} \frac{2x^3 - 6x^2 + x^{-2}}{3 + x^{-1} - 7x^{-2}}$$
$$= \lim_{x \to -\infty} \frac{2x^2(x - 3) + x^{-2}}{3 + x^{-1} - 7x^{-2}}$$
$$= -\infty, \quad x^{-n} \to 0, x - 3 \to -\infty$$

because the numerator tends to $-\infty$ while the denominator approaches 3 as $x \to -\infty$.

### Precise Definitions of Infinite Limits

Instead of requiring $f(x)$ to lie arbitrarily close to a finite number $L$ for all $x$ sufficiently close to $c$, the definitions of infinite limits require $f(x)$ to lie arbitrarily far from zero. Except for this change, the language is very similar to what we have seen before. Figures 2.62 and 2.63 accompany these definitions.

[Figure 2.62: A Cartesian coordinate system showing a blue curve $y = f(x)$ that increases rapidly as it approaches a vertical dashed line at $x = c$. A horizontal dashed line is labeled $B$. An interval $(c - \delta, c + \delta)$ is marked on the x-axis. Within this interval, the curve $f(x)$ stays above the horizontal line $B$. Caption: FIGURE 2.62 For $c - \delta < x < c + \delta$, the graph of $f(x)$ lies above the line $y = B$.]

[Figure 2.63: A Cartesian coordinate system showing a blue curve $y = f(x)$ that decreases rapidly as it approaches a vertical dashed line at $x = c$. A horizontal dashed line is labeled $-B$. An interval $(c - \delta, c + \delta)$ is marked on the x-axis. Within this interval, the curve $f(x)$ stays below the horizontal line $-B$. Caption: FIGURE 2.63 For $c - \delta < x < c + \delta$, the graph of $f(x)$ lies below the line $y = -B$.]

**DEFINITIONS**

1. We say that $f(x)$ approaches infinity as $x$ approaches $c$, and write
$$\lim_{x \to c} f(x) = \infty,$$
if for every positive real number $B$ there exists a corresponding $\delta > 0$ such that for all $x$
$$0 < |x - c| < \delta \implies f(x) > B.$$

2. We say that $f(x)$ approaches minus infinity as $x$ approaches $c$, and write
$$\lim_{x \to c} f(x) = -\infty,$$
if for every negative real number $-B$ there exists a corresponding $\delta > 0$ such that for all $x$
$$0 < |x - c| < \delta \implies f(x) < -B.$$

The precise definitions of one-sided infinite limits at $c$ are similar and are stated in the exercises.

<!-- PAGE 54 -->

**EXAMPLE 15** Prove that $\lim_{x \to 0} \frac{1}{x^2} = \infty$.

**Solution** Given $B > 0$, we want to find $\delta > 0$ such that
$$0 < |x - 0| < \delta \text{ implies } \frac{1}{x^2} > B.$$
Now,
$$\frac{1}{x^2} > B \text{ if and only if } x^2 < \frac{1}{B}$$
or, equivalently,
$$|x| < \frac{1}{\sqrt{B}}.$$
Thus, choosing $\delta = 1/\sqrt{B}$ (or any smaller positive number), we see that
$$|x| < \delta \text{ implies } \frac{1}{x^2} > \frac{1}{\delta^2} \ge B.$$
Therefore, by definition,
$$\lim_{x \to 0} \frac{1}{x^2} = \infty.$$

### Vertical Asymptotes

Notice that the distance between a point on the graph of $f(x) = 1/x$ and the y-axis approaches zero as the point moves vertically along the graph and away from the origin (Figure 2.64). The function $f(x) = 1/x$ is unbounded as $x$ approaches 0 because
$$\lim_{x \to 0^+} \frac{1}{x} = \infty \quad \text{and} \quad \lim_{x \to 0^-} \frac{1}{x} = -\infty.$$
We say that the line $x = 0$ (the y-axis) is a vertical asymptote of the graph of $f(x) = 1/x$. Observe that the denominator is zero at $x = 0$ and the function is undefined there.

[Figure 2.64: A graph showing the hyperbola $y = 1/x$ with its two branches in the first and third quadrants. The x-axis is labeled "Horizontal asymptote, $y = 0$". The y-axis is labeled "Vertical asymptote, $x = 0$". A vertical arrow points to the y-axis with the label "Vertical asymptote". A horizontal arrow points to the x-axis with the label "Horizontal asymptote". Specific points are not labeled but the scale shows 1 and -1 on both axes. Caption: FIGURE 2.64 The coordinate axes are asymptotes of both branches of the hyperbola $y = 1/x$.]

**DEFINITION** A line $x = a$ is a **vertical asymptote** of the graph of a function $y = f(x)$ if either
$$\lim_{x \to a^+} f(x) = \pm\infty \quad \text{or} \quad \lim_{x \to a^-} f(x) = \pm\infty.$$

**EXAMPLE 16** Find the horizontal and vertical asymptotes of the curve
$$y = \frac{x + 3}{x + 2}.$$

**Solution** We are interested in the behavior as $x \to \pm\infty$ and the behavior as $x \to -2$, where the denominator is zero.
The asymptotes are quickly revealed if we recast the rational function as a polynomial with a remainder, by dividing $(x + 2)$ into $(x + 3)$:

$$ \begin{array}{r@{\quad}l} 1 & \\ x + 2 \overline{) x + 3} & \\ \underline{x + 2} & \\ 1 & \end{array} $$

<!-- PAGE 55 -->

## 2.6 Limits Involving Infinity; Asymptotes of Graphs

This result enables us to rewrite $y$ as:

$$y = 1 + \frac{1}{x + 2}$$

As $x \to \pm\infty$, the curve approaches the horizontal asymptote $y = 1$; as $x \to -2$, the curve approaches the vertical asymptote $x = -2$. We see that the curve in question is the graph of $f(x) = 1/x$ shifted 1 unit up and 2 units left (Figure 2.65). The asymptotes, instead of being the coordinate axes, are now the lines $y = 1$ and $x = -2$.

[**Figure 2.65** Description: A coordinate plane showing the graph of the function $y = \frac{x + 3}{x + 2} = 1 + \frac{1}{x + 2}$. A vertical dashed red line at $x = -2$ is labeled "Vertical asymptote, $x = -2$". A horizontal dashed red line at $y = 1$ is labeled "Horizontal asymptote, $y = 1$". The graph consists of two blue hyperbola-like branches. One branch is in the upper right quadrant relative to the asymptotes, passing through the y-axis at $(0, 1.5)$. The other branch is in the lower left quadrant relative to the asymptotes.]

**FIGURE 2.65** The lines $y = 1$ and $x = -2$ are asymptotes of the curve in Example 16.

**EXAMPLE 17** Find the horizontal and vertical asymptotes of the graph of

$$f(x) = -\frac{8}{x^2 - 4}$$

**Solution** We are interested in the behavior as $x \to \pm\infty$ and as $x \to \pm 2$, where the denominator is zero. Notice that $f$ is an even function of $x$, so its graph is symmetric with respect to the y-axis.

(a) The behavior as $x \to \pm\infty$. Since $\lim_{x \to \pm\infty} f(x) = 0$, the line $y = 0$ is a horizontal asymptote of the graph to the right. By symmetry it is an asymptote to the left as well (Figure 2.66). Notice that the curve approaches the x-axis from only the negative side (or from below). Also, $f(0) = 2$.

(b) The behavior as $x \to \pm 2$. Since

$$\lim_{x \to 2^+} f(x) = -\infty \quad \text{and} \quad \lim_{x \to 2^-} f(x) = \infty,$$

the line $x = 2$ is a vertical asymptote both from the right and from the left. By symmetry, the line $x = -2$ is also a vertical asymptote.

There are no other asymptotes because $f$ has a finite limit at all other points.

[**Figure 2.66** Description: A coordinate plane showing the graph of $y = -\frac{8}{x^2 - 4}$. There are two vertical dashed red lines at $x = -2$ and $x = 2$, labeled as "Vertical asymptote, $x = -2$" and "Vertical asymptote, $x = 2$". The x-axis ($y = 0$) is labeled as the "Horizontal asymptote, $y = 0$". The graph has three blue branches: a central U-shaped portion opening upwards between the vertical asymptotes with a y-intercept at $(0, 2)$, and two outer branches that both stay below the x-axis and approach the horizontal asymptote $y=0$ as $x \to \pm\infty$.]

**FIGURE 2.66** Graph of the function in Example 17. Notice that the curve approaches the x-axis from only one side. Asymptotes do not have to be two-sided.

**EXAMPLE 18** The graph of the natural logarithm function has the y-axis (the line $x = 0$) as a vertical asymptote. We see this from the graph sketched in Figure 2.67 (which is the reflection of the graph of the natural exponential function across the line $y = x$) and the fact that the x-axis is a horizontal asymptote of $y = e^x$ (Example 5). Thus,

$$\lim_{x \to 0^+} \ln x = -\infty.$$

The same result is true for $y = \log_a x$ whenever $a > 1$.

[**Figure 2.67** Description: A coordinate plane showing two curves: $y = e^x$ and $y = \ln x$. A dashed diagonal line $y = x$ serves as the line of symmetry between them. $y = e^x$ crosses the y-axis at $(0, 1)$ and has the x-axis ($y=0$) as a horizontal asymptote. $y = \ln x$ crosses the x-axis at $(1, 0)$ and has the y-axis ($x=0$) as a vertical asymptote, labeled "Figure 2.67 The line $x = 0$ is a vertical asymptote of the natural logarithm function (Example 18)."]

**EXAMPLE 19** The curves

$$y = \sec x = \frac{1}{\cos x} \quad \text{and} \quad y = \tan x = \frac{\sin x}{\cos x}$$

both have vertical asymptotes at odd-integer multiples of $\pi/2$, where $\cos x = 0$ (Figure 2.68).

### Dominant Terms

In Example 10 we saw that by long division we could rewrite the function

$$f(x) = \frac{x^2 - 3}{2x - 4}$$

<!-- PAGE 56 -->

## 114 Chapter 2: Limits and Continuity

[**Figure 2.68** Description: Two separate graphs showing the periodic behavior of trigonometric functions. The left graph is $y = \sec x$, showing alternating U-shaped and inverted U-shaped branches. Vertical dashed red lines indicate asymptotes at $x = -3\pi/2, -\pi/2, \pi/2, 3\pi/2$. The right graph is $y = \tan x$, showing repeating increasing curves between the same vertical dashed red asymptotes at $x = -3\pi/2, -\pi/2, \pi/2, 3\pi/2$.]

**FIGURE 2.68** The graphs of $\sec x$ and $\tan x$ have infinitely many vertical asymptotes (Example 19).

as a linear function plus a remainder term:

$$f(x) = \left(\frac{x}{2} + 1\right) + \left(\frac{1}{2x - 4}\right).$$

This tells us immediately that

*   $f(x) \approx \frac{x}{2} + 1$ For $|x|$ large, $\frac{1}{2x - 4}$ is near 0.
*   $f(x) \approx \frac{1}{2x - 4}$ For $x$ near 2, this term is very large in absolute value.

If we want to know how $f$ behaves, this is the way to find out. It behaves like $y = (x/2) + 1$ when $|x|$ is large and the contribution of $1/(2x - 4)$ to the total value of $f$ is insignificant. It behaves like $1/(2x - 4)$ when $x$ is so close to 2 that $1/(2x - 4)$ makes the dominant contribution.

We say that $(x/2) + 1$ **dominates** when $x$ is numerically large, and we say that $1/(2x - 4)$ dominates when $x$ is near 2. **Dominant terms** like these help us predict a function’s behavior.

**EXAMPLE 20** Let $f(x) = 3x^4 - 2x^3 + 3x^2 - 5x + 6$ and $g(x) = 3x^4$. Show that although $f$ and $g$ are quite different for numerically small values of $x$, they are virtually identical for $|x|$ very large, in the sense that their ratios approach 1 as $x \to \infty$ or $x \to -\infty$.

**Solution** The graphs of $f$ and $g$ behave quite differently near the origin (Figure 2.69a), but appear as virtually identical on a larger scale (Figure 2.69b).

We can test that the term $3x^4$ in $f$, represented graphically by $g$, dominates the polynomial $f$ for numerically large values of $x$ by examining the ratio of the two functions as $x \to \pm\infty$. We find that

$$\lim_{x \to \pm\infty} \frac{f(x)}{g(x)} = \lim_{x \to \pm\infty} \frac{3x^4 - 2x^3 + 3x^2 - 5x + 6}{3x^4}$$
$$= \lim_{x \to \pm\infty} \left(1 - \frac{2}{3x} + \frac{1}{x^2} - \frac{5}{3x^3} + \frac{2}{x^4}\right)$$
$$= 1,$$

which means that $f$ and $g$ appear nearly identical when $|x|$ is large.

[**Figure 2.69** Description: Two comparison graphs of $f(x)$ and $g(x)$. Graph (a) shows a small scale ($x$ from -2 to 2, $y$ from -5 to 20) where $f(x)$ (blue line) and $g(x) = 3x^4$ (red dashed line) are distinct curves. Graph (b) shows a large scale ($x$ from -20 to 20, $y$ from -100,000 to 500,000) where the two curves are visually indistinguishable, appearing as a single blue line.]

**FIGURE 2.69** The graphs of $f$ and $g$ are (a) distinct for $|x|$ small, and (b) nearly identical for $|x|$ large (Example 20).

### Summary

In this chapter we presented several important calculus ideas that are made meaningful and precise by the concept of the limit. These include the three ideas of the exact rate of change of a function, the slope of the graph of a function at a point, and the continuity of a function. The primary methods used for calculating limits of many functions are captured in the algebraic

<!-- PAGE 57 -->

## 2.6 Limits Involving Infinity; Asymptotes of Graphs

Limit Laws of Theorem 1 and in the Sandwich Theorem, all of which are proved from the precise definition of the limit. We saw that these computational rules also apply to one-sided limits and to limits at infinity. Moreover, we can sometimes apply these rules when calculating limits of simple transcendental functions, as illustrated by our examples or in cases like the following:

$$\lim_{x \to 0} \frac{e^x - 1}{e^{2x} - 1} = \lim_{x \to 0} \frac{e^x - 1}{(e^x - 1)(e^x + 1)} = \lim_{x \to 0} \frac{1}{e^x + 1} = \frac{1}{1 + 1} = \frac{1}{2}$$

However, calculating more complicated limits involving transcendental functions such as $\lim_{x \to 0} \frac{x}{e^{2x} - 1}$, $\lim_{x \to \infty} \frac{\ln x}{x}$, and $\lim_{x \to \infty} (1 + \frac{1}{x})^x$ requires more than simple algebraic techniques. The derivative is exactly the tool we need to calculate limits such as these (see Section 4.5), and this notion is the main subject of our next chapter.

## Exercises 2.6

[Exercises omitted]

### Limits as $x \to \infty$ or $x \to -\infty$

The process by which we determine limits of rational functions applies equally well to ratios containing noninteger or negative powers of $x$: Divide numerator and denominator by the highest power of $x$ in the denominator and proceed from there.

[Exercises omitted]

<!-- PAGE 58 -->

[Exercises omitted]

<!-- PAGE 59 -->

## 2.6 Limits Involving Infinity; Asymptotes of Graphs

In Exercises 73–76, find a function that satisfies the given conditions and sketch its graph. (The answers here are not unique. Any function that satisfies the conditions is acceptable. Feel free to use formulas defined in pieces if that will help.)

[Exercises omitted]

### Finding Limits of Differences When $x \to \pm \infty$

Find the limits in Exercises 80–86.

[Exercises omitted]

### Using the Formal Definitions

Use the formal definitions of limits as $x \to \pm \infty$ to establish the limits in Exercises 87 and 88.

[Exercises omitted]

Use formal definitions to prove the limit statements in Exercises 89–92.

[Exercises omitted]

**93. Definition of infinite right-hand limit.**

> We say that $f(x)$ approaches infinity as $x$ approaches $c$ from the right, and write
> $$\lim_{x \to c^+} f(x) = \infty,$$
> if, for every positive real number $B$, there exists a corresponding number $\delta > 0$ such that for all $x$
> $$c < x < c + \delta \implies f(x) > B.$$

Modify the definition to cover the following cases.

[Exercises omitted]

Use the formal definitions from Exercise 93 to prove the limit statements in Exercises 94–98.

[Exercises omitted]

### Oblique Asymptotes

Graph the rational functions in Exercises 99–104. Include the graphs and equations of the asymptotes.

[Exercises omitted]

### Additional Graphing Exercises

[A blue square icon containing a white capital 'T', signifying that technology, such as a graphing utility, is recommended for the following exercises.]

Graph the curves in Exercises 105–108. Explain the relationship between the curve’s formula and what you see.

[Exercises omitted]

[A blue square icon containing a white capital 'T', signifying that technology, such as a graphing utility, is recommended for the following exercises.]

Graph the functions in Exercises 109 and 110. Then answer the following questions.

[Exercises omitted]

<!-- PAGE 60 -->

[Exercises omitted]

<!-- PAGE 61 -->
[Exercises omitted]
<!-- PAGE 62 -->
[Exercises omitted]

<!-- PAGE 63 -->

## Chapter 2 Additional and Advanced Exercises

[Figure (a) shows a 1-L measuring cup with vertical markings and a horizontal label "Stripes about 1 mm wide". Figure (b) shows a geometric representation of the cup as a right circular cylinder with radius $r = 6\text{ cm}$ and height $h$. The liquid volume is labeled as $V = 36\pi h$.]

**A 1-L measuring cup (a), modeled as a right circular cylinder (b) of radius $r = 6\text{ cm}$**

## Precise Definition of Limit

[Exercises omitted]

**11. Uniqueness of limits** Show that a function cannot have two different limits at the same point. That is, if $\lim_{x \to c} f(x) = L_1$ and $\lim_{x \to c} f(x) = L_2$, then $L_1 = L_2$.

**12. Prove the limit Constant Multiple Rule:**
$$\lim_{x \to c} kf(x) = k \lim_{x \to c} f(x) \text{ for any constant } k.$$

[Exercises omitted]

**14. Limits and continuity** Which of the following statements are true, and which are false? If true, say why; if false, give a counterexample (that is, an example confirming the falsehood).
a. If $\lim_{x \to c} f(x)$ exists but $\lim_{x \to c} g(x)$ does not exist, then $\lim_{x \to c}(f(x) + g(x))$ does not exist.
b. If neither $\lim_{x \to c} f(x)$ nor $\lim_{x \to c} g(x)$ exists, then $\lim_{x \to c} (f(x) + g(x))$ does not exist.
c. If $f$ is continuous at $x$, then so is $|f|$.
d. If $|f|$ is continuous at $c$, then so is $f$.

[Exercises omitted]

**17. A function continuous at only one point** Let
$$f(x) = \begin{cases} x, & \text{if } x \text{ is rational} \\ 0, & \text{if } x \text{ is irrational.} \end{cases}$$
a. Show that $f$ is continuous at $x = 0$.
b. Use the fact that every nonempty open interval of real numbers contains both rational and irrational numbers to show that $f$ is not continuous at any nonzero value of $x$.

**18. The Dirichlet ruler function** If $x$ is a rational number, then $x$ can be written in a unique way as a quotient of integers $m/n$ where $n > 0$ and $m$ and $n$ have no common factors greater than 1. (We say that such a fraction is in lowest terms. For example, $6/4$ written in lowest terms is $3/2$.) Let $f(x)$ be defined for all $x$ in the interval $[0, 1]$ by
$$f(x) = \begin{cases} 1/n, & \text{if } x = m/n \text{ is a rational number in lowest terms} \\ 0, & \text{if } x \text{ is irrational.} \end{cases}$$
For instance, $f(0) = f(1) = 1$, $f(1/2) = 1/2$, $f(1/3) = f(2/3) = 1/3$, $f(1/4) = f(3/4) = 1/4$, and so on.
a. Show that $f$ is discontinuous at every rational number in $[0, 1]$.
b. Show that $f$ is continuous at every irrational number in $[0, 1]$. (Hint: If $\epsilon$ is a given positive number, show that there are only finitely many rational numbers $r$ in $[0, 1]$ such that $f(r) \ge \epsilon$.)
c. Sketch the graph of $f$. Why do you think $f$ is called the "ruler function"?

**19. Antipodal points** Is there any reason to believe that there is always a pair of antipodal (diametrically opposite) points on Earth’s equator where the temperatures are the same? Explain.

**20.** If $\lim_{x \to c} (f(x) + g(x)) = 3$ and $\lim_{x \to c} (f(x) - g(x)) = -1$, find $\lim_{x \to c} f(x)g(x)$.

**21. Roots of a quadratic equation that is almost linear** The equation $ax^2 + 2x - 1 = 0$, where $a$ is a constant, has two roots if $a > -1$ and $a \neq 0$, one positive and one negative:
$$r_+(a) = \frac{-1 + \sqrt{1 + a}}{a}, \quad r_-(a) = \frac{-1 - \sqrt{1 + a}}{a}$$
a. What happens to $r_+(a)$ as $a \to 0$? As $a \to -1^+$?
b. What happens to $r_-(a)$ as $a \to 0$? As $a \to -1^+$?
c. Support your conclusions by graphing $r_+(a)$ and $r_-(a)$ as functions of $a$. Describe what you see.
d. For added support, graph $f(x) = ax^2 + 2x - 1$ simultaneously for $a = 1, 0.5, 0.2, 0.1, \text{ and } 0.05$.

**22. Root of an equation** Show that the equation $x + 2 \cos x = 0$ has at least one solution.

**23. Bounded functions** A real-valued function $f$ is bounded from above on a set $D$ if there exists a number $N$ such that $f(x) \le N$ for all $x$ in $D$. We call $N$, when it exists, an upper bound for $f$ on $D$ and say that $f$ is bounded from above by $N$. In a similar manner, we say that $f$ is bounded from below on $D$ if there exists a number $M$ such that $f(x) \ge M$ for all $x$ in $D$. We call $M$, when it exists, a lower bound for $f$ on $D$ and say that $f$ is bounded from below by $M$. We say that $f$ is bounded on $D$ if it is bounded from both above and below.
a. Show that $f$ is bounded on $D$ if and only if there exists a number $B$ such that $|f(x)| \le B$ for all $x$ in $D$.

<!-- PAGE 64 -->

## Chapter 2: Limits and Continuity

b. Suppose that $f$ is bounded from above by $N$. Show that if $\lim_{x \to c} f(x) = L$, then $L \le N$.
c. Suppose that $f$ is bounded from below by $M$. Show that if $\lim_{x \to c} f(x) = L$, then $L \ge M$.

**24. Max $\{a, b\}$ and min $\{a, b\}$**
a. Show that the expression
$$\max \{a, b\} = \frac{a + b}{2} + \frac{|a - b|}{2}$$
equals $a$ if $a \ge b$ and equals $b$ if $b \ge a$. In other words, $\max \{a, b\}$ gives the larger of the two numbers $a$ and $b$.
b. Find a similar expression for $\min \{a, b\}$, the smaller of $a$ and $b$.

### Generalized Limits Involving $\frac{\sin \theta}{\theta}$

The formula $\lim_{\theta \to 0} (\sin \theta)/\theta = 1$ can be generalized. If $\lim_{x \to c} f(x) = 0$ and $f(x)$ is never zero in an open interval containing the point $x = c$, except possibly $c$ itself, then
$$\lim_{x \to c} \frac{\sin f(x)}{f(x)} = 1.$$
Here are several examples.
a. $\lim_{x \to 0} \frac{\sin x^2}{x^2} = 1$
b. $\lim_{x \to 0} \frac{\sin x^2}{x} = \lim_{x \to 0} \frac{\sin x^2}{x^2} \lim_{x \to 0} \frac{x^2}{x} = 1 \cdot 0 = 0$
c. $\lim_{x \to -1} \frac{\sin (x^2 - x - 2)}{x + 1} = \lim_{x \to -1} \frac{\sin (x^2 - x - 2)}{(x^2 - x - 2)} \cdot \lim_{x \to -1} \frac{(x^2 - x - 2)}{x + 1} = 1 \cdot \lim_{x \to -1} \frac{(x + 1)(x - 2)}{x + 1} = -3$
d. $\lim_{x \to 1} \frac{\sin(1 - \sqrt{x})}{x - 1} = \lim_{x \to 1} \frac{\sin(1 - \sqrt{x})}{1 - \sqrt{x}} \cdot \frac{1 - \sqrt{x}}{x - 1} = 1 \cdot \lim_{x \to 1} \frac{(1 - \sqrt{x})(1 + \sqrt{x})}{(x - 1)(1 + \sqrt{x})} = \lim_{x \to 1} \frac{1 - x}{(x - 1)(1 + \sqrt{x})} = -\frac{1}{2}$

[Exercises omitted]

### Oblique Asymptotes

[Exercises omitted]

## Chapter 2 Technology Application Projects

**Mathematica/Maple Modules:**

**Take It to the Limit**
**Part I**
**Part II (Zero Raised to the Power Zero: What Does It Mean?)**
**Part III (One-Sided Limits)**
Visualize and interpret the limit concept through graphical and numerical explorations.
**Part IV (What a Difference a Power Makes)**
See how sensitive limits can be with various powers of $x$.

**Going to Infinity**
**Part I (Exploring Function Behavior as $x \to \infty$ or $x \to -\infty$)**
This module provides four examples to explore the behavior of a function as $x \to \infty$ or $x \to -\infty$.
**Part II (Rates of Growth)**
Observe graphs that appear to be continuous, yet the function is not continuous. Several issues of continuity are explored to obtain results that you may find surprising.