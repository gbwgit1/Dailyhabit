
import React from 'react';
import { Category } from './types';

export const CATEGORY_STYLES: Record<Category, { color: string, bg: string, icon: string }> = {
  [Category.HEALTH]: { color: 'text-rose-500', bg: 'bg-rose-50', icon: 'fa-heart-pulse' },
  [Category.WORK]: { color: 'text-blue-500', bg: 'bg-blue-50', icon: 'fa-briefcase' },
  [Category.LEARNING]: { color: 'text-amber-500', bg: 'bg-amber-50', icon: 'fa-book-open' },
  [Category.MIND]: { color: 'text-indigo-500', bg: 'bg-indigo-50', icon: 'fa-spa' },
  [Category.OTHER]: { color: 'text-slate-500', bg: 'bg-slate-50', icon: 'fa-star' },
  [Category.FINANCE]: { color: 'text-emerald-500', bg: 'bg-emerald-50', icon: 'fa-wallet' },
  [Category.SOCIAL]: { color: 'text-cyan-500', bg: 'bg-cyan-50', icon: 'fa-user-group' },
  [Category.CREATIVE]: { color: 'text-fuchsia-500', bg: 'bg-fuchsia-50', icon: 'fa-palette' },
  [Category.HOME]: { color: 'text-orange-500', bg: 'bg-orange-50', icon: 'fa-house-circle-check' },
  [Category.READING]: { color: 'text-teal-500', bg: 'bg-teal-50', icon: 'fa-book' }
};

export const COLORS = [
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#0d9488', // Teal (New)
  '#d946ef', // Fuchsia (New)
  '#84cc16', // Lime (New)
  '#06b6d4', // Cyan (New)
];
