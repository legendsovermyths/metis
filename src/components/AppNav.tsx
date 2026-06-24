import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Compass, Lightbulb, Activity, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/library", label: "Library", icon: BookOpen },
  { path: "/journeys", label: "Journeys", icon: Compass },
  { path: "/explainer", label: "Explanations", icon: Lightbulb },
  { path: "/tasks", label: "Tasks", icon: Activity },
];

export function AppNav() {
  const location = useLocation();
  const { theme, toggle } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/80 backdrop-blur-xl md:relative md:bottom-auto md:border-t-0 md:border-b md:border-border/20 md:bg-background/60 md:backdrop-blur-xl">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 md:px-10">
        {/* Logo — desktop only */}
        <Link to="/" className="hidden items-center md:flex">
          <span className="display-hero text-2xl text-foreground">Metis</span>
        </Link>

        {/* Nav items */}
        <div className="flex w-full items-center justify-around md:w-auto md:gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={cn(
                  "relative flex flex-col items-center justify-center transition-colors duration-200",
                  "py-3 px-5",
                  "md:flex-row md:px-3.5 md:py-3 md:border-b-2",
                  isActive
                    ? "text-foreground md:border-amber"
                    : "text-text-tertiary hover:text-foreground/70 md:border-transparent"
                )}
              >
                <item.icon
                  className="h-5 w-5 md:h-[18px] md:w-[18px]"
                  strokeWidth={isActive ? 2 : 1.5}
                />

                {/* Mobile — amber dot below active icon */}
                {isActive ? (
                  <span className="mt-1 h-1 w-1 rounded-full bg-amber md:hidden" />
                ) : (
                  <span className="mt-1 h-1 w-1 md:hidden" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="hidden items-center justify-center rounded-lg p-2 text-text-tertiary transition-colors hover:text-foreground md:flex"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </nav>
  );
}
