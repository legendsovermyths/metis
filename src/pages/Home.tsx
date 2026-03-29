import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Info } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal top bar */}
      <nav className="flex items-center justify-between px-6 py-5">
        <span className="font-serif text-sm tracking-wide text-foreground/60">
          metis
        </span>
        <button
          onClick={toggleTheme}
          className="text-xs font-sans-ui text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
        >
          {isDark ? "Light" : "Dark"}
        </button>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
        <div
          className="text-center transition-all duration-1000 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(12px)",
          }}
        >
          <h1 className="font-serif text-6xl sm:text-7xl font-light tracking-tight text-foreground mb-4">
            Metis
          </h1>
          <p className="text-muted-foreground font-sans text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-2">
            A calm space to learn, clearly and deeply.
          </p>
          <p className="text-muted-foreground/50 font-sans text-sm max-w-sm mx-auto mb-12">
            Ask a question. Metis will teach you — one idea at a time,
            with focus and patience.
          </p>

          <button
            onClick={() => navigate("/learn")}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-sans-ui text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Start learning
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>

        {/* Subtle nav links */}
        <div
          className="flex items-center gap-8 mt-20 transition-all duration-1000 delay-300 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-1.5 text-xs font-sans-ui text-muted-foreground/60 hover:text-muted-foreground transition-colors tracking-wide uppercase"
          >
            <BookOpen size={12} />
            Courses
          </button>
          <span className="w-px h-3 bg-border" />
          <button
            onClick={() => navigate("/library")}
            className="flex items-center gap-1.5 text-xs font-sans-ui text-muted-foreground/60 hover:text-muted-foreground transition-colors tracking-wide uppercase"
          >
            <BookOpen size={12} />
            Library
          </button>
          <span className="w-px h-3 bg-border" />
          <button
            onClick={() => navigate("/about")}
            className="flex items-center gap-1.5 text-xs font-sans-ui text-muted-foreground/60 hover:text-muted-foreground transition-colors tracking-wide uppercase"
          >
            <Info size={12} />
            About
          </button>
        </div>
      </main>

      {/* Footer whisper */}
      <footer className="pb-6 text-center">
        <p className="text-[11px] text-muted-foreground/30 font-sans-ui tracking-widest uppercase">
          Learn with intention
        </p>
      </footer>
    </div>
  );
};

export default Home;
