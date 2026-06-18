import React from 'react';
import StaticPageLayout from '../../components/common/StaticPageLayout';

export default function Guide() {
  return (
    <StaticPageLayout title="이용안내" subtitle="WildLog를 처음 이용하시는 분을 위한 안내입니다.">
      <section>
        <h2 className="text-lg font-bold text-white mb-2">시작하기</h2>
        <ol className="list-decimal pl-5 space-y-2 text-slate-400">
          <li>회원가입 후 로그인합니다.</li>
          <li>홈 화면 또는 분류군 아이콘에서 관심 게시판으로 이동합니다.</li>
          <li>글쓰기 버튼으로 생물 이름, 사진, 본문, 위치(선택)를 입력해 관찰 기록을 남깁니다.</li>
        </ol>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-2">관찰 기록 작성 팁</h2>
        <ul className="list-disc pl-5 space-y-1 text-slate-400">
          <li>사진은 최대 5장까지 첨부할 수 있습니다.</li>
          <li>정확한 종명을 모를 경우 추정명을 기재하고, 댓글로 도움을 요청하세요.</li>
          <li>희귀종·보호종의 경우 과도한 위치 노출은 피해 주세요.</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-bold text-white mb-2">미션 참여</h2>
        <p>미션 페이지에서 진행 중인 탐사 미션을 확인하고, 참여 후 글 작성 시 미션 태그가 자동으로 연결됩니다.</p>
      </section>
    </StaticPageLayout>
  );
}
