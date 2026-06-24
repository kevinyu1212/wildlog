import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import useBoards from '../../hooks/useBoards';

export default function MissionArchive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { boards } = useBoards();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mission, setMission] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMissionAndPosts();
  }, [id]);

  const fetchMissionAndPosts = async () => {
    try {
      const [missionRes, postsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/missions/${id}`),
        fetch(`http://localhost:5000/api/missions/${id}/posts`)
      ]);
      if (missionRes.ok) setMission(await missionRes.json());
      if (postsRes.ok) setPosts(await postsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgress = (m) => {
    const target = Number(m?.target_count) || 0;
    if (target <= 0) return 0;
    const count = Number(m?.post_count) || 0;
    return Math.min(100, Math.round((count / target) * 100));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
          <div className="h-96 bg-slate-900/50 rounded-[2rem] animate-pulse border border-slate-800/60" />
        </main>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
          <div className="py-20 text-center">
            <span className="text-6xl block mb-6">🔍</span>
            <p className="text-slate-400 font-bold">미션을 찾을 수 없습니다.</p>
            <button onClick={() => navigate('/missions')} className="mt-6 text-emerald-400 text-sm font-bold hover:underline">
              미션 목록으로 돌아가기
            </button>
          </div>
        </main>
      </div>
    );
  }

  const progress = getProgress(mission);
  const isComplete = progress >= 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/missions')} 
          className="text-slate-500 hover:text-white transition-colors text-xs font-bold flex items-center gap-2 group mb-6"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          미션 목록으로
        </button>

        {/* Mission Header */}
        <div className="bg-slate-900/80 border border-slate-800/60 rounded-[2rem] p-6 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-2xl flex items-center justify-center border border-orange-500/10 flex-shrink-0">
                  <svg className="w-7 h-7 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold text-white">{mission.title}</h1>
                  <p className="text-sm text-slate-500 font-medium mt-1">{mission.category || '전체'} · 미션 아카이브</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-4 py-1.5 rounded-full border uppercase tracking-widest whitespace-nowrap ${
                isComplete
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/50'
              }`}>
                {isComplete ? '✅ 완료' : '🔄 진행 중'}
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed mb-6">{mission.description}</p>

            {/* Progress */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm font-bold text-slate-400">
                <span>미션 진행률 {progress}%</span>
                <span className="text-emerald-400">{mission.post_count || 0}건 / {mission.target_count}건</span>
              </div>
              <div className="w-full bg-slate-800/50 h-4 rounded-full overflow-hidden border border-slate-700/30">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out shadow-lg shadow-emerald-500/10"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-6 py-4 border-t border-slate-800/40">
              <div>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter block">보상</span>
                <span className="text-sm font-bold text-emerald-400">{mission.reward || '1,000 pt'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter block">마감</span>
                <span className="text-sm font-bold text-slate-300">
                  {mission.end_date ? new Date(mission.end_date).toLocaleDateString() : '상시 진행'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter block">참여자</span>
                <span className="text-sm font-bold text-slate-300">{mission.participant_count || 0}명</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter block">아카이브</span>
                <span className="text-sm font-bold text-slate-300">{mission.post_count || posts.length}개의 기록</span>
              </div>
            </div>
          </div>
        </div>

        {/* Archive Posts */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-white">📚 미션 기록 아카이브</h2>
            <span className="text-sm text-slate-500 font-medium">({posts.length}개)</span>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <div 
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="bg-slate-900/80 border border-slate-800/60 rounded-2xl md:rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all group cursor-pointer shadow-xl shadow-black/20"
                >
                  <div className="aspect-[4/3] bg-slate-800/80 flex items-center justify-center relative overflow-hidden">
                    {post.images ? (
                      <img 
                        src={`http://localhost:5000/uploads/${JSON.parse(post.images)[0]}`} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <svg className="w-12 h-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
                      <span className="text-white text-xs font-bold flex items-center gap-1">
                        자세히 보기
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-bold">
                        {post.category || '기타'}
                      </span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold mb-3 group-hover:text-emerald-400 transition-colors line-clamp-1">{post.title}</h3>
                    <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-700 rounded-full overflow-hidden flex items-center justify-center">
                          {post.author_img ? <img src={`http://localhost:5000/uploads/${post.author_img}`} alt="" /> : '👤'}
                        </div>
                        <span>{post.author}</span>
                      </div>
                      <div className="flex gap-3">
                        <span>❤️ {post.likes_count}</span>
                        <span>💬 {post.comment_count}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-3">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-900/30 rounded-[2rem] border border-dashed border-slate-800/60">
              <span className="text-5xl mb-6 block">📭</span>
              <p className="text-slate-500 font-bold text-sm md:text-base mb-2">아직 이 미션에 등록된 기록이 없습니다.</p>
              <p className="text-slate-600 text-xs mb-6">첫 번째 탐사 기록을 남겨 미션에 참여해보세요!</p>
              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set('mission_id', mission.id);
                  if (mission.category) params.set('category', mission.category);
                  navigate(`/write?${params.toString()}`);
                }}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all text-white"
              >
                이 미션에 참여하기
              </button>
            </div>
          )}
        </div>
      </main>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} boards={boards} />
      <Footer />
    </div>
  );
}