const test = require('node:test');
const assert = require('node:assert');
const { computeSaju } = require('../src/saju/saju.js');
const { getYearPillar, sewoon } = require('../src/saju/sewoon.js');

test('getYearPillar: 2024/2025/2026/2027 -> 갑진/을사/병오/정미 (만세력 라이브러리와 일치)', () => {
  const cases = { 2024: '갑진', 2025: '을사', 2026: '병오', 2027: '정미' };
  const GAN = require('../src/saju/saju.js').GAN, JI = require('../src/saju/saju.js').JI;
  Object.entries(cases).forEach(([y, expect]) => {
    const p = getYearPillar(+y);
    assert.strictEqual(GAN[p.gan] + JI[p.ji], expect);
  });
});

test('세운 2026(병오)년 -> 기석님 기준값(1986-09-17, 일지 자) 사주와 자오충', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const r = sewoon(natal, 2026);
  assert.strictEqual(r.gan, '병');
  assert.strictEqual(r.ji, '오');
  assert.strictEqual(r.branchRelations.clashes.length, 1);
  assert.deepStrictEqual(r.branchRelations.clashes[0].ids.sort(), ['day', '세운']);
});

test('세운 2024(갑진)년 -> 시지(진)와 자형(辰辰) 발생', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars; // 시주 무진(진)
  const r = sewoon(natal, 2024);
  assert.strictEqual(r.branchRelations.punishSelf.length, 1);
  assert.deepStrictEqual(r.branchRelations.punishSelf[0].ids.sort(), ['hour', '세운']);
});

test('세운 2020(경자)년 -> 일간(갑)과 천간충(갑경)', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars; // 일주 갑자(갑)
  const r = sewoon(natal, 2020);
  assert.strictEqual(r.stemRelations.chung.length, 1);
});

test('세운 2019(기해)년 -> 일간(갑)과 갑기합(토)', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const r = sewoon(natal, 2019);
  assert.strictEqual(r.stemRelations.hap.length, 1);
  assert.strictEqual(r.stemRelations.hap[0].elem, '토');
});

test('getYearPillar: 2051(신미)·2060(경진)·2099(기미) — 60갑자 수학 공식 검증', () => {
  const GAN = require('../src/saju/saju.js').GAN, JI = require('../src/saju/saju.js').JI;
  const cases = { 2051: '신미', 2060: '경진', 2099: '기미' };
  Object.entries(cases).forEach(([y, expect]) => {
    const p = getYearPillar(+y);
    assert.strictEqual(GAN[p.gan] + JI[p.ji], expect, `${y}년 연주 불일치`);
  });
});

test('세운 2051년: 정상 계산되고 원국과 관계 분석까지 동작함', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const r = sewoon(natal, 2051); // 신미(辛未)
  assert.strictEqual(r.gan, '신');
  assert.strictEqual(r.ji, '미');
  assert.ok(r.branchRelations);
});

test('필터링: 세운 결과엔 본인 사주 내부끼리의 관계(예: 월-시 육합)는 안 나옴', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars; // month-hour는 유진 육합이 이미 있음
  const r = sewoon(natal, 2026);
  // combos6 결과에 'month'/'hour' 둘 다인 항목(즉 세운이 빠진 항목)이 있으면 안 됨
  r.branchRelations.combos6.forEach(c => assert.ok(c.ids.includes('세운')));
});
