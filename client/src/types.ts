/**
 * Shared TypeScript interfaces for the Bill Organizer app.
 */

export interface Bill {
  _id: string;
  title: string;
  amount: number;
  category: string;
  imageUrl: string;
  cloudinaryPublicId?: string;
  rawText?: string;
  dueDate?: string;
  isRecurring?: boolean;
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly';
  isPaid?: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MonthEntry {
  year: number;
  month: number;
  label: string;
  count: number;
}

export interface BillStats {
  _id: string;
  total: number;
  count: number;
}

export interface TrendEntry {
  year: number;
  month: number;
  total: number;
  count: number;
}

export interface BudgetLimits {
  Electricity?: number;
  Water?: number;
  Internet?: number;
  Phone?: number;
  Shopping?: number;
  Other?: number;
}

export interface PaginatedBills {
  bills: Bill[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export interface User {
  email: string;
  createdAt: string;
}

export type Category = 'Electricity' | 'Water' | 'Internet' | 'Phone' | 'Shopping' | 'Other';

export const CATEGORIES: Category[] = ['Electricity', 'Water', 'Internet', 'Phone', 'Shopping', 'Other'];

export const CATEGORY_COLORS: Record<Category, string> = {
  Electricity: '#eab308',
  Water: '#0ea5e9',
  Internet: '#8b5cf6',
  Phone: '#10b981',
  Shopping: '#ec4899',
  Other: '#6b7280',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Electricity: '⚡',
  Water: '💧',
  Internet: '🌐',
  Phone: '📱',
  Shopping: '🛒',
  Other: '📌',
};

export const CATEGORY_LABELS: Record<Category, Record<'en' | 'my', string>> = {
  Electricity: { en: 'Electricity', my: 'လျှပ်စစ်' },
  Water:       { en: 'Water',       my: 'ရေ' },
  Internet:    { en: 'Internet',    my: 'အင်တာနက်' },
  Phone:       { en: 'Phone',       my: 'ဖုန်း' },
  Shopping:    { en: 'Shopping',    my: 'ဈေးဝယ်' },
  Other:       { en: 'Other',       my: 'အခြား' },
};
