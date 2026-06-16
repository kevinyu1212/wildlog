import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose, boards }) {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <aside 
        className="fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-800 shadow-2xl z-[160] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-lg font-bold text-emerald-400">메뉴</h2>
          <button onClick={onClose} className="text-2xl hover:text-red-400 transition-colors">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* 1-3. 프로필 카드 */}
          <div className="mb-8 p-5 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-inner">
            {!isLoggedIn ? (
              <div className="text-center py-4">
                <p className="text-slate-400 mb-4 text-sm">로그인이 필요합니다.</p>
                <button 
                  onClick={() => { navigate('/login'); onClose(); }} 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded-xl text-sm font-bold transition-all"
                >
                  로그인 하러가기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => { navigate('/mypage/profile-image'); onClose(); }}
                    className="w-16 h-16 bg-slate-700 rounded-full border-2 border-emerald-500/30 cursor-pointer hover:border-emerald-500 transition-all flex items-center justify-center overflow-hidden"
                  >
                    {user?.profileImage ? <img src={user.profileImage} alt="profile" /> : <span className="text-2xl">👤</span>}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{user?.username || '탐사대원'}</p>
                    <p className="text-[10px] text-slate-500">가입일: {user?.joinedAt || '2026-06-15'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                    <span className="text-slate-500 block">관찰기록</span>
                    <span className="font-bold text-emerald-400">{user?.records || 0}회</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                    <span className="text-slate-500 block">관찰종수</span>
                    <span className="font-bold text-emerald-400">{user?.species || 0}종</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                    <span className="text-slate-500 block">작성댓글</span>
                    <span className="font-bold text-emerald-400">{user?.comments || 0}개</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
                    <span className="text-slate-500 block">보낸좋아요</span>
                    <span className="font-bold text-emerald-400">{user?.likes || 0}개</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => { navigate('/mypage'); onClose(); }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    계정 설정
                  </button>
                  <button 
                    onClick={() => { logout(); onClose(); }}
                    className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 py-1.5 rounded-lg text-xs transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 게시판 리스트 */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">커뮤니티</h3>
              <div className="grid grid-cols-1 gap-1">
                {boards.map(b => (
                  <button 
                    key={b} 
                    onClick={() => { navigate(`/board/${b}`); onClose(); }} 
                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl transition-all group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">🐾</span>
                    {b} 게시판
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">데이터 맵</h3>
              <button 
                onClick={() => { navigate('/map'); onClose(); }} 
                className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 rounded-xl hover:bg-emerald-400/10 transition-all"
              >
                🗺️ 생물 지도 서비스
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/80 text-[10px] text-slate-500 text-center">
          © 2026 WildLog Explorer Edition
        </div>
      </aside>
    </div>
  );
}