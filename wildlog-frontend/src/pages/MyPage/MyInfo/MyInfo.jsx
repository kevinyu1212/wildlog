import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function MyInfo({ user, onTabChange }) {
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMyInfoData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const [postsRes, likesRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/users/${user.id}/posts?sort=latest`),
          fetch(`http://localhost:5000/api/users/${user.id}/liked-posts`),
          fetch(`http://localhost:5000/api/users/${user.id}/comments`),
        ]);
        
        if (postsRes.ok) setMyPosts(await postsRes.json());
        if (likesRes.ok) setLikedPosts(await likesRes.json());
        if (commentsRes.ok) setMyComments(await commentsRes.json());
      } catch (err) {
        console.error('Failed to fetch MyInfo data:', err);
      } finally {
        setLoading(false);
      }
    };
    getMyInfoData();
  }, [user?.id]);

  const stats = [
    { 
      label: '게시글', value: myPosts.length, color: 'text-emerald-400', icon: '📝',
      onClick: () => navigate('/mypage/my-posts')
    },
    { 
      label: '좋아요', value: likedPosts.length, color: 'text-pink-400', icon: '❤️',
      onClick: () => navigate('/mypage/liked-posts')
    },
    { 
      label: '댓글', value: myComments.length, color: 'text-orange-400', icon: '💬',
      onClick: () => navigate('/mypage/my-comments')
    },
    { 
      label: '탐사 종수', value: user?.species || 0, color: 'text-blue-400', icon: '🧬',
      onClick: () => navigate('/mypage/species')
    },
  ];

  const getProfileImgUrl = () => {
    if (!user?.profile_image) return null;
    if (user.profile_image.startsWith('http')) return user.profile_image;
    return `http://localhost:5000/uploads/${user.profile_image}?t=${new Date().getTime()}`;
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-slide-up">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 border-b border-slate-800/50 pb-10">
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border-4 border-emerald-500/20 flex items-center justify-center overflow-hidden shadow-2xl transition-all group-hover:border-emerald-500/40">
            {getProfileImgUrl() ? (
              <img src={getProfileImgUrl()} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-16 h-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-950 text-white shadow-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>
        <div className="text-center md:text-left space-y-3">
          <h2 className="text-3xl md:text-4xl font-black text-white">{user?.username || '탐사대원'}</h2>
          <p className="text-sm text-slate-500 font-medium">가입 ID: {user?.email}</p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-500/20">Elite Observer</span>
            <span className="bg-slate-800/80 text-slate-400 px-4 py-1.5 rounded-full text-xs font-medium border border-slate-700">
              가입일: {user?.joined_at ? new Date(user.joined_at).toLocaleDateString() : '-'}
            </span>
            {user?.birthday && (
              <span className="bg-slate-800/80 text-slate-400 px-4 py-1.5 rounded-full text-xs font-medium border border-slate-700">
                생년월일: {new Date(user.birthday).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid - Clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map(stat => (
          <div 
            key={stat.label} 
            className={`bg-slate-900/80 border border-slate-800/60 p-5 md:p-6 rounded-2xl md:rounded-3xl text-center transition-all shadow-lg ${
              stat.onClick ? 'hover:border-emerald-500/40 cursor-pointer group' : ''
            }`}
            onClick={stat.onClick || undefined}
          >
            <div className={`text-2xl mb-2 ${stat.onClick ? 'group-hover:scale-125 transition-transform duration-300' : ''}`}>{stat.icon}</div>
            <p className="text-[10px] text-slate-600 font-bold mb-1 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-xl md:text-2xl font-black ${stat.color}`}>{stat.value.toLocaleString()}</p>
            {stat.onClick && (
              <p className="text-[9px] text-emerald-500/70 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">클릭하여 자세히 보기 →</p>
            )}
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full"></span>
          최근 활동
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-slate-900/50 rounded-2xl animate-pulse border border-slate-800/60" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* 최근 게시글 */}
            {myPosts.slice(0, 3).map(post => (
              <div 
                key={post.id} 
                className="bg-slate-900/50 rounded-2xl p-4 md:p-5 border border-slate-800/60 hover:border-slate-600 transition-all cursor-pointer flex items-center gap-4"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                <span className="text-lg flex-shrink-0">📸</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate">{post.title}</p>
                  <p className="text-[10px] text-slate-600 mt-1">
                    {post.category} · {new Date(post.created_at).toLocaleDateString()} · 👍 {post.likes_count}
                  </p>
                </div>
                <span className="text-xs text-slate-600">→</span>
              </div>
            ))}
            {myPosts.length === 0 && (
              <div className="text-center py-8 text-slate-700 text-sm font-medium border border-dashed border-slate-800/60 rounded-2xl">
                아직 작성한 게시글이 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}