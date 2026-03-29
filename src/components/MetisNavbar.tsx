import { Menu, Moon, Sun } from "lucide-react";

interface MetisNavbarProps {
  onMenuClick: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const MetisNavbar = ({ onMenuClick, isDark, onToggleTheme }: MetisNavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-navbar backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between h-11 px-4">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} strokeWidth={1.5} />
        </button>

        <span className="font-serif text-base font-medium tracking-wide text-foreground select-none">
          Metis
        </span>

        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
        </button>
      </div>
    </nav>
  );
};

export default MetisNavbar;
