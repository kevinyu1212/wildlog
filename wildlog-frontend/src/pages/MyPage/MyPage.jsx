import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import MyInfo from './MyInfo/MyInfo';
import MyGallery from './MyGallery/MyGallery';

export default function MyPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const boards = ['포유류', '파충류', '양서류', '절지류', '곤충', '어류', '식물', '균류', '기타'];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <span className="text-6xl block mb-4">🔒</span>
          <p className="text-slate-400 font-medium mb-6">로그인이 필요한 페이지입니다.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/30 transition-all text-white"
          >
            로그인 하러가기
          </button>
        </div>
      </div>
    );
  }

  const handleDeleteAccount = () => {
    navigate('/mypage/withdrawal');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'info': return <MyInfo user={user} onTabChange={setActiveTab} />;
      case 'gallery': return <MyGallery />;
      case 'settings': return (
        <div className="space-y-8 animate-slide-up">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">계정 설정</h2>
            <p className="text-slate-500 text-sm font-medium">탐사 대원의 보안 및 프로필 정보를 관리합니다.</p>
          </div>
          <div className="space-y-4">
            {/* Profile Image */}
            <div onClick={() => navigate('/mypage/profile-image')} className="p-5 md:p-6 bg-slate-900/50 rounded-2xl md:rounded-[2rem] border border-slate-800/60 hover:border-slate-600 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🖼️</div>
                <div>
                  <p className="font-bold text-slate-100">프로필 이미지</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG / Max 2MB</p>
                </div>
              </div>
              <span className="text-xs text-slate-600 group-hover:text-emerald-400 transition-colors">변경하기 →</span>
            </div>

            {/* Nickname */}
            <div onClick={() => navigate('/mypage/nickname')} className="p-5 md:p-6 bg-slate-900/50 rounded-2xl border border-slate-800/60 hover:border-slate-600 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">👤</div>
                <div>
                  <p className="font-bold text-slate-100">닉네임 변경</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">현재: {user?.username}</p>
                </div>
              </div>
              <span className="text-xs text-slate-600 group-hover:text-emerald-400 transition-colors">변경하기 →</span>
            </div>

            {/* Password */}
            <div onClick={() => navigate('/mypage/password')} className="p-5 md:p-6 bg-slate-900/50 rounded-2xl border border-slate-800/60 hover:border-slate-600 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🔑</div>
                <div>
                  <p className="font-bold text-slate-100">비밀번호 변경</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">8자 이상, 영문/숫자/특수문자</p>
                </div>
              </div>
              <span className="text-xs text-slate-600 group-hover:text-emerald-400 transition-colors">변경하기 →</span>
            </div>

            {/* Security Question */}
            <div onClick={() => navigate('/mypage/security')} className="p-5 md:p-6 bg-slate-900/50 rounded-2xl border border-slate-800/60 hover:border-slate-600 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-800 rounded-xl flex items-center justify-center text-xl flex-shrink-0">❓</div>
                <div>
                  <p className="font-bold text-slate-100">보안 질문 변경</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">계정 찾기용 보안 질문</p>
                </div>
              </div>
              <span className="text-xs text-slate-600 group-hover:text-emerald-400 transition-colors">변경하기 →</span>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-8 border-t border-slate-800/60">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
              <div>
                <p className="text-xs font-bold text-red-900/80 uppercase tracking-widest mb-1">Danger Zone</p>
                <p className="text-[10px] text-slate-600 font-medium">계정 삭제 시 모든 탐사 데이터가 영구 삭제됩니다.</p>
              </div>
              <button onClick={handleDeleteAccount} className="text-red-900/50 hover:text-red-400 text-xs font-bold transition-all uppercase tracking-widest border border-red-900/30 hover:border-red-500/30 px-4 py-2 rounded-xl">
                회원 탈퇴
              </button>
            </div>
          </div>
        </div>
      );
      default: return <MyInfo user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Left Tab Menu */}
          <aside className="w-full md:w-64 space-y-2">
            {[
              { id: 'info', name: '내 탐사 리포트', icon: '📊' },
              { id: 'gallery', name: '내 관찰 갤러리', icon: '📸' },
              { id: 'settings', name: '계정 및 보안', icon: '🛡️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/40' 
                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800/80 border border-slate-800/60 hover:text-slate-200'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </aside>

          {/* Right Content */}
          <section className="flex-1 bg-slate-900/30 border border-slate-800/60 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
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