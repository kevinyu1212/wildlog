import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

export default function MyPoints() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pointData, setPointData] = useState({ points: 0, total_earned: 0 });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const getPointData = async () => {
      if (!user?.id) return;
      try {
        const [pointsRes, historyRes] = await Promise.all([
          fetch(`http://localhost:5000/api/users/${user.id}/points`),
          fetch(`http://localhost:5000/api/users/${user.id}/points/history`)
        ]);
        if (pointsRes.ok) setPointData(await pointsRes.json());
        if (historyRes.ok) setHistory(await historyRes.json());
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    getPointData();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/mypage')} className="text-slate-500 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">내 포인트</h1>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-900/80 animate-pulse rounded-2xl border border-slate-800/60" />)}</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 border border-emerald-500/30 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-emerald-400 font-bold mb-1 uppercase tracking-widest text-sm">보유 포인트</p>
                <div className="text-4xl md:text-5xl font-black text-white">{pointData.points.toLocaleString()}<span className="text-2xl text-emerald-500 ml-2">P</span></div>
              </div>
              <div className="bg-slate-900/50 px-6 py-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-xs text-slate-400 font-medium">총 누적 획득</p>
                  <p className="text-lg font-bold text-slate-200">{pointData.total_earned.toLocaleString()} P</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-6">
              <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                포인트 내역
              </h2>
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-sm font-bold text-slate-200">{item.description}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{new Date(item.created_at).toLocaleString()}</p>
                      </div>
                      <div className={`font-black text-lg flex-shrink-0 ${item.points > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {item.points > 0 ? '+' : ''}{item.points} P
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-600 font-medium">포인트 내역이 없습니다.</div>
              )}
            </div>
          </div>
        )}
      </main>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} boards={boards} />
    </div>
  );
}
