const { saju, personality } = require('/home/claude/ohaeng-engine/engine/src/index.js');

// 가상 인물 10명 — 이름·이메일·생년월일시 전부 가상(실존 인물 아님). 오행·일간이 다양하게 섞이도록 날짜를 흩어놓음.
const PEOPLE = [
  { name: '김도윤', gender: 'm', y: 1990, m: 3, d: 14, h: 9, mi: 15, dept: '기획팀', title: '사원' },
  { name: '이서연', gender: 'f', y: 1988, m: 7, d: 2, h: 14, mi: 40, dept: '개발팀', title: '대리' },
  { name: '박지훈', gender: 'm', y: 1995, m: 11, d: 23, h: 3, mi: 5, dept: '디자인팀', title: '사원' },
  { name: '최유나', gender: 'f', y: 1992, m: 1, d: 19, h: 20, mi: 30, dept: '마케팅팀', title: '과장' },
  { name: '정민준', gender: 'm', y: 1985, m: 5, d: 8, h: 11, mi: 0, dept: '영업팀', title: '팀장' },
  { name: '한소율', gender: 'f', y: 1998, m: 9, d: 27, h: 16, mi: 20, dept: '기획팀', title: '사원' },
  { name: '오태양', gender: 'm', y: 1983, m: 12, d: 5, h: 6, mi: 45, dept: '개발팀', title: '과장' },
  { name: '장하은', gender: 'f', y: 1991, m: 6, d: 11, h: 22, mi: 10, dept: '디자인팀', title: '대리' },
  { name: '윤성민', gender: 'm', y: 1989, m: 2, d: 28, h: 13, mi: 25, dept: '마케팅팀', title: '대리' },
  { name: '강지우', gender: 'f', y: 1996, m: 4, d: 16, h: 0, mi: 50, dept: '영업팀', title: '사원' },
];

const HOBBY_KEYS = ['active', 'explore', 'social', 'create'];
// 시드 기반 가짜 난수(매번 같은 결과 나오게) — 데모 재현성용
function makeRng(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

const members = PEOPLE.map((p, idx) => {
  const rng = makeRng(idx * 97 + 13);
  const sj = saju.computeSaju(p.y, p.m, p.d, p.h, { minute: p.mi });
  const topElem = Object.entries(sj.dist).sort((a, b) => b[1] - a[1])[0][0];

  // 성향 20문항: 사람마다 다르게 보이도록 시드 난수로 1~5 응답 생성
  const answers = {};
  for (let i = 0; i < 20; i++) answers[i] = 1 + Math.floor(rng() * 5);
  const big5raw = personality.scorePersonality(answers, 20);

  const values = {};
  ['money', 'exp', 'fame', 'stable', 'rel'].forEach(k => { values[k] = 1 + Math.floor(rng() * 5); });
  const valuesScored = personality.scoreValues(values);

  const indivResp = {};
  for (let i = 0; i < 4; i++) indivResp[i] = 1 + Math.floor(rng() * 5);
  const indivScored = personality.scoreIndiv(indivResp);

  const hobby = HOBBY_KEYS[Math.floor(rng() * HOBBY_KEYS.length)];

  return {
    name: p.name,
    gender: p.gender,
    birth: { y: p.y, m: p.m, d: p.d, h: String(p.h), calendar: 'solar', leap: false, minute: p.mi, city: '', yajasi: false },
    answers,
    dist: sj.dist,
    dayMaster: sj.dayMaster,
    dayMasterElem: sj.dayMasterElem,
    topElem,
    deep: sj.deep,
    big5: big5raw,
    values: valuesScored,
    indiv: indivScored,
    hobby,
    pillars: sj.pillars,
    share1: true,
    share2: true,
    notes: [],
    hr: { joinDate: '', dept: p.dept, title: p.title, email: '' },
  };
});

console.log(JSON.stringify(members));
