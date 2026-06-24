const test = require('node:test');
const assert = require('node:assert');
const { dayMasterRelation, complementScore, pairSynergy, pairBranchRelations } = require('../src/synergy/synergy.js');
const { GAN, JI } = require('../src/saju/saju.js');

test('같은 일간 오행 -> 비화 60점', () => {
  const r = dayMasterRelation('A', '목', 'B', '목');
  assert.strictEqual(r.type, '비화');
  assert.strictEqual(r.score, 60);
});

test('상생 관계(목생화) -> 90점', () => {
  const r = dayMasterRelation('A', '목', 'B', '화');
  assert.strictEqual(r.type, '상생');
  assert.strictEqual(r.score, 90);
});

test('상극 관계(목극토) -> 45점', () => {
  const r = dayMasterRelation('A', '목', 'B', '토');
  assert.strictEqual(r.type, '상극');
  assert.strictEqual(r.score, 45);
});

test('pairSynergy: 멤버 객체 2개를 받아 종합 점수 계산 (state 의존 없이 동작)', () => {
  const A = { name: '기석', dayMasterElem: '수', dist: { 목:0, 화:0, 토:1, 금:1, 수:2 } };
  const B = { name: '서연', dayMasterElem: '화', dist: { 목:2, 화:2, 토:0, 금:0, 수:0 } };
  const r = pairSynergy(A, B);
  assert.strictEqual(r.rel.type, '상극'); // 수(水)가 화(火)를 극함
  assert.ok(r.score >= 0 && r.score <= 100);
});

test('pairBranchRelations: 두 사람 사이에 걸치는 합만 찾고, 한 사람 내부 관계는 제외', () => {
  // A: 연지 인, 월지 진, 일지 자 (월지-일지는 A 내부 반합(신자진) — 같은 사람이라 제외돼야 함)
  // B: 연지 해, 일지 축 (월지/시지는 모름)
  const idx = ji => JI.indexOf(ji);
  const A = { name: '기석', pillars: {
    year: { gan: 0, ji: idx('인') }, month: { gan: 0, ji: idx('진') }, day: { gan: 0, ji: idx('자') }, hour: null,
  } };
  const B = { name: '서연', pillars: {
    year: { gan: 0, ji: idx('해') }, month: null, day: { gan: 0, ji: idx('축') }, hour: null,
  } };
  const rels = pairBranchRelations(A, B);
  // 인해합(육합), 자축합(육합) + 해-자-축이 모여 완성되는 겨울 방합(수)까지 3건이 맞음
  assert.strictEqual(rels.length, 3);
  assert.ok(rels.some(r => r.type === '육합' && r.members.includes('인') && r.members.includes('해')));
  assert.ok(rels.some(r => r.type === '육합' && r.members.includes('자') && r.members.includes('축')));
  assert.ok(rels.some(r => r.type === '방합'));
});

test('pairBranchRelations: 충도 두 사람 사이일 때만 잡힘', () => {
  const idx = ji => JI.indexOf(ji);
  const A = { name: 'A', pillars: { year: { gan: 0, ji: idx('자') }, month: null, day: null, hour: null } };
  const B = { name: 'B', pillars: { year: { gan: 0, ji: idx('오') }, month: null, day: null, hour: null } };
  const rels = pairBranchRelations(A, B);
  assert.strictEqual(rels.length, 1);
  assert.strictEqual(rels[0].type, '충');
});

test('pairBranchRelations: 파(破)·해(害)는 제외 (유파차 커서 표시 대상에서 빠짐)', () => {
  const idx = ji => JI.indexOf(ji);
  // 자유파(子酉破) 관계만 있는 경우 — 포함 대상(육합/삼합/반합/방합/충/형)에 없으므로 빈 배열
  const A = { name: 'A', pillars: { year: { gan: 0, ji: idx('자') }, month: null, day: null, hour: null } };
  const B = { name: 'B', pillars: { year: { gan: 0, ji: idx('유') }, month: null, day: null, hour: null } };
  const rels = pairBranchRelations(A, B);
  assert.strictEqual(rels.length, 0);
});
