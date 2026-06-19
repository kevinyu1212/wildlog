import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const userRes = await fetch(`http://localhost:5000/api/users/profile/${username}`);
      if (!userRes.ok) throw new Error('User not found');
      const userData = await userRes.json();
      setUser(userData);

      const postsRes = await fetch(`http://localhost:5000/api/users/username/${username}/posts`);
      const postsData = await postsRes.json();
      setPosts(postsData);
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        {/* Profile Header */}
        <div className="bg-slate-900/50 border border-slate-800/60 rounded-[2.5rem] p-8 md:p-12 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-800 rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl">
              {user.profile_image ? (
                <img src={`http://localhost:5000/uploads/${user.profile_image}`} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{user.username}</h1>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-[0.2em] self-center md:self-auto">
                  Elite Explorer
                </span>
              </div>
              <p className="text-slate-500 font-medium mb-8">탐사 시작일: {new Date(user.joined_at).toLocaleDateString()}</p>
              
              <div className="grid grid-cols-3 gap-8 md:gap-16 border-t border-slate-800/60 pt-8">
                <div>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">총 기록</p>
                  <p className="text-2xl font-bold text-white">{user.records}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">관찰 종수</p>
                  <p className="text-2xl font-bold text-white">{user.species}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">활동 점수</p>
                  <p className="text-2xl font-bold text-emerald-400">{(user.records * 100).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">탐사 아카이브</h2>
            <p className="text-slate-500 text-sm font-medium">{user.username} 대원이 수집한 데이터입니다.</p>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {posts.map(post => {
                const images = post.images ? JSON.parse(post.images) : [];
                return (
                  <div key={post.id} 
                    className="group relative aspect-square bg-slate-900 border border-slate-800/60 rounded-3xl overflow-hidden cursor-pointer hover:border-emerald-500/40 transition-all shadow-xl"
                    onClick={() => navigate(`/post/${post.id}`)}>
                    {images[0] ? (
                      <img src={`http://localhost:5000/uploads/${images[0]}`} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159m0 0l-1.409-1.409m1.409 1.409L6 15.75m9-9l5.159 5.159m0 0l-1.409 1.409m1.409-1.409L18 9.75" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">{post.category}</p>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{post.title}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-800/60">
              <span className="text-5xl mb-6 block">🍃</span>
              <p className="text-slate-600 font-medium">아직 등록된 탐사 기록이 없습니다.</p>
            </div>
          )}
        </div>
      </main>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        boards={boards}
      />
      <Footer />
    </div>
  );
}