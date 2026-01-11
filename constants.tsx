
import React from 'react';
import { Category } from './types';

export const CATEGORY_STYLES: Record<Category, { color: string, bg: string, icon: string }> = {
  [Category.HEALTH]: { color: 'text-rose-500', bg: 'bg-rose-50', icon: 'fa-heart-pulse' },
  [Category.WORK]: { color: 'text-blue-500', bg: 'bg-blue-50', icon: 'fa-briefcase' },
  [Category.LEARNING]: { color: 'text-amber-500', bg: 'bg-amber-50', icon: 'fa-book-open' },
  [Category.MIND]: { color: 'text-indigo-500', bg: 'bg-indigo-50', icon: 'fa-spa' },
  [Category.OTHER]: { color: 'text-emerald-500', bg: 'bg-emerald-50', icon: 'fa-star' }
};

export const COLORS = [
  '#f43f5e', // rose-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#6366f1', // indigo-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];
