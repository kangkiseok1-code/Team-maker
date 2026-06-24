const test = require('node:test');
const assert = require('node:assert');
const { computeSaju, GAN, JI } = require('../src/saju/saju.js');

test('1986-09-17 08:30 — 기석님 검증 기준값과 일치 (연주병인/월주정유/일주갑자/시주무진)', () => {
  const r = computeSaju(1986, 9, 17, 8, { minute: 30 });
  assert.strictEqual(GAN[r.pillars.year.gan] + JI[r.pillars.year.ji], '병인');
  assert.strictEqual(GAN[r.pillars.month.gan] + JI[r.pillars.month.ji], '정유');
  assert.strictEqual(GAN[r.pillars.day.gan] + JI[r.pillars.day.ji], '갑자');
  assert.strictEqual(GAN[r.pillars.hour.gan] + JI[r.pillars.hour.ji], '무진');
  // 진태양시 보정 32분 (8:30 -> 7:58)
  assert.strictEqual(r.corrected.hour, 7);
  assert.strictEqual(r.corrected.minute, 58);
});

test('deepAnalyze: 일주만 있어도(시간 모름) status/yongsin이 채워짐', () => {
  const r = computeSaju(1986, 9, 17, '', {});
  assert.ok(r.deep);
  assert.ok(['신강','신약'].includes(r.deep.status));
  assert.ok(r.deep.yongsin.every(e=>['목','화','토','금','수'].includes(e)));
});

test('출생지역 옵션이 경도 보정에 실제로 반영됨 (서울 vs 부산 다른 longitude)', () => {
  const seoul = computeSaju(1986, 9, 17, 8, { minute: 30, city: '서울' });
  const busan = computeSaju(1986, 9, 17, 8, { minute: 30, city: '부산' });
  // 경도가 다르면 보정된 분이 달라야 함
  assert.notStrictEqual(seoul.corrected.minute, busan.corrected.minute);
});

test('야자시: 기본값(끔)은 23시생도 그날 일주 그대로(조자시) — 기존 동작 보존', () => {
  const r = computeSaju(1990, 5, 15, 23, { minute: 30 });
  assert.strictEqual(r.dayShiftedByYajasi, false);
  assert.strictEqual(GAN[r.pillars.day.gan] + JI[r.pillars.day.ji], '경진');
});

test('야자시: 켜면 23시생은 다음날 일주로(60갑자 다음 순서), 시주 천간도 새 일간 기준으로 재계산', () => {
  const r = computeSaju(1990, 5, 15, 23, { minute: 30, yajasi: true });
  assert.strictEqual(r.dayShiftedByYajasi, true);
  assert.strictEqual(GAN[r.pillars.day.gan] + JI[r.pillars.day.ji], '신사'); // 경진 다음날
  assert.strictEqual(GAN[r.pillars.hour.gan] + JI[r.pillars.hour.ji], '기해'); // 시지는 해(밤 11시반), 천간은 새 일간(신) 기준
});

test('야자시: 23시가 아니면 옵션을 켜도 영향 없음', () => {
  const r = computeSaju(1990, 5, 15, 14, { minute: 0, yajasi: true });
  assert.strictEqual(r.dayShiftedByYajasi, false);
});
