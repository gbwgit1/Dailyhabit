
import React, { useState, useMemo, useRef } from 'react';
import { format, parseISO, differenceInCalendarDays, startOfToday, isToday } from 'date-fns';
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
    setTimeout(() => setIsAnimating(false), 300);
  };

  const dayStatus = useMemo(() => {
    const today = startOfToday();
    const target = parseISO(todo.date);
    const diff = differenceInCalendarDays(target, today);
    
    if (diff === 0) return { label: '今天截止', color: 'text-amber-500 bg-amber-50' };
    if (diff > 0) return { label: `${diff} 天后`, color: 'text-sky-500 bg-sky-50' };
    return { label: `逾期 ${Math.abs(diff)} 天`, color: 'text-rose-500 bg-rose-50' };
  }, [todo.date]);

  return (
    <div 
      onClick={onEdit}
      className={`group relative p-4 rounded-3xl transition-all duration-300 border cursor-pointer
        ${isAnimating ? 'scale-[0.98]' : 'active:scale-[0.99]'}
        ${todo.isCompleted 
          ? 'border-indigo-50 bg-slate-50 opacity-80' 
          : 'border-white bg-white shadow-md shadow-slate-200/50'}
      `}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all duration-500
          ${todo.isCompleted ? 'bg-indigo-50 text-indigo-300' : 'bg-amber-500 text-white shadow-lg shadow-amber-100'}
        `}>
          <i className="fa-solid fa-calendar-check text-base"></i>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-black truncate text-sm transition-all duration-300 ${todo.isCompleted ? 'text-slate-300 line-through' : 'text-slate-800'}`}>
              {todo.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${todo.isCompleted ? 'text-slate-400 bg-slate-100' : dayStatus.color}`}>
              {todo.isCompleted ? '已达成' : dayStatus.label}
            </span>
          </div>
        </div>

        <button 
          onClick={handleToggle}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0
            ${todo.isCompleted 
              ? 'bg-indigo-600 text-white' 
              : 'bg-white border border-slate-100 text-slate-300 hover:text-indigo-400'}`}
        >
          <i className={`fa-solid ${todo.isCompleted ? 'fa-check' : 'fa-check'} text-base`}></i>
        </button>
      </div>
    </div>
  );
};

export default TodoCard;
