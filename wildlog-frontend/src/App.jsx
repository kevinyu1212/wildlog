import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import MyPage from './pages/MyPage/MyPage';
import Notification from './pages/Notification/Notification';
import Favorites from './pages/Favorites/Favorites';
import Mission from './pages/Mission/Mission';
import Observer from './pages/Observer/Observer';
import BiologyMap from './pages/BiologyMap/BiologyMap';
import Board from './pages/Board/Board';
import PostWrite from './pages/Board/PostWrite';
import PostDetail from './pages/Board/PostDetail';
import PostEdit from './pages/Board/PostEdit';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/missions" element={<Mission />} />
        <Route path="/observers" element={<Observer />} />
        <Route path="/map" element={<BiologyMap />} />
        
        {/* 게시판 경로 */}
        <Route path="/board/:category" element={<Board />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/edit/:id" element={<PostEdit />} />
        <Route path="/write" element={<PostWrite />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
