/* 신살(神殺) 모듈 — 핵심 5종만 선별 구현: 천을귀인·도화살·역마살·화개살·양인살.
   신살은 종류가 수십~수백 가지이고 명리학자마다 사용 여부와 산출법이 크게 갈리는,
   유파차가 가장 큰 영역 중 하나임(나무위키·여러 출처에서 공통적으로 언급).
   그래서 다 만들지 않고, 가장 널리 합의되고 산출법이 비교적 명확한 5종만 추려서 구현함.

   ===== 산출법 출처 =====
   - 천을귀인: 연해자평의 고전 구결 "甲戊兼牛羊, 乙己鼠猴鄕, 丙丁猪鷄位, 壬癸蛇兔藏, 庚辛逢虎馬"
   - 도화살(년살)·역마살·화개살: 일지(또는 연지)가 속한 삼합국 기준 산출.
     · 도화 = 자신의 삼합국 "전 계절" 삼합의 왕지 (예: 申子辰水국 → 전 계절 금국(巳酉丑)의 왕지 酉)
     · 역마 = 자신의 삼합국 생지를 충(沖)하는 지지
     · 화개 = 자신의 삼합국 고지(묘지, 3번째 글자)
     이 셋은 검증 시 서로 다른 두 가지 도출 방식(전계절왕지/충/고지)이 동일한 결과로 수렴해
     교차 검증됨.
   - 양인살: 일간이 양간(甲丙戊庚壬)일 때만 성립, 화토동법으로 무토=병화와 동일.
     음간(乙丁己辛癸)은 양인살 대상 아님(여러 출처에서 공통 확인).

   ===== 기준 안내 (유파차) =====
   도화살은 일지(日支) 기준 산출이 현대 주류이나, 전통적으로는 연지(年支) 기준을 쓰는 유파도
   있음(여기서는 현대 주류인 일지 기준으로 구현). */
const { TRIO_COMBO } = require('./relations.js');

const CHEONEUL = {
  갑: ['축','미'], 무: ['축','미'],
  을: ['자','신'], 기: ['자','신'],
  병: ['해','유'], 정: ['해','유'],
  임: ['사','묘'], 계: ['사','묘'],
  경: ['인','오'], 신: ['인','오'],
};

const TRIO_TO_DOHWA  = { 인오술: '묘', 사유축: '오', 신자진: '유', 해묘미: '자' };
const TRIO_TO_YEOKMA = { 인오술: '신', 사유축: '해', 신자진: '인', 해묘미: '사' };
const TRIO_TO_HWAGAE = { 인오술: '술', 사유축: '축', 신자진: '진', 해묘미: '미' };

// 일간이 양간일 때만 성립(화토동법으로 무토는 병화와 같음)
const YANGIN = { 갑: '묘', 병: '오', 무: '오', 경: '유', 임: '자' };

function trioKeyOf(ji) {
  const t = TRIO_COMBO.find(t => t.members.includes(ji));
  return t ? t.members.join('') : null;
}

// branches: [{id, ji}] (연/월/일/시 지지). dayGan: 일간(한글 1글자).
function findSinsal(branches, dayGan) {
  const result = { cheoneul: [], dohwa: [], yeokma: [], hwagae: [], yangin: [] };

  const cheoneulJi = CHEONEUL[dayGan] || [];
  branches.forEach(b => { if (cheoneulJi.includes(b.ji)) result.cheoneul.push(b); });

  // 도화·역마·화개는 일지(day) 기준 — day branch가 없으면 판단 불가.
  const dayBranch = branches.find(b => b.id === 'day');
  if (dayBranch) {
    const trioKey = trioKeyOf(dayBranch.ji);
    if (trioKey) {
      const dohwaJi = TRIO_TO_DOHWA[trioKey];
      const yeokmaJi = TRIO_TO_YEOKMA[trioKey];
      const hwagaeJi = TRIO_TO_HWAGAE[trioKey];
      branches.forEach(b => {
        if (b.ji === dohwaJi) result.dohwa.push(b);
        if (b.ji === yeokmaJi) result.yeokma.push(b);
        if (b.ji === hwagaeJi) result.hwagae.push(b);
      });
    }
  }

  const yanginJi = YANGIN[dayGan];
  if (yanginJi) branches.forEach(b => { if (b.ji === yanginJi) result.yangin.push(b); });

  return result;
}

module.exports = { CHEONEUL, TRIO_TO_DOHWA, TRIO_TO_YEOKMA, TRIO_TO_HWAGAE, YANGIN, findSinsal };
