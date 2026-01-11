
import React, { useState, useMemo } from 'react';
import { Habit } from '../types';
import { CATEGORY_STYLES } from '../constants';
import { parseISO, isPast, isToday, subDays, format, startOfWeek, endOfWeek } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  selectedDate: string;
  onToggle: () => void;
  onEdit: () => void;
}

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

const HabitCard: React.FC<HabitCardProps> = ({ habit, selectedDate, onToggle, onEdit }) => {
  const isCompleted = habit.completedDays.includes(selectedDate);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRewardFeedback, setShowRewardFeedback] = useState(false);
  const dateObj = parseISO(selectedDate);
  
  // Status logic
  const isMissed = !isCompleted && isPast(dateObj) && !isToday(dateObj);
  const isTodayUncompleted = !isCompleted && isToday(dateObj);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isCompleted) {
      setShowRewardFeedback(false);
      setTimeout(() => setShowRewardFeedback(true), 10);
      setTimeout(() => setShowRewardFeedback(false), 1200);
    }
    
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 400);
  };

  // Streak calculation
  const streakCount = useMemo(() => {
    let count = 0;
    let checkDate = dateObj;
    if (!isCompleted) {
        checkDate = subDays(checkDate, 1);
    }
    while (habit.completedDays.includes(format(checkDate, 'yyyy-MM-dd'))) {
      count++;
      checkDate = subDays(checkDate, 1);
    }
    return count;
  }, [habit.completedDays, selectedDate, isCompleted]);

  // Weekly progress calculation for 'weekly_count' habits
  const weeklyProgress = useMemo(() => {
    if (habit.frequency !== 'weekly_count') return null;
    const start = startOfWeek(dateObj);
    const end = endOfWeek(dateObj);
    const completedThisWeek = habit.completedDays.filter(d => {
      const dObj = parseISO(d);
      return dObj >= start && dObj <= end;
    }).length;
    const target = habit.frequencyConfig.count || 1;
    return {
      current: completedThisWeek,
      target,
      percent: Math.min(100, (completedThisWeek / target) * 100)
    };
  }, [habit, dateObj]);

  const frequencyUI = useMemo(() => {
    let label = '';
    let icon = 'fa-clock';
    
    if (habit.frequency === 'daily') {
      label = '每天';
      icon = 'fa-rotate-right';
    } else if (habit.frequency === 'weekly_days') {
      label = habit.frequencyConfig.days?.map(d => WEEK_DAYS[d]).join('·') || '';
      icon = 'fa-calendar-days';
    } else if (habit.frequency === 'weekly_count') {
      label = `${habit.frequencyConfig.count}次/周`;
      icon = 'fa-bullseye';
    }

    return (
      <div className={`flex items-center gap-1 text-[8px] font-bold tracking-tight transition-colors duration-500 ${isCompleted ? 'text-slate-200' : isMissed ? 'text-rose-300' : 'text-slate-400'}`}>
        <i className={`fa-solid ${icon} opacity-60`}></i>
        <span>{label}</span>
      </div>
    );
  }, [habit, isCompleted, isMissed]);

  return (
    <div className={`group relative p-4 rounded-[1.6rem] transition-all duration-500 border-[1.5px] 
      ${isAnimating ? 'scale-[0.98]' : 'active:scale-[0.99]'}
      ${isCompleted ? 'border-emerald-50 bg-slate-50/60 shadow-none' : isMissed ? 'border-rose-100 bg-white shadow-sm ring-1 ring-rose-50' : isTodayUncompleted ? 'border-slate-100 bg-white shadow-md' : 'border-white bg-white shadow-sm'}
    `}
    style={isTodayUncompleted ? { borderColor: habit.color + '30' } : {}}
    >
      <div className="flex items-center gap-3">
        <div 
          onClick={onEdit}
          className={`relative w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-all duration-500 flex-shrink-0 cursor-pointer
          ${isAnimating ? 'rotate-[12deg] scale-105' : 'hover:scale-110'}
          ${isCompleted ? 'bg-white text-slate-300 border border-slate-100' : isMissed ? 'bg-rose-50 text-rose-400' : 'text-white'}`}
          style={(!isCompleted && !isMissed) ? { backgroundColor: habit.color } : {}}
        >
          <i className={`fa-solid ${habit.icon}`}></i>
          {isCompleted && (
            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] shadow-sm border-2 border-white">
              <i className="fa-solid fa-check"></i>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
          <div className="flex items-center gap-2">
            <h3 className={`font-bold truncate text-sm transition-all duration-300 ${isCompleted ? 'text-slate-300 line-through opacity-70' : isMissed ? 'text-rose-900/80' : 'text-slate-800'}`}>
              {habit.title}
            </h3>
            
            {streakCount >= 2 && (
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-black transition-all duration-500 shadow-sm
                ${isCompleted 
                  ? 'bg-slate-100 text-slate-400' 
                  : 'bg-orange-50 text-orange-600 border border-orange-100 animate-pulse-gentle'}`}
              >
                <i className="fa-solid fa-fire-flame-curved"></i>
                <span>{streakCount}</span>
              </div>
            )}

            {isMissed && (
               <span className="text-[8px] font-black uppercase text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">未达标</span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <div className="flex flex-wrap gap-1.5">
              {habit.categories.map(cat => {
                const catStyle = CATEGORY_STYLES[cat];
                return (
                  <span key={cat} className={`text-[8px] font-black uppercase tracking-tighter px-1.5 rounded transition-colors duration-500 ${isCompleted ? 'bg-slate-100 text-slate-300' : isMissed ? 'bg-rose-50 text-rose-400' : `${catStyle.bg} ${catStyle.color}`}`}>
                    {cat}
                  </span>
                );
              })}
            </div>
            {frequencyUI}
          </div>

          {/* Weekly Progress Bar for count habits */}
          {weeklyProgress && (
            <div className="mt-2 w-full max-w-[120px]">
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-slate-200' : ''}`}
                  style={{ 
                    width: `${weeklyProgress.percent}%`,
                    backgroundColor: (!isCompleted && !isMissed) ? habit.color : undefined
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="relative">
            {showRewardFeedback && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-none z-[100] animate-reward-float">
                <div className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap">
                   +10 XP
                </div>
              </div>
            )}
            
            <button 
              onClick={handleToggle}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 shadow-sm
                ${isAnimating ? 'scale-110' : ''}
                ${isCompleted ? 'bg-emerald-50 text-emerald-500' : isMissed ? 'bg-white border border-rose-100 text-rose-400 hover:bg-rose-50' : 'bg-white border border-slate-100 text-slate-300 hover:border-slate-200'}`}
              style={(!isCompleted && !isMissed) ? { color: habit.color, borderColor: habit.color + '40' } : {}}
            >
              <i className={`fa-solid ${isCompleted ? 'fa-circle-check' : 'fa-check'} text-base ${isAnimating && !isCompleted ? 'animate-bounce' : ''}`}></i>
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes rewardFloat {
          0% { transform: translate(-50%, 15px); opacity: 0; scale: 0.5; }
          20% { opacity: 1; scale: 1.2; }
          100% { transform: translate(-50%, -45px); opacity: 0; scale: 0.8; }
        }
        @keyframes pulseGentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-reward-float {
          animation: rewardFloat 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-pulse-gentle {
          animation: pulseGentle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HabitCard;
