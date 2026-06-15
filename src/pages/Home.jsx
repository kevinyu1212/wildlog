import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';

export default function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({ nickname: '탐사대원', joined: '2026-01-01' });
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1-1. 헤더 바 */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 sticky top-0 z-[100]">
        <div onClick={() => navigate('/')} className="text-xl font-bold text-emerald-400 cursor-pointer">🐾 WildLog</div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(isLoggedIn ? '/favorites' : '/login')} className="text-xl">⭐</button>
          <button onClick={() => navigate(isLoggedIn ? '/notifications' : '/login')} className="text-xl relative">🔔</button>
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <span className="text-xs text-slate-400">로그인하세요</span>
                <button onClick={() => navigate('/login')} className="bg-emerald-600 px-3 py-1 rounded text-sm">로그인</button>
              </>
            ) : (
              <>
                <button onClick={() => setIsLoggedIn(false)} className="text-xs text-slate-400">로그아웃</button>
                <span className="text-sm">{userData.nickname}님 환영합니다</span>
                <div onClick={() => navigate('/mypage')} className="w-8 h-8 bg-slate-700 rounded-full cursor-pointer"></div>
              </>
            )}
          </div>
          <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="text-2xl z-[110]">☰</button>
        </div>
      </header>

      {/* 1-2. GNB */}
      <nav className="h-12 border-b border-slate-800 flex items-center gap-8 px-6 bg-slate-900 text-sm">
        {['미션', '관찰자', '생물 지도'].map(item => <button key={item} onClick={() => navigate(`/${item}`)}>{item}</button>)}
      </nav>

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <Carousel /> {/* 1-4 */}
        <section className="mt-8 grid grid-cols-9 gap-2">{boards.map(b => <button key={b} onClick={() => navigate(`/board/${b}`)} className="p-2 bg-slate-900 border rounded text-xs">{b}</button>)}</section> {/* 1-5 */}
        <section className="mt-8 grid grid-cols-3 gap-6"> {/* 1-6 */}
          <div className="col-span-2 bg-slate-900 p-6 rounded-xl border">최신 관찰 피드</div>
          <div className="bg-slate-900 p-6 rounded-xl border">핫 미션 & 랭킹</div>
        </section>
      </main>

      {/* 1-3. 우측 사이드바 */}
      {isRightSidebarOpen && (
        <aside className="fixed right-0 top-16 h-full w-72 bg-slate-900 border-l p-6 z-[95]">
          {!isLoggedIn ? <button onClick={() => navigate('/login')}>로그인하세요</button> : <div className="mb-6">프로필 카드 영역</div>}
          {boards.map(b => <button key={b} onClick={() => navigate(`/board/${b}`)} className="block py-2 text-sm">{b} 게시판</button>)}
        </aside>
      )}

      {/* 1-7. 푸터 */}
      <footer className="border-t border-slate-800 p-8 text-center text-xs text-slate-500">
        <div className="flex justify-center gap-4 mb-2">
          {['이용약관', '사이트 소개', '개인정보처리방침', '이용안내', '모바일버전'].map(t => <button key={t}>{t}</button>)}
        </div>
        <p>© 2026 WildLog Project.</p>
      </footer>
    </div>
  );
}