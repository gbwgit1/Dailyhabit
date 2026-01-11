
export enum Category {
  HEALTH = 'Health',
  WORK = 'Work',
  LEARNING = 'Learning',
  MIND = 'Mind',
  OTHER = 'Other',
  FINANCE = 'Finance',
  SOCIAL = 'Social',
  CREATIVE = 'Creative',
  HOME = 'Home',
  READING = 'Reading'
}

export type FrequencyType = 'daily' | 'weekly_days' | 'weekly_count';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  categories: Category[];
  color: string;
  icon: string;
  completedDays: string[]; // ISO Date strings "YYYY-MM-DD"
  frequency: FrequencyType;
  frequencyConfig: {
    days?: number[]; // 0-6 for weekly_days (0 is Sunday)
    count?: number; // for weekly_count
  };
  createdAt: number;
}

export interface Todo {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  isCompleted: boolean;
  createdAt: number;
}

export interface Milestone {
  id: string;
  name: string;
  icon: string;
  minXP: number;
  description: string;
}

export interface UserProfile {
  username: string;
  avatar: string;
  points: number;
  unlockedBadges: string[];
}

export interface DailyNote {
  date: string; // "YYYY-MM-DD"
  text: string;
}

export interface FriendRequest {
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: number;
}
