import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    console.log("📡 [DB 대조] 로그인 요청 송신 중...", { email });

    // 실제 SQLite DB 백엔드 포트(5000)로 전송
    fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error("이메일 또는 비밀번호가 데이터베이스 정보와 일치하지 않습니다.");
      }
      return res.json();
    })
    .then(data => {
      setIsLoading(false);
      if (data && data.token) {
        // 🔑 브라우저 로컬 스토리지에 진짜 보안 토큰 수납
        localStorage.setItem('token', data.token);
        
        alert(`🎉 DB 신원 검증 성공! ${data.username || '아발란체'} 대원님 환영합니다.`);
        
        // 헤더바가 새로고침되어 세션을 즉시 읽도록 홈으로 강제 이동
        window.location.href = '/'; 
      } else {
        setErrorMessage("서버 응답에 토큰 정보가 누락되었습니다.");
      }
    })
    .catch(err => {
      setIsLoading(false);
      console.error("💥 로그인 오류:", err);
      setErrorMessage(err.message || "백엔드 서버와 통신할 수 없습니다.");
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-3xl inline-block mb-1">🌱</div>
          <h2 className="text-2xl font-bold text-slate-100">WildLog</h2>
          <p className="text-xs text-slate-400 mt-1">야생동물 관측 및 생태 탐사 기록 일지</p>
          <h3 className="text-lg font-bold text-slate-200 mt-4">탐사대원 로그인 (DB 연동형)</h3>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-500/30 text-xs text-red-300 text-center">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">이메일 주소</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kevinyu1212@naver.com"
              className="w-full bg-[#1f2937] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="hjyu0404**"
              className="w-full bg-[#1f2937] border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#059669] hover:bg-[#10b981] text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-md disabled:opacity-50"
          >
            {isLoading ? "DB 신원 대조 중..." : "로그인하기"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 mt-6 pt-4 border-t border-slate-800">
          방금 등록한 실제 DB 계정으로 로그인이 진행됩니다.
        </div>
      </div>
    </div>
  );
}