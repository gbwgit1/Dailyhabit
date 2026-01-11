
import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { FriendRequest } from '../types';

interface SocialViewProps {
  currentUser: string;
  friends: string[];
  onInviteFriend: (name: string) => void;
  onAcceptInvite: (name: string) => void;
}

const SocialView: React.FC<SocialViewProps> = ({ currentUser, friends, onInviteFriend, onAcceptInvite }) => {
  const [inputValue, setInputValue] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showMyCode, setShowMyCode] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  const pendingRequests: FriendRequest[] = useMemo(() => {
    const allRequests: FriendRequest[] = JSON.parse(localStorage.getItem('zenhabits_requests') || '[]');
    return allRequests.filter(r => r.to === currentUser && r.status === 'pending');
  }, [currentUser]);

  const invitationCode = useMemo(() => {
    if (!currentUser) return '';
    const name = String(currentUser).toUpperCase();
    const len = name.length;
    const suffix = len >= 2 ? name.substring(len - 2) : name;
    return `${name.substring(0, 3)}-${len}${suffix}`;
  }, [currentUser]);

  const handleInvite = () => {
    let target = inputValue.trim();
    if (!target) return;

    if (target.includes('-')) {
      const users = JSON.parse(localStorage.getItem('zenhabits_users') || '{}');
      const found = Object.keys(users).find(u => {
        const uName = u.toUpperCase();
        const len = uName.length;
        const suffix = len >= 2 ? uName.substring(len - 2) : uName;
        const code = `${uName.substring(0, 3)}-${len}${suffix}`;
        return code === target;
      });
      if (found) target = found;
    }
    
    onInviteFriend(target);
    setInputValue('');
    setShowAddPanel(false);
  };

  const getFriendInfo = (friendName: string) => {
    const data = localStorage.getItem(`zenhabits_data_${friendName}`);
    const profiles = JSON.parse(localStorage.getItem('zenhabits_profiles') || '{}');
    const profile = profiles[friendName];
    
    if (!data) return { progress: 0, avatar: profile?.avatar || '👤' };
    
    const habits = JSON.parse(data);
    if (!Array.isArray(habits) || habits.length === 0) return { progress: 0, avatar: profile?.avatar || '👤' };
    
    const completed = habits.filter((h: any) => h.completedDays && h.completedDays.includes(today)).length;
    return {
      progress: Math.round((completed / habits.length) * 100),
      avatar: profile?.avatar || '👤'
    };
  };

  const handleDecline = (fromUser: string) => {
    const allRequests: FriendRequest[] = JSON.parse(localStorage.getItem('zenhabits_requests') || '[]');
    const updated = allRequests.map(r => 
      (r.from === fromUser && r.to === currentUser) ? { ...r, status: 'declined' as const } : r
    );
    localStorage.setItem('zenhabits_requests', JSON.stringify(updated));
    window.location.reload(); // Quick sync
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Pending Invitations Section */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-2">待处理的邀请 ({pendingRequests.length})</h3>
          {pendingRequests.map(req => (
            <div key={req.from} className="bg-white p-4 rounded-[1.8rem] flex items-center gap-4 shadow-sm border-l-4 border-l-rose-400">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl">👤</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-sm truncate">{req.from}</h4>
                <p className="text-[10px] text-slate-400">请求监督你的日程</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onAcceptInvite(req.from)} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-indigo-100 active:scale-95 transition-all">接受</button>
                <button onClick={() => handleDecline(req.from)} className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl active:scale-95 transition-all"><i className="fa-solid fa-xmark"></i></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 px-1">
        <button 
          onClick={() => setShowAddPanel(true)}
          className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <i className="fa-solid fa-user-plus text-xs"></i>
          </div>
          <span className="text-sm font-bold text-slate-700">添加好友</span>
        </button>
        <button 
          onClick={() => setShowMyCode(true)}
          className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center">
            <i className="fa-solid fa-qrcode text-xs"></i>
          </div>
          <span className="text-sm font-bold text-slate-700">我的名片</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">监督中 ({friends.length})</h3>
          <span className="text-[9px] font-bold text-slate-300">更新于今日</span>
        </div>
        
        {friends.length === 0 ? (
          <div className="py-16 text-center bg-white/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <i className="fa-solid fa-people-arrows"></i>
            </div>
            <p className="text-slate-400 text-xs font-medium">寻找志同道合的小伙伴<br/>互相监督完成日程</p>
          </div>
        ) : (
          friends.map(friend => {
            const info = getFriendInfo(friend);
            return (
              <div key={friend} className="bg-white p-4 rounded-[1.8rem] flex items-center gap-4 shadow-sm border border-slate-50 group hover:border-indigo-100 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner group-hover:bg-indigo-50 transition-colors">
                  {info.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-1.5">
                    <h4 className="font-bold text-slate-800 truncate text-sm">{friend}</h4>
                    <span className={`text-[10px] font-black ${info.progress > 80 ? 'text-emerald-500' : 'text-indigo-600'}`}>
                      {info.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${info.progress > 80 ? 'bg-emerald-400' : 'bg-indigo-500'}`}
                      style={{ width: `${info.progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-1.5 ml-2">
                  <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-500 active:scale-90 transition-all hover:bg-indigo-600 hover:text-white">
                    <i className="fa-solid fa-heart text-xs"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddPanel && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10 bg-slate-900/40 backdrop-blur-sm transition-all duration-500">
          <div className="w-full max-w-md bg-white rounded-[3rem] p-8 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">发送好友申请</h3>
              <button onClick={() => setShowAddPanel(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">输入账号或邀请码</label>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="例如: DailyUser 或 DAILY-7ER"
                    className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 outline-none focus:ring-2 ring-indigo-500/20 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => alert('此功能需要摄像头权限')}
                  className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-100 transition-colors"
                >
                  <i className="fa-solid fa-camera text-slate-400"></i>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">扫一扫</span>
                </button>
                <button 
                  onClick={handleInvite}
                  className="bg-indigo-600 text-white p-4 rounded-2xl flex flex-col items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <span className="text-[10px] font-bold uppercase">发送申请</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMyCode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md transition-all duration-500">
          <div className="w-full max-w-xs bg-white rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl mb-6 shadow-xl shadow-indigo-100">
              <i className="fa-solid fa-feather-pointed"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{currentUser}</h3>
            <p className="text-slate-400 text-xs font-medium mb-8">邀请好友一起变优秀</p>
            
            <div className="bg-slate-50 p-6 rounded-[2.5rem] mb-8 border border-slate-100">
              <QRCodeSVG 
                value={`dailyhabit:user:${currentUser}`} 
                size={160} 
                level="H" 
                includeMargin={false} 
              />
            </div>

            <div className="w-full space-y-4">
              <div className="bg-slate-50 px-4 py-3 rounded-xl border border-dashed border-slate-200">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">我的邀请码</p>
                <p className="text-lg font-black text-indigo-600 tracking-widest">{invitationCode}</p>
              </div>
              
              <button 
                onClick={() => {
                  if (invitationCode) {
                    navigator.clipboard.writeText(invitationCode);
                    alert('邀请码已复制！');
                  }
                }}
                className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all"
              >
                复制邀请码
              </button>
              
              <button onClick={() => setShowMyCode(false)} className="text-slate-400 text-xs font-bold pt-2">
                返回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialView;
