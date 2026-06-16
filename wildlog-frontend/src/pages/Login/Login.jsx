import React, { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import FindId from '../../components/auth/FindId';
import FindPw from '../../components/auth/FindPw';
import RegisterForm from '../../components/auth/RegisterForm';

export default function Login() {
  const [view, setView] = useState('login');

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-sm shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-emerald-400">WildLog</h2>
        {view === 'login' && <LoginForm setView={setView} />}
        {view === 'findId' && <FindId onBack={() => setView('login')} />}
        {view === 'findPw' && <FindPw onBack={() => setView('login')} />}
        {view === 'register' && <RegisterForm onCancel={() => setView('login')} />}
      </div>
    </div>
  );
}