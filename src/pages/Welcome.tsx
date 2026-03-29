import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => setNameVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const userName = "Alex";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Greeting */}
      <div
        className="text-center max-w-lg transition-all duration-1000 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-xs font-sans-ui tracking-wide mb-8">
          <Sparkles size={12} />
          Welcome to Metis
        </div>

        <h1
          className="font-serif text-5xl sm:text-6xl font-light tracking-tight text-foreground mb-6 transition-all duration-700 ease-out"
          style={{
            opacity: nameVisible ? 1 : 0,
            transform: nameVisible ? "translateY(0)" : "translateY(8px)",
          }}
        >
          Hi, {userName}
        </h1>

        <p className="text-muted-foreground font-sans text-base sm:text-lg leading-relaxed mb-3">
          We're glad you're here. Metis will guide you through
          your learning — one clear idea at a time.
        </p>

        <p className="text-muted-foreground/50 font-sans text-sm leading-relaxed mb-14 max-w-sm mx-auto">
          We'll start by understanding how you learn best,
          then build a path that's made just for you.
        </p>

        <button
          onClick={() => navigate("/learn")}
          className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-foreground text-background font-sans-ui text-sm tracking-wide hover:opacity-90 transition-opacity"
        >
          Get started
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {/* Subtle bottom detail */}
      <div
        className="absolute bottom-8 transition-all duration-1000 delay-500 ease-out"
        style={{
          opacity: visible ? 1 : 0,
        }}
      >
        <p className="text-[11px] text-muted-foreground/30 font-sans-ui tracking-widest uppercase">
          Your journey begins here
        </p>
      </div>
    </div>
  );
};

export default Welcome;
