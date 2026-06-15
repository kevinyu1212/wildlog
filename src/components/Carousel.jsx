import React, { useState, useEffect } from 'react';

export default function Carousel() {
  const slides = [
    { title: "🌱 야생동물 관측 일지", desc: "나만의 생태 탐사 기록을 디지털로 남기세요." },
    { title: "🗺️ 실시간 분포 지도", desc: "희귀 동물을 발견한 위치를 지도로 공유하세요." },
    { title: "🔭 탐사대원 커뮤니티", desc: "분야별 전문가들과 정보를 교류해보세요." }
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-2xl bg-slate-800 border border-slate-700">
      {slides.map((slide, index) => (
        <div key={index} className={`absolute w-full h-full transition-opacity duration-1000 flex flex-col items-center justify-center p-8 text-center ${index === current ? 'opacity-100' : 'opacity-0'}`}>
          <h2 className="text-3xl font-bold text-emerald-400 mb-4">{slide.title}</h2>
          <p className="text-slate-300">{slide.desc}</p>
        </div>
      ))}
      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2">
        {slides.map((_, i) => <div key={i} className={`h-2 w-2 rounded-full ${i === current ? 'bg-emerald-500' : 'bg-slate-600'}`} />)}
      </div>
    </div>
  );
}