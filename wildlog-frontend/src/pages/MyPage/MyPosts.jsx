import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

export default function MyPosts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    console.log('MyPosts Mount - user:', user);
    const getMyPosts = async () => {
      try {
        console.log('Calling API: GET /api/users/' + user.id + '/posts');
        const res = await fetch(`http://localhost:5000/api/users/${user.id}/posts?sort=latest`);
        const data = await res.json();
        console.log('My posts data received:', data);
        setPosts(data);
      } catch (err) { console.error('Fetch error in MyPosts:', err); }
      finally { setIsLoading(false); }
    };
    if (user?.id) getMyPosts();
    else console.warn('MyPosts: No user ID found, skipping fetch');
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
          <h1 className="text-2xl font-bold text-white">내가 쓴 글 ({posts.length})</h1>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-900/80 animate-pulse rounded-2xl border border-slate-800/60" />)}</div>
        ) : posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} onClick={() => navigate(`/post/${post.id}`)}
                className="bg-slate-900/80 border border-slate-800/60 p-5 rounded-2xl hover:border-emerald-500/30 transition-all cursor-pointer flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate">{post.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{post.category} · {new Date(post.created_at).toLocaleDateString()} · ❤️ {post.likes_count}</p>
                </div>
                <span className="text-xs text-slate-600">→</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-600 border border-dashed border-slate-800/60 rounded-2xl">작성한 게시글이 없습니다.</div>
        )}
      </main>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} boards={boards} />
    </div>
  );
}
