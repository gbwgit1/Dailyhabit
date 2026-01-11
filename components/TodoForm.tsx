
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  format, 
  parseISO, 
  isValid, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek,
  isToday,
  isBefore,
  startOfToday
} from 'date-fns';
import { Todo } from '../types';

interface TodoFormProps {
  initialDate: string;
  editingTodo?: Todo | null;
  onClose: () => void;
  onSubmit: (title: string, date: string) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ initialDate, editingTodo, onClose, onSubmit }) => {
  const [title, setTitle] = useState(editingTodo?.title || '');
  const [date, setDate] = useState(editingTodo?.date || initialDate);
  const [viewMonth, setViewMonth] = useState(parseISO(date));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim(), date);
  };

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth));
    const end = endOfWeek(endOfMonth(viewMonth));
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl animate-in zoom-in duration-300 border border-white/20 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              {editingTodo ? '编辑待办' : '发布新待办'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                 {editingTodo ? '调整你的任务细节' : '设置你的特定目标'}
               </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 active:scale-90 transition-all border border-slate-100"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">任务内容</label>
                <span className={`text-[9px] font-bold ${title.length > 30 ? 'text-rose-400' : 'text-slate-300'}`}>{title.length}/40</span>
            </div>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                maxLength={40}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="想要完成什么？"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all text-slate-800 font-semibold shadow-inner"
              />
            </div>
          </div>

          {/* Inline Date Selection */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">计划完成日期</label>
            
            <div className="bg-slate-50 rounded-[2rem] p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-xs font-black text-slate-700">{format(viewMonth, 'yyyy年 MM月')}</span>
                <div className="flex gap-1">
                  <button 
                    type="button"
                    onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                  >
                    <i className="fa-solid fa-chevron-left text-[10px] text-slate-400"></i>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                  >
                    <i className="fa-solid fa-chevron-right text-[10px] text-slate-400"></i>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {weekDays.map(d => (
                  <div key={d} className="text-center text-[9px] font-black text-slate-300">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isSelected = date === dateStr;
                  const isCurrentMonth = format(day, 'MM') === format(viewMonth, 'MM');
                  const isPast = isBefore(day, startOfToday());

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isPast && !isSelected}
                      onClick={() => setDate(dateStr)}
                      className={`relative aspect-square rounded-xl flex items-center justify-center text-[11px] font-bold transition-all
                        ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-110 z-10' : 'hover:bg-white text-slate-600'}
                        ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                        ${isPast && !isSelected ? 'text-slate-200 cursor-not-allowed' : ''}
                      `}
                    >
                      {isToday(day) && !isSelected && (
                        <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-rose-500" />
                      )}
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-2 text-[10px] font-bold text-indigo-500">
              <i className="fa-solid fa-clock-rotate-left"></i>
              <span>已选: {format(parseISO(date), 'yyyy-MM-dd')}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className={`w-full py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-[0.2em] transition-all relative overflow-hidden group shadow-2xl active:scale-95 ${title.trim() ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}`}
            >
              {title.trim() && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                  <i className={`fa-solid ${editingTodo ? 'fa-save' : 'fa-paper-plane'} text-xs`}></i>
                  {editingTodo ? '保存修改' : '确认发布'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoForm;
