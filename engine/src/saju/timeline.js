/* 원국(연/월/일/시주) + 대운 + 세운을 한꺼번에 합쳐서 관계(합충형파해, 천간합충)를 보는 모듈.
   sewoon.js의 sewoon()은 "세운이 끼어드는 관계만" 걸러서 보여주는 반면,
   이 모듈은 원국·대운·세운 전체를 다 합쳐 모든 관계(원국 내부끼리, 대운-세운끼리 포함)를
   거르지 않고 보여줌 — "이번 해에 전체적으로 어떤 관계가 겹쳐있는지" 종합적으로 보는 용도. */
const { GAN, JI } = require('./saju.js');
const { analyzeBranchRelations, analyzeStemRelations } = require('./relations.js');

// natalPillars: saju.js computeSaju().pillars
// daewoonPillar/sewoonPillar: {ganIdx, jiIdx} 형태. 둘 다 생략 가능.
// extraPillars: [{label, ganIdx, jiIdx}, ...] — 월운·일운처럼 더 짧은 주기를 추가로 합쳐보고 싶을 때. 생략 가능.
function combinedTimeline(natalPillars, daewoonPillar, sewoonPillar, extraPillars) {
  extraPillars = extraPillars || [];
  const branchInput = [], stemInput = [];
  ['year', 'month', 'day', 'hour'].forEach(k => {
    if (natalPillars[k]) {
      branchInput.push({ id: k, ji: JI[natalPillars[k].ji] });
      stemInput.push({ id: k, gan: GAN[natalPillars[k].gan] });
    }
  });
  if (daewoonPillar) {
    branchInput.push({ id: '대운', ji: JI[daewoonPillar.jiIdx] });
    stemInput.push({ id: '대운', gan: GAN[daewoonPillar.ganIdx] });
  }
  if (sewoonPillar) {
    branchInput.push({ id: '세운', ji: JI[sewoonPillar.jiIdx] });
    stemInput.push({ id: '세운', gan: GAN[sewoonPillar.ganIdx] });
  }
  extraPillars.forEach(p => {
    branchInput.push({ id: p.label, ji: JI[p.jiIdx] });
    stemInput.push({ id: p.label, gan: GAN[p.ganIdx] });
  });
  return {
    branchRelations: analyzeBranchRelations(branchInput),
    stemRelations: analyzeStemRelations(stemInput),
  };
}

module.exports = { combinedTimeline };
