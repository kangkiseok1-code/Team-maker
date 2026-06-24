/* 조후(調候) 보정 모듈 — 간이 버전.

   ===== 중요: 이건 궁통보감 정밀 표가 아닙니다 =====
   조후용신의 정통 출처인 궁통보감(窮通寶鑒)은 일간 10개 × 월 12개 = 120칸짜리 세부 표로,
   칸마다 주용신·보조용신이 따로 정해진 전문 자료입니다. 이 모듈은 그 정밀 표를 재현한 게
   아니라, "계절이 너무 덥거나 추우면 반대 기운(水/火)으로 식히거나 데워야 한다"는 조후의
   핵심 원리만 간단히 적용한 버전입니다. 실제 상담에서는 참고용으로만 쓰고, 정밀한 조후
   판단은 궁통보감 원전이나 기석님의 임상 기준으로 별도 검수해 주세요.

   ===== 적용 원리 =====
   - 월지 계절: 인묘진=봄, 사유오술→ 사오미=여름, 신유술=가을, 해자축=겨울.
     (※ 환절기 성격이 있는 진/미/술/축월은 다음 계절로의 전환점으로, 조후 긴급성이 더 낮음)
   - 여름(화 기운 강함)에 화/목 일간이면 한기(水) 필요, 겨울(수 기운 강함)에 수/금 일간이면
     온기(火) 필요 — 계절과 일간 오행이 같은 방향으로 겹칠 때 조후 긴급성이 가장 높음.
   - 봄/가을이나, 계절과 일간 오행이 반대로 상쇄되는 경우는 조후 긴급성을 낮게 봄. */
const { GAN_ELEM, JI } = require('./saju.js');

const SEASON_OF_JI = {
  인: '봄', 묘: '봄', 진: '봄',
  사: '여름', 오: '여름', 미: '여름',
  신: '가을', 유: '가을', 술: '가을',
  해: '겨울', 자: '겨울', 축: '겨울',
};

// 일간 오행이 해당 계절의 열기/한기를 가중시키는지 여부
const HEATS_UP = { 화: true, 목: true };   // 여름에 이 오행 일간이면 열기 가중
const COOLS_DOWN = { 수: true, 금: true }; // 겨울에 이 오행 일간이면 한기 가중

// natalPillars: saju.js computeSaju().pillars
function johuHint(natalPillars) {
  if (!natalPillars.month || !natalPillars.day) {
    throw new Error('조후 보정에는 월지·일간이 필요합니다.');
  }
  const monthJi = JI[natalPillars.month.ji];
  const dayElem = GAN_ELEM[natalPillars.day.gan];
  const season = SEASON_OF_JI[monthJi];

  let need = '중화', urgency = '낮음', note = '계절과 일간 오행이 한쪽으로 쏠리지 않아 조후 보정의 긴급성이 낮아요.';
  if (season === '여름') {
    need = '수';
    urgency = HEATS_UP[dayElem] ? '높음' : '보통';
    note = HEATS_UP[dayElem]
      ? '여름에 화/목 일간이라 열기가 겹쳐요. 수(水) 기운으로 식혀주는 게 도움이 될 수 있어요.'
      : '여름이지만 일간 오행이 열기를 더 키우는 쪽은 아니라, 수(水) 보정의 긴급성은 보통이에요.';
  } else if (season === '겨울') {
    need = '화';
    urgency = COOLS_DOWN[dayElem] ? '높음' : '보통';
    note = COOLS_DOWN[dayElem]
      ? '겨울에 수/금 일간이라 한기가 겹쳐요. 화(火) 기운으로 데워주는 게 도움이 될 수 있어요.'
      : '겨울이지만 일간 오행이 한기를 더 키우는 쪽은 아니라, 화(火) 보정의 긴급성은 보통이에요.';
  }

  return { season, monthJi, dayElem, need, urgency, note, isSimplified: true };
}

module.exports = { SEASON_OF_JI, johuHint };
