import React, { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="email" placeholder="이메일" onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-slate-800 rounded border border-slate-700" />
      <input type="password" placeholder="비밀번호" onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-slate-800 rounded border border-slate-700" />
      <button type="submit" className="w-full bg-emerald-600 py-3 rounded font-bold hover:bg-emerald-500">로그인</button>
    </form>
  );
}