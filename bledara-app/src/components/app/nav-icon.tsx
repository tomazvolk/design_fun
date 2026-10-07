import {
  BoxesIcon,
  CalendarClockIcon,
  ChartColumnIcon,
  CreditCardIcon,
  InboxIcon,
  LayoutDashboardIcon,
  ReceiptIcon,
  ScrollTextIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react";
import type { NavItem } from "./nav";

const ICONS = {
  dashboard: LayoutDashboardIcon,
  subscriptions: BoxesIcon,
  cards: CreditCardIcon,
  requests: InboxIcon,
  renewals: CalendarClockIcon,
  transactions: ReceiptIcon,
  insights: ChartColumnIcon,
  people: UsersIcon,
  settings: Settings2Icon,
  audit: ScrollTextIcon,
} as const;

export function NavIcon({ name, className }: { name: NavItem["icon"]; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} aria-hidden="true" />;
}
