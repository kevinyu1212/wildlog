import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function MyGallery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState('전체');
  const [sort, setSort] = useState('latest');
  const [dateFilter, setDateFilter] = useState('all');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const categories = ['전체', '포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  const sortOptions = [
    { id: 'latest', name: '최신순' },
    { id: 'oldest', name: '오래된순' },
    { id: 'name', name: '가나다순' },
    { id: 'likes', name: '좋아요 많은 순' },
  ];

  const dateOptions = [
    { id: 'all', name: '전체' },
    { id: 'today', name: '오늘' },
    { id: 'week', name: '지난 1주일' },
    { id: 'month', name: '지난 달' },
    { id: '6months', name: '지난 6개월' },
  ];

  const getDateRange = (filterId) => {
    const now = new Date();
    switch (filterId) {
      case 'today': return { start: now.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
      case 'week': {
        const start = new Date(now); start.setDate(start.getDate() - 7);
        return { start: start.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
      }
      case 'month': {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return { start: start.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
      }
      case '6months': {
        const start = new Date(now); start.setMonth(start.getMonth() - 6);
        return { start: start.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
      }
      default: return {};
    }
  };

  const getMyGalleryPosts = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      let query = `?sort=${sort}`;
      if (filter !== '전체') query += `&category=${filter}`;
      const dateRange = getDateRange(dateFilter);
      if (dateRange.start) query += `&start_date=${dateRange.start}&end_date=${dateRange.end}`;

      const response = await fetch(`http://localhost:5000/api/users/${user.id}/posts${query}`);
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error('Gallery fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMyGalleryPosts();
  }, [user?.id, filter, sort, dateFilter]);

  return (
    <div className="space-y-8 animate-slide-up h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">내 관찰 갤러리</h2>
        <p className="text-slate-500 text-sm font-medium">직접 수집한 생태 아카이브입니다.</p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-4">
        {/* Sort & Date */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mr-1">정렬</span>
          {sortOptions.map(s => (
            <button key={s.id} onClick={() => setSort(s.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border whitespace-nowrap ${
                sort === s.id ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900/50 border-slate-800/60 text-slate-500 hover:border-slate-600'
              }`}>{s.name}</button>
          ))}
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mx-1 ml-3">기간</span>
          {dateOptions.map(d => (
            <button key={d.id} onClick={() => setDateFilter(d.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border whitespace-nowrap ${
                dateFilter === d.id ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900/50 border-slate-800/60 text-slate-500 hover:border-slate-600'
              }`}>{d.name}</button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 md:px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                filter === cat ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30' : 'bg-slate-900/50 border-slate-800/60 text-slate-500 hover:border-slate-600 hover:text-slate-300'
              }`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-square bg-slate-900/80 rounded-2xl md:rounded-[2rem] animate-pulse border border-slate-800/60" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
          {posts.map(post => {
            const images = post.images ? JSON.parse(post.images) : [];
            return (
              <div key={post.id} 
                className="group relative aspect-square bg-slate-900/80 rounded-2xl md:rounded-[2.5rem] border border-slate-800/60 overflow-hidden cursor-pointer hover:border-emerald-500/40 transition-all shadow-xl"
                onClick={() => navigate(`/post/${post.id}`)}>
                {images[0] ? (
                  <img src={`http://localhost:5000/uploads/${images[0]}`} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159m0 0l-1.409-1.409m1.409 1.409L6 15.75m9-9l5.159 5.159m0 0l-1.409 1.409m1.409-1.409L18 9.75" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 md:p-6 flex flex-col justify-end">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">{post.category}</p>
                  <h4 className="text-xs md:text-sm font-bold text-white line-clamp-1">{post.title}</h4>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                    <span>❤️ {post.likes_count || 0}</span>
                    <span>💬 {post.comment_count || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-700 border-2 border-dashed border-slate-800/60 rounded-[2rem] md:rounded-[3rem] py-16 md:py-20">
          <span className="text-5xl md:text-6xl mb-6">🏜️</span>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">No Data Found</p>
          <p className="text-[10px] font-medium mt-2 text-slate-700">해당 조건의 기록이 존재하지 않습니다.</p>
        </div>
      )}
    </div>
  );
}