import React from 'react';
import StaticPageLayout from '../../components/common/StaticPageLayout';

export default function Points() {
  return (
    <StaticPageLayout title="포인트 시스템 안내" subtitle="WildLog 활동 포인트 안내 — 탐사 활동으로 포인트를 모아보세요!">
      <section className="space-y-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⭐</span>
            <h2 className="text-lg font-bold text-white">포인트란?</h2>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            WildLog에서 탐사 기록, 댓글 작성, 좋아요 등 다양한 활동을 통해 포인트를 획득할 수 있습니다.
            포인트는 활동 점수로 누적되며, 관찰자 랭킹에 반영됩니다.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-emerald-400 rounded-full" />
          <h2 className="text-lg font-bold text-white">포인트 획득 방법</h2>
        </div>

        <div className="grid gap-4">
          {[
            { icon: '📝', title: '탐사 기록 등록', points: '+10P', desc: '새로운 관찰 기록을 게시판에 등록하면 포인트를 받습니다.' },
            { icon: '💬', title: '댓글 작성', points: '+3P', desc: '게시글에 댓글을 남기면 소통에 기여한 만큼 포인트를 받습니다.' },
            { icon: '❤️', title: '좋아요 받기', points: '+2P', desc: '다른 탐사대원이 내 게시글에 좋아요를 누르면 포인트를 받습니다.' },
            { icon: '🎯', title: '미션 참여', points: '+20P', desc: '미션에 참여해 기록을 등록하면 추가 보너스 포인트를 받습니다.' },
            { icon: '🏆', title: '미션 완료', points: '+50P', desc: '미션이 목표치를 달성하면 참여자에게 보너스 포인트가 지급됩니다.' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800/60 hover:border-emerald-500/20 transition-all">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-sm">{item.title}</h3>
                  <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">
                    {item.points}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-yellow-500 to-yellow-400 rounded-full" />
          <h2 className="text-lg font-bold text-white">포인트 활용</h2>
        </div>
        <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/10">
          <p className="text-sm text-slate-400 leading-relaxed">
            현재 포인트는 관찰자 랭킹 점수 산정에 활용됩니다. 향후 다양한 혜택(뱃지, 프로필 효과 등)이 추가될 예정입니다.
            많은 탐사 활동으로 포인트를 모아주세요!
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-blue-400 rounded-full" />
          <h2 className="text-lg font-bold text-white">포인트 적립 규칙</h2>
        </div>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>중복 적립 방지를 위해 동일 게시글에 대한 반복 활동은 포인트가 지급되지 않을 수 있습니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>포인트 내역은 마이페이지에서 확인할 수 있습니다.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>서비스 정책에 따라 포인트 획득 기준이 변경될 수 있습니다.</span>
          </li>
        </ul>
      </section>
    </StaticPageLayout>
  );
}