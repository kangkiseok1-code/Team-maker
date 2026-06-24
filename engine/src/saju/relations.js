/* 지지(地支)·천간(天干) 관계 분석 엔진: 합(육합·삼합·반합·방합) · 충 · 형 · 파 · 해.
   사주 1개 안의 지지 4개(연/월/일/시)끼리의 관계든, 두 사람 사주의 지지를 합친 관계(궁합용)든
   동일한 함수로 분석 가능 — 입력은 {id, ji}(지지) 또는 {id, gan}(천간) 배열 하나로 통일.

   ===== 외부 라이브러리 대조 검증 기록 (2026-06) =====
   MIT 라이선스 npm 패키지 @aharris02/bazi-calculator-by-alvamind 소스코드와 직접 대조함.
   - 완전 일치 확인: 육합 6쌍, 삼합 4국(생왕묘 구성), 충 6쌍, 해(害) 6쌍, 파(破) 6쌍
     (파의 경우 그 라이브러리는 "Destructions"라는 이름을 쓰지만 동일한 6쌍이고,
      인해/사신이 합과 파에 동시 해당하는 "합처봉파" 현상도 똑같이 나타남 — 교차검증 완료)
   - 유파차 확인(오류 아님, 둘 다 통용되는 입장):
     · 오미합: 우리는 化기 없음(elem:null)으로 처리. 그 라이브러리는 화(火)를 기본값으로 처리.
     · 삼형 명칭: 우리는 인사신=무은지형/축술미=지세지형(검색 결과 다수설과 일치).
       그 라이브러리는 반대로 표기 — 나무위키에도 "고서마다 술사마다 다르다"고 명시된 영역.
   - 대조하며 발견해서 이번에 추가한 것(아래 3가지):
     1) 방합(方合) — 우리 모듈에 전혀 없었음
     2) 천간 합·충(간합·간충) — 지지만 다루고 천간 관계는 아예 없었음
     3) 부분(2/3) 삼형 — "3글자 다 있어야 형"으로 너무 보수적으로 스코프를 좁혔던 부분.
        검색 결과(사주 블로그) + 그 라이브러리 둘 다 2글자만 있어도 약하게 형 성립을 인정.

   유파 안내:
   - 육합·삼합·반합·방합·충·형(삼형/자묘형/자형)·천간합은 대부분의 유파가 동의하는 영역.
   - 파(破)·해(害)·천간충은 용신처럼 유파 차이가 더 큰 영역이라, 실제 상담에 쓰기 전 직접 검수 필요.
   - 인해합/사신합은 동시에 파(破)에도 해당함 — "합처봉파(合處逢破)"라 불리는 고전 이론으로,
     계산 오류가 아니라 전통 이론을 그대로 반영한 것임.
*/

// 육합(六合): 두 지지가 짝을 이루는 합. 오미합은 化기 없음(불변)으로 보는 게 일반적이라 elem:null.
const SIX_COMBO = [
  { pair: ['자', '축'], elem: '토' },
  { pair: ['인', '해'], elem: '목' },
  { pair: ['묘', '술'], elem: '화' },
  { pair: ['진', '유'], elem: '금' },
  { pair: ['사', '신'], elem: '수' },
  { pair: ['오', '미'], elem: null }, // 오미합: 化기 없음(불변)으로 보는 게 일반적
];

// 삼합(三合): 생지-왕지-묘지 3글자가 모여 오행 국(局)을 이룸. 왕지 포함 2글자만 있으면 반합.
const TRIO_COMBO = [
  { members: ['신', '자', '진'], elem: '수' }, // 생-왕-묘
  { members: ['해', '묘', '미'], elem: '목' },
  { members: ['인', '오', '술'], elem: '화' },
  { members: ['사', '유', '축'], elem: '금' },
];

// 방합(方合): 계절별로 인접한 지지 3개가 모여 그 계절의 오행을 이룸. 삼합과 달리 생왕묘 역할 구분 없음.
// (삼합의 반합처럼 "2글자만 있어도 절반 인정"은 통용도가 낮아 이번엔 3글자 완성만 인정)
const BANG_HAP = [
  { members: ['인', '묘', '진'], elem: '목', season: '봄' },
  { members: ['사', '오', '미'], elem: '화', season: '여름' },
  { members: ['신', '유', '술'], elem: '금', season: '가을' },
  { members: ['해', '자', '축'], elem: '수', season: '겨울' },
];

// 충(沖): 정반대 지지 6쌍
const CLASH = [['자','오'],['축','미'],['인','신'],['묘','유'],['진','술'],['사','해']];

// 형(刑): 삼형 2종(2글자만 있어도 부분 성립) + 자묘형(쌍) + 자형(같은 글자 반복)
const PUNISH_TRIO = [
  { members: ['인','사','신'], name: '무은지형' },
  { members: ['축','술','미'], name: '지세지형' },
];
const PUNISH_PAIR = [['자','묘']]; // 무례지형
const PUNISH_SELF = ['진','오','유','해']; // 자형 (같은 지지 2개 이상)

// 파(破): 유파 차이 있는 영역 — 가장 널리 쓰이는 표를 채택
const BREAK = [['자','유'],['묘','오'],['사','신'],['인','해'],['축','진'],['미','술']];

// 해(害): 유파 차이 있는 영역
const HARM = [['자','미'],['축','오'],['인','사'],['묘','진'],['신','해'],['유','술']];

// 천간합(干合): 천간끼리의 5쌍 합. 비교적 정설 영역.
const GAN_HAP = [
  { pair: ['갑','기'], elem: '토' },
  { pair: ['을','경'], elem: '금' },
  { pair: ['병','신'], elem: '수' },
  { pair: ['정','임'], elem: '목' },
  { pair: ['무','계'], elem: '화' },
];

// 천간충(干沖): 표준적으로 인정되는 4쌍만 채택(갑경/을신/병임/정계).
// 일부 자료는 무임·기계도 충으로 보지만, 토(戊己)는 본래 대칭 짝이 없어 논쟁적인 확장이라 제외.
const GAN_CHUNG = [['갑','경'],['을','신'],['병','임'],['정','계']];

function matchPair(a, b, pair) {
  return (a === pair[0] && b === pair[1]) || (a === pair[1] && b === pair[0]);
}

function findSixCombos(branches) {
  const out = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const bi = branches[i], bj = branches[j];
      SIX_COMBO.forEach(c => {
        if (matchPair(bi.ji, bj.ji, c.pair)) {
          out.push({ type: '육합', ids: [bi.id, bj.id], jis: [bi.ji, bj.ji], elem: c.elem });
        }
      });
    }
  }
  return out;
}

function findTrioCombos(branches) {
  const combos3 = [], halfCombos = [];
  TRIO_COMBO.forEach(t => {
    const [saeng, wang, myo] = t.members;
    const saengB = branches.filter(b => b.ji === saeng);
    const wangB = branches.filter(b => b.ji === wang);
    const myoB = branches.filter(b => b.ji === myo);
    if (saengB.length && wangB.length && myoB.length) {
      combos3.push({ type: '삼합', ids: [saengB[0].id, wangB[0].id, myoB[0].id], jis: [saeng, wang, myo], elem: t.elem });
    } else if (wangB.length && (saengB.length || myoB.length)) {
      const otherB = saengB.length ? saengB[0] : myoB[0];
      const otherJi = saengB.length ? saeng : myo;
      halfCombos.push({ type: '반합', ids: [wangB[0].id, otherB.id], jis: [wang, otherJi], elem: t.elem });
    }
  });
  return { combos3, halfCombos };
}

// 방합: 3글자 모두 있을 때만 인정(반방합 개념은 통용도가 낮아 미구현)
function findBangHap(branches) {
  const out = [];
  BANG_HAP.forEach(t => {
    const found = t.members.map(m => branches.filter(b => b.ji === m));
    if (found.every(f => f.length)) {
      out.push({ type: '방합', ids: found.map(f => f[0].id), jis: t.members, elem: t.elem, season: t.season });
    }
  });
  return out;
}

function findPairs(branches, pairList, type) {
  const out = [];
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const bi = branches[i], bj = branches[j];
      pairList.forEach(p => {
        if (matchPair(bi.ji, bj.ji, p)) {
          out.push({ type, ids: [bi.id, bj.id], jis: [bi.ji, bj.ji] });
        }
      });
    }
  }
  return out;
}

// 삼형: 3글자 모두 있으면 '삼형'(완전), 2글자만 있으면 '형(부분)'(약하게 성립)
function findPunishTrio(branches) {
  const full = [], partial = [];
  PUNISH_TRIO.forEach(t => {
    const found = t.members.map(m => branches.filter(b => b.ji === m));
    const presentIdx = found.map((f, i) => (f.length ? i : null)).filter(i => i !== null);
    if (presentIdx.length === 3) {
      full.push({ type: '삼형', name: t.name, ids: found.map(f => f[0].id), jis: t.members });
    } else if (presentIdx.length === 2) {
      partial.push({
        type: '형(부분)', name: t.name,
        ids: presentIdx.map(i => found[i][0].id),
        jis: presentIdx.map(i => t.members[i]),
      });
    }
  });
  return { full, partial };
}

function findSelfPunish(branches) {
  const out = [];
  PUNISH_SELF.forEach(ji => {
    const occ = branches.filter(b => b.ji === ji);
    if (occ.length >= 2) {
      out.push({ type: '자형', ids: occ.map(o => o.id), jis: occ.map(() => ji) });
    }
  });
  return out;
}

// branches: [{id, ji}] — id는 호출하는 쪽이 부여하는 출처 식별자 (예: 'year','month' 또는 'A-day','B-day')
function analyzeBranchRelations(branches) {
  const trio = findTrioCombos(branches);
  const punishTrio = findPunishTrio(branches);
  return {
    combos6: findSixCombos(branches),
    combos3: trio.combos3,
    halfCombos: trio.halfCombos,
    bangHap: findBangHap(branches),
    clashes: findPairs(branches, CLASH, '충'),
    punishTrio: punishTrio.full,
    punishTrioPartial: punishTrio.partial,
    punishPair: findPairs(branches, PUNISH_PAIR, '형'),
    punishSelf: findSelfPunish(branches),
    breaks: findPairs(branches, BREAK, '파'),
    harms: findPairs(branches, HARM, '해'),
  };
}

// stems: [{id, gan}] — 천간 관계(간합·간충) 분석. 지지 분석과 별개 함수로 분리.
function analyzeStemRelations(stems) {
  const hap = [], chung = [];
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const si = stems[i], sj = stems[j];
      GAN_HAP.forEach(c => {
        if (matchPair(si.gan, sj.gan, c.pair)) {
          hap.push({ type: '천간합', ids: [si.id, sj.id], gans: [si.gan, sj.gan], elem: c.elem });
        }
      });
      GAN_CHUNG.forEach(p => {
        if (matchPair(si.gan, sj.gan, p)) {
          chung.push({ type: '천간충', ids: [si.id, sj.id], gans: [si.gan, sj.gan] });
        }
      });
    }
  }
  return { hap, chung };
}

module.exports = {
  SIX_COMBO, TRIO_COMBO, BANG_HAP, CLASH, PUNISH_TRIO, PUNISH_PAIR, PUNISH_SELF, BREAK, HARM,
  GAN_HAP, GAN_CHUNG,
  analyzeBranchRelations, analyzeStemRelations
};
