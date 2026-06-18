import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function Favorites() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favPosts, setFavPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchFavorites();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, user]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/${user.id}`);
      const data = await response.json();
      setFavPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfavorite = async (e, postId) => {
    e.stopPropagation();
    try {
      const response = await fetch('http://localhost:5000/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, post_id: postId }),
      });
      if (response.ok) {
        setFavPosts(favPosts.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <span className="text-6xl mb-6">🔒</span>
        <p className="text-slate-400 font-medium mb-6">로그인이 필요한 서비스입니다.</p>
        <button onClick={() => navigate('/login')} className="bg-emerald-600 px-8 py-3 rounded-xl font-bold">로그인하러 가기</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1.5 h-7 bg-gradient-to-b from-yellow-500 to-yellow-400 rounded-full"></span>
            <h1 className="text-2xl md:text-3xl font-bold text-white">즐겨찾기</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium ml-5">관심 있는 관찰 기록과 탐사 대원을 저장하세요.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-10 border-b border-slate-800/60">
          {[
            { id: 'posts', name: '관찰 게시글', icon: '⭐' },
            { id: 'observers', name: '관찰자', icon: '🔭' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? 'text-yellow-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'posts' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map(i => <div key={i} className="aspect-[4/3] bg-slate-900/50 animate-pulse rounded-2xl" />)
            ) : favPosts.length > 0 ? (
              favPosts.map(post => {
                const images = post.images ? JSON.parse(post.images) : [];
                return (
                  <div key={post.id} onClick={() => navigate(`/post/${post.id}`)} className="bg-slate-900/80 border border-slate-800/60 rounded-2xl md:rounded-3xl overflow-hidden hover:border-yellow-500/30 transition-all group cursor-pointer">
                    <div className="aspect-[4/3] bg-slate-800/80 flex items-center justify-center text-slate-700 relative overflow-hidden">
                      {images[0] ? (
                        <img src={`http://localhost:5000/uploads/${images[0]}`} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <svg className="w-12 h-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">{post.category}</span>
                        <button onClick={(e) => handleUnfavorite(e, post.id)} className="text-yellow-400 hover:scale-110 transition-transform">★</button>
                      </div>
                      <h3 className="font-bold text-slate-100 mb-4 group-hover:text-yellow-400 transition-colors line-clamp-1">{post.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">탐사 기록 확인하기 →</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800/60 rounded-[3rem]">
                <p className="text-slate-600">즐겨찾기한 게시글이 없습니다.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-slate-800/60 rounded-[3rem]">
            <p className="text-slate-600">추후 업데이트 예정입니다.</p>
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