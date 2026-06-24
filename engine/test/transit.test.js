const test = require('node:test');
const assert = require('node:assert');
const { transitPillars } = require('../src/saju/transit.js');

test('transitPillars: 특정 날짜의 일주·월주를 60갑자 인덱스로 반환', () => {
  const r = transitPillars(2026, 6, 23);
  assert.strictEqual(r.day.hangul, '무진');
  assert.strictEqual(r.month.hangul, '갑오');
  // ganIdx/jiIdx가 GAN/JI 배열과 일치하는지(timeline.js의 combinedTimeline이 바로 쓰는 형태)
  const { GAN, JI } = require('../src/saju/saju.js');
  assert.strictEqual(GAN[r.day.ganIdx] + JI[r.day.jiIdx], r.day.hangul);
  assert.strictEqual(GAN[r.month.ganIdx] + JI[r.month.jiIdx], r.month.hangul);
});

test('transitPillars 2051+: 수학 공식으로 일주·월주 계산 (라이브러리 범위 밖)', () => {
  const r = transitPillars(2051, 1, 1);
  // 일주: 기준(1986-09-17=갑자)에서 날수 mod 60으로 검증
  const { GAN, JI } = require('../src/saju/saju.js');
  assert.strictEqual(r.day.hangul, GAN[r.day.ganIdx] + JI[r.day.jiIdx]);
  assert.strictEqual(r.month.hangul, GAN[r.month.ganIdx] + JI[r.month.jiIdx]);
  // 2051-01-01: 일주 병술, 월주 무자 (사전 검증값)
  assert.strictEqual(r.day.hangul, '병술');
  assert.strictEqual(r.month.hangul, '무자');
});

test('transitPillars 2051+: 하루 차이가 나면 일주가 달라짐', () => {
  const a = transitPillars(2051, 6, 1);
  const b = transitPillars(2051, 6, 2);
  assert.notStrictEqual(a.day.hangul, b.day.hangul);
});

test('transitPillars: 생년월일과 무관하게 그 날짜 자체의 갑자를 줌(생일 입력 아님)', () => {
  const a = transitPillars(2026, 6, 23);
  const b = transitPillars(2026, 6, 24);
  assert.notStrictEqual(a.day.hangul, b.day.hangul);
});
