import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 데이터 정규화: 백엔드(snake_case)와 프론트엔드(camelCase) 간의 완벽한 호환성
  const normalizeUserData = (data) => {
    if (!data) return null;
    const normalized = {
      ...data,
      id: data.id || data.ID,
      profile_image: data.profile_image || data.profileImage,
      joined_at: data.joined_at || data.joinedAt,
      username: data.username || data.username // 유지
    };
    // 모든 코드에서 접근 가능하도록 별칭 지정
    normalized.profileImage = normalized.profile_image;
    normalized.joinedAt = normalized.joined_at;
    normalized.sent_likes = data.sent_likes ?? data.sentLikes ?? 0;
    return normalized;
  };

  // 서버에서 최신 정보 가져오기
  const fetchFreshUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      if (response.ok) {
        const freshData = await response.json();
        const normalized = normalizeUserData(freshData);
        setUser(normalized);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(normalized));
        console.log('User state synchronized with server');
      }
    } catch (err) {
      console.error('Failed to sync user state:', err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const normalized = normalizeUserData(parsed);
        if (normalized?.id) {
          setUser(normalized);
          setIsLoggedIn(true);
          // 즉시 서버와 동기화 시도
          fetchFreshUser(normalized.id);
        }
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData) => {
    const normalized = normalizeUserData(userData);
    setUser(normalized);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(normalized));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    sessionStorage.clear();
  };

  const updateUser = (newData) => {
    if (!newData) return;
    const normalized = normalizeUserData({ ...(user || {}), ...newData });
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
