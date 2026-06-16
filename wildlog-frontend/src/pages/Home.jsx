import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';

export default function Home() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];
  
  const categories = [
    { name: '포유류', icon: '🦁' },
    { name: '파충류', icon: '🦎' },
    { name: '양서류', icon: '🐸' },
    { name: '절지류', icon: '🕷️' },
    { name: '곤충', icon: '🐞' },
    { name: '어류', icon: '🐟' },
    { name: '식물', icon: '🌿' },
    { name: '균류', icon: '🍄' },
    { name: '기타', icon: '❓' },
  ];

  const [recentPosts, setRecentPosts] = useState([]);
  const [hotMission, setHotMission] = useState(null);
  const [topObservers, setTopObservers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/home/data');
      const data = await response.json();
      
      if (response.ok) {
        setRecentPosts(data.recentPosts || []);
        setHotMission(data.hotMission);
        setTopObservers(data.topObservers || []);
      } else {
        console.error('Backend Error:', data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      {/* 1-2. GNB */}
      <nav className="h-14 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-16 z-[90] flex items-center justify-center gap-12 text-sm font-bold">
        {[
          { name: '미션', path: '/mission' },
          { name: '관찰자', path: '/observer' },
          { name: '생물 지도', path: '/map' }
        ].map(item => (
          <button 
            key={item.name} 
            onClick={() => navigate(item.path)}
            className="hover:text-emerald-400 transition-colors relative group"
          >
            {item.name}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-400 transition-all group-hover:w-full"></span>
          </button>
        ))}
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* 1-4. 캐러셀 */}
        <section className="mb-12">
          <Carousel />
        </section>

        {/* 1-5. 퀵 카테고리 네비게이터 */}
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-6 text-slate-400 flex items-center gap-2">
            <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
            분류군별 탐사하기
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4">
            {categories.map(cat => (
              <button 
                key={cat.name} 
                onClick={() => navigate(`/board/${cat.name}`)}
                className="flex flex-col items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-800 transition-all group"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-xs font-medium text-slate-400 group-hover:text-emerald-400">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 1-6. 홈 메인 콘텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                📸 실시간 최신 관찰 피드
              </h2>
              <button onClick={() => navigate('/board/전체')} className="text-xs text-slate-500 hover:text-emerald-400">전체보기 +</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-[500px]">
               {isLoading ? (
                 [1,2,3,4,5,6].map(i => <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />)
               ) : recentPosts.length > 0 ? (
                 recentPosts.map(post => (
                   <div 
                    key={post.id} 
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="relative bg-slate-900 rounded-xl border border-slate-800 overflow-hidden cursor-pointer group"
                   >
                      {post.images ? (
                        <img 
                          src={`http://localhost:5000/uploads/${JSON.parse(post.images)[0]}`} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">No Img</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                         <p className="text-xs font-bold text-emerald-400">{post.category}</p>
                         <h4 className="text-sm font-bold text-white line-clamp-1">{post.title}</h4>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="col-span-3 flex flex-col items-center justify-center text-slate-700 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                    <span className="text-4xl mb-4">🍃</span>
                    <p className="text-sm font-bold">첫 번째 관찰 기록을 기다리고 있습니다.</p>
                 </div>
               )}
            </div>
          </section>

          <aside className="space-y-8">
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-400">
                🔥 핫 미션
              </h2>
              <div className="space-y-4">
                {hotMission ? (
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-sm font-bold mb-1">{hotMission.title}</p>
                    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full transition-all duration-1000" 
                        style={{ width: `${(hotMission.current_count / hotMission.target_count) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-right mt-1 text-slate-500">
                      {Math.round((hotMission.current_count / hotMission.target_count) * 100)}% 달성
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600">진행 중인 미션이 없습니다.</p>
                )}
              </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-400">
                🏆 이달의 우수 관찰자
              </h2>
              <div className="space-y-4">
                {topObservers.length > 0 ? (
                  topObservers.map((user, idx) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-5 text-center font-bold ${idx === 0 ? 'text-yellow-400' : 'text-slate-500'}`}>{idx + 1}</span>
                        <div className="w-8 h-8 bg-slate-800 rounded-full border border-slate-700 overflow-hidden flex items-center justify-center">
                          {user.profile_image ? (
                            <img src={`http://localhost:5000/uploads/${user.profile_image}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">👤</span>
                          )}
                        </div>
                        <span className="text-sm">{user.username}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{user.score} pt</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-600">등록된 관찰자가 없습니다.</p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        boards={boards}
      />

      {/* 1-7. 푸터 */}
      <footer className="border-t border-slate-900 bg-slate-900/30 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-sm text-slate-400">
            {['이용약관', '사이트 소개', '개인정보처리방침', '이용안내', '모바일버전'].map(t => (
              <button key={t} className="hover:text-emerald-400 transition-colors">{t}</button>
            ))}
          </div>
          <div className="text-center">
             <p className="text-emerald-500 font-bold text-lg mb-2">🐾 WildLog</p>
             <p className="text-xs text-slate-600">© 2026 WildLog Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
