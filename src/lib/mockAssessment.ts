export type Verdict = "correct" | "partial" | "incorrect";

export interface QuizQuestion {
  id: string;
  prompt: string;
  ideal_answer: string;
}

export interface Quiz {
  journey_id: number;
  arc_idx: number;
  arc_title: string;
  questions: QuizQuestion[];
}

export interface QuestionEvaluation {
  verdict: Verdict;
  feedback: string;
}

export interface QuizResult {
  score: number;
  total: number;
  answers: string[];
  evaluations: QuestionEvaluation[];
  taken_at: number;
}

export interface PracticeProblem {
  id: string;
  prompt: string;
  ideal_answer: string;
  hint_nudge: string;
  hint_approach: string;
}

export interface PracticeSet {
  journey_id: number;
  arc_idx: number;
  arc_title: string;
  problems: PracticeProblem[];
}

export interface ArcAssessmentMeta {
  arc_idx: number;
  arc_title: string;
  has_quiz: boolean;
  has_practice: boolean;
}

const MOCK_QUIZ: Quiz = {
  journey_id: 0,
  arc_idx: 0,
  arc_title: "Differentiation",
  questions: [
    {
      id: "q1",
      prompt:
        "Compute the derivative of $f(x) = x^2$ using the limit definition. Show enough work that I can see your reasoning.",
      ideal_answer:
        "$\\displaystyle f'(x) = \\lim_{\\Delta t \\to 0} \\frac{(x+\\Delta t)^2 - x^2}{\\Delta t} = \\lim_{\\Delta t \\to 0} (2x + \\Delta t) = 2x.$",
    },
    {
      id: "q2",
      prompt:
        "A car's position is $s(t) = 4t^2$ meters. What is its instantaneous velocity at $t = 3$ seconds?",
      ideal_answer: "$s'(t) = 8t$, so $s'(3) = 24$ m/s.",
    },
    {
      id: "q3",
      prompt:
        "In your own words: why do we need the *limit* in the definition of the derivative, rather than just setting $\\Delta t = 0$?",
      ideal_answer:
        "Setting $\\Delta t = 0$ gives $0/0$, which is undefined. The limit asks what value the ratio *approaches* as $\\Delta t$ gets arbitrarily small — a well-defined question even though the ratio at zero itself isn't.",
    },
    {
      id: "q4",
      prompt:
        "True or false: the derivative of a function at a point is the slope of the tangent line at that point. Justify briefly.",
      ideal_answer:
        "True. The derivative is the limit of secant slopes as the second point approaches the first — the limiting slope is, by construction, the tangent's slope.",
    },
    {
      id: "q5",
      prompt:
        "Compute the derivative of $f(x) = 3x^3 - 2x + 5$.",
      ideal_answer: "$f'(x) = 9x^2 - 2$.",
    },
    {
      id: "q6",
      prompt:
        "A ball's height is $h(t) = -5t^2 + 20t$ meters. At what time does it reach maximum height?",
      ideal_answer:
        "At the peak, velocity is zero. $h'(t) = -10t + 20 = 0$ gives $t = 2$ seconds.",
    },
    {
      id: "q7",
      prompt:
        "The function $f(x) = |x|$ has a derivative everywhere except one point. Which point, and why?",
      ideal_answer:
        "At $x = 0$. The left-hand slope is $-1$ and the right-hand slope is $+1$; the secant slopes don't converge to a single value, so no derivative exists there.",
    },
  ],
};

const MOCK_PRACTICE: PracticeSet = {
  journey_id: 0,
  arc_idx: 0,
  arc_title: "Differentiation",
  problems: [
    {
      id: "p1",
      prompt:
        "Let $f(x) = x^2$. Compute $\\frac{f(x + \\Delta t) - f(x)}{\\Delta t}$ and simplify. What does it approach as $\\Delta t \\to 0$?",
      ideal_answer:
        "$\\frac{(x+\\Delta t)^2 - x^2}{\\Delta t} = \\frac{2x\\Delta t + (\\Delta t)^2}{\\Delta t} = 2x + \\Delta t \\to 2x.$",
      hint_nudge: "Start by expanding $(x + \\Delta t)^2$.",
      hint_approach:
        "Expand the square, subtract $x^2$, factor $\\Delta t$ out of the numerator, cancel, then take the limit.",
    },
    {
      id: "p2",
      prompt:
        "Compute the derivative of the constant function $f(x) = 5$ using the limit definition. What do you notice?",
      ideal_answer:
        "Both $f(x + \\Delta t)$ and $f(x)$ are $5$, so the numerator is zero. The derivative is $0$ — a constant function doesn't change, so its rate of change is nothing.",
      hint_nudge: "What is $f(x + \\Delta t)$ when $f$ is constant?",
      hint_approach:
        "The numerator becomes $5 - 5 = 0$, so the ratio is $0$ for every $\\Delta t$. The limit is therefore $0$.",
    },
    {
      id: "p3",
      prompt: "Find the slope of the tangent line to $f(x) = x^2$ at $x = 3$.",
      ideal_answer: "We know $f'(x) = 2x$, so the slope at $x = 3$ is $6$.",
      hint_nudge: "You've already shown $f'(x) = 2x$ for this function.",
      hint_approach: "Plug $x = 3$ into the derivative formula $f'(x) = 2x$.",
    },
    {
      id: "p4",
      prompt:
        "A particle moves so that its position at time $t$ is $s(t) = t^3$. What is the instantaneous velocity at $t = 2$?",
      ideal_answer: "$s'(t) = 3t^2$, so $s'(2) = 12$.",
      hint_nudge: "Instantaneous velocity is the derivative of position.",
      hint_approach:
        "Differentiate $s(t) = t^3$ to get $s'(t) = 3t^2$, then evaluate at $t = 2$.",
    },
    {
      id: "p5",
      prompt:
        "Consider $f(x) = x^2 + 3$. How does the graph of $f$ differ from $g(x) = x^2$, and how do their derivatives compare?",
      ideal_answer:
        "The graph of $f$ is the graph of $g$ shifted up by $3$. The shapes are identical, so the slopes at corresponding points are identical: $f'(x) = g'(x) = 2x$. A vertical shift doesn't change the rate of change.",
      hint_nudge: "A vertical shift moves the graph up — does it change how steeply it rises?",
      hint_approach:
        "Compute both derivatives from the limit definition. The constant $+3$ cancels in the numerator, so both give $2x$.",
    },
  ],
};

const CANNED_QUIZ_FEEDBACK: Record<Verdict, string[]> = {
  correct: [
    "Exactly right. You laid out the reasoning cleanly — that's the move.",
    "Yes — and I like that you justified it rather than just stating the answer. That's the habit.",
    "Perfect. This is the kind of answer I'd put on a board as an exemplar.",
    "Correct, and your intuition about *why* is exactly right.",
  ],
  partial: [
    "The mechanics are right, but the reasoning is a bit rushed. Say more about *why* the limit exists.",
    "You've got the right answer, but the step from the secant to the tangent needs one more sentence.",
    "Close. The numerical answer is correct, but the justification misses the subtlety about $\\Delta t$ not actually being zero.",
    "Right direction, but you skipped the factoring step that makes the cancellation clean.",
  ],
  incorrect: [
    "Not quite. The issue is conceptual: you're treating $\\Delta t = 0$ as something you can plug in, but that gives $0/0$. The limit is what rescues us.",
    "This isn't right — and I suspect you applied the power rule before we'd derived it. Try the limit definition here.",
    "The answer doesn't match. Go back and check your expansion of $(x + \\Delta t)^2$.",
    "Not there yet. Remember: the derivative of a *constant* is zero, not the constant itself.",
  ],
};

function pickFeedback(verdict: Verdict, idx: number): string {
  const pool = CANNED_QUIZ_FEEDBACK[verdict];
  return pool[idx % pool.length];
}

function mockDelay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function getArcAssessmentMeta(arcIdx: number, arcTitle: string): ArcAssessmentMeta {
  return {
    arc_idx: arcIdx,
    arc_title: arcTitle,
    has_quiz: arcIdx % 2 === 0,
    has_practice: true,
  };
}

export async function getQuiz(journeyId: number, arcIdx: number): Promise<Quiz> {
  await mockDelay(300);
  return { ...MOCK_QUIZ, journey_id: journeyId, arc_idx: arcIdx };
}

export async function submitQuiz(
  journeyId: number,
  arcIdx: number,
  answers: string[]
): Promise<QuizResult> {
  await mockDelay(1600);
  const evaluations: QuestionEvaluation[] = answers.map((a, i) => {
    const trimmed = a.trim();
    let verdict: Verdict;
    if (trimmed.length === 0) {
      verdict = "incorrect";
    } else if (trimmed.length < 12) {
      verdict = "partial";
    } else {
      const r = (i * 7 + trimmed.length) % 5;
      verdict = r >= 3 ? "correct" : r >= 1 ? "partial" : "incorrect";
    }
    return { verdict, feedback: pickFeedback(verdict, i) };
  });
  const score = evaluations.reduce(
    (s, e) => s + (e.verdict === "correct" ? 1 : e.verdict === "partial" ? 0.5 : 0),
    0
  );
  const result: QuizResult = {
    score,
    total: answers.length,
    answers,
    evaluations,
    taken_at: Date.now(),
  };
  saveQuizResult(journeyId, arcIdx, result);
  return result;
}

export async function getPractice(journeyId: number, arcIdx: number): Promise<PracticeSet> {
  await mockDelay(250);
  return { ...MOCK_PRACTICE, journey_id: journeyId, arc_idx: arcIdx };
}

export async function evaluatePractice(
  problemId: string,
  answer: string
): Promise<QuestionEvaluation> {
  await mockDelay(1100);
  const trimmed = answer.trim();
  let verdict: Verdict;
  if (trimmed.length === 0) verdict = "incorrect";
  else if (trimmed.length < 15) verdict = "partial";
  else {
    const seed = problemId.charCodeAt(problemId.length - 1) + trimmed.length;
    verdict = seed % 3 === 0 ? "partial" : "correct";
  }
  return {
    verdict,
    feedback: pickFeedback(verdict, problemId.length),
  };
}

function quizStorageKey(journeyId: number, arcIdx: number): string {
  return `metis:quiz:${journeyId}:${arcIdx}`;
}

export function saveQuizResult(journeyId: number, arcIdx: number, result: QuizResult): void {
  try {
    localStorage.setItem(quizStorageKey(journeyId, arcIdx), JSON.stringify(result));
  } catch {
    // ignore
  }
}

export function loadQuizResult(journeyId: number, arcIdx: number): QuizResult | null {
  try {
    const raw = localStorage.getItem(quizStorageKey(journeyId, arcIdx));
    if (!raw) return null;
    return JSON.parse(raw) as QuizResult;
  } catch {
    return null;
  }
}
