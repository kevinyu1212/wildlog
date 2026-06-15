import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [view, setView] = useState('login'); // login, findId, findPw, register
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-emerald-400 text-center">
          {view === 'login' ? '로그인' : view === 'findId' ? '아이디 찾기' : view === 'findPw' ? '비밀번호 찾기' : '회원가입'}
        </h2>

        {view === 'login' && (
          <div className="space-y-4">
            <input type="email" placeholder="이메일" className="w-full p-3 bg-slate-800 rounded border border-slate-700" />
            <input type="password" placeholder="비밀번호" className="w-full p-3 bg-slate-800 rounded border border-slate-700" />
            <button className="w-full bg-emerald-600 py-3 rounded font-bold hover:bg-emerald-500">로그인</button>
            <div className="flex justify-center gap-4 text-sm text-slate-400">
              <button onClick={() => setView('findId')}>아이디 찾기</button>
              <button onClick={() => setView('findPw')}>비밀번호 찾기</button>
              <button onClick={() => setView('register')} className="text-emerald-400">회원가입</button>
            </div>
          </div>
        )}

        {view === 'register' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="email" placeholder="이메일" className="flex-1 p-2 bg-slate-800 rounded border" />
              <button className="bg-slate-700 px-3 rounded text-xs">중복확인</button>
            </div>
            <input type="password" placeholder="비밀번호 (8자 이상, 영문/숫자/특수문자)" className="w-full p-2 bg-slate-800 rounded border" />
            <input type="password" placeholder="비밀번호 확인" className="w-full p-2 bg-slate-800 rounded border" />
            <div className="flex gap-2">
              <input type="text" placeholder="닉네임 (2~20자)" className="flex-1 p-2 bg-slate-800 rounded border" />
              <button className="bg-slate-700 px-3 rounded text-xs">중복확인</button>
            </div>
            <input type="date" className="w-full p-2 bg-slate-800 rounded border" />
            <select className="w-full p-2 bg-slate-800 rounded border">
              <option>보안 질문 선택</option>
              <option>초등학교 때 별명은?</option>
              <option>첫 번째 반려동물 이름은?</option>
              <option>어머니의 고향은?</option>
              <option>가장 좋아하는 영화는?</option>
              <option>첫 직장 이름은?</option>
            </select>
            <input type="text" placeholder="보안 질문 답변" className="w-full p-2 bg-slate-800 rounded border" />
            <button className="w-full bg-emerald-600 py-3 rounded font-bold mt-4">가입 완료</button>
            <button onClick={() => setView('login')} className="w-full text-sm text-slate-500">취소</button>
          </div>
        )}
        
        {/* 아이디/비밀번호 찾기 로직은 위와 동일한 방식으로 추가 가능 */}
      </div>
    </div>
  );
}