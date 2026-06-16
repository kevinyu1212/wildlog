import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import FindId from '../components/auth/FindId';
import FindPw from '../components/auth/FindPw';

export default function Login() {
  const [view, setView] = useState('login'); // login, findId, findPw, register
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div 
        onClick={() => navigate('/')} 
        className="text-4xl font-bold text-emerald-400 mb-12 cursor-pointer hover:scale-105 transition-transform"
      >
        🐾 WildLog
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
        
        <h2 className="text-2xl font-bold mb-8 text-slate-100 text-center">
          {view === 'login' ? '탐사대원 로그인' : view === 'findId' ? '아이디 찾기' : view === 'findPw' ? '비밀번호 찾기' : '새 대원 등록'}
        </h2>

        {renderView()}
      </div>

      <p className="mt-8 text-slate-600 text-[10px] uppercase tracking-[0.2em]">
        Biological Observation Community & Database
      </p>
    </div>
  );
}
