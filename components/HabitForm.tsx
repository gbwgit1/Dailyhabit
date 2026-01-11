
import React, { useState, useEffect } from 'react';
import { Habit, Category, FrequencyType } from '../types';
import { CATEGORY_STYLES, COLORS as PRESET_COLORS } from '../constants';

interface HabitFormProps {
  onClose: () => void;
  onSubmit: (habit: any) => void;
  initialData?: Habit | null;
}

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

const HabitForm: React.FC<HabitFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [categories, setCategories] = useState<Category[]>(initialData?.categories || [Category.HEALTH]);
  const [color, setColor] = useState(initialData?.color || PRESET_COLORS[0]);
  const [frequency, setFrequency] = useState<FrequencyType>(initialData?.frequency || 'daily');
  const [selectedDays, setSelectedDays] = useState<number[]>(initialData?.frequencyConfig?.days || [1, 2, 3, 4, 5]);
  const [weeklyCount, setWeeklyCount] = useState(initialData?.frequencyConfig?.count || 3);

  // Automatically determine the icon based on the first selected category
  const icon = categories.length > 0 ? CATEGORY_STYLES[categories[0]].icon : 'fa-star';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || categories.length === 0) return;
    
    const frequencyConfig = frequency === 'weekly_days' 
      ? { days: selectedDays } 
      : frequency === 'weekly_count' 
        ? { count: weeklyCount } 
        : {};

    onSubmit({ 
      title, 
      categories, 
      icon, 
      color, 
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

  const toggleCategory = (cat: Category) => {
    setCategories(prev => {
      // If adding, make it the primary (first) category
      if (!prev.includes(cat)) {
        return [cat, ...prev];
      }
      // If removing, don't allow 0 categories
      if (prev.length === 1) return prev;
      return prev.filter(c => c !== cat);
    });
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">计划名称</label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：每天喝 8 杯水..."
                className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all text-slate-800 font-medium shadow-inner"
              />
            </div>

            <div className="flex items-end gap-6">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">主题配色</label>
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-300 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center">
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">预览</label>
                 <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg text-white transition-all duration-500" style={{ backgroundColor: color }}>
                    <i className={`fa-solid ${icon} text-lg`}></i>
                 </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">所属分类 (首选决定图标)</label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {Object.values(Category).map(cat => {
                  const isSelected = categories.includes(cat);
                  const isPrimary = categories[0] === cat;
                  const style = CATEGORY_STYLES[cat];
                  const displayName = {
                    [Category.HEALTH]: '健康',
                    [Category.WORK]: '工作',
                    [Category.LEARNING]: '学习',
                    [Category.MIND]: '正念',
                    [Category.OTHER]: '其他',
                    [Category.FINANCE]: '财务',
                    [Category.SOCIAL]: '社交',
                    [Category.CREATIVE]: '创意',
                    [Category.HOME]: '居家',
                    [Category.READING]: '阅读'
                  }[cat];
                  
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all border-2 flex items-center justify-between
                        ${isSelected 
                          ? `${style.bg} ${style.color} border-current` 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                    >
                      <div className="flex items-center gap-2">
                        <i className={`fa-solid ${style.icon} text-[10px]`}></i>
                        {displayName}
                      </div>
                      {isPrimary && <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                    </button>
                  );
                })}
              </div>
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

            <button
              type="submit"
              disabled={!title.trim() || categories.length === 0}
              className={`w-full font-bold py-5 rounded-[1.5rem] shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 text-white
                ${(!title.trim() || categories.length === 0) 
                  ? 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed' 
                  : 'shadow-lg'}`}
              style={(!title.trim() || categories.length === 0) ? {} : { backgroundColor: color }}
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
