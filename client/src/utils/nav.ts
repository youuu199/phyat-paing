import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, BarChart3, User, Settings } from 'lucide-react';

export type Page = 'dashboard' | 'insights' | 'profile' | 'settings';

export interface NavItem {
  id: Page;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'insights',  label: 'Insights',  icon: BarChart3 },
  { id: 'profile',   label: 'Profile',   icon: User },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

export const BRAND_NAME = 'Phyat Paing (ဖြတ်ပိုင်း)';
export const TAGLINE = 'Upload bills — we extract the details.';
