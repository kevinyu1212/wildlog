import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

export default function Mission() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/missions');
      const data = await response.json();
      setMissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">탐사 미션 센터</h1>
            <p className="text-slate-500 font-medium">야생의 부름에 응답하고 보상을 획득하세요.</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-900/30 transition-all active:scale-95">
            + 미션 만들기
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {missions.map(mission => (
              <div key={mission.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <span className="bg-slate-800 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full border border-slate-700 uppercase tracking-widest">{mission.category || '기타'}</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-100 mb-2 group-hover:text-emerald-400 transition-colors">{mission.title}</h2>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-md">{mission.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>진행률 {Math.round((mission.current_count / mission.target_count) * 100)}%</span>
                      <span>{mission.current_count}건 달성</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(mission.current_count / mission.target_count) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs font-black uppercase tracking-tighter">보상</span>
                      <span className="text-sm font-bold text-emerald-400">{mission.reward || '1,000 pt'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-xs font-black uppercase tracking-tighter">마감</span>
                      <span className="text-sm font-bold text-slate-300">{mission.end_date ? new Date(mission.end_date).toLocaleDateString() : '상시 진행'}</span>
                    </div>
                  </div>

                  <button className="w-full bg-slate-800 hover:bg-emerald-600 py-4 rounded-2xl text-sm font-black transition-all group-hover:shadow-lg">
                     이 미션에 참여하기
                  </button>
                </div>
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
