
import React, { useState, useMemo, useRef } from 'react';
import { Habit } from '../types';
import { CATEGORY_STYLES } from '../constants';
import { parseISO, isPast, isToday, subDays, format, startOfWeek, endOfWeek } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  selectedDate: string;
  onToggle: () => void;
  onEdit: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, selectedDate, onToggle, onEdit }) => {
  const isCompleted = habit.completedDays.includes(selectedDate);
  const [isAnimating, setIsAnimating] = useState(false);
  const dateObj = parseISO(selectedDate);
  
  const isMissed = !isCompleted && isPast(dateObj) && !isToday(dateObj);
  const isTodayUncompleted = !isCompleted && isToday(dateObj);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const streakCount = useMemo(() => {
    let count = 0;
    let checkDate = dateObj;
    
    if (!habit.completedDays.includes(format(checkDate, 'yyyy-MM-dd'))) {
      checkDate = subDays(checkDate, 1);
    }

    while (habit.completedDays.includes(format(checkDate, 'yyyy-MM-dd'))) {
      count++;
      checkDate = subDays(checkDate, 1);
    }
    return count;
  }, [habit.completedDays, selectedDate, dateObj]);

  return (
    <div className={`group relative p-4 rounded-3xl transition-all duration-300 border
      ${isAnimating ? 'scale-[0.98]' : 'active:scale-[0.99]'}
      ${isCompleted ? 'border-indigo-50 bg-slate-50/50 opacity-80' : isMissed ? 'border-rose-100 bg-rose-50 shadow-sm' : isTodayUncompleted ? 'border-white bg-white shadow-xl shadow-indigo-100/10' : 'border-white bg-white shadow-sm'}
    `}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div 
          onClick={onEdit}
          className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-all duration-500 flex-shrink-0 cursor-pointer
          ${isCompleted ? 'bg-indigo-100 text-indigo-400' : isMissed ? 'bg-rose-100 text-rose-400' : 'text-white shadow-indigo-200'}`}
          style={(!isCompleted && !isMissed) ? { backgroundColor: habit.color } : {}}
        >
          <i className={`fa-solid ${habit.icon}`}></i>
        </div>
        
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className={`font-black truncate text-[15px] tracking-tight transition-all duration-300 ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                {habit.title}
              </h3>
              {streakCount >= 2 && !isCompleted && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[9px] font-black bg-orange-50 text-orange-600 animate-pulse shadow-sm shadow-orange-100">
                  <i className="fa-solid fa-fire-flame-curved"></i>
                  <span>{streakCount}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 mt-0.5">
            {habit.categories.slice(0, 1).map(cat => (
              <span key={cat} className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-400">
                {cat}
              </span>
            ))}
            <span className="text-[7px] font-black uppercase tracking-tighter opacity-40">
              {habit.frequency === 'daily' ? '每日' : '周期'}
            </span>
          </div>
        </div>

        <button 
          onClick={handleToggle}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0
            ${isCompleted ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300 hover:text-indigo-400 hover:bg-indigo-50 shadow-sm'}`}
        >
          <i className={`fa-solid ${isCompleted ? 'fa-check' : 'fa-check'} text-base`}></i>
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
