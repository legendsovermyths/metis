import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Compass, Activity, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/library", label: "Library", icon: BookOpen },
  { path: "/journeys", label: "Journeys", icon: Compass },
  { path: "/tasks", label: "Tasks", icon: Activity },
];

export function AppNav() {
  const location = useLocation();
  const { theme, toggle } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/80 backdrop-blur-xl md:relative md:bottom-auto md:border-t-0 md:border-b md:border-border/30 md:bg-transparent md:backdrop-blur-none">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 md:px-8">
        {/* Logo - desktop only */}
        <Link to="/" className="hidden items-center gap-2 md:flex">
          <span className="font-display text-xl italic text-foreground">Metis</span>
        </Link>

        {/* Nav items */}
        <div className="flex w-full items-center justify-around md:w-auto md:gap-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={cn(
                  "relative flex items-center justify-center transition-colors duration-200",
                  /* Mobile: taller tap target, vertical centering */
                  "flex-col py-3 px-5",
                  /* Desktop: icon-only pill */
                  "md:flex-row md:rounded-lg md:px-3 md:py-2",
                  isActive
                    ? "text-foreground md:bg-surface"
                    : "text-text-tertiary hover:text-foreground"
                )}
              >
                <item.icon
                  className="h-5 w-5 md:h-4 md:w-4"
                  strokeWidth={isActive ? 2 : 1.5}
                />

                {/* Mobile — filled pill behind active icon */}
                {isActive && (
                  <span className="absolute inset-x-2 inset-y-1.5 rounded-full bg-surface md:hidden" style={{ zIndex: -1 }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="hidden items-center justify-center rounded-lg p-2 text-muted-foreground/60 transition-colors hover:text-foreground md:flex"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </nav>
  );
}
