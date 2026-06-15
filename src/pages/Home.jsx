import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';

export default function Home() {
  const navigate = useNavigate();
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900 sticky top-0 z-50">
        <div onClick={() => navigate('/')} className="text-xl font-bold text-emerald-400 cursor-pointer">🐾 WildLog</div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/favorites')} className="text-xl">⭐</button>
          <button onClick={() => navigate('/notifications')} className="text-xl relative">🔔</button>
          <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="text-2xl">☰</button>
        </div>
      </header>

      <nav className="h-12 border-b border-slate-800 flex items-center gap-8 px-6 bg-slate-900/50 text-sm font-medium">
        <button onClick={() => navigate('/missions')} className="hover:text-emerald-400">미션</button>
        <button onClick={() => navigate('/observers')} className="hover:text-emerald-400">관찰자</button>
        <button onClick={() => navigate('/map')} className="hover:text-emerald-400">생물 지도</button>
      </nav>

      <div className="flex flex-1 relative">
        <main className="flex-1 p-8 overflow-y-auto">
          <Carousel />
          <section className="mt-8 grid grid-cols-3 md:grid-cols-9 gap-2">
            {boards.map(b => <button key={b} onClick={() => navigate(`/board/${b}`)} className="p-4 bg-slate-900 border border-slate-800 rounded-lg hover:border-emerald-500 text-xs font-bold text-slate-400">{b}</button>)}
          </section>
          <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="md:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800 min-h-[300px]">실시간 최신 관찰 피드</div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">핫 미션 & 랭킹</div>
          </section>
        </main>

        {isRightSidebarOpen && (
          <aside className="w-72 bg-slate-900 border-l border-slate-800 p-6 shadow-2xl">
            <h4 className="font-bold mb-4 border-b border-slate-700 pb-2">메뉴</h4>
            {boards.map(b => <button key={b} onClick={() => navigate(`/board/${b}`)} className="block w-full text-left py-2 text-sm text-slate-400 hover:text-emerald-400">{b} 게시판</button>)}
          </aside>
        )}
      </div>

      {/* 1-7. 푸터 */}
      <footer className="border-t border-slate-800 bg-slate-900 p-8 text-center text-slate-500 text-xs">
        <div className="flex justify-center gap-6 mb-4">
          <button onClick={() => navigate('/terms')}>이용약관</button>
          <button onClick={() => navigate('/about')}>사이트 소개</button>
          <button onClick={() => navigate('/privacy')}>개인정보처리방침</button>
          <button onClick={() => navigate('/guide')}>이용안내</button>
        </div>
        <p>© 2026 WildLog Project. All rights reserved.</p>
      </footer>
    </div>
  );
}