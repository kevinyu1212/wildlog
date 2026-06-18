import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import FindId from '../components/auth/FindId';
import FindPw from '../components/auth/FindPw';

export default function Login() {
  const [view, setView] = useState('login');
  const navigate = useNavigate();
  
  const renderView = () => {
    switch(view) {
      case 'login': return <LoginForm onSwitchView={setView} />;
      case 'register': return <RegisterForm onSwitchView={setView} />;
      case 'findId': return <FindId onSwitchView={setView} />;
      case 'findPw': return <FindPw onSwitchView={setView} />;
      default: return <LoginForm onSwitchView={setView} />;
    }
  };

  const titles = {
    login: '탐사대원 로그인',
    findId: '아이디 찾기',
    findPw: '비밀번호 찾기',
    register: '새 대원 등록'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-3xl font-bold text-emerald-400 mb-10 cursor-pointer hover:scale-105 transition-transform"
      >
        <span>🌿</span>
        <span>WildLog</span>
      </div>

      <div className="bg-slate-900/70 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800/60 w-full max-w-md shadow-2xl relative overflow-hidden animate-scale-in">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-7 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full"></div>
          <h2 className="text-xl font-bold text-slate-100">
            {titles[view] || '탐사대원 로그인'}
          </h2>
        </div>

        {renderView()}
      </div>

      <p className="mt-8 text-slate-700 text-[10px] uppercase tracking-[0.2em] font-medium">
        Biological Observation Community & Database
      </p>
    </div>
  );
}