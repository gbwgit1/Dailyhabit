
import React from 'react';

const AVATARS = ['👤', '🐱', '🐶', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐸', '🐙', '🦋', '🦄', '🚀', '🎨', '🎮', '🎧', '⚡️', '🌟', '🍀'];

interface AvatarPickerProps {
  currentAvatar: string;
  onSelect: (avatar: string) => void;
  onClose: () => void;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({ currentAvatar, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xs p-8 shadow-2xl animate-in zoom-in duration-300">
        <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">选择你的头像</h3>
        <div className="grid grid-cols-4 gap-4">
          {AVATARS.map(a => (
            <button
              key={a}
              onClick={() => onSelect(a)}
              className={`text-3xl aspect-square flex items-center justify-center rounded-2xl transition-all ${currentAvatar === a ? 'bg-indigo-50 border-2 border-indigo-500' : 'bg-slate-50 hover:bg-slate-100'}`}
            >
              {a}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-8 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors">
          取消
        </button>
      </div>
    </div>
  );
};

export default AvatarPicker;
