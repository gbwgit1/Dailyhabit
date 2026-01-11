
import React, { useState, useEffect } from 'react';
import { Habit, Category, FrequencyType } from '../types';
import { CATEGORY_STYLES, COLORS } from '../constants';

interface HabitFormProps {
  onClose: () => void;
  onSubmit: (habit: any) => void;
  initialData?: Habit | null;
}

const ICONS = [
  'fa-heart-pulse', 'fa-spa', 'fa-book-open', 'fa-briefcase', 'fa-star', 
  'fa-dumbbell', 'fa-bicycle', 'fa-music', 'fa-code', 'fa-mug-hot',
  'fa-apple-whole', 'fa-bed', 'fa-camera', 'fa-palette', 'fa-pen-nib',
  'fa-leaf', 'fa-water', 'fa-brain', 'fa-comments', 'fa-wallet'
];

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

const HabitForm: React.FC<HabitFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<Category>(initialData?.category || Category.HEALTH);
  const [icon, setIcon] = useState(initialData?.icon || ICONS[0]);
  const [frequency, setFrequency] = useState<FrequencyType>(initialData?.frequency || 'daily');
  const [selectedDays, setSelectedDays] = useState<number[]>(initialData?.frequencyConfig?.days || [1, 2, 3, 4, 5]);
  const [weeklyCount, setWeeklyCount] = useState(initialData?.frequencyConfig?.count || 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const frequencyConfig = frequency === 'weekly_days' 
      ? { days: selectedDays } 
      : frequency === 'weekly_count' 
        ? { count: weeklyCount } 
        : {};

    onSubmit({ 
      title, 
      category, 
      icon, 
      color: initialData?.color || COLORS[0], 
      frequency, 
      frequencyConfig 
    });
  };

  const toggleDay = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex]
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {initialData ? '编辑计划' : '定制新计划'}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                {initialData ? '随时调整目标，适应生活变化' : '好的开始是成功的一半'}
              </p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">计划名称</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：每天喝 8 杯水..."
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">执行频率</label>
              <div className="flex p-1 bg-slate-50 rounded-2xl mb-4">
                {(['daily', 'weekly_days', 'weekly_count'] as FrequencyType[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${frequency === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-500'}`}
                  >
                    {f === 'daily' ? '每天' : f === 'weekly_days' ? '周期' : '次数'}
                  </button>
                ))}
              </div>

              {frequency === 'weekly_days' && (
                <div className="flex justify-between gap-1 animate-in fade-in slide-in-from-top-2">
                  {WEEK_DAYS.map((day, idx) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`w-10 h-10 rounded-xl text-[11px] font-bold transition-all border-2 ${selectedDays.includes(idx) ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-300'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}

              {frequency === 'weekly_count' && (
                <div className="px-2 animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="range" min="1" max="7" 
                    value={weeklyCount} 
                    onChange={(e) => setWeeklyCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                    <span>1次</span>
                    <span className="text-indigo-600 text-sm">每周执行 {weeklyCount} 次</span>
                    <span>7次</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">所属分类</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-medium outline-none border-2 border-transparent focus:border-indigo-500"
                >
                  {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">个性图标</label>
                <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${icon === i ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      <i className={`fa-solid ${i} text-sm`}></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {initialData ? '保存修改' : '立即开启'}
            </button>
          </form>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default HabitForm;
