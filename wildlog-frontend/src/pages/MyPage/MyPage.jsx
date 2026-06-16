import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function MyPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  // 상태 관리
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.username || '');

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <p className="mb-4 text-slate-400">로그인이 필요한 페이지입니다.</p>
        <button onClick={() => navigate('/login')} className="bg-emerald-600 px-6 py-2 rounded-xl font-bold shadow-lg">로그인 하러가기</button>
      </div>
    );
  }

  const handleUpdateProfile = async (field, value) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      if (response.ok) {
        const updatedUser = { ...user, [field]: value };
        login(updatedUser); // Context 업데이트
        alert('변경되었습니다.');
        setIsEditingNickname(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmText = prompt("'탈퇴 회원'이라고 입력하시면 탈퇴 처리가 진행됩니다.");
    if (confirmText === '탈퇴 회원') {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${user.id}`, { method: 'DELETE' });
        if (response.ok) {
          alert('탈퇴 처리되었습니다. 그동안 WildLog를 이용해주셔서 감사합니다.');
          logout();
          navigate('/');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'info': return <MyInfo user={user} />;
      case 'settings': return (
        <AccountSettings 
          user={user} 
          isEditingNickname={isEditingNickname}
          setIsEditingNickname={setIsEditingNickname}
          newNickname={newNickname}
          setNewNickname={setNewNickname}
          handleUpdateProfile={handleUpdateProfile}
          handleDeleteAccount={handleDeleteAccount}
        />
      );
      case 'gallery': return <MyGallery user_id={user.id} />;
      default: return <MyInfo user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* 좌측 탭 메뉴 */}
          <aside className="w-full md:w-64 space-y-3">
            {[
              { id: 'info', name: '내 탐사 리포트', icon: '📊' },
              { id: 'gallery', name: '내 관찰 갤러리', icon: '📸' },
              { id: 'settings', name: '계정 및 보안', icon: '🛡️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${
                  activeTab === tab.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </aside>

          {/* 우측 콘텐츠 영역 */}
          <section className="flex-1 bg-slate-900/30 border border-slate-800 rounded-[3rem] p-8 md:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30"></div>
            {renderContent()}
          </section>
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

function MyInfo({ user }) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center gap-10 border-b border-slate-800/50 pb-12">
        <div className="relative">
          <div className="w-40 h-40 bg-slate-800 rounded-full border-4 border-emerald-500/20 flex items-center justify-center overflow-hidden shadow-2xl">
            {user?.profile_image ? (
              <img src={`http://localhost:5000/uploads/${user.profile_image}`} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">👤</span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900 text-white shadow-lg">
             ✨
          </div>
        </div>
        <div className="text-center md:text-left space-y-4">
          <div>
            <h2 className="text-4xl font-black text-white mb-1">{user?.username}</h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
            <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black border border-emerald-500/20 uppercase tracking-tighter">Elite Observer</span>
            <span className="bg-slate-800/80 text-slate-400 px-4 py-1.5 rounded-full text-xs font-black border border-slate-700">가입: {new Date(user?.joined_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: '관찰 기록', value: user?.records || 0, color: 'text-emerald-400', icon: '📝' },
          { label: '탐사 종수', value: user?.species || 0, color: 'text-blue-400', icon: '🧬' },
          { label: '획득 좋아요', value: user?.likes || 0, color: 'text-pink-400', icon: '❤️' },
          { label: '작성 댓글', value: user?.comments || 0, color: 'text-orange-400', icon: '💬' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center hover:border-slate-600 transition-all cursor-pointer group shadow-lg">
            <div className="text-2xl mb-3 group-hover:scale-125 transition-transform">{stat.icon}</div>
            <p className="text-[10px] text-slate-600 font-black mb-1 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-300 flex items-center gap-2">
           <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
           탐사 진행 현황
        </h3>
        <div className="bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-800 space-y-8 shadow-inner">
           <div className="space-y-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                 <span>전체 도감 완성도</span>
                 <span className="text-emerald-400">24%</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                 <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full w-[24%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function AccountSettings({ user, isEditingNickname, setIsEditingNickname, newNickname, setNewNickname, handleUpdateProfile, handleDeleteAccount }) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-black text-white mb-2">계정 설정</h2>
        <p className="text-slate-500 text-sm font-medium">탐사 대원의 보안 및 프로필 정보를 관리합니다.</p>
      </div>
      
      <div className="space-y-4">
        <div className="group p-6 bg-slate-900/50 rounded-[2rem] border border-slate-800 hover:border-slate-600 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl">🖼️</div>
             <div>
                <p className="font-black text-slate-100">프로필 이미지</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter mt-0.5">JPG, PNG / Max 2MB</p>
             </div>
          </div>
          <button className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-xl text-xs font-black transition-all">이미지 변경</button>
        </div>

        <div className="group p-6 bg-slate-900/50 rounded-[2rem] border border-slate-800 hover:border-slate-600 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl">👤</div>
             <div className="flex-1">
                <p className="font-black text-slate-100">탐사 대원 닉네임</p>
                {isEditingNickname ? (
                  <div className="flex gap-2 mt-2">
                    <input 
                      type="text" 
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="bg-slate-950 border border-emerald-500/50 rounded-lg px-3 py-1 text-sm outline-none"
                    />
                    <button onClick={() => handleUpdateProfile('username', newNickname)} className="text-xs font-black text-emerald-400">저장</button>
                    <button onClick={() => setIsEditingNickname(false)} className="text-xs font-black text-slate-600">취소</button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-bold mt-0.5">현재: {user.username}</p>
                )}
             </div>
          </div>
          {!isEditingNickname && (
            <button onClick={() => setIsEditingNickname(true)} className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-xl text-xs font-black transition-all">닉네임 변경</button>
          )}
        </div>

        <div className="group p-6 bg-slate-900/50 rounded-[2rem] border border-slate-800 hover:border-slate-600 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl">🔑</div>
             <div>
                <p className="font-black text-slate-100">비밀번호 보안</p>
                <p className="text-xs text-slate-500 font-bold mt-0.5">최근 변경: 30일 전</p>
             </div>
          </div>
          <button className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-xl text-xs font-black transition-all">비밀번호 변경</button>
        </div>
      </div>

      <div className="pt-12 border-t border-slate-800 flex justify-between items-center px-4">
        <div>
           <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-1">Danger Zone</p>
           <p className="text-[10px] text-slate-600 font-bold">계정 삭제 시 모든 탐사 데이터가 영구 삭제됩니다.</p>
        </div>
        <button onClick={handleDeleteAccount} className="text-red-900/50 hover:text-red-500 text-xs font-black transition-all uppercase tracking-widest">Withdrawal</button>
      </div>
    </div>
  );
}

function MyGallery({ user_id }) {
  const [filter, setFilter] = useState('전체');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const categories = ['전체', '포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  const fetchMyPosts = async () => {
    setIsLoading(true);
    try {
      const categoryQuery = filter !== '전체' ? `&category=${filter}` : '';
      const response = await fetch(`http://localhost:5000/api/posts?user_id=${user_id}${categoryQuery}`);
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, [filter]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-2xl font-black text-white mb-1">내 관찰 갤러리</h2>
          <p className="text-slate-500 text-sm font-medium">직접 수집한 생태 아카이브입니다.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 no-scrollbar">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setFilter(cat)}
               className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                 filter === cat ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-600'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
           {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-slate-900 rounded-[2rem] animate-pulse border border-slate-800" />)}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {posts.map(post => {
            const images = post.images ? JSON.parse(post.images) : [];
            return (
              <div 
                key={post.id} 
                className="group relative aspect-square bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-all shadow-xl"
              >
                <img 
                  src={`http://localhost:5000/uploads/${images[0]}`} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                   <p className="text-[10px] font-black text-emerald-400 uppercase mb-1">{post.category}</p>
                   <h4 className="text-xs font-black text-white line-clamp-1">{post.title}</h4>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-700 border-2 border-dashed border-slate-800 rounded-[3rem] py-20">
           <span className="text-6xl mb-6">🏜️</span>
           <p className="text-sm font-black uppercase tracking-[0.2em]">No Data Found</p>
           <p className="text-[10px] font-bold mt-2">해당 분류군의 기록이 존재하지 않습니다.</p>
        </div>
      )}
    </div>
  );
}
