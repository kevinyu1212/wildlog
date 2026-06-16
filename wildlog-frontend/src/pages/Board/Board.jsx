import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import useBoards from '../../hooks/useBoards';

export default function Board() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState('latest');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { boards } = useBoards();

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ category, sort, search }).toString();
      const response = await fetch(`http://localhost:5000/api/posts?${query}`);
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category, sort, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-2 block">Category Archive</span>
            <h1 className="text-4xl font-black text-white">{category} 게시판</h1>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
             <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="검색어 입력..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-3 pl-10 rounded-xl text-sm focus:border-emerald-500 outline-none transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">🔍</span>
             </div>
             <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  리스트
                </button>
                <button 
                  onClick={() => setViewMode('card')}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'card' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  카드
                </button>
             </div>
             <button 
               onClick={() => navigate('/write')}
               className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-emerald-900/20 transition-all"
             >
               탐사 기록하기
             </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8 px-2">
          <div className="flex gap-4 md:gap-6 text-xs font-bold text-slate-500">
             {[
               { id: 'latest', name: '최신순' },
               { id: 'likes', name: '좋아요순' },
               { id: 'comments', name: '댓글순' },
               { id: 'views', name: '조회수순' }
             ].map(s => (
               <button 
                 key={s.id} 
                 onClick={() => setSort(s.id)}
                 className={`hover:text-emerald-400 transition-colors ${sort === s.id ? 'text-emerald-400 underline underline-offset-8' : ''}`}
               >
                 {s.name}
               </button>
             ))}
          </div>
          <p className="text-xs text-slate-600">총 <span className="text-slate-300 font-bold">{posts.length}</span>개의 기록</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] aspect-square animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all group cursor-pointer shadow-xl shadow-black/20"
                >
                  <div className="aspect-[4/3] bg-slate-800 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform duration-500 relative overflow-hidden">
                     {post.images ? (
                       <img 
                        src={`http://localhost:5000/uploads/${JSON.parse(post.images)[0]}`} 
                        alt={post.title} 
                        className="w-full h-full object-cover"
                       />
                     ) : '이미지 없음'}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <span className="text-white text-xs font-bold">자세히 보기 →</span>
                     </div>
                  </div>
                  <div className="p-8">
                     <h3 className="text-lg font-bold mb-4 group-hover:text-emerald-400 transition-colors line-clamp-1">{post.title}</h3>
                     <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 bg-slate-700 rounded-full overflow-hidden flex items-center justify-center">
                              {post.author_img ? <img src={post.author_img} alt="" /> : '👤'}
                           </div>
                           <span>{post.author}</span>
                        </div>
                        <div className="flex gap-4">
                           <span className="flex items-center gap-1">❤️ {post.likes_count}</span>
                           <span className="flex items-center gap-1">💬 {post.comment_count}</span>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
               <table className="w-full text-left">
                  <thead className="bg-slate-800/30 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                     <tr>
                        <th className="px-8 py-5">제목</th>
                        <th className="px-8 py-5">작성자</th>
                        <th className="px-8 py-5 text-center">날짜</th>
                        <th className="px-8 py-5 text-center">인기</th>
                        <th className="px-8 py-5 text-right">조회</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm">
                     {posts.map(post => (
                       <tr 
                         key={post.id} 
                         onClick={() => navigate(`/post/${post.id}`)}
                         className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors cursor-pointer group"
                       >
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                   {post.images && <img src={`http://localhost:5000/uploads/${JSON.parse(post.images)[0]}`} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <span className="font-bold group-hover:text-emerald-400 transition-colors">{post.title}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-slate-800 rounded-full flex-shrink-0"></div>
                                <span>{post.author}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center text-slate-500 font-medium">
                            {new Date(post.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6 text-center">
                             <div className="flex justify-center gap-3 text-[11px] font-bold">
                                <span className="text-pink-500">❤️ {post.likes_count}</span>
                                <span className="text-blue-400">💬 {post.comment_count}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right text-slate-500 font-bold">{post.views}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )
        ) : (
          <div className="py-32 text-center bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800">
             <span className="text-6xl mb-6 block">🍃</span>
             <p className="text-slate-500 font-bold">아직 등록된 탐사 기록이 없습니다.</p>
             <button onClick={() => navigate('/write')} className="mt-6 text-emerald-400 text-sm font-black hover:underline">첫 기록 남기기 →</button>
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
