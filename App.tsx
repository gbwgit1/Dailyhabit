
import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO, isToday, isBefore, startOfToday, compareAsc, compareDesc, subDays, getDay } from 'date-fns';
import { Habit, Todo, UserProfile, Milestone } from './types';
import HabitCard from './components/HabitCard';
import TodoCard from './components/TodoCard';
import HabitForm from './components/HabitForm';
import HabitDetailView from './components/HabitDetailView';
import TodoForm from './components/TodoForm';
import StatsView from './components/StatsView';
import CalendarView from './components/CalendarView';
import ProfileView from './components/ProfileView';
import AvatarPicker from './components/AvatarPicker';

export const MILESTONES: Milestone[] = [
  { id: '1', name: '初心使者', icon: 'fa-seedling', minXP: 0, description: '迈出改变的第一步' },
  { id: '2', name: '习惯达人', icon: 'fa-leaf', minXP: 100, description: '开始感受到自律的力量' },
  { id: '3', name: '意志战神', icon: 'fa-mountain', minXP: 500, description: '习惯已成为你的本能' },
  { id: '4', name: '巅峰大师', icon: 'fa-crown', minXP: 1000, description: '掌控生活的绝对强者' }
];

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('zenhabits_habits');
    return saved ? JSON.parse(saved) : [];
  });
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('zenhabits_todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('zenhabits_profile');
    return saved ? JSON.parse(saved) : { username: '旅人', avatar: '👤', points: 0, unlockedBadges: [] };
  });

  const [activeTab, setActiveTab] = useState<'today' | 'stats' | 'calendar' | 'profile'>('today');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  
  const [isTodoFormOpen, setIsTodoFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [showCompletedTodos, setShowCompletedTodos] = useState(false);

  useEffect(() => {
    localStorage.setItem('zenhabits_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('zenhabits_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('zenhabits_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'today') {
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [activeTab]);

  const handleAddHabit = (habitData: any) => {
    if (editingHabit) {
      setHabits(prev => prev.map(h => h.id === editingHabit.id ? { ...h, ...habitData } : h));
      setEditingHabit(null);
    } else {
      const newHabit: Habit = {
        id: Date.now().toString(),
        ...habitData,
        completedDays: [],
        createdAt: Date.now()
      };
      setHabits(prev => [...prev, newHabit]);
    }
    setIsHabitFormOpen(false);
  };

  const handleToggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const completed = h.completedDays.includes(selectedDate);
        const newCompletedDays = completed 
          ? h.completedDays.filter(d => d !== selectedDate)
          : [...h.completedDays, selectedDate];
        
        if (!completed) setProfile(p => ({ ...p, points: p.points + 10 }));
        return { ...h, completedDays: newCompletedDays };
      }
      return h;
    }));
  };

  const handleTodoSubmit = (title: string, date: string) => {
    if (editingTodo) {
      setTodos(prev => prev.map(t => t.id === editingTodo.id ? { ...t, title, date } : t));
      setEditingTodo(null);
    } else {
      const newTodo: Todo = {
        id: Date.now().toString(),
        title,
        date,
        isCompleted: false,
        createdAt: Date.now()
      };
      setTodos(prev => [...prev, newTodo]);
    }
    setIsTodoFormOpen(false);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        if (!t.isCompleted) setProfile(p => ({ ...p, points: p.points + 10 }));
        return { ...t, isCompleted: !t.isCompleted };
      }
      return t;
    }));
  };

  const currentHabit = useMemo(() => habits.find(h => h.id === selectedHabitId), [habits, selectedHabitId]);
  
  const pendingTodos = useMemo(() => {
    return todos
      .filter(t => !t.isCompleted)
      .sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)));
  }, [todos]);

  const completedRecentTodos = useMemo(() => {
    const sevenDaysAgo = subDays(startOfToday(), 7);
    return todos
      .filter(t => {
        const todoDate = parseISO(t.date);
        return t.isCompleted && todoDate >= sevenDaysAgo;
      })
      .sort((a, b) => compareDesc(parseISO(a.date), parseISO(b.date)));
  }, [todos]);

  const dailyProgress = useMemo(() => {
    const dateStr = selectedDate;
    const dayOfWeek = getDay(parseISO(dateStr));
    
    const dailyActiveHabits = habits.filter(h => {
      if (h.frequency === 'daily') return true;
      if (h.frequency === 'weekly_days') return h.frequencyConfig.days?.includes(dayOfWeek);
      return h.completedDays.includes(dateStr);
    });

    const completedHabits = dailyActiveHabits.filter(h => h.completedDays.includes(dateStr)).length;
    const dailyTodos = todos.filter(t => t.date === dateStr);
    const completedTodos = dailyTodos.filter(t => t.isCompleted).length;

    const total = dailyActiveHabits.length + dailyTodos.length;
    const completed = completedHabits + completedTodos;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    let message = '开启元气满满的一天';
    if (percentage > 0) message = '继续加油';
    if (percentage > 50) message = '已过半，真棒';
    if (percentage >= 100 && total > 0) message = '今日达成！';

    return { total, completed, percentage, message };
  }, [habits, todos, selectedDate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24 font-sans selection:bg-indigo-100">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <i className="fa-solid fa-droplet"></i>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-800">晨露清单</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">静谧自律 · 此时此刻</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-sm border border-slate-100">
            {profile.avatar}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        {selectedHabitId && currentHabit ? (
          <HabitDetailView 
            habit={currentHabit} 
            onBack={() => setSelectedHabitId(null)}
            onEdit={() => { setEditingHabit(currentHabit); setIsHabitFormOpen(true); }}
            onDelete={() => { setHabits(prev => prev.filter(h => h.id !== selectedHabitId)); setSelectedHabitId(null); }}
          />
        ) : (
          <>
            {activeTab === 'today' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                      {isToday(parseISO(selectedDate)) ? '今天' : ''} {format(parseISO(selectedDate), 'M月d日')}
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {format(parseISO(selectedDate), 'EEEE')} · 保持专注
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsActionSheetOpen(true)} 
                    className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-plus"></i>
                    添加
                  </button>
                </div>

                <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                        {dailyProgress.percentage}%
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">{dailyProgress.message}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase">
                      {dailyProgress.completed} / {dailyProgress.total} 任务
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(79,70,229,0.3)]"
                      style={{ width: `${dailyProgress.percentage}%` }}
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-calendar-check text-amber-500"></i>
                      待办事项
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {pendingTodos.length === 0 && completedRecentTodos.length === 0 ? (
                      <div className="py-8 bg-white/50 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">暂无计划事项</p>
                      </div>
                    ) : (
                      <>
                        {pendingTodos.map(todo => (
                          <TodoCard 
                            key={todo.id} 
                            todo={todo} 
                            onToggle={() => handleToggleTodo(todo.id)}
                            onEdit={() => { setEditingTodo(todo); setIsTodoFormOpen(true); }}
                          />
                        ))}
                        
                        {completedRecentTodos.length > 0 && (
                          <div className="pt-2">
                            <button 
                              onClick={() => setShowCompletedTodos(!showCompletedTodos)}
                              className="flex items-center gap-2 px-2 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                              <i className={`fa-solid ${showCompletedTodos ? 'fa-chevron-down' : 'fa-chevron-right'} text-[8px]`}></i>
                              最近完成 ({completedRecentTodos.length})
                            </button>
                            
                            {showCompletedTodos && (
                              <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                {completedRecentTodos.map(todo => (
                                  <TodoCard 
                                    key={todo.id} 
                                    todo={todo} 
                                    onToggle={() => handleToggleTodo(todo.id)}
                                    onEdit={() => { setEditingTodo(todo); setIsTodoFormOpen(true); }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                   <div className="flex items-center justify-between px-1">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <i className="fa-solid fa-repeat text-indigo-500"></i>
                      日常习惯
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {habits.length === 0 ? (
                       <div className="py-8 bg-white/50 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">还没有添加习惯</p>
                      </div>
                    ) : (
                      habits.map(habit => (
                        <HabitCard 
                          key={habit.id} 
                          habit={habit} 
                          selectedDate={selectedDate} 
                          onToggle={() => handleToggleHabit(habit.id)}
                          onEdit={() => setSelectedHabitId(habit.id)}
                        />
                      ))
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'stats' && <StatsView habits={habits} />}
            {activeTab === 'calendar' && (
              <CalendarView 
                habits={habits} 
                todos={todos} 
                selectedDate={selectedDate} 
                setSelectedDate={setSelectedDate}
                onEditTodo={(todo) => { setEditingTodo(todo); setIsTodoFormOpen(true); }}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileView 
                profile={profile} 
                onChangeAvatar={() => setIsAvatarPickerOpen(true)}
                habits={habits}
                totalPoints={profile.points}
              />
            )}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-3 flex items-center justify-around z-40">
        {[
          { id: 'today', icon: 'fa-calendar-day' },
          { id: 'stats', icon: 'fa-chart-pie' },
          { id: 'calendar', icon: 'fa-calendar-week' },
          { id: 'profile', icon: 'fa-user' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSelectedHabitId(null); }}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-indigo-500'}`}
          >
            <i className={`fa-solid ${tab.icon} text-lg`}></i>
          </button>
        ))}
      </nav>

      {isActionSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-10 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-800">选择操作</h3>
              <button onClick={() => setIsActionSheetOpen(false)} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => { setIsActionSheetOpen(false); setIsHabitFormOpen(true); }}
                className="flex items-center gap-4 p-5 rounded-3xl bg-indigo-50 hover:bg-indigo-100 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-repeat"></i>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800">建立长期习惯</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">循环往复，终身受益</p>
                </div>
              </button>
              <button 
                onClick={() => { setIsActionSheetOpen(false); setEditingTodo(null); setIsTodoFormOpen(true); }}
                className="flex items-center gap-4 p-5 rounded-3xl bg-amber-50 hover:bg-amber-100 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-lg shadow-amber-100 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-calendar-check"></i>
                </div>
                <div className="text-left">
                  <p className="font-black text-slate-800">添加特定待办</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">专注于当下的重要目标</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {isHabitFormOpen && (
        <HabitForm 
          onClose={() => { setIsHabitFormOpen(false); setEditingHabit(null); }} 
          onSubmit={handleAddHabit}
          initialData={editingHabit}
        />
      )}

      {isTodoFormOpen && (
        <TodoForm 
          initialDate={editingTodo ? editingTodo.date : selectedDate} 
          editingTodo={editingTodo}
          onClose={() => { setIsTodoFormOpen(false); setEditingTodo(null); }} 
          onSubmit={handleTodoSubmit} 
        />
      )}

      {isAvatarPickerOpen && (
        <AvatarPicker 
          currentAvatar={profile.avatar}
          onSelect={(avatar) => { setProfile(p => ({ ...p, avatar })); setIsAvatarPickerOpen(false); }}
          onClose={() => setIsAvatarPickerOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
