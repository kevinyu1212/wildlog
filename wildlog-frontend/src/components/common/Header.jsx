import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onToggleSidebar, notificationCount = 0 }) {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 sticky top-0 z-[100]">
      <div onClick={() => navigate('/')} className="text-xl font-bold text-emerald-400 cursor-pointer">🐾 WildLog</div>

      <div className="flex items-center gap-6">
        <button onClick={() => navigate(isLoggedIn ? '/favorites' : '/login')} title="즐겨찾기" className="text-xl hover:scale-110 transition-transform">⭐</button>
        <button onClick={() => navigate(isLoggedIn ? '/notifications' : '/login')} title="알림" className="text-xl relative hover:scale-110 transition-transform">
          🔔 {notificationCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] px-1 rounded-full">{notificationCount > 99 ? '99+' : notificationCount}</span>}
        </button>

        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <span className="text-xs text-slate-400 hidden sm:inline">로그인하세요</span>
              <button onClick={() => navigate('/login')} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-sm font-medium transition-colors">로그인</button>
            </>
          ) : (
            <>
              <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-medium">{user?.username || '탐사대원'}님 환영합니다</span>
                <button onClick={logout} className="text-[10px] text-slate-500 hover:text-red-400">로그아웃</button>
              </div>
              <div onClick={() => navigate('/mypage')} className="w-8 h-8 bg-slate-700 rounded-full cursor-pointer flex items-center justify-center border border-slate-600 hover:border-emerald-500 transition-colors overflow-hidden">
                {user?.profileImage ? <img src={user.profileImage} alt="profile" className="w-full h-full object-cover" /> : '👤'}
              </div>
            </>
          )}
        </div>

        <button onClick={onToggleSidebar} className="text-2xl hover:text-emerald-400 transition-colors">☰</button>
      </div>
    </header>
  );
}