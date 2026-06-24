const test = require('node:test');
const assert = require('node:assert');
const { computeSaju, GAN, JI } = require('../src/saju/saju.js');
const { findSinsal } = require('../src/saju/sinsal.js');

function natalBranches(pillars) {
  return ['year','month','day','hour']
    .filter(k => pillars[k])
    .map(k => ({ id: k, ji: JI[pillars[k].ji] }));
}

test('도화·역마·화개: 1986-09-17 기준값 사주(연인/월유/일자/시진)에서 셋 다 동시에 성립', () => {
  // 일지=자(신자진 트리오) -> 도화=유(월지와 일치), 역마=인(연지와 일치), 화개=진(시지와 일치)
  const natal = computeSaju(1986, 9, 17, 8, { minute: 30 }).pillars;
  const r = findSinsal(natalBranches(natal), GAN[natal.day.gan]);
  assert.strictEqual(r.dohwa.length, 1);
  assert.strictEqual(r.dohwa[0].id, 'month');
  assert.strictEqual(r.yeokma.length, 1);
  assert.strictEqual(r.yeokma[0].id, 'year');
  assert.strictEqual(r.hwagae.length, 1);
  assert.strictEqual(r.hwagae[0].id, 'hour');
});

test('천을귀인: 일간 갑 + 축이 있으면 성립', () => {
  const r = findSinsal([{ id: 'year', ji: '축' }, { id: 'day', ji: '자' }], '갑');
  assert.strictEqual(r.cheoneul.length, 1);
  assert.strictEqual(r.cheoneul[0].id, 'year');
});

test('양인살: 일간 갑(양간) + 묘가 있으면 성립', () => {
  const r = findSinsal([{ id: 'month', ji: '묘' }, { id: 'day', ji: '자' }], '갑');
  assert.strictEqual(r.yangin.length, 1);
});

test('양인살: 일간이 음간(을)이면 아무리 묘가 있어도 성립 안 함', () => {
  const r = findSinsal([{ id: 'month', ji: '묘' }, { id: 'day', ji: '오' }], '을');
  assert.strictEqual(r.yangin.length, 0);
});

test('무토(화토동법): 양인 위치가 병화와 동일(오)', () => {
  const r = findSinsal([{ id: 'month', ji: '오' }, { id: 'day', ji: '진' }], '무');
  assert.strictEqual(r.yangin.length, 1);
});
