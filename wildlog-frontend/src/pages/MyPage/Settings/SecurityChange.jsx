import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import SettingsLayout from '../../../components/layout/SettingsLayout';

const securityQuestions = [
  '초등학교 때 별명은?',
  '첫 번째 반려동물 이름은?',
  '어머니의 고향은?',
  '가장 좋아하는 영화는?',
  '첫 직장 이름은?',
];

export default function SecurityChange() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [question, setQuestion] = useState(user?.security_question || '');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return alert('답변을 입력해주세요.');
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, security_question: question, security_answer: answer }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user);
        alert('보안 질문이 변경되었습니다.');
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
          <h2 className="text-2xl font-bold text-white">보안 질문 변경</h2>
        </div>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 ml-1">보안 질문 선택</label>
          <select value={question} onChange={e => setQuestion(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 text-sm text-slate-200 appearance-none" required>
            <option value="">질문을 선택하세요</option>
            {securityQuestions.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 ml-1">답변</label>
          <input type="text" value={answer} onChange={e => setAnswer(e.target.value)}
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