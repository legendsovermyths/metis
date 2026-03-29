import { X, User, Settings, BarChart3, BookOpen, HelpCircle, GraduationCap } from "lucide-react";

interface Course {
  id: number;
  title: string;
  progress: number; // 0-1
}

interface MetisDrawerProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (label: string) => void;
  onSelectCourse?: (courseId: number) => void;
  activeItem?: string;
  courses?: Course[];
  activeCourseId?: number;
}

const navItems = [
  { icon: GraduationCap, label: "Courses" },
  { icon: User, label: "Welcome" },
  { icon: BookOpen, label: "Course Outline" },
  { icon: BarChart3, label: "Progress" },
  { icon: BookOpen, label: "Library" },
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "About Metis" },
];

const MetisDrawer = ({ open, onClose, onNavigate, onSelectCourse, activeItem, courses = [], activeCourseId }: MetisDrawerProps) => {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-foreground/10 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="fixed top-0 left-0 bottom-0 z-50 w-64 bg-drawer border-r border-border animate-slide-in-left flex flex-col">
        <div className="flex items-center justify-between h-11 px-4 border-b border-border/50">
          <span className="font-serif text-sm font-medium text-muted-foreground">Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Courses section */}
        {courses.length > 0 && (
          <div className="px-3 pt-4 pb-2">
            <span className="px-3 text-[11px] font-sans-ui uppercase tracking-wider text-muted-foreground/60">
              Courses
            </span>
            <div className="mt-2 space-y-0.5">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => onSelectCourse?.(course.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-sans transition-colors ${
                    activeCourseId === course.id
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <GraduationCap size={15} strokeWidth={1.5} />
                  <div className="flex-1 text-left">
                    <span className="block text-sm leading-tight">{course.title}</span>
                    <div className="mt-1.5 h-[2px] w-full rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${Math.round(course.progress * 100)}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={courses.length > 0 ? "border-t border-border/50" : ""}>
          <nav className="p-3 space-y-0.5">
            {navItems.map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => onNavigate?.(label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-sans text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${
                  activeItem === label ? "text-foreground bg-secondary" : ""
                }`}
              >
                <Icon size={16} strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default MetisDrawer;
