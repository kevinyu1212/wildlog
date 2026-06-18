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

  const markAllRead = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${user.id}/read`, {
        method: 'PUT',
      });
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <span className="text-6xl block">🔒</span>
          <p className="text-slate-400 font-medium">로그인이 필요한 페이지입니다.</p>
          <button 
            onClick={() => window.location.href='/login'} 
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-8 py-3 rounded-xl font-bold shadow-lg transition-all text-white"
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'comment': return { icon: '💬', bg: 'bg-blue-500/20', text: 'text-blue-400' };
      case 'reply': return { icon: '↪️', bg: 'bg-indigo-500/20', text: 'text-indigo-400' };
      case 'like': return { icon: '❤️', bg: 'bg-pink-500/20', text: 'text-pink-400' };
      case 'mission': return { icon: '🎯', bg: 'bg-orange-500/20', text: 'text-orange-400' };
      default: return { icon: '🔔', bg: 'bg-slate-500/20', text: 'text-slate-400' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">알림 센터</h1>
            <p className="text-slate-500 text-sm font-medium">최근 30일간의 활동 알림입니다.</p>
          </div>
          <button 
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            모두 읽음
          </button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-900/80 animate-pulse rounded-2xl border border-slate-800/60" />
            ))
          ) : notifications.length > 0 ? (
            notifications.map(n => {
              const style = getNotificationIcon(n.type);
              return (
                <div 
                  key={n.id}
                  className={`group relative flex items-center gap-4 p-4 md:p-5 rounded-2xl border transition-all cursor-pointer ${
                    n.is_read 
                      ? 'bg-slate-900/30 border-slate-800/40' 
                      : 'bg-slate-900 border-emerald-500/20 shadow-lg shadow-emerald-900/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${style.bg} ${style.text}`}>
                    {style.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm mb-1 ${n.is_read ? 'text-slate-400' : 'text-slate-100 font-semibold'}`}>
                      {n.content}
                    </p>
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>

                  {!n.is_read && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  )}

                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all rounded-xl hover:bg-red-500/10"
                    title="삭제"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center bg-slate-900/30 rounded-3xl border border-dashed border-slate-800/60">
              <div className="text-5xl mb-6">🔔</div>
              <p className="text-slate-600 text-sm font-medium">새로운 알림이 없습니다.</p>
              <p className="text-[10px] text-slate-700 mt-2">댓글, 좋아요, 미션 알림을 확인하세요.</p>
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