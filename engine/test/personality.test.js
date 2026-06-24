const test = require('node:test');
const assert = require('node:assert');
const { PERSONALITY_Q, getPersonalityQuestions, scorePersonality, scoreValues, scoreIndiv } = require('../src/personality/personality.js');

test('전부 보통(3점) 응답 -> 모든 요인 50%', () => {
  const answers = PERSONALITY_Q.map(() => 3);
  const r = scorePersonality(answers);
  ['E','A','C','N','O'].forEach(f => assert.strictEqual(r.pct[f], 50));
});

test('외향성 문항 전부 최대로 응답 -> E 100%', () => {
  const answers = PERSONALITY_Q.map(it => it.f === 'E' ? (it.dir === 1 ? 5 : 1) : 3);
  const r = scorePersonality(answers);
  assert.strictEqual(r.pct.E, 100);
});

test('scoreValues: 응답 없으면 기본값(3점=50%)으로 처리', () => {
  const r = scoreValues({});
  assert.strictEqual(r.pct.money, 50);
});

test('scoreIndiv: 개인주의 문항 전부 동의(5점) -> 개인주의 라벨', () => {
  const r = scoreIndiv([5,5,1,1]); // dir:-1 문항은 반대로 답해야 개인주의 방향
  assert.strictEqual(r.label, '개인주의(독립 지향)');
});

test('PERSONALITY_Q: 총 50문항, 요인별 정확히 10개씩 (50문항 확장 검증)', () => {
  assert.strictEqual(PERSONALITY_Q.length, 50);
  ['E','A','C','N','O'].forEach(f => {
    assert.strictEqual(PERSONALITY_Q.filter(q => q.f === f).length, 10);
  });
});

test('PERSONALITY_Q: 요인별 +/- 채점 비율이 Goldberg(1992) 원문과 일치 (E:5/5, A:6/4, C:6/4, N:8/2, O:7/3)', () => {
  const ratio = f => {
    const items = PERSONALITY_Q.filter(q => q.f === f);
    return { plus: items.filter(q => q.dir === 1).length, minus: items.filter(q => q.dir === -1).length };
  };
  assert.deepStrictEqual(ratio('E'), { plus: 5, minus: 5 });
  assert.deepStrictEqual(ratio('A'), { plus: 6, minus: 4 });
  assert.deepStrictEqual(ratio('C'), { plus: 6, minus: 4 });
  assert.deepStrictEqual(ratio('N'), { plus: 8, minus: 2 }); // N은 '동의=신경증 높음' 문항이 8개(원문 ES- 8개와 동일)
  assert.deepStrictEqual(ratio('O'), { plus: 7, minus: 3 });
});

test('50문항으로도 전부 보통(3점) 응답 -> 모든 요인 50% (확장 후에도 채점 로직 그대로 동작)', () => {
  const answers = PERSONALITY_Q.map(() => 3);
  const r = scorePersonality(answers);
  ['E','A','C','N','O'].forEach(f => assert.strictEqual(r.pct[f], 50));
});

test('getPersonalityQuestions(20): 기존 Mini-IPIP 20문항(배열 앞 20개)과 동일', () => {
  const q20 = getPersonalityQuestions(20);
  assert.strictEqual(q20.length, 20);
  assert.deepStrictEqual(q20, PERSONALITY_Q.slice(0, 20));
});

test('getPersonalityQuestions(50) / 그 외 값: 전체 50문항', () => {
  assert.strictEqual(getPersonalityQuestions(50).length, 50);
  assert.strictEqual(getPersonalityQuestions().length, 50);
});

test('scorePersonality(answers, 20): 20문항 모드에서도 전부 보통(3점) -> 모든 요인 50%', () => {
  const q20 = getPersonalityQuestions(20);
  const answers = q20.map(() => 3);
  const r = scorePersonality(answers, 20);
  ['E','A','C','N','O'].forEach(f => assert.strictEqual(r.pct[f], 50));
});

test('scorePersonality(answers, 20): 20문항 모드 E 문항 전부 최대 응답 -> E 100%', () => {
  const q20 = getPersonalityQuestions(20);
  const answers = q20.map(it => it.f === 'E' ? (it.dir === 1 ? 5 : 1) : 3);
  const r = scorePersonality(answers, 20);
  assert.strictEqual(r.pct.E, 100);
});
