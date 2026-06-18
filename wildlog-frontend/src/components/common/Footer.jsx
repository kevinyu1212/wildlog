import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMobileView } from '../../context/MobileViewContext';

const footerLinks = [
  { name: '이용약관', path: '/terms' },
  { name: '사이트 소개', path: '/about' },
  { name: '개인정보처리방침', path: '/privacy' },
  { name: '이용안내', path: '/guide' },
];

export default function Footer() {
  const navigate = useNavigate();
  const { isMobileView, toggleMobileView } = useMobileView();

  return (
    <footer className="border-t border-slate-800/60 bg-slate-900/30 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6 text-xs text-slate-500">
          {footerLinks.map(item => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="hover:text-emerald-400 transition-colors font-medium"
            >
              {item.name}
            </button>
          ))}
          <button
            onClick={toggleMobileView}
            className={`font-medium transition-colors ${
              isMobileView
                ? 'text-emerald-400'
                : 'text-slate-500 hover:text-emerald-400'
            }`}
          >
            {isMobileView ? '모바일 버전 ON' : '모바일 버전'}
          </button>
        </div>
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">🌿</span>
            <p className="text-emerald-400 font-bold text-lg">WildLog</p>
          </div>
          <p className="text-[10px] text-slate-600 font-medium">© 2026 WildLog Project. All rights reserved.</p>
          <p className="text-[10px] text-slate-700">Biological Observation Community & Database</p>
        </div>
      </div>
    </footer>
  );
}
