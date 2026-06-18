import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SettingsLayout from '../../../components/layout/SettingsLayout';

export default function Withdrawal() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    if (confirmText !== '탈퇴 회원') {
      alert("'탈퇴 회원'을 정확히 입력해주세요.");
      return;
    }

    if (!window.confirm('정말로 탈퇴하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('탈퇴 처리되었습니다. 그동안 WildLog를 이용해주셔서 감사합니다.');
        logout();
        navigate('/');
      } else {
        alert('탈퇴 처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('서버와 통신 중 오류가 발생했습니다.');
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
        <span className="w-1 h-6 bg-gradient-to-b from-red-600 to-red-500 rounded-full"></span>
        <h2 className="text-2xl font-bold text-white">회원 탈퇴</h2>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl space-y-3">
        <h3 className="text-red-400 font-bold flex items-center gap-2">
          <span>⚠️</span> 주의사항
        </h3>
        <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
          <li>계정 삭제 시 모든 관찰 기록 및 활동 데이터가 영구 삭제됩니다.</li>
          <li>삭제된 데이터는 어떠한 경우에도 복구할 수 없습니다.</li>
          <li>작성하신 댓글은 익명화되어 유지될 수 있습니다.</li>
        </ul>
      </div>

      <form onSubmit={handleWithdrawal} className="space-y-6 max-w-md">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-300 ml-1">
            계정 삭제를 위해 아래 입력창에 <span className="text-red-500">"탈퇴 회원"</span>을 입력해주세요.
          </label>
          <input 
            type="text" 
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="탈퇴 회원"
            className="w-full bg-slate-950 border border-slate-800/60 p-4 rounded-xl outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all text-sm text-slate-200"
            required
          />
        </div>

        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => navigate('/mypage')}
            className="flex-1 bg-slate-800 hover:bg-slate-700 px-6 py-4 rounded-xl text-sm font-bold transition-all text-slate-400 border border-slate-700/50"
          >
            취소
          </button>
          <button 
            type="submit"
            disabled={isLoading || confirmText !== '탈퇴 회원'}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-40 px-6 py-4 rounded-xl text-sm font-bold transition-all text-white shadow-lg shadow-red-900/30"
          >
            {isLoading ? '처리 중...' : '탈퇴하기'}
          </button>
        </div>
      </form>
    </div>
    </SettingsLayout>
  );
}
