import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  useEffect(() => {
    fetchPost();
    fetchComments();
    if (isLoggedIn && user) {
      checkLikeAndFavoriteStatus();
    }
  }, [id, isLoggedIn, user]);

  const checkLikeAndFavoriteStatus = async () => {
    try {
      // 좋아요 상태 확인 (단순화를 위해 전체 목록에서 검색 - 실제론 전용 API가 좋음)
      const likesRes = await fetch(`http://localhost:5000/api/users/${user.id}/liked-posts`);
      const likes = await likesRes.json();
      setIsLiked(likes.some(p => p.id === parseInt(id)));

      // 즐겨찾기 상태 확인
      const favsRes = await fetch(`http://localhost:5000/api/favorites/${user.id}`);
      const favs = await favsRes.json();
      setIsFavorited(favs.some(p => p.id === parseInt(id)));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`);
      const data = await response.json();
      setPost(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}/comments`);
      const data = await response.json();
      const mainComments = data.filter(c => !c.parent_id);
      const replies = data.filter(c => c.parent_id);
      const structuredComments = mainComments.map(mc => ({
        ...mc,
        replies: replies.filter(r => r.parent_id === mc.id)
      }));
      setComments(structuredComments);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!newComment.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: id,
          user_id: user.id,
          content: newComment,
          parent_id: replyTo ? replyTo.id : null
        }),
      });
      if (response.ok) {
        setNewComment('');
        setReplyTo(null);
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, content: editContent }),
      });
      if (response.ok) {
        setEditingCommentId(null);
        setEditContent('');
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setReplyTo(null);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await response.json();
      setIsLiked(data.liked);
      setPost({ ...post, likes_count: data.liked ? post.likes_count + 1 : post.likes_count - 1 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavorite = async () => {
    if (!isLoggedIn) {
      alert('로그인이 필요합니다.');
      return;
    }
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch('http://localhost:5000/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, post_id: id }),
      });
      if (response.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const goToAuthorProfile = () => {
    if (!post?.author) return;
    navigate(`/profile/${encodeURIComponent(post.author)}`);
  };

  const handleAuthorCardKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToAuthorProfile();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 이 탐사 기록을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });
      if (response.ok) {
        alert('삭제되었습니다.');
        navigate(`/board/${post.category}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400 font-bold">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          탐사 데이터를 불러오는 중...
        </div>
      </div>
    );
  }

  const images = post.images ? JSON.parse(post.images) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          {/* Left: Images & Content */}
          <div className="flex-1 space-y-8">
            <button 
              onClick={() => navigate(-1)} 
              className="text-slate-500 hover:text-white transition-colors text-xs font-bold flex items-center gap-2 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              목록으로
            </button>

            {/* Image Slider */}
            <div className="relative aspect-square bg-slate-900/80 border border-slate-800/60 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl group">
              {images.length > 0 ? (
                <img 
                  src={`http://localhost:5000/uploads/${images[currentImgIdx]}`} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
              )}
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImgIdx((currentImgIdx - 1 + images.length) % images.length)}
                    className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-emerald-600/80 border border-white/10"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setCurrentImgIdx((currentImgIdx + 1) % images.length)}
                    className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-emerald-600/80 border border-white/10"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                  <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImgIdx ? 'w-8 bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'w-1.5 bg-white/30'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Content Section */}
            <div className="bg-slate-900/50 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-slate-800/60 space-y-6 md:space-y-8 backdrop-blur-sm">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                  {post.category}
                </span>
                <div className="flex gap-3">
                  {user?.id === post.user_id && (
                    <div className="flex gap-2 mr-2 border-r border-slate-800/60 pr-3">
                      <button 
                        onClick={() => navigate(`/edit/${id}`)}
                        className="text-xs font-bold text-slate-500 hover:text-emerald-400 transition-colors"
                      >
                        수정
                      </button>
                      <button 
                        onClick={handleDelete}
                        className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={handleLike} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border text-sm ${
                      isLiked 
                        ? 'bg-pink-500/10 border-pink-500/50 text-pink-500' 
                        : 'bg-slate-800/80 border-slate-700/50 text-slate-400 hover:border-pink-500/50 hover:text-pink-500'
                    }`}
                  >
                    <span>❤️</span>
                    <span className="font-bold">{post.likes_count}</span>
                  </button>
                  <button 
                    onClick={handleFavorite}
                    className={`border p-1.5 px-3 rounded-xl text-sm transition-all ${
                      isFavorited 
                        ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' 
                        : 'bg-slate-800/80 border-slate-700/50 text-slate-400 hover:text-yellow-400 hover:border-yellow-400/50'
                    }`}
                  >
                    {isFavorited ? '⭐' : '☆'}
                  </button>
                </div>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">{post.title}</h1>
              
              <div className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>

              {/* Map Location */}
              <div className="pt-6 border-t border-slate-800/60">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  탐사 지점 위치 정보
                </h3>
                <div className="w-full h-64 md:h-80 bg-slate-950 rounded-xl md:rounded-[2rem] overflow-hidden border border-slate-800/60 relative" style={{ zIndex: 0 }}>
                  {post.lat && post.lng ? (
                    <MapContainer center={[post.lat, post.lng]} zoom={13} style={{ width: '100%', height: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[post.lat, post.lng]} />
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                      <span className="text-4xl mb-3">📍</span>
                      <p className="text-xs font-bold uppercase tracking-widest">위치 정보가 등록되지 않았습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Author Info & Comments */}
          <aside className="w-full lg:w-96 space-y-6 md:space-y-8">
            {/* Author Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={goToAuthorProfile}
              onKeyDown={handleAuthorCardKeyDown}
              className="bg-slate-900/80 border border-slate-800/60 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl cursor-pointer hover:border-emerald-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border-2 border-emerald-500/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {post.author_img ? <img src={post.author_img} alt="" /> : (
                    <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">{post.author}</h4>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">정예 대원</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center border-t border-slate-800/50 pt-6 mb-6">
                <div>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">탐사 일시</p>
                  <p className="text-xs font-bold text-slate-300">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">누적 조회</p>
                  <p className="text-xs font-bold text-slate-300">{post.views.toLocaleString()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToAuthorProfile();
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 py-3.5 rounded-xl text-xs font-bold transition-all border border-slate-700/50 text-slate-300"
              >
                관찰자 프로필 방문하기
              </button>
            </div>

            {/* Comments Section */}
            <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 flex flex-col h-[500px] md:h-[600px] backdrop-blur-sm shadow-inner">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                💬 댓글 <span className="text-emerald-400">{comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-6 mb-6 custom-scrollbar pr-2">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="space-y-3">
                      {/* Main Comment */}
                      <div className="space-y-2 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center text-xs border border-slate-700">
                              {comment.profile_image ? <img src={comment.profile_image} alt="" /> : '👤'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{comment.username}</p>
                              <p className="text-[9px] text-slate-600 font-medium">{new Date(comment.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setReplyTo(comment)} className="text-[10px] font-bold text-emerald-500 hover:underline">답글</button>
                            {user?.id === comment.user_id && (
                              <>
                                <button onClick={() => startEditComment(comment)} className="text-[10px] font-bold text-slate-400 hover:underline">수정</button>
                                <button onClick={() => handleDeleteComment(comment.id)} className="text-[10px] font-bold text-red-500 hover:underline">삭제</button>
                              </>
                            )}
                          </div>
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className="ml-9 space-y-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm outline-none focus:border-emerald-500/50"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleEditComment(comment.id)} className="text-[10px] font-bold text-emerald-400">저장</button>
                              <button type="button" onClick={() => setEditingCommentId(null)} className="text-[10px] font-bold text-slate-500">취소</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 ml-9 leading-relaxed">{comment.content}</p>
                        )}
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.map(reply => (
                        <div key={reply.id} className="ml-8 pl-3 border-l-2 border-slate-800/60 space-y-2 group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center text-[9px]">
                                {reply.profile_image ? <img src={reply.profile_image} alt="" /> : '👤'}
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-300">{reply.username}</p>
                                <p className="text-[8px] text-slate-600 font-medium">{new Date(reply.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            {user?.id === reply.user_id && (
                              <button onClick={() => handleDeleteComment(reply.id)} className="text-[10px] font-bold text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">삭제</button>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 ml-7 leading-relaxed">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 text-center">
                    <span className="text-4xl mb-4">💬</span>
                    <p className="text-xs font-bold">첫 번째 댓글을 남겨보세요.</p>
                  </div>
                )}
              </div>

              {/* Reply Indicator */}
              {replyTo && (
                <div className="mb-3 p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                  <p className="text-[10px] text-emerald-400 font-bold">
                    <span className="opacity-50">@{replyTo.username}</span> 님에게 답글 작성 중...
                  </p>
                  <button onClick={() => setReplyTo(null)} className="text-emerald-400 text-xs font-bold hover:text-emerald-300 transition-colors">×</button>
                </div>
              )}

              {/* Comment Input */}
              <form onSubmit={handleCommentSubmit} className="relative">
                <textarea 
                  placeholder={replyTo ? "답글을 입력하세요..." : "대원들과 의견을 나누세요..."}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800/60 p-4 pr-14 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm resize-none h-20 placeholder:text-slate-600"
                ></textarea>
                <button 
                  type="submit"
                  className="absolute right-2 bottom-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg hover:from-emerald-500 hover:to-emerald-400 transition-all active:scale-90"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.75 12.75M6 12l-2.25 2.25M6 12l2.25-2.25M6 12l-2.25-2.25M18.75 6l1.5 1.5M18.75 6l-1.5 1.5M18.75 6v12m0 0l1.5-1.5m-1.5 1.5l-1.5-1.5" />
                  </svg>
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        boards={boards}
      />
    </div>
  );
}
