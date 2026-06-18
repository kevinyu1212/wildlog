import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

export default function Mission() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-1.5 h-7 bg-gradient-to-b from-orange-500 to-orange-400 rounded-full"></span>
              <h1 className="text-2xl md:text-4xl font-bold text-white">탐사 미션 센터</h1>
            </div>
            <p className="text-slate-500 font-medium ml-5">야생의 부름에 응답하고 보상을 획득하세요.</p>
          </div>
          <button className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95 text-white flex items-center gap-2 justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            미션 만들기
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-slate-900/80 border border-slate-800/60 rounded-[2.5rem] h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {missions.map(mission => {
              const progress = Math.round((mission.current_count / mission.target_count) * 100);
              return (
                <div 
                  key={mission.id} 
                  className="bg-slate-900/80 border border-slate-800/60 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                >
                  {/* Background gradient decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-2xl flex items-center justify-center text-xl border border-orange-500/10">
                          🎯
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{mission.title}</h2>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{mission.category || '전체'}</p>
                        </div>
                      </div>
                      <span className="bg-slate-800/80 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-700/50 uppercase tracking-widest whitespace-nowrap">
                        진행중
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">{mission.description}</p>

                    {/* Progress */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>진행률 {progress}%</span>
                        <span className="text-emerald-400">{mission.current_count}건 / {mission.target_count}건</span>
                      </div>
                      <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-slate-700/30">
                        <div 
                          className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out shadow-lg shadow-emerald-500/10" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Rewards & Deadline */}
                    <div className="flex flex-wrap items-center gap-6 mb-6 py-4 border-t border-slate-800/40">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 text-xs font-bold uppercase tracking-tighter">보상</span>
                        <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                          {mission.reward || '1,000 pt'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 text-xs font-bold uppercase tracking-tighter">마감</span>
                        <span className="text-sm font-bold text-slate-300">
                          {mission.end_date ? new Date(mission.end_date).toLocaleDateString() : '상시 진행'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 py-4 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.99] text-white">
                      이 미션에 참여하기
                    </button>
                  </div>
                </div>
              );
            })}
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