<!-- PAGE 1 -->

# 3 Derivatives

**OVERVIEW** In the beginning of Chapter 2, we discussed how to determine the slope of a curve at a point and how to measure the rate at which a function changes. Now that we have studied limits, we can define these ideas precisely and see that both are interpretations of the *derivative of a function at a point*. We then extend this concept from a single point to the *derivative function*, and we develop rules for finding this derivative function easily, without having to calculate any limits directly. These rules are used to find derivatives of most of the common functions reviewed in Chapter 1, as well as various combinations of them.

The derivative is one of the key ideas in calculus, and is used to study a wide range of problems in mathematics, science, economics, and medicine. These problems include finding points where a continuous function is zero, calculating the velocity and acceleration of a moving object, determining how the rate of flow of a liquid into a container changes the level of the liquid within it, describing the path followed by a light ray going from a point in air to a point in water, finding the number of items a manufacturing company should produce in order to maximize its profits, studying the spread of an infectious disease within a given population, or calculating the amount of blood the heart pumps in a minute based on how well the lungs are functioning.

## 3.1 Tangents and the Derivative at a Point

In this section we define the slope and tangent to a curve at a point, and the derivative of a function at a point. The derivative gives a way to find both the slope of a graph and the instantaneous rate of change of a function.

### Finding a Tangent to the Graph of a Function

To find a tangent to an arbitrary curve $y = f(x)$ at a point $P(x_0, f(x_0))$, we use the procedure introduced in Section 2.1. We calculate the slope of the secant through $P$ and a nearby point $Q(x_0 + h, f(x_0 + h))$. We then investigate the limit of the slope as $h \to 0$ (Figure 3.1). If the limit exists, we call it the slope of the curve at $P$ and define the tangent at $P$ to be the line through $P$ having this slope.

[**Figure 3.1 Description:** This figure shows a coordinate plane with a blue curve labeled $y = f(x)$. A point $P(x_0, f(x_0))$ is marked on the curve. A second point $Q(x_0 + h, f(x_0 + h))$ is marked further along the curve. A dashed red line (secant line) connects $P$ and $Q$. A solid red line (tangent line) passes through $P$. The horizontal distance between $x_0$ and $x_0 + h$ is labeled $h$. The vertical distance between the two points is labeled $f(x_0 + h) - f(x_0)$. The figure demonstrates how the secant line approaches the tangent line as $Q$ moves toward $P$ (as $h \to 0$).]

**FIGURE 3.1** The slope of the tangent line at $P$ is $\lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}$.

**DEFINITIONS** The **slope of the curve** $y = f(x)$ at the point $P(x_0, f(x_0))$ is the number
$$m = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h} \text{ (provided the limit exists).}$$
The **tangent line** to the curve at $P$ is the line through $P$ with this slope.

<!-- PAGE 2 -->

In Section 2.1, Example 3, we applied these definitions to find the slope of the parabola $f(x) = x^2$ at the point $P(2, 4)$ and the tangent line to the parabola at $P$. Let's look at another example.

**EXAMPLE 1**
(a) Find the slope of the curve $y = 1/x$ at any point $x = a \neq 0$. What is the slope at the point $x = -1$?
(b) Where does the slope equal $-1/4$?
(c) What happens to the tangent to the curve at the point $(a, 1/a)$ as $a$ changes?

**Solution**
(a) Here $f(x) = 1/x$. The slope at $(a, 1/a)$ is
$$\lim_{h \to 0} \frac{f(a + h) - f(a)}{h} = \lim_{h \to 0} \frac{\frac{1}{a + h} - \frac{1}{a}}{h} = \lim_{h \to 0} \frac{1}{h} \frac{a - (a + h)}{a(a + h)}$$
$$= \lim_{h \to 0} \frac{-h}{ha(a + h)} = \lim_{h \to 0} \frac{-1}{a(a + h)} = -\frac{1}{a^2}$$
Notice how we had to keep writing "$\lim_{h \to 0}$" before each fraction until the stage at which we could evaluate the limit by substituting $h = 0$. The number $a$ may be positive or negative, but not 0. When $a = -1$, the slope is $-1/(-1)^2 = -1$ (Figure 3.2).

(b) The slope of $y = 1/x$ at the point where $x = a$ is $-1/a^2$. It will be $-1/4$ provided that
$$-\frac{1}{a^2} = -\frac{1}{4}$$
This equation is equivalent to $a^2 = 4$, so $a = 2$ or $a = -2$. The curve has slope $-1/4$ at the two points $(2, 1/2)$ and $(-2, -1/2)$ (Figure 3.3).

(c) The slope $-1/a^2$ is always negative if $a \neq 0$. As $a \to 0^+$, the slope approaches $-\infty$ and the tangent becomes increasingly steep (Figure 3.2). We see this situation again as $a \to 0^-$. As $a$ moves away from the origin in either direction, the slope approaches 0 and the tangent levels off becoming more and more horizontal.

[**Figure 3.2 Description:** A graph of the function $y = 1/x$ in the first and third quadrants. It shows two tangent lines. One tangent line is at $x = -1$ with a labeled slope of $-1$. Another tangent line is at $x = a$ in the first quadrant with a labeled slope of $-\frac{1}{a^2}$. The caption reads: "The tangent slopes, steep near the origin, become more gradual as the point of tangency moves away (Example 1)."]

[**Figure 3.3 Description:** A graph of the function $y = 1/x$ showing both branches. Two specific tangent lines are drawn. One is at the point $(2, 1/2)$ and the other is at the point $(-2, -1/2)$. Both lines are labeled with "slope is $-\frac{1}{4}$". The caption reads: "The two tangent lines to $y = 1/x$ having slope $-1/4$ (Example 1)."]

### Rates of Change: Derivative at a Point

The expression
$$\frac{f(x_0 + h) - f(x_0)}{h}, h \neq 0$$
is called the **difference quotient of $f$ at $x_0$ with increment $h$**. If the difference quotient has a limit as $h$ approaches zero, that limit is given a special name and notation.

**DEFINITION** The **derivative of a function $f$ at a point $x_0$**, denoted $f'(x_0)$, is
$$f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}$$
provided this limit exists.

The notation $f'(x_0)$ is read "$f$ prime of $x_0$."

<!-- PAGE 3 -->

## 3.1 Tangents and the Derivative at a Point

If we interpret the difference quotient as the slope of a secant line, then the derivative gives the slope of the curve $y = f(x)$ at the point $P(x_0, f(x_0))$. Exercise 33 shows that the derivative of the linear function $f(x) = mx + b$ at any point $x_0$ is simply the slope of the line, so

$$f'(x_0) = m,$$

which is consistent with our definition of slope.

If we interpret the difference quotient as an average rate of change (Section 2.1), the derivative gives the function’s instantaneous rate of change with respect to $x$ at the point $x = x_0$. We study this interpretation in Section 3.4.

**EXAMPLE 2** In Examples 1 and 2 in Section 2.1, we studied the speed of a rock falling freely from rest near the surface of the earth. We knew that the rock fell $y = 16t^2$ feet during the first $t$ sec, and we used a sequence of average rates over increasingly short intervals to estimate the rock’s speed at the instant $t = 1$. What was the rock’s *exact* speed at this time?

**Solution** We let $f(t) = 16t^2$. The average speed of the rock over the interval between $t = 1$ and $t = 1 + h$ seconds, for $h > 0$, was found to be

$$\frac{f(1 + h) - f(1)}{h} = \frac{16(1 + h)^2 - 16(1)^2}{h} = \frac{16(h^2 + 2h)}{h} = 16(h + 2).$$

The rock’s speed at the instant $t = 1$ is then

$$f'(1) = \lim_{h \to 0} 16(h + 2) = 16(0 + 2) = 32 \text{ ft/sec}.$$

Our original estimate of $32 \text{ ft/sec}$ in Section 2.1 was right. [Note: A small red square indicates the end of the example.]

### Summary

We have been discussing slopes of curves, lines tangent to a curve, the rate of change of a function, and the derivative of a function at a point. All of these ideas refer to the same limit.

[Note: The following content is enclosed in a box.]

The following are all interpretations for the limit of the difference quotient,

$$\lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h}.$$

1. The slope of the graph of $y = f(x)$ at $x = x_0$
2. The slope of the tangent to the curve $y = f(x)$ at $x = x_0$
3. The rate of change of $f(x)$ with respect to $x$ at $x = x_0$
4. The derivative $f'(x_0)$ at a point

In the next sections, we allow the point $x_0$ to vary across the domain of the function $f$.

<!-- PAGE 4 -->

[Exercises omitted]

<!-- PAGE 5 -->

## 3.1 Tangents and the Derivative at a Point

[Exercises omitted]

## Testing for Tangents

[Exercises omitted]

## Vertical Tangents

We say that a continuous curve $y = f(x)$ has a **vertical tangent** at the point where $x = x_{0}$ if the limit of the difference quotient is $\infty$ or $-\infty$. For example, $y = x^{1/3}$ has a vertical tangent at $x = 0$ (see accompanying figure):

$$\lim_{h \to 0} \frac{f(0 + h) - f(0)}{h} = \lim_{h \to 0} \frac{h^{1/3} - 0}{h} = \lim_{h \to 0} \frac{1}{h^{2/3}} = \infty.$$

[Note: This figure, titled "VERTICAL TANGENT AT ORIGIN", shows a Cartesian coordinate system with a blue curve $y = f(x) = x^{1/3}$ passing through the origin (0,0). The curve is nearly vertical as it crosses the y-axis, illustrating a vertical tangent. The x-axis and y-axis are labeled, and the origin is marked with 0.]

However, $y = x^{2/3}$ has no vertical tangent at $x = 0$ (see next figure):

$$\lim_{h \to 0} \frac{g(0 + h) - g(0)}{h} = \lim_{h \to 0} \frac{h^{2/3} - 0}{h} = \lim_{h \to 0} \frac{1}{h^{1/3}}$$

does not exist, because the limit is $\infty$ from the right and $-\infty$ from the left.

[Note: This figure, titled "NO VERTICAL TANGENT AT ORIGIN", shows a Cartesian coordinate system with a blue curve $y = g(x) = x^{2/3}$. The curve has a sharp point or cusp at the origin (0,0), coming down from the positive y-direction in both quadrants I and II. The graph shows no single tangent line at the origin. Labels include the x-axis, y-axis, and the origin 0.]

[Exercises omitted]

### COMPUTER EXPLORATIONS

[Exercises omitted]

<!-- PAGE 6 -->

128 Chapter 3: Derivatives

## 3.2 The Derivative as a Function

In the last section we defined the derivative of $y = f(x)$ at the point $x = x_{0}$ to be the limit

$$f'(x_{0}) = \lim_{h \to 0} \frac{f(x_{0} + h) - f(x_{0})}{h}.$$

We now investigate the derivative as a function derived from $f$ by considering the limit at each point $x$ in the domain of $f$.

**DEFINITION** The **derivative** of the function $f(x)$ with respect to the variable $x$ is the function $f'$ whose value at $x$ is

$$f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h},$$

provided the limit exists.

[Note: A sidebar titled "HISTORICAL ESSAY" with the subtitle "The Derivative" is located in the left margin.]

We use the notation $f(x)$ in the definition to emphasize the independent variable $x$ with respect to which the derivative function $f'(x)$ is being defined. The domain of $f'$ is the set of points in the domain of $f$ for which the limit exists, which means that the domain may be the same as or smaller than the domain of $f$. If $f'$ exists at a particular $x$, we say that $f$ is **differentiable (has a derivative)** at $x$. If $f'$ exists at every point in the domain of $f$, we call $f$ **differentiable**.

If we write $z = x + h$, then $h = z - x$ and $h$ approaches 0 if and only if $z$ approaches $x$. Therefore, an equivalent definition of the derivative is as follows (see Figure 3.4). This formula is sometimes more convenient to use when finding a derivative function, and focuses on the point $z$ that approaches $x$.

[Note: FIGURE 3.4, titled "Two forms for the difference quotient.", is a diagram illustrating the definition of a derivative. It shows a curve $y = f(x)$ on a coordinate plane. Two points are marked on the curve: $P(x, f(x))$ and $Q(z, f(z))$. A secant line passes through $P$ and $Q$. A right triangle is formed below the secant line with a horizontal leg labeled $h = z - x$ and a vertical leg labeled $f(z) - f(x)$. The text inside the image states:
- "Secant slope is $\frac{f(z) - f(x)}{z - x}$"
- "Derivative of $f$ at $x$ is $f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h} = \lim_{z \to x} \frac{f(z) - f(x)}{z - x}$"]

**Alternative Formula for the Derivative**

$$f'(x) = \lim_{z \to x} \frac{f(z) - f(x)}{z - x}$$

### Calculating Derivatives from the Definition

The process of calculating a derivative is called **differentiation**. To emphasize the idea that differentiation is an operation performed on a function $y = f(x)$, we use the notation

$$\frac{d}{dx}f(x)$$

as another way to denote the derivative $f'(x)$. Example 1 of Section 3.1 illustrated the differentiation process for the function $y = 1/x$ when $x = a$. For $x$ representing any point in the domain, we get the formula

$$\frac{d}{dx} \left( \frac{1}{x} \right) = -\frac{1}{x^{2}}.$$

Here are two more examples in which we allow $x$ to be any point in the domain of $f$.

[Note: A sidebar in the left margin contains the text:
**Derivative of the Reciprocal Function**
$\frac{d}{dx} \left( \frac{1}{x} \right) = -\frac{1}{x^{2}}, x \neq 0$]

<!-- PAGE 7 -->

### 3.2 The Derivative as a Function 129

**EXAMPLE 1** Differentiate $f(x) = \frac{x}{x - 1}$.

**Solution** We use the definition of derivative, which requires us to calculate $f(x + h)$ and then subtract $f(x)$ to obtain the numerator in the difference quotient. We have $f(x) = \frac{x}{x - 1}$ and $f(x + h) = \frac{(x + h)}{(x + h) - 1}$, so

$$f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}$$ [Definition]

$$= \lim_{h \to 0} \frac{\frac{x + h}{x + h - 1} - \frac{x}{x - 1}}{h}$$

$$= \lim_{h \to 0} \frac{1}{h} \cdot \frac{(x + h)(x - 1) - x(x + h - 1)}{(x + h - 1)(x - 1)}$$ [$\frac{a}{b} - \frac{c}{d} = \frac{ad - cb}{bd}$]

$$= \lim_{h \to 0} \frac{1}{h} \cdot \frac{-h}{(x + h - 1)(x - 1)}$$ [Simplify.]

$$= \lim_{h \to 0} \frac{-1}{(x + h - 1)(x - 1)} = \frac{-1}{(x - 1)^2}.$$ [Cancel $h \neq 0$.]

**EXAMPLE 2**
(a) Find the derivative of $f(x) = \sqrt{x}$ for $x > 0$.
(b) Find the tangent line to the curve $y = \sqrt{x}$ at $x = 4$.

**Solution**
(a) We use the alternative formula to calculate $f'$:
$$f'(x) = \lim_{z \to x} \frac{f(z) - f(x)}{z - x}$$
$$= \lim_{z \to x} \frac{\sqrt{z} - \sqrt{x}}{z - x}$$
$$= \lim_{z \to x} \frac{\sqrt{z} - \sqrt{x}}{(\sqrt{z} - \sqrt{x})(\sqrt{z} + \sqrt{x})}$$
$$= \lim_{z \to x} \frac{1}{\sqrt{z} + \sqrt{x}} = \frac{1}{2\sqrt{x}}.$$

(b) The slope of the curve at $x = 4$ is
$$f'(4) = \frac{1}{2\sqrt{4}} = \frac{1}{4}.$$
The tangent is the line through the point $(4, 2)$ with slope $1/4$ (Figure 3.5):
$$y = 2 + \frac{1}{4}(x - 4)$$
$$y = \frac{1}{4}x + 1.$$

#### Derivative of the Square Root Function
$$\frac{d}{dx} \sqrt{x} = \frac{1}{2\sqrt{x}}, x > 0$$

[Figure 3.5: A coordinate plane showing the curve $y = \sqrt{x}$ starting at the origin (0,0). A tangent line is drawn at the point (4, 2). The tangent line is labeled $y = \frac{1}{4}x + 1$ and the curve is labeled $y = \sqrt{x}$. Tick marks on the x-axis indicate 4. The y-intercept of the tangent line is shown at (0, 1).]

**FIGURE 3.5** The curve $y = \sqrt{x}$ and its tangent at $(4, 2)$. The tangent's slope is found by evaluating the derivative at $x = 4$ (Example 2).

#### Notations
There are many ways to denote the derivative of a function $y = f(x)$, where the independent variable is $x$ and the dependent variable is $y$. Some common alternative notations for the derivative are
$$f'(x) = y' = \frac{dy}{dx} = \frac{df}{dx} = \frac{d}{dx} f(x) = D(f)(x) = D_x f(x).$$

<!-- PAGE 8 -->

130 Chapter 3: Derivatives

The symbols $d/dx$ and $D$ indicate the operation of differentiation. We read $dy/dx$ as "the derivative of $y$ with respect to $x$," and $df/dx$ and $(d/dx) f(x)$ as "the derivative of $f$ with respect to $x$." The "prime" notations $y'$ and $f'$ come from notations that Newton used for derivatives. The $d/dx$ notations are similar to those used by Leibniz. The symbol $dy/dx$ should not be regarded as a ratio (until we introduce the idea of "differentials" in Section 3.11).

To indicate the value of a derivative at a specified number $x = a$, we use the notation
$$f'(a) = \frac{dy}{dx} \bigg|_{x=a} = \frac{df}{dx} \bigg|_{x=a} = \frac{d}{dx} f(x) \bigg|_{x=a}.$$

For instance, in Example 2
$$f'(4) = \frac{d}{dx} \sqrt{x} \bigg|_{x=4} = \frac{1}{2\sqrt{x}} \bigg|_{x=4} = \frac{1}{2\sqrt{4}} = \frac{1}{4}.$$

#### Graphing the Derivative
We can often make a reasonable plot of the derivative of $y = f(x)$ by estimating the slopes on the graph of $f$. That is, we plot the points $(x, f'(x))$ in the $xy$-plane and connect them with a smooth curve, which represents $y = f'(x)$.

**EXAMPLE 3** Graph the derivative of the function $y = f(x)$ in Figure 3.6a.

**Solution** We sketch the tangents to the graph of $f$ at frequent intervals and use their slopes to estimate the values of $f'(x)$ at these points. We plot the corresponding $(x, f'(x))$ pairs and connect them with a smooth curve as sketched in Figure 3.6b.

What can we learn from the graph of $y = f'(x)$? At a glance we can see
1. where the rate of change of $f$ is positive, negative, or zero;
2. the rough size of the growth rate at any $x$ and its size in relation to the size of $f(x)$;
3. where the rate of change itself is increasing or decreasing.

#### Differentiable on an Interval; One-Sided Derivatives
A function $y = f(x)$ is differentiable on an open interval (finite or infinite) if it has a derivative at each point of the interval. It is differentiable on a closed interval $[a, b]$ if it is differentiable on the interior $(a, b)$ and if the limits
$$\lim_{h \to 0^+} \frac{f(a + h) - f(a)}{h}$$ [Right-hand derivative at $a$]
$$\lim_{h \to 0^-} \frac{f(b + h) - f(b)}{h}$$ [Left-hand derivative at $b$]
exist at the endpoints (Figure 3.7).

Right-hand and left-hand derivatives may be defined at any point of a function's domain. Because of Theorem 6, Section 2.4, a function has a derivative at a point if and only if it has left-hand and right-hand derivatives there, and these one-sided derivatives are equal.

**EXAMPLE 4** Show that the function $y = |x|$ is differentiable on $(-\infty, 0)$ and $(0, \infty)$ but has no derivative at $x = 0$.

**Solution** From Section 3.1, the derivative of $y = mx + b$ is the slope $m$. Thus, to the right of the origin,
$$\frac{d}{dx}(|x|) = \frac{d}{dx}(x) = \frac{d}{dx}(1 \cdot x) = 1.$$ [$\frac{d}{dx}(mx + b) = m, |x| = x$]

[Figure 3.6: Two stacked graphs. 
(a) A graph of $y = f(x)$. The x-axis goes from 0 to 15. The y-axis goes from 0 to 10. Points A, B, C, D, and E are marked on the curve. Point A is at $x=0$ with slope 0. Point B is at $x=5$ with slope -1. Point C is at roughly $x=8$. Point D is at $x=10$ with slope 0. Point E is at $x=15$ where a rise of 8 units over a run of 4 units is indicated (slope approx 2).
(b) A graph of the derivative $y = f'(x)$. The x-axis matches (a). The y-axis (Slope) goes from -2 to 4. Points $A', B', C', D', E'$ correspond to the slopes from graph (a). $A'$ is at $(0,0)$, $B'$ is at $(5, -1)$, $D'$ is at $(10, 0)$, and $E'$ is at $(15, 2)$. The text notes "Vertical coordinate -1" for $B'$.]

**FIGURE 3.6** We made the graph of $y = f'(x)$ in (b) by plotting slopes from the graph of $y = f(x)$ in (a). The vertical coordinate of $B'$ is the slope at $B$ and so on. The slope at $E$ is approximately $8/4 = 2$. In (b) we see that the rate of change of $f$ is negative for $x$ between $A'$ and $D'$; the rate of change is positive for $x$ to the right of $D'$.

[Figure 3.7: A graph showing a segment of a curve $y = f(x)$ on an interval $[a, b]$. At $x = a$, a blue tangent line shows the right-hand derivative as the limit $\lim_{h \to 0^+} \frac{f(a+h)-f(a)}{h}$ where $h > 0$. At $x = b$, a red tangent line shows the left-hand derivative as the limit $\lim_{h \to 0^-} \frac{f(b+h)-f(b)}{h}$ where $h < 0$.]

**FIGURE 3.7** Derivatives at endpoints of a closed interval are one-sided limits.

<!-- PAGE 9 -->

## 3.2 The Derivative as a Function

To the left,
$$\frac{d}{dx}(|x|) = \frac{d}{dx}(-x) = \frac{d}{dx}(-1 \cdot x) = -1 \quad |x| = -x$$
(Figure 3.8). There is no derivative at the origin because the one-sided derivatives differ there:

$$\text{Right-hand derivative of } |x| \text{ at zero} = \lim_{h \to 0^+} \frac{|0 + h| - |0|}{h} = \lim_{h \to 0^+} \frac{|h|}{h}$$
$$= \lim_{h \to 0^+} \frac{h}{h} = \lim_{h \to 0^+} 1 = 1 \quad |h| = h \text{ when } h > 0$$

$$\text{Left-hand derivative of } |x| \text{ at zero} = \lim_{h \to 0^-} \frac{|0 + h| - |0|}{h} = \lim_{h \to 0^-} \frac{|h|}{h}$$
$$= \lim_{h \to 0^-} \frac{-h}{h} = \lim_{h \to 0^-} -1 = -1 \quad |h| = -h \text{ when } h < 0$$

[Image: Figure 3.8 displays a Cartesian coordinate system with the graph of $y = |x|$, which forms a V-shape with a sharp corner at the origin $(0,0)$. The left branch is a blue line with an annotation $y' = -1$. The right branch is a blue line with an annotation $y' = 1$. A vertical line with a square at the bottom points to the origin $(0,0)$, with an annotation: "$y'$ not defined at $x=0$: right-hand derivative $\neq$ left-hand derivative". Caption: **FIGURE 3.8** The function $y = |x|$ is not differentiable at the origin where the graph has a "corner" (Example 4).]

**EXAMPLE 5** In Example 2 we found that for $x > 0$,
$$\frac{d}{dx} \sqrt{x} = \frac{1}{2\sqrt{x}}$$
We apply the definition to examine if the derivative exists at $x = 0$:
$$\lim_{h \to 0^+} \frac{\sqrt{0 + h} - \sqrt{0}}{h} = \lim_{h \to 0^+} \frac{1}{\sqrt{h}} = \infty$$
Since the (right-hand) limit is not finite, there is no derivative at $x = 0$. Since the slopes of the secant lines joining the origin to the points $(h, \sqrt{h})$ on a graph of $y = \sqrt{x}$ approach $\infty$, the graph has a *vertical tangent* at the origin. (See Figure 1.17 on page 9.)

### When Does a Function Not Have a Derivative at a Point?

A function has a derivative at a point $x_0$ if the slopes of the secant lines through $P(x_0, f(x_0))$ and a nearby point $Q$ on the graph approach a finite limit as $Q$ approaches $P$. Whenever the secants fail to take up a limiting position or become vertical as $Q$ approaches $P$, the derivative does not exist. Thus differentiability is a "smoothness" condition on the graph of $f$. A function can fail to have a derivative at a point for many reasons, including the existence of points where the graph has

[Image: A diagram labeled "1. a corner, where the one-sided derivatives differ." The graph shows two straight lines meeting at point $P$ at an angle. Secant lines $PQ^-$ (in red) and $PQ^+$ (in blue) are shown approaching $P$ from the left and right, respectively, illustrating that their slopes converge to different values.]

[Image: A diagram labeled "2. a cusp, where the slope of $PQ$ approaches $\infty$ from one side and $-\infty$ from the other." The graph shows two curved segments meeting at a very sharp point $P$. Secant lines $PQ^-$ and $PQ^+$ are shown becoming increasingly steep as they approach $P$.]

<!-- PAGE 10 -->

[Image: A diagram labeled "3. a vertical tangent, where the slope of $PQ$ approaches $\infty$ from both sides or approaches $-\infty$ from both sides (here, $-\infty$)." The graph is a smooth curve that becomes perfectly vertical at point $P$. Secant lines $PQ^-$ and $PQ^+$ are shown becoming vertical as $Q$ approaches $P$.]

[Image: A diagram labeled "4. a discontinuity (two examples shown)." Two sub-graphs are shown. The first shows a jump where point $Q^-$ is on a lower segment and $P$ and $Q^+$ are on a higher segment. The second shows a similar break in the curve where $Q^-$ approaches a point different from where $P$ is located.]

Another case in which the derivative may fail to exist occurs when the function's slope is oscillating rapidly near $P$, as with $f(x) = \sin(1/x)$ near the origin, where it is discontinuous (see Figure 2.31).

### Differentiable Functions Are Continuous

A function is continuous at every point where it has a derivative.

**THEOREM 1—Differentiability Implies Continuity** If $f$ has a derivative at $x = c$, then $f$ is continuous at $x = c$.

*Proof.* Given that $f'(c)$ exists, we must show that $\lim_{x \to c} f(x) = f(c)$, or equivalently, that $\lim_{h \to 0} f(c + h) = f(c)$. If $h \neq 0$, then
$$f(c + h) = f(c) + (f(c + h) - f(c))$$
$$= f(c) + \frac{f(c + h) - f(c)}{h} \cdot h$$
Now take limits as $h \to 0$. By Theorem 1 of Section 2.2,
$$\lim_{h \to 0} f(c + h) = \lim_{h \to 0} f(c) + \lim_{h \to 0} \frac{f(c + h) - f(c)}{h} \cdot \lim_{h \to 0} h$$
$$= f(c) + f'(c) \cdot 0$$
$$= f(c) + 0$$
$$= f(c)$$

Similar arguments with one-sided limits show that if $f$ has a derivative from one side (right or left) at $x = c$, then $f$ is continuous from that side at $x = c$.

Theorem 1 says that if a function has a discontinuity at a point (for instance, a jump discontinuity), then it cannot be differentiable there. The greatest integer function $y = \lfloor x \rfloor$ fails to be differentiable at every integer $x = n$ (Example 4, Section 2.5).

**Caution** The converse of Theorem 1 is false. A function need not have a derivative at a point where it is continuous, as we saw with the absolute value function in Example 4.

<!-- PAGE 11 -->
[Exercises omitted]

<!-- PAGE 12 -->
[Exercises omitted]

<!-- PAGE 13 -->

## 3.2 The Derivative as a Function

[Exercises omitted]

In Exercises 41 and 42, determine if the piecewise-defined function is differentiable at the origin.

[Exercises omitted]

## Differentiability and Continuity on an Interval

Each figure in Exercises 43–48 shows the graph of a function over a closed interval $D$. At what domain points does the function appear to be

a. differentiable?
b. continuous but not differentiable?
c. neither continuous nor differentiable?

Give reasons for your answers.

[Exercises omitted]

## Theory and Examples

In Exercises 49–52,

a. Find the derivative $f'(x)$ of the given function $y = f(x)$.
b. Graph $y = f(x)$ and $y = f'(x)$ side by side using separate sets of coordinate axes, and answer the following questions.
c. For what values of $x$, if any, is $f'$ positive? Zero? Negative?
d. Over what intervals of $x$-values, if any, does the function $y = f(x)$ increase as $x$ increases? Decrease as $x$ increases? How is this related to what you found in part (c)? (We will say more about this relationship in Section 4.3.)

[Exercises omitted]

<!-- PAGE 14 -->

[Exercises omitted]

### COMPUTER EXPLORATIONS

Use a CAS to perform the following steps for the functions in Exercises 63–68.

a. Plot $y = f(x)$ to see that function’s global behavior.
b. Define the difference quotient $q$ at a general point $x$, with general step size $h$.
c. Take the limit as $h \to 0$. What formula does this give?
d. Substitute the value $x = x_0$ and plot the function $y = f(x)$ together with its tangent line at that point.
e. Substitute various values for $x$ larger and smaller than $x_0$ into the formula obtained in part (c). Do the numbers make sense with your picture?
f. Graph the formula obtained in part (c). What does it mean when its values are negative? Zero? Positive? Does this make sense with your plot from part (a)? Give reasons for your answer.

[Exercises omitted]

## 3.3 Differentiation Rules

This section introduces several rules that allow us to differentiate constant functions, power functions, polynomials, exponential functions, rational functions, and certain combinations of them, simply and directly, without having to take limits each time.

### Powers, Multiples, Sums, and Differences

A simple rule of differentiation is that the derivative of every constant function is zero.

**Derivative of a Constant Function**

If $f$ has the constant value $f(x) = c$, then

$$\frac{df}{dx} = \frac{d}{dx}(c) = 0.$$

[Figure 3.9: A graph depicts a horizontal line $y = c$ in the first quadrant of a Cartesian coordinate system. The y-axis is labeled $y$ and the x-axis is labeled $x$. The origin is marked $0$. A point on the y-axis is labeled $c$, where the horizontal line intersects. Two points are identified on the horizontal line: $(x, c)$ and $(x + h, c)$. On the x-axis, the positions corresponding to these points are marked $x$ and $x + h$, with a horizontal bracket between them labeled $h$.]

**FIGURE 3.9** The rule $(d/dx)(c) = 0$ is another way to say that the values of constant functions never change and that the slope of a horizontal line is zero at every point.

*Proof.* We apply the definition of the derivative to $f(x) = c$, the function whose outputs have the constant value $c$ (Figure 3.9). At every value of $x$, we find that

$$f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h} = \lim_{h \to 0} \frac{c - c}{h} = \lim_{h \to 0} 0 = 0.$$

From Section 3.1, we know that

$$\frac{d}{dx} \left( \frac{1}{x} \right) = -\frac{1}{x^2}, \text{ or } \frac{d}{dx}(x^{-1}) = -x^{-2}.$$

From Example 2 of the last section we also know that

$$\frac{d}{dx}(\sqrt{x}) = \frac{1}{2\sqrt{x}}, \text{ or } \frac{d}{dx}(x^{1/2}) = \frac{1}{2}x^{-1/2}.$$

These two examples illustrate a general rule for differentiating a power $x^n$. We first prove the rule when $n$ is a positive integer.

<!-- PAGE 15 -->

## 3.3 Differentiation Rules

#### HISTORICAL BIOGRAPHY
Richard Courant
(1888–1972)

---

**Derivative of a Positive Integer Power**
If $n$ is a positive integer, then
$$\frac{d}{dx} x^n = nx^{n-1}$$

---

**Proof of the Positive Integer Power Rule** The formula
$$z^n - x^n = (z - x)(z^{n-1} + z^{n-2}x + \dots + zx^{n-2} + x^{n-1})$$
can be verified by multiplying out the right-hand side. Then from the alternative formula for the definition of the derivative,
$$f'(x) = \lim_{z \to x} \frac{f(z) - f(x)}{z - x} = \lim_{z \to x} \frac{z^n - x^n}{z - x}$$
$$= \lim_{z \to x} (z^{n-1} + z^{n-2}x + \dots + zx^{n-2} + x^{n-1}) \quad n \text{ terms}$$
$$= nx^{n-1}$$

The Power Rule is actually valid for all real numbers $n$. We have seen examples for a negative integer and fractional power, but $n$ could be an irrational number as well. To apply the Power Rule, we subtract 1 from the original exponent $n$ and multiply the result by $n$. Here we state the general version of the rule, but postpone its proof until Section 3.8.

---

**Power Rule (General Version)**
If $n$ is any real number, then
$$\frac{d}{dx} x^n = nx^{n-1}$$
for all $x$ where the powers $x^n$ and $x^{n-1}$ are defined.

---

#### Applying the Power Rule
Subtract 1 from the exponent and multiply the result by the original exponent.

**EXAMPLE 1** Differentiate the following powers of $x$.
(a) $x^3$
(b) $x^{2/3}$
(c) $x^{\sqrt{2}}$
(d) $\frac{1}{x^4}$
(e) $x^{-4/3}$
(f) $\sqrt{x^{2+\pi}}$

**Solution**
(a) $\frac{d}{dx}(x^3) = 3x^{3-1} = 3x^2$
(b) $\frac{d}{dx}(x^{2/3}) = \frac{2}{3}x^{(2/3)-1} = \frac{2}{3}x^{-1/3}$
(c) $\frac{d}{dx}(x^{\sqrt{2}}) = \sqrt{2}x^{\sqrt{2}-1}$
(d) $\frac{d}{dx}(\frac{1}{x^4}) = \frac{d}{dx}(x^{-4}) = -4x^{-4-1} = -4x^{-5} = -\frac{4}{x^5}$
(e) $\frac{d}{dx}(x^{-4/3}) = -\frac{4}{3}x^{-(4/3)-1} = -\frac{4}{3}x^{-7/3}$
(f) $\frac{d}{dx}(\sqrt{x^{2+\pi}}) = \frac{d}{dx}(x^{1+(\pi/2)}) = (1 + \frac{\pi}{2})x^{1+(\pi/2)-1} = \frac{1}{2}(2 + \pi)\sqrt{x^\pi}$

The next rule says that when a differentiable function is multiplied by a constant, its derivative is multiplied by the same constant.

<!-- PAGE 16 -->

Chapter 3: Derivatives

---

**Derivative Constant Multiple Rule**
If $u$ is a differentiable function of $x$, and $c$ is a constant, then
$$\frac{d}{dx}(cu) = c\frac{du}{dx}$$

---

In particular, if $n$ is any real number, then
$$\frac{d}{dx}(cx^n) = cnx^{n-1}$$

**Proof**
$$\frac{d}{dx}cu = \lim_{h \to 0} \frac{cu(x + h) - cu(x)}{h} \quad \text{Derivative definition with } f(x) = cu(x)$$
$$= c \lim_{h \to 0} \frac{u(x + h) - u(x)}{h} \quad \text{Constant Multiple Limit Property}$$
$$= c\frac{du}{dx} \quad u \text{ is differentiable}$$

[Figure 3.10: A Cartesian coordinate system graph showing two parabolas opening upwards. The blue curve is labeled $y = 3x^2$ and the orange curve is labeled $y = x^2$. On the orange curve, there is a point $(1, 1)$ with a tangent line segment; a label points to this tangent stating "Slope $= 2x = 2(1) = 2$". On the blue curve, there is a point $(1, 3)$ with a steeper tangent line segment; a label points to this tangent stating "Slope $= 3(2x) = 6x = 6(1) = 6$". The x-axis is labeled from 0 to 2, and the y-axis is labeled from 0 to 3. FIGURE 3.10 The graphs of $y = x^2$ and $y = 3x^2$. Tripling the y-coordinate triples the slope (Example 2).]

**EXAMPLE 2**
(a) The derivative formula
$$\frac{d}{dx}(3x^2) = 3 \cdot 2x = 6x$$
says that if we rescale the graph of $y = x^2$ by multiplying each y-coordinate by 3, then we multiply the slope at each point by 3 (Figure 3.10).

(b) **Negative of a function**
The derivative of the negative of a differentiable function $u$ is the negative of the function's derivative. The Constant Multiple Rule with $c = -1$ gives
$$\frac{d}{dx}(-u) = \frac{d}{dx}(-1 \cdot u) = -1 \cdot \frac{d}{dx}(u) = -\frac{du}{dx}$$

The next rule says that the derivative of the sum of two differentiable functions is the sum of their derivatives.

#### Denoting Functions by $u$ and $v$
The functions we are working with when we need a differentiation formula are likely to be denoted by letters like $f$ and $g$. We do not want to use these same letters when stating general differentiation rules, so instead we use letters like $u$ and $v$ that are not likely to be already in use.

---

**Derivative Sum Rule**
If $u$ and $v$ are differentiable functions of $x$, then their sum $u + v$ is differentiable at every point where $u$ and $v$ are both differentiable. At such points,
$$\frac{d}{dx}(u + v) = \frac{du}{dx} + \frac{dv}{dx}$$

---

For example, if $y = x^4 + 12x$, then $y$ is the sum of $u(x) = x^4$ and $v(x) = 12x$. We then have
$$\frac{dy}{dx} = \frac{d}{dx}(x^4) + \frac{d}{dx}(12x) = 4x^3 + 12$$

<!-- PAGE 17 -->

### 3.3 Differentiation Rules

*Proof* We apply the definition of the derivative to $f(x) = u(x) + v(x)$:

$$\frac{d}{dx} [u(x) + v(x)] = \lim_{h \to 0} \frac{[u(x + h) + v(x + h)] - [u(x) + v(x)]}{h}$$

$$= \lim_{h \to 0} \left[ \frac{u(x + h) - u(x)}{h} + \frac{v(x + h) - v(x)}{h} \right]$$

$$= \lim_{h \to 0} \frac{u(x + h) - u(x)}{h} + \lim_{h \to 0} \frac{v(x + h) - v(x)}{h} = \frac{du}{dx} + \frac{dv}{dx}.$$

Combining the Sum Rule with the Constant Multiple Rule gives the **Difference Rule**, which says that the derivative of a difference of differentiable functions is the difference of their derivatives:

$$\frac{d}{dx} (u - v) = \frac{d}{dx} [u + (-1)v] = \frac{du}{dx} + (-1) \frac{dv}{dx} = \frac{du}{dx} - \frac{dv}{dx}.$$

The Sum Rule also extends to finite sums of more than two functions. If $u_1, u_2, \dots, u_n$ are differentiable at $x$, then so is $u_1 + u_2 + \dots + u_n$, and

$$\frac{d}{dx} (u_1 + u_2 + \dots + u_n) = \frac{du_1}{dx} + \frac{du_2}{dx} + \dots + \frac{du_n}{dx}.$$

For instance, to see that the rule holds for three functions we compute

$$\frac{d}{dx} (u_1 + u_2 + u_3) = \frac{d}{dx} ((u_1 + u_2) + u_3) = \frac{d}{dx} (u_1 + u_2) + \frac{du_3}{dx} = \frac{du_1}{dx} + \frac{du_2}{dx} + \frac{du_3}{dx}.$$

A proof by mathematical induction for any finite number of terms is given in Appendix 2.

**EXAMPLE 3** Find the derivative of the polynomial $y = x^3 + \frac{4}{3} x^2 - 5x + 1$.

**Solution**
$$\frac{dy}{dx} = \frac{d}{dx} x^3 + \frac{d}{dx} \left( \frac{4}{3} x^2 \right) - \frac{d}{dx} (5x) + \frac{d}{dx} (1)$$ [Sum and Difference Rules]
$$= 3x^2 + \frac{4}{3} \cdot 2x - 5 + 0 = 3x^2 + \frac{8}{3} x - 5$$

We can differentiate any polynomial term by term, the way we differentiated the polynomial in Example 3. All polynomials are differentiable at all values of $x$.

**EXAMPLE 4** Does the curve $y = x^4 - 2x^2 + 2$ have any horizontal tangents? If so, where?

**Solution** The horizontal tangents, if any, occur where the slope $dy/dx$ is zero. We have

$$\frac{dy}{dx} = \frac{d}{dx} (x^4 - 2x^2 + 2) = 4x^3 - 4x.$$

Now solve the equation $\frac{dy}{dx} = 0$ for $x$:

$$4x^3 - 4x = 0$$
$$4x(x^2 - 1) = 0$$
$$x = 0, 1, -1.$$

The curve $y = x^4 - 2x^2 + 2$ has horizontal tangents at $x = 0, 1,$ and $-1$. The corresponding points on the curve are $(0, 2), (1, 1),$ and $(-1, 1)$. See Figure 3.11. We will see in Chapter 4 that finding the values of $x$ where the derivative of a function is equal to zero is an important and useful procedure.

[Figure 3.11: A Cartesian coordinate graph showing the W-shaped curve $y = x^4 - 2x^2 + 2$. The x-axis is labeled from -1 to 1, and the y-axis is labeled with 0, 1, and 2. Three points on the curve are marked with blue dots: a local maximum at (0, 2) on the y-axis, and two local minima at (-1, 1) and (1, 1). Horizontal dashed blue lines represent the tangent lines at these three points. Caption: FIGURE 3.11 The curve in Example 4 and its horizontal tangents.]

<!-- PAGE 18 -->

### Derivatives of Exponential Functions

We briefly reviewed exponential functions in Section 1.5. When we apply the definition of the derivative to $f(x) = a^x$, we get

$$\frac{d}{dx} (a^x) = \lim_{h \to 0} \frac{a^{x+h} - a^x}{h}$$ [Derivative definition]
$$= \lim_{h \to 0} \frac{a^x \cdot a^h - a^x}{h}$$ [$a^{x+h} = a^x \cdot a^h$]
$$= \lim_{h \to 0} a^x \cdot \frac{a^h - 1}{h}$$ [Factoring out $a^x$]
$$= a^x \cdot \lim_{h \to 0} \frac{a^h - 1}{h}$$ [$a^x$ is constant as $h \to 0$]
$$= \left( \lim_{h \to 0} \frac{a^h - 1}{h} \right) \cdot a^x$$ (1)

The factor in parentheses is a fixed number $L$.

Thus we see that the derivative of $a^x$ is a constant multiple $L$ of $a^x$. The constant $L$ is a limit unlike any we have encountered before. Note, however, that it equals the derivative of $f(x) = a^x$ at $x = 0$:

$$f'(0) = \lim_{h \to 0} \frac{a^h - a^0}{h} = \lim_{h \to 0} \frac{a^h - 1}{h} = L.$$

The limit $L$ is therefore the slope of the graph of $f(x) = a^x$ where it crosses the y-axis. In Chapter 7, where we carefully develop the logarithmic and exponential functions, we prove that the limit $L$ exists and has the value $\ln a$. For now we investigate values of $L$ by graphing the function $y = (a^h - 1)/h$ and studying its behavior as $h$ approaches 0.

Figure 3.12 shows the graphs of $y = (a^h - 1)/h$ for four different values of $a$. The limit $L$ is approximately 0.69 if $a = 2$, about 0.92 if $a = 2.5$, and about 1.1 if $a = 3$. It appears that the value of $L$ is 1 at some number $a$ chosen between 2.5 and 3. That number is given by $a = e \approx 2.718281828$. With this choice of base we obtain the **natural exponential function** $f(x) = e^x$ as in Section 1.5, and see that it satisfies the property

$$f'(0) = \lim_{h \to 0} \frac{e^h - 1}{h} = 1$$ (2)

because it is the exponential function whose graph has slope 1 when it crosses the y-axis. That the limit is 1 implies an important relationship between the natural exponential function $e^x$ and its derivative:

$$\frac{d}{dx} (e^x) = \lim_{h \to 0} \left( \frac{e^h - 1}{h} \right) \cdot e^x$$ [Eq. (1) with $a = e$]
$$= 1 \cdot e^x = e^x.$$ [Eq. (2)]

Therefore the natural exponential function is its own derivative.

[Figure 3.12: A graph showing several curves of the form $y = (a^h - 1)/h$ for $a > 0$, where the horizontal axis is $h$ and the vertical axis is $y$. Four curves are shown passing through $h=0$ (the y-axis) at different heights $L$: a curve for $a=3$ (highest, $L \approx 1.1$), a curve for $a=e$ ($L = 1.0$), a curve for $a=2.5$ ($L \approx 0.92$), and a curve for $a=2$ (lowest, $L \approx 0.69$). The point $(0, 1)$ on the y-axis is marked where the $a=e$ curve intersects. Caption: FIGURE 3.12 The position of the curve $y = (a^h - 1)/h, a > 0$, varies continuously with $a$. The limit $L$ of $y$ as $h \to 0$ changes with different values of $a$. The number for which $L = 1$ as $h \to 0$ is the number $e$ between $a = 2$ and $a = 3$.]

#### Derivative of the Natural Exponential Function
$$\frac{d}{dx} (e^x) = e^x$$

**EXAMPLE 5** Find an equation for a line that is tangent to the graph of $y = e^x$ and goes through the origin.

**Solution** Since the line passes through the origin, its equation is of the form $y = mx$, where $m$ is the slope. If it is tangent to the graph at the point $(a, e^a)$, the slope is $m = (e^a - 0)/(a - 0)$. The slope of the natural exponential at $x = a$ is $e^a$. Because these

<!-- PAGE 19 -->

### 3.3 Differentiation Rules 141

slopes are the same, we then have that $e^a = e^a/a$. It follows that $a = 1$ and $m = e$, so the equation of the tangent line is $y = ex$. See Figure 3.13. ■

We might ask if there are functions other than the natural exponential function that are their own derivatives. The answer is that the only functions that satisfy the property that $f'(x) = f(x)$ are functions that are constant multiples of the natural exponential function, $f(x) = c \cdot e^x$, $c$ any constant. We prove this fact in Section 7.2. Note from the Constant Multiple Rule that indeed

$$\frac{d}{dx}(c \cdot e^x) = c \cdot \frac{d}{dx}(e^x) = c \cdot e^x.$$

#### Products and Quotients

While the derivative of the sum of two functions is the sum of their derivatives, the derivative of the product of two functions is *not* the product of their derivatives. For instance,

$$\frac{d}{dx}(x \cdot x) = \frac{d}{dx}(x^2) = 2x, \text{ while } \frac{d}{dx}(x) \cdot \frac{d}{dx}(x) = 1 \cdot 1 = 1.$$

The derivative of a product of two functions is the sum of two products, as we now explain.

[Figure 3.13: A coordinate plane showing a graph of the function $y = e^x$ in blue. A red tangent line passes through the origin $(0,0)$ and is tangent to the curve at the point $(a, e^a)$. The x-axis is labeled with $-1$ and $a$. The y-axis is labeled with $2, 4, 6$. Caption: FIGURE 3.13 The line through the origin is tangent to the graph of $y = e^x$ when $a = 1$ (Example 5).]

> **Derivative Product Rule**
> 
> If $u$ and $v$ are differentiable at $x$, then so is their product $uv$, and
> 
> $$\frac{d}{dx}(uv) = u \frac{dv}{dx} + v \frac{du}{dx}.$$

[Sidebar note: Equation (3) is equivalent to saying that $(fg)' = f'g + fg'$. This form of the Product Rule is useful and applies to dot products and cross products of vector-valued functions, studied in Chapter 13.]

The derivative of the product $uv$ is $u$ times the derivative of $v$ plus $v$ times the derivative of $u$. In prime notation, $(uv)' = uv' + vu'$. In function notation,

$$\frac{d}{dx}[f(x)g(x)] = f(x)g'(x) + g(x)f'(x). \text{ (3)}$$

**EXAMPLE 6** Find the derivative of (a) $y = \frac{1}{x}(x^2 + e^x)$, (b) $y = e^{2x}$.

**Solution**
(a) We apply the Product Rule with $u = 1/x$ and $v = x^2 + e^x$:
$$\frac{d}{dx}\left[ \frac{1}{x}(x^2 + e^x) \right] = \frac{1}{x}(2x + e^x) + (x^2 + e^x)\left( -\frac{1}{x^2} \right)$$
[Annotation: $\frac{d}{dx}(uv) = u \frac{dv}{dx} + v \frac{du}{dx}$, and $\frac{d}{dx}(\frac{1}{x}) = -\frac{1}{x^2}$]
$$= 2 + \frac{e^x}{x} - 1 - \frac{e^x}{x^2}$$
$$= 1 + (x - 1)\frac{e^x}{x^2}.$$
(b) $\frac{d}{dx}(e^{2x}) = \frac{d}{dx}(e^x \cdot e^x) = e^x \cdot \frac{d}{dx}(e^x) + e^x \cdot \frac{d}{dx}(e^x) = 2e^x \cdot e^x = 2e^{2x}$ ■

**EXAMPLE 7** Find the derivative of $y = (x^2 + 1)(x^3 + 3)$.

**Solution**
(a) From the Product Rule with $u = x^2 + 1$ and $v = x^3 + 3$, we find
$$\frac{d}{dx}[(x^2 + 1)(x^3 + 3)] = (x^2 + 1)(3x^2) + (x^3 + 3)(2x)$$
[Annotation: $\frac{d}{dx}(uv) = u \frac{dv}{dx} + v \frac{du}{dx}$]
$$= 3x^4 + 3x^2 + 2x^4 + 6x$$
$$= 5x^4 + 3x^2 + 6x.$$

<!-- PAGE 20 -->

142 Chapter 3: Derivatives

(b) This particular product can be differentiated as well (perhaps better) by multiplying out the original expression for $y$ and differentiating the resulting polynomial:
$$y = (x^2 + 1)(x^3 + 3) = x^5 + x^3 + 3x^2 + 3$$
$$\frac{dy}{dx} = 5x^4 + 3x^2 + 6x.$$
This is in agreement with our first calculation. ■

**Proof of the Derivative Product Rule**
$$\frac{d}{dx}(uv) = \lim_{h \to 0} \frac{u(x + h)v(x + h) - u(x)v(x)}{h}$$

To change this fraction into an equivalent one that contains difference quotients for the derivatives of $u$ and $v$, we subtract and add $u(x + h)v(x)$ in the numerator:
$$\frac{d}{dx}(uv) = \lim_{h \to 0} \frac{u(x + h)v(x + h) - u(x + h)v(x) + u(x + h)v(x) - u(x)v(x)}{h}$$
$$= \lim_{h \to 0} \left[ u(x + h) \frac{v(x + h) - v(x)}{h} + v(x) \frac{u(x + h) - u(x)}{h} \right]$$
$$= \lim_{h \to 0} u(x + h) \cdot \lim_{h \to 0} \frac{v(x + h) - v(x)}{h} + v(x) \cdot \lim_{h \to 0} \frac{u(x + h) - u(x)}{h}.$$

As $h$ approaches zero, $u(x + h)$ approaches $u(x)$ because $u$, being differentiable at $x$, is continuous at $x$. The two fractions approach the values of $dv/dx$ at $x$ and $du/dx$ at $x$. Therefore,
$$\frac{d}{dx}(uv) = u \frac{dv}{dx} + v \frac{du}{dx}. \text{ ■}$$

The derivative of the quotient of two functions is given by the Quotient Rule.

[Sidebar: **Picturing the Product Rule**
Suppose $u(x)$ and $v(x)$ are positive and increase when $x$ increases, and $h > 0$.
[Figure: A geometric diagram on a coordinate plane with origin 0. It shows a large rectangle with width $u(x+h)$ and height $v(x+h)$. Inside it is a smaller rectangle with width $u(x)$ and height $v(x)$, representing the area $u(x)v(x)$. The horizontal increase is labeled $\Delta u$ and the vertical increase is $\Delta v$. The additional area $\Delta(uv)$ is composed of two reddish-shaded regions: a top rectangle with area $u(x+h)\Delta v$ and a right-side rectangle with area $v(x)\Delta u$.]
Then the change in the product $uv$ is the difference in areas of the larger and smaller "squares," which is the sum of the upper and right-hand reddish-shaded rectangles. That is,
$$\Delta(uv) = u(x + h)v(x + h) - u(x)v(x)$$
$$= u(x + h)\Delta v + v(x)\Delta u.$$
Division by $h$ gives
$$\frac{\Delta(uv)}{h} = u(x + h)\frac{\Delta v}{h} + v(x)\frac{\Delta u}{h}.$$
The limit as $h \to 0^+$ gives the Product Rule.]

> **Derivative Quotient Rule**
> 
> If $u$ and $v$ are differentiable at $x$ and if $v(x) \neq 0$, then the quotient $u/v$ is differentiable at $x$, and
> 
> $$\frac{d}{dx}\left(\frac{u}{v}\right) = \frac{v \frac{du}{dx} - u \frac{dv}{dx}}{v^2}.$$

In function notation,
$$\frac{d}{dx}\left[ \frac{f(x)}{g(x)} \right] = \frac{g(x)f'(x) - f(x)g'(x)}{g^2(x)}.$$

**EXAMPLE 8** Find the derivative of (a) $y = \frac{t^2 - 1}{t^3 + 1}$, (b) $y = e^{-x}$.

**Solution**
(a) We apply the Quotient Rule with $u = t^2 - 1$ and $v = t^3 + 1$:
$$\frac{dy}{dt} = \frac{(t^3 + 1) \cdot 2t - (t^2 - 1) \cdot 3t^2}{(t^3 + 1)^2}$$
[Annotation: $\frac{d}{dt}(\frac{u}{v}) = \frac{v(du/dt) - u(dv/dt)}{v^2}$]
$$= \frac{2t^4 + 2t - 3t^4 + 3t^2}{(t^3 + 1)^2}$$
$$= \frac{-t^4 + 3t^2 + 2t}{(t^3 + 1)^2}.$$

<!-- PAGE 21 -->

## 3.3 Differentiation Rules

(b) $$\frac{d}{dx}(e^{-x}) = \frac{d}{dx}\left(\frac{1}{e^x}\right) = \frac{e^{x} \cdot 0 - 1 \cdot e^x}{(e^x)^2} = \frac{-e^x}{e^{2x}} = \frac{-1}{e^x} = -e^{-x}$$

[A small red square symbol indicates the end of the example solution.]

### Proof of the Derivative Quotient Rule

$$\frac{d}{dx}\left(\frac{u}{v}\right) = \lim_{h \to 0} \frac{\frac{u(x + h)}{v(x + h)} - \frac{u(x)}{v(x)}}{h}$$
$$= \lim_{h \to 0} \frac{v(x)u(x + h) - u(x)v(x + h)}{hv(x + h)v(x)}$$

To change the last fraction into an equivalent one that contains the difference quotients for the derivatives of $u$ and $v$, we subtract and add $v(x)u(x)$ in the numerator. We then get

$$\frac{d}{dx}\left(\frac{u}{v}\right) = \lim_{h \to 0} \frac{v(x)u(x + h) - v(x)u(x) + v(x)u(x) - u(x)v(x + h)}{hv(x + h)v(x)}$$
$$= \lim_{h \to 0} \frac{v(x)\frac{u(x + h) - u(x)}{h} - u(x)\frac{v(x + h) - v(x)}{h}}{v(x + h)v(x)}.$$

Taking the limits in the numerator and denominator now gives the Quotient Rule. Exercise 74 outlines another proof. [A small red square symbol indicates the end of the proof.]

The choice of which rules to use in solving a differentiation problem can make a difference in how much work you have to do. Here is an example.

**EXAMPLE 9** Find the derivative of
$$y = \frac{(x - 1)(x^2 - 2x)}{x^4}$$

**Solution** Using the Quotient Rule here will result in a complicated expression with many terms. Instead, use some algebra to simplify the expression. First expand the numerator and divide by $x^4$:
$$y = \frac{(x - 1)(x^2 - 2x)}{x^4} = \frac{x^3 - 3x^2 + 2x}{x^4} = x^{-1} - 3x^{-2} + 2x^{-3}.$$

Then use the Sum and Power Rules:
$$\frac{dy}{dx} = -x^{-2} - 3(-2)x^{-3} + 2(-3)x^{-4}$$
$$= -\frac{1}{x^2} + \frac{6}{x^3} - \frac{6}{x^4}.$$

[A small red square symbol indicates the end of the example solution.]

## Second- and Higher-Order Derivatives

If $y = f(x)$ is a differentiable function, then its derivative $f'(x)$ is also a function. If $f'$ is also differentiable, then we can differentiate $f'$ to get a new function of $x$ denoted by $f''$. So $f'' = (f')'$. The function $f''$ is called the **second derivative** of $f$ because it is the derivative of the first derivative. It is written in several ways:
$$f''(x) = \frac{d^2y}{dx^2} = \frac{d}{dx}\left(\frac{dy}{dx}\right) = \frac{dy'}{dx} = y'' = D^2(f)(x) = D_x^2 f(x).$$

The symbol $D^2$ means the operation of differentiation is performed twice.
If $y = x^6$, then $y' = 6x^5$ and we have
$$y'' = \frac{dy'}{dx} = \frac{d}{dx}(6x^5) = 30x^4.$$

Thus $D^2(x^6) = 30x^4$.

<!-- PAGE 22 -->

## Chapter 3: Derivatives

If $y''$ is differentiable, its derivative, $y''' = dy''/dx = d^3y/dx^3$, is the **third derivative** of $y$ with respect to $x$. The names continue as you imagine, with
$$y^{(n)} = \frac{d}{dx} y^{(n-1)} = \frac{d^n y}{dx^n} = D^n y$$
denoting the **$n$th derivative** of $y$ with respect to $x$ for any positive integer $n$.

We can interpret the second derivative as the rate of change of the slope of the tangent to the graph of $y = f(x)$ at each point. You will see in the next chapter that the second derivative reveals whether the graph bends upward or downward from the tangent line as we move off the point of tangency. In the next section, we interpret both the second and third derivatives in terms of motion along a straight line.

### How to Read the Symbols for Derivatives

| Symbol | Read as |
| :--- | :--- |
| $y'$ | "y prime" |
| $y''$ | "y double prime" |
| $\frac{d^2y}{dx^2}$ | "d squared y dx squared" |
| $y'''$ | "y triple prime" |
| $y^{(n)}$ | "y super n" |
| $\frac{d^ny}{dx^n}$ | "d to the n of y by dx to the n" |
| $D^n$ | "D to the n" |

**EXAMPLE 10** The first four derivatives of $y = x^3 - 3x^2 + 2$ are
First derivative: $y' = 3x^2 - 6x$
Second derivative: $y'' = 6x - 6$
Third derivative: $y''' = 6$
Fourth derivative: $y^{(4)} = 0$.

All polynomial functions have derivatives of all orders. In this example, the fifth and later derivatives are all zero. [A small red square symbol indicates the end of the example solution.]

## Exercises 3.3

[Exercises omitted]

<!-- PAGE 23 -->
[Exercises omitted]

<!-- PAGE 24 -->
[Exercises omitted]

## 3.4 The Derivative as a Rate of Change

In Section 2.1 we introduced average and instantaneous rates of change. In this section we study further applications in which derivatives model the rates at which things change. It is natural to think of a quantity changing with respect to time, but other variables can be treated in the same way. For example, an economist may want to study how the cost of producing steel varies with the number of tons produced, or an engineer may want to know how the power output of a generator varies with its temperature.

### Instantaneous Rates of Change

If we interpret the difference quotient $(f(x + h) - f(x))/h$ as the average rate of change in $f$ over the interval from $x$ to $x + h$, we can interpret its limit as $h \to 0$ as the rate at which $f$ is changing at the point $x$.

<!-- PAGE 25 -->

### 3.4 The Derivative as a Rate of Change

**DEFINITION** The instantaneous rate of change of $f$ with respect to $x$ at $x_0$ is the derivative
$$f'(x_0) = \lim_{h \to 0} \frac{f(x_0 + h) - f(x_0)}{h},$$
provided the limit exists.

Thus, instantaneous rates are limits of average rates.

It is conventional to use the word *instantaneous* even when $x$ does not represent time. The word is, however, frequently omitted. When we say *rate of change*, we mean *instantaneous rate of change*.

**EXAMPLE 1** The area $A$ of a circle is related to its diameter by the equation
$$A = \frac{\pi}{4}D^2.$$
How fast does the area change with respect to the diameter when the diameter is 10 m?

**Solution** The rate of change of the area with respect to the diameter is
$$\frac{dA}{dD} = \frac{\pi}{4} \cdot 2D = \frac{\pi D}{2}.$$
When $D = 10 \text{ m}$, the area is changing with respect to the diameter at the rate of $(\pi/2)10 = 5\pi \text{ m}^2/\text{m} \approx 15.71 \text{ m}^2/\text{m}$.

#### Motion Along a Line: Displacement, Velocity, Speed, Acceleration, and Jerk

Suppose that an object (or body, considered as a whole mass) is moving along a coordinate line (an $s$-axis), usually horizontal or vertical, so that we know its position $s$ on that line as a function of time $t$:
$$s = f(t).$$
The displacement of the object over the time interval from $t$ to $t + \Delta t$ (Figure 3.14) is
$$\Delta s = f(t + \Delta t) - f(t),$$
and the average velocity of the object over that time interval is
$$v_{av} = \frac{\text{displacement}}{\text{travel time}} = \frac{\Delta s}{\Delta t} = \frac{f(t + \Delta t) - f(t)}{\Delta t}.$$
To find the body's velocity at the exact instant $t$, we take the limit of the average velocity over the interval from $t$ to $t + \Delta t$ as $\Delta t$ shrinks to zero. This limit is the derivative of $f$ with respect to $t$.

[**FIGURE 3.14** This figure is a horizontal coordinate line labeled $s$. A point at $t$ is marked as $s = f(t)$. A second point to the right is marked as $s + \Delta s = f(t + \Delta t)$. A red bracket between these two points indicates the displacement $\Delta s$. The caption reads: "The positions of a body moving along a coordinate line at time $t$ and shortly later at time $t + \Delta t$. Here the coordinate line is horizontal."]

**DEFINITION** Velocity (instantaneous velocity) is the derivative of position with respect to time. If a body's position at time $t$ is $s = f(t)$, then the body's velocity at time $t$ is
$$v(t) = \frac{ds}{dt} = \lim_{\Delta t \to 0} \frac{f(t + \Delta t) - f(t)}{\Delta t}.$$

<!-- PAGE 26 -->

Besides telling how fast an object is moving along the horizontal line in Figure 3.14, its velocity tells the direction of motion. When the object is moving forward ($s$ increasing), the velocity is positive; when the object is moving backward ($s$ decreasing), the velocity is negative. If the coordinate line is vertical, the object moves upward for positive velocity and downward for negative velocity. The blue curves in Figure 3.15 represent position along the line over time; they do not portray the path of motion, which lies along the vertical $s$-axis.

If we drive to a friend's house and back at 30 mph, say, the speedometer will show 30 on the way over but it will not show $-30$ on the way back, even though our distance from home is decreasing. The speedometer always shows *speed*, which is the absolute value of velocity. Speed measures the rate of progress regardless of direction.

#### HISTORICAL BIOGRAPHY
Bernard Bolzano
(1781–1848)

[**FIGURE 3.15** This figure contains two coordinate plane graphs labeled (a) and (b). 
- Graph (a) shows an $s$ vs $t$ plot where a blue curve $s = f(t)$ rises from the origin. A tangent line is drawn with a positive slope, annotated as $ds/dt > 0$. The caption for (a) reads: "$s$ increasing: positive slope so moving upward".
- Graph (b) shows an $s$ vs $t$ plot where a blue curve $s = f(t)$ falls toward the $t$-axis. A tangent line is drawn with a negative slope, annotated as $ds/dt < 0$. The caption for (b) reads: "$s$ decreasing: negative slope so moving downward".
The main caption for Figure 3.15 reads: "For motion $s = f(t)$ along a straight line (the vertical axis), $v = ds/dt$ is (a) positive when $s$ increases and (b) negative when $s$ decreases."]

**DEFINITION** Speed is the absolute value of velocity.
$$\text{Speed} = |v(t)| = \left| \frac{ds}{dt} \right|$$

**EXAMPLE 2** Figure 3.16 shows the graph of the velocity $v = f'(t)$ of a particle moving along a horizontal line (as opposed to showing a position function $s = f(t)$ such as in Figure 3.15). In the graph of the velocity function, it's not the slope of the curve that tells us if the particle is moving forward or backward along the line (which is not shown in the figure), but rather the sign of the velocity. Looking at Figure 3.16, we see that the particle moves forward for the first 3 sec (when the velocity is positive), moves backward for the next 2 sec (the velocity is negative), stands motionless for a full second, and then moves forward again. The particle is speeding up when its positive velocity increases during the first second, moves at a steady speed during the next second, and then slows down as the velocity decreases to zero during the third second. It stops for an instant at $t = 3 \text{ sec}$ (when the velocity is zero) and reverses direction as the velocity starts to become negative. The particle is now moving backward and gaining in speed until $t = 4 \text{ sec}$, at which time it achieves its greatest speed during its backward motion. Continuing its backward motion at time $t = 4$, the particle starts to slow down again until it finally stops at $t = 5$ (when the velocity is once again zero). The particle now remains motionless for one full second, and then moves forward again at $t = 6 \text{ sec}$, speeding up during the final second of the forward motion indicated in the velocity graph.

The rate at which a body's velocity changes is the body's **acceleration**. The acceleration measures how quickly the body picks up or loses speed. In Chapter 13 we will study motion in the plane and in space, where acceleration of an object may also lead to a change in direction.

A sudden change in acceleration is called a **jerk**. When a ride in a car or a bus is jerky, it is not that the accelerations involved are necessarily large but that the changes in acceleration are abrupt.

**DEFINITIONS** **Acceleration** is the derivative of velocity with respect to time. If a body's position at time $t$ is $s = f(t)$, then the body's acceleration at time $t$ is
$$a(t) = \frac{dv}{dt} = \frac{d^2s}{dt^2}.$$
**Jerk** is the derivative of acceleration with respect to time:
$$j(t) = \frac{da}{dt} = \frac{d^3s}{dt^3}.$$

Near the surface of Earth all bodies fall with the same constant acceleration. Galileo's experiments with free fall (see Section 2.1) lead to the equation
$$s = \frac{1}{2}gt^2,$$

<!-- PAGE 27 -->

### 3.4 The Derivative as a Rate of Change

[Figure 3.16: A line graph showing velocity $v$ as a function of time $t$ in seconds. The horizontal axis is labeled $t$ (sec) from 0 to 7, and the vertical axis is labeled $v$. The graph consists of several phases:
- From $t=0$ to $t=1$: The curve rises, labeled "Speeds up" under the region "MOVES FORWARD ($v > 0$)".
- From $t=1$ to $t=2$: The curve is a horizontal line, labeled "Steady ($v = \text{const}$)".
- From $t=2$ to $t=3$: The curve drops toward the $t$-axis, labeled "Slows down".
- From $t=3$ to $t=6$: The curve goes below the $t$-axis, labeled "MOVES BACKWARD ($v < 0$)". Within this, from $t=3$ to $t \approx 4.5$ it is labeled "Speeds up" (moving further from the axis), reaches a "Greatest speed" at the trough, and from $t \approx 4.5$ to $t=6$ it is labeled "Slows down" (returning toward the axis).
- At $t=6$: The curve crosses the $t$-axis, labeled "Stands still ($v = 0$)".
- From $t=6$ to $t=7$: The curve rises above the axis, labeled "FORWARD AGAIN ($v > 0$)" and "Speeds up".]

**FIGURE 3.16** The velocity graph of a particle moving along a horizontal line, discussed in Example 2.

where $s$ is the distance fallen and $g$ is the acceleration due to Earth’s gravity. This equation holds in a vacuum, where there is no air resistance, and closely models the fall of dense, heavy objects, such as rocks or steel tools, for the first few seconds of their fall, before the effects of air resistance are significant.

The value of $g$ in the equation $s = (1/2)gt^{2}$ depends on the units used to measure $t$ and $s$. With $t$ in seconds (the usual unit), the value of $g$ determined by measurement at sea level is approximately $32\text{ ft/sec}^{2}$ (feet per second squared) in English units, and $g = 9.8\text{ m/sec}^{2}$ (meters per second squared) in metric units. (These gravitational constants depend on the distance from Earth’s center of mass, and are slightly lower on top of Mt. Everest, for example.)

The jerk associated with the constant acceleration of gravity ($g = 32\text{ ft/sec}^{2}$) is zero:
$$j = \frac{d}{dt}(g) = 0.$$
An object does not exhibit jerkiness during free fall.

**EXAMPLE 3** Figure 3.17 shows the free fall of a heavy ball bearing released from rest at time $t = 0\text{ sec}$.
(a) How many meters does the ball fall in the first 3 sec?
(b) What is its velocity, speed, and acceleration when $t = 3$?

**Solution**
(a) The metric free-fall equation is $s = 4.9t^{2}$. During the first 3 sec, the ball falls
$$s(3) = 4.9(3)^{2} = 44.1\text{ m.}$$
(b) At any time $t$, velocity is the derivative of position:
$$v(t) = s'(t) = \frac{d}{dt}(4.9t^{2}) = 9.8t.$$

[Figure 3.17: A vertical diagram showing the descent of a ball bearing. A vertical scale is provided on the right labeled $s$ (meters) ranging from 0 to 45.
- At $t = 0$ seconds, a red ball is at $s = 0$.
- At $t = 1$ second, the ball is at $s = 5$.
- At $t = 2$ seconds, the ball is at $s = 20$.
- At $t = 3$ seconds, the ball is at $s = 45$.
The labels on the left are $t$ (seconds) and the labels on the right are $s$ (meters).]

**FIGURE 3.17** A ball bearing falling from rest (Example 3).

<!-- PAGE 28 -->

At $t = 3$, the velocity is
$$v(3) = 29.4\text{ m/sec}$$
in the downward (increasing $s$) direction. The speed at $t = 3$ is
$$\text{speed} = |v(3)| = 29.4\text{ m/sec.}$$
The acceleration at any time $t$ is
$$a(t) = v'(t) = s''(t) = 9.8\text{ m/sec}^{2}.$$
At $t = 3$, the acceleration is $9.8\text{ m/sec}^{2}$.

**EXAMPLE 4** A dynamite blast blows a heavy rock straight up with a launch velocity of $160\text{ ft/sec}$ (about $109\text{ mph}$) (Figure 3.18a). It reaches a height of $s = 160t - 16t^{2}\text{ ft}$ after $t\text{ sec}$.
(a) How high does the rock go?
(b) What are the velocity and speed of the rock when it is $256\text{ ft}$ above the ground on the way up? On the way down?
(c) What is the acceleration of the rock at any time $t$ during its flight (after the blast)?
(d) When does the rock hit the ground again?

**Solution**
(a) In the coordinate system we have chosen, $s$ measures height from the ground up, so the velocity is positive on the way up and negative on the way down. The instant the rock is at its highest point is the one instant during the flight when the velocity is 0. To find the maximum height, all we need to do is to find when $v = 0$ and evaluate $s$ at this time.
At any time $t$ during the rock's motion, its velocity is
$$v = \frac{ds}{dt} = \frac{d}{dt}(160t - 16t^{2}) = 160 - 32t\text{ ft/sec.}$$
The velocity is zero when
$$160 - 32t = 0 \quad \text{or} \quad t = 5\text{ sec.}$$
The rock's height at $t = 5\text{ sec}$ is
$$s_{\max} = s(5) = 160(5) - 16(5)^{2} = 800 - 400 = 400\text{ ft.}$$
See Figure 3.18b.

(b) To find the rock's velocity at $256\text{ ft}$ on the way up and again on the way down, we first find the two values of $t$ for which
$$s(t) = 160t - 16t^{2} = 256.$$
To solve this equation, we write
$$16t^{2} - 160t + 256 = 0$$
$$16(t^{2} - 10t + 16) = 0$$
$$(t - 2)(t - 8) = 0$$
$$t = 2\text{ sec}, \quad t = 8\text{ sec.}$$
The rock is $256\text{ ft}$ above the ground $2\text{ sec}$ after the explosion and again $8\text{ sec}$ after the explosion. The rock's velocities at these times are
$$v(2) = 160 - 32(2) = 160 - 64 = 96\text{ ft/sec.}$$
$$v(8) = 160 - 32(8) = 160 - 256 = -96\text{ ft/sec.}$$

[Figure 3.18: Two diagrams.
(a) Shows the vertical trajectory of a rock. A vertical axis $s$ represents Height (ft). The ground is at $s=0$. The rock is shown at height $s=256$ labeled $t=?$, and at the peak $s_{\max}$ where $v=0$.
(b) A coordinate plane showing two graphs against time $t$. The horizontal axis is $t$ from 0 to 10. The vertical axis is labeled $s, v$. 
- A blue parabolic curve representing position $s = 160t - 16t^{2}$ starts at $(0,0)$, peaks at $(5, 400)$, and returns to the axis at $(10,0)$. 
- A gold straight line representing velocity $v = \frac{ds}{dt} = 160 - 32t$ starts at $(0, 160)$, passes through $(5, 0)$, and ends at $(10, -160)$.]

**FIGURE 3.18** (a) The rock in Example 4. (b) The graphs of $s$ and $v$ as functions of time; $s$ is largest when $v = ds/dt = 0$. The graph of $s$ is not the path of the rock: It is a plot of height versus time. The slope of the plot is the rock's velocity, graphed here as a straight line.

<!-- PAGE 29 -->

### 3.4 The Derivative as a Rate of Change 151

At both instants, the rock’s speed is 96 ft/sec. Since $v(2) > 0$, the rock is moving upward ($s$ is increasing) at $t = 2$ sec; it is moving downward ($s$ is decreasing) at $t = 8$ because $v(8) < 0$.

**(c)** At any time during its flight following the explosion, the rock’s acceleration is a constant
$$a = \frac{dv}{dt} = \frac{d}{dt}(160 - 32t) = -32 \text{ ft/sec}^2$$
The acceleration is always downward and is the effect of gravity on the rock. As the rock rises, it slows down; as it falls, it speeds up.

**(d)** The rock hits the ground at the positive time $t$ for which $s = 0$. The equation $160t - 16t^2 = 0$ factors to give $16t(10 - t) = 0$, so it has solutions $t = 0$ and $t = 10$. At $t = 0$, the blast occurred and the rock was thrown upward. It returned to the ground 10 sec later. ⬛

## Derivatives in Economics

Engineers use the terms velocity and acceleration to refer to the derivatives of functions describing motion. Economists, too, have a specialized vocabulary for rates of change and derivatives. They call them marginals.

In a manufacturing operation, the cost of production $c(x)$ is a function of $x$, the number of units produced. The **marginal cost of production** is the rate of change of cost with respect to level of production, so it is $dc/dx$.

Suppose that $c(x)$ represents the dollars needed to produce $x$ tons of steel in one week. It costs more to produce $x + h$ tons per week, and the cost difference, divided by $h$, is the *average cost of producing each additional ton*:
$$\frac{c(x + h) - c(x)}{h} = \text{average cost of each of the additional } h \text{ tons of steel produced.}$$
The limit of this ratio as $h \to 0$ is the *marginal cost* of producing more steel per week when the current weekly production is $x$ tons (Figure 3.19):
$$\frac{dc}{dx} = \lim_{h \to 0} \frac{c(x + h) - c(x)}{h} = \text{marginal cost of production.}$$
Sometimes the marginal cost of production is loosely defined to be the extra cost of producing one additional unit:
$$\frac{\Delta c}{\Delta x} = \frac{c(x + 1) - c(x)}{1}$$
which is approximated by the value of $dc/dx$ at $x$. This approximation is acceptable if the slope of the graph of $c$ does not change quickly near $x$. Then the difference quotient will be close to its limit $dc/dx$, which is the rise in the tangent line if $\Delta x = 1$ (Figure 3.20). The approximation works best for large values of $x$.

Economists often represent a total cost function by a cubic polynomial
$$c(x) = \alpha x^3 + \beta x^2 + \gamma x + \delta$$
where $\delta$ represents *fixed costs*, such as rent, heat, equipment capitalization, and management costs. The other terms represent *variable costs*, such as the costs of raw materials, taxes, and labor. Fixed costs are independent of the number of units produced, whereas variable costs depend on the quantity produced. A cubic polynomial is usually adequate to capture the cost behavior on a realistic quantity interval.

**EXAMPLE 5** Suppose that it costs
$$c(x) = x^3 - 6x^2 + 15x$$

[Figure 3.19: A graph showing Cost $y$ (dollars) on the vertical axis and Production $x$ (tons/week) on the horizontal axis. A blue curve labeled $y = c(x)$ rises from the origin. A red secant line connects a point at $x$ to a point at $x + h$. A blue tangent line at $x$ is shown, labeled "Slope = marginal cost". Labels include $0$, $x$, and $x + h$ on the x-axis. Caption: FIGURE 3.19 Weekly steel production: $c(x)$ is the cost of producing $x$ tons per week. The cost of producing an additional $h$ tons is $c(x + h) - c(x)$.]

[Figure 3.20: A coordinate graph showing a zoomed-in section of the cost curve $y = c(x)$. A horizontal distance $\Delta x = 1$ is marked between $x$ and $x + 1$. A vertical distance $\Delta c$ represents the change in the function value. A tangent line at $x$ shows a vertical rise labeled $dc/dx$. Caption: FIGURE 3.20 The marginal cost $dc/dx$ is approximately the extra cost $\Delta c$ of producing $\Delta x = 1$ more unit.]

<!-- PAGE 30 -->

152 Chapter 3: Derivatives

dollars to produce $x$ radiators when 8 to 30 radiators are produced and that
$$r(x) = x^3 - 3x^2 + 12x$$
gives the dollar revenue from selling $x$ radiators. Your shop currently produces 10 radiators a day. About how much extra will it cost to produce one more radiator a day, and what is your estimated increase in revenue for selling 11 radiators a day?

**Solution** The cost of producing one more radiator a day when 10 are produced is about $c'(10)$:
$$c'(x) = \frac{d}{dx}(x^3 - 6x^2 + 15x) = 3x^2 - 12x + 15$$
$$c'(10) = 3(100) - 12(10) + 15 = 195$$
The additional cost will be about $195. The marginal revenue is
$$r'(x) = \frac{d}{dx}(x^3 - 3x^2 + 12x) = 3x^2 - 6x + 12$$
The marginal revenue function estimates the increase in revenue that will result from selling one additional unit. If you currently sell 10 radiators a day, you can expect your revenue to increase by about
$$r'(10) = 3(100) - 6(10) + 12 = 252$$
if you increase sales to 11 radiators a day. ⬛

**EXAMPLE 6** To get some feel for the language of marginal rates, consider marginal tax rates. If your marginal income tax rate is 28% and your income increases by $1000, you can expect to pay an extra $280 in taxes. This does not mean that you pay 28% of your entire income in taxes. It just means that at your current income level $I$, the rate of increase of taxes $T$ with respect to income is $dT/dI = 0.28$. You will pay $0.28 in taxes out of every extra dollar you earn. Of course, if you earn a lot more, you may land in a higher tax bracket and your marginal rate will increase. ⬛

## Sensitivity to Change

When a small change in $x$ produces a large change in the value of a function $f(x)$, we say that the function is relatively **sensitive** to changes in $x$. The derivative $f'(x)$ is a measure of this sensitivity.

**EXAMPLE 7 Genetic Data and Sensitivity to Change**
The Austrian monk Gregor Johann Mendel (1822–1884), working with garden peas and other plants, provided the first scientific explanation of hybridization.

His careful records showed that if $p$ (a number between 0 and 1) is the frequency of the gene for smooth skin in peas (dominant) and $(1 - p)$ is the frequency of the gene for wrinkled skin in peas, then the proportion of smooth-skinned peas in the next generation will be
$$y = 2p(1 - p) + p^2 = 2p - p^2$$
The graph of $y$ versus $p$ in Figure 3.21a suggests that the value of $y$ is more sensitive to a change in $p$ when $p$ is small than when $p$ is large. Indeed, this fact is borne out by the derivative graph in Figure 3.21b, which shows that $dy/dp$ is close to 2 when $p$ is near 0 and close to 0 when $p$ is near 1.

The implication for genetics is that introducing a few more smooth skin genes into a population where the frequency of wrinkled skin peas is large will have a more dramatic effect on later generations than will a similar increase when the population has a large proportion of smooth skin peas. ⬛

[Figure 3.21: Two coordinate graphs. 
(a) A graph of $y$ vs $p$. The horizontal axis $p$ goes from 0 to 1. The vertical axis $y$ goes from 0 to 1. The curve is a downward-opening parabola $y = 2p - p^2$, starting at $(0,0)$ and ending at $(1,1)$.
(b) A graph of $dy/dp$ vs $p$. The horizontal axis $p$ goes from 0 to 1. The vertical axis $dy/dp$ goes from 0 to 2. The graph is a straight line $dy/dp = 2 - 2p$, starting at $(0,2)$ and ending at $(1,0)$.
Caption: FIGURE 3.21 (a) The graph of $y = 2p - p^2$, describing the proportion of smooth-skinned peas in the next generation. (b) The graph of $dy/dp$ (Example 7).]

<!-- PAGE 31 -->
[Exercises omitted]

<!-- PAGE 32 -->
[Exercises omitted]

<!-- PAGE 33 -->

[Exercises omitted]

<!-- PAGE 34 -->

Chapter 3: Derivatives

[Exercises omitted]

## 3.5 Derivatives of Trigonometric Functions

Many phenomena of nature are approximately periodic (electromagnetic fields, heart rhythms, tides, weather). The derivatives of sines and cosines play a key role in describing periodic changes. This section shows how to differentiate the six basic trigonometric functions.

### Derivative of the Sine Function

To calculate the derivative of $f(x) = \sin x$, for $x$ measured in radians, we combine the limits in Example 5a and Theorem 7 in Section 2.4 with the angle sum identity for the sine function:

$$\sin (x + h) = \sin x \cos h + \cos x \sin h.$$

If $f(x) = \sin x$, then

$$f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h} = \lim_{h \to 0} \frac{\sin (x + h) - \sin x}{h} \quad \text{Derivative definition}$$

$$= \lim_{h \to 0} \frac{(\sin x \cos h + \cos x \sin h) - \sin x}{h}$$

$$= \lim_{h \to 0} \frac{\sin x (\cos h - 1) + \cos x \sin h}{h}$$

$$= \lim_{h \to 0} \left( \sin x \cdot \frac{\cos h - 1}{h} \right) + \lim_{h \to 0} \left( \cos x \cdot \frac{\sin h}{h} \right)$$

$$= \sin x \cdot \lim_{h \to 0} \frac{\cos h - 1}{h} + \cos x \cdot \lim_{h \to 0} \frac{\sin h}{h} = \sin x \cdot 0 + \cos x \cdot 1 = \cos x.$$

limit 0
limit 1
Example 5a and Theorem 7, Section 2.4

<!-- PAGE 35 -->

### 3.5 Derivatives of Trigonometric Functions

> **The derivative of the sine function is the cosine function:**
> $$\frac{d}{dx}(\sin x) = \cos x$$

**EXAMPLE 1** We find derivatives of the sine function involving differences, products, and quotients.

(a) $y = x^{2} - \sin x$:
$$\frac{dy}{dx} = 2x - \frac{d}{dx}(\sin x) \quad \text{Difference Rule}$$
$$= 2x - \cos x$$

(b) $y = e^{x} \sin x$:
$$\frac{dy}{dx} = e^{x} \frac{d}{dx}(\sin x) + \frac{d}{dx}(e^{x}) \sin x \quad \text{Product Rule}$$
$$= e^{x} \cos x + e^{x} \sin x$$
$$= e^{x}(\cos x + \sin x)$$

(c) $y = \frac{\sin x}{x}$:
$$\frac{dy}{dx} = \frac{x \cdot \frac{d}{dx}(\sin x) - \sin x \cdot 1}{x^{2}} \quad \text{Quotient Rule}$$
$$= \frac{x \cos x - \sin x}{x^{2}}$$

#### Derivative of the Cosine Function

With the help of the angle sum formula for the cosine function,
$$\cos(x + h) = \cos x \cos h - \sin x \sin h,$$
we can compute the limit of the difference quotient:

$$\frac{d}{dx}(\cos x) = \lim_{h \to 0} \frac{\cos(x + h) - \cos x}{h} \quad \text{Derivative definition}$$
$$= \lim_{h \to 0} \frac{(\cos x \cos h - \sin x \sin h) - \cos x}{h} \quad \text{Cosine angle sum identity}$$
$$= \lim_{h \to 0} \frac{\cos x(\cos h - 1) - \sin x \sin h}{h}$$
$$= \lim_{h \to 0} \cos x \cdot \frac{\cos h - 1}{h} - \lim_{h \to 0} \sin x \cdot \frac{\sin h}{h}$$
$$= \cos x \cdot \lim_{h \to 0} \frac{\cos h - 1}{h} - \sin x \cdot \lim_{h \to 0} \frac{\sin h}{h}$$
$$= \cos x \cdot 0 - \sin x \cdot 1 \quad \text{Example 5a and Theorem 7, Section 2.4}$$
$$= -\sin x.$$

> **The derivative of the cosine function is the negative of the sine function:**
> $$\frac{d}{dx}(\cos x) = -\sin x$$

[Figure 3.22 contains two vertically stacked coordinate planes. 
Top Graph: The curve $y = \cos x$. The $y$-axis is labeled from $-1$ to $1$. The $x$-axis is labeled with $-\pi, 0, \pi$. The graph is a cosine wave starting at $(0,1)$, crossing the $x$-axis at $\pm \pi/2$, and reaching $-1$ at $\pm \pi$. 
Bottom Graph: The curve $y' = -\sin x$. The $y'$-axis is labeled from $-1$ to $1$. The $x$-axis is labeled with $-\pi, 0, \pi$. The graph is a negative sine wave starting at $(0,0)$, going down to $-1$ at $\pi/2$, and returning to $0$ at $\pi$. Vertical dashed lines connect points of zero slope on the top graph to zeros on the bottom graph.
Caption: **FIGURE 3.22** The curve $y' = -\sin x$ as the graph of the slopes of the tangents to the curve $y = \cos x$.]

Figure 3.22 shows a way to visualize this result in the same way we did for graphing derivatives in Section 3.2, Figure 3.6.

<!-- PAGE 36 -->

**EXAMPLE 2** We find derivatives of the cosine function in combinations with other functions.

(a) $y = 5e^{x} + \cos x$:
$$\frac{dy}{dx} = \frac{d}{dx}(5e^{x}) + \frac{d}{dx}(\cos x) \quad \text{Sum Rule}$$
$$= 5e^{x} - \sin x$$

(b) $y = \sin x \cos x$:
$$\frac{dy}{dx} = \sin x \frac{d}{dx}(\cos x) + \cos x \frac{d}{dx}(\sin x) \quad \text{Product Rule}$$
$$= \sin x(-\sin x) + \cos x(\cos x)$$
$$= \cos^{2} x - \sin^{2} x$$

(c) $y = \frac{\cos x}{1 - \sin x}$:
$$\frac{dy}{dx} = \frac{(1 - \sin x) \frac{d}{dx}(\cos x) - \cos x \frac{d}{dx}(1 - \sin x)}{(1 - \sin x)^{2}} \quad \text{Quotient Rule}$$
$$= \frac{(1 - \sin x)(-\sin x) - \cos x(0 - \cos x)}{(1 - \sin x)^{2}}$$
$$= \frac{1 - \sin x}{(1 - \sin x)^{2}} \quad \sin^{2} x + \cos^{2} x = 1$$
$$= \frac{1}{1 - \sin x}$$

#### Simple Harmonic Motion

The motion of an object or weight bobbing freely up and down with no resistance on the end of a spring is an example of *simple harmonic motion*. The motion is periodic and repeats indefinitely, so we represent it using trigonometric functions. The next example describes a case in which there are no opposing forces such as friction to slow the motion.

[Figure 3.23 depicts a mechanical system. On the left, a purple cylindrical weight is attached to a vertical spring hanging from a ceiling. To the right of the spring is a vertical $s$-axis. The axis has markers: $5$ at the top, $0$ labeled "Rest position" in the middle, and $-5$ at the bottom labeled "Position at $t = 0$". A red arrow points down from the rest position to the $-5$ position, and a blue double-headed arrow indicates the vertical range of oscillation between $-5$ and $5$.
Caption: **FIGURE 3.23** A weight hanging from a vertical spring and then displaced oscillates above and below its rest position (Example 3).]

**EXAMPLE 3** A weight hanging from a spring (Figure 3.23) is stretched down 5 units beyond its rest position and released at time $t = 0$ to bob up and down. Its position at any later time $t$ is
$$s = 5 \cos t.$$
What are its velocity and acceleration at time $t$?

**Solution** We have
Position: $s = 5 \cos t$
Velocity: $v = \frac{ds}{dt} = \frac{d}{dt}(5 \cos t) = -5 \sin t$
Acceleration: $a = \frac{dv}{dt} = \frac{d}{dt}(-5 \sin t) = -5 \cos t.$

Notice how much we can learn from these equations:
1. As time passes, the weight moves down and up between $s = -5$ and $s = 5$ on the $s$-axis. The amplitude of the motion is 5. The period of the motion is $2\pi$, the period of the cosine function.
2. The velocity $v = -5 \sin t$ attains its greatest magnitude, 5, when $\cos t = 0$, as the graphs show in Figure 3.24. Hence, the speed of the weight, $|v| = 5|\sin t|$, is greatest

<!-- PAGE 37 -->

## 3.5 Derivatives of Trigonometric Functions

when $\cos t = 0$, that is, when $s = 0$ (the rest position). The speed of the weight is zero when $\sin t = 0$. This occurs when $s = 5 \cos t = \pm 5$, at the endpoints of the interval of motion.

3. The weight is acted on by the spring and by gravity. When the weight is below the rest position, the combined forces pull it up, and when it is above the rest position, they pull it down. The weight’s acceleration is always proportional to the negative of its displacement. This property of springs is called **Hooke’s Law**, and is studied further in Section 6.5.
4. The acceleration, $a = -5 \cos t$, is zero only at the rest position, where $\cos t = 0$ and the force of gravity and the force from the spring balance each other. When the weight is anywhere else, the two forces are unequal and acceleration is nonzero. The acceleration is greatest in magnitude at the points farthest from the rest position, where $\cos t = \pm 1$.

[Figure 3.24: The graphs of the position and velocity of the weight in Example 3. The image shows a Cartesian coordinate system. The horizontal axis represents time $t$, with labeled ticks at $\frac{\pi}{2}$, $\pi$, $\frac{3\pi}{2}$, $2\pi$, and $\frac{5\pi}{2}$. The vertical axis represents $s, v$ with labeled ticks at $5$, $0$, and $-5$. Two periodic curves are plotted. The blue curve, labeled $s = 5 \cos t$, starts at $(0, 5)$, crosses the $t$-axis at $\frac{\pi}{2}$, reaches a minimum of $-5$ at $\pi$, crosses the axis again at $\frac{3\pi}{2}$, and reaches a maximum of $5$ at $2\pi$. The red curve, labeled $v = -5 \sin t$, starts at $(0, 0)$, reaches a minimum of $-5$ at $\frac{\pi}{2}$, crosses the $t$-axis at $\pi$, reaches a maximum of $5$ at $\frac{3\pi}{2}$, and crosses the axis again at $2\pi$.]

**EXAMPLE 4** The jerk associated with the simple harmonic motion in Example 3 is
$$j = \frac{da}{dt} = \frac{d}{dt}(-5 \cos t) = 5 \sin t.$$
It has its greatest magnitude when $\sin t = \pm 1$, not at the extremes of the displacement but at the rest position, where the acceleration changes direction and sign.

### Derivatives of the Other Basic Trigonometric Functions

Because $\sin x$ and $\cos x$ are differentiable functions of $x$, the related functions
$$\tan x = \frac{\sin x}{\cos x}, \cot x = \frac{\cos x}{\sin x}, \sec x = \frac{1}{\cos x}, \text{ and } \csc x = \frac{1}{\sin x}$$
are differentiable at every value of $x$ at which they are defined. Their derivatives, calculated from the Quotient Rule, are given by the following formulas. Notice the negative signs in the derivative formulas for the cofunctions.

**The derivatives of the other trigonometric functions:**
| $\frac{d}{dx}(\tan x) = \sec^2 x$ | $\frac{d}{dx}(\cot x) = -\csc^2 x$ |
| :--- | :--- |
| $\frac{d}{dx}(\sec x) = \sec x \tan x$ | $\frac{d}{dx}(\csc x) = -\csc x \cot x$ |

To show a typical calculation, we find the derivative of the tangent function. The other derivations are left to Exercise 60.

**EXAMPLE 5** Find $d(\tan x)/dx$.

**Solution** We use the Derivative Quotient Rule to calculate the derivative:
$$\frac{d}{dx}(\tan x) = \frac{d}{dx}\left(\frac{\sin x}{\cos x}\right) = \frac{\cos x \frac{d}{dx}(\sin x) - \sin x \frac{d}{dx}(\cos x)}{\cos^2 x} \text{ Quotient Rule}$$
$$= \frac{\cos x \cos x - \sin x(-\sin x)}{\cos^2 x}$$
$$= \frac{\cos^2 x + \sin^2 x}{\cos^2 x}$$
$$= \frac{1}{\cos^2 x} = \sec^2 x.$$

<!-- PAGE 38 -->

## Chapter 3: Derivatives

**EXAMPLE 6** Find $y''$ if $y = \sec x$.

**Solution** Finding the second derivative involves a combination of trigonometric derivatives.
$$y = \sec x$$
$$y' = \sec x \tan x \text{ Derivative rule for secant function}$$
$$y'' = \frac{d}{dx}(\sec x \tan x)$$
$$= \sec x \frac{d}{dx}(\tan x) + \tan x \frac{d}{dx}(\sec x) \text{ Derivative Product Rule}$$
$$= \sec x(\sec^2 x) + \tan x(\sec x \tan x) \text{ Derivative rules}$$
$$= \sec^3 x + \sec x \tan^2 x$$

The differentiability of the trigonometric functions throughout their domains gives another proof of their continuity at every point in their domains (Theorem 1, Section 3.2). So we can calculate limits of algebraic combinations and composites of trigonometric functions by direct substitution.

**EXAMPLE 7** We can use direct substitution in computing limits provided there is no division by zero, which is algebraically undefined.
$$\lim_{x \to 0} \frac{\sqrt{2 + \sec x}}{\cos(\pi - \tan x)} = \frac{\sqrt{2 + \sec 0}}{\cos(\pi - \tan 0)} = \frac{\sqrt{2 + 1}}{\cos(\pi - 0)} = \frac{\sqrt{3}}{-1} = -\sqrt{3}$$

### Exercises 3.5

[Exercises omitted]

<!-- PAGE 39 -->
[Exercises omitted]

<!-- PAGE 40 -->
## Chapter 3: Derivatives
[Exercises omitted]
### 65. Centered difference quotients
The centered difference quotient
$$\frac{f(x + h) - f(x - h)}{2h}$$
is used to approximate $f'(x)$ in numerical work because (1) its limit as $h \to 0$ equals $f'(x)$ when $f'(x)$ exists, and (2) it usually gives a better approximation of $f'(x)$ for a given value of $h$ than the difference quotient
$$\frac{f(x + h) - f(x)}{h}.$$
See the accompanying figure.
[Figure Description: A graph illustrates the geometric interpretation of the centered difference quotient compared to the standard difference quotient. A blue curve represents the function $y = f(x)$. Point $C$ is located at $(x, f(x))$, point $A$ is at $(x - h, f(x - h))$, and point $B$ is at $(x + h, f(x + h))$. The horizontal distance between $x - h$ and $x$ is marked $h$, and the distance between $x$ and $x + h$ is also marked $h$. Three lines are shown with their respective slopes: a tangent line at point $C$ labeled "Slope = $f'(x)$"; a secant line connecting points $C$ and $B$ labeled "Slope = $\frac{f(x + h) - f(x)}{h}$"; and a secant line connecting points $A$ and $B$ labeled "Slope = $\frac{f(x + h) - f(x - h)}{2h}$".]
[Exercises omitted]
### 66. A caution about centered difference quotients (Continuation of Exercise 65.)
The quotient
$$\frac{f(x + h) - f(x - h)}{2h}$$
may have a limit as $h \to 0$ when $f$ has no derivative at $x$. As a case in point, take $f(x) = |x|$ and calculate
$$\lim_{h \to 0} \frac{|0 + h| - |0 - h|}{2h}.$$
As you will see, the limit exists even though $f(x) = |x|$ has no derivative at $x = 0$. Moral: Before using a centered difference quotient, be sure the derivative exists.
[Exercises omitted]

<!-- PAGE 41 -->

# 3.6 The Chain Rule

How do we differentiate $F(x) = \sin(x^2 - 4)$? This function is the composite $f \circ g$ of two functions $y = f(u) = \sin u$ and $u = g(x) = x^2 - 4$ that we know how to differentiate. The answer, given by the Chain Rule, says that the derivative is the product of the derivatives of $f$ and $g$. We develop the rule in this section.

### Derivative of a Composite Function

The function $y = \frac{3}{2}x = \frac{1}{2}(3x)$ is the composite of the functions $y = \frac{1}{2}u$ and $u = 3x$. We have

$$\frac{dy}{dx} = \frac{3}{2}, \quad \frac{dy}{du} = \frac{1}{2}, \quad \text{and} \quad \frac{du}{dx} = 3.$$

Since $\frac{3}{2} = \frac{1}{2} \cdot 3$, we see in this case that

$$\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}.$$

If we think of the derivative as a rate of change, our intuition allows us to see that this relationship is reasonable. If $y = f(u)$ changes half as fast as $u$ and $u = g(x)$ changes three times as fast as $x$, then we expect $y$ to change $3/2$ times as fast as $x$. This effect is much like that of a multiple gear train (Figure 3.25). Let’s look at another example.

[**Image Description Figure 3.25**: A diagram of three interlocking gears.
- Gear 1 (left, red color, labeled "1"): Smallest gear, associated with "C: y turns".
- Gear 2 (middle, grey color, labeled "2"): Medium gear, associated with "B: u turns".
- Gear 3 (right, light blue color, labeled "3"): Largest gear, associated with "A: x turns".
**Caption**: **FIGURE 3.25** When gear A makes $x$ turns, gear B makes $u$ turns and gear C makes $y$ turns. By comparing circumferences or counting teeth, we see that $y = u/2$ (C turns one-half turn for each B turn) and $u = 3x$ (B turns three times for A’s one), so $y = 3x/2$. Thus, $dy/dx = 3/2 = (1/2)(3) = (dy/du)(du/dx)$.]

**EXAMPLE 1** The function
$$y = (3x^2 + 1)^2$$
is the composite of $y = f(u) = u^2$ and $u = g(x) = 3x^2 + 1$. Calculating derivatives, we see that
$$\frac{dy}{du} \cdot \frac{du}{dx} = 2u \cdot 6x$$
$$= 2(3x^2 + 1) \cdot 6x \quad \text{Substitute for } u$$
$$= 36x^3 + 12x.$$

Calculating the derivative from the expanded formula $(3x^2 + 1)^2 = 9x^4 + 6x^2 + 1$ gives the same result:
$$\frac{dy}{dx} = \frac{d}{dx}(9x^4 + 6x^2 + 1)$$
$$= 36x^3 + 12x.$$ ■

The derivative of the composite function $f(g(x))$ at $x$ is the derivative of $f$ at $g(x)$ times the derivative of $g$ at $x$. This is known as the Chain Rule (Figure 3.26).

[**Image Description Figure 3.26**: A process diagram illustrating the Chain Rule through rates of change. 
- A point $x$ maps to $u = g(x)$ via a function $g$ (indicated by a red arrow). Below this arrow, it says: "Rate of change at $x$ is $g'(x)$."
- The point $u = g(x)$ maps to $y = f(u) = f(g(x))$ via a function $f$ (indicated by a blue arrow). Below this arrow, it says: "Rate of change at $g(x)$ is $f'(g(x))$."
- A large overhead arc represents the composite function "Composite $f \circ g$". Above this arc, it says: "Rate of change at $x$ is $f'(g(x)) \cdot g'(x)$."
**Caption**: **FIGURE 3.26** Rates of change multiply: The derivative of $f \circ g$ at $x$ is the derivative of $f$ at $g(x)$ times the derivative of $g$ at $x$.]

<!-- PAGE 42 -->

**THEOREM 2—The Chain Rule** If $f(u)$ is differentiable at the point $u = g(x)$ and $g(x)$ is differentiable at $x$, then the composite function $(f \circ g)(x) = f(g(x))$ is differentiable at $x$, and
$$(f \circ g)'(x) = f'(g(x)) \cdot g'(x).$$
In Leibniz’s notation, if $y = f(u)$ and $u = g(x)$, then
$$\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx},$$
where $dy/du$ is evaluated at $u = g(x)$.

### A Proof of One Case of the Chain Rule:

Let $\Delta u$ be the change in $u$ when $x$ changes by $\Delta x$, so that
$$\Delta u = g(x + \Delta x) - g(x).$$
Then the corresponding change in $y$ is
$$\Delta y = f(u + \Delta u) - f(u).$$
If $\Delta u \neq 0$, we can write the fraction $\Delta y/\Delta x$ as the product
$$\frac{\Delta y}{\Delta x} = \frac{\Delta y}{\Delta u} \cdot \frac{\Delta u}{\Delta x} \quad (1)$$
and take the limit as $\Delta x \to 0$:
$$\frac{dy}{dx} = \lim_{\Delta x \to 0} \frac{\Delta y}{\Delta x}$$
$$= \lim_{\Delta x \to 0} \left( \frac{\Delta y}{\Delta u} \cdot \frac{\Delta u}{\Delta x} \right)$$
$$= \lim_{\Delta x \to 0} \frac{\Delta y}{\Delta u} \cdot \lim_{\Delta x \to 0} \frac{\Delta u}{\Delta x}$$
$$= \lim_{\Delta u \to 0} \frac{\Delta y}{\Delta u} \cdot \lim_{\Delta x \to 0} \frac{\Delta u}{\Delta x} \quad \text{(Note that } \Delta u \to 0 \text{ as } \Delta x \to 0 \text{ since } g \text{ is continuous.)}$$
$$= \frac{dy}{du} \cdot \frac{du}{dx}.$$

The problem with this argument is that if the function $g(x)$ oscillates rapidly near $x$, then $\Delta u$ can be zero even when $\Delta x \neq 0$, so the cancelation of $\Delta u$ in Equation (1) would be invalid. A complete proof requires a different approach that avoids this problem, and we give one such proof in Section 3.11. ■

**EXAMPLE 2** An object moves along the $x$-axis so that its position at any time $t \geq 0$ is given by $x(t) = \cos(t^2 + 1)$. Find the velocity of the object as a function of $t$.

**Solution** We know that the velocity is $dx/dt$. In this instance, $x$ is a composite function: $x = \cos(u)$ and $u = t^2 + 1$. We have
$$\frac{dx}{du} = -\sin(u) \quad x = \cos(u)$$
$$\frac{du}{dt} = 2t. \quad u = t^2 + 1$$

<!-- PAGE 43 -->

## 3.6 The Chain Rule

By the Chain Rule,

$$\frac{dx}{dt} = \frac{dx}{du} \cdot \frac{du}{dt}$$
$$= -\sin(u) \cdot 2t$$
$$= -\sin(t^2 + 1) \cdot 2t$$
$$= -2t \sin(t^2 + 1)$$

[Note: To the right of the second line of the calculation, there is a blue annotation: $\frac{dx}{du}$ evaluated at $u$. A small red square at the end of the calculation indicates the end of the solution.]

### Ways to Write the Chain Rule

[Note: This section appears in a sidebar box.]

*   $(f \circ g)'(x) = f'(g(x)) \cdot g'(x)$
*   $\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}$
*   $\frac{dy}{dx} = f'(g(x)) \cdot g'(x)$
*   $\frac{d}{dx} f(u) = f'(u) \frac{du}{dx}$

---

### “Outside-Inside” Rule

A difficulty with the Leibniz notation is that it doesn’t state specifically where the derivatives in the Chain Rule are supposed to be evaluated. So it sometimes helps to think about the Chain Rule using functional notation. If $y = f(g(x))$, then

$$\frac{dy}{dx} = f'(g(x)) \cdot g'(x)$$

In words, differentiate the “outside” function $f$ and evaluate it at the “inside” function $g(x)$ left alone; then multiply by the derivative of the “inside function.”

#### EXAMPLE 3
Differentiate $\sin(x^2 + e^x)$ with respect to $x$.

**Solution**
We apply the Chain Rule directly and find

$$\frac{d}{dx} \sin(x^2 + e^x) = \cos(x^2 + e^x) \cdot (2x + e^x)$$

[Diagram note: Below the equation, blue text and brackets provide labels:
- "inside" points to $(x^2 + e^x)$ within the sine function.
- "inside left alone" points to $(x^2 + e^x)$ within the cosine function.
- "derivative of the inside" points to the $(2x + e^x)$ term.
A small red square follows the solution.]

#### EXAMPLE 4
Differentiate $y = e^{\cos x}$.

**Solution**
Here the inside function is $u = g(x) = \cos x$ and the outside function is the exponential function $f(x) = e^x$. Applying the Chain Rule, we get

$$\frac{dy}{dx} = \frac{d}{dx} (e^{\cos x}) = e^{\cos x} \frac{d}{dx} (\cos x) = e^{\cos x}(-\sin x) = -e^{\cos x} \sin x$$

[Note: A small red square follows the solution.]

Generalizing Example 4, we see that the Chain Rule gives the formula

$$\frac{d}{dx} e^u = e^u \frac{du}{dx}$$

For example,

$$\frac{d}{dx} (e^{kx}) = e^{kx} \cdot \frac{d}{dx} (kx) = ke^{kx}, \text{ for any constant } k$$

and

$$\frac{d}{dx} (e^{x^2}) = e^{x^2} \cdot \frac{d}{dx} (x^2) = 2x e^{x^2}$$

### Repeated Use of the Chain Rule

We sometimes have to use the Chain Rule two or more times to find a derivative.

<!-- PAGE 44 -->

### Chapter 3: Derivatives

[Note: A sidebar at the top left contains the following:]
**HISTORICAL BIOGRAPHY**
Johann Bernoulli
(1667–1748)

#### EXAMPLE 5
Find the derivative of $g(t) = \tan(5 - \sin 2t)$.

**Solution**
Notice here that the tangent is a function of $5 - \sin 2t$, whereas the sine is a function of $2t$, which is itself a function of $t$. Therefore, by the Chain Rule,

$$g'(t) = \frac{d}{dt} (\tan(5 - \sin 2t))$$
$$= \sec^2(5 - \sin 2t) \cdot \frac{d}{dt}(5 - \sin 2t)$$
[Note: Blue label to the right: Derivative of $\tan u$ with $u = 5 - \sin 2t$]
$$= \sec^2(5 - \sin 2t) \cdot \left(0 - \cos 2t \cdot \frac{d}{dt}(2t)\right)$$
[Note: Blue label to the right: Derivative of $5 - \sin u$ with $u = 2t$]
$$= \sec^2(5 - \sin 2t) \cdot (-\cos 2t) \cdot 2$$
$$= -2(\cos 2t) \sec^2(5 - \sin 2t)$$

[Note: A small red square follows the solution.]

### The Chain Rule with Powers of a Function

If $f$ is a differentiable function of $u$ and if $u$ is a differentiable function of $x$, then substituting $y = f(u)$ into the Chain Rule formula

$$\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}$$

leads to the formula

$$\frac{d}{dx} f(u) = f'(u) \frac{du}{dx}$$

If $n$ is any real number and $f$ is a power function, $f(u) = u^n$, the Power Rule tells us that $f'(u) = nu^{n-1}$. If $u$ is a differentiable function of $x$, then we can use the Chain Rule to extend this to the Power Chain Rule:

$$\frac{d}{dx} (u^n) = nu^{n-1} \frac{du}{dx}$$

[Note: A blue label to the right of the formula reads: $\frac{d}{du} (u^n) = nu^{n-1}$]

#### EXAMPLE 6
The Power Chain Rule simplifies computing the derivative of a power of an expression.

(a) $\frac{d}{dx} (5x^3 - x^4)^7 = 7(5x^3 - x^4)^6 \frac{d}{dx} (5x^3 - x^4)$
[Note: Blue label to the right: Power Chain Rule with $u = 5x^3 - x^4, n = 7$]
$$= 7(5x^3 - x^4)^6(5 \cdot 3x^2 - 4x^3)$$
$$= 7(5x^3 - x^4)^6(15x^2 - 4x^3)$$

(b) $\frac{d}{dx} \left( \frac{1}{3x - 2} \right) = \frac{d}{dx} (3x - 2)^{-1}$
$$= -1(3x - 2)^{-2} \frac{d}{dx} (3x - 2)$$
[Note: Blue label to the right: Power Chain Rule with $u = 3x - 2, n = -1$]
$$= -1(3x - 2)^{-2}(3)$$
$$= -\frac{3}{(3x - 2)^2}$$

In part (b) we could also find the derivative with the Derivative Quotient Rule.

(c) $\frac{d}{dx} (\sin^5 x) = 5 \sin^4 x \cdot \frac{d}{dx} \sin x$
[Note: Blue label to the right: Power Chain Rule with $u = \sin x, n = 5$, because $\sin^n x$ means $(\sin x)^n, n \neq -1$.]
$$= 5 \sin^4 x \cos x$$

<!-- PAGE 45 -->

## 3.6 The Chain Rule

(d) $$\frac{d}{dx}(e^{\sqrt{3x+1}}) = e^{\sqrt{3x+1}} \cdot \frac{d}{dx}(\sqrt{3x+1})$$
$$= e^{\sqrt{3x+1}} \cdot \frac{1}{2}(3x+1)^{-1/2} \cdot 3 \quad \text{Power Chain Rule with } u = 3x + 1, n = 1/2$$
$$= \frac{3}{2\sqrt{3x+1}} e^{\sqrt{3x+1}}$$

#### Derivative of the Absolute Value Function
$$\frac{d}{dx}(|x|) = \frac{x}{|x|}, \quad x \neq 0$$
$$= \begin{cases} 1, & x > 0 \\ -1, & x < 0 \end{cases}$$

**EXAMPLE 7** In Section 3.2, we saw that the absolute value function $y = |x|$ is not differentiable at $x = 0$. However, the function is differentiable at all other real numbers, as we now show. Since $|x| = \sqrt{x^2}$, we can derive the following formula:
$$\frac{d}{dx}(|x|) = \frac{d}{dx}\sqrt{x^2}$$
$$= \frac{1}{2\sqrt{x^2}} \cdot \frac{d}{dx}(x^2) \quad \text{Power Chain Rule with } u = x^2, n = 1/2, x \neq 0$$
$$= \frac{1}{2|x|} \cdot 2x \quad \sqrt{x^2} = |x|$$
$$= \frac{x}{|x|}, \quad x \neq 0.$$

**EXAMPLE 8** Show that the slope of every line tangent to the curve $y = 1/(1 - 2x)^3$ is positive.

**Solution** We find the derivative:
$$\frac{dy}{dx} = \frac{d}{dx}(1 - 2x)^{-3}$$
$$= -3(1 - 2x)^{-4} \cdot \frac{d}{dx}(1 - 2x) \quad \text{Power Chain Rule with } u = (1 - 2x), n = -3$$
$$= -3(1 - 2x)^{-4} \cdot (-2)$$
$$= \frac{6}{(1 - 2x)^4}.$$
At any point $(x, y)$ on the curve, the coordinate $x$ is not $1/2$ and the slope of the tangent line is
$$\frac{dy}{dx} = \frac{6}{(1 - 2x)^4},$$
which is the quotient of two positive numbers.

**EXAMPLE 9** The formulas for the derivatives of both $\sin x$ and $\cos x$ were obtained under the assumption that $x$ is measured in radians, not degrees. The Chain Rule gives us new insight into the difference between the two. Since $180^\circ = \pi$ radians, $x^\circ = \pi x/180$ radians where $x^\circ$ is the size of the angle measured in degrees.
By the Chain Rule,
$$\frac{d}{dx} \sin(x^\circ) = \frac{d}{dx} \sin\left(\frac{\pi x}{180}\right) = \frac{\pi}{180} \cos\left(\frac{\pi x}{180}\right) = \frac{\pi}{180} \cos(x^\circ).$$
See Figure 3.27. Similarly, the derivative of $\cos(x^\circ)$ is $-(\pi/180) \sin(x^\circ)$.
The factor $\pi/180$ would compound with repeated differentiation, showing an advantage for the use of radian measure in computations.

<!-- PAGE 46 -->

## Chapter 3: Derivatives

[Figure 3.27: This image contains a Cartesian coordinate system showing two overlaid sine functions. The x-axis represents values in radians/degrees, and the y-axis represents the function value.
1. A high-frequency sine wave, labeled $y = \sin x$, oscillates rapidly.
2. A very low-frequency sine wave, labeled $y = \sin(x^\circ) = \sin \frac{\pi x}{180}$, appears as a very shallow curve compared to the standard sine wave.
3. A tangent line is shown at the origin $(0,0)$ for the curve $y = \sin(x^\circ)$.
4. The x-axis is labeled with "180" and "x".
5. The y-axis is labeled with "y".
6. A bracket highlights the shallow slope near the origin with the value $\frac{\pi}{180}$.]

**FIGURE 3.27** The function $\sin(x^\circ)$ oscillates only $\pi/180$ times as often as $\sin x$ oscillates. Its maximum slope is $\pi/180$ at $x = 0$ (Example 9).

## Exercises 3.6

[Exercises omitted]

<!-- PAGE 47 -->
[Exercises omitted]
<!-- PAGE 48 -->
[Exercises omitted]

<!-- PAGE 49 -->

## 3.7 Implicit Differentiation

[Exercises omitted]

### 3.7 Implicit Differentiation

Most of the functions we have dealt with so far have been described by an equation of the form $y = f(x)$ that expresses $y$ explicitly in terms of the variable $x$. We have learned rules for differentiating functions defined in this way. Another situation occurs when we encounter equations like

$$x^3 + y^3 - 9xy = 0, \quad y^2 - x = 0, \quad \text{or} \quad x^2 + y^2 - 25 = 0.$$

(See Figures 3.28, 3.29, and 3.30.) These equations define an implicit relation between the variables $x$ and $y$. In some cases we may be able to solve such an equation for $y$ as an explicit function (or even several functions) of $x$. When we cannot put an equation $F(x, y) = 0$ in the form $y = f(x)$ to differentiate it in the usual way, we may still be able to find $dy/dx$ by implicit differentiation. This section describes the technique.

#### Implicitly Defined Functions

We begin with examples involving familiar equations that we can solve for $y$ as a function of $x$ to calculate $dy/dx$ in the usual way. Then we differentiate the equations implicitly, and find the derivative to compare the two methods. Following the examples, we summarize the steps involved in the new method. In the examples and exercises, it is always assumed that the given equation determines $y$ implicitly as a differentiable function of $x$ so that $dy/dx$ exists.

**EXAMPLE 1** Find $dy/dx$ if $y^2 = x$.

**Solution** The equation $y^2 = x$ defines two differentiable functions of $x$ that we can actually find, namely $y_1 = \sqrt{x}$ and $y_2 = -\sqrt{x}$ (Figure 3.29). We know how to calculate the derivative of each of these for $x > 0$:

$$\frac{dy_1}{dx} = \frac{1}{2\sqrt{x}} \quad \text{and} \quad \frac{dy_2}{dx} = -\frac{1}{2\sqrt{x}}.$$

But suppose that we knew only that the equation $y^2 = x$ defined $y$ as one or more differentiable functions of $x$ for $x > 0$ without knowing exactly what these functions were. Could we still find $dy/dx$?

The answer is yes. To find $dy/dx$, we simply differentiate both sides of the equation $y^2 = x$ with respect to $x$, treating $y = f(x)$ as a differentiable function of $x$:

$$y^2 = x$$
$$2y \frac{dy}{dx} = 1$$
$$\frac{dy}{dx} = \frac{1}{2y}.$$

[Note: The Chain Rule gives $\frac{d}{dx}(y^2) = \frac{d}{dx}[f(x)]^2 = 2f(x)f'(x) = 2y \frac{dy}{dx}$.]

[FIGURE 3.28 The curve $x^3 + y^3 - 9xy = 0$ is shown on a Cartesian coordinate system. The curve, known as the folium of Descartes, forms a loop in the first quadrant and has branches extending into the second and fourth quadrants. A vertical line at $x_0$ is shown intersecting the curve at three distinct points: $(x_0, y_1)$, $(x_0, y_2)$, and $(x_0, y_3)$. Different segments of the curve are labeled as functions: $y = f_1(x)$ (the top arc of the loop), $y = f_2(x)$ (the bottom arc of the loop), and $y = f_3(x)$ (the lower branch). The equation $x^3 + y^3 - 9xy = 0$ is printed next to the loop. The origin $0$, point $A$, and a value $5$ on both the $x$ and $y$ axes are labeled.]

**FIGURE 3.28** The curve $x^3 + y^3 - 9xy = 0$ is not the graph of any one function of $x$. The curve can, however, be divided into separate arcs that are the graphs of functions of $x$. This particular curve, called a folium, dates to Descartes in 1638.

<!-- PAGE 50 -->

172 Chapter 3: Derivatives

This one formula gives the derivatives we calculated for both explicit solutions $y_1 = \sqrt{x}$ and $y_2 = -\sqrt{x}$:

$$\frac{dy_1}{dx} = \frac{1}{2y_1} = \frac{1}{2\sqrt{x}} \quad \text{and} \quad \frac{dy_2}{dx} = \frac{1}{2y_2} = \frac{1}{2(-\sqrt{x})} = -\frac{1}{2\sqrt{x}}.$$

**EXAMPLE 2** Find the slope of the circle $x^2 + y^2 = 25$ at the point $(3, -4)$.

**Solution** The circle is not the graph of a single function of $x$. Rather, it is the combined graphs of two differentiable functions, $y_1 = \sqrt{25 - x^2}$ and $y_2 = -\sqrt{25 - x^2}$ (Figure 3.30). The point $(3, -4)$ lies on the graph of $y_2$, so we can find the slope by calculating the derivative directly, using the Power Chain Rule:

$$\frac{dy_2}{dx} \bigg|_{x=3} = -\frac{d}{dx}(25 - x^2)^{1/2} \bigg|_{x=3} = -\left[ \frac{-2x}{2\sqrt{25 - x^2}} \right]_{x=3} = -\frac{-6}{2\sqrt{25 - 9}} = \frac{3}{4}.$$

[Note: $\frac{d}{dx}[-(25 - x^2)^{1/2}] = -\frac{1}{2}(25 - x^2)^{-1/2}(-2x)$]

We can solve this problem more easily by differentiating the given equation of the circle implicitly with respect to $x$:

$$\frac{d}{dx}(x^2) + \frac{d}{dx}(y^2) = \frac{d}{dx}(25)$$
$$2x + 2y \frac{dy}{dx} = 0 \quad \text{(See Example 1.)}$$
$$\frac{dy}{dx} = -\frac{x}{y}.$$

The slope at $(3, -4)$ is $-\frac{x}{y} \bigg|_{(3, -4)} = -\frac{3}{-4} = \frac{3}{4}$.

Notice that unlike the slope formula for $dy_2/dx$, which applies only to points below the $x$-axis, the formula $dy/dx = -x/y$ applies everywhere the circle has a slope; that is, at all circle points $(x, y)$ where $y \neq 0$. Notice also that the derivative involves both variables $x$ and $y$, not just the independent variable $x$.

To calculate the derivatives of other implicitly defined functions, we proceed as in Examples 1 and 2: We treat $y$ as a differentiable implicit function of $x$ and apply the usual rules to differentiate both sides of the defining equation.

[FIGURE 3.29 A graph of the equation $y^2 = x$. The curve is a parabola opening to the right. The upper half is colored orange and labeled $y_1 = \sqrt{x}$. The lower half is colored purple and labeled $y_2 = -\sqrt{x}$. A point $P(x, \sqrt{x})$ is shown on the upper curve with a tangent line segment labeled "Slope $= \frac{1}{2y_1} = \frac{1}{2\sqrt{x}}$". A point $Q(x, -\sqrt{x})$ is shown on the lower curve with a tangent line segment labeled "Slope $= \frac{1}{2y_2} = -\frac{1}{2\sqrt{x}}$". The $x$-axis ranges from $0$ to $5$. The $y$-axis ranges from approximately $-2.5$ to $2.5$.]

**FIGURE 3.29** The equation $y^2 - x = 0$, or $y^2 = x$ as it is usually written, defines two differentiable functions of $x$ on the interval $x > 0$. Example 1 shows how to find the derivatives of these functions without solving the equation $y^2 = x$ for $y$.

[FIGURE 3.30 A graph of the circle $x^2 + y^2 = 25$. The axes range from $-5$ to $5$. The upper semicircle is colored orange and labeled $y_1 = \sqrt{25 - x^2}$. The lower semicircle is colored blue and labeled $y_2 = -\sqrt{25 - x^2}$. A point $(3, -4)$ is marked on the lower semicircle in the fourth quadrant. A tangent line is drawn through this point, and it is labeled with "Slope $= -\frac{x}{y} = \frac{3}{4}$".]

**FIGURE 3.30** The circle combines the graphs of two functions. The graph of $y_2$ is the lower semicircle and passes through $(3, -4)$.

<!-- PAGE 51 -->

## 3.7 Implicit Differentiation

**Implicit Differentiation**
1. Differentiate both sides of the equation with respect to $x$, treating $y$ as a differentiable function of $x$.
2. Collect the terms with $dy/dx$ on one side of the equation and solve for $dy/dx$.

**EXAMPLE 3** Find $dy/dx$ if $y^2 = x^2 + \sin xy$ (Figure 3.31).

**Solution** We differentiate the equation implicitly.
$$y^2 = x^2 + \sin xy$$
$$\frac{d}{dx}(y^2) = \frac{d}{dx}(x^2) + \frac{d}{dx}(\sin xy)$$ Differentiate both sides with respect to $x \dots$
$$2y \frac{dy}{dx} = 2x + (\cos xy) \frac{d}{dx}(xy)$$ $\dots$ treating $y$ as a function of $x$ and using the Chain Rule.
$$2y \frac{dy}{dx} = 2x + (\cos xy) \left( y + x \frac{dy}{dx} \right)$$ Treat $xy$ as a product.
$$2y \frac{dy}{dx} - (\cos xy) \left( x \frac{dy}{dx} \right) = 2x + (\cos xy)y$$ Collect terms with $dy/dx$.
$$(2y - x \cos xy) \frac{dy}{dx} = 2x + y \cos xy$$
$$\frac{dy}{dx} = \frac{2x + y \cos xy}{2y - x \cos xy}$$ Solve for $dy/dx$.

Notice that the formula for $dy/dx$ applies everywhere that the implicitly defined curve has a slope. Notice again that the derivative involves both variables $x$ and $y$, not just the independent variable $x$. ■

### Derivatives of Higher Order
Implicit differentiation can also be used to find higher derivatives.

**EXAMPLE 4** Find $d^2y/dx^2$ if $2x^3 - 3y^2 = 8$.

**Solution** To start, we differentiate both sides of the equation with respect to $x$ in order to find $y' = dy/dx$.
$$\frac{d}{dx}(2x^3 - 3y^2) = \frac{d}{dx}(8)$$
$$6x^2 - 6yy' = 0$$ Treat $y$ as a function of $x$.
$$y' = \frac{x^2}{y}, \text{ when } y \neq 0$$ Solve for $y'$.

We now apply the Quotient Rule to find $y''$.
$$y'' = \frac{d}{dx} \left( \frac{x^2}{y} \right) = \frac{2xy - x^2 y'}{y^2} = \frac{2x}{y} - \frac{x^2}{y^2} \cdot y'$$

Finally, we substitute $y' = x^2/y$ to express $y''$ in terms of $x$ and $y$.
$$y'' = \frac{2x}{y} - \frac{x^2}{y^2} \left( \frac{x^2}{y} \right) = \frac{2x}{y} - \frac{x^4}{y^3}, \text{ when } y \neq 0$$ ■

[Figure 3.31: A coordinate graph showing the equation $y^2 = x^2 + \sin xy$. The graph shows two blue curves that cross at the origin $(0,0)$ and extend into all four quadrants. The x-axis is labeled from -4 to 4, and the y-axis is labeled from -4 to 4. A caption reads: "FIGURE 3.31 The graph of the equation in Example 3."]

<!-- PAGE 52 -->

## Chapter 3: Derivatives

### Lenses, Tangents, and Normal Lines
In the law that describes how light changes direction as it enters a lens, the important angles are the angles the light makes with the line perpendicular to the surface of the lens at the point of entry (angles $A$ and $B$ in Figure 3.32). This line is called the **normal** to the surface at the point of entry. In a profile view of a lens like the one in Figure 3.32, the **normal** is the line perpendicular (also said to be **orthogonal**) to the tangent of the profile curve at the point of entry.

[Figure 3.32: A diagram illustrating the refraction of a light ray at a lens surface. The diagram shows a "Curve of lens surface" with a "Point of entry" labeled P. A "Light ray" enters at P. A "Tangent" line is drawn at P, and a "Normal line" is drawn perpendicular to the tangent through P. Angle A is the angle between the light ray and the normal in the air, and angle B is the angle between the light ray and the normal inside the lens. A caption reads: "FIGURE 3.32 The profile of a lens, showing the bending (refraction) of a ray of light as it passes through the lens surface."]

**EXAMPLE 5** Show that the point $(2, 4)$ lies on the curve $x^3 + y^3 - 9xy = 0$. Then find the tangent and normal to the curve there (Figure 3.33).

**Solution** The point $(2, 4)$ lies on the curve because its coordinates satisfy the equation given for the curve: $2^3 + 4^3 - 9(2)(4) = 8 + 64 - 72 = 0$.
To find the slope of the curve at $(2, 4)$, we first use implicit differentiation to find a formula for $dy/dx$:
$$x^3 + y^3 - 9xy = 0$$
$$\frac{d}{dx}(x^3) + \frac{d}{dx}(y^3) - \frac{d}{dx}(9xy) = \frac{d}{dx}(0)$$
$$3x^2 + 3y^2 \frac{dy}{dx} - 9 \left( x \frac{dy}{dx} + y \frac{dx}{dx} \right) = 0$$ Differentiate both sides with respect to $x$.
$$(3y^2 - 9x) \frac{dy}{dx} + 3x^2 - 9y = 0$$ Treat $xy$ as a product and $y$ as a function of $x$.
$$3(y^2 - 3x) \frac{dy}{dx} = 9y - 3x^2$$
$$\frac{dy}{dx} = \frac{3y - x^2}{y^2 - 3x}$$ Solve for $dy/dx$.

We then evaluate the derivative at $(x, y) = (2, 4)$:
$$\frac{dy}{dx} \bigg|_{(2, 4)} = \frac{3y - x^2}{y^2 - 3x} \bigg|_{(2, 4)} = \frac{3(4) - 2^2}{4^2 - 3(2)} = \frac{8}{10} = \frac{4}{5}.$$
The tangent at $(2, 4)$ is the line through $(2, 4)$ with slope $4/5$:
$$y = 4 + \frac{4}{5}(x - 2)$$
$$y = \frac{4}{5}x + \frac{12}{5}.$$
The normal to the curve at $(2, 4)$ is the line perpendicular to the tangent there, the line through $(2, 4)$ with slope $-5/4$:
$$y = 4 - \frac{5}{4}(x - 2)$$
$$y = -\frac{5}{4}x + \frac{13}{2}.$$ ■

[Figure 3.33: A graph of the folium of Descartes $x^3 + y^3 - 9xy = 0$ in the xy-plane. The curve forms a loop in the first quadrant and extends away in the second and fourth quadrants. The point $(2, 4)$ is marked on the loop. A green line labeled "Tangent" passes through $(2, 4)$ with a positive slope. A red line labeled "Normal" passes through $(2, 4)$ perpendicular to the tangent. A caption reads: "FIGURE 3.33 Example 5 shows how to find equations for the tangent and normal to the folium of Descartes at (2, 4)."]

<!-- PAGE 53 -->
[Exercises omitted]

<!-- PAGE 54 -->
[Exercises omitted]

<!-- PAGE 55 -->

## 3.8 Derivatives of Inverse Functions and Logarithms

In Section 1.6 we saw how the inverse of a function undoes, or inverts, the effect of that function. We defined there the natural logarithm function $f^{-1}(x) = \ln x$ as the inverse of the natural exponential function $f(x) = e^x$. This is one of the most important function-inverse pairs in mathematics and science. We learned how to differentiate the exponential function in Section 3.3. Here we learn a rule for differentiating the inverse of a differentiable function and we apply the rule to find the derivative of the natural logarithm function.

### Derivatives of Inverses of Differentiable Functions

We calculated the inverse of the function $f(x) = (1/2)x + 1$ as $f^{-1}(x) = 2x - 2$ in Example 3 of Section 1.6. Figure 3.34 shows again the graphs of both functions. If we calculate their derivatives, we see that

$$\frac{d}{dx} f(x) = \frac{d}{dx} \left( \frac{1}{2}x + 1 \right) = \frac{1}{2}$$

$$\frac{d}{dx} f^{-1}(x) = \frac{d}{dx} (2x - 2) = 2.$$

The derivatives are reciprocals of one another, so the slope of one line is the reciprocal of the slope of its inverse line. (See Figure 3.34.)

This is not a special case. Reflecting any nonhorizontal or nonvertical line across the line $y = x$ always inverts the line's slope. If the original line has slope $m \neq 0$, the reflected line has slope $1/m$.

[Figure 3.34 shows a Cartesian coordinate system with three lines. A dashed orange line represents $y = x$. A solid blue line is labeled $y = 2x - 2$, passing through $(1, 0)$ and $(0, -2)$. A solid light-blue line is labeled $y = \frac{1}{2}x + 1$, passing through $(0, 1)$ and $(-2, 0)$. Arrows indicate the lines' directions. **FIGURE 3.34** Graphing a line and its inverse together shows the graphs' symmetry with respect to the line $y = x$. The slopes are reciprocals of each other.]

[Figure 3.35 consists of two side-by-side Cartesian coordinate graphs. The left graph shows a blue curve $y = f(x)$ with a point $(a, b)$ marked, where $b = f(a)$. A tangent line is drawn through $(a, b)$. The right graph shows an orange curve $y = f^{-1}(x)$ with a point $(b, a)$ marked, where $a = f^{-1}(b)$. A tangent line is drawn through $(b, a)$. Below the graphs is the text: The slopes are reciprocal: $(f^{-1})'(b) = \frac{1}{f'(a)}$ or $(f^{-1})'(b) = \frac{1}{f'(f^{-1}(b))}$. **FIGURE 3.35** The graphs of inverse functions have reciprocal slopes at corresponding points.]

The reciprocal relationship between the slopes of $f$ and $f^{-1}$ holds for other functions as well, but we must be careful to compare slopes at corresponding points. If the slope of $y = f(x)$ at the point $(a, f(a))$ is $f'(a)$ and $f'(a) \neq 0$, then the slope of $y = f^{-1}(x)$ at the point $(f(a), a)$ is the reciprocal $1/f'(a)$ (Figure 3.35). If we set $b = f(a)$, then

$$(f^{-1})'(b) = \frac{1}{f'(a)} = \frac{1}{f'(f^{-1}(b))}$$

If $y = f(x)$ has a horizontal tangent line at $(a, f(a))$, then the inverse function $f^{-1}$ has a vertical tangent line at $(f(a), a)$, and this infinite slope implies that $f^{-1}$ is not differentiable at $f(a)$. Theorem 3 gives the conditions under which $f^{-1}$ is differentiable in its domain (which is the same as the range of $f$).

<!-- PAGE 56 -->

**THEOREM 3—The Derivative Rule for Inverses**
If $f$ has an interval $I$ as domain and $f'(x)$ exists and is never zero on $I$, then $f^{-1}$ is differentiable at every point in its domain (the range of $f$). The value of $(f^{-1})'$ at a point $b$ in the domain of $f^{-1}$ is the reciprocal of the value of $f'$ at the point $a = f^{-1}(b)$:
$$(f^{-1})'(b) = \frac{1}{f'(f^{-1}(b))} \quad \text{(1)}$$
or
$$\left. \frac{df^{-1}}{dx} \right|_{x=b} = \frac{1}{\left. \frac{df}{dx} \right|_{x=f^{-1}(b)}}$$

Theorem 3 makes two assertions. The first of these has to do with the conditions under which $f^{-1}$ is differentiable; the second assertion is a formula for the derivative of $f^{-1}$ when it exists. While we omit the proof of the first assertion, the second one is proved in the following way:

$f(f^{-1}(x)) = x$ (Inverse function relationship)
$\frac{d}{dx} f(f^{-1}(x)) = 1$ (Differentiating both sides)
$f'(f^{-1}(x)) \cdot \frac{d}{dx} f^{-1}(x) = 1$ (Chain Rule)
$\frac{d}{dx} f^{-1}(x) = \frac{1}{f'(f^{-1}(x))}$ (Solving for the derivative)

**EXAMPLE 1** The function $f(x) = x^2, x > 0$ and its inverse $f^{-1}(x) = \sqrt{x}$ have derivatives $f'(x) = 2x$ and $(f^{-1})'(x) = 1/(2\sqrt{x})$.
Let's verify that Theorem 3 gives the same formula for the derivative of $f^{-1}(x)$:

$(f^{-1})'(x) = \frac{1}{f'(f^{-1}(x))}$
$= \frac{1}{2(f^{-1}(x))}$ ($f'(x) = 2x$ with $x$ replaced by $f^{-1}(x)$)
$= \frac{1}{2(\sqrt{x})}$

Theorem 3 gives a derivative that agrees with the known derivative of the square root function.

Let's examine Theorem 3 at a specific point. We pick $x = 2$ (the number $a$) and $f(2) = 4$ (the value $b$). Theorem 3 says that the derivative of $f$ at 2, which is $f'(2) = 4$, and the derivative of $f^{-1}$ at $f(2)$, which is $(f^{-1})'(4)$, are reciprocals. It states that

$$(f^{-1})'(4) = \frac{1}{f'(f^{-1}(4))} = \frac{1}{f'(2)} = \left. \frac{1}{2x} \right|_{x=2} = \frac{1}{4}$$

See Figure 3.36.

[Figure 3.36 shows a Cartesian coordinate graph. A dashed grey line represents $y = x$. A blue curve represents $y = x^2, x > 0$, with a point $(2, 4)$ marked. A tangent line at $(2, 4)$ is labeled "Slope 4". An orange curve represents $y = \sqrt{x}$, with a point $(4, 2)$ marked. A tangent line at $(4, 2)$ is labeled "Slope 1/4". The axes are labeled $x$ and $y$, ranging from 0 to 4. **FIGURE 3.36** The derivative of $f^{-1}(x) = \sqrt{x}$ at the point $(4, 2)$ is the reciprocal of the derivative of $f(x) = x^2$ at $(2, 4)$ (Example 1).]

We will use the procedure illustrated in Example 1 to calculate formulas for the derivatives of many inverse functions throughout this chapter. Equation (1) sometimes enables us to find specific values of $df^{-1}/dx$ without knowing a formula for $f^{-1}$.

<!-- PAGE 57 -->

## 3.8 Derivatives of Inverse Functions and Logarithms 179

**EXAMPLE 2** Let $f(x) = x^3 - 2, x > 0$. Find the value of $df^{-1}/dx$ at $x = 6 = f(2)$ without finding a formula for $f^{-1}(x)$.

**Solution** We apply Theorem 3 to obtain the value of the derivative of $f^{-1}$ at $x = 6$:

$$\frac{df}{dx} \bigg|_{x=2} = 3x^2 \bigg|_{x=2} = 12$$

$$\frac{df^{-1}}{dx} \bigg|_{x=f(2)} = \frac{1}{\frac{df}{dx} \bigg|_{x=2}} = \frac{1}{12}.$$ Eq. (1)

See Figure 3.37.

[Figure 3.37 description: A coordinate plane showing a blue curve $y = x^3 - 2$ and its inverse, a yellow curve. The blue curve passes through the point $(2, 6)$ where a tangent line segment is drawn with a label "Slope $3x^2 = 3(2)^2 = 12$". The yellow curve passes through the point $(6, 2)$ where a tangent line segment is drawn with a label "Reciprocal slope: $\frac{1}{12}$". The two curves are reflections of each other across the dashed line $y=x$. The x-axis and y-axis both range from -2 to 6.]

**FIGURE 3.37** The derivative of $f(x) = x^3 - 2$ at $x = 2$ tells us the derivative of $f^{-1}$ at $x = 6$ (Example 2).

### Derivative of the Natural Logarithm Function

Since we know the exponential function $f(x) = e^x$ is differentiable everywhere, we can apply Theorem 3 to find the derivative of its inverse $f^{-1}(x) = \ln x$:

$(f^{-1})'(x) = \frac{1}{f'(f^{-1}(x))}$ Theorem 3

$= \frac{1}{e^{f^{-1}(x)}}$ $f'(u) = e^u$

$= \frac{1}{e^{\ln x}}$ $x > 0$

$= \frac{1}{x}.$ Inverse function relationship

**Alternate Derivation** Instead of applying Theorem 3 directly, we can find the derivative of $y = \ln x$ using implicit differentiation, as follows:

$y = \ln x$ $x > 0$
$e^y = x$ Inverse function relationship
$\frac{d}{dx}(e^y) = \frac{d}{dx}(x)$ Differentiate implicitly.
$e^y \frac{dy}{dx} = 1$ Chain Rule
$\frac{dy}{dx} = \frac{1}{e^y} = \frac{1}{x}.$ $e^y = x$

No matter which derivation we use, the derivative of $y = \ln x$ with respect to $x$ is

$$\frac{d}{dx}(\ln x) = \frac{1}{x}, x > 0.$$

The Chain Rule extends this formula to positive functions $u(x)$:

$$\frac{d}{dx} \ln u = \frac{1}{u} \frac{du}{dx}, u > 0.$$ (2)

<!-- PAGE 58 -->

180 Chapter 3: Derivatives

**EXAMPLE 3** We use Equation (2) to find derivatives.

(a) $\frac{d}{dx} \ln 2x = \frac{1}{2x} \frac{d}{dx}(2x) = \frac{1}{2x}(2) = \frac{1}{x}, x > 0$

(b) Equation (2) with $u = x^2 + 3$ gives
$\frac{d}{dx} \ln (x^2 + 3) = \frac{1}{x^2 + 3} \cdot \frac{d}{dx}(x^2 + 3) = \frac{1}{x^2 + 3} \cdot 2x = \frac{2x}{x^2 + 3}.$

(c) Equation (2) with $u = |x|$ gives an important derivative:
$\frac{d}{dx} \ln |x| = \frac{d}{du} \ln u \cdot \frac{du}{dx}$ $u = |x|, x \neq 0$
$= \frac{1}{u} \cdot \frac{x}{|x|}$ $\frac{d}{dx}(|x|) = \frac{x}{|x|}$
$= \frac{1}{|x|} \cdot \frac{x}{|x|}$ Substitute for $u$.
$= \frac{x}{x^2}$
$= \frac{1}{x}.$

So $1/x$ is the derivative of $\ln x$ on the domain $x > 0$, and the derivative of $\ln (-x)$ on the domain $x < 0$.

**Derivative of $\ln |x|$**
$$\frac{d}{dx} \ln |x| = \frac{1}{x}, x \neq 0$$

Notice from Example 3a that the function $y = \ln 2x$ has the same derivative as the function $y = \ln x$. This is true of $y = \ln bx$ for any constant $b$, provided that $bx > 0$:

$$\frac{d}{dx} \ln bx = \frac{1}{bx} \cdot \frac{d}{dx}(bx) = \frac{1}{bx}(b) = \frac{1}{x}.$$ (3)

$\frac{d}{dx} \ln bx = \frac{1}{x}, bx > 0$

**EXAMPLE 4** A line with slope $m$ passes through the origin and is tangent to the graph of $y = \ln x$. What is the value of $m$?

**Solution** Suppose the point of tangency occurs at the unknown point $x = a > 0$. Then we know that the point $(a, \ln a)$ lies on the graph and that the tangent line at that point has slope $m = 1/a$ (Figure 3.38). Since the tangent line passes through the origin, its slope is

$$m = \frac{\ln a - 0}{a - 0} = \frac{\ln a}{a}.$$

Setting these two formulas for $m$ equal to each other, we have

$\frac{\ln a}{a} = \frac{1}{a}$
$\ln a = 1$
$e^{\ln a} = e^1$
$a = e$
$m = \frac{1}{e}.$

[Figure 3.38 description: A graph of $y = \ln x$ is shown as a blue curve crossing the x-axis at $x=1$. A red tangent line is drawn from the origin $(0,0)$ to a point on the curve labeled $(a, \ln a)$. A label points to the tangent line at this point stating "Slope = $\frac{1}{a}$". The x-axis is marked from 0 to 5, and the y-axis is marked from 0 to 2.]

**FIGURE 3.38** The tangent line intersects the curve at some point $(a, \ln a)$, where the slope of the curve is $1/a$ (Example 4).

### The Derivatives of $a^u$ and $\log_a u$

We start with the equation $a^x = e^{\ln(a^x)} = e^{x \ln a}, a > 0$, which was seen in Section 1.6:

$\frac{d}{dx} a^x = \frac{d}{dx} e^{x \ln a}$
$= e^{x \ln a} \cdot \frac{d}{dx}(x \ln a)$ $\frac{d}{dx} e^u = e^u \frac{du}{dx}$
$= a^x \ln a.$

<!-- PAGE 59 -->

## 3.8 Derivatives of Inverse Functions and Logarithms 181

That is, if $a > 0$, then $a^{x}$ is differentiable and

$$\frac{d}{dx} a^{x} = a^{x} \ln a. \tag{4}$$

This equation shows why $e^{x}$ is the preferred exponential function in calculus. If $a = e$, then $\ln a = 1$ and the derivative of $a^{x}$ simplifies to

$$\frac{d}{dx} e^{x} = e^{x} \ln e = e^{x}.$$

With the Chain Rule, we get a more general form for the derivative of a general exponential function $a^{u}$.

If $a > 0$ and $u$ is a differentiable function of $x$, then $a^{u}$ is a differentiable function of $x$ and
$$\frac{d}{dx} a^{u} = a^{u} \ln a \frac{du}{dx}. \tag{5}$$

**EXAMPLE 5** Here are some derivatives of general exponential functions.

(a) $\frac{d}{dx} 3^{x} = 3^{x} \ln 3$ [Eq. (5) with $a = 3, u = x$]
(b) $\frac{d}{dx} 3^{-x} = 3^{-x} (\ln 3) \frac{d}{dx}(-x) = -3^{-x} \ln 3$ [Eq. (5) with $a = 3, u = -x$]
(c) $\frac{d}{dx} 3^{\sin x} = 3^{\sin x} (\ln 3) \frac{d}{dx}(\sin x) = 3^{\sin x} (\ln 3) \cos x$ [$a = 3, u = \sin x$]

[Note: A small red square symbol indicates the end of the example.]

In Section 3.3 we looked at the derivative $f'(0)$ for the exponential functions $f(x) = a^{x}$ at various values of the base $a$. The number $f'(0)$ is the limit, $\lim_{h \to 0} (a^{h} - 1)/h$, and gives the slope of the graph of $a^{x}$ when it crosses the $y$-axis at the point $(0, 1)$. We now see from Equation (4) that the value of this slope is

$$\lim_{h \to 0} \frac{a^{h} - 1}{h} = \ln a. \tag{6}$$

In particular, when $a = e$ we obtain

$$\lim_{h \to 0} \frac{e^{h} - 1}{h} = \ln e = 1.$$

However, we have not fully justified that these limits actually exist. While all of the arguments given in deriving the derivatives of the exponential and logarithmic functions are correct, they do assume the existence of these limits. In Chapter 7 we will give another development of the theory of logarithmic and exponential functions which fully justifies that both limits do in fact exist and have the values derived above.

To find the derivative of $\log_{a} u$ for an arbitrary base ($a > 0, a \neq 1$), we start with the change-of-base formula for logarithms (reviewed in Section 1.6) and express $\log_{a} u$ in terms of natural logarithms,

$$\log_{a} x = \frac{\ln x}{\ln a}.$$

<!-- PAGE 60 -->

182 Chapter 3: Derivatives

Taking derivatives, we have

$$\frac{d}{dx} \log_{a} x = \frac{d}{dx} \left( \frac{\ln x}{\ln a} \right)$$
$$= \frac{1}{\ln a} \cdot \frac{d}{dx} \ln x \quad \text{($\ln a$ is a constant.)}$$
$$= \frac{1}{\ln a} \cdot \frac{1}{x}$$
$$= \frac{1}{x \ln a}.$$

If $u$ is a differentiable function of $x$ and $u > 0$, the Chain Rule gives a more general formula.

For $a > 0$ and $a \neq 1$,
$$\frac{d}{dx} \log_{a} u = \frac{1}{u \ln a} \frac{du}{dx}. \tag{7}$$

### Logarithmic Differentiation

The derivatives of positive functions given by formulas that involve products, quotients, and powers can often be found more quickly if we take the natural logarithm of both sides before differentiating. This enables us to use the laws of logarithms to simplify the formulas before differentiating. The process, called **logarithmic differentiation**, is illustrated in the next example.

**EXAMPLE 6** Find $dy/dx$ if

$$y = \frac{(x^{2} + 1)(x + 3)^{1/2}}{x - 1}, \quad x > 1.$$

*Solution* We take the natural logarithm of both sides and simplify the result with the algebraic properties of logarithms from Theorem 1 in Section 1.6:

$$\ln y = \ln \frac{(x^{2} + 1)(x + 3)^{1/2}}{x - 1}$$
$$= \ln ((x^{2} + 1)(x + 3)^{1/2}) - \ln(x - 1) \quad \text{Rule 2}$$
$$= \ln(x^{2} + 1) + \ln(x + 3)^{1/2} - \ln(x - 1) \quad \text{Rule 1}$$
$$= \ln(x^{2} + 1) + \frac{1}{2} \ln(x + 3) - \ln(x - 1). \quad \text{Rule 4}$$

We then take derivatives of both sides with respect to $x$, using Equation (2) on the left:

$$\frac{1}{y} \frac{dy}{dx} = \frac{1}{x^{2} + 1} \cdot 2x + \frac{1}{2} \cdot \frac{1}{x + 3} - \frac{1}{x - 1}.$$

Next we solve for $dy/dx$:

$$\frac{dy}{dx} = y \left( \frac{2x}{x^{2} + 1} + \frac{1}{2x + 6} - \frac{1}{x - 1} \right).$$

<!-- PAGE 61 -->

### 3.8 Derivatives of Inverse Functions and Logarithms 183

Finally, we substitute for $y$:

$$\frac{dy}{dx} = \frac{(x^2 + 1)(x + 3)^{1/2}}{x - 1} \left( \frac{2x}{x^2 + 1} + \frac{1}{2x + 6} - \frac{1}{x - 1} \right).$$

[Note: A small red square symbol appears here, indicating the end of an example.]

### Irrational Exponents and the Power Rule (General Version)

The definition of the general exponential function enables us to raise any positive number to any real power $n$, rational or irrational. That is, we can define the power function $y = x^n$ for any exponent $n$.

**DEFINITION** For any $x > 0$ and for any real number $n$,
$$x^n = e^{n \ln x}$$

Because the logarithm and exponential functions are inverses of each other, the definition gives
$$\ln x^n = n \ln x, \text{ for all real numbers } n.$$

That is, the rule for taking the natural logarithm of any power holds for all real exponents $n$, not just for rational exponents.

The definition of the power function also enables us to establish the derivative Power Rule for any real power $n$, as stated in Section 3.3.

**General Power Rule for Derivatives**
For $x > 0$ and any real number $n$,
$$\frac{d}{dx} x^n = nx^{n-1}.$$
If $x \le 0$, then the formula holds whenever the derivative, $x^n$, and $x^{n-1}$ all exist.

**Proof** Differentiating $x^n$ with respect to $x$ gives
$$\frac{d}{dx} x^n = \frac{d}{dx} e^{n \ln x}$$ (Definition of $x^n, x > 0$)
$$= e^{n \ln x} \cdot \frac{d}{dx} (n \ln x)$$ (Chain Rule for $e^u$)
$$= x^n \cdot \frac{n}{x}$$ (Definition and derivative of $\ln x$)
$$= nx^{n-1}.$$ ($x^n \cdot x^{-1} = x^{n-1}$)

In short, whenever $x > 0$,
$$\frac{d}{dx} x^n = nx^{n-1}.$$

For $x < 0$, if $y = x^n, y'$, and $x^{n-1}$ all exist, then
$$\ln |y| = \ln |x|^n = n \ln |x|.$$

<!-- PAGE 62 -->

184 Chapter 3: Derivatives

Using implicit differentiation (which assumes the existence of the derivative $y'$) and Example 3(c), we have
$$\frac{y'}{y} = \frac{n}{x}.$$

Solving for the derivative,
$$y' = n \frac{y}{x} = n \frac{x^n}{x} = nx^{n-1}.$$ ($y = x^n$)

It can be shown directly from the definition of the derivative that the derivative equals 0 when $x = 0$ and $n \ge 1$ (see Exercise 99). This completes the proof of the general version of the Power Rule for all values of $x$. $\blacksquare$

**EXAMPLE 7** Differentiate $f(x) = x^x, x > 0$.

**Solution** We note that $f(x) = x^x = e^{x \ln x}$, so differentiation gives
$$f'(x) = \frac{d}{dx} (e^{x \ln x})$$
$$= e^{x \ln x} \frac{d}{dx} (x \ln x)$$ ($\frac{d}{dx} e^u, u = x \ln x$)
$$= e^{x \ln x} \left( \ln x + x \cdot \frac{1}{x} \right)$$
$$= x^x (\ln x + 1).$$ ($x > 0$)

We can also find the derivative of $y = x^x$ using logarithmic differentiation, assuming $y'$ exists. [Note: A small red square symbol appears here.]

### The Number e Expressed as a Limit

In Section 1.5 we defined the number $e$ as the base value for which the exponential function $y = a^x$ has slope 1 when it crosses the y-axis at $(0, 1)$. Thus $e$ is the constant that satisfies the equation
$$\lim_{h \to 0} \frac{e^h - 1}{h} = \ln e = 1.$$ (Slope equals $\ln e$ from Eq. (6).)

We now prove that $e$ can be calculated as a certain limit.

**THEOREM 4—The Number $e$ as a Limit** The number $e$ can be calculated as the limit
$$e = \lim_{x \to 0} (1 + x)^{1/x}.$$

**Proof** If $f(x) = \ln x$, then $f'(x) = 1/x$, so $f'(1) = 1$. But, by the definition of derivative,
$$f'(1) = \lim_{h \to 0} \frac{f(1 + h) - f(1)}{h} = \lim_{x \to 0} \frac{f(1 + x) - f(1)}{x}$$
$$= \lim_{x \to 0} \frac{\ln(1 + x) - \ln 1}{x} = \lim_{x \to 0} \frac{1}{x} \ln(1 + x)$$ ($\ln 1 = 0$)
$$= \lim_{x \to 0} \ln (1 + x)^{1/x} = \ln \left[ \lim_{x \to 0} (1 + x)^{1/x} \right].$$ ($\ln$ is continuous, Theorem 10 in Chapter 2.)

[Figure 3.39: A graph in the Cartesian coordinate system showing a curve representing the function $y = (1 + x)^{1/x}$. The horizontal x-axis is labeled $x$ and the vertical y-axis is labeled $y$. The y-axis has numerical marks at 0, 1, 2, and 3. A specific point on the y-axis is labeled $e$, positioned between 2 and 3 (approximately 2.718). The curve descends from left to right, crossing the y-axis at the point $(0, e)$. There is a dashed horizontal line extending from the value $e$ on the y-axis to the curve at $x=0$, where there is an open circle. The function label $y = (1 + x)^{1/x}$ is placed near the curve. The caption reads: "FIGURE 3.39 The number $e$ is the limit of the function graphed here as $x \to 0$."]

<!-- PAGE 63 -->

## 3.8 Derivatives of Inverse Functions and Logarithms

Because $f'(1) = 1$, we have

$$\ln \left[ \lim_{x \to 0} (1 + x)^{1/x} \right] = 1.$$

Therefore, exponentiating both sides we get

$$\lim_{x \to 0} (1 + x)^{1/x} = e.$$

[Note: There is a small solid red square at the end of the line following the limit equation, likely indicating the end of a derivation or example.]

See Figure 3.39 on the previous page.

Approximating the limit in Theorem 4 by taking $x$ very small gives approximations to $e$. Its value is $e \approx 2.718281828459045$ to 15 decimal places.

## Exercises 3.8

[Exercises omitted]

<!-- PAGE 64 -->

[Exercises omitted]

<!-- PAGE 65 -->

## 3.9 Inverse Trigonometric Functions

We introduced the six basic inverse trigonometric functions in Section 1.6, but focused there on the arcsine and arccosine functions. Here we complete the study of how all six inverse trigonometric functions are defined, graphed, and evaluated, and how their derivatives are computed.

### Inverses of $\tan x$, $\cot x$, $\sec x$, and $\csc x$

The graphs of these four basic inverse trigonometric functions are shown again in Figure 3.40. We obtain these graphs by reflecting the graphs of the restricted trigonometric functions (as discussed in Section 1.6) through the line $y = x$. Let’s take a closer look at the arctangent, arccotangent, arcsecant, and arccosecant functions.

[Figure 3.40 contains four separate coordinate planes showing the graphs of inverse trigonometric functions:
(a) Graph of $y = \tan^{-1} x$. The x-axis ranges from $-2$ to $2$. The y-axis has labels $\frac{\pi}{2}$ and $-\frac{\pi}{2}$. There are horizontal dashed lines (asymptotes) at $y = \frac{\pi}{2}$ and $y = -\frac{\pi}{2}$. The function is an increasing S-shaped curve passing through the origin $(0,0)$. Domain: $-\infty < x < \infty$. Range: $-\frac{\pi}{2} < y < \frac{\pi}{2}$.
(b) Graph of $y = \cot^{-1} x$. The x-axis ranges from $-2$ to $2$. The y-axis has labels $\pi$ and $\frac{\pi}{2}$. There are horizontal dashed lines (asymptotes) at $y = \pi$ and $y = 0$. The function is a decreasing curve passing through $(0, \frac{\pi}{2})$. Domain: $-\infty < x < \infty$. Range: $0 < y < \pi$.
(c) Graph of $y = \sec^{-1} x$. The x-axis has labels $-2, -1, 1, 2$. The y-axis has labels $\pi$ and $\frac{\pi}{2}$. There is a horizontal dashed line at $y = \frac{\pi}{2}$. The graph has two branches. One branch starts at $(1, 0)$ and increases towards the asymptote $y = \frac{\pi}{2}$. The other branch starts at $(-1, \pi)$ and decreases towards the asymptote $y = \frac{\pi}{2}$. Domain: $x \leq -1$ or $x \geq 1$. Range: $0 \leq y \leq \pi, y \neq \frac{\pi}{2}$.
(d) Graph of $y = \csc^{-1} x$. The x-axis has labels $-2, -1, 1, 2$. The y-axis has labels $\frac{\pi}{2}$ and $-\frac{\pi}{2}$. There is a horizontal dashed line at $y = 0$. The graph has two branches. One branch starts at $(1, \frac{\pi}{2})$ and decreases towards the x-axis ($y = 0$). The other branch starts at $(-1, -\frac{\pi}{2})$ and increases towards the x-axis ($y = 0$). Domain: $x \leq -1$ or $x \geq 1$. Range: $-\frac{\pi}{2} \leq y \leq \frac{\pi}{2}, y \neq 0$.]

**FIGURE 3.40** Graphs of the arctangent, arccotangent, arcsecant, and arccosecant functions.

The arctangent of $x$ is a radian angle whose tangent is $x$. The arccotangent of $x$ is an angle whose cotangent is $x$, and so forth. The angles belong to the restricted domains of the tangent, cotangent, secant, and cosecant functions.

#### DEFINITIONS

$y = \tan^{-1} x$ is the number in $(-\pi/2, \pi/2)$ for which $\tan y = x$.
$y = \cot^{-1} x$ is the number in $(0, \pi)$ for which $\cot y = x$.
$y = \sec^{-1} x$ is the number in $[0, \pi/2) \cup (\pi/2, \pi]$ for which $\sec y = x$.
$y = \csc^{-1} x$ is the number in $[-\pi/2, 0) \cup (0, \pi/2]$ for which $\csc y = x$.

We use open or half-open intervals to avoid values for which the tangent, cotangent, secant, and cosecant functions are undefined. (See Figure 3.40.)

The graph of $y = \tan^{-1} x$ is symmetric about the origin because it is a branch of the graph $x = \tan y$ that is symmetric about the origin (Figure 3.40a). Algebraically this means that

$$\tan^{-1}(-x) = -\tan^{-1} x;$$

the arctangent is an odd function. The graph of $y = \cot^{-1} x$ has no such symmetry (Figure 3.40b). Notice from Figure 3.40a that the graph of the arctangent function has two horizontal asymptotes: one at $y = \pi/2$ and the other at $y = -\pi/2$.

<!-- PAGE 66 -->

The inverses of the restricted forms of $\sec x$ and $\csc x$ are chosen to be the functions graphed in Figures 3.40c and 3.40d.

**Caution** There is no general agreement about how to define $\sec^{-1} x$ for negative values of $x$. We chose angles in the second quadrant between $\pi/2$ and $\pi$. This choice makes $\sec^{-1} x = \cos^{-1}(1/x)$. It also makes $\sec^{-1} x$ an increasing function on each interval of its domain. Some tables choose $\sec^{-1} x$ to lie in $[-\pi, -\pi/2)$ for $x < 0$ and some texts choose it to lie in $[\pi, 3\pi/2)$ (Figure 3.41). These choices simplify the formula for the derivative (our formula needs absolute value signs) but fail to satisfy the computational equation $\sec^{-1} x = \cos^{-1}(1/x)$. From this, we can derive the identity

$$\sec^{-1} x = \cos^{-1} \left( \frac{1}{x} \right) = \frac{\pi}{2} - \sin^{-1} \left( \frac{1}{x} \right) \quad (1)$$

by applying Equation (5) in Section 1.6.

[Figure 3.41: A coordinate plane showing different choices for the left-hand branch of $y = \sec^{-1} x$. The domain for these branches is $x \leq -1$.
Choice A (solid blue line): The branch lies between $y = \pi/2$ and $y = \pi$, starting at $(-1, \pi)$.
Choice B (dashed line): The branch lies between $y = \pi$ and $y = 3\pi/2$, starting at $(-1, \pi)$.
Choice C (dashed line): The branch lies between $y = -\pi$ and $y = -\pi/2$, starting at $(-1, -\pi)$.
The graph also shows the right-hand branch (common to all) for $x \geq 1$ in the interval $[0, \pi/2)$.
Labels on y-axis: $\frac{3\pi}{2}, \pi, \frac{\pi}{2}, 0, -\frac{\pi}{2}, -\pi$.
Labels on x-axis: $-1, 0, 1$.
Caption: **FIGURE 3.41** There are several logical choices for the left-hand branch of $y = \sec^{-1} x$. With choice A, $\sec^{-1} x = \cos^{-1}(1/x)$, a useful identity employed by many calculators.]

**EXAMPLE 1** The accompanying figures show two values of $\tan^{-1} x$.

[Figure for Example 1 consists of two circular diagrams:
Left diagram (a): A circle centered at the origin. A triangle is formed in the first quadrant with a point at $(\sqrt{3}, 1)$. The horizontal leg is $\sqrt{3}$, the vertical leg is $1$, and the hypotenuse is $2$. The angle at the origin is $\frac{\pi}{6}$. Text labels: $\tan^{-1} \frac{1}{\sqrt{3}} = \frac{\pi}{6}$ and $\tan \frac{\pi}{6} = \frac{1}{\sqrt{3}}$.
Right diagram (b): A circle centered at the origin. A triangle is formed in the fourth quadrant with a point at $(1, -\sqrt{3})$. The horizontal leg is $1$, the vertical leg is $-\sqrt{3}$, and the hypotenuse is $2$. The angle at the origin is $-\frac{\pi}{3}$. Text labels: $\tan^{-1}(-\sqrt{3}) = -\frac{\pi}{3}$ and $\tan(-\frac{\pi}{3}) = -\sqrt{3}$.]

| x | tan⁻¹ x |
|---|---|
| √3 | π/3 |
| 1 | π/4 |
| √3/3 | π/6 |
| -√3/3 | -π/6 |
| -1 | -π/4 |
| -√3 | -π/3 |

The angles come from the first and fourth quadrants because the range of $\tan^{-1} x$ is $(-\pi/2, \pi/2)$.

[Figure 3.42: A graph of $y = \sin^{-1} x$. The x-axis goes from $-1$ to $1$. The y-axis goes from $-\pi/2$ to $\pi/2$. The curve is increasing, passing through $(0,0)$, $(-1, -\pi/2)$, and $(1, \pi/2)$. Vertical tangent lines are indicated with dashed red lines at $x = -1$ and $x = 1$.
Caption: **FIGURE 3.42** The graph of $y = \sin^{-1} x$ has vertical tangents at $x = -1$ and $x = 1$.]

### The Derivative of $y = \sin^{-1} u$

We know that the function $x = \sin y$ is differentiable in the interval $-\pi/2 < y < \pi/2$ and that its derivative, the cosine, is positive there. Theorem 3 in Section 3.8 therefore assures us that the inverse function $y = \sin^{-1} x$ is differentiable throughout the interval $-1 < x < 1$. We cannot expect it to be differentiable at $x = 1$ or $x = -1$ because the tangents to the graph are vertical at these points (see Figure 3.42).

<!-- PAGE 67 -->

## 3.9 Inverse Trigonometric Functions

We find the derivative of $y = \sin^{-1} x$ by applying Theorem 3 with $f(x) = \sin x$ and $f^{-1}(x) = \sin^{-1} x$:

$$(f^{-1})'(x) = \frac{1}{f'(f^{-1}(x))} \quad \text{Theorem 3}$$
$$= \frac{1}{\cos (\sin^{-1} x)} \quad f'(u) = \cos u$$
$$= \frac{1}{\sqrt{1 - \sin^2 (\sin^{-1} x)}} \quad \cos u = \sqrt{1 - \sin^2 u}$$
$$= \frac{1}{\sqrt{1 - x^2}}. \quad \sin (\sin^{-1} x) = x$$

If $u$ is a differentiable function of $x$ with $|u| < 1$, we apply the Chain Rule to get the general formula

> $$\frac{d}{dx} (\sin^{-1} u) = \frac{1}{\sqrt{1 - u^2}} \frac{du}{dx}, \quad |u| < 1.$$

**EXAMPLE 2** Using the Chain Rule, we calculate the derivative
$$\frac{d}{dx} (\sin^{-1} x^2) = \frac{1}{\sqrt{1 - (x^2)^2}} \cdot \frac{d}{dx} (x^2) = \frac{2x}{\sqrt{1 - x^4}}.$$

### The Derivative of $y = \tan^{-1} u$

We find the derivative of $y = \tan^{-1} x$ by applying Theorem 3 with $f(x) = \tan x$ and $f^{-1}(x) = \tan^{-1} x$. Theorem 3 can be applied because the derivative of $\tan x$ is positive for $-\pi/2 < x < \pi/2$:

$$(f^{-1})'(x) = \frac{1}{f'(f^{-1}(x))} \quad \text{Theorem 3}$$
$$= \frac{1}{\sec^2 (\tan^{-1} x)} \quad f'(u) = \sec^2 u$$
$$= \frac{1}{1 + \tan^2 (\tan^{-1} x)} \quad \sec^2 u = 1 + \tan^2 u$$
$$= \frac{1}{1 + x^2}. \quad \tan (\tan^{-1} x) = x$$

The derivative is defined for all real numbers. If $u$ is a differentiable function of $x$, we get the Chain Rule form:

> $$\frac{d}{dx} (\tan^{-1} u) = \frac{1}{1 + u^2} \frac{du}{dx}.$$

### The Derivative of $y = \sec^{-1} u$

Since the derivative of $\sec x$ is positive for $0 < x < \pi/2$ and $\pi/2 < x < \pi$, Theorem 3 says that the inverse function $y = \sec^{-1} x$ is differentiable. Instead of applying the formula

<!-- PAGE 68 -->

in Theorem 3 directly, we find the derivative of $y = \sec^{-1} x$, $|x| > 1$, using implicit differentiation and the Chain Rule as follows:

$y = \sec^{-1} x$
$\sec y = x \quad$ Inverse function relationship
$\frac{d}{dx} (\sec y) = \frac{d}{dx} x \quad$ Differentiate both sides.
$\sec y \tan y \frac{dy}{dx} = 1 \quad$ Chain Rule
$\frac{dy}{dx} = \frac{1}{\sec y \tan y}.$

[Note: Since $|x| > 1$, $y$ lies in $(0, \pi/2) \cup (\pi/2, \pi)$ and $\sec y \tan y \neq 0$.]

To express the result in terms of $x$, we use the relationships
$\sec y = x$ and $\tan y = \pm \sqrt{\sec^2 y - 1} = \pm \sqrt{x^2 - 1}$
to get
$$\frac{dy}{dx} = \pm \frac{1}{x \sqrt{x^2 - 1}}.$$

Can we do anything about the $\pm$ sign? A glance at Figure 3.43 shows that the slope of the graph $y = \sec^{-1} x$ is always positive. Thus,
$$\frac{d}{dx} \sec^{-1} x = \begin{cases} + \frac{1}{x \sqrt{x^2 - 1}} & \text{if } x > 1 \\ - \frac{1}{x \sqrt{x^2 - 1}} & \text{if } x < -1. \end{cases}$$

[Figure 3.43: A Cartesian coordinate graph showing the function $y = \sec^{-1} x$. The x-axis ranges from values less than -1 to greater than 1. The y-axis has labels for $0$, $\pi/2$, and $\pi$. The graph consists of two branches. One branch is defined for $x \leq -1$, starting at the point $(-1, \pi)$ and curving downwards toward the horizontal asymptote at $y = \pi/2$. The second branch is defined for $x \geq 1$, starting at the point $(1, 0)$ and curving upwards toward the same horizontal asymptote at $y = \pi/2$. The caption reads: "FIGURE 3.43 The slope of the curve $y = \sec^{-1} x$ is positive for both $x < -1$ and $x > 1$."]

With the absolute value symbol, we can write a single expression that eliminates the "$\pm$" ambiguity:
$$\frac{d}{dx} \sec^{-1} x = \frac{1}{|x| \sqrt{x^2 - 1}}.$$

If $u$ is a differentiable function of $x$ with $|u| > 1$, we have the formula

> $$\frac{d}{dx} (\sec^{-1} u) = \frac{1}{|u| \sqrt{u^2 - 1}} \frac{du}{dx}, \quad |u| > 1.$$

**EXAMPLE 3** Using the Chain Rule and derivative of the arcsecant function, we find
$$\frac{d}{dx} \sec^{-1} (5x^4) = \frac{1}{|5x^4| \sqrt{(5x^4)^2 - 1}} \frac{d}{dx} (5x^4)$$
$$= \frac{1}{5x^4 \sqrt{25x^8 - 1}} (20x^3) \quad 5x^4 > 1 > 0$$
$$= \frac{4}{x \sqrt{25x^8 - 1}}.$$

<!-- PAGE 69 -->

## 3.9 Inverse Trigonometric Functions

### Derivatives of the Other Three Inverse Trigonometric Functions

We could use the same techniques to find the derivatives of the other three inverse trigonometric functions—arccosine, arccotangent, and arccosecant—but there is an easier way, thanks to the following identities.

**Inverse Function–Inverse Cofunction Identities**

$\cos^{-1} x = \pi/2 - \sin^{-1} x$
$\cot^{-1} x = \pi/2 - \tan^{-1} x$
$\csc^{-1} x = \pi/2 - \sec^{-1} x$

We saw the first of these identities in Equation (5) of Section 1.6. The others are derived in a similar way. It follows easily that the derivatives of the inverse cofunctions are the negatives of the derivatives of the corresponding inverse functions. For example, the derivative of $\cos^{-1} x$ is calculated as follows:

$$\frac{d}{dx}(\cos^{-1} x) = \frac{d}{dx}\left(\frac{\pi}{2} - \sin^{-1} x\right) \quad \text{Identity}$$
$$= -\frac{d}{dx}(\sin^{-1} x)$$
$$= -\frac{1}{\sqrt{1 - x^2}} \quad \text{Derivative of arcsine}$$

The derivatives of the inverse trigonometric functions are summarized in Table 3.1.

**TABLE 3.1 Derivatives of the inverse trigonometric functions**

| | Derivative | Domain |
| --- | --- | --- |
| 1. | $\frac{d(\sin^{-1} u)}{dx} = \frac{1}{\sqrt{1 - u^2}} \frac{du}{dx}$ | $|u| < 1$ |
| 2. | $\frac{d(\cos^{-1} u)}{dx} = -\frac{1}{\sqrt{1 - u^2}} \frac{du}{dx}$ | $|u| < 1$ |
| 3. | $\frac{d(\tan^{-1} u)}{dx} = \frac{1}{1 + u^2} \frac{du}{dx}$ | |
| 4. | $\frac{d(\cot^{-1} u)}{dx} = -\frac{1}{1 + u^2} \frac{du}{dx}$ | |
| 5. | $\frac{d(\sec^{-1} u)}{dx} = \frac{1}{|u|\sqrt{u^2 - 1}} \frac{du}{dx}$ | $|u| > 1$ |
| 6. | $\frac{d(\csc^{-1} u)}{dx} = -\frac{1}{|u|\sqrt{u^2 - 1}} \frac{du}{dx}$ | $|u| > 1$ |

<!-- PAGE 70 -->

[Exercises omitted]

<!-- PAGE 71 -->

### 3.10 Related Rates

[Exercises omitted]

## 3.10 Related Rates

In this section we look at problems that ask for the rate at which some variable changes when it is known how the rate of some other related variable (or perhaps several variables) changes. The problem of finding a rate of change from other known rates of change is called a *related rates problem*.

<!-- PAGE 72 -->

### Chapter 3: Derivatives

### Related Rates Equations

Suppose we are pumping air into a spherical balloon. Both the volume and radius of the balloon are increasing over time. If $V$ is the volume and $r$ is the radius of the balloon at an instant of time, then

$$V = \frac{4}{3}\pi r^3.$$

Using the Chain Rule, we differentiate both sides with respect to $t$ to find an equation relating the rates of change of $V$ and $r$,

$$\frac{dV}{dt} = \frac{dV}{dr} \frac{dr}{dt} = 4\pi r^2 \frac{dr}{dt}.$$

So if we know the radius $r$ of the balloon and the rate $dV/dt$ at which the volume is increasing at a given instant of time, then we can solve this last equation for $dr/dt$ to find how fast the radius is increasing at that instant. Note that it is easier to directly measure the rate of increase of the volume (the rate at which air is being pumped into the balloon) than it is to measure the increase in the radius. The related rates equation allows us to calculate $dr/dt$ from $dV/dt$.

Very often the key to relating the variables in a related rates problem is drawing a picture that shows the geometric relations between them, as illustrated in the following example.

**EXAMPLE 1** Water runs into a conical tank at the rate of $9 \text{ ft}^3/\text{min}$. The tank stands point down and has a height of $10 \text{ ft}$ and a base radius of $5 \text{ ft}$. How fast is the water level rising when the water is $6 \text{ ft}$ deep?

**Solution** Figure 3.44 shows a partially filled conical tank. The variables in the problem are

$V = \text{volume } (\text{ft}^3) \text{ of the water in the tank at time } t \text{ (min)}$
$x = \text{radius (ft) of the surface of the water at time } t$
$y = \text{depth (ft) of the water in the tank at time } t.$

[Figure 3.44 is a technical diagram illustrating a related rates calculus problem involving a conical tank. The diagram shows:
- An inverted cone representing a tank, positioned with its vertex at the bottom.
- The total height of the cone is labeled as $10 \text{ ft}$.
- The radius of the top circular base is labeled as $5 \text{ ft}$.
- A light blue shaded region inside the cone represents water, forming a smaller inverted cone.
- The radius of the water surface is labeled as $x$.
- The height (depth) of the water from the vertex to the surface is labeled as $y$.
- To the left of the diagram, there is a red vertical arrow pointing upward labeled $\frac{dy}{dt} = ?$ when $y = 6 \text{ ft}$.
- Near the top of the tank, a label indicates the input rate: $\frac{dV}{dt} = 9 \text{ ft}^3/\text{min}$.
- A central vertical dashed line indicates the axis of symmetry.
- **FIGURE 3.44** The geometry of the conical tank and the rate at which water fills the tank determine how fast the water level rises (Example 1).]

We assume that $V, x, \text{ and } y$ are differentiable functions of $t$. The constants are the dimensions of the tank. We are asked for $dy/dt$ when

$$y = 6 \text{ ft} \quad \text{and} \quad \frac{dV}{dt} = 9 \text{ ft}^3/\text{min}.$$

The water forms a cone with volume

$$V = \frac{1}{3}\pi x^2 y.$$

This equation involves $x$ as well as $V$ and $y$. Because no information is given about $x$ and $dx/dt$ at the time in question, we need to eliminate $x$. The similar triangles in Figure 3.44 give us a way to express $x$ in terms of $y$:

$$\frac{x}{y} = \frac{5}{10} \quad \text{or} \quad x = \frac{y}{2}.$$

Therefore, we find

$$V = \frac{1}{3}\pi \left(\frac{y}{2}\right)^2 y = \frac{\pi}{12} y^3$$

to give the derivative

$$\frac{dV}{dt} = \frac{\pi}{12} \cdot 3y^2 \frac{dy}{dt} = \frac{\pi}{4} y^2 \frac{dy}{dt}.$$

<!-- PAGE 73 -->

### 3.10 Related Rates

Finally, use $y = 6$ and $dV/dt = 9$ to solve for $dy/dt$.

$$9 = \frac{\pi}{4}(6)^{2} \frac{dy}{dt}$$

$$\frac{dy}{dt} = \frac{1}{\pi} \approx 0.32$$

At the moment in question, the water level is rising at about $0.32 \text{ ft/min}$.

**Related Rates Problem Strategy**

1. **Draw a picture and name the variables and constants.** Use $t$ for time. Assume that all variables are differentiable functions of $t$.
2. **Write down the numerical information** (in terms of the symbols you have chosen).
3. **Write down what you are asked to find** (usually a rate, expressed as a derivative).
4. **Write an equation that relates the variables.** You may have to combine two or more equations to get a single equation that relates the variable whose rate you want to the variables whose rates you know.
5. **Differentiate with respect to $t$.** Then express the rate you want in terms of the rates and variables whose values you know.
6. **Evaluate.** Use known values to find the unknown rate.

**EXAMPLE 2** A hot air balloon rising straight up from a level field is tracked by a range finder $150 \text{ m}$ from the liftoff point. At the moment the range finder’s elevation angle is $\pi/4$, the angle is increasing at the rate of $0.14 \text{ rad/min}$. How fast is the balloon rising at that moment?

**Solution** We answer the question in the six strategy steps.

1. **Draw a picture and name the variables and constants** (Figure 3.45). The variables in the picture are
$\theta =$ the angle in radians the range finder makes with the ground.
$y =$ the height in meters of the balloon above the ground.
We let $t$ represent time in minutes and assume that $\theta$ and $y$ are differentiable functions of $t$.
The one constant in the picture is the distance from the range finder to the liftoff point ($150 \text{ m}$). There is no need to give it a special symbol.
2. **Write down the additional numerical information.**
$$\frac{d\theta}{dt} = 0.14 \text{ rad/min} \text{ when } \theta = \frac{\pi}{4}$$
3. **Write down what we are to find.** We want $dy/dt$ when $\theta = \pi/4$.
4. **Write an equation that relates the variables $y$ and $\theta$.**
$$\frac{y}{150} = \tan \theta \quad \text{or} \quad y = 150 \tan \theta$$
5. **Differentiate with respect to $t$ using the Chain Rule.** The result tells how $dy/dt$ (which we want) is related to $d\theta/dt$ (which we know).
$$\frac{dy}{dt} = 150 (\sec^{2} \theta) \frac{d\theta}{dt}$$
6. **Evaluate with $\theta = \pi/4$ and $d\theta/dt = 0.14$ to find $dy/dt$.**
$$\frac{dy}{dt} = 150(\sqrt{2})^{2}(0.14) = 42 \quad \left( \sec \frac{\pi}{4} = \sqrt{2} \right)$$
At the moment in question, the balloon is rising at the rate of $42 \text{ m/min}$.

[Figure 3.45: A diagram showing a right triangle on a coordinate plane. The horizontal base represents the ground, with a length of "150 m" between the "Range finder" (at the origin) and the point directly below the balloon. The vertical side is the height $y$. An arrow pointing up indicates $\frac{dy}{dt} = ?$ when $\theta = \pi/4$. The hypotenuse leads to the "Balloon". The angle at the range finder is $\theta$, with an annotation $\frac{d\theta}{dt} = 0.14 \text{ rad/min}$ when $\theta = \pi/4$. Caption: FIGURE 3.45 The rate of change of the balloon’s height is related to the rate of change of the angle the range finder makes with the ground (Example 2).]

<!-- PAGE 74 -->

**Chapter 3: Derivatives**

**EXAMPLE 3** A police cruiser, approaching a right-angled intersection from the north, is chasing a speeding car that has turned the corner and is now moving straight east. When the cruiser is $0.6 \text{ mi}$ north of the intersection and the car is $0.8 \text{ mi}$ to the east, the police determine with radar that the distance between them and the car is increasing at $20 \text{ mph}$. If the cruiser is moving at $60 \text{ mph}$ at the instant of measurement, what is the speed of the car?

**Solution** We picture the car and cruiser in the coordinate plane, using the positive x-axis as the eastbound highway and the positive y-axis as the southbound highway (Figure 3.46). We let $t$ represent time and set
$x =$ position of car at time $t$
$y =$ position of cruiser at time $t$
$s =$ distance between car and cruiser at time $t$.
We assume that $x, y$, and $s$ are differentiable functions of $t$.
We want to find $dx/dt$ when
$$x = 0.8 \text{ mi}, \quad y = 0.6 \text{ mi}, \quad \frac{dy}{dt} = -60 \text{ mph}, \quad \frac{ds}{dt} = 20 \text{ mph}.$$
Note that $dy/dt$ is negative because $y$ is decreasing.
We differentiate the distance equation between the car and the cruiser,
$$s^{2} = x^{2} + y^{2}$$
(we could also use $s = \sqrt{x^{2} + y^{2}}$), and obtain
$$2s \frac{ds}{dt} = 2x \frac{dx}{dt} + 2y \frac{dy}{dt}$$
$$\frac{ds}{dt} = \frac{1}{s} \left( x \frac{dx}{dt} + y \frac{dy}{dt} \right)$$
$$= \frac{1}{\sqrt{x^{2} + y^{2}}} \left( x \frac{dx}{dt} + y \frac{dy}{dt} \right).$$
Finally, we use $x = 0.8, y = 0.6, dy/dt = -60, ds/dt = 20$, and solve for $dx/dt$.
$$20 = \frac{1}{\sqrt{(0.8)^{2} + (0.6)^{2}}} \left( 0.8 \frac{dx}{dt} + (0.6)(-60) \right)$$
$$\frac{dx}{dt} = \frac{20 \sqrt{(0.8)^{2} + (0.6)^{2}} + (0.6)(60)}{0.8} = 70$$
At the moment in question, the car’s speed is $70 \text{ mph}$.

[Figure 3.46: A coordinate plane where the origin is a right-angled intersection. A police cruiser is located at $y = 0.6$ on the y-axis with a downward arrow labeled $\frac{dy}{dt} = -60$. A car is located at $x = 0.8$ on the x-axis with a rightward arrow labeled $\frac{dx}{dt} = ?$. A dashed line $s$ connects the two vehicles, with a label $\frac{ds}{dt} = 20$. Text box: "Situation when $x = 0.8, y = 0.6$". Caption: FIGURE 3.46 The speed of the car is related to the speed of the police cruiser and the rate of change of the distance $s$ between them (Example 3).]

**EXAMPLE 4** A particle $P$ moves clockwise at a constant rate along a circle of radius $10 \text{ m}$ centered at the origin. The particle’s initial position is $(0, 10)$ on the y-axis, and its final destination is the point $(10, 0)$ on the x-axis. Once the particle is in motion, the tangent line at $P$ intersects the x-axis at a point $Q$ (which moves over time). If it takes the particle $30 \text{ sec}$ to travel from start to finish, how fast is the point $Q$ moving along the x-axis when it is $20 \text{ m}$ from the center of the circle?

**Solution** We picture the situation in the coordinate plane with the circle centered at the origin (see Figure 3.47). We let $t$ represent time and let $\theta$ denote the angle from the x-axis to the radial line joining the origin to $P$. Since the particle travels from start to finish in $30 \text{ sec}$, it is traveling along the circle at a constant rate of $\pi/2$ radians in $1/2 \text{ min}$, or $\pi \text{ rad/min}$. In other words, $d\theta/dt = -\pi$, with $t$ being measured in minutes. The negative sign appears because $\theta$ is decreasing over time.

[Figure 3.47: A coordinate plane showing a circle of radius 10 centered at the origin. A point $P$ is on the circle. A radial line from the origin to $P$ forms an angle $\theta$ with the positive x-axis. A tangent line to the circle at $P$ intersects the x-axis at point $Q(x, 0)$. An arrow on the circle shows the particle $P$ moving clockwise. Caption: FIGURE 3.47 The particle P travels clockwise along the circle (Example 4).]

<!-- PAGE 75 -->

## 3.10 Related Rates

Setting $x(t)$ to be the distance at time $t$ from the point $Q$ to the origin, we want to find $dx/dt$ when

$$x = 20 \text{ m} \quad \text{and} \quad \frac{d\theta}{dt} = -\pi \text{ rad/min.}$$

To relate the variables $x$ and $\theta$, we see from Figure 3.47 that $x \cos \theta = 10$, or $x = 10 \sec \theta$. Differentiation of this last equation gives

$$\frac{dx}{dt} = 10 \sec \theta \tan \theta \frac{d\theta}{dt} = -10\pi \sec \theta \tan \theta.$$

Note that $dx/dt$ is negative because $x$ is decreasing ($Q$ is moving toward the origin).

When $x = 20$, $\cos \theta = 1/2$ and $\sec \theta = 2$. Also, $\tan \theta = \sqrt{\sec^2 \theta - 1} = \sqrt{3}$. It follows that

$$\frac{dx}{dt} = (-10\pi)(2)(\sqrt{3}) = -20\sqrt{3}\pi.$$

At the moment in question, the point $Q$ is moving toward the origin at the speed of $20\sqrt{3}\pi \approx 109$ m/min. ■

**EXAMPLE 5** A jet airliner is flying at a constant altitude of 12,000 ft above sea level as it approaches a Pacific island. The aircraft comes within the direct line of sight of a radar station located on the island, and the radar indicates the initial angle between sea level and its line of sight to the aircraft is $30^\circ$. How fast (in miles per hour) is the aircraft approaching the island when first detected by the radar instrument if it is turning upward (counterclockwise) at the rate of $2/3$ deg/sec in order to keep the aircraft within its direct line of sight?

**Solution** The aircraft $A$ and radar station $R$ are pictured in the coordinate plane, using the positive $x$-axis as the horizontal distance at sea level from $R$ to $A$, and the positive $y$-axis as the vertical altitude above sea level. We let $t$ represent time and observe that $y = 12,000$ is a constant. The general situation and line-of-sight angle $\theta$ are depicted in Figure 3.48. We want to find $dx/dt$ when $\theta = \pi/6$ rad and $d\theta/dt = 2/3$ deg/sec.

From Figure 3.48, we see that

$$\frac{12,000}{x} = \tan \theta \quad \text{or} \quad x = 12,000 \cot \theta.$$

Using miles instead of feet for our distance units, the last equation translates to

$$x = \frac{12,000}{5280} \cot \theta.$$

Differentiation with respect to $t$ gives

$$\frac{dx}{dt} = -\frac{1200}{528} \csc^2 \theta \frac{d\theta}{dt}.$$

When $\theta = \pi/6$, $\sin^2 \theta = 1/4$, so $\csc^2 \theta = 4$. Converting $d\theta/dt = 2/3$ deg/sec to radians per hour, we find

$$\frac{d\theta}{dt} = \frac{2}{3} \left( \frac{\pi}{180} \right) (3600) \text{ rad/hr.} \quad 1 \text{ hr} = 3600 \text{ sec}, 1 \text{ deg} = \pi/180 \text{ rad}$$

Substitution into the equation for $dx/dt$ then gives

$$\frac{dx}{dt} = \left( -\frac{1200}{528} \right) (4) \left( \frac{2}{3} \right) \left( \frac{\pi}{180} \right) (3600) \approx -380.$$

The negative sign appears because the distance $x$ is decreasing, so the aircraft is approaching the island at a speed of approximately 380 mi/hr when first detected by the radar. ■

[Figure 3.48: A diagram showing a jet airliner $A$ at a constant altitude of 12,000 units above the horizontal $x$-axis. A radar station $R$ is located at the origin. A red line segment represents the line of sight from $R$ to $A$, forming an angle $\theta$ with the $x$-axis. The horizontal distance from $R$ to a point directly below $A$ is labeled $x$. A dashed blue line with an arrow indicates the airliner is moving horizontally to the left toward the $y$-axis.]

**FIGURE 3.48** Jet airliner $A$ traveling at constant altitude toward radar station $R$ (Example 5).

<!-- PAGE 76 -->

**Chapter 3: Derivatives**

**EXAMPLE 6** Figure 3.49a shows a rope running through a pulley at $P$ and bearing a weight $W$ at one end. The other end is held 5 ft above the ground in the hand $M$ of a worker. Suppose the pulley is 25 ft above ground, the rope is 45 ft long, and the worker is walking rapidly away from the vertical line $PW$ at the rate of 4 ft/sec. How fast is the weight being raised when the worker’s hand is 21 ft away from $PW$?

**Solution** We let $OM$ be the horizontal line of length $x$ ft from a point $O$ directly below the pulley to the worker’s hand $M$ at any instant of time (Figure 3.49). Let $h$ be the height of the weight $W$ above $O$, and let $z$ denote the length of rope from the pulley $P$ to the worker’s hand. We want to know $dh/dt$ when $x = 21$ given that $dx/dt = 4$. Note that the height of $P$ above $O$ is 20 ft because $O$ is 5 ft above the ground. We assume the angle at $O$ is a right angle.

At any instant of time $t$ we have the following relationships (see Figure 3.49b):

$20 - h + z = 45$ Total length of rope is 45 ft.
$20^2 + x^2 = z^2$ Angle at $O$ is a right angle.

If we solve for $z = 25 + h$ in the first equation, and substitute into the second equation, we have

$$20^2 + x^2 = (25 + h)^2. \quad (1)$$

Differentiating both sides with respect to $t$ gives

$$2x \frac{dx}{dt} = 2(25 + h) \frac{dh}{dt},$$

and solving this last equation for $dh/dt$ we find

$$\frac{dh}{dt} = \frac{x}{25 + h} \frac{dx}{dt}. \quad (2)$$

Since we know $dx/dt$, it remains only to find $25 + h$ at the instant when $x = 21$. From Equation (1),

$$20^2 + 21^2 = (25 + h)^2$$

so that

$$(25 + h)^2 = 841, \quad \text{or} \quad 25 + h = 29.$$

Equation (2) now gives

$$\frac{dh}{dt} = \frac{21}{29} \cdot 4 = \frac{84}{29} \approx 2.9 \text{ ft/sec}$$

as the rate at which the weight is being raised when $x = 21$ ft. ■

[Figure 3.49: Two diagrams illustrating Example 6. 
Diagram (a) is a physical sketch. A pulley $P$ is fixed 25 ft above the ground. A rope goes from a weight $W$ up to $P$ and then down to a hand $M$ which is 5 ft above the ground. A horizontal distance $x$ is measured from the vertical line $PW$ to the hand $M$. An arrow shows the hand moving right with $dx/dt = 4$ ft/sec. 
Diagram (b) is a geometric model. It shows a right triangle with vertices $P, O,$ and $M$. The vertical side $PO$ is 20 ft. The horizontal side $OM$ is $x$. The hypotenuse $PM$ is labeled $z$. The weight $W$ hangs below $P$, and its height above the level of $O$ is $h$. An arrow indicates the weight is moving up with $dh/dt = ?$.]

**FIGURE 3.49** A worker at $M$ walks to the right, pulling the weight $W$ upward as the rope moves through the pulley $P$ (Example 6).

### Exercises 3.10

[Exercises omitted]

<!-- PAGE 77 -->
[Exercises omitted]
<!-- PAGE 78 -->
[Exercises omitted]

<!-- PAGE 79 -->
[Exercises omitted]

<!-- PAGE 80 -->
[Exercises omitted]

## 3.11 Linearization and Differentials

Sometimes we can approximate complicated functions with simpler ones that give the accuracy we want for specific applications and are easier to work with. The approximating functions discussed in this section are called **linearizations**, and they are based on tangent lines. Other approximating functions, such as polynomials, are discussed in Chapter 10.

We introduce new variables $dx$ and $dy$, called **differentials**, and define them in a way that makes Leibniz’s notation for the derivative $dy/dx$ a true ratio. We use $dy$ to estimate error in measurement, which then provides for a precise proof of the Chain Rule (Section 3.6).

### Linearization

As you can see in Figure 3.50, the tangent to the curve $y = x^2$ lies close to the curve near the point of tangency. For a brief interval to either side, the $y$-values along the tangent line

[Figure 3.50 consists of four coordinate graphs demonstrating the concept of local linearity by zooming in on the point $(1, 1)$ of the function $y = x^2$ and its tangent line $y = 2x - 1$.
*   **Graph 1:** Shows a broad view. The x-axis is labeled from 0 to 3 and the y-axis from -1 to 4. The blue parabola $y = x^2$ and the red tangent line $y = 2x - 1$ are shown intersecting at $(1, 1)$. Text below: "$y = x^2$ and its tangent $y = 2x - 1$ at $(1, 1)$."
*   **Graph 2:** A closer view. The x-axis and y-axis both range from 0 to 2. The curve and line are closer together. Text below: "Tangent and curve very close near $(1, 1)$."
*   **Graph 3:** Further magnification. Both axes range from 0.8 to 1.2. The line and curve are nearly indistinguishable. Text below: "Tangent and curve very close throughout entire $x$-interval shown."
*   **Graph 4:** Extreme magnification. Both axes range from 0.997 to 1.003. The curve and the tangent line appear as a single overlapping line. Text below: "Tangent and curve closer still. Computer screen cannot distinguish tangent from curve on this $x$-interval."
*   **Caption:** **FIGURE 3.50** The more we magnify the graph of a function near a point where the function is differentiable, the flatter the graph becomes and the more it resembles its tangent.]

<!-- PAGE 81 -->

## 3.11 Linearization and Differentials

give good approximations to the y-values on the curve. We observe this phenomenon by zooming in on the two graphs at the point of tangency or by looking at tables of values for the difference between $f(x)$ and its tangent line near the $x$-coordinate of the point of tangency. The phenomenon is true not just for parabolas; every differentiable curve behaves locally like its tangent line.

In general, the tangent to $y = f(x)$ at a point $x = a$, where $f$ is differentiable (Figure 3.51), passes through the point $(a, f(a))$, so its point-slope equation is

$$y = f(a) + f'(a)(x - a).$$

Thus, this tangent line is the graph of the linear function

$$L(x) = f(a) + f'(a)(x - a).$$

For as long as this line remains close to the graph of $f$ as we move off the point of tangency, $L(x)$ gives a good approximation to $f(x)$.

[Figure 3.51: A Cartesian coordinate system showing a blue curve $y = f(x)$ and a red tangent line $y = L(x)$. The line touches the curve at the point $(a, f(a))$. The slope of the tangent line is labeled as $Slope = f'(a)$.]

**FIGURE 3.51** The tangent to the curve $y = f(x)$ at $x = a$ is the line $L(x) = f(a) + f'(a)(x - a)$.

**DEFINITIONS** If $f$ is differentiable at $x = a$, then the approximating function

$$L(x) = f(a) + f'(a)(x - a)$$

is the **linearization** of $f$ at $a$. The approximation

$$f(x) \approx L(x)$$

of $f$ by $L$ is the **standard linear approximation** of $f$ at $a$. The point $x = a$ is the **center** of the approximation.

**EXAMPLE 1** Find the linearization of $f(x) = \sqrt{1 + x}$ at $x = 0$ (Figure 3.52).

[Figure 3.52: A graph showing the function $y = \sqrt{1 + x}$ as a blue curve from $x = -1$ to $4$. Two red tangent lines are shown. One is $y = 1 + \frac{x}{2}$ tangent at $x = 0$. The second is $y = \frac{5}{4} + \frac{x}{4}$ tangent at $x = 3$. A small dashed rectangular window is drawn around the point $(0, 1)$ on the y-axis.]

[Figure 3.53: A magnified view of the small window from Figure 3.52. The x-axis ranges from $-0.1$ to $0.2$ and the y-axis ranges from $0.9$ to $1.1$. The blue curve $y = \sqrt{1 + x}$ and the red tangent line $y = 1 + \frac{x}{2}$ are shown to be nearly identical in this range.]

**FIGURE 3.52** The graph of $y = \sqrt{1 + x}$ and its linearizations at $x = 0$ and $x = 3$. Figure 3.53 shows a magnified view of the small window about 1 on the y-axis.

**FIGURE 3.53** Magnified view of the window in Figure 3.52.

**Solution** Since

$$f'(x) = \frac{1}{2}(1 + x)^{-1/2},$$

we have $f(0) = 1$ and $f'(0) = 1/2$, giving the linearization

$$L(x) = f(a) + f'(a)(x - a) = 1 + \frac{1}{2}(x - 0) = 1 + \frac{x}{2}.$$

See Figure 3.53.

The following table shows how accurate the approximation $\sqrt{1 + x} \approx 1 + (x/2)$ from Example 1 is for some values of $x$ near 0. As we move away from zero, we lose

<!-- PAGE 82 -->

accuracy. For example, for $x = 2$, the linearization gives 2 as the approximation for $\sqrt{3}$, which is not even accurate to one decimal place.

| Approximation | True value | | True value - approximation | |
| --- | --- | --- |
| $\sqrt{1.2} \approx 1 + \frac{0.2}{2} = 1.10$ | 1.095445 | $0.004555 < 10^{-2}$ |
| $\sqrt{1.05} \approx 1 + \frac{0.05}{2} = 1.025$ | 1.024695 | $0.000305 < 10^{-3}$ |
| $\sqrt{1.005} \approx 1 + \frac{0.005}{2} = 1.00250$ | 1.002497 | $0.000003 < 10^{-5}$ |

Do not be misled by the preceding calculations into thinking that whatever we do with a linearization is better done with a calculator. In practice, we would never use a linearization to find a particular square root. The utility of a linearization is its ability to replace a complicated formula by a simpler one over an entire interval of values. If we have to work with $\sqrt{1 + x}$ for $x$ close to 0 and can tolerate the small amount of error involved, we can work with $1 + (x/2)$ instead. Of course, we then need to know how much error there is. We further examine the estimation of error in Chapter 10.

A linear approximation normally loses accuracy away from its center. As Figure 3.52 suggests, the approximation $\sqrt{1 + x} \approx 1 + (x/2)$ will probably be too crude to be useful near $x = 3$. There, we need the linearization at $x = 3$.

**EXAMPLE 2** Find the linearization of $f(x) = \sqrt{1 + x}$ at $x = 3$.

**Solution** We evaluate the equation defining $L(x)$ at $a = 3$. With

$$f(3) = 2, f'(3) = \frac{1}{2}(1 + x)^{-1/2} \bigg|_{x=3} = \frac{1}{4},$$

we have

$$L(x) = 2 + \frac{1}{4}(x - 3) = \frac{5}{4} + \frac{x}{4}.$$

At $x = 3.2$, the linearization in Example 2 gives

$$\sqrt{1 + x} = \sqrt{1 + 3.2} \approx \frac{5}{4} + \frac{3.2}{4} = 1.250 + 0.800 = 2.050,$$

which differs from the true value $\sqrt{4.2} \approx 2.04939$ by less than one one-thousandth. The linearization in Example 1 gives

$$\sqrt{1 + x} = \sqrt{1 + 3.2} \approx 1 + \frac{3.2}{2} = 1 + 1.6 = 2.6,$$

a result that is off by more than 25%.

**EXAMPLE 3** Find the linearization of $f(x) = \cos x$ at $x = \pi/2$ (Figure 3.54).

**Solution** Since $f(\pi/2) = \cos(\pi/2) = 0$, $f'(x) = -\sin x$, and $f'(\pi/2) = -\sin(\pi/2) = -1$, we find the linearization at $a = \pi/2$ to be

$$L(x) = f(a) + f'(a)(x - a)$$
$$= 0 + (-1)\left(x - \frac{\pi}{2}\right)$$
$$= -x + \frac{\pi}{2}.$$

[Figure 3.54: A graph showing the function $y = \cos x$ in blue. A red tangent line with the equation $y = -x + \frac{\pi}{2}$ touches the curve at the point $(\pi/2, 0)$. The axes are labeled $x$ and $y$.]

**FIGURE 3.54** The graph of $f(x) = \cos x$ and its linearization at $x = \pi/2$. Near $x = \pi/2$, $\cos x \approx -x + (\pi/2)$ (Example 3).

<!-- PAGE 83 -->

## 3.11 Linearization and Differentials

An important linear approximation for roots and powers is

$$(1 + x)^k \approx 1 + kx \quad (x \text{ near 0; any number } k)$$

(Exercise 15). This approximation, good for values of $x$ sufficiently close to zero, has broad application. For example, when $x$ is small,

$\sqrt{1 + x} \approx 1 + \frac{1}{2}x$ $|$ $k = 1/2$

$\frac{1}{1 - x} = (1 - x)^{-1} \approx 1 + (-1)(-x) = 1 + x$ $|$ $k = -1; \text{ replace } x \text{ by } -x.$

$\sqrt[3]{1 + 5x^4} = (1 + 5x^4)^{1/3} \approx 1 + \frac{1}{3}(5x^4) = 1 + \frac{5}{3}x^4$ $|$ $k = 1/3; \text{ replace } x \text{ by } 5x^4.$

$\frac{1}{\sqrt{1 - x^2}} = (1 - x^2)^{-1/2} \approx 1 + \left(-\frac{1}{2}\right)(-x^2) = 1 + \frac{1}{2}x^2$ $|$ $k = -1/2;$ replace $x$ by $-x^2.$

[Sidebar Note:
**Approximations Near $x = 0$**
* $\sqrt{1 + x} \approx 1 + \frac{x}{2}$
* $\frac{1}{1 - x} \approx 1 + x$
* $\frac{1}{\sqrt{1 - x^2}} \approx 1 + \frac{x^2}{2}$
]

### Differentials

We sometimes use the Leibniz notation $dy/dx$ to represent the derivative of $y$ with respect to $x$. Contrary to its appearance, it is not a ratio. We now introduce two new variables $dx$ and $dy$ with the property that when their ratio exists, it is equal to the derivative.

**DEFINITION** Let $y = f(x)$ be a differentiable function. The **differential $dx$** is an independent variable. The **differential $dy$** is
$$dy = f'(x) dx.$$

Unlike the independent variable $dx$, the variable $dy$ is always a dependent variable. It depends on both $x$ and $dx$. If $dx$ is given a specific value and $x$ is a particular number in the domain of the function $f$, then these values determine the numerical value of $dy$. Often the variable $dx$ is chosen to be $\Delta x$, the change in $x$.

**EXAMPLE 4**
(a) Find $dy$ if $y = x^5 + 37x$.
(b) Find the value of $dy$ when $x = 1$ and $dx = 0.2$.

**Solution**
(a) $dy = (5x^4 + 37) dx$
(b) Substituting $x = 1$ and $dx = 0.2$ in the expression for $dy$, we have
$dy = (5 \cdot 1^4 + 37) 0.2 = 8.4.$

The geometric meaning of differentials is shown in Figure 3.55. Let $x = a$ and set $dx = \Delta x$. The corresponding change in $y = f(x)$ is
$$\Delta y = f(a + dx) - f(a).$$

The corresponding change in the tangent line $L$ is
$$\Delta L = L(a + dx) - L(a)$$
$$= \underbrace{f(a) + f'(a)[(a + dx) - a]}_{L(a+dx)} - \underbrace{f(a)}_{L(a)}$$
$$= f'(a) dx.$$

<!-- PAGE 84 -->

[Bracketed Figure Description:
**FIGURE 3.55**
A coordinate plane with $x$ and $y$ axes. A blue curve represents the function $y = f(x)$. 
* A red tangent line is drawn to the curve at the point $(a, f(a))$.
* A second point on the curve is labeled $(a + dx, f(a + dx))$.
* A horizontal distance along the x-axis from $a$ to $a + dx$ is labeled $dx = \Delta x$.
* The vertical distance from the point $(a, f(a))$ to the tangent line at $x = a + dx$ is labeled $\Delta L = f'(a)dx$.
* The vertical distance from the point $(a, f(a))$ to the curve at $x = a + dx$ is labeled $\Delta y = f(a + dx) - f(a)$.
* An annotation points to $\Delta L$ and states: "When $dx$ is a small change in $x$, the corresponding change in the linearization is precisely $dy$."
* Caption: **FIGURE 3.55** Geometrically, the differential $dy$ is the change $\Delta L$ in the linearization of $f$ when $x = a$ changes by an amount $dx = \Delta x$.
]

That is, the change in the linearization of $f$ is precisely the value of the differential $dy$ when $x = a$ and $dx = \Delta x$. Therefore, $dy$ represents the amount the tangent line rises or falls when $x$ changes by an amount $dx = \Delta x$.

If $dx \neq 0$, then the quotient of the differential $dy$ by the differential $dx$ is equal to the derivative $f'(x)$ because
$$dy \div dx = \frac{f'(x) dx}{dx} = f'(x) = \frac{dy}{dx}.$$

We sometimes write
$$df = f'(x) dx$$
in place of $dy = f'(x) dx$, calling $df$ the **differential of $f$**. For instance, if $f(x) = 3x^2 - 6$, then
$$df = d(3x^2 - 6) = 6x dx.$$

Every differentiation formula like
$$\frac{d(u + v)}{dx} = \frac{du}{dx} + \frac{dv}{dx} \quad \text{or} \quad \frac{d(\sin u)}{dx} = \cos u \frac{du}{dx}$$
has a corresponding differential form like
$$d(u + v) = du + dv \quad \text{or} \quad d(\sin u) = \cos u du.$$

**EXAMPLE 5** We can use the Chain Rule and other differentiation rules to find differentials of functions.
(a) $d(\tan 2x) = \sec^2 (2x) d(2x) = 2 \sec^2 2x dx$
(b) $d\left(\frac{x}{x + 1}\right) = \frac{(x + 1) dx - x d(x + 1)}{(x + 1)^2} = \frac{x dx + dx - x dx}{(x + 1)^2} = \frac{dx}{(x + 1)^2}$

### Estimating with Differentials

Suppose we know the value of a differentiable function $f(x)$ at a point $a$ and want to estimate how much this value will change if we move to a nearby point $a + dx$. If $dx = \Delta x$ is small, then we can see from Figure 3.55 that $\Delta y$ is approximately equal to the differential $dy$. Since
$$f(a + dx) = f(a) + \Delta y, \quad \Delta x = dx$$

<!-- PAGE 85 -->

### 3.11 Linearization and Differentials

the differential approximation gives

$$f(a + dx) \approx f(a) + dy$$

when $dx = \Delta x$. Thus the approximation $\Delta y \approx dy$ can be used to estimate $f(a + dx)$ when $f(a)$ is known, $dx$ is small, and $dy = f'(a) dx$.

[Figure 3.56: A diagram of a circle with radius $a = 10$. A small incremental shell is added to the outside of the circle with a thickness labeled $dr = 0.1$. The change in area is annotated as $\Delta A \approx dA = 2\pi a \, dr$. The caption reads: **FIGURE 3.56** When $dr$ is small compared with $a$, the differential $dA$ gives the estimate $A(a + dr) = \pi a^2 + dA$ (Example 6).]

**EXAMPLE 6** The radius $r$ of a circle increases from $a = 10$ m to $10.1$ m (Figure 3.56). Use $dA$ to estimate the increase in the circle’s area $A$. Estimate the area of the enlarged circle and compare your estimate to the true area found by direct calculation.

**Solution** Since $A = \pi r^2$, the estimated increase is

$$dA = A'(a) \, dr = 2\pi a \, dr = 2\pi(10)(0.1) = 2\pi \text{ m}^2.$$

Thus, since $A(r + \Delta r) \approx A(r) + dA$, we have

$$A(10 + 0.1) \approx A(10) + 2\pi$$
$$= \pi(10)^2 + 2\pi = 102\pi.$$

The area of a circle of radius $10.1$ m is approximately $102\pi \text{ m}^2$.
The true area is

$$A(10.1) = \pi(10.1)^2$$
$$= 102.01\pi \text{ m}^2.$$

The error in our estimate is $0.01\pi \text{ m}^2$, which is the difference $\Delta A - dA$.

**EXAMPLE 7** Use differentials to estimate
(a) $7.97^{1/3}$
(b) $\sin(\pi/6 + 0.01)$.

**Solution**
(a) The differential associated with the cube root function $y = x^{1/3}$ is

$$dy = \frac{1}{3x^{2/3}} dx.$$

We set $a = 8$, the closest number near $7.97$ where we can easily compute $f(a)$ and $f'(a)$. To arrange that $a + dx = 7.97$, we choose $dx = -0.03$. Approximating with the differential gives

$$f(7.97) = f(a + dx) \approx f(a) + dy$$
$$= 8^{1/3} + \frac{1}{3(8)^{2/3}}(-0.03)$$
$$= 2 + \frac{1}{12}(-0.03) = 1.9975$$

This gives an approximation to the true value of $7.97^{1/3}$, which is $1.997497$ to 6 decimals.
(b) The differential associated with $y = \sin x$ is

$$dy = \cos x \, dx.$$

<!-- PAGE 86 -->

To estimate $\sin(\pi/6 + 0.01)$, we set $a = \pi/6$ and $dx = 0.01$. Then

$$f(\pi/6 + 0.01) = f(a + dx) \approx f(a) + dy$$
$$= \sin \frac{\pi}{6} + \left( \cos \frac{\pi}{6} \right)(0.01)$$
$$= \frac{1}{2} + \frac{\sqrt{3}}{2}(0.01) \approx 0.5087$$

For comparison, the true value of $\sin(\pi/6 + 0.01)$ to 6 decimals is $0.508635$.

[Side Note: $\sin(a + dx) \approx \sin a + (\cos a) \, dx$]

The method in part (b) of Example 7 is used by some calculator and computer algorithms to give values of trigonometric functions. The algorithms store a large table of sine and cosine values between $0$ and $\pi/4$. Values between these stored values are computed using differentials as in Example 7b. Values outside of $[0, \pi/4]$ are computed from values in this interval using trigonometric identities.

### Error in Differential Approximation

Let $f(x)$ be differentiable at $x = a$ and suppose that $dx = \Delta x$ is an increment of $x$. We have two ways to describe the change in $f$ as $x$ changes from $a$ to $a + \Delta x$:

The true change: $\Delta f = f(a + \Delta x) - f(a)$
The differential estimate: $df = f'(a) \Delta x$.

How well does $df$ approximate $\Delta f$?
We measure the approximation error by subtracting $df$ from $\Delta f$:

$$\text{Approximation error} = \Delta f - df$$
$$= \Delta f - f'(a) \Delta x$$
$$= f(a + \Delta x) - f(a) - f'(a) \Delta x$$
$$= \left( \frac{f(a + \Delta x) - f(a)}{\Delta x} - f'(a) \right) \cdot \Delta x$$

[Note: A blue bracket points to the term in the parentheses with the label: "Call this part $\epsilon$."]

$$= \epsilon \cdot \Delta x.$$

As $\Delta x \to 0$, the difference quotient

$$\frac{f(a + \Delta x) - f(a)}{\Delta x}$$

approaches $f'(a)$ (remember the definition of $f'(a)$), so the quantity in parentheses becomes a very small number (which is why we called it $\epsilon$). In fact, $\epsilon \to 0$ as $\Delta x \to 0$. When $\Delta x$ is small, the approximation error $\epsilon \Delta x$ is smaller still.

$$\Delta f = f'(a) \Delta x + \epsilon \Delta x$$

[Below the equation, labels are provided for each term: "true change" corresponds to $\Delta f$, "estimated change" corresponds to $f'(a) \Delta x$, and "error" corresponds to $\epsilon \Delta x$.]

Although we do not know the exact size of the error, it is the product $\epsilon \cdot \Delta x$ of two small quantities that both approach zero as $\Delta x \to 0$. For many common functions, whenever $\Delta x$ is small, the error is still smaller.

<!-- PAGE 87 -->

## 3.11 Linearization and Differentials

**Change in $y = f(x)$ near $x = a$**
If $y = f(x)$ is differentiable at $x = a$ and $x$ changes from $a$ to $a + \Delta x$, the change $\Delta y$ in $f$ is given by
$$\Delta y = f'(a) \Delta x + \epsilon \Delta x$$ (1)
in which $\epsilon \to 0$ as $\Delta x \to 0$.

In Example 6 we found that
$$\Delta A = \pi(10.1)^{2} - \pi(10)^{2} = (102.01 - 100)\pi = (2\pi + 0.01\pi) m^{2}$$
[Note: In the expression $(2\pi + 0.01\pi)$ above, a blue bracket labeled $dA$ points to the $2\pi$ term, and a blue bracket labeled "error" points to the $0.01\pi$ term.]

so the approximation error is $\Delta A - dA = \epsilon \Delta r = 0.01\pi$ and $\epsilon = 0.01\pi / \Delta r = 0.01\pi / 0.1 = 0.1\pi$ m.

## Proof of the Chain Rule

Equation (1) enables us to prove the Chain Rule correctly. Our goal is to show that if $f(u)$ is a differentiable function of $u$ and $u = g(x)$ is a differentiable function of $x$, then the composite $y = f(g(x))$ is a differentiable function of $x$. Since a function is differentiable if and only if it has a derivative at each point in its domain, we must show that whenever $g$ is differentiable at $x_{0}$ and $f$ is differentiable at $g(x_{0})$, then the composite is differentiable at $x_{0}$ and the derivative of the composite satisfies the equation
$$\left. \frac{dy}{dx} \right|_{x=x_{0}} = f'(g(x_{0})) \cdot g'(x_{0}).$$

Let $\Delta x$ be an increment in $x$ and let $\Delta u$ and $\Delta y$ be the corresponding increments in $u$ and $y$. Applying Equation (1) we have
$$\Delta u = g'(x_{0})\Delta x + \epsilon_{1} \Delta x = (g'(x_{0}) + \epsilon_{1})\Delta x,$$
where $\epsilon_{1} \to 0$ as $\Delta x \to 0$. Similarly,
$$\Delta y = f'(u_{0})\Delta u + \epsilon_{2} \Delta u = (f'(u_{0}) + \epsilon_{2})\Delta u,$$
where $\epsilon_{2} \to 0$ as $\Delta u \to 0$. Notice also that $\Delta u \to 0$ as $\Delta x \to 0$. Combining the equations for $\Delta u$ and $\Delta y$ gives
$$\Delta y = (f'(u_{0}) + \epsilon_{2})(g'(x_{0}) + \epsilon_{1})\Delta x,$$
so
$$\frac{\Delta y}{\Delta x} = f'(u_{0})g'(x_{0}) + \epsilon_{2} g'(x_{0}) + f'(u_{0})\epsilon_{1} + \epsilon_{2}\epsilon_{1}.$$

Since $\epsilon_{1}$ and $\epsilon_{2}$ go to zero as $\Delta x$ goes to zero, the last three terms on the right vanish in the limit, leaving
$$\left. \frac{dy}{dx} \right|_{x=x_{0}} = \lim_{\Delta x \to 0} \frac{\Delta y}{\Delta x} = f'(u_{0})g'(x_{0}) = f'(g(x_{0})) \cdot g'(x_{0}).$$
[Note: A solid black square appears at the end of the proof.]

<!-- PAGE 88 -->

## Chapter 3: Derivatives

### Sensitivity to Change

The equation $df = f'(x) dx$ tells how sensitive the output of $f$ is to a change in input at different values of $x$. The larger the value of $f'$ at $x$, the greater the effect of a given change $dx$. As we move from $a$ to a nearby point $a + dx$, we can describe the change in $f$ in three ways:

| | True | Estimated |
| :--- | :--- | :--- |
| Absolute change | $\Delta f = f(a + dx) - f(a)$ | $df = f'(a) dx$ |
| Relative change | $\frac{\Delta f}{f(a)}$ | $\frac{df}{f(a)}$ |
| Percentage change | $\frac{\Delta f}{f(a)} \times 100$ | $\frac{df}{f(a)} \times 100$ |

**EXAMPLE 8** You want to calculate the depth of a well from the equation $s = 16t^{2}$ by timing how long it takes a heavy stone you drop to splash into the water below. How sensitive will your calculations be to a 0.1-sec error in measuring the time?

**Solution** The size of $ds$ in the equation
$$ds = 32t dt$$
depends on how big $t$ is. If $t = 2$ sec, the change caused by $dt = 0.1$ is about
$$ds = 32(2)(0.1) = 6.4 \text{ ft.}$$
Three seconds later at $t = 5$ sec, the change caused by the same $dt$ is
$$ds = 32(5)(0.1) = 16 \text{ ft.}$$
For a fixed error in the time measurement, the error in using $ds$ to estimate the depth is larger when it takes a longer time before the stone splashes into the water. That is, the estimate is more sensitive to the effect of the error for larger values of $t$. [Note: A small red square indicates the end of the example.]

**EXAMPLE 9** Newton's second law,
$$F = \frac{d}{dt}(mv) = m \frac{dv}{dt} = ma,$$
is stated with the assumption that mass is constant, but we know this is not strictly true because the mass of an object increases with velocity. In Einstein's corrected formula, mass has the value
$$m = \frac{m_{0}}{\sqrt{1 - v^{2}/c^{2}}},$$
where the "rest mass" $m_{0}$ represents the mass of an object that is not moving and $c$ is the speed of light, which is about 300,000 km/sec. Use the approximation
$$\frac{1}{\sqrt{1 - x^{2}}} \approx 1 + \frac{1}{2}x^{2}$$ (2)
to estimate the increase $\Delta m$ in mass resulting from the added velocity $v$.

**Solution** When $v$ is very small compared with $c$, $v^{2}/c^{2}$ is close to zero and it is safe to use the approximation
$$\frac{1}{\sqrt{1 - v^{2}/c^{2}}} \approx 1 + \frac{1}{2} \left( \frac{v^{2}}{c^{2}} \right)$$ Eq. (2) with $x = \frac{v}{c}$

<!-- PAGE 89 -->

## 3.11 Linearization and Differentials

to obtain
$$m = \frac{m_0}{\sqrt{1 - v^2/c^2}} \approx m_0 \left[ 1 + \frac{1}{2} \left( \frac{v^2}{c^2} \right) \right] = m_0 + \frac{1}{2} m_0 v^2 \left( \frac{1}{c^2} \right),$$
or
$$m \approx m_0 + \frac{1}{2} m_0 v^2 \left( \frac{1}{c^2} \right). \quad (3)$$
Equation (3) expresses the increase in mass that results from the added velocity $v$.

### Converting Mass to Energy
Equation (3) derived in Example 9 has an important interpretation. In Newtonian physics, $(1/2)m_0v^2$ is the kinetic energy (KE) of the object, and if we rewrite Equation (3) in the form
$$(m - m_0) c^2 \approx \frac{1}{2} m_0 v^2,$$
we see that
$$(m - m_0) c^2 \approx \frac{1}{2} m_0 v^2 = \frac{1}{2} m_0 v^2 - \frac{1}{2} m_0 (0)^2 = \Delta(KE),$$
or
$$(\Delta m) c^2 \approx \Delta(KE).$$
So the change in kinetic energy $\Delta(KE)$ in going from velocity 0 to velocity $v$ is approximately equal to $(\Delta m) c^2$, the change in mass times the square of the speed of light. Using $c \approx 3 \times 10^8$ m/sec, we see that a small change in mass can create a large change in energy.

[Exercises omitted]

<!-- PAGE 90 -->

[Exercises omitted]

<!-- PAGE 91 -->

## 3.11 Linearization and Differentials

where $W$ is the work per unit time, $P$ is the average blood pressure, $V$ is the volume of blood pumped out during the unit of time, $\delta$ ("delta") is the weight density of the blood, $v$ is the average velocity of the exiting blood, and $g$ is the acceleration of gravity.

When $P, V, \delta,$ and $v$ remain constant, $W$ becomes a function of $g$, and the equation takes the simplified form

$$W = a + \frac{b}{g} \text{ ($a, b$ constant).}$$

As a member of NASA’s medical team, you want to know how sensitive $W$ is to apparent changes in $g$ caused by flight maneuvers, and this depends on the initial value of $g$. As part of your investigation, you decide to compare the effect on $W$ of a given change $dg$ on the moon, where $g = 5.2\text{ ft/sec}^2$, with the effect the same change $dg$ would have on Earth, where $g = 32\text{ ft/sec}^2$. Use the simplified equation above to find the ratio of $dW_{\text{moon}}$ to $dW_{\text{Earth}}$.

[Exercises omitted]

**66. The linearization is the best linear approximation** Suppose that $y = f(x)$ is differentiable at $x = a$ and that $g(x) = m(x - a) + c$ is a linear function in which $m$ and $c$ are constants. If the error $E(x) = f(x) - g(x)$ were small enough near $x = a$, we might think of using $g$ as a linear approximation of $f$ instead of the linearization $L(x) = f(a) + f'(a)(x - a)$. Show that if we impose on $g$ the conditions

1. $E(a) = 0$ (The approximation error is zero at $x = a$.)
2. $\lim_{x \to a} \frac{E(x)}{x - a} = 0$ (The error is negligible when compared with $x - a$.)

then $g(x) = f(a) + f'(a)(x - a)$. Thus, the linearization $L(x)$ gives the only linear approximation whose error is both zero at $x = a$ and negligible in comparison with $x - a$.

[Note: The page contains a diagram illustrating the linearization. The graph shows a coordinate system with a curve $y = f(x)$ in blue. A point on the curve is labeled $(a, f(a))$. A blue tangent line passing through this point is labeled "The linearization, $L(x): y = f(a) + f'(a)(x - a)$". A second, purple straight line passing through the same vicinity is labeled "Some other linear approximation, $g(x): y = m(x - a) + c$". The x-axis indicates two points, $a$ and $x$.]

[Exercises omitted]

### COMPUTER EXPLORATIONS

In Exercises 69–74, use a CAS to estimate the magnitude of the error in using the linearization in place of the function over a specified interval $I$. Perform the following steps:

a. Plot the function $f$ over $I$.
b. Find the linearization $L$ of the function at the point $a$.
c. Plot $f$ and $L$ together on a single graph.

[Exercises omitted]

<!-- PAGE 92 -->

d. Plot the absolute error $|f(x) - L(x)|$ over $I$ and find its maximum value.
e. From your graph in part (d), estimate as large a $\delta > 0$ as you can, satisfying

$$|x - a| < \delta \implies |f(x) - L(x)| < \epsilon$$

for $\epsilon = 0.5, 0.1,$ and $0.01$. Then check graphically to see if your $\delta$-estimate holds true.

[Exercises omitted]

## Chapter 3 Questions to Guide Your Review

1. What is the derivative of a function $f$? How is its domain related to the domain of $f$? Give examples.
2. What role does the derivative play in defining slopes, tangents, and rates of change?
3. How can you sometimes graph the derivative of a function when all you have is a table of the function’s values?
4. What does it mean for a function to be differentiable on an open interval? On a closed interval?
5. How are derivatives and one-sided derivatives related?
6. Describe geometrically when a function typically does not have a derivative at a point.
7. How is a function’s differentiability at a point related to its continuity there, if at all?
8. What rules do you know for calculating derivatives? Give some examples.
9. Explain how the three formulas
    a. $\frac{d}{dx}(x^n) = nx^{n-1}$
    b. $\frac{d}{dx}(cu) = c\frac{du}{dx}$
    c. $\frac{d}{dx}(u_1 + u_2 + \dots + u_n) = \frac{du_1}{dx} + \frac{du_2}{dx} + \dots + \frac{du_n}{dx}$
    enable us to differentiate any polynomial.
10. What formula do we need, in addition to the three listed in Question 9, to differentiate rational functions?
11. What is a second derivative? A third derivative? How many derivatives do the functions you know have? Give examples.
12. What is the derivative of the exponential function $e^x$? How does the domain of the derivative compare with the domain of the function?
13. What is the relationship between a function’s average and instantaneous rates of change? Give an example.
14. How do derivatives arise in the study of motion? What can you learn about an object’s motion along a line by examining the derivatives of the object’s position function? Give examples.
15. How can derivatives arise in economics?
16. Give examples of still other applications of derivatives.
17. What do the limits $\lim_{h \to 0} \frac{\sin h}{h}$ and $\lim_{h \to 0} \frac{\cos h - 1}{h}$ have to do with the derivatives of the sine and cosine functions? What are the derivatives of these functions?
18. Once you know the derivatives of $\sin x$ and $\cos x$, how can you find the derivatives of $\tan x, \cot x, \sec x,$ and $\csc x$? What are the derivatives of these functions?
19. At what points are the six basic trigonometric functions continuous? How do you know?
20. What is the rule for calculating the derivative of a composite of two differentiable functions? How is such a derivative evaluated? Give examples.
21. If $u$ is a differentiable function of $x$, how do you find $(d/dx)(u^n)$ if $n$ is an integer? If $n$ is a real number? Give examples.
22. What is implicit differentiation? When do you need it? Give examples.
23. What is the derivative of the natural logarithm function $\ln x$? How does the domain of the derivative compare with the domain of the function?
24. What is the derivative of the exponential function $a^x, a > 0$ and $a \neq 1$? What is the geometric significance of the limit of $(a^h - 1)/h$ as $h \to 0$? What is the limit when $a$ is the number $e$?
25. What is the derivative of $\log_a x$? Are there any restrictions on $a$?
26. What is logarithmic differentiation? Give an example.
27. How can you write any real power of $x$ as a power of $e$? Are there any restrictions on $x$? How does this lead to the Power Rule for differentiating arbitrary real powers?
28. What is one way of expressing the special number $e$ as a limit? What is an approximate numerical value of $e$ correct to 7 decimal places?
29. What are the derivatives of the inverse trigonometric functions? How do the domains of the derivatives compare with the domains of the functions?
30. How do related rates problems arise? Give examples.
31. Outline a strategy for solving related rates problems. Illustrate with an example.
32. What is the linearization $L(x)$ of a function $f(x)$ at a point $x = a$? What is required of $f$ at $a$ for the linearization to exist? How are linearizations used? Give examples.
33. If $x$ moves from $a$ to a nearby value $a + dx$, how do you estimate the corresponding change in the value of a differentiable function $f(x)$? How do you estimate the relative change? The percentage change? Give an example.

<!-- PAGE 93 -->
[Exercises omitted]

<!-- PAGE 94 -->
[Exercises omitted]

<!-- PAGE 95 -->
[Exercises omitted]
<!-- PAGE 96 -->
[Exercises omitted]

<!-- PAGE 97 -->
[Exercises omitted]
<!-- PAGE 98 -->
[Exercises omitted]

<!-- PAGE 99 -->
[Exercises omitted]

<!-- PAGE 100 -->
[Exercises omitted]

## Chapter 3 Technology Application Projects

### Mathematica/Maple Modules:

#### Convergence of Secant Slopes to the Derivative Function
You will visualize the secant line between successive points on a curve and observe what happens as the distance between them becomes small. The function, sample points, and secant lines are plotted on a single graph, while a second graph compares the slopes of the secant lines with the derivative function.

#### Derivatives, Slopes, Tangent Lines, and Making Movies
**Parts I–III.** You will visualize the derivative at a point, the linearization of a function, and the derivative of a function. You learn how to plot the function and selected tangents on the same graph.

**Part IV (Plotting Many Tangents)**
**Part V (Making Movies).** Parts IV and V of the module can be used to animate tangent lines as one moves along the graph of a function.

#### Convergence of Secant Slopes to the Derivative Function
You will visualize right-hand and left-hand derivatives.

#### Motion Along a Straight Line: Position $\to$ Velocity $\to$ Acceleration
Observe dramatic animated visualizations of the derivative relations among the position, velocity, and acceleration functions. Figures in the text can be animated.