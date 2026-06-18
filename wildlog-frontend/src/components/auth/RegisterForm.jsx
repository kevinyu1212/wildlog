import React, { useState } from 'react';
import { API_BASE, validatePassword, validateUsername } from '../../utils/authValidation';

export default function RegisterForm({ onSwitchView }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    birthDate: '',
    securityQuestion: '',
    securityAnswer: '',
  });
  const [emailChecked, setEmailChecked] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'email') setEmailChecked(false);
    if (name === 'username') setUsernameChecked(false);
  };

  const checkEmail = async () => {
    if (!formData.email) return setError('이메일을 입력해주세요.');
    try {
      const res = await fetch(`${API_BASE}/api/auth/check-email?email=${encodeURIComponent(formData.email)}`);
      const data = await res.json();
      if (data.available) {
        setEmailChecked(true);
        setMessage('사용 가능한 이메일입니다.');
        setError('');
      } else {
        setEmailChecked(false);
        setError('이미 사용 중인 이메일입니다.');
      }
    } catch {
      setError('중복 확인 중 오류가 발생했습니다.');
    }
  };

  const checkUsername = async () => {
    const nameError = validateUsername(formData.username);
    if (nameError) return setError(nameError);
    try {
      const res = await fetch(`${API_BASE}/api/auth/check-username?username=${encodeURIComponent(formData.username)}`);
      const data = await res.json();
      if (data.available) {
        setUsernameChecked(true);
        setMessage('사용 가능한 닉네임입니다.');
        setError('');
      } else {
        setUsernameChecked(false);
        setError('이미 사용 중인 닉네임입니다.');
      }
    } catch {
      setError('중복 확인 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const pwError = validatePassword(formData.password);
    if (pwError) return setError(pwError);

    const nameError = validateUsername(formData.username);
    if (nameError) return setError(nameError);

    if (formData.password !== formData.confirmPassword) {
      return setError('비밀번호가 일치하지 않습니다.');
    }
    if (!emailChecked) return setError('이메일 중복확인을 해주세요.');
    if (!usernameChecked) return setError('닉네임 중복확인을 해주세요.');

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('🎉 회원가입이 완료되었습니다! 로그인을 해주세요.');
        setTimeout(() => onSwitchView('login'), 2000);
      } else {
        setError(data.error || '회원가입에 실패했습니다.');
      }
    } catch {
      setError('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1">
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p className="text-red-400 text-xs font-medium">{error}</p>
        </div>
      )}
      {message && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <p className="text-emerald-400 text-xs font-medium">{message}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-400 ml-1">이메일</label>
        <div className="flex gap-2">
          <input
            name="email"
            type="email"
            placeholder="example@mail.com"
            value={formData.email}
            onChange={handleChange}
            className="flex-1 px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 outline-none text-sm"
            required
          />
          <button
            type="button"
            onClick={checkEmail}
            className={`px-3 rounded-xl text-[10px] font-bold transition-all border whitespace-nowrap ${
              emailChecked ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-700 text-slate-300 border-slate-600/50'
            }`}
          >
            {emailChecked ? '확인됨' : '중복확인'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-400 ml-1">비밀번호</label>
          <input
            name="password"
            type="password"
            placeholder="8자 이상, 영문/숫자/특수"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 outline-none text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-400 ml-1">비밀번호 확인</label>
          <input
            name="confirmPassword"
            type="password"
            placeholder="다시 입력"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 outline-none text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-400 ml-1">닉네임</label>
        <div className="flex gap-2">
          <input
            name="username"
            type="text"
            placeholder="2~20자"
            value={formData.username}
            onChange={handleChange}
            className="flex-1 px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 outline-none text-sm"
            required
          />
          <button
            type="button"
            onClick={checkUsername}
            className={`px-3 rounded-xl text-[10px] font-bold transition-all border whitespace-nowrap ${
              usernameChecked ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-700 text-slate-300 border-slate-600/50'
            }`}
          >
            {usernameChecked ? '확인됨' : '중복확인'}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-400 ml-1">생년월일</label>
        <input
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 outline-none text-sm [color-scheme:dark]"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-400 ml-1">보안 질문</label>
        <select
          name="securityQuestion"
          value={formData.securityQuestion}
          onChange={handleChange}
          className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 outline-none text-sm text-slate-300"
          required
        >
          <option value="">질문을 선택하세요</option>
          <option>초등학교 때 별명은?</option>
          <option>첫 번째 반려동물 이름은?</option>
          <option>어머니의 고향은?</option>
          <option>가장 좋아하는 영화는?</option>
          <option>첫 직장 이름은?</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold text-slate-400 ml-1">보안 질문 답변</label>
        <input
          name="securityAnswer"
          type="text"
          placeholder="답변을 입력하세요"
          value={formData.securityAnswer}
          onChange={handleChange}
          className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 outline-none text-sm"
          required
        />
      </div>

      <div className="pt-4 space-y-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 text-white"
        >
          {isLoading ? '처리 중...' : '가입 완료'}
        </button>
        <button type="button" onClick={() => onSwitchView('login')} className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 font-medium">
          이미 계정이 있으신가요? <span className="text-emerald-400 font-bold">로그인하기</span>
        </button>
      </div>
    </form>
  );
}
