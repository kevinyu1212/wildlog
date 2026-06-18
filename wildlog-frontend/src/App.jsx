import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import MyPage from './pages/MyPage/MyPage';
import ProfileImage from './pages/MyPage/Settings/ProfileImage';
import NicknameChange from './pages/MyPage/Settings/NicknameChange';
import PasswordChange from './pages/MyPage/Settings/PasswordChange';
import SecurityChange from './pages/MyPage/Settings/SecurityChange';
import Withdrawal from './pages/MyPage/Settings/Withdrawal';
import MyPosts from './pages/MyPage/MyPosts';
import LikedPosts from './pages/MyPage/LikedPosts';
import MyComments from './pages/MyPage/MyComments';
import Notification from './pages/Notification/Notification';
import Favorites from './pages/Favorites/Favorites';
import Mission from './pages/Mission/Mission';
import Observer from './pages/Observer/Observer';
import UserProfile from './pages/Observer/UserProfile';
import BiologyMap from './pages/BiologyMap/BiologyMap';
import Board from './pages/Board/Board';
import PostWrite from './pages/Board/PostWrite';
import PostDetail from './pages/Board/PostDetail';
import PostEdit from './pages/Board/PostEdit';
import Terms from './pages/Info/Terms';
import About from './pages/Info/About';
import Privacy from './pages/Info/Privacy';
import Guide from './pages/Info/Guide';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* 마이페이지 */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/my-posts" element={<MyPosts />} />
        <Route path="/mypage/liked-posts" element={<LikedPosts />} />
        <Route path="/mypage/my-comments" element={<MyComments />} />
        <Route path="/mypage/profile-image" element={<ProfileImage />} />
        <Route path="/mypage/nickname" element={<NicknameChange />} />
        <Route path="/mypage/password" element={<PasswordChange />} />
        <Route path="/mypage/security" element={<SecurityChange />} />
        <Route path="/mypage/withdrawal" element={<Withdrawal />} />
        
        <Route path="/notifications" element={<Notification />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/missions" element={<Mission />} />
        <Route path="/observers" element={<Observer />} />
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path="/map" element={<BiologyMap />} />
        
        {/* 게시판 경로 */}
        <Route path="/board/:category" element={<Board />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/edit/:id" element={<PostEdit />} />
        <Route path="/write" element={<PostWrite />} />

        {/* 정보 페이지 */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/guide" element={<Guide />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}