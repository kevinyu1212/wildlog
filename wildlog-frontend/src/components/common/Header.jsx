import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useSearchHistory from '../../hooks/useSearchHistory';

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, logout, updateUser } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const { saveSearchTerm, getSavedSearches, clearSavedSearches } = useSearchHistory();
  const [search, setSearch] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchNotificationCount();
      refreshUserInfo();
    } else {
      setNotificationCount(0);
    }
  }, [isLoggedIn, user?.id]);

  const refreshUserInfo = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`);
      if (response.ok) {
        const freshUser = await response.json();
        updateUser(freshUser);
      }
    } catch (err) {
      console.error('Failed to refresh user info:', err);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${user.id}`);
      const data = await response.json();
      const unreadCount = data.filter(n => !n.is_read).length;
      setNotificationCount(unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    saveSearchTerm('header', search.trim());
    navigate(`/board/전체?search=${encodeURIComponent(search.trim())}`);
    setSearch('');
    setShowHistory(false);
  };

  const handleHistoryClick = (term) => {
    setSearch(term);
    saveSearchTerm('header', term);
    navigate(`/board/전체?search=${encodeURIComponent(term)}`);
    setSearch('');
    setShowHistory(false);
  };

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const savedSearches = getSavedSearches('header');

  const getProfileImgUrl = () => {
    if (!user?.profile_image) return null;
    if (user.profile_image.startsWith('http')) return user.profile_image;
    return `http://localhost:5000/uploads/${user.profile_image}?t=${new Date().getTime()}`;
  };

  const goLogin = () => navigate('/login', { state: { from: location.pathname } });

  return (
    <header className="h-16 border-b border-slate-800/80 flex items-center justify-between px-4 md:px-8 bg-slate-900/95 backdrop-blur-lg sticky top-0 z-[100] shadow-lg shadow-black/10">
      {/* Logo */}
      <div 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🌿</span>
        <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent hidden sm:block">
          WildLog
        </span>
      </div>

      {/* Search Bar */}
      <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-8 relative">
        <form onSubmit={handleSearch} className="relative w-full group">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="통합 검색..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowHistory(true)}
            className="w-full bg-slate-950/50 border border-slate-800/60 py-2.5 pl-11 pr-4 rounded-2xl text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-600"
          />
        </form>
        
        {/* Search History Dropdown */}
        {showHistory && savedSearches.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">최근 검색</span>
              <button 
                onClick={() => { clearSavedSearches('header'); setShowHistory(false); }}
                className="text-[10px] text-slate-600 hover:text-red-400 transition-colors"
              >
                전체 삭제
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {savedSearches.map((term, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleHistoryClick(term)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/60 cursor-pointer transition-colors group/item"
                >
                  <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-slate-300 flex-1 truncate">{term}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="opacity-0 group-hover/item:opacity-100 text-slate-600 hover:text-slate-400 transition-all"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Favorites */}
        <button 
          onClick={() => navigate(isLoggedIn ? '/favorites' : '/login', isLoggedIn ? undefined : { state: { from: '/favorites' } })} 
          className="relative p-2 rounded-xl hover:bg-slate-800/80 transition-all group"
          title="즐겨찾기"
        >
          <svg className="w-5 h-5 text-slate-400 group-hover:text-yellow-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </button>

        {/* Notifications */}
        <button 
          onClick={() => navigate(isLoggedIn ? '/notifications' : '/login', isLoggedIn ? undefined : { state: { from: '/notifications' } })} 
          className="relative p-2 rounded-xl hover:bg-slate-800/80 transition-all group"
          title="알림"
        >
          <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center text-white shadow-lg shadow-red-500/30">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {/* Auth Section */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800/60">
          {!isLoggedIn ? (
            <>
              <span className="text-xs text-slate-500 hidden sm:inline">로그인하세요</span>
              <button 
                onClick={goLogin} 
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-4 py-1.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-900/30 active:scale-95 text-white"
              >
                로그인
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={logout}
                className="text-[10px] md:text-xs text-slate-500 hover:text-red-400 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-slate-800/60"
              >
                로그아웃
              </button>
              <span className="text-xs md:text-sm text-slate-400 hidden sm:inline">
                <span className="font-semibold text-slate-200">{user?.username || '탐사대원'}</span>
                님 환영합니다
              </span>
              <div
                onClick={() => navigate('/mypage')}
                className="w-9 h-9 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full cursor-pointer flex items-center justify-center border-2 border-slate-700 hover:border-emerald-500/50 transition-all overflow-hidden shadow-lg"
                title="마이페이지"
              >
                {getProfileImgUrl() ? (
                  <img src={getProfileImgUrl()} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button 
          onClick={onToggleSidebar} 
          className="p-2 rounded-xl hover:bg-slate-800/80 transition-all group"
        >
          <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
    </header>
  );
}