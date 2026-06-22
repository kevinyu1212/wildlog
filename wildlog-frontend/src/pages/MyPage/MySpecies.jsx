import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

export default function MySpecies() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [species, setSpecies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const getSpecies = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/users/${user.id}/species`);
        const data = await res.json();
        setSpecies(data);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    getSpecies();
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
          <h1 className="text-2xl font-bold text-white">탐사 종수 ({species.length})</h1>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-900/80 animate-pulse rounded-2xl border border-slate-800/60" />)}</div>
        ) : species.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {species.map((sp, idx) => (
              <div key={idx} onClick={() => navigate(`/post/${sp.post_id}`)}
                className="bg-slate-900/80 border border-slate-800/60 p-5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-lg font-black text-slate-100 truncate group-hover:text-emerald-400 transition-colors">{sp.species_name}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{sp.category}</p>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-xl text-center">
                    <p className="text-[10px] text-slate-500">관찰</p>
                    <p className="text-sm font-bold text-emerald-400">{sp.count}회</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center text-[10px] text-slate-500">
                  <span>최초 관찰: {new Date(sp.first_seen).toLocaleDateString()}</span>
                  <span className="text-slate-600 group-hover:text-emerald-500 transition-colors">자세히 보기 →</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-600 border border-dashed border-slate-800/60 rounded-2xl">탐사한 종 기록이 없습니다.</div>
        )}
      </main>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} boards={boards} />
    </div>
  );
}
