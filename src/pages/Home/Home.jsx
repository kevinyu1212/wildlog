import React, { useState } from 'react';
import { Menu, LogIn, LogOut, Bell, Star, User, ChevronRight, Image as ImageIcon, Award, Compass, Map, ShieldAlert } from 'lucide-react';

const Home = () => {
  // 로그인 상태 및 사이드바 토글 상태 가상 정의 (개발용 시뮬레이션)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(105); // 99+ 테스트용

  const categories = ["포유류", "파충류", "양서류", "절지류", "곤충", "어류", "식물", "균류", "기타"];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      
      {/* 1-1. 헤더 바 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {/* 햄버거 버튼 */}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <Menu size={22} />
          </button>
          {/* 사이트 로고 */}
          <div className="text-xl font-black text-green-600 tracking-wider cursor-pointer select-none">
            WildLog
          </div>
        </div>

        {/* GNB (1-2) 및 글로벌 버튼 우측 배치 */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 font-semibold text-gray-600">
            <a href="/mission" className="hover:text-green-600 transition flex items-center gap-1"><Award size={16}/>미션</a>
            <a href="/observer" className="hover:text-green-600 transition flex items-center gap-1"><Compass size={16}/>관찰자</a>
            <a href="/map" className="hover:text-green-600 transition flex items-center gap-1"><Map size={16}/>생물 지도</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* 즐겨찾기 별 모양 버튼 */}
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-yellow-500 transition relative">
              <Star size={22} />
            </button>

            {/* 알림 버튼 (종 모양) */}
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-green-600 transition relative">
              <Bell size={22} />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full scale-90">
                  {notifications > 99 ? '99+' : notifications}
                </span>
              )}
            </button>

            {/* 프로필 버튼 및 가상 로그인 상태 토글 기능 */}
            <div className="flex items-center gap-2 border-l pl-3 border-gray-200">
              {isLoggedIn ? (
                <>
                  <button onClick={() => setIsLoggedIn(false)} className="p-1.5 text-xs bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300 transition flex items-center gap-1">
                    <LogOut size={12}/>로그아웃
                  </button>
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">홍길동님 환영합니다</span>
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center cursor-pointer font-bold shadow-inner">
                    U
                  </div>
                </>
              ) : (
                <>
                  <span className="text-xs text-gray-400 hidden sm:inline">로그인하세요</span>
                  <button onClick={() => setIsLoggedIn(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-green-600 transition flex items-center gap-1">
                    <LogIn size={22} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* 1-3. 좌측 사이드바 */}
        <aside className={${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-40}>
          {/* 프로필 카드 영역 */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 m-3 rounded-xl border">
            {isLoggedIn ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-700 font-bold text-xl rounded-full mx-auto flex items-center justify-center border shadow-sm cursor-pointer hover:opacity-80 transition">
                  P
                </div>
                <h4 className="font-bold text-gray-800 mt-2">레플리카집사</h4>
                <p className="text-xs text-gray-400 mt-0.5">가입일: 2026.06.12</p>
                <div className="grid grid-cols-3 gap-1 bg-white border border-gray-100 rounded-lg p-2 mt-3 text-center text-xs shadow-sm">
                  <div><span className="block font-bold text-gray-700">12</span><span className="text-[10px] text-gray-400">기록</span></div>
                  <div><span className="block font-bold text-gray-700">4</span><span className="text-[10px] text-gray-400">종수</span></div>
                  <div><span className="block font-bold text-gray-700">35</span><span className="text-[10px] text-gray-400">댓글</span></div>
                </div>
                <div className="mt-3 flex gap-2 justify-center text-xs">
                  <button className="text-gray-500 hover:underline">계정 설정</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => setIsLoggedIn(false)} className="text-red-500 hover:underline">로그아웃</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">로그인하세요</p>
                <button onClick={() => setIsLoggedIn(true)} className="w-full bg-green-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-700 shadow-sm transition">
                  로그인 하러가기
                </button>
              </div>
            )}
          </div>

          {/* 게시판 카테고리 링크 바 */}
          <div className="flex-1 px-3 py-2 space-y-1">
            <p className="text-[11px] font-bold text-gray-400 px-3 uppercase tracking-wider mb-2">분류군별 게시판</p>
            {categories.map((cat, idx) => (
              <a key={idx} href="/board" className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-green-50 hover:text-green-700 transition">
                <span>{cat} 게시판</span>
                <ChevronRight size={14} className="text-gray-300" />
              </a>
            ))}
          </div>
        </aside>

        {/* 메인 화면 영역 */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          
          {/* 1-4. 캐러셀 (기능 소개 영역 배너 임시 구현) */}
          <section className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
            <div className="relative z-10 max-w-md">
              <span className="bg-green-500/30 text-green-100 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Feature Introduction</span>
              <h2 className="text-3xl font-extrabold mt-2 leading-tight">희귀 반려동물을 위한 최적의 관찰 도감 일지</h2>
              <p className="text-green-100 text-sm mt-2 font-medium opacity-90">자신만의 특별한 파충류, 양서류, 절지류 생장 일기를 기록하고 지도 브라우저를 통해 생태계 맵을 빌드하세요.</p>
            </div>
            <div className="absolute right-6 bottom-0 top-0 hidden lg:flex items-center text-green-500/20 pointer-events-none">
              <Compass size={240} className="transform rotate-12" />
            </div>
          </section>

          {/* 1-5. 퀵 카테고리 네비게이터 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">🧭 퀵 카테고리 네비게이터</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
              {categories.map((cat, idx) => (
                <a key={idx} href="/board" className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-green-500 hover:text-green-600 transition group">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-green-50 group-hover:text-green-600 transition">
                    <Compass size={20} />
                  </div>
                  <span className="text-xs font-bold">{cat}</span>
                </a>
              ))}
            </div>
          </section>

          {/* 1-6. 홈 메인 콘텐츠 영역 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 실시간 최신 관찰 피드 Grid */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">📸 실시간 최신 관찰 피드</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((feed) => (
                  <div key={feed} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
                    <div className="aspect-square bg-gray-100 flex flex-col items-center justify-center text-gray-400 border-b">
                      <ImageIcon size={32} strokeWidth={1.5} />
                      <span className="text-[10px] mt-1 text-gray-400">Observation Sample #{feed}</span>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-sm text-gray-800 truncate">크레센티드 게코 관찰기</h4>
                      <p className="text-xs text-gray-400 mt-1 flex justify-between"><span>@집사A</span> <span>2분 전</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 핫 미션 & 우수 관찰자 랭킹 */}
            <div className="space-y-6">
              {/* 핫 미션 */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2"><Award size={18} className="text-orange-500"/>🔥 진행 중인 핫 미션</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-700">도마뱀 사진 5장 업로드</span>
                      <span className="text-green-600">75%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full w-[75%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-700">희귀 곤충 도감 마킹하기</span>
                      <span className="text-green-600">40%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full w-[40%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 우수 관찰자 TOP 3 */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">🏆 이달의 우수 관찰자 TOP 3</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50/50 border border-yellow-100">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-yellow-600 w-4 text-center">1</span>
                      <div className="w-7 h-7 rounded-full bg-yellow-400 text-white font-bold text-xs flex items-center justify-center">A</div>
                      <span className="text-sm font-bold text-gray-700">파충류마스터</span>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">42종 기록</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50 border border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-gray-400 w-4 text-center">2</span>
                      <div className="w-7 h-7 rounded-full bg-gray-300 text-white font-bold text-xs flex items-center justify-center">B</div>
                      <span className="text-sm font-bold text-gray-700">절지류수집가</span>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold">38종 기록</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/30 border border-orange-100">
                    <div className="flex items-center gap-2.5">
                      <span className="font-black text-orange-600 w-4 text-center">3</span>
                      <div className="w-7 h-7 rounded-full bg-orange-300 text-white font-bold text-xs flex items-center justify-center">C</div>
                      <span className="text-sm font-bold text-gray-700">어류도감왕</span>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">31종 기록</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 1-7. 푸터 */}
      <footer className="bg-gray-800 text-gray-400 text-xs py-6 px-4 border-t border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap justify-center gap-6 text-gray-300 font-medium">
            <a href="#" className="hover:underline">이용약관</a>
            <a href="#" className="hover:underline">사이트 소개</a>
            <a href="#" className="hover:underline">개인정보처리방침</a>
            <a href="#" className="hover:underline">이용안내</a>
            <a href="#" className="text-green-400 hover:underline">모바일버전 UI</a>
          </div>
          <div className="text-center md:text-right text-gray-500">
            &copy; 2026 MyPetLog - WildLog Project. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;