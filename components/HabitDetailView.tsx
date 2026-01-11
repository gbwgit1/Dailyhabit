
import React, { useMemo } from 'react';
import { Habit } from '../types';
import { format, subDays, eachDayOfInterval, isSameDay, differenceInDays, parseISO } from 'date-fns';

interface HabitDetailViewProps {
  habit: Habit;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const HabitDetailView: React.FC<HabitDetailViewProps> = ({ habit, onBack, onEdit, onDelete }) => {
  const sortedDates = useMemo(() => 
    [...habit.completedDays].sort((a, b) => b.localeCompare(a)),
  [habit.completedDays]);

  const streak = useMemo(() => {
    let count = 0;
    let current = new Date();
    // Check if completed today or yesterday
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    if (!habit.completedDays.includes(todayStr) && !habit.completedDays.includes(yesterdayStr)) {
      return 0;
    }

    let checkDate = habit.completedDays.includes(todayStr) ? new Date() : subDays(new Date(), 1);
    while (habit.completedDays.includes(format(checkDate, 'yyyy-MM-dd'))) {
      count++;
      checkDate = subDays(checkDate, 1);
    }
    return count;
  }, [habit.completedDays]);

  const completionRate = useMemo(() => {
    const totalDays = Math.max(1, differenceInDays(new Date(), new Date(habit.createdAt)) + 1);
    return Math.round((habit.completedDays.length / totalDays) * 100);
  }, [habit.completedDays, habit.createdAt]);

  const recentActivity = useMemo(() => {
    const end = new Date();
    const start = subDays(end, 27); // Last 28 days (4 weeks)
    return eachDayOfInterval({ start, end });
  }, []);

  return (
    <div className="animate-in slide-in-from-right-4 duration-500 pb-20">
      {/* Dynamic Header */}
      <div className="relative pt-[calc(30px+var(--safe-area-top))] pb-12 px-6 rounded-b-[3.5rem] overflow-hidden" style={{ backgroundColor: habit.color }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-10%] right-[-10%] w-64 h-64 rounded-full bg-white blur-3xl"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 rounded-full bg-black blur-3xl"></div>
        </div>
        
        <div className="relative flex items-center justify-between mb-8">
          <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center active:scale-90 transition-transform">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <div className="flex gap-2">
            <button onClick={onEdit} className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center active:scale-90 transition-transform">
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
            <button onClick={onDelete} className="w-10 h-10 rounded-2xl bg-rose-500/20 backdrop-blur-md text-white flex items-center justify-center active:scale-90 transition-transform">
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>

        <div className="relative flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-white text-4xl mb-4 shadow-lg">
             <i className={`fa-solid ${habit.icon}`}></i>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">{habit.title}</h2>
          <div className="flex gap-2 mt-2">
            {habit.categories.map(cat => (
              <span key={cat} className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8 space-y-6">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
            <i className="fa-solid fa-fire text-orange-500 text-lg mb-2"></i>
            <span className="text-lg font-black text-slate-800 leading-none">{streak}</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">当前连胜</span>
          </div>
          <div className="glass p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
            <i className="fa-solid fa-bullseye text-indigo-500 text-lg mb-2"></i>
            <span className="text-lg font-black text-slate-800 leading-none">{completionRate}%</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">打卡率</span>
          </div>
          <div className="glass p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
            <i className="fa-solid fa-medal text-amber-500 text-lg mb-2"></i>
            <span className="text-lg font-black text-slate-800 leading-none">{habit.completedDays.length}</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">总计达标</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="glass p-5 rounded-[2.5rem] shadow-sm">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">最近 28 天动态</h3>
           <div className="grid grid-cols-7 gap-1.5">
             {recentActivity.map((day, i) => {
               const isDone = habit.completedDays.includes(format(day, 'yyyy-MM-dd'));
               return (
                 <div 
                   key={i} 
                   className={`aspect-square rounded-md transition-all duration-700 ${isDone ? 'scale-100 shadow-sm' : 'bg-slate-50 scale-90'}`}
                   style={isDone ? { backgroundColor: habit.color } : {}}
                   title={format(day, 'MMM d, yyyy')}
                 />
               );
             })}
           </div>
           <div className="flex justify-between mt-3 px-1">
             <span className="text-[8px] font-bold text-slate-300">28天前</span>
             <span className="text-[8px] font-bold text-slate-300">今天</span>
           </div>
        </div>

        {/* History Log */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">历史记录</h3>
          <div className="space-y-2">
            {sortedDates.map(dateStr => (
              <div key={dateStr} className="glass py-3 px-5 rounded-2xl flex items-center justify-between group hover:bg-white transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
                  {/* Fixed parseISO usage by importing it from date-fns */}
                  <span className="text-xs font-bold text-slate-700">{format(parseISO(dateStr), 'yyyy年 MM月 dd日')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-emerald-500 uppercase">+10 XP</span>
                  <i className="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
                </div>
              </div>
            ))}
            {sortedDates.length === 0 && (
              <div className="text-center py-10 opacity-30 italic text-xs text-slate-400">
                开启你的第一次打卡吧
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitDetailView;