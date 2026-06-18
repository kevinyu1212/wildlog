import React from 'react';
import StaticPageLayout from '../../components/common/StaticPageLayout';

export default function About() {
  return (
    <StaticPageLayout title="사이트 소개" subtitle="WildLog — 자연을 기록하는 공동체">
      <p>
        WildLog는 야생 생물 관찰 기록을 사진·위치·분류 정보와 함께 남기고, 탐사대원들과 공유하는 생태 커뮤니티입니다.
      </p>
      <section>
        <h2 className="text-lg font-bold text-white mb-2">주요 기능</h2>
        <ul className="list-disc pl-5 space-y-1 text-slate-400">
          <li>분류군별 게시판 (포유류, 파충류, 양서류, 절지류, 곤충, 어류, 식물, 균류, 기타)</li>
          <li>GPS 기반 생물 지도 및 분포 확인</li>
          <li>탐사 미션 참여 및 달성률 추적</li>
          <li>관찰자 랭킹 및 커뮤니티 활동</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-2">운영 목표</h2>
        <p>
          시민 과학자들의 관찰 데이터를 모으고, 생물 다양성 보전에 기여하는 열린 플랫폼을 지향합니다.
        </p>
      </section>
    </StaticPageLayout>
  );
}
