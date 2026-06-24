/* 대운(大運) 모듈: 연주 음양+성별로 순행/역행을 정하고, 생일이 절기(節)에서 얼마나
   떨어졌는지를 분 단위로 계산해 "3일=1년·1일=4개월·1시간=5일" 환산법으로 대운수를 구함.

   ===== 절기 정밀 데이터 출처 =====
   기존 만세력 라이브러리(manse-inline.js)는 절기의 정확한 날짜·시각을 2020~2030년만 갖고 있어서
   (그 외 연도는 "입춘은 대략 2월 4일" 같은 고정 근사 날짜표를 씀) 대운수처럼 분 단위 정밀도가
   필요한 계산에는 부족함. 그래서 1899~2100년 정밀 절기 데이터를 별도로 확보함:
   출처: npm 패키지 @aharris02/bazi-calculator-by-alvamind (MIT 라이선스) 내 solar-term.json.
   해당 데이터를 solar-terms-data.json으로 그대로 가져와 씀 (가공 없음, UTC 타임스탬프).

   ===== 검증 방법 =====
   같은 npm 패키지의 BaziCalculator로 1986-09-17 08:30(KST)·남성 기준 대운을 직접 돌려서
   나온 값(순행, 시작 나이 7년 0개월 70일, 절기까지 남은 시간 31117분)과 우리 구현 결과를
   대조해서 검증함 — 절기 데이터를 읽어 분 단위 거리를 구하는 부분까지 독립적으로 일치 확인.
*/
const { GAN, JI, GAN_YIN_YANG } = require('./saju.js');

const SOLAR_TERMS = require('./solar-terms-data.json');

// 24절기 중 사주월의 경계가 되는 "절(節)" 12개만 사용(중기 12개는 대운수 계산에 안 씀)
const JEOL_KEYS = [
  'minor_cold', 'start_of_spring', 'awakening_of_insects', 'pure_brightness',
  'start_of_summer', 'grain_in_ear', 'minor_heat', 'start_of_autumn',
  'white_dew', 'cold_dew', 'start_of_winter', 'major_snow',
];

function jeolListOfYear(year) {
  const entry = SOLAR_TERMS[String(year)];
  if (!entry) return [];
  return JEOL_KEYS.map(k => ({ name: k, date: new Date(entry.data[k]) }));
}

// birthUTCms 기준 직전/직후 절(節)을 찾음. 연말·연초 경계를 위해 전후 1개년도 데이터까지 포함.
function nearestJeol(birthUTCms, year) {
  const list = [year - 1, year, year + 1]
    .flatMap(jeolListOfYear)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  let prev = null, next = null;
  for (const j of list) {
    const t = j.date.getTime();
    if (t <= birthUTCms) prev = j;
    if (t > birthUTCms && !next) next = j;
  }
  return { prev, next };
}

// 한국 표준시(KST, UTC+9) 기준 생년월일시 -> UTC epoch ms. (진태양시 보정 없는 표준시계 시각 기준)
function birthToUTCms(year, month, day, hour, minute) {
  return Date.UTC(year, month - 1, day, hour, minute) - 9 * 3600 * 1000;
}

// 연주 음양 + 성별 -> 순행(1) / 역행(-1). 양남·음녀=순행, 음남·양녀=역행.
function direction(yearGanIdx, gender) {
  const yy = GAN_YIN_YANG[yearGanIdx];
  const yangMale = yy === '양' && gender === 'male';
  const yinFemale = yy === '음' && gender === 'female';
  return (yangMale || yinFemale) ? 1 : -1;
}

// "3일=1년·1일=4개월·1시간=5일" 환산법. dir에 따라 직전절(역행) 또는 직후절(순행)까지의 분을 씀.
function startAge(birthUTCms, birthYear, dir) {
  const { prev, next } = nearestJeol(birthUTCms, birthYear);
  const target = dir === 1 ? next : prev;
  const baseMinutes = Math.abs(target.date.getTime() - birthUTCms) / 60000;
  const MIN_PER_DAY = 1440, MIN_PER_LUCK_YEAR = 3 * MIN_PER_DAY;
  const years = Math.floor(baseMinutes / MIN_PER_LUCK_YEAR);
  const remAfterYears = baseMinutes % MIN_PER_LUCK_YEAR;
  const months = Math.floor(remAfterYears / MIN_PER_DAY) * 4;
  const remAfterMonths = remAfterYears % MIN_PER_DAY;
  const days = Math.floor(remAfterMonths / 60) * 5;
  return { years, months, days };
}

function safeMod(n, m) { return ((n % m) + m) % m; }

// natalPillars: saju.js computeSaju().pillars. birth: {year,month,day,hour,minute}(양력, 표준시계 시각).
// gender: 'male' | 'female'. count: 생성할 대운 개수(기본 8개 = 80년).
function daewoon(natalPillars, birth, gender, count = 8) {
  if (!natalPillars.year || !natalPillars.month) {
    throw new Error('대운 계산에는 연주·월주가 필요합니다.');
  }
  const dir = direction(natalPillars.year.gan, gender);
  const birthUTCms = birthToUTCms(birth.year, birth.month, birth.day, birth.hour, birth.minute || 0);
  const age0 = startAge(birthUTCms, birth.year, dir);

  const pillars = [];
  for (let i = 1; i <= count; i++) {
    const ganIdx = safeMod(natalPillars.month.gan + dir * i, 10);
    const jiIdx = safeMod(natalPillars.month.ji + dir * i, 12);
    pillars.push({
      index: i,
      gan: GAN[ganIdx], ji: JI[jiIdx], ganIdx, jiIdx,
      // i번째 대운 시작 나이 = 1번째 대운 시작 나이 + (i-1)*10년
      startAge: { years: age0.years + (i - 1) * 10, months: age0.months, days: age0.days },
    });
  }
  return { direction: dir === 1 ? '순행' : '역행', firstStartAge: age0, pillars };
}

module.exports = { jeolListOfYear, nearestJeol, direction, startAge, daewoon };
