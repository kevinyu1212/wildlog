import React, { useState } from 'react';

export default function RegisterForm({ onSwitchView }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    birthDate: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          records: 0,
          species: 0
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('회원가입이 완료되었습니다! 로그인을 해주세요.');
        setTimeout(() => onSwitchView('login'), 2000);
      } else {
        setError(data.error || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setError('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}
      {message && <p className="text-emerald-400 text-xs text-center">{message}</p>}
      
      <div className="space-y-1">
        <label className="text-[10px] text-slate-500 ml-1">이메일</label>
        <div className="flex gap-2">
          <input 
            name="email"
            type="email" 
            placeholder="example@mail.com" 
            onChange={handleChange}
            className="flex-1 p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-sm" 
            required
          />
          <button type="button" className="bg-slate-700 hover:bg-slate-600 px-3 rounded-xl text-[10px] font-bold transition-colors">중복확인</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 ml-1">비밀번호</label>
          <input 
            name="password"
            type="password" 
            placeholder="8자 이상, 영문/숫자/특수" 
            onChange={handleChange}
            className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-sm" 
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 ml-1">비밀번호 확인</label>
          <input 
            name="confirmPassword"
            type="password" 
            placeholder="다시 입력" 
            onChange={handleChange}
            className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-sm" 
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-slate-500 ml-1">닉네임</label>
        <div className="flex gap-2">
          <input 
            name="username"
            type="text" 
            placeholder="2~20자" 
            onChange={handleChange}
            className="flex-1 p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-sm" 
            required
          />
          <button type="button" className="bg-slate-700 hover:bg-slate-600 px-3 rounded-xl text-[10px] font-bold transition-colors">중복확인</button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-slate-500 ml-1">생년월일</label>
        <input 
          name="birthDate"
          type="date" 
          onChange={handleChange}
          className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-sm" 
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] text-slate-500 ml-1">보안 질문</label>
        <select 
          name="securityQuestion"
          onChange={handleChange}
          className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-sm appearance-none"
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

      <div className="space-y-1">
        <label className="text-[10px] text-slate-500 ml-1">보안 질문 답변</label>
        <input 
          name="securityAnswer"
          type="text" 
          placeholder="답변을 입력하세요" 
          onChange={handleChange}
          className="w-full p-2.5 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none text-sm" 
          required
        />
      </div>

      <div className="pt-4 space-y-2">
        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20">
          가입 완료
        </button>
        <button type="button" onClick={() => onSwitchView('login')} className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors">
          이미 계정이 있으신가요? 로그인하기
        </button>
      </div>
    </form>
  );
}
