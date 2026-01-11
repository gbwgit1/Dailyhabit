
import React, { useState } from 'react';
import { Habit } from '../types';
import { CATEGORY_STYLES } from '../constants';
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, isPast, isToday } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  selectedDate: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

const HabitCard: React.FC<HabitCardProps> = ({ habit, selectedDate, onToggle, onEdit, onDelete }) => {
  const isCompleted = habit.completedDays.includes(selectedDate);
  const [isAnimating, setIsAnimating] = useState(false);
  const dateObj = parseISO(selectedDate);
  const styles = CATEGORY_STYLES[habit.category];

  const isMissed = !isCompleted && isPast(dateObj) && !isToday(dateObj);
  const isTodayUncompleted = !isCompleted && isToday(dateObj);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 400);
  };

  const weeklyProgress = React.useMemo(() => {
    if (habit.frequency !== 'weekly_count') return null;
    const start = startOfWeek(dateObj, { weekStartsOn: 1 });
    const end = endOfWeek(dateObj, { weekStartsOn: 1 });
    const count = habit.completedDays.filter(d => {
      const dayDate = parseISO(d);
      return isWithinInterval(dayDate, { start, end });
    }).length;
    return { 
      count, 
      target: habit.frequencyConfig.count || 0,
      percent: Math.min(100, (count / (habit.frequencyConfig.count || 1)) * 100)
    };
  }, [habit.completedDays, habit.frequency, dateObj]);

  const frequencyLabel = React.useMemo(() => {
    if (habit.frequency === 'daily') return '每天';
    if (habit.frequency === 'weekly_days') {
      return habit.frequencyConfig.days?.map(d => WEEK_DAYS[d]).join('·');
    }
    if (habit.frequency === 'weekly_count') {
      return `每周 ${habit.frequencyConfig.count} 次`;
    }
    return '';
  }, [habit]);

  return (
    <div className={`group relative p-3 rounded-[1.4rem] transition-all duration-300 border-[1.5px] 
      ${isAnimating ? 'scale-[0.97]' : 'active:scale-[0.98]'}
      ${isCompleted 
        ? 'border-transparent bg-slate-100/50 opacity-60' 
        : isMissed 
          ? 'border-rose-100 bg-white shadow-sm' 
          : isTodayUncompleted
            ? 'border-indigo-50 bg-white shadow-md'
            : 'border-white bg-white shadow-sm'}
    `}>
      <div className="flex items-center gap-3">
        {/* Icon Container with Animation */}
        <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all duration-500 flex-shrink-0
          ${isAnimating ? 'rotate-[12deg] scale-110' : ''}
          ${isCompleted ? 'bg-slate-200 text-slate-500' : 
            isMissed ? 'bg-rose-50 text-rose-400' : `${styles.bg} ${styles.color}`}`}>
          <i className={`fa-solid ${habit.icon}`}></i>
          {isCompleted && (
            <div className={`absolute -top-1 -right-1 bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] shadow-sm border-2 border-white transition-transform duration-300 ${isAnimating ? 'scale-125' : 'scale-100'}`}>
              <i className="fa-solid fa-check"></i>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold truncate text-sm transition-all duration-300 ${isCompleted ? 'text-slate-400 line-through' : isMissed ? 'text-rose-900/80' : 'text-slate-800'}`}>
              {habit.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[8px] font-black uppercase tracking-tighter px-1 rounded ${isCompleted ? 'bg-slate-100 text-slate-400' : isMissed ? 'bg-rose-50 text-rose-400' : `${styles.bg} ${styles.color}`}`}>
              {habit.category}
            </span>
            <span className={`text-[8px] font-bold ${isMissed ? 'text-rose-300' : 'text-slate-400'}`}>
               {frequencyLabel}
            </span>
          </div>
          
          {weeklyProgress && (
            <div className="mt-2 space-y-1">
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    isCompleted ? 'bg-slate-300' : 'bg-indigo-400'
                  }`}
                  style={{ width: `${weeklyProgress.percent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
           <button 
            onClick={handleToggle}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 shadow-sm
              ${isAnimating ? 'scale-110' : ''}
              ${isCompleted 
                ? 'bg-emerald-500 text-white ring-4 ring-emerald-50' 
                : isMissed 
                  ? 'bg-white border border-rose-100 text-rose-400' 
                  : 'bg-white border border-slate-50 text-slate-200 hover:text-indigo-500'}`}
          >
            <i className={`fa-solid ${isCompleted ? 'fa-check-double' : 'fa-check'} text-base ${isAnimating ? 'animate-bounce' : ''}`}></i>
          </button>
          
          <div className="hidden sm:flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="text-slate-300 hover:text-indigo-500 p-1"><i className="fa-solid fa-pen-to-square text-[10px]"></i></button>
            <button onClick={onDelete} className="text-slate-200 hover:text-rose-400 p-1"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
