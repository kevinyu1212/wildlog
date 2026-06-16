import React from 'react';

export default function FindId({ onSwitchView }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400 text-center mb-6">가입 시 입력한 닉네임과 생년월일을 입력해주세요.</p>
      
      <div className="space-y-2">
        <label className="text-xs text-slate-500 ml-1">닉네임</label>
        <input 
          type="text" 
          placeholder="닉네임 입력" 
          className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none transition-all"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-xs text-slate-500 ml-1">생년월일</label>
        <input 
          type="date" 
          className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none transition-all"
        />
      </div>

      <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold transition-all mt-4">
        아이디 찾기
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
