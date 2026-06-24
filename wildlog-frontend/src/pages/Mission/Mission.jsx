import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import useBoards from '../../hooks/useBoards';
import { useAuth } from '../../context/AuthContext';

export default function Mission() {
  const navigate = useNavigate();
  const { boards } = useBoards();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/missions');
      const data = await response.json();
      setMissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgress = (mission) => {
    const target = Number(mission.target_count) || 0;
    if (target <= 0) return 0;
    const count = Number(mission.post_count) || 0;
    return Math.min(100, Math.round((count / target) * 100));
  };

  const getMissionTags = (mission) => (
    String(mission.tags || '')
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
      .slice(0, 4)
  );

  const startMission = (mission) => {
    const params = new URLSearchParams();
    params.set('mission_id', mission.id);
    if (mission.category) params.set('category', mission.category);
    navigate(`/write?${params.toString()}`);
  };

  const deleteMission = async (e, mission) => {
    e.stopPropagation();
    if (!window.confirm(`"${mission.title}" 미션을 삭제하시겠습니까?\n관련 게시글은 유지되지만 미션 연결이 해제됩니다.`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/missions/${mission.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id })
      });
      if (res.ok) {
        setMissions(prev => prev.filter(m => m.id !== mission.id));
      } else {
        const data = await res.json();
        alert(data.error || '삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-1.5 h-7 bg-gradient-to-b from-orange-500 to-orange-400 rounded-full"></span>
              <h1 className="text-2xl md:text-4xl font-bold text-white">탐사 미션 센터</h1>
            </div>
            <p className="text-slate-500 font-medium ml-5">공동 관찰 목표에 참여하고 생태 기록을 함께 완성하세요.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/missions/new')}
            className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95 text-white flex items-center gap-2 justify-center"
          >
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
        ) : missions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {missions.map(mission => {
              const progress = getProgress(mission);
              const tags = getMissionTags(mission);
              const isComplete = progress >= 100;

              return (
                <div
                  key={mission.id}
                  className="bg-slate-900/80 border border-slate-800/60 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start gap-4 mb-6">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-2xl flex items-center justify-center border border-orange-500/10 flex-shrink-0">
                          <svg className="w-6 h-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-xl md:text-2xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-2">{mission.title}</h2>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{mission.category || '전체'}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-widest whitespace-nowrap ${
                        isComplete
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700/50'
                      }`}>
                        {isComplete ? '완료' : '진행 중'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-3">{mission.description}</p>

                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {tags.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>참여 현황 {progress}%</span>
                        <span className="text-emerald-400">{mission.post_count || 0}건 / {mission.target_count}건</span>
                      </div>
                      <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-slate-700/30">
                        <div
                          className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out shadow-lg shadow-emerald-500/10"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 mb-6 py-4 border-t border-slate-800/40">
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
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 text-xs font-bold uppercase tracking-tighter">참여자</span>
                        <span className="text-sm font-bold text-slate-300">{mission.participant_count || 0}명</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => startMission(mission)}
                        disabled={isComplete}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.99] text-white"
                      >
                        {isComplete ? '목표 달성 완료' : '참여하기'}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/missions/${mission.id}/archive`)}
                        className="px-5 py-4 rounded-2xl text-sm font-bold transition-all border border-slate-700/50 text-slate-300 hover:bg-slate-800 hover:border-emerald-500/30 flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                        아카이브
                      </button>
                      {user && Number(user.id) === Number(mission.created_by) && (
                        <button
                          type="button"
                          onClick={(e) => deleteMission(e, mission)}
                          className="px-4 py-4 rounded-2xl text-sm font-bold transition-all border border-red-900/30 text-red-400/60 hover:bg-red-900/20 hover:border-red-500/40 hover:text-red-400 flex items-center gap-1.5"
                          title="미션 삭제"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 md:py-28 text-center bg-slate-900/30 rounded-[2rem] md:rounded-[3rem] border border-dashed border-slate-800/60">
            <span className="text-5xl md:text-6xl mb-6 block">＋</span>
            <p className="text-slate-400 font-bold text-sm md:text-base mb-2">진행 중인 미션이 없습니다.</p>
            <p className="text-slate-600 text-xs mb-6">첫 미션을 만들어 관찰 기록을 모아보세요.</p>
            <button
              type="button"
              onClick={() => navigate('/missions/new')}
              className="bg-emerald-600 hover:bg-emerald-500 px-5 py-3 rounded-xl text-sm font-bold text-white transition-colors"
            >
              미션 만들기
            </button>
          </div>
        )}
      </main>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} boards={boards} />
      <Footer />
    </div>
  );
}
