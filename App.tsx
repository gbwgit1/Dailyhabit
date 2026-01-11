
import React, { useState, useEffect, useMemo } from 'react';
import { Habit, Category, UserProfile, DailyNote, FriendRequest } from './types';
import HabitCard from './components/HabitCard';
import HabitForm from './components/HabitForm';
import StatsView from './components/StatsView';
import CalendarView from './components/CalendarView';
import AuthView from './components/AuthView';
import SocialView from './components/SocialView';
import ProfileView from './components/ProfileView';
import AvatarPicker from './components/AvatarPicker';
import { format, getDay, parseISO } from 'date-fns';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('zenhabits_current_user');
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dailyNotes, setDailyNotes] = useState<DailyNote[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'stats' | 'calendar' | 'social' | 'profile'>('today');
  const [showForm, setShowForm] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (currentUser) {
      const savedHabits = localStorage.getItem(`zenhabits_data_${currentUser}`);
      const savedNotes = localStorage.getItem(`zenhabits_notes_${currentUser}`);
      const profiles = JSON.parse(localStorage.getItem('zenhabits_profiles') || '{}');
      
      if (!profiles[currentUser]) {
        const newProfile = { username: currentUser, avatar: '👤', friends: [] };
        profiles[currentUser] = newProfile;
        localStorage.setItem('zenhabits_profiles', JSON.stringify(profiles));
        setUserProfile(newProfile);
      } else {
        setUserProfile(profiles[currentUser]);
      }
      
      setHabits(savedHabits ? JSON.parse(savedHabits) : []);
      setDailyNotes(savedNotes ? JSON.parse(savedNotes) : []);
    } else {
      setHabits([]);
      setDailyNotes([]);
      setUserProfile(null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && userProfile) {
      const profiles = JSON.parse(localStorage.getItem('zenhabits_profiles') || '{}');
      profiles[currentUser] = userProfile;
      localStorage.setItem('zenhabits_profiles', JSON.stringify(profiles));
    }
  }, [userProfile, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`zenhabits_data_${currentUser}`, JSON.stringify(habits));
    }
  }, [habits, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`zenhabits_notes_${currentUser}`, JSON.stringify(dailyNotes));
    }
  }, [dailyNotes, currentUser]);

  const handleLogin = (username: string) => {
    localStorage.setItem('zenhabits_current_user', username);
    setCurrentUser(username);
    setActiveTab('today');
  };

  const logout = () => {
    localStorage.removeItem('zenhabits_current_user');
    setCurrentUser(null);
    setUserProfile(null);
    setHabits([]);
    setDailyNotes([]);
    setActiveTab('today');
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'completedDays' | 'createdAt'>) => {
    const newHabit: Habit = { ...habitData, id: crypto.randomUUID(), completedDays: [], createdAt: Date.now() };
    setHabits(prev => [newHabit, ...prev]);
    setShowForm(false);
  };

  const updateHabit = (id: string, updatedData: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updatedData } : h));
    setShowForm(false);
    setEditingHabit(null);
  };

  const toggleHabit = (id: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const isCompleted = h.completedDays.includes(date);
      return { ...h, completedDays: isCompleted ? h.completedDays.filter(d => d !== date) : [...h.completedDays, date] };
    }));
  };

  const handleInviteFriend = (targetName: string) => {
    if (!currentUser) return;
    const requests: FriendRequest[] = JSON.parse(localStorage.getItem('zenhabits_requests') || '[]');
    const users = JSON.parse(localStorage.getItem('zenhabits_users') || '{}');
    if (!users[targetName]) {
      alert('未找到该用户');
      return;
    }
    if (userProfile?.friends.includes(targetName)) {
      alert('已经是好友了');
      return;
    }
    const existing = requests.find(r => r.from === currentUser && r.to === targetName && r.status === 'pending');
    if (existing) {
      alert('已发送过邀请，请耐心等待对方确认');
      return;
    }
    const newRequest: FriendRequest = {
      from: currentUser,
      to: targetName,
      timestamp: Date.now(),
      status: 'pending'
    };
    localStorage.setItem('zenhabits_requests', JSON.stringify([...requests, newRequest]));
    alert('好友申请已发送');
  };

  const handleAcceptInvite = (fromUser: string) => {
    if (!currentUser) return;
    const requests: FriendRequest[] = JSON.parse(localStorage.getItem('zenhabits_requests') || '[]');
    const profiles = JSON.parse(localStorage.getItem('zenhabits_profiles') || '{}');
    const updatedRequests = requests.map(r => 
      (r.from === fromUser && r.to === currentUser) ? { ...r, status: 'accepted' as const } : r
    );
    localStorage.setItem('zenhabits_requests', JSON.stringify(updatedRequests));
    const myProfile = profiles[currentUser] || { username: currentUser, avatar: '👤', friends: [] };
    const friendProfile = profiles[fromUser] || { username: fromUser, avatar: '👤', friends: [] };
    if (!myProfile.friends.includes(fromUser)) myProfile.friends.push(fromUser);
    if (!friendProfile.friends.includes(currentUser)) friendProfile.friends.push(currentUser);
    profiles[currentUser] = myProfile;
    profiles[fromUser] = friendProfile;
    localStorage.setItem('zenhabits_profiles', JSON.stringify(profiles));
    if (currentUser) setUserProfile({ ...myProfile });
  };

  const updateAvatar = (avatar: string) => {
    setUserProfile(prev => prev ? { ...prev, avatar } : null);
    setShowAvatarPicker(false);
  };

  const handleNoteChange = (text: string) => {
    setDailyNotes(prev => {
      const filtered = prev.filter(n => n.date !== selectedDate);
      if (!text.trim()) return filtered;
      return [...filtered, { date: selectedDate, text }];
    });
  };

  const currentNote = dailyNotes.find(n => n.date === selectedDate)?.text || '';

  const displayedHabits = useMemo(() => {
    const date = parseISO(selectedDate);
    const dayOfWeek = getDay(date);
    return habits.filter(habit => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekly_days') return habit.frequencyConfig.days?.includes(dayOfWeek);
      return true;
    });
  }, [habits, selectedDate]);

  const completedCount = displayedHabits.filter(h => h.completedDays.includes(selectedDate)).length;
  const progressPercent = displayedHabits.length > 0 ? Math.round((completedCount / displayedHabits.length) * 100) : 0;

  const pendingCount = useMemo(() => {
    if (!currentUser) return 0;
    const requests: FriendRequest[] = JSON.parse(localStorage.getItem('zenhabits_requests') || '[]');
    return requests.filter(r => r.to === currentUser && r.status === 'pending').length;
  }, [currentUser, activeTab]);

  if (!currentUser) return <AuthView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-100">
      <header className="fixed top-0 left-0 right-0 glass z-40 safe-top px-6 pb-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setActiveTab('profile')} 
                className={`w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm border border-slate-100 transition-all ${activeTab === 'profile' ? 'ring-2 ring-indigo-500 scale-105' : 'hover:scale-110'}`}
             >
                {userProfile?.avatar || '👤'}
             </button>
             <div>
               <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">DailyHabit</h1>
               <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1 opacity-70">
                 {currentUser} · {format(parseISO(selectedDate), 'MMM do')}
               </p>
             </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setEditingHabit(null); setShowForm(true); }} 
              className="bg-indigo-600 active:scale-90 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 transition-transform"
            >
              <i className="fa-solid fa-plus text-base"></i>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 pt-[calc(85px+var(--safe-area-top))] pb-[calc(100px+var(--safe-area-bottom))]">
        {activeTab === 'today' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {habits.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="glass p-4 rounded-[1.8rem] border-0 shadow-sm">
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-[9px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                      <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i>
                      今日结语
                    </h3>
                    <span className="text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-50/50 px-2 py-0.5">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentNote}
                      onChange={(e) => handleNoteChange(e.target.value)}
                      placeholder="这一刻的感悟..."
                      className="w-full bg-slate-50/50 rounded-xl px-3 py-2 text-[11px] text-slate-700 border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-end justify-between px-1">
                <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">今日日程</h2>
                <div className="text-right leading-none">
                  <span className="text-lg font-black text-indigo-600 italic">{completedCount}</span>
                  <span className="text-slate-300 font-bold mx-0.5">/</span>
                  <span className="text-slate-400 font-bold text-[9px]">{displayedHabits.length}</span>
                </div>
              </div>
              <div className="space-y-2">
                {displayedHabits.map(habit => (
                  <HabitCard key={habit.id} habit={habit} selectedDate={selectedDate} onToggle={() => toggleHabit(habit.id, selectedDate)} onEdit={() => { setEditingHabit(habit); setShowForm(true); }} onDelete={() => { if(confirm('删除？')) setHabits(prev => prev.filter(h => h.id !== habit.id)) }} />
                ))}
                {habits.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-[2rem] border border-slate-100 text-slate-400">
                    <div className="text-3xl mb-3 opacity-20"><i className="fa-solid fa-seedling"></i></div>
                    <p className="text-xs font-medium">点击上方 + 号开始一段新旅程</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && <StatsView habits={habits} />}
        {activeTab === 'calendar' && <CalendarView habits={habits} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
        {activeTab === 'social' && <SocialView currentUser={currentUser || ''} friends={userProfile?.friends || []} onInviteFriend={handleInviteFriend} onAcceptInvite={handleAcceptInvite} />}
        {activeTab === 'profile' && <ProfileView username={currentUser || ''} profile={userProfile} onLogout={logout} onChangeAvatar={() => setShowAvatarPicker(true)} habits={habits} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass safe-bottom z-40 px-4 pt-2 shadow-lg border-t border-white/40">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <NavButton active={activeTab === 'today'} onClick={() => setActiveTab('today')} icon="fa-house-chimney" label="日程" />
          <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon="fa-calendar-days" label="日历" />
          <NavButton active={activeTab === 'social'} onClick={() => setActiveTab('social')} icon="fa-user-group" label="好友" badge={pendingCount} />
          <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon="fa-chart-simple" label="统计" />
          <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon="fa-user" label="我的" />
        </div>
      </nav>

      {showForm && <HabitForm onClose={() => setShowForm(false)} onSubmit={(data) => editingHabit ? updateHabit(editingHabit.id, data) : addHabit(data)} initialData={editingHabit} />}
      {showAvatarPicker && <AvatarPicker currentAvatar={userProfile?.avatar || ''} onSelect={updateAvatar} onClose={() => setShowAvatarPicker(false)} />}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: string, label: string, badge?: number }> = ({ active, onClick, icon, label, badge }) => (
  <button 
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }} 
    className={`relative flex flex-col items-center gap-0.5 py-3 px-4 rounded-2xl transition-all duration-300 ${active ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}
  >
    <div className="text-lg mb-0.5">
      <i className={`fa-solid ${icon}`}></i>
      {badge ? badge > 0 && (
        <span className="absolute top-2.5 right-3 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">{badge}</span>
      ) : null}
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
