import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Calendar,
  Upload,
  Settings,
} from 'lucide-react';

export type Page =
  | 'dashboard'
  | 'bills'
  | 'analytics'
  | 'calendar'
  | 'upload'
  | 'settings';

export interface NavItem {
  id: Page;
  label: string;
  icon: LucideIcon;
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'bills', label: 'Bills', icon: Receipt, path: '/bills' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
  { id: 'upload', label: 'Upload Bill', icon: Upload, path: '/upload' },
];

export const SETTINGS_NAV: NavItem[] = [
  { id: 'settings', label: 'Profile', icon: Settings, path: '/settings' },
];

export const BRAND_NAME = 'Pyat Paing';
export const TAGLINE = 'AI-powered bill organizer for Myanmar households.';
