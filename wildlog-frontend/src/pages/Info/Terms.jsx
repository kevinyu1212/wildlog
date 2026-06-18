import React from 'react';
import StaticPageLayout from '../../components/common/StaticPageLayout';

export default function Terms() {
  return (
    <StaticPageLayout title="이용약관" subtitle="WildLog 서비스 이용에 관한 약관입니다.">
      <section>
        <h2 className="text-lg font-bold text-white mb-2">제1조 (목적)</h2>
        <p>본 약관은 WildLog(이하 &quot;서비스&quot;)가 제공하는 생물 관찰 기록 및 커뮤니티 기능의 이용 조건과 절차를 규정함을 목적으로 합니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-2">제2조 (회원의 의무)</h2>
        <p>회원은 타인의 저작권·초상권을 침해하지 않도록 주의해야 하며, 허위 관찰 기록을 게시해서는 안 됩니다. 야생동물 보호를 위해 민감한 서식지 정보는 과도하게 공개하지 않도록 합니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-2">제3조 (서비스 제공)</h2>
        <p>서비스는 게시판, 생물 지도, 미션, 관찰자 랭킹 등의 기능을 제공합니다. 운영상 필요한 경우 사전 공지 후 일부 기능을 변경·중단할 수 있습니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-2">제4조 (면책)</h2>
        <p>회원이 게시한 관찰 정보의 정확성에 대해 서비스는 보증하지 않으며, 회원 간 분쟁은 당사자 간 해결을 원칙으로 합니다.</p>
      </section>
    </StaticPageLayout>
  );
}
