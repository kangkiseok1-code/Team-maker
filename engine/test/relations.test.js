const test = require('node:test');
const assert = require('node:assert');
const { analyzeBranchRelations, analyzeStemRelations } = require('../src/saju/relations.js');

function ids(list) { return list.map(r => r.ids); }

test('육합: 자+축 -> 토', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '자' }, { id: 'month', ji: '축' }]);
  assert.strictEqual(r.combos6.length, 1);
  assert.strictEqual(r.combos6[0].elem, '토');
});

test('오미합: 화기(elem) 없음으로 처리', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '오' }, { id: 'month', ji: '미' }]);
  assert.strictEqual(r.combos6.length, 1);
  assert.strictEqual(r.combos6[0].elem, null);
});

test('삼합: 인+오+술 모두 있으면 화국 완성', () => {
  const r = analyzeBranchRelations([
    { id: 'year', ji: '인' }, { id: 'month', ji: '오' }, { id: 'day', ji: '술' }
  ]);
  assert.strictEqual(r.combos3.length, 1);
  assert.strictEqual(r.combos3[0].elem, '화');
  assert.strictEqual(r.halfCombos.length, 0);
});

test('반합: 인+오만 있으면(왕지 포함 2글자) 반합으로만 인정', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '인' }, { id: 'month', ji: '오' }]);
  assert.strictEqual(r.combos3.length, 0);
  assert.strictEqual(r.halfCombos.length, 1);
  assert.strictEqual(r.halfCombos[0].elem, '화');
});

test('반합 불성립: 인+술만 있으면(왕지 없이 생+묘만) 반합 아님', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '인' }, { id: 'month', ji: '술' }]);
  assert.strictEqual(r.combos3.length, 0);
  assert.strictEqual(r.halfCombos.length, 0);
});

test('충: 자+오', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '자' }, { id: 'day', ji: '오' }]);
  assert.strictEqual(r.clashes.length, 1);
});

test('삼형: 인+사+신 모두 있으면 무은지형', () => {
  const r = analyzeBranchRelations([
    { id: 'year', ji: '인' }, { id: 'month', ji: '사' }, { id: 'day', ji: '신' }
  ]);
  assert.strictEqual(r.punishTrio.length, 1);
  assert.strictEqual(r.punishTrio[0].name, '무은지형');
});

test('자묘형: 자+묘', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '자' }, { id: 'month', ji: '묘' }]);
  assert.strictEqual(r.punishPair.length, 1);
});

test('자형: 같은 지지(진)가 두 자리에 있으면', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '진' }, { id: 'hour', ji: '진' }]);
  assert.strictEqual(r.punishSelf.length, 1);
  assert.strictEqual(r.punishSelf[0].jis[0], '진');
});

test('파: 자+유', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '자' }, { id: 'day', ji: '유' }]);
  assert.strictEqual(r.breaks.length, 1);
});

test('해: 자+미', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '자' }, { id: 'day', ji: '미' }]);
  assert.strictEqual(r.harms.length, 1);
});

test('합처봉파: 인+해는 육합(목)과 파(破)에 동시 해당 (고전 이론, 정상)', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '인' }, { id: 'day', ji: '해' }]);
  assert.strictEqual(r.combos6.length, 1);
  assert.strictEqual(r.combos6[0].elem, '목');
  assert.strictEqual(r.breaks.length, 1);
});

test('관계 없는 두 지지는 아무것도 안 나옴', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '인' }, { id: 'month', ji: '묘' }]);
  assert.strictEqual(r.combos6.length, 0);
  assert.strictEqual(r.clashes.length, 0);
  assert.strictEqual(r.breaks.length, 0);
  assert.strictEqual(r.harms.length, 0);
});

test('id가 출처를 정확히 가리킴 (두 사람 사주 합쳐서 분석하는 궁합 용도 확인)', () => {
  const r = analyzeBranchRelations([{ id: 'A-day', ji: '자' }, { id: 'B-day', ji: '축' }]);
  assert.deepStrictEqual(r.combos6[0].ids, ['A-day', 'B-day']);
});

test('방합: 인+묘+진 모두 있으면 봄/목 방합 완성', () => {
  const r = analyzeBranchRelations([
    { id: 'year', ji: '인' }, { id: 'month', ji: '묘' }, { id: 'day', ji: '진' }
  ]);
  assert.strictEqual(r.bangHap.length, 1);
  assert.strictEqual(r.bangHap[0].elem, '목');
  assert.strictEqual(r.bangHap[0].season, '봄');
});

test('방합 불성립: 2글자만 있으면 인정 안 함', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '인' }, { id: 'month', ji: '묘' }]);
  assert.strictEqual(r.bangHap.length, 0);
});

test('부분 삼형: 인사신 중 2글자(인+사)만 있으면 형(부분)으로 약하게 성립', () => {
  const r = analyzeBranchRelations([{ id: 'year', ji: '인' }, { id: 'month', ji: '사' }]);
  assert.strictEqual(r.punishTrio.length, 0); // 완전 삼형은 아님
  assert.strictEqual(r.punishTrioPartial.length, 1);
  assert.strictEqual(r.punishTrioPartial[0].name, '무은지형');
});

test('천간합: 갑+기 -> 토', () => {
  const r = analyzeStemRelations([{ id: 'year', gan: '갑' }, { id: 'month', gan: '기' }]);
  assert.strictEqual(r.hap.length, 1);
  assert.strictEqual(r.hap[0].elem, '토');
});

test('천간충: 갑+경', () => {
  const r = analyzeStemRelations([{ id: 'year', gan: '갑' }, { id: 'day', gan: '경' }]);
  assert.strictEqual(r.chung.length, 1);
});

test('천간충: 무+기(토끼리)는 충으로 안 봄(논쟁적 확장 제외)', () => {
  const r = analyzeStemRelations([{ id: 'year', gan: '무' }, { id: 'day', gan: '기' }]);
  assert.strictEqual(r.chung.length, 0);
});
