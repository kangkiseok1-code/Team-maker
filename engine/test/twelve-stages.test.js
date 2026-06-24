const test = require('node:test');
const assert = require('node:assert');
const { GAN, JI } = require('../src/saju/saju.js');
const { twelveStage, twelveStagesForNatal } = require('../src/saju/twelve-stages.js');

test('병화(양간): 인=장생, 오=제왕, 술=묘 (검증된 예시)', () => {
  const ganIdx = GAN.indexOf('병');
  assert.strictEqual(twelveStage(ganIdx, JI.indexOf('인')), '장생');
  assert.strictEqual(twelveStage(ganIdx, JI.indexOf('오')), '제왕');
  assert.strictEqual(twelveStage(ganIdx, JI.indexOf('술')), '묘');
});

test('정화(음간, 역행): 인=사, 오=건록, 술=양 (검증된 예시)', () => {
  const ganIdx = GAN.indexOf('정');
  assert.strictEqual(twelveStage(ganIdx, JI.indexOf('인')), '사');
  assert.strictEqual(twelveStage(ganIdx, JI.indexOf('오')), '건록');
  assert.strictEqual(twelveStage(ganIdx, JI.indexOf('술')), '양');
});

test('무토(화토동법): 병화와 동일하게 인=장생', () => {
  const ganIdx = GAN.indexOf('무');
  assert.strictEqual(twelveStage(ganIdx, JI.indexOf('인')), '장생');
});

test('갑목(양간): 해=장생, 묘=제왕, 미=묘', () => {
  const ganIdx = GAN.indexOf('갑');
  assert.strictEqual(twelveStage(ganIdx, JI.indexOf('해')), '장생');
  assert.strictEqual(twelveStage(ganIdx, JI.indexOf('묘')), '제왕');
  assert.strictEqual(twelveStage(ganIdx, JI.indexOf('미')), '묘');
});

test('twelveStagesForNatal: 일간 기준으로 연/월/일/시지 전부 산출', () => {
  const { computeSaju } = require('../src/saju/saju.js');
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars; // 일간=갑
  const r = twelveStagesForNatal(natal);
  assert.strictEqual(Object.keys(r).length, 4);
  assert.strictEqual(r.year, twelveStage(GAN.indexOf('갑'), natal.year.ji));
});
