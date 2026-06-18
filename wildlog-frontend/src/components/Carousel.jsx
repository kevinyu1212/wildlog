import React, { useState, useEffect } from 'react';

export default function Carousel() {
  const slides = [
    { 
      title: "🌱 야생동물 관측 일지", 
      desc: "나만의 생태 탐사 기록을 디지털로 남기고, 전 세계 탐사대원들과 공유하세요.",
      gradient: "from-emerald-500/20 to-transparent"
    },
    { 
      title: "🗺️ 실시간 분포 지도", 
      desc: "희귀 동물을 발견한 위치를 지도에 마커로 표시하고, 실시간 분포 데이터를 확인하세요.",
      gradient: "from-blue-500/20 to-transparent"
    },
    { 
      title: "🔭 탐사대원 커뮤니티", 
      desc: "분야별 전문가들과 정보를 교류하고, 함께하는 미션에 도전해보세요.",
      gradient: "from-orange-500/20 to-transparent"
    }
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index) => setCurrent(index);
  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);
  const next = () => setCurrent((current + 1) % slides.length);

  return (
    <div className="relative w-full h-72 md:h-80 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl group">
      {slides.map((slide, index) => (
        <div 
          key={index} 
          className={`absolute inset-0 transition-all duration-700 ease-in-out flex flex-col items-center justify-center p-8 md:p-16 text-center ${
            index === current ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-50`} />
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">{slide.title}</h2>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed">{slide.desc}</p>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-emerald-600/80 border border-white/10"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/40 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-emerald-600/80 border border-white/10"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-0 w-full flex justify-center gap-2.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 ${
              i === current 
                ? 'w-8 h-2 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30' 
                : 'w-2 h-2 bg-slate-600 hover:bg-slate-500 rounded-full'
            }`}
          />
        ))}
      </div>
    </div>
  );
}