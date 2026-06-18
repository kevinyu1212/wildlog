import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SettingsLayout from '../../../components/layout/SettingsLayout';

export default function PasswordChange() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPw: '', newPw: '', confirmPw: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPw.length < 8) return alert('비밀번호는 8자 이상이어야 합니다.');
    if (form.newPw !== form.confirmPw) return alert('비밀번호가 일치하지 않습니다.');

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: form.newPw, username: user.username }),
      });
      if (response.ok) {
        alert('비밀번호가 변경되었습니다.');
        navigate('/mypage');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsLayout>
      <div className="space-y-8 animate-slide-up">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/mypage')} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <span className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full"></span>
          <h2 className="text-2xl font-bold text-white">비밀번호 변경</h2>
        </div>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 ml-1">새 비밀번호 (8자 이상, 영문/숫자/특수문자)</label>
          <input type="password" value={form.newPw} onChange={e => setForm({...form, newPw: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 text-sm" required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 ml-1">비밀번호 확인</label>
          <input type="password" value={form.confirmPw} onChange={e => setForm({...form, confirmPw: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 text-sm" required />
        </div>
        <div className="flex gap-4 pt-2">
          <button type="button" onClick={() => navigate('/mypage')}
            className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl text-sm font-bold text-slate-400 border border-slate-700/50">취소</button>
          <button type="submit" disabled={isLoading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 disabled:opacity-60 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg">변경하기</button>
        </div>
      </form>
    </div>
    </SettingsLayout>
  );
}