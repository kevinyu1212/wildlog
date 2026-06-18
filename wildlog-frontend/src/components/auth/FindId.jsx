import React, { useState } from 'react';

export default function FindId({ onSwitchView }) {
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setResult('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/find-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, birthDate }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult(`회원님의 아이디는 "${data.email}" 입니다.`);
      } else {
        setResult(data.error || '일치하는 정보가 없습니다.');
      }
    } catch (err) {
      setResult('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 mb-2">
        <p className="text-xs text-slate-400 leading-relaxed">
          가입 시 입력한 닉네임과 생년월일을 입력하시면 아이디를 찾을 수 있습니다.
        </p>
      </div>
      
      {result && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
          result.includes('아이디') 
            ? 'bg-emerald-500/10 border border-emerald-500/20' 
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          <span className={`text-xs font-medium ${result.includes('아이디') ? 'text-emerald-400' : 'text-red-400'}`}>
            {result}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 ml-1">닉네임</label>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <input 
            type="text" 
            placeholder="닉네임 입력" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-sm placeholder:text-slate-600"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 ml-1">생년월일</label>
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <input 
            type="date" 
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all text-sm [color-scheme:dark]"
            required
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={isSearching}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 active:scale-[0.98] text-white"
      >
        {isSearching ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            찾는 중...
          </span>
        ) : '아이디 찾기'}
      </button>
      
      <button 
        onClick={() => onSwitchView('login')} 
        className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors font-medium"
      >
        로그인으로 돌아가기
      </button>
    </form>
  );
}