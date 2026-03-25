declare module 'lucide-react' {
  import { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
    color?: string;
    strokeWidth?: string | number;
  }

  export type LucideIcon = ForwardRefExoticComponent<
    LucideProps & RefAttributes<SVGSVGElement>
  >;

  // Export specific icons as needed, or just allow any icon name
  export const Trash2: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Search: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
  export const Check: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Video: LucideIcon;
  export const LogOut: LucideIcon;
  export const User: LucideIcon;
  export const Settings: LucideIcon;
  export const Bell: LucideIcon;
  export const Mail: LucideIcon;
  export const Calendar: LucideIcon;
  export const Home: LucideIcon;
  export const Plus: LucideIcon;
  export const Minus: LucideIcon;
  export const Trash: LucideIcon;
  export const Edit: LucideIcon;
  export const Filter: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Copy: LucideIcon;
  export const Download: LucideIcon;
  export const Upload: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowUp: LucideIcon;
  export const ArrowDown: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Loader2: LucideIcon;
  export const Save: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const Play: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Wallet: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const ShoppingCart: LucideIcon;
  export const History: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Briefcase: LucideIcon;
  export const PlayCircle: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Phone: LucideIcon;
  export const School: LucideIcon;
  export const GraduationCap: LucideIcon;
  export const Award: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Building2: LucideIcon;
  export const CreditCard: LucideIcon;
  export const Edit3: LucideIcon;
  export const Image: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Zap: LucideIcon;
  
  export const Printer: LucideIcon;
  export const Trophy: LucideIcon;
  export const Share2: LucideIcon;
  export const icons: Record<string, LucideIcon>;
}
