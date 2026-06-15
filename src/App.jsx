import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';

// 🎯 1-2. GNB 서브 페이지 컴포넌트 실체화
const MissionsPage = () => (
  <div className="min-h-screen bg-slate-905 bg-slate-900 text-slate-100 p-8 font-sans">
    <div className="max-w-4xl mx-auto bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-emerald-400 mb-2 flex items-center gap-2">🎯 탐사 미션 센터</h2>
      <p className="text-sm text-slate-400 border-b border-slate-700 pb-4 mb-4">현재 배정된 야생생물 관측 및 생태계 보호 챌린지 구역입니다.</p>
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/60 text-xs text-slate-300">
        📌 진행 중인 미션: [지리산 반달가슴곰 위치 트래킹 가동] 외 3건
      </div>
      <button onClick={() => window.location.href = '/'} className="mt-6 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all">
        ← 메인 대시보드로 복귀
      </button>
    </div>
  </div>
);

const ObserversPage = () => (
  <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
    <div className="max-w-4xl mx-auto bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-emerald-400 mb-2 flex items-center gap-2">🔭 최우수 관찰자 랭킹</h2>
      <p className="text-sm text-slate-400 border-b border-slate-700 pb-4 mb-4">생태 보호 활동 점수 및 데이터 누적 기여도가 높은 정예 대원 명단입니다.</p>
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/60 text-xs text-slate-300">
        🏆 현재 1위 탐사원: 아발란체 (관찰 기록: 34회 / 탐사 종: 12종)
      </div>
      <button onClick={() => window.location.href = '/'} className="mt-6 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all">
        ← 메인 대시보드로 복귀
      </button>
    </div>
  </div>
);

const BiomeMapPage = () => (
  <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
    <div className="max-w-4xl mx-auto bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-emerald-400 mb-2 flex items-center gap-2">🗺️ 실시간 야생생물 발견 지도</h2>
      <p className="text-sm text-slate-400 border-b border-slate-700 pb-4 mb-4">국내 서식하는 희귀 야생동물들의 지리적 좌표 및 분포 현황 엔진입니다.</p>
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/60 text-xs text-slate-300">
        🗺️ [지리정보 커널 인터페이스 대기 중]
      </div>
      <button onClick={() => window.location.href = '/'} className="mt-6 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all">
        ← 메인 대시보드로 복귀
      </button>
    </div>
  </div>
);

const DummyMyPage = () => (
  <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
    <h2 className="text-2xl font-bold text-emerald-400 mb-4">🔒 내 정보 마이페이지 (DB 연동 인증)</h2>
    <button onClick={() => window.location.href = '/'} className="bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold">
      ← 홈으로 돌아가기
    </button>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mypage" element={<DummyMyPage />} />
        
        {/* GNB 전용 핵심 경로 개설 */}
        <Route path="/missions" element={<MissionsPage />} />
        <Route path="/observers" element={<ObserversPage />} />
        <Route path="/map" element={<BiomeMapPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}