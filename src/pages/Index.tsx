import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MetisNavbar from "@/components/MetisNavbar";
import MetisDrawer from "@/components/MetisDrawer";
import MetisInput from "@/components/MetisInput";
import TeachingArea from "@/components/TeachingArea";
import WelcomeState from "@/components/WelcomeState";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import quadraticGraph from "@/assets/quadratic-graph.png";
import eulerCircle from "@/assets/euler-circle.png";

const demoResponses = [
  `## The Quadratic Formula

![Quadratic function graph](${quadraticGraph})

One of the most fundamental results in algebra is the **quadratic formula.** It gives us the solutions to any equation of the form $ax^2 + bx + c = 0$, where $a$, $b$, and $c$ are constants and $a \\neq 0$.

The formula states:

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

The expression under the square root, $b^2 - 4ac$, is called the **discriminant** and is often denoted $\\Delta$. It tells us everything about the nature of the solutions:

If $\\Delta > 0$, there are **two distinct real solutions.** If $\\Delta = 0$, there is exactly **one repeated root.** And if $\\Delta < 0$, the solutions are **complex numbers** involving $i = \\sqrt{-1}$.

Let's try a concrete example. Consider:

$$2x^2 - 4x - 6 = 0$$

Here $a = 2$, $b = -4$, and $c = -6$. First, compute the discriminant:

$$\\Delta = (-4)^2 - 4(2)(-6) = 16 + 48 = 64$$

Since $\\Delta = 64 > 0$ and $\\sqrt{64} = 8$, we get two solutions:

$$x_1 = \\frac{4 + 8}{4} = 3 \\qquad x_2 = \\frac{4 - 8}{4} = -1$$

We can verify by substituting $x = 3$ back: $2(3)^2 - 4(3) - 6 = 18 - 12 - 6 = 0$ ✓

This formula is derived by **completing the square** — rewriting $ax^2 + bx + c$ as $a\\left(x + \\frac{b}{2a}\\right)^2 - \\frac{b^2 - 4ac}{4a}$, a technique that appears throughout mathematics.`,

  `## Euler's Identity

![Unit circle in the complex plane](${eulerCircle})

Often called the **most beautiful equation in mathematics**, Euler's identity connects five fundamental constants in a single, elegant expression:

$$e^{i\\pi} + 1 = 0$$

This brings together $e$ (the base of natural logarithms), $i$ (the imaginary unit), $\\pi$ (the ratio of a circle's circumference to its diameter), $1$ (the multiplicative identity), and $0$ (the additive identity).

It emerges from **Euler's formula**, which states that for any real number $\\theta$:

$$e^{i\\theta} = \\cos\\theta + i\\sin\\theta$$

When we substitute $\\theta = \\pi$, we get $\\cos\\pi = -1$ and $\\sin\\pi = 0$, so:

$$e^{i\\pi} = -1 + 0i = -1$$

Adding $1$ to both sides gives us the identity. The deeper insight is that **exponentiation by an imaginary number produces rotation** in the complex plane. The number $e^{i\\theta}$ traces the unit circle as $\\theta$ varies.

This means any complex number $z$ with $|z| = r$ and argument $\\theta$ can be written as:

$$z = re^{i\\theta}$$

This *polar form* makes multiplication elegant — to multiply two complex numbers, you **multiply their magnitudes and add their angles:**

$$z_1 z_2 = r_1 r_2 \\, e^{i(\\theta_1 + \\theta_2)}$$

Euler's identity is not just beautiful — it is the foundation of **signal processing**, **quantum mechanics**, and much of modern physics.`,

  `## Sorting Algorithms

One of the first things you learn in computer science is how to **sort a list.** There are many approaches — let's look at three classics, each with a different philosophy.

The simplest is **Bubble Sort.** It repeatedly walks through the list, swapping adjacent elements that are out of order. It's intuitive but slow — $O(n^2)$ in the worst case.

\`\`\`python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
\`\`\`

A much faster approach is **Merge Sort**, which uses *divide and conquer* — split the list in half, sort each half, then merge them back. It guarantees $O(n \\log n)$ time.

\`\`\`rust
fn merge_sort(mut arr: Vec<i32>) -> Vec<i32> {
    let len = arr.len();
    if len <= 1 { return arr; }

    let mid = len / 2;
    let left = merge_sort(arr[..mid].to_vec());
    let right = merge_sort(arr[mid..].to_vec());

    merge(&left, &right)
}

fn merge(left: &[i32], right: &[i32]) -> Vec<i32> {
    let mut result = Vec::new();
    let (mut i, mut j) = (0, 0);
    while i < left.len() && j < right.len() {
        if left[i] <= right[j] {
            result.push(left[i]);
            i += 1;
        } else {
            result.push(right[j]);
            j += 1;
        }
    }
    result.extend_from_slice(&left[i..]);
    result.extend_from_slice(&right[j..]);
    result
}
\`\`\`

Finally, **Quick Sort** picks a *pivot* element and partitions the array around it. On average it runs in $O(n \\log n)$, but its worst case is $O(n^2)$ — though this is rare with good pivot selection.

\`\`\`javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[arr.length - 1];
  const left = arr.filter((x, i) => x <= pivot && i < arr.length - 1);
  const right = arr.filter(x => x > pivot);

  return [...quickSort(left), pivot, ...quickSort(right)];
}
\`\`\`

The key insight is the **time-space tradeoff.** Bubble Sort uses $O(1)$ extra space but is slow. Merge Sort is fast but needs $O(n)$ extra memory. Quick Sort sits in between — fast on average with $O(\\log n)$ stack space.

In practice, most languages use a hybrid like **Timsort** (Python) or **introsort** (C++), combining the strengths of multiple algorithms.`,
];

const profilingResponse = `## Understanding Your Learning Profile

Based on your responses, I'm building a personalized curriculum tailored to your background and goals. Here's what I've gathered:

Your learning profile helps me determine the right **pace**, **depth**, and **style** for your course. I'll focus on building intuition through examples first, then layering in the formal theory.

The course will be structured in **progressive arcs** — each one building on the last, with checkpoints to make sure everything clicks before moving on.

$$\\text{Your Journey} = \\sum_{k=1}^{n} \\text{Arc}_k \\cdot \\text{Understanding}$$

Every arc will include **clear explanations**, **worked examples**, and **practice problems** designed specifically for your level. Let's build something great together.`;

const demoCourses = [
  { id: 0, title: "The Quadratic Formula" },
  { id: 1, title: "Euler's Identity" },
  { id: 2, title: "Sorting Algorithms" },
];

interface IndexProps {
  mode?: "learn" | "profiling";
}

const Index = ({ mode = "learn" }: IndexProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState(-1); // -1 = welcome
  const [isTeaching, setIsTeaching] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [profilingDone, setProfilingDone] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const generateTimeoutRef = useRef<number | null>(null);
  const profilingTimeoutRef = useRef<number | null>(null);

  const isProfiling = mode === "profiling";
  const responses = isProfiling ? [profilingResponse] : demoResponses;

  // Handle course query param on mount
  useEffect(() => {
    const courseParam = searchParams.get("course");
    if (courseParam !== null && !isProfiling) {
      const courseId = parseInt(courseParam, 10);
      if (courseId >= 0 && courseId < demoResponses.length) {
        setCurrentPage(courseId);
        setIsTeaching(true);
        setFadeKey((k) => k + 1);
      }
    }
  }, [searchParams, isProfiling]);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  useEffect(() => {
    setIsGenerating(false);
    setProfilingDone(false);

    if (profilingTimeoutRef.current) {
      window.clearTimeout(profilingTimeoutRef.current);
      profilingTimeoutRef.current = null;
    }

    if (generateTimeoutRef.current) {
      window.clearTimeout(generateTimeoutRef.current);
      generateTimeoutRef.current = null;
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      if (profilingTimeoutRef.current) {
        window.clearTimeout(profilingTimeoutRef.current);
      }

      if (generateTimeoutRef.current) {
        window.clearTimeout(generateTimeoutRef.current);
      }
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    setCurrentPage(0);
    setIsTeaching(true);
    setFadeKey((k) => k + 1);
    if (isProfiling) {
      if (profilingTimeoutRef.current) {
        window.clearTimeout(profilingTimeoutRef.current);
      }

      profilingTimeoutRef.current = window.setTimeout(() => {
        setProfilingDone(true);
        profilingTimeoutRef.current = null;
      }, 1200);
    }
  }, [isProfiling]);

  const handleTeachingFinished = useCallback(() => {
    setIsTeaching(false);
  }, []);

  const goNext = useCallback(() => {
    if (currentPage < responses.length - 1) {
      setCurrentPage((p) => p + 1);
      setIsTeaching(true);
      setFadeKey((k) => k + 1);
    }
  }, [currentPage, responses.length]);

  const goBack = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      setIsTeaching(true);
      setFadeKey((k) => k + 1);
    }
  }, [currentPage]);

  const handleReset = useCallback(() => {
    setCurrentPage(-1);
    setIsTeaching(false);
  }, []);

  const handleGenerateCourse = useCallback(() => {
    setIsGenerating(true);
    if (generateTimeoutRef.current) {
      window.clearTimeout(generateTimeoutRef.current);
    }

    generateTimeoutRef.current = window.setTimeout(() => {
      navigate("/learn?course=0", { replace: true });
      generateTimeoutRef.current = null;
    }, 3000);
  }, [navigate]);

  const showingContent = currentPage >= 0;

  // Full-screen generating state
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-border border-t-accent animate-spin" />
          <Sparkles
            size={16}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent"
          />
        </div>
        <div className="text-center space-y-2 animate-fade-in">
          <p className="font-serif text-lg text-foreground">Crafting your course</p>
          <p className="text-sm text-muted-foreground font-sans-ui">
            Building a personalized learning journey…
          </p>
        </div>
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent/40"
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MetisNavbar
        onMenuClick={() => setDrawerOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
      <MetisDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        courses={demoCourses.map((c, i) => ({
          ...c,
          progress: currentPage >= i ? (currentPage === i ? 0.5 : 1) : 0,
        }))}
        activeCourseId={currentPage >= 0 ? currentPage : undefined}
        onSelectCourse={(id) => {
          setDrawerOpen(false);
          setCurrentPage(id);
          setIsTeaching(true);
          setFadeKey((k) => k + 1);
        }}
        onNavigate={(label) => {
          setDrawerOpen(false);
          if (label === "Library") navigate("/library");
          else if (label === "About Metis") navigate("/about");
          else if (label === "Courses") navigate("/courses");
          else if (label === "Welcome") navigate("/welcome");
          else if (label === "Course Outline") navigate("/course-outline");
        }}
      />

      {!showingContent ? (
        isProfiling ? (
          <div className="flex-1 flex items-center justify-center px-4 pb-24">
            <div className="text-center max-w-md animate-fade-in">
              <h1 className="font-serif text-4xl font-light tracking-tight mb-3">
                New Course
              </h1>
              <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                Tell me what you'd like to learn.<br />
                I'll build a course just for you.
              </p>
            </div>
          </div>
        ) : (
          <WelcomeState />
        )
      ) : (
        <TeachingArea
          key={fadeKey}
          content={responses[currentPage]}
          isTeaching={isTeaching}
          onFinished={handleTeachingFinished}
          phaseLabel={isProfiling ? "Profiling" : "Teaching"}
        />
      )}

      {/* Generate Course button — profiling mode only */}
      {isProfiling && profilingDone && showingContent && !isTeaching && (
        <div className="fixed bottom-28 left-0 right-0 z-40 flex justify-center animate-fade-in">
          <button
            onClick={handleGenerateCourse}
            className="group flex items-center gap-2.5 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-sans-ui text-sm font-medium hover:opacity-90 transition-all hover:shadow-md"
          >
            <Sparkles size={15} className="group-hover:rotate-12 transition-transform" />
            Generate Course
          </button>
        </div>
      )}

      {/* Navigation buttons — learn mode only */}
      {!isProfiling && showingContent && !isTeaching && (
        <div className="fixed bottom-28 left-0 right-0 z-40 flex justify-center gap-3 animate-fade-in">
          <button
            onClick={goBack}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-sans-ui text-muted-foreground disabled:opacity-20 hover:text-foreground transition-colors"
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <span className="text-xs text-muted-foreground font-sans-ui self-center">
            {currentPage + 1} / {responses.length}
          </span>
          <button
            onClick={goNext}
            disabled={currentPage === responses.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-sans-ui text-muted-foreground disabled:opacity-20 hover:text-foreground transition-colors"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <MetisInput
        onSubmit={handleSubmit}
        disabled={isTeaching || (isProfiling && profilingDone)}
        visible={!(isProfiling && profilingDone)}
      />
    </div>
  );
};

export default Index;
