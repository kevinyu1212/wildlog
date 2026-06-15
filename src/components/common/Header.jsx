import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ isLoggedIn, setIsLoggedIn, notificationCount }) {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 sticky top-0 z-[100]">
      <div onClick={() => navigate('/')} className="text-xl font-bold text-emerald-400 cursor-pointer">🐾 WildLog</div>
      <div className="flex items-center gap-6">
        <button onClick={() => navigate(isLoggedIn ? '/favorites' : '/login')} className="text-xl">⭐</button>
        <button onClick={() => navigate(isLoggedIn ? '/notifications' : '/login')} className="text-xl relative">
          🔔 {notificationCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] px-1 rounded-full">{notificationCount > 99 ? '99+' : notificationCount}</span>}
        </button>
        <div className="flex items-center gap-3">
          {!isLoggedIn ? (
            <>
              <span className="text-xs text-slate-400">로그인하세요</span>
              <button onClick={() => navigate('/login')} className="bg-emerald-600 px-3 py-1 rounded text-sm">로그인</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsLoggedIn(false)} className="text-xs text-slate-400">로그아웃</button>
              <span className="text-sm">탐사대원님 환영합니다</span>
              <div onClick={() => navigate('/mypage')} className="w-8 h-8 bg-slate-700 rounded-full cursor-pointer flex items-center justify-center">👤</div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}