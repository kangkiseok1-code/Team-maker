const test = require('node:test');
const assert = require('node:assert');
const { computeSaju, GAN, JI } = require('../src/saju/saju.js');
const { combinedTimeline } = require('../src/saju/timeline.js');

test('원국(인/유/자/진) + 대운(무술) + 세운(병오) 합치면 인오술 삼합(화국)이 연-세운-대운 사이에 새로 생김', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const daewoonPillar = { ganIdx: GAN.indexOf('무'), jiIdx: JI.indexOf('술') };
  const sewoonPillar = { ganIdx: GAN.indexOf('병'), jiIdx: JI.indexOf('오') };
  const r = combinedTimeline(natal, daewoonPillar, sewoonPillar);

  const trio = r.branchRelations.combos3.find(c => c.elem === '화');
  assert.ok(trio, '인오술 화국 삼합이 발견되어야 함');
  assert.deepStrictEqual(trio.ids.sort(), ['year', '세운', '대운'].sort());

  // 일지(자) vs 세운(오) 충
  const clash = r.branchRelations.clashes.find(c => c.ids.includes('세운'));
  assert.ok(clash);
  assert.deepStrictEqual(clash.ids.sort(), ['day', '세운'].sort());

  // 월지(유) vs 대운(술) 해(害)
  const harm = r.branchRelations.harms.find(h => h.ids.includes('대운'));
  assert.ok(harm);
  assert.deepStrictEqual(harm.ids.sort(), ['month', '대운'].sort());
});

test('대운·세운 없이 원국만 넣어도 동작함 (둘 다 생략 가능)', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const r = combinedTimeline(natal);
  assert.ok(Array.isArray(r.branchRelations.combos6));
});

test('extraPillars로 월운·일운까지 합쳐서 볼 수 있음', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars; // 일지=자
  const sewoonPillar = { ganIdx: GAN.indexOf('병'), jiIdx: JI.indexOf('오') };
  const r = combinedTimeline(natal, null, sewoonPillar, [
    { label: '월운', ganIdx: GAN.indexOf('갑'), jiIdx: JI.indexOf('오') }, // 세운과 같은 오 -> 비화 그룹 아님(충 후보 아님), 일지(자)와 충
    { label: '일운', ganIdx: GAN.indexOf('무'), jiIdx: JI.indexOf('진') },
  ]);
  // 일지(자)-세운(오) 충, 일지(자)-월운(오) 충 둘 다 잡혀야 함
  const clashIds = r.branchRelations.clashes.map(c => c.ids.sort().join(','));
  assert.ok(clashIds.includes(['day', '세운'].sort().join(',')));
  assert.ok(clashIds.includes(['day', '월운'].sort().join(',')));
});
