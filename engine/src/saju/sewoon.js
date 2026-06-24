/* 세운(歲運) 모듈: 특정 연도의 연주(年柱)를 구하고, 그 연주가 본인 사주(연/월/일/시주)와
   맺는 관계(합·충·형·파·해, 천간합·충)를 분석함.
   연주는 입춘(立春) 기준으로 해가 바뀌므로, 절기 경계 모호함을 피하기 위해
   그 해 6월 15일(연중 안전한 날짜)을 기준으로 계산해 연주를 추출함. */
const manse = require('./manse-inline.js');
const { GAN, JI, pillarToIdx } = require('./saju.js');
const { analyzeBranchRelations, analyzeStemRelations } = require('./relations.js');

const SEWOON_ID = '세운';

function getYearPillar(year) {
  if (year >= 1900 && year <= 2050) {
    const res = manse.calculateSaju(year, 6, 15);
    return pillarToIdx(res.yearPillar);
  }
  // 라이브러리 지원 범위 밖: 60갑자 주기로 직접 계산.
  // 1984 = 갑자(GAN[0], JI[0]) 기준으로 검증됨(2024=갑진, 2026=병오 등 기존 테스트 일치).
  const gan = ((year - 1984) % 10 + 10) % 10;
  const ji  = ((year - 1984) % 12 + 12) % 12;
  return { gan, ji };
}

// relResult: analyzeBranchRelations/analyzeStemRelations의 반환값({key: [...,{ids:[...]}]} 형태).
// 세운(SEWOON_ID)을 포함하는 관계만 남김 — 본인 사주 내부끼리의 관계(이미 별도 분석 가능)는 제외.
function filterInvolving(relResult, id) {
  const out = {};
  Object.keys(relResult).forEach(k => {
    out[k] = relResult[k].filter(r => r.ids.includes(id));
  });
  return out;
}

// natalPillars: saju.js computeSaju().pillars (year/month/day/hour 각 {gan,ji} 또는 null)
function sewoon(natalPillars, year) {
  const yp = getYearPillar(year);
  const branchInput = [{ id: SEWOON_ID, ji: JI[yp.ji] }];
  const stemInput = [{ id: SEWOON_ID, gan: GAN[yp.gan] }];
  ['year', 'month', 'day', 'hour'].forEach(k => {
    if (natalPillars[k]) {
      branchInput.push({ id: k, ji: JI[natalPillars[k].ji] });
      stemInput.push({ id: k, gan: GAN[natalPillars[k].gan] });
    }
  });
  return {
    year,
    gan: GAN[yp.gan], ji: JI[yp.ji],
    ganIdx: yp.gan, jiIdx: yp.ji,
    branchRelations: filterInvolving(analyzeBranchRelations(branchInput), SEWOON_ID),
    stemRelations: filterInvolving(analyzeStemRelations(stemInput), SEWOON_ID),
  };
}

module.exports = { getYearPillar, sewoon };
