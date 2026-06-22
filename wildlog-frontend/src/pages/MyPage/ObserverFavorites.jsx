import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

export default function ObserverFavorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const getFavorites = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`http://localhost:5000/api/users/${user.id}/favorites`);
        const data = await res.json();
        setFavorites(data);
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    getFavorites();
  }, [user?.id]);

  const getProfileImgUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `http://localhost:5000/uploads/${image}`;
  };

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
          <h1 className="text-2xl font-bold text-white">즐겨찾기한 관찰자 ({favorites.length})</h1>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-900/80 animate-pulse rounded-2xl border border-slate-800/60" />)}</div>
        ) : favorites.length > 0 ? (
          <div className="space-y-3">
            {favorites.map(fav => (
              <div key={fav.id} onClick={() => navigate(`/observer/${fav.username}`)}
                className="bg-slate-900/80 border border-slate-800/60 p-5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border border-slate-700">
                  {getProfileImgUrl(fav.profile_image) ? (
                    <img src={getProfileImgUrl(fav.profile_image)} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate">{fav.username}</p>
                  <p className="text-[10px] text-slate-500 mt-1">기록 {fav.records} · 탐사종수 {fav.species}</p>
                </div>
                <span className="text-xs text-emerald-500 font-bold border border-emerald-500/30 px-3 py-1 rounded-full">프로필 보기</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-600 border border-dashed border-slate-800/60 rounded-2xl">즐겨찾기한 관찰자가 없습니다.</div>
        )}
      </main>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} boards={boards} />
    </div>
  );
}
