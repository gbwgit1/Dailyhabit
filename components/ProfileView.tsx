
import React from 'react';
import { UserProfile, Habit } from '../types';

interface ProfileViewProps {
  username: string;
  profile: UserProfile | null;
  onLogout: () => void;
  onChangeAvatar: () => void;
  habits: Habit[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ username, profile, onLogout, onChangeAvatar, habits }) => {
  const totalCompleted = habits.reduce((acc, h) => acc + (h.completedDays?.length || 0), 0);
  const activeHabits = habits.length;
  
  const handleLogoutClick = () => {
    if (window.confirm('确定要退出当前账号吗？您的数据将保留在本地。')) {
      onLogout();
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="glass p-8 rounded-[3rem] flex flex-col items-center text-center shadow-sm">
        <button 
          onClick={onChangeAvatar}
          className="relative w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-5xl shadow-xl shadow-indigo-100 border-4 border-slate-50 hover:scale-105 transition-transform mb-4"
        >
          {profile?.avatar || '👤'}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs shadow-lg">
            <i className="fa-solid fa-camera"></i>
          </div>
        </button>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{username}</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">自律修行者</p>

        <div className="grid grid-cols-2 gap-4 w-full mt-8">
          <div className="bg-slate-50/50 p-4 rounded-2xl">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">累计打卡</p>
            <p className="text-xl font-black text-indigo-600">{totalCompleted}</p>
          </div>
          <div className="bg-slate-50/50 p-4 rounded-2xl">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">活跃计划</p>
            <p className="text-xl font-black text-indigo-600">{activeHabits}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">账号设置</h3>
        
        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-50">
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-between p-5 hover:bg-rose-50 transition-colors text-rose-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </div>
              <span className="text-sm font-bold">退出当前账号</span>
            </div>
          </button>
        </div>
      </div>

      <p className="text-center text-slate-300 text-[9px] font-bold uppercase tracking-widest py-4">
        DailyHabit v1.0.0
      </p>
    </div>
  );
};

export default ProfileView;
