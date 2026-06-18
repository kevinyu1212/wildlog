import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose, boards }) {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  if (!isOpen) return null;

  const categoryIcons = {
    '포유류': '🦁',
    '파충류': '🦎',
    '양서류': '🐸',
    '절지류': '🕷️',
    '곤충': '🐞',
    '어류': '🐟',
    '식물': '🌿',
    '균류': '🍄',
    '기타': '🔬'
  };

  const getProfileImgUrl = () => {
    if (!user?.profile_image) return null;
    if (user.profile_image.startsWith('http')) return user.profile_image;
    return `http://localhost:5000/uploads/${user.profile_image}?t=${new Date().getTime()}`;
  };

  return (
    <div className="fixed inset-0 z-[150] animate-scale-in" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Sidebar Panel */}
      <aside 
        className="fixed right-0 top-0 h-full w-80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-l border-slate-800/80 shadow-2xl z-[160] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">메뉴</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-5 shadow-inner">
            {!isLoggedIn ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto flex items-center justify-center border-2 border-dashed border-slate-600">
                  <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <p className="text-slate-400 text-sm font-medium">로그인하세요</p>
                <button 
                  onClick={() => { navigate('/login'); onClose(); }} 
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/30 text-white"
                >
                  로그인 하러가기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => { navigate('/mypage/profile-image'); onClose(); }}
                    className="relative w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full border-2 border-emerald-500/30 cursor-pointer hover:border-emerald-500 transition-all flex items-center justify-center overflow-hidden flex-shrink-0 group"
                    title="프로필 사진 변경"
                  >
                    {getProfileImgUrl() ? (
                      <img src={getProfileImgUrl()} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-lg text-slate-100 truncate">{user?.username || '탐사대원'}</p>
                    <p className="text-[10px] text-slate-500 font-medium">가입일: {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '2026-06-15'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '관찰기록', value: user?.records || 0, icon: '📝' },
                    { label: '관찰종수', value: user?.species || 0, icon: '🧬' },
                    { label: '작성댓글', value: user?.comments || 0, icon: '💬' },
                    { label: '보낸 좋아요', value: user?.sent_likes ?? 0, icon: '👍' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-700/30">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-0.5">
                        <span>{stat.icon}</span>
                        <span>{stat.label}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">{stat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { navigate('/mypage'); onClose(); }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded-xl text-xs font-medium text-slate-300 transition-all border border-slate-700/50"
                  >
                    계정 설정
                  </button>
                  <button 
                    onClick={() => { logout(); onClose(); }}
                    className="flex-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 py-2 rounded-xl text-xs font-medium transition-all border border-red-900/30"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Community Boards */}
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 px-1">커뮤니티</h3>
            <div className="grid grid-cols-1 gap-1">
              {boards.map(b => (
                <button 
                  key={b} 
                  onClick={() => { navigate(`/board/${b}`); onClose(); }} 
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl transition-all group"
                >
                  <span className="text-base">{categoryIcons[b] || '📋'}</span>
                  <span>{b} 게시판</span>
                  <svg className="w-4 h-4 ml-auto text-slate-700 group-hover:text-emerald-500/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Biology Map */}
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 px-1">데이터 맵</h3>
            <button 
              onClick={() => { navigate('/map'); onClose(); }} 
              className="w-full flex items-center gap-3 px-3 py-3 text-sm font-semibold text-emerald-400 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl hover:from-emerald-500/20 transition-all group"
            >
              <span className="text-lg">🗺️</span>
              <span>생물 지도 서비스</span>
              <svg className="w-4 h-4 ml-auto text-emerald-500/50 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-900/80 text-[10px] text-slate-600 text-center font-medium">
          © 2026 WildLog Explorer Edition
        </div>
      </aside>
    </div>
  );
}
