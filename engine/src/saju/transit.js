/* 일운(日運)·월운(月運) — 특정 날짜의 일주·월주를 뽑아서 원국과 합쳐볼 때 쓰는 모듈.
   1900~2050: 만세력 라이브러리(manse-inline.js) 사용.
   2051~2100: 수학 공식 + solar-terms-data.json(기존 daewoon.js와 동일 데이터) 사용.

   ─ 일주 기준점: 1986-09-17 = 갑자(GAN[0],JI[0]) — 기석님 검증값으로 확인됨.
   ─ 월주: 오호건원(五虎建元) 공식 + 12절기 경계(solar-terms-data.json).
*/
const manse = require('./manse-inline.js');
const { GAN, JI } = require('./saju.js');
const SOLAR_TERMS = require('./solar-terms-data.json');

function hangulToIdx(hangul){
  return { ganIdx: GAN.indexOf(hangul[0]), jiIdx: JI.indexOf(hangul[1]) };
}

// 월의 경계가 되는 12절(節) — 각 절기가 시작하는 지지 인덱스(0=자,1=축,2=인,...)
const MONTH_JEOL = [
  { key: 'minor_cold',           ji: 1  }, // 소한 → 丑月
  { key: 'start_of_spring',      ji: 2  }, // 입춘 → 寅月
  { key: 'awakening_of_insects', ji: 3  }, // 경칩 → 卯月
  { key: 'pure_brightness',      ji: 4  }, // 청명 → 辰月
  { key: 'start_of_summer',      ji: 5  }, // 입하 → 巳月
  { key: 'grain_in_ear',         ji: 6  }, // 망종 → 午月
  { key: 'minor_heat',           ji: 7  }, // 소서 → 未月
  { key: 'start_of_autumn',      ji: 8  }, // 입추 → 申月
  { key: 'white_dew',            ji: 9  }, // 백로 → 酉月
  { key: 'cold_dew',             ji: 10 }, // 한로 → 戌月
  { key: 'start_of_winter',      ji: 11 }, // 입동 → 亥月
  { key: 'major_snow',           ji: 0  }, // 대설 → 子月
];

// 기준일: 1986-09-17 = 갑자(GAN[0], JI[0]) — 기석님 검증 기준값으로 확인됨
const DAY_REF_UTC = Date.UTC(1986, 8, 17);

function _dayPillarCalc(year, month, day) {
  const diff = Math.round((Date.UTC(year, month - 1, day) - DAY_REF_UTC) / 86400000);
  const idx  = ((diff % 60) + 60) % 60;
  return { gan: idx % 10, ji: idx % 12 };
}

function _monthPillarCalc(year, month, day) {
  // KST 정오 기준 UTC(정오 KST = 03:00 UTC)
  const targetMs = Date.UTC(year, month - 1, day, 3, 0, 0);

  // 전년도 + 당해년도 12절 목록 수집 후 시각순 정렬
  const jeols = [];
  for (const y of [year - 1, year]) {
    const entry = SOLAR_TERMS[String(y)];
    if (!entry) continue;
    for (const { key, ji } of MONTH_JEOL)
      jeols.push({ ms: new Date(entry.data[key]).getTime(), ji });
  }
  jeols.sort((a, b) => a.ms - b.ms);

  // targetMs 직전 절기 찾기
  let cur = null;
  for (const j of jeols) {
    if (j.ms <= targetMs) cur = j;
    else break;
  }
  if (!cur) throw new Error(`월주 계산 불가: 데이터 범위 밖 (${year}-${month}-${day})`);

  // 사주년 결정: 입춘 기준으로 연도가 바뀜
  const thisEntry = SOLAR_TERMS[String(year)];
  let sajuYear = year;
  if (thisEntry) {
    const chunMs = new Date(thisEntry.data['start_of_spring']).getTime();
    if (targetMs < chunMs) sajuYear = year - 1;
  }
  const yearStem = ((sajuYear - 1984) % 10 + 10) % 10;

  // 오호건원(五虎建元): yearStem % 5 기준 寅月 천간 시작
  // 갑·기(0,5)→丙(2), 을·경(1,6)→戊(4), 병·신(2,7)→庚(6), 정·임(3,8)→壬(8), 무·계(4,9)→甲(0)
  const stemStarts = [2, 4, 6, 8, 0];
  const stemStart  = stemStarts[yearStem % 5];

  // 寅(2)부터 시작하는 월 인덱스(0=寅, 1=卯, ...)
  const monthIdx = (cur.ji - 2 + 12) % 12;
  const gan = (stemStart + monthIdx) % 10;
  return { gan, ji: cur.ji };
}

// year/month/day: 운세를 보고 싶은 그 날짜(양력). 생년월일이 아님.
function transitPillars(year, month, day) {
  if (year >= 1900 && year <= 2050) {
    // 라이브러리 지원 범위 내: 기존 방식 유지
    const g = manse.getGapja(year, month, day);
    return {
      day:   { ...hangulToIdx(g.dayPillar),   gan: g.dayPillar[0],   ji: g.dayPillar[1],   hangul: g.dayPillar },
      month: { ...hangulToIdx(g.monthPillar), gan: g.monthPillar[0], ji: g.monthPillar[1], hangul: g.monthPillar },
    };
  }

  // 2051년 이후(또는 1900년 이전): 수학 공식 + solar-terms-data.json
  const d = _dayPillarCalc(year, month, day);
  const m = _monthPillarCalc(year, month, day);
  return {
    day:   { ganIdx: d.gan, jiIdx: d.ji, gan: GAN[d.gan], ji: JI[d.ji], hangul: GAN[d.gan] + JI[d.ji] },
    month: { ganIdx: m.gan, jiIdx: m.ji, gan: GAN[m.gan], ji: JI[m.ji], hangul: GAN[m.gan] + JI[m.ji] },
  };
}

module.exports = { transitPillars };
