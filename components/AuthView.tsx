
import React, { useState } from 'react';

interface AuthViewProps {
  onLogin: (username: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('请输入账号和密码');
      return;
    }

    if (trimmedUsername.length < 2) {
      setError('用户名至少需要 2 个字符');
      return;
    }

    // Get current user registry: { "username": "password" }
    const users = JSON.parse(localStorage.getItem('zenhabits_users') || '{}');

    if (isLogin) {
      // LOGIN LOGIC
      if (users[trimmedUsername]) {
        if (users[trimmedUsername] === trimmedPassword) {
          onLogin(trimmedUsername);
        } else {
          setError('密码错误，请重试');
        }
      } else {
        setError('账号不存在，请先注册');
      }
    } else {
      // REGISTRATION LOGIC
      if (users[trimmedUsername]) {
        setError('该用户名已被占用，请换一个');
        return;
      }
      
      // Save user to registry
      const updatedUsers = { ...users, [trimmedUsername]: trimmedPassword };
      localStorage.setItem('zenhabits_users', JSON.stringify(updatedUsers));
      
      // Initialize Profile data immediately to avoid issues
      const profiles = JSON.parse(localStorage.getItem('zenhabits_profiles') || '{}');
      if (!profiles[trimmedUsername]) {
        profiles[trimmedUsername] = { 
          username: trimmedUsername, 
          avatar: '👤', 
          friends: [] 
        };
        localStorage.setItem('zenhabits_profiles', JSON.stringify(profiles));
      }
      
      onLogin(trimmedUsername);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 safe-top safe-bottom">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white text-3xl mx-auto shadow-2xl shadow-indigo-200 mb-6">
            <i className="fa-solid fa-feather-pointed"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">DailyHabit</h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">回归自律，重塑生活</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50">
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button 
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              登录
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">用户名</label>
              <input 
                type="text" 
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="你的称呼"
                className="w-full bg-slate-50/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">密码</label>
              <input 
                type="password" 
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50/50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all text-slate-800 font-medium"
              />
            </div>

            {error && (
              <p className="text-rose-500 text-[10px] font-bold text-center animate-shake">{error}</p>
            )}

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest py-5 rounded-[1.5rem] shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
            >
              {isLogin ? '开启新的一天' : '创建账号'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          数据保存在当前浏览器本地
        </p>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 2; }
      `}</style>
    </div>
  );
};

export default AuthView;
