import React from 'react';

export default function FindPw({ onSwitchView }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400 text-center mb-6">가입 시 입력한 이메일 주소를 입력해주세요.</p>
      
      <div className="space-y-2">
        <label className="text-xs text-slate-500 ml-1">이메일</label>
        <input 
          type="email" 
          placeholder="email@example.com" 
          className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none transition-all"
        />
      </div>

      <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold transition-all mt-4">
        임시 비밀번호 발송
      </button>
      
      <button 
        onClick={() => onSwitchView('login')} 
        className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        로그인으로 돌아가기
      </button>
    </div>
  );
}
