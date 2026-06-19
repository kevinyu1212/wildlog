import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import useBoards from '../../hooks/useBoards';

export default function MissionCreate() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { boards } = useBoards();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    target_count: 20,
    reward: '',
    end_date: ''
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/missions/new' }, replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (boards.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: boards[0] }));
    }
  }, [boards, formData.category]);

  const tagList = useMemo(() => (
    formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
      .slice(0, 8)
  ), [formData.tags]);

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/missions/new' } });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user?.id,
          target_count: Number(formData.target_count),
          end_date: formData.end_date || null
        })
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || '미션 생성 중 오류가 발생했습니다.');
        return;
      }

      alert('미션이 생성되었습니다.');
      navigate('/missions');
    } catch (err) {
      console.error(err);
      alert('미션 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 flex flex-col font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(true)} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-8 md:py-12">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <button
              type="button"
              onClick={() => navigate('/missions')}
              className="text-slate-500 hover:text-white transition-colors text-xs font-bold flex items-center gap-2 mb-5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              미션 목록으로
            </button>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-1.5 h-7 bg-gradient-to-b from-orange-500 to-orange-400 rounded-full"></span>
              <h1 className="text-2xl md:text-3xl font-bold text-white">미션 만들기</h1>
            </div>
            <p className="text-slate-500 ml-5">기록 조건과 자동 태그를 설정해 공동 관찰 목표를 만드세요.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/50 border border-slate-800/60 p-6 md:p-10 rounded-[2rem] shadow-2xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">미션 이름</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="예: 봄철 양서류 관찰"
                className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">분류군</label>
              <select
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm text-slate-200"
              >
                <option value="">전체</option>
                {boards.map(board => <option key={board} value={board}>{board}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">설명</label>
            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="어떤 관찰 기록이 미션에 해당하는지 구체적으로 적어주세요."
              className="w-full bg-slate-950 border border-slate-800/60 p-5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none text-sm leading-relaxed placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-3 p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">자동 태그</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => updateField('tags', e.target.value)}
              placeholder="반달가슴곰, 흔적, 지리산"
              className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm placeholder:text-slate-700"
            />
            <div className="flex flex-wrap gap-2 min-h-7">
              {tagList.length > 0 ? tagList.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-300">
                  #{tag}
                </span>
              )) : (
                <span className="text-xs text-slate-600">게시글 제목이나 내용에 태그가 포함되면 미션이 자동 연결됩니다.</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">목표 기록 수</label>
              <input
                type="number"
                min="1"
                required
                value={formData.target_count}
                onChange={(e) => updateField('target_count', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">보상</label>
              <input
                type="text"
                value={formData.reward}
                onChange={(e) => updateField('reward', e.target.value)}
                placeholder="예: 1,000 pt"
                className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm placeholder:text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">마감일</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800/60 p-3.5 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/missions')}
              className="w-full md:flex-1 bg-slate-800 hover:bg-slate-700 py-3.5 rounded-xl font-bold text-slate-400 transition-all text-sm border border-slate-700/50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:flex-[2] bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all text-sm text-white"
            >
              {isSubmitting ? '생성 중...' : '미션 생성하기'}
            </button>
          </div>
        </form>
      </main>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} boards={boards} />
      <Footer />
    </div>
  );
}
