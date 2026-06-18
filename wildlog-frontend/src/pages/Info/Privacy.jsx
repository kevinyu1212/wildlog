import React from 'react';
import StaticPageLayout from '../../components/common/StaticPageLayout';

export default function Privacy() {
  return (
    <StaticPageLayout title="개인정보처리방침" subtitle="WildLog가 수집·이용하는 개인정보에 관한 안내입니다.">
      <section>
        <h2 className="text-lg font-bold text-white mb-2">1. 수집하는 개인정보</h2>
        <p>회원가입 시 이메일, 비밀번호, 닉네임, 생년월일, 보안 질문·답변을 수집합니다. 서비스 이용 과정에서 프로필 사진, 관찰 게시글, 위치 정보(선택)가 추가될 수 있습니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-2">2. 이용 목적</h2>
        <p>회원 식별, 서비스 제공, 커뮤니티 기능 운영, 알림 발송, 부정 이용 방지 목적으로 개인정보를 이용합니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-2">3. 보관 및 파기</h2>
        <p>회원 탈퇴 시 관련 개인정보는 지체 없이 파기합니다. 알림 내역은 최대 30일간 보관 후 자동 삭제됩니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-2">4. 문의</h2>
        <p>개인정보 관련 문의는 WildLog 운영팀 이메일로 연락해 주시기 바랍니다.</p>
      </section>
    </StaticPageLayout>
  );
}
