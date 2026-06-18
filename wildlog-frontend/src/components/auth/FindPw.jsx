import React, { useState } from 'react';
import { API_BASE, validatePassword } from '../../utils/authValidation';

export default function FindPw({ onSwitchView }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult('');
    try {
      const response = await fetch(`${API_BASE}/api/auth/find-pw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setSecurityQuestion(data.security_question);
        setStep(2);
      } else {
        setResult(data.error || '일치하는 계정 정보가 없습니다.');
      }
    } catch {
      setResult('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResult('');

    const pwError = validatePassword(newPassword);
    if (pwError) return setResult(pwError);
    if (newPassword !== confirmPassword) return setResult('비밀번호가 일치하지 않습니다.');

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-pw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, security_answer: securityAnswer, new_password: newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult('비밀번호가 재설정되었습니다. 로그인해주세요.');
        setTimeout(() => onSwitchView('login'), 2000);
      } else {
        setResult(data.error || '재설정에 실패했습니다.');
      }
    } catch {
      setResult('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 2) {
    return (
      <form onSubmit={handleResetSubmit} className="space-y-5">
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-400">보안 질문에 답변하고 새 비밀번호를 설정하세요.</p>
        </div>

        {result && (
          <div className={`rounded-xl px-4 py-3 text-xs font-medium ${
            result.includes('재설정') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {result}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 ml-1">보안 질문</label>
          <p className="text-sm text-slate-200 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3">{securityQuestion}</p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 ml-1">보안 질문 답변</label>
          <input
            type="text"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 outline-none text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 ml-1">새 비밀번호</label>
          <input
            type="password"
            placeholder="8자 이상, 영문/숫자/특수"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 outline-none text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 ml-1">새 비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 outline-none text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 disabled:opacity-60 py-3 rounded-xl font-bold text-white"
        >
          {isLoading ? '처리 중...' : '비밀번호 재설정'}
        </button>

        <button type="button" onClick={() => { setStep(1); setResult(''); }} className="w-full py-2 text-xs text-slate-500 hover:text-slate-300">
          이전 단계
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className="space-y-5">
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <p className="text-xs text-slate-400 leading-relaxed">
          가입 시 입력한 이메일을 입력하면 보안 질문 확인 후 비밀번호를 재설정할 수 있습니다.
        </p>
      </div>

      {result && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-medium">
          {result}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 ml-1">이메일</label>
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 outline-none text-sm"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 disabled:opacity-60 py-3 rounded-xl font-bold text-white"
      >
        {isLoading ? '확인 중...' : '다음'}
      </button>

      <button type="button" onClick={() => onSwitchView('login')} className="w-full py-2 text-xs text-slate-500 hover:text-slate-300">
        로그인으로 돌아가기
      </button>
    </form>
  );
}
