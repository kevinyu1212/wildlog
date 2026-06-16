import React, { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function Notification() {
  const { user, isLoggedIn } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];
  
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchNotifications();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn, user]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${user.id}`);
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <p className="mb-4">로그인이 필요한 페이지입니다.</p>
        <button onClick={() => window.location.href='/login'} className="bg-emerald-600 px-6 py-2 rounded-xl font-bold">로그인하러 가기</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">알림 센터</h1>
            <p className="text-slate-500 text-sm">최근 30일간의 활동 알림입니다.</p>
          </div>
          <button 
            onClick={markAllRead}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            모두 읽음 표시
          </button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-900 animate-pulse rounded-2xl border border-slate-800" />)
          ) : notifications.length > 0 ? (
            notifications.map(n => (
              <div 
                key={n.id}
                className={`group relative flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                  n.is_read ? 'bg-slate-900/30 border-slate-800/50 grayscale-[0.5]' : 'bg-slate-900 border-emerald-500/20 shadow-lg shadow-emerald-900/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  n.type === 'comment' ? 'bg-blue-500/20 text-blue-400' :
                  n.type === 'like' ? 'bg-pink-500/20 text-pink-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {n.type === 'comment' ? '💬' : n.type === 'like' ? '❤️' : '🎯'}
                </div>
                
                <div className="flex-1">
                  <p className={`text-sm mb-1 ${n.is_read ? 'text-slate-400' : 'text-slate-100 font-bold'}`}>
                    {n.content}
                  </p>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{new Date(n.created_at).toLocaleString()}</span>
                </div>

                {!n.is_read && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}

                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all"
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-slate-600 text-sm">새로운 알림이 없습니다.</p>
            </div>
          )}
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
