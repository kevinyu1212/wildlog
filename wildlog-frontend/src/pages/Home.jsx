import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from '../components/Carousel';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000';

const categories = [
  { name: '포유류', icon: '🦁' },
  { name: '파충류', icon: '🦎' },
  { name: '양서류', icon: '🐸' },
  { name: '절지류', icon: '🕷️' },
  { name: '곤충', icon: '🐞' },
  { name: '어류', icon: '🐟' },
  { name: '식물', icon: '🌿' },
  { name: '균류', icon: '🍄' },
  { name: '기타', icon: '🔬' },
];

function getPostImageUrl(images) {
  if (!images) return null;
  try {
    const parsed = typeof images === 'string' ? JSON.parse(images) : images;
    const filename = Array.isArray(parsed) ? parsed[0] : parsed;
    return filename ? `${API_BASE}/uploads/${filename}` : null;
  } catch {
    return null;
  }
}

function getMissionProgress(mission) {
  if (!mission?.target_count) return 0;
  return Math.min(100, Math.round((mission.current_count / mission.target_count) * 100));
}

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const boards = categories.map(c => c.name);

  const [recentPosts, setRecentPosts] = useState([]);
  const [hotMission, setHotMission] = useState(null);
  const [topObservers, setTopObservers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setFetchError(false);
    try {
      const response = await fetch(`${API_BASE}/api/home/data`);
      const data = await response.json();

      if (response.ok) {
        setRecentPosts(data.recentPosts || []);
        setHotMission(data.hotMission || null);
        setTopObservers(data.topObservers || []);
      } else {
        setFetchError(true);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      setFetchError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWriteClick = () => {
    navigate(isLoggedIn ? '/write' : '/login');
  };

  const missionProgress = getMissionProgress(hotMission);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

      {/* 1-2. GNB */}
      <nav className="h-14 border-b border-slate-800/60 bg-slate-900/60 backdrop-blur-xl sticky top-16 z-[90] flex items-center justify-center gap-8 md:gap-16 text-sm font-bold">
        {[
          { name: '미션', path: '/missions', icon: '🎯' },
          { name: '관찰자', path: '/observers', icon: '🔭' },
          { name: '생물 지도', path: '/map', icon: '🗺️' },
        ].map(item => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-2 hover:text-emerald-400 transition-colors relative group py-1"
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.name}</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all group-hover:w-full rounded-full" />
          </button>
        ))}
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 space-y-12">
        {/* 1-4. 캐러셀 */}
        <section className="animate-slide-up">
          <Carousel />
        </section>

        {/* 1-5. 퀵 카테고리 네비게이터 */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full" />
              <h2 className="text-lg font-bold text-slate-300">분류군별 탐사하기</h2>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3 md:gap-4">
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => navigate(`/board/${cat.name}`)}
                className="flex flex-col items-center gap-2 p-4 md:p-5 bg-slate-900/80 border border-slate-800/60 rounded-2xl hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all group"
              >
                <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <span className="text-[10px] md:text-xs font-medium text-slate-500 group-hover:text-emerald-400 transition-colors">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 1-6. 홈 메인 콘텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* 실시간 최신 관찰 피드 */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full" />
                <h2 className="text-xl font-bold text-slate-200">📸 실시간 최신 관찰 피드</h2>
              </div>
              <button
                onClick={() => navigate('/board/전체')}
                className="text-xs text-slate-500 hover:text-emerald-400 transition-colors font-medium flex items-center gap-1"
              >
                전체보기
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {fetchError && (
              <div className="p-4 bg-red-900/20 border border-red-900/40 rounded-xl text-sm text-red-300 flex items-center justify-between">
                <span>데이터를 불러오지 못했습니다.</span>
                <button onClick={fetchHomeData} className="text-xs font-bold text-red-200 hover:text-white">다시 시도</button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-fr min-h-[320px] md:min-h-[420px]">
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square bg-slate-900/80 rounded-2xl border border-slate-800/60 animate-pulse" />
                ))
              ) : recentPosts.length > 0 ? (
                recentPosts.map(post => {
                  const imageUrl = getPostImageUrl(post.images);
                  return (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="relative aspect-square bg-slate-900/80 rounded-2xl border border-slate-800/60 overflow-hidden cursor-pointer group hover:border-emerald-500/30 transition-all"
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 md:p-4">
                        <span className="text-[10px] font-bold text-emerald-400">{post.category || '기타'}</span>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{post.title}</h4>
                        <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                          <span className="truncate">{post.author}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span>❤️ {post.likes_count || 0}</span>
                            <span>💬 {post.comment_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 md:col-span-3 flex flex-col items-center justify-center text-slate-700 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800/60 py-16">
                  <span className="text-5xl mb-4 animate-float">🌱</span>
                  <p className="text-sm font-bold text-slate-600">첫 번째 관찰 기록을 기다리고 있습니다.</p>
                  <button
                    onClick={handleWriteClick}
                    className="mt-4 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    첫 기록 남기기 →
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* 핫 미션 & 랭킹 */}
          <aside className="space-y-6">
            <section className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">🔥</span>
                <h2 className="text-lg font-bold text-orange-400">핫 미션</h2>
              </div>
              {hotMission ? (
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-bold text-slate-200">{hotMission.title}</p>
                    <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                      LIVE
                    </span>
                  </div>
                  {hotMission.description && (
                    <p className="text-[11px] text-slate-500 mb-3 line-clamp-2">{hotMission.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>진행률 {missionProgress}%</span>
                      <span>{hotMission.current_count} / {hotMission.target_count}건</span>
                    </div>
                    <div className="w-full bg-slate-700/50 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-1000 shadow-lg shadow-orange-500/20"
                        style={{ width: `${missionProgress}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/missions')}
                    className="mt-4 w-full bg-slate-700/50 hover:bg-slate-700 py-2 rounded-lg text-xs font-bold text-slate-300 transition-all border border-slate-600/30"
                  >
                    미션 참여하기
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-xs text-slate-600">진행 중인 미션이 없습니다.</p>
                </div>
              )}
            </section>

            <section className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/60 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">🏆</span>
                <h2 className="text-lg font-bold text-yellow-400">이달의 우수 관찰자 TOP 3</h2>
              </div>
              {topObservers.length > 0 ? (
                <div className="space-y-3">
                  {topObservers.map((observer, idx) => (
                    <div
                      key={observer.id}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer hover:bg-slate-800/50 ${
                        idx === 0 ? 'bg-yellow-500/5 border border-yellow-500/10' : ''
                      }`}
                      onClick={() => navigate('/observers')}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 text-center font-bold text-sm flex-shrink-0 ${
                          idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : 'text-orange-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="w-9 h-9 bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {observer.profile_image ? (
                            <img src={`${API_BASE}/uploads/${observer.profile_image}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-slate-200 block truncate">{observer.username}</span>
                          <p className="text-[10px] text-slate-500">
                            {observer.species_count || 0}종 · {observer.records || 0}건
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-xs text-slate-600">이번 달 관찰 기록이 아직 없습니다.</p>
                </div>
              )}
            </section>
          </aside>
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
