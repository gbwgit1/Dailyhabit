
import React, { useState, useMemo } from 'react';
import { format, parseISO, differenceInCalendarDays, startOfToday } from 'date-fns';
import { Todo } from '../types';

interface TodoCardProps {
  todo: Todo;
  onToggle: () => void;
  onEdit: () => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onToggle, onEdit }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 400);
  };

  const dayStatus = useMemo(() => {
    const today = startOfToday();
    const target = parseISO(todo.date);
    const diff = differenceInCalendarDays(target, today);
    
    if (diff === 0) return { label: '今天', color: 'text-amber-500 bg-amber-50' };
    if (diff > 0) return { label: `还有 ${diff} 天`, color: 'text-indigo-500 bg-indigo-50' };
    return { label: `已逾期 ${Math.abs(diff)} 天`, color: 'text-rose-500 bg-rose-50' };
  }, [todo.date]);

  return (
    <div 
      onClick={onEdit}
      className={`group relative p-4 rounded-[1.6rem] transition-all duration-500 border-[1.5px] cursor-pointer
        ${isAnimating ? 'scale-[0.98]' : 'active:scale-[0.99]'}
        ${todo.isCompleted 
          ? 'border-indigo-50 bg-slate-50/60 shadow-none' 
          : 'border-white bg-white shadow-md hover:shadow-lg shadow-slate-200/50'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all duration-500
          ${todo.isCompleted ? 'bg-white text-slate-300 border border-slate-100' : 'bg-amber-500 text-white shadow-lg shadow-amber-100'}
        `}>
          <i className="fa-solid fa-calendar-check text-base"></i>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-black truncate text-sm transition-all duration-300 ${todo.isCompleted ? 'text-slate-300 line-through opacity-70' : 'text-slate-800'}`}>
              {todo.title}
            </h3>
            {todo.isCompleted && (
              <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md">已完成</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">特定目标</p>
            {!todo.isCompleted && (
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${dayStatus.color}`}>
                {dayStatus.label}
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={handleToggle}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 flex-shrink-0 shadow-sm
            ${todo.isCompleted 
              ? 'bg-emerald-50 text-emerald-500' 
              : 'bg-white border border-slate-100 text-slate-300 hover:border-indigo-200 hover:text-indigo-400'}`}
        >
          <i className={`fa-solid ${todo.isCompleted ? 'fa-circle-check' : 'fa-check'} text-base ${isAnimating && !todo.isCompleted ? 'animate-bounce' : ''}`}></i>
        </button>
      </div>
    </div>
  );
};

export default TodoCard;
