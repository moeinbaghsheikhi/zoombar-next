import type { SVGProps } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  PlusCircle,
  BarChart3,
  Megaphone,
  Palette,
  CalendarClock,
  Image as LucideImage,
  LogIn,
  LogOut,
  UserPlus,
  ChevronDown,
  Eye,
  Zap, // Using Zap for ZoomBar logo idea
  Rocket,
  CheckCircle2,
  TrendingUp,
  Menu,
  Edit3,
  Trash2,
  Copy,
  PaintBucket,
  TextCursorInput,
  Link as LinkIcon,
  AlertTriangle,
  Info,
  Save,
  XCircle,
  Loader2,
  CheckSquare, // Added for "My Schedule"
  Briefcase,   // Added for "Manage Events"
  CalendarDays, // Added for "Calendar"
  Bell,        // Added for "Notification"
  FileText,    // Added for "Documents"
  HelpCircle,  // Added for "Help"
  Star         // Added for "Star Events" logo, as Zap might be too generic
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Icons = {
  Dashboard: LayoutDashboard,
  Users: Users,
  Settings: Settings,
  Create: PlusCircle,
  Statistics: BarChart3, // Also Reports
  Megaphone: Megaphone, // Original, Bell is more standard for notifications
  Palette: Palette,
  Calendar: CalendarDays, // Changed from CalendarClock
  Image: LucideImage,
  Login: LogIn,
  Logout: LogOut,
  Signup: UserPlus,
  ChevronDown: ChevronDown,
  View: Eye,
  Logo: Star, // Changed from Zap to Star for "Star Events"
  Zap: Zap,
  FeatureFast: Rocket,
  FeatureEasy: CheckCircle2,
  FeatureStats: TrendingUp,
  Menu: Menu,
  Edit: Edit3,
  Delete: Trash2,
  Copy: Copy, // Could be used for Documents if FileText is not preferred
  Color: PaintBucket,
  Text: TextCursorInput,
  Link: LinkIcon,
  Warning: AlertTriangle,
  Info: Info, // Could be used for Help if HelpCircle is not preferred
  Save: Save,
  Cancel: XCircle,
  Spinner: Loader2,
  MySchedule: CheckSquare,
  ManageEvents: Briefcase,
  People: Users,
  Reports: BarChart3,
  Notification: Bell,
  Documents: FileText,
  Help: HelpCircle,
};

export const ZoomBarLogo = ({ className, size = "md", showSubtitle = false }: { className?: string; size?: "sm" | "md" | "lg"; showSubtitle?: boolean }) => {
  const logoSize = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-8 w-8" : "h-7 w-7";
  const titleTextSize = size === "sm" ? "text-lg" : size === "lg" ? "text-xl" : "text-lg"; // Adjusted title size
  const subtitleTextSize = size === "sm" ? "text-xs" : size === "lg" ? "text-sm" : "text-xs"; // Adjusted subtitle size

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icons.Logo className={cn(logoSize, "text-primary")} />
      <div className="flex flex-col">
        <span className={cn(titleTextSize, "font-semibold tracking-tight text-sidebar-foreground")}> {/* Changed font-bold to font-semibold */}
          زوم‌بار لایت
        </span>
        {showSubtitle && (
            <span className={cn(subtitleTextSize, "text-sidebar-foreground/70 -mt-0.5")}> {/* Added subtitle */}
              مدیریت اعلانات
            </span>
        )}
      </div>
    </div>
  );
};
