
import React, { useState, useMemo } from 'react';
import { Habit, Todo } from '../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths, 
  isWithinInterval,
  isBefore,
  parseISO,
  getDay
} from 'date-fns';

interface CalendarViewProps {
  habits: Habit[];
  todos: Todo[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onEditTodo?: (todo: Todo) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ habits, todos, selectedDate, setSelectedDate, onEditTodo }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [isRangeMode, setIsRangeMode] = useState(false);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handleDateClick = (day: Date) => {
    if (!isRangeMode) {
      setSelectedDate(format(day, 'yyyy-MM-dd'));
      setRangeStart(null);
      setRangeEnd(null);
      return;
    }

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(day);
      setRangeEnd(null);
    } else {
      if (isBefore(day, rangeStart)) {
        setRangeEnd(rangeStart);
        setRangeStart(day);
      } else {
        setRangeEnd(day);
      }
    }
  };

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);

    const applicableHabits = habits.filter(h => {
      if (h.frequency === 'daily') return true;
      if (h.frequency === 'weekly_days') return h.frequencyConfig.days?.includes(dayOfWeek);
      return h.completedDays.includes(dateStr);
    });

    const completedHabits = applicableHabits.filter(h => h.completedDays.includes(dateStr));
    const dayTodos = todos.filter(t => t.date === dateStr);
    const completedTodos = dayTodos.filter(t => t.isCompleted);

    return {
      habits: applicableHabits,
      completedHabits,
      todos: dayTodos,
      completedTodos
    };
  };

  const rangeStats = useMemo(() => {
    if (!rangeStart || !rangeEnd) return null;
    const interval = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
    
    let totalPossible = 0;
    let totalDone = 0;

    interval.forEach(day => {
      const stats = getDayStatus(day);
      totalPossible += stats.habits.length + stats.todos.length;
      totalDone += stats.completedHabits.length + stats.completedTodos.length;
    });

    if (totalPossible === 0) return 0;
    return Math.round((totalDone / totalPossible) * 100);
  }, [rangeStart, rangeEnd, habits, todos]);

  const selectedDayData = useMemo(() => {
    return getDayStatus(parseISO(selectedDate));
  }, [habits, todos, selectedDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="glass p-6 rounded-[2.5rem] shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">自律轨迹大本营</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
              <i className="fa-solid fa-chevron-left text-slate-400 text-xs"></i>
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
              <i className="fa-solid fa-chevron-right text-slate-400 text-xs"></i>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 p-1.5 bg-slate-50 rounded-2xl w-fit">
          <button 
            onClick={() => { setIsRangeMode(false); setRangeStart(null); setRangeEnd(null); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isRangeMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            日历模式
          </button>
          <button 
            onClick={() => setIsRangeMode(true)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRangeMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            统计区间
          </button>
        </div>

        <div className="grid grid-cols-7 mb-4 px-1">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, idx) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isSelected = !isRangeMode && isSameDay(day, parseISO(selectedDate));
            const isRangeS = rangeStart && isSameDay(day, rangeStart);
            const isRangeE = rangeEnd && isSameDay(day, rangeEnd);
            const inRange = rangeStart && rangeEnd && isWithinInterval(day, { start: rangeStart, end: rangeEnd });
            const isCurrentMonth = format(day, 'MM') === format(currentMonth, 'MM');
            
            const stats = getDayStatus(day);

            return (
              <button
                key={idx}
                onClick={() => handleDateClick(day)}
                className={`relative aspect-square flex flex-col items-center justify-center text-sm font-bold transition-all z-10
                  ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                  ${isSelected ? 'text-white' : 'text-slate-600'}
                  ${(isRangeS || isRangeE) ? 'text-white' : ''}
                `}
              >
                {/* Background Highlights */}
                {isSelected && <div className="absolute inset-1.5 bg-indigo-600 rounded-2xl -z-10 shadow-lg shadow-indigo-100 animate-in zoom-in duration-300" />}
                {isRangeS && <div className="absolute inset-y-1.5 left-1.5 right-0 bg-indigo-600 rounded-l-xl -z-10 shadow-lg shadow-indigo-100" />}
                {isRangeE && <div className="absolute inset-y-1.5 right-1.5 left-0 bg-indigo-600 rounded-r-xl -z-10 shadow-lg shadow-indigo-100" />}
                {inRange && !isRangeS && !isRangeE && <div className="absolute inset-y-1.5 left-0 right-0 bg-indigo-50 -z-10" />}

                <span className="relative z-20 text-[13px]">{format(day, 'd')}</span>
                
                <div className="flex gap-0.5 mt-1 min-h-[4px]">
                  {stats.habits.slice(0, 3).map(h => {
                    const done = h.completedDays.includes(dateStr);
                    return (
                      <div 
                        key={h.id}
                        className={`w-1 h-1 rounded-full transition-all duration-500 ${done ? '' : 'bg-slate-200'}`}
                        style={done ? { backgroundColor: h.color } : {}}
                      />
                    );
                  })}
                  {stats.habits.length > 3 && (
                    <div className="text-[6px] font-black text-slate-300 leading-none">+</div>
                  )}
                  {stats.todos.length > 0 && (
                    <div className={`w-1 h-1 rotate-45 ${stats.completedTodos.length === stats.todos.length ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  )}
                </div>

                {isToday(day) && !isSelected && !isRangeS && !isRangeE && (
                  <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-rose-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isRangeMode && rangeStart && rangeEnd ? (
        <div className="glass p-6 rounded-[2.5rem] border-0 shadow-sm animate-in slide-in-from-bottom-2">
           <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">区间统计报告</h4>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {format(rangeStart, 'MM/dd')} - {format(rangeEnd, 'MM/dd')}
              </span>
           </div>
           <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={213} strokeDashoffset={213 - (213 * (rangeStats || 0)) / 100} className="text-indigo-600 transition-all duration-1000" />
                 </svg>
                 <span className="absolute text-sm font-black text-slate-800">{rangeStats}%</span>
              </div>
              <div className="flex-1 space-y-2">
                 <p className="text-xs font-bold text-slate-700">综合完成率</p>
                 <p className="text-[10px] text-slate-400 leading-relaxed">
                   包含习惯打卡与特定待办。在 {eachDayOfInterval({start: rangeStart, end: rangeEnd}).length} 天中，你的综合表现为 {rangeStats}%。
                 </p>
              </div>
           </div>
        </div>
      ) : (
        <div className="glass p-6 rounded-[2.5rem] border-0 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
               {format(parseISO(selectedDate), 'MMM do')} 任务快报
             </h4>
             <div className="flex gap-2">
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <i className="fa-solid fa-check"></i>
                  {selectedDayData.completedHabits.length + selectedDayData.completedTodos.length}
                </span>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <i className="fa-solid fa-clock"></i>
                  {selectedDayData.habits.length + selectedDayData.todos.length - (selectedDayData.completedHabits.length + selectedDayData.completedTodos.length)}
                </span>
             </div>
           </div>
           
           <div className="space-y-6">
             {selectedDayData.todos.length > 0 && (
               <div className="space-y-2">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">特定待办</p>
                 {selectedDayData.todos.map(t => (
                   <div key={t.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                     <div className="flex items-center gap-3">
                       <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${t.isCompleted ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300'}`}>
                         <i className="fa-solid fa-calendar-check text-sm"></i>
                       </div>
                       <span className={`text-sm font-bold ${t.isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{t.title}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        {onEditTodo && (
                          <button 
                            onClick={() => onEditTodo(t)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                          >
                            <i className="fa-solid fa-pen text-[10px]"></i>
                          </button>
                        )}
                        {t.isCompleted && <i className="fa-solid fa-check text-indigo-500 text-xs"></i>}
                     </div>
                   </div>
                 ))}
               </div>
             )}

             <div className="space-y-2">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-1">日常习惯</p>
               {selectedDayData.habits.map(h => {
                 const done = h.completedDays.includes(selectedDate);
                 return (
                   <div key={h.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                     <div className="flex items-center gap-3">
                       <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all duration-500 ${done ? 'text-white' : 'bg-white text-slate-300'}`} style={done ? {backgroundColor: h.color} : {}}>
                         <i className={`fa-solid ${h.icon} text-sm`}></i>
                       </div>
                       <span className={`text-sm font-bold ${done ? 'text-slate-800' : 'text-slate-400'}`}>{h.title}</span>
                     </div>
                     {done && <i className="fa-solid fa-check text-indigo-500 text-xs"></i>}
                   </div>
                 );
               })}
               {selectedDayData.habits.length === 0 && selectedDayData.todos.length === 0 && (
                 <div className="text-center py-12 flex flex-col items-center gap-2">
                   <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                     <i className="fa-solid fa-ghost"></i>
                   </div>
                   <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">今日暂无安排</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
