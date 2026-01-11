
import React, { useMemo } from 'react';
import { Habit, Category } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';

interface StatsViewProps {
  habits: Habit[];
}

const StatsView: React.FC<StatsViewProps> = ({ habits }) => {
  const last7Days = useMemo(() => {
    const today = new Date();
    const range = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return range.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = habits.filter(h => h.completedDays && h.completedDays.includes(dateStr)).length;
      return {
        name: format(date, 'EEE'),
        count,
      };
    });
  }, [habits]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    habits.forEach(h => {
      if (h.completedDays && h.completedDays.length > 0) {
        // Since habits can have multiple categories, we count completion for each category it belongs to
        h.categories.forEach(cat => {
          data[cat] = (data[cat] || 0) + h.completedDays.length;
        });
      }
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [habits]);

  const STATS_COLORS = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6'];

  const totalCompletions = useMemo(() => 
    habits.reduce((acc, h) => acc + (h.completedDays?.length || 0), 0)
  , [habits]);

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-6 rounded-[2rem] border-0 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">累计打卡</p>
          <p className="text-3xl font-black text-slate-800">{totalCompletions}</p>
        </div>
        <div className="glass p-6 rounded-[2rem] border-0 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">活跃计划</p>
          <p className="text-3xl font-black text-slate-800">{habits.length}</p>
        </div>
      </div>

      <div className="glass p-6 rounded-[2rem] border-0 shadow-sm overflow-hidden">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
           <i className="fa-solid fa-chart-line text-indigo-500"></i>
           近 7 日趋势
        </h3>
        <div className="h-48 w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
              <Tooltip 
                cursor={{ fill: '#f1f5f9', radius: 4 }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[4, 4, 4, 4]} barSize={24}>
                {last7Days.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 6 ? '#4f46e5' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass p-6 rounded-[2rem] border-0 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
           <i className="fa-solid fa-chart-pie text-rose-500"></i>
           分类分布
        </h3>
        <div className="h-56 w-full flex items-center justify-center min-h-[220px]">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATS_COLORS[index % STATS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex flex-col items-center gap-3 py-10">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl opacity-20">
                 <i className="fa-solid fa-chart-simple"></i>
               </div>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">暂无统计数据</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsView;
