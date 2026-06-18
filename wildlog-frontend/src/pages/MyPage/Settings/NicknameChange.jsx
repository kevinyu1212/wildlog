import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SettingsLayout from '../../../components/layout/SettingsLayout';

export default function NicknameChange() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [nickname, setNickname] = useState(user?.username || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nickname.length < 2 || nickname.length > 20) {
      alert('닉네임은 2~20자 사이여야 합니다.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: nickname }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user);
        alert('닉네임이 변경되었습니다.');
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
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/mypage')} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <span className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full"></span>
          <h2 className="text-2xl font-bold text-white">닉네임 변경</h2>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 ml-1">현재 닉네임</label>
          <p className="text-sm text-slate-500 ml-1">{user?.username}</p>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 ml-1">새 닉네임 (2~20자)</label>
          <input 
            type="text" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm text-slate-200"
            required
            minLength={2}
            maxLength={20}
          />
        </div>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => navigate('/mypage')}
            className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-all text-slate-400 border border-slate-700/50"
          >
            취소
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 px-8 py-3 rounded-xl text-sm font-bold transition-all text-white shadow-lg shadow-emerald-900/30"
          >
            {isLoading ? '변경 중...' : '변경하기'}
          </button>
        </div>
      </form>
    </div>
    </SettingsLayout>
  );
}