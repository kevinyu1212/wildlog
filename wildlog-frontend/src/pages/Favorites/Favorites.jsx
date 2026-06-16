import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

export default function Favorites() {
  const [activeTab, setActiveTab] = useState('posts'); // posts, observers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        <h1 className="text-3xl font-black text-white mb-8">즐겨찾기</h1>

        <div className="flex gap-4 mb-10 border-b border-slate-800 pb-px">
          {[
            { id: 'posts', name: '관찰 게시글', icon: '⭐' },
            { id: 'observers', name: '관찰자', icon: '🔭' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'posts' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all group">
                <div className="aspect-video bg-slate-800 flex items-center justify-center text-slate-700">관찰 사진 {i}</div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">포유류</span>
                    <button className="text-emerald-500">★</button>
                  </div>
                  <h3 className="font-bold text-slate-100 mb-4 group-hover:text-emerald-400 transition-colors">지리산 반달가슴곰 발견</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-slate-800 rounded-full"></div>
                    <span className="text-xs text-slate-500">아발란체</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex flex-col items-center text-center hover:bg-slate-900 transition-all border-dashed">
                <div className="w-20 h-20 bg-slate-800 rounded-full mb-4 border-2 border-emerald-500/20"></div>
                <h3 className="font-bold text-slate-100">전문 관찰자 {i}</h3>
                <p className="text-[10px] text-slate-500 mb-4">파충류 전문 탐사원</p>
                <button className="text-[10px] font-black text-emerald-400 border border-emerald-400/30 px-3 py-1 rounded-full hover:bg-emerald-400 hover:text-white transition-all">방문하기</button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        boards={boards}
      />
    </div>
  );
}
