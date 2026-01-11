
import React from 'react';
import { UserProfile, Habit } from '../types';
import { MILESTONES } from '../App';

interface ProfileViewProps {
  profile: UserProfile;
  onChangeAvatar: () => void;
  habits: Habit[];
  totalPoints: number;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onChangeAvatar, habits, totalPoints }) => {
  const userLevel = Math.floor(totalPoints / 100) + 1;
  const nextLevelPoints = userLevel * 100;
  
  const currentTitle = MILESTONES.reduce((prev, curr) => 
    totalPoints >= curr.minXP ? curr : prev, MILESTONES[0]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="glass p-8 rounded-[3rem] flex flex-col items-center text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
          <div className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">LVL {userLevel}</div>
        </div>
        
        <button 
          onClick={onChangeAvatar}
          className="relative w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-5xl shadow-xl shadow-indigo-100 border-4 border-slate-50 hover:scale-105 transition-transform mb-4"
        >
          {profile.avatar}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs shadow-lg">
            <i className="fa-solid fa-camera"></i>
          </div>
        </button>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{profile.username}</h2>
        <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{currentTitle.name}</p>

        <div className="w-full mt-8 space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">等级进度</span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{totalPoints} / {nextLevelPoints} XP</span>
          </div>
          <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(99,102,241,0.3)]" style={{ width: `${(totalPoints % 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="glass p-6 rounded-[2.5rem] border-0 shadow-sm">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
          <i className="fa-solid fa-map text-indigo-500"></i>
          习惯里程碑
        </h3>
        <div className="relative space-y-8 pl-4">
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-100"></div>
          
          {MILESTONES.map((m) => {
            const isUnlocked = totalPoints >= m.minXP;
            return (
              <div key={m.id} className="relative flex items-center gap-6">
                <div className={`relative z-10 w-4 h-4 rounded-full border-2 transition-all duration-700 
                  ${isUnlocked ? 'bg-indigo-600 border-indigo-200 scale-125' : 'bg-white border-slate-200'}`} />
                
                <div className={`flex-1 p-4 rounded-2xl border transition-all duration-500 
                  ${isUnlocked ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50/50 border-slate-50 opacity-60'}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <i className={`fa-solid ${m.icon} text-sm ${isUnlocked ? 'text-indigo-600' : 'text-slate-300'}`}></i>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                      {m.name}
                    </h4>
                    {isUnlocked && <i className="fa-solid fa-circle-check text-emerald-500 text-[10px] ml-auto"></i>}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{m.description}</p>
                  {!isUnlocked && (
                    <div className="mt-2 text-[9px] font-bold text-indigo-400/70">
                      解锁需要 {m.minXP} XP
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
