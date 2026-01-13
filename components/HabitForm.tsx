
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
  const [enableReminder, setEnableReminder] = useState(!!initialData?.reminderTime);
  const [reminderTime, setReminderTime] = useState(initialData?.reminderTime || '09:00');

  const primaryCategory = categories[0];
  const icon = primaryCategory ? CATEGORY_STYLES[primaryCategory].icon : 'fa-star';

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
      frequencyConfig,
      reminderTime: enableReminder ? reminderTime : undefined
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
      const isSelected = prev.includes(cat);
      if (isSelected) {
        if (prev.length <= 1) return prev;
        return prev.filter(c => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  const setPrimaryCategory = (cat: Category) => {
    setCategories(prev => {
      const otherCats = prev.filter(c => c !== cat);
      return [cat, ...otherCats];
    });
  };

  const getCategoryName = (cat: Category) => ({
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
  }[cat]);

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
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 pb-4">
            {/* Title Section */}
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

            {/* Appearance Section */}
            <div className="flex items-center gap-6 p-1">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">主题配色</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-300 scale-110 shadow-sm' : 'hover:scale-105 opacity-80'}`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <i className="fa-solid fa-check text-[10px] text-white"></i>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center">
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">图标预览</label>
                 <div className="w-14 h-14 rounded-[1.4rem] flex items-center justify-center shadow-lg text-white transition-all duration-500 relative ring-4 ring-white" style={{ backgroundColor: color }}>
                    <i className={`fa-solid ${icon} text-2xl`}></i>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-lg px-1.5 py-0.5 shadow-sm border border-slate-100">
                      <i className="fa-solid fa-wand-magic-sparkles text-[8px] text-indigo-500"></i>
                    </div>
                 </div>
              </div>
            </div>

            {/* Freq Section */}
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">执行频率</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'daily', label: '每天', sub: '每日循环', icon: 'fa-rotate' },
                  { id: 'weekly_days', label: '周期', sub: '特定日期', icon: 'fa-calendar-days' },
                  { id: 'weekly_count', label: '次数', sub: '按周定量', icon: 'fa-chart-simple' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFrequency(item.id as FrequencyType)}
                    className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-300 ${frequency === item.id 
                      ? 'border-transparent text-white scale-105 shadow-lg' 
                      : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-white'}`}
                    style={frequency === item.id ? { backgroundColor: color, boxShadow: `${color}40 0 10px 15px -3px` } : {}}
                  >
                    <i className={`fa-solid ${item.icon} text-lg mb-1.5`}></i>
                    <span className="text-[11px] font-black">{item.label}</span>
                  </button>
                ))}
              </div>

              {frequency === 'weekly_days' && (
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex justify-between gap-1">
                    {WEEK_DAYS.map((day, idx) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`w-9 h-9 rounded-xl text-[11px] font-black transition-all border-2 flex items-center justify-center ${selectedDays.includes(idx) 
                          ? 'border-transparent text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-300'}`}
                        style={selectedDays.includes(idx) ? { backgroundColor: color } : {}}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {frequency === 'weekly_count' && (
                <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setWeeklyCount(prev => Math.max(1, prev - 1))} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 active:scale-90"><i className="fa-solid fa-minus"></i></button>
                    <div className="text-center">
                      <span className="text-2xl font-black text-slate-800" style={{ color }}>{weeklyCount}</span>
                      <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest">次/周</span>
                    </div>
                    <button type="button" onClick={() => setWeeklyCount(prev => Math.min(7, prev + 1))} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 active:scale-90"><i className="fa-solid fa-plus"></i></button>
                  </div>
                </div>
              )}
            </div>

            {/* Refined Category Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">已选分类</label>
                <span className="text-[9px] font-black text-indigo-400 uppercase flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
                  <i className="fa-solid fa-star"></i> 首位决定图标
                </span>
              </div>

              {/* Active Selection Zone */}
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 min-h-[70px]">
                {categories.map((cat, idx) => {
                  const style = CATEGORY_STYLES[cat];
                  const isPrimary = idx === 0;
                  return (
                    <div 
                      key={`active-${cat}`} 
                      onClick={() => !isPrimary && setPrimaryCategory(cat)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-[10px] font-black shadow-sm transition-all duration-300 cursor-pointer group
                        ${isPrimary ? `${style.bg} ${style.color} ring-2 ring-offset-2 ring-indigo-200 scale-105` : 'bg-white text-slate-400 hover:text-slate-600'}`}
                    >
                      {isPrimary && <i className="fa-solid fa-star text-[9px] text-amber-500 animate-pulse"></i>}
                      <i className={`fa-solid ${style.icon} text-[10px]`}></i>
                      {getCategoryName(cat)}
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); toggleCategory(cat); }}
                        className="ml-1 opacity-40 hover:opacity-100 hover:text-rose-500 p-1"
                      >
                        <i className="fa-solid fa-circle-xmark"></i>
                      </button>
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <div className="m-auto text-center py-2">
                    <p className="text-[10px] text-slate-300 font-bold italic">点击下方列表添加分类</p>
                  </div>
                )}
              </div>

              {/* Category Browser Grid */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block ml-1">全部分类</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar pb-2">
                  {Object.values(Category).map(cat => {
                    const isSelected = categories.includes(cat);
                    const style = CATEGORY_STYLES[cat];
                    
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`relative px-3 py-4 rounded-2xl text-[11px] font-bold transition-all border-2 flex items-center gap-3 group
                          ${isSelected 
                            ? 'border-indigo-400/30 bg-indigo-50/20 text-indigo-600' 
                            : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-50'}`}
                      >
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${isSelected ? style.bg : 'bg-slate-50 group-hover:bg-white'}`}>
                          <i className={`fa-solid ${style.icon} ${isSelected ? style.color : 'opacity-40'} text-xs`}></i>
                        </div>
                        <span className="truncate">{getCategoryName(cat)}</span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5">
                            <i className="fa-solid fa-circle-check text-indigo-500 text-[10px]"></i>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!title.trim() || categories.length === 0}
              className={`w-full font-bold py-5 rounded-[1.8rem] shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 text-white uppercase tracking-widest text-sm
                ${(!title.trim() || categories.length === 0) 
                  ? 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed border-0' 
                  : 'shadow-lg border-b-4 border-black/10'}`}
              style={(!title.trim() || categories.length === 0) ? {} : { backgroundColor: color }}
            >
              {initialData ? '保存修改' : '确认并开始之旅'}
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
