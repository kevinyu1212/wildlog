import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';

// Leaflet 기본 아이콘 수정
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
  const [replyTo, setReplyTo] = useState(null); // 대댓글 대상 저장
  const [isLiked, setIsLiked] = useState(false);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

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
      
      // 댓글과 대댓글 분류
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

  if (!post) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-bold">탐사 데이터를 불러오는 중...</div>;

  const images = post.images ? JSON.parse(post.images) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* 좌측 콘텐츠 (사진 및 본문) */}
          <div className="flex-1 space-y-8">
             <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-white transition-colors text-xs font-bold flex items-center gap-2">
               ← 목록으로 돌아가기
             </button>

             <div className="relative aspect-square bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl group">
                {images.length > 0 ? (
                  <img 
                    src={`http://localhost:5000/uploads/${images[currentImgIdx]}`} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">이미지가 없습니다.</div>
                )}
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentImgIdx((currentImgIdx - 1 + images.length) % images.length)}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-emerald-600"
                    >
                      ←
                    </button>
                    <button 
                      onClick={() => setCurrentImgIdx((currentImgIdx + 1) % images.length)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-emerald-600"
                    >
                      →
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImgIdx ? 'w-8 bg-emerald-500' : 'w-2 bg-white/30'}`} />
                      ))}
                    </div>
                  </>
                )}
             </div>

             <div className="bg-slate-900/50 p-8 md:p-12 rounded-[2.5rem] border border-slate-800 space-y-8 backdrop-blur-sm">
                 <div className="flex justify-between items-center">
                   <span className="bg-emerald-500/10 text-emerald-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                     {post.category}
                   </span>
                   <div className="flex gap-4">
                      {user?.id === post.user_id && (
                        <div className="flex gap-2 mr-4 border-r border-slate-800 pr-4">
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${isLiked ? 'bg-pink-500/10 border-pink-500/50 text-pink-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-pink-500/50 hover:text-pink-500'}`}
                      >
                        <span className="text-xl">❤️</span>
                        <span className="text-sm font-bold">{post.likes_count}</span>
                      </button>
                      <button className="bg-slate-800 border border-slate-700 p-2 px-4 rounded-xl text-xl text-slate-400 hover:text-yellow-400 hover:border-yellow-400/50 transition-all">⭐</button>
                   </div>
                </div>

                <h1 className="text-4xl font-black text-white leading-tight">{post.title}</h1>
                
                <div className="text-slate-400 leading-relaxed text-lg whitespace-pre-wrap">
                  {post.content}
                </div>

                <div className="pt-12 border-t border-slate-800">
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                     탐사 지점 위치 정보
                   </h3>
                   <div className="w-full h-80 bg-slate-950 rounded-[2rem] overflow-hidden border border-slate-800 relative" style={{ zIndex: 0 }}>
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

          {/* 우측 사이드바 (작성자 정보 및 댓글) */}
          <aside className="w-full lg:w-96 space-y-8">
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                <div className="flex items-center gap-5 mb-8">
                   <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-emerald-500/20 overflow-hidden flex items-center justify-center">
                      {post.author_img ? <img src={post.author_img} alt="" /> : <span className="text-2xl">👤</span>}
                   </div>
                   <div>
                      <h4 className="font-black text-xl text-white">{post.author}</h4>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">정예 대원</p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center border-t border-slate-800/50 pt-8 mb-8">
                   <div className="space-y-1">
                      <p className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">탐사 일시</p>
                      <p className="text-xs font-bold text-slate-300">{new Date(post.created_at).toLocaleDateString()}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">누적 조회</p>
                      <p className="text-xs font-bold text-slate-300">{post.views.toLocaleString()}</p>
                   </div>
                </div>
                <button 
                  onClick={() => navigate(`/observers/${post.author}`)}
                  className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl text-xs font-black transition-all border border-slate-700"
                >
                  관찰자 프로필 방문하기
                </button>
             </div>

             <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col h-[600px] backdrop-blur-sm shadow-inner">
                <h3 className="text-lg font-black mb-8 flex items-center gap-2">
                  댓글 <span className="text-emerald-400">{comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)}</span>
                </h3>
                
                <div className="flex-1 overflow-y-auto space-y-8 mb-8 custom-scrollbar pr-2">
                   {comments.length > 0 ? (
                     comments.map(comment => (
                       <div key={comment.id} className="space-y-4">
                          {/* 메인 댓글 */}
                          <div className="space-y-3 group">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center text-xs">
                                     {comment.profile_image ? <img src={comment.profile_image} alt="" /> : '👤'}
                                  </div>
                                  <div>
                                     <p className="text-xs font-black text-slate-100">{comment.username}</p>
                                     <p className="text-[10px] text-slate-600 font-bold">{new Date(comment.created_at).toLocaleDateString()}</p>
                                  </div>
                               </div>
                               <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => setReplyTo(comment)} className="text-[10px] font-bold text-emerald-500 hover:underline">답글</button>
                                  {user?.id === comment.user_id && (
                                    <button onClick={() => handleDeleteComment(comment.id)} className="text-[10px] font-bold text-red-500 hover:underline">삭제</button>
                                  )}
                               </div>
                             </div>
                             <p className="text-sm text-slate-400 ml-11 leading-relaxed">{comment.content}</p>
                          </div>

                          {/* 대댓글 (Replies) */}
                          {comment.replies && comment.replies.map(reply => (
                            <div key={reply.id} className="ml-11 pl-4 border-l-2 border-slate-800 space-y-3 group">
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center text-[10px]">
                                       {reply.profile_image ? <img src={reply.profile_image} alt="" /> : '👤'}
                                    </div>
                                    <div>
                                       <p className="text-[10px] font-black text-slate-300">{reply.username}</p>
                                       <p className="text-[8px] text-slate-600 font-bold">{new Date(reply.created_at).toLocaleDateString()}</p>
                                    </div>
                                 </div>
                                 {user?.id === reply.user_id && (
                                   <button onClick={() => handleDeleteComment(reply.id)} className="text-[10px] font-bold text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">삭제</button>
                                 )}
                               </div>
                               <p className="text-xs text-slate-400 ml-9 leading-relaxed">{reply.content}</p>
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

                {replyTo && (
                  <div className="mb-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex justify-between items-center">
                     <p className="text-[10px] text-emerald-400 font-bold">
                        <span className="opacity-50">@{replyTo.username}</span> 님에게 답글 작성 중...
                     </p>
                     <button onClick={() => setReplyTo(null)} className="text-emerald-400 text-xs font-black">×</button>
                  </div>
                )}

                <form onSubmit={handleCommentSubmit} className="relative">
                   <textarea 
                    placeholder={replyTo ? "답글을 입력하세요..." : "대원들과 의견을 나누세요..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-5 pr-16 rounded-[2rem] outline-none focus:border-emerald-500 transition-all text-sm resize-none h-24"
                   ></textarea>
                   <button 
                    type="submit"
                    className="absolute right-4 bottom-4 bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500 transition-all active:scale-90"
                   >
                     🚀
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
