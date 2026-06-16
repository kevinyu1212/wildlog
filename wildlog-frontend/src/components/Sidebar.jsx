import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ user, isLoggedIn }) {
  const navigate = useNavigate();
  const categories = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 h-full flex flex-col p-4 overflow-y-auto">
      {/* 1. 프로필 카드 영역 */}
      <div className="bg-slate-900 rounded-xl p-4 mb-6 border border-slate-700">
        {!isLoggedIn ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">👤</div>
            <p className="text-xs text-slate-400 mb-3">로그인하세요</p>
            <button onClick={() => navigate('/login')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold">
              로그인 하러가기
            </button>
          </div>
        ) : (
          <div>
            <div onClick={() => navigate('/profile-edit')} className="w-20 h-20 bg-emerald-900/50 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl cursor-pointer hover:ring-2 ring-emerald-500 transition-all overflow-hidden border border-emerald-700">
              {user?.avatar || '🌱'}
            </div>
            <h3 className="text-sm font-bold text-center text-slate-100">{user?.username}</h3>
            <p className="text-[10px] text-slate-500 text-center mb-4">가입일: {user?.joinedAt}</p>
            
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mb-4 border-t border-slate-700 pt-3">
              <div>기록: <span className="text-emerald-400 font-bold">{user?.stats?.records}</span></div>
              <div>종: <span className="text-emerald-400 font-bold">{user?.stats?.species}</span></div>
              <div>댓글: <span className="text-emerald-400 font-bold">{user?.stats?.comments}</span></div>
              <div>좋아요: <span className="text-emerald-400 font-bold">{user?.stats?.likes}</span></div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => navigate('/settings')} className="flex-1 bg-slate-700 hover:bg-slate-600 py-1.5 rounded text-[10px] text-slate-200">설정</button>
              <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="flex-1 bg-red-900/40 hover:bg-red-800 py-1.5 rounded text-[10px] text-red-300">로그아웃</button>
            </div>
          </div>
        )}
      </div>

      {/* 2. 게시판 카테고리 */}
      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">게시판</h4>
      <div className="space-y-1 mb-6">
        {categories.map((cat) => (
          <button key={cat} onClick={() => navigate(`/board/${cat}`)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-emerald-400 rounded-lg transition-colors">
            {cat} 게시판
          </button>
        ))}
      </div>

      {/* 3. 생물 지도 바로가기 */}
      <button onClick={() => navigate('/map')} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
        🗺️ 생물 지도 바로가기
      </button>
    </div>
  );
}