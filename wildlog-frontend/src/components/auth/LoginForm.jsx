import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onSwitchView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        navigate('/');
      } else {
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      <div className="space-y-2">
        <label className="text-xs text-slate-500 ml-1">이메일</label>
        <input 
          type="email" 
          placeholder="email@example.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none transition-all"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-slate-500 ml-1">비밀번호</label>
        <input 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none transition-all"
          required
        />
      </div>
      
      <button 
        type="submit" 
        className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
      >
        로그인
      </button>

      <div className="flex justify-between items-center px-2 pt-2 text-xs text-slate-400">
        <div className="space-x-4">
          <button type="button" onClick={() => onSwitchView('findId')} className="hover:text-slate-200">아이디 찾기</button>
          <button type="button" onClick={() => onSwitchView('findPw')} className="hover:text-slate-200">비밀번호 찾기</button>
        </div>
        <button type="button" onClick={() => onSwitchView('register')} className="text-emerald-400 font-bold hover:text-emerald-300">회원가입</button>
      </div>
    </form>
  );
}
