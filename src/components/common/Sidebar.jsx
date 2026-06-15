import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose, isLoggedIn, boards }) {
  const navigate = useNavigate();
  
  return isOpen && (
    <div className="fixed inset-0 z-[90]" onClick={onClose}>
      <aside className="fixed right-0 top-16 h-[calc(100vh-64px)] w-72 bg-slate-900 border-l border-slate-800 p-6 shadow-2xl z-[95]" onClick={e => e.stopPropagation()}>
        {/* 프로필 카드 영역 */}
        <div className="mb-8 p-4 bg-slate-800 rounded-lg">
          {!isLoggedIn ? (
            <button onClick={() => navigate('/login')} className="w-full text-center">로그인하세요</button>
          ) : (
            <div>
              <div className="w-16 h-16 bg-slate-600 rounded-full mb-2"></div>
              <p className="font-bold">탐사대원</p>
              <button onClick={() => navigate('/mypage')} className="text-xs text-emerald-400">계정 설정</button>
            </div>
          )}
        </div>
        
        {/* 게시판 리스트 */}
        <h3 className="text-sm text-slate-400 mb-4">게시판 바로가기</h3>
        {boards.map(b => (
          <button key={b} onClick={() => navigate(`/board/${b}`)} className="block w-full text-left py-2 hover:text-emerald-400">{b}</button>
        ))}
      </aside>
    </div>
  );
}