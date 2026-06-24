const test = require('node:test');
const assert = require('node:assert');
const { computeSaju } = require('../src/saju/saju.js');
const { daewoon, nearestJeol } = require('../src/saju/daewoon.js');

// 기준값: @aharris02/bazi-calculator-by-alvamind(MIT, 독립 라이브러리)로 직접 검증.
// 1986-09-17 08:30 KST, 남성 -> 순행, 시작나이 7년0개월70일, 절기까지 31117분, 대운1=무술, 대운2=기해.
test('절기 거리: 1986-09-17 08:30(KST) -> 한로까지 31117분 (외부 라이브러리와 일치)', () => {
  const birthUTCms = Date.UTC(1986, 8, 16, 23, 30); // 09-17 08:30 KST = 09-16 23:30 UTC
  const { next } = nearestJeol(birthUTCms, 1986);
  const diffMin = Math.round((next.date.getTime() - birthUTCms) / 60000);
  assert.strictEqual(diffMin, 31117);
  assert.strictEqual(next.name, 'cold_dew'); // 한로
});

test('대운: 1986-09-17 08:30 남성 -> 순행, 시작나이 7년0개월70일', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const r = daewoon(natal, { year: 1986, month: 9, day: 17, hour: 8, minute: 30 }, 'male');
  assert.strictEqual(r.direction, '순행');
  assert.deepStrictEqual(r.firstStartAge, { years: 7, months: 0, days: 70 });
});

test('대운: 1번째=무술(戊戌), 2번째=기해(己亥) (월주 정유에서 순행으로 +1,+2)', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const r = daewoon(natal, { year: 1986, month: 9, day: 17, hour: 8, minute: 30 }, 'male');
  assert.strictEqual(r.pillars[0].gan + r.pillars[0].ji, '무술');
  assert.strictEqual(r.pillars[1].gan + r.pillars[1].ji, '기해');
});

test('대운 시작나이는 10년 단위로 누적됨 (1번째 7년, 2번째 17년, 3번째 27년...)', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const r = daewoon(natal, { year: 1986, month: 9, day: 17, hour: 8, minute: 30 }, 'male');
  assert.strictEqual(r.pillars[0].startAge.years, 7);
  assert.strictEqual(r.pillars[1].startAge.years, 17);
  assert.strictEqual(r.pillars[2].startAge.years, 27);
});

test('성별이 다르면 같은 사주라도 순행/역행이 바뀜 (병인년=양 -> 남성 순행, 여성 역행)', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const male = daewoon(natal, { year: 1986, month: 9, day: 17, hour: 8, minute: 30 }, 'male');
  const female = daewoon(natal, { year: 1986, month: 9, day: 17, hour: 8, minute: 30 }, 'female');
  assert.strictEqual(male.direction, '순행');
  assert.strictEqual(female.direction, '역행');
  // 역행이면 월주(정유)에서 -1 -> 병신
  assert.strictEqual(female.pillars[0].gan + female.pillars[0].ji, '병신');
});

test('count 옵션으로 대운 개수 조절 가능 (기본 8개)', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const r = daewoon(natal, { year: 1986, month: 9, day: 17, hour: 8, minute: 30 }, 'male', 3);
  assert.strictEqual(r.pillars.length, 3);
});
