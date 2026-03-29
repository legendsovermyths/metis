import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MetisNavbar from "@/components/MetisNavbar";
import MetisDrawer from "@/components/MetisDrawer";

const About = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

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
        onNavigate={(label) => {
          setDrawerOpen(false);
          if (label === "Library") navigate("/library");
          else if (label === "About Metis") return;
          else navigate("/");
        }}
        activeItem="About Metis"
      />

      <div className="flex-1 pt-20 px-6 sm:px-12 md:px-20 pb-20 animate-fade-in">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-8">
            About Metis
          </h1>

          <div className="space-y-6 text-sm font-sans leading-relaxed text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Metis</span> is a teaching companion 
              that explains complex ideas with clarity and depth. Named after the Greek Titan of 
              wisdom and deep thought, Metis transforms dense material into focused, 
              beautifully typeset lessons.
            </p>

            <p>
              Instead of chat threads that sprawl and lose context, Metis presents each 
              explanation as a single, immersive page — like turning through the best pages 
              of a textbook written just for you.
            </p>

            <p>
              Mathematics is rendered natively with full LaTeX support. Concepts are introduced 
              deliberately, building intuition before formalism. Every lesson is designed to 
              respect your attention.
            </p>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground/70">
                Built with care for those who want to understand, not just memorize.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
