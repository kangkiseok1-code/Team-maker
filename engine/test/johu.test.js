const test = require('node:test');
const assert = require('node:assert');
const { computeSaju } = require('../src/saju/saju.js');
const { johuHint } = require('../src/saju/johu.js');

test('1986-09-17(월지=유,가을) -> 계절 치우침 없어 중화/낮음', () => {
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const r = johuHint(natal);
  assert.strictEqual(r.season, '가을');
  assert.strictEqual(r.need, '중화');
  assert.strictEqual(r.urgency, '낮음');
  assert.strictEqual(r.isSimplified, true); // 간이 버전임을 항상 명시
});

test('여름(오월) + 화 일간(병) -> 수 보정 긴급도 높음', () => {
  // 함수 입력을 직접 구성해 원리만 검증(실제 만세력 계산과 무관하게 month/day만 필요)
  const synth = { month: { gan: 0, ji: 6 /* 오 */ }, day: { gan: 2 /* 병 */, ji: 0 } };
  const r = johuHint(synth);
  assert.strictEqual(r.season, '여름');
  assert.strictEqual(r.need, '수');
  assert.strictEqual(r.urgency, '높음');
});

test('겨울(자월) + 수 일간(임) -> 화 보정 긴급도 높음', () => {
  const synth = { month: { gan: 0, ji: 0 /* 자 */ }, day: { gan: 8 /* 임 */, ji: 0 } };
  const r = johuHint(synth);
  assert.strictEqual(r.season, '겨울');
  assert.strictEqual(r.need, '화');
  assert.strictEqual(r.urgency, '높음');
});

test('여름(오월) + 수 일간(임) -> 일간이 열기를 더 키우지 않아 보통', () => {
  const synth = { month: { gan: 0, ji: 6 }, day: { gan: 8, ji: 0 } };
  const r = johuHint(synth);
  assert.strictEqual(r.urgency, '보통');
});
