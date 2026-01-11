
export enum Category {
  HEALTH = 'Health',
  WORK = 'Work',
  LEARNING = 'Learning',
  MIND = 'Mind',
  OTHER = 'Other'
}

export type FrequencyType = 'daily' | 'weekly_days' | 'weekly_count';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: Category;
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

export interface UserProfile {
  username: string;
  avatar: string;
  friends: string[]; // List of usernames
  lastProgress?: number; // Cache for social view
}

export interface FriendRequest {
  from: string;
  to: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'declined';
}

export interface DailyNote {
  date: string; // "YYYY-MM-DD"
  text: string;
}
