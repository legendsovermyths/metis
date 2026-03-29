import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle2, Plus } from "lucide-react";

interface CourseData {
  id: number;
  title: string;
  description: string;
  progress: number;
  totalPages: number;
  currentPage: number;
}

const demoCourses: CourseData[] = [
  {
    id: 0,
    title: "The Quadratic Formula",
    description:
      "Explore the derivation, geometric meaning, and applications of the quadratic formula in solving second-degree equations.",
    progress: 0.5,
    totalPages: 2,
    currentPage: 1,
  },
  {
    id: 1,
    title: "Euler's Identity",
    description:
      "Discover the deep connection between exponential functions, complex numbers, and trigonometry through Euler's celebrated formula.",
    progress: 0,
    totalPages: 2,
    currentPage: 0,
  },
];

const Courses = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center gap-3 h-12 px-5">
          <button
            onClick={() => navigate("/")}
            className="p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <h1 className="font-serif text-base font-medium text-foreground">
            Your Courses
          </h1>
        </div>
      </header>

      {/* Course list */}
      <main className="max-w-2xl mx-auto px-5 py-8 space-y-4">
        {/* New course button */}
        <button
          onClick={() => navigate("/profiling")}
          className="w-full group"
        >
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-5 flex items-center justify-center gap-2.5 transition-all hover:border-accent/40 hover:bg-card">
            <Plus size={16} strokeWidth={1.5} className="text-muted-foreground group-hover:text-accent transition-colors" />
            <span className="text-sm font-sans-ui text-muted-foreground group-hover:text-foreground transition-colors">
              New Course
            </span>
          </div>
        </button>

        {demoCourses.map((course) => {
          const progressPct = Math.round(course.progress * 100);
          const isComplete = progressPct === 100;
          const isStarted = progressPct > 0;

          return (
            <button
              key={course.id}
              onClick={() => navigate(`/learn?course=${course.id}`)}
              className="w-full text-left group"
            >
              <div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-accent/40 hover:shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {isComplete ? (
                        <CheckCircle2
                          size={15}
                          strokeWidth={1.5}
                          className="text-accent shrink-0"
                        />
                      ) : (
                        <BookOpen
                          size={15}
                          strokeWidth={1.5}
                          className="text-muted-foreground shrink-0"
                        />
                      )}
                      <h2 className="font-serif text-[15px] font-medium text-foreground leading-tight truncate">
                        {course.title}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 pl-[23px]">
                      {course.description}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`shrink-0 mt-0.5 text-[11px] font-sans-ui tracking-wide px-2.5 py-1 rounded-full ${
                      isComplete
                        ? "bg-accent/15 text-accent"
                        : isStarted
                        ? "bg-secondary text-muted-foreground"
                        : "bg-secondary text-muted-foreground/60"
                    }`}
                  >
                    {isComplete
                      ? "Complete"
                      : isStarted
                      ? `${progressPct}%`
                      : "Not started"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4 ml-[23px]">
                  <div className="h-[3px] w-full rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground/60 font-sans-ui">
                    Page {course.currentPage} of {course.totalPages}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </main>
    </div>
  );
};

export default Courses;
