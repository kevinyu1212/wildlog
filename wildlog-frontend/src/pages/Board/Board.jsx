import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import useBoards from '../../hooks/useBoards';
import { useAuth } from '../../context/AuthContext';

export default function Board() {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState('latest');
  
  // URL 쿼리 파라미터에서 검색어 추출
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);

  // URL 파라미터가 변경될 때 search 상태 업데이트
  useEffect(() => {
    setSearch(queryParams.get('search') || '');
  }, [location.search]);

  const { boards } = useBoards();

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ 
        category: category === '전체' ? '' : category, 
        sort, 
        search 
      }).toString();
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">Category Archive</span>
            <h1 className="text-2xl md:text-4xl font-bold text-white">{category} 게시판</h1>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-56">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input 
                type="text" 
                placeholder="검색..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800/60 p-3 pl-10 rounded-xl text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800/60">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                리스트
              </button>
              <button 
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'card' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <svg className="w-3.5 h-3.5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                카드
              </button>
            </div>

            {/* Write Button */}
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  navigate(`/write?category=${encodeURIComponent(category)}`);
                } else {
                  navigate('/login', { state: { from: `/write?category=${encodeURIComponent(category)}` } });
                }
              }}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 transition-all text-white flex items-center gap-2 justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              기록하기
            </button>
          </div>
        </div>

        {/* Sort & Count */}
        <div className="flex justify-between items-center mb-6 px-1">
          <div className="flex gap-4 md:gap-6 text-xs font-bold">
             {[
               { id: 'latest', name: '최신순' },
               { id: 'likes', name: '좋아요순' },
               { id: 'comments', name: '댓글순' },
               { id: 'views', name: '조회수순' }
             ].map(s => (
               <button 
                 key={s.id} 
                 onClick={() => setSort(s.id)}
                 className={`transition-colors ${
                   sort === s.id 
                     ? 'text-emerald-400 border-b-2 border-emerald-400 pb-1' 
                     : 'text-slate-500 hover:text-slate-300'
                 }`}
               >
                 {s.name}
               </button>
             ))}
          </div>
          <p className="text-xs text-slate-600">총 <span className="text-slate-300 font-bold">{posts.length}</span>개의 기록</p>
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-slate-900/80 border border-slate-800/60 rounded-2xl md:rounded-[2.5rem] aspect-square animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          viewMode === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="bg-slate-900/80 border border-slate-800/60 rounded-2xl md:rounded-[2.5rem] overflow-hidden hover:border-emerald-500/30 transition-all group cursor-pointer shadow-xl shadow-black/20"
                >
                  <div className="aspect-[4/3] bg-slate-800/80 flex items-center justify-center text-slate-700 relative overflow-hidden">
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
                     <h3 className="text-base md:text-lg font-bold mb-3 group-hover:text-emerald-400 transition-colors line-clamp-1">{post.title}</h3>
                     <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-700 rounded-full overflow-hidden flex items-center justify-center">
                            {post.author_img ? <img src={post.author_img} alt="" /> : '👤'}
                          </div>
                          <span>{post.author}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1">❤️ {post.likes_count}</span>
                          <span className="flex items-center gap-1">💬 {post.comment_count}</span>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/30 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/60">
                      <th className="px-6 md:px-8 py-4">제목</th>
                      <th className="px-6 md:px-8 py-4 hidden md:table-cell">작성자</th>
                      <th className="px-6 md:px-8 py-4 text-center hidden md:table-cell">날짜</th>
                      <th className="px-6 md:px-8 py-4 text-center">인기</th>
                      <th className="px-6 md:px-8 py-4 text-right hidden md:table-cell">조회</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                     {posts.map(post => (
                       <tr 
                         key={post.id} 
                         onClick={() => navigate(`/post/${post.id}`)}
                         className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors cursor-pointer group"
                       >
                         <td className="px-6 md:px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-slate-800/80 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700/50">
                                {post.images && <img src={`http://localhost:5000/uploads/${JSON.parse(post.images)[0]}`} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold group-hover:text-emerald-400 transition-colors text-sm line-clamp-1">{post.title}</span>
                                <span className="text-[10px] text-slate-600 md:hidden block mt-0.5">{post.author} · {new Date(post.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                         </td>
                         <td className="px-6 md:px-8 py-5 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-slate-800 rounded-full flex-shrink-0"></div>
                              <span className="text-slate-400">{post.author}</span>
                            </div>
                         </td>
                         <td className="px-6 md:px-8 py-5 text-center text-slate-500 font-medium hidden md:table-cell">
                           {new Date(post.created_at).toLocaleDateString()}
                         </td>
                         <td className="px-6 md:px-8 py-5 text-center">
                            <div className="flex justify-center gap-3 text-xs font-bold">
                              <span className="text-pink-500">❤️ {post.likes_count}</span>
                              <span className="text-blue-400">💬 {post.comment_count}</span>
                            </div>
                         </td>
                         <td className="px-6 md:px-8 py-5 text-right text-slate-500 font-bold hidden md:table-cell">{post.views}</td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="py-20 md:py-32 text-center bg-slate-900/30 rounded-[2rem] md:rounded-[3rem] border border-dashed border-slate-800/60">
            <span className="text-5xl md:text-6xl mb-6 block">🍃</span>
            <p className="text-slate-500 font-bold text-sm md:text-base">아직 등록된 탐사 기록이 없습니다.</p>
            <button onClick={() => navigate('/write')} className="mt-6 text-emerald-400 text-sm font-bold hover:underline flex items-center justify-center gap-1">
              첫 기록 남기기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
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