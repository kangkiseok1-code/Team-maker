/* 12운성(十二運星, 포태법) 모듈.
   "일간이 특정 지지를 만났을 때 어떤 생애 단계(절태양생욕대록왕쇠병사묘)인가"를 산출.

   ===== 산출 원리 (검증됨) =====
   연해자평의 화토동법(火土同法, 가장 널리 쓰이는 정설 — 무기토는 병정화와 같은 패턴 사용) 기준.
   양간: 자기 오행 삼합의 생지=장생, 왕지=제왕, 고지=묘. 이후 지지를 순행하며 단계가 진행.
   음간: 같은 삼합의 생지=사, 왕지=건록, 고지=양. 이후 지지를 역행하며 단계가 진행.
   (검증: 병화(양)-인=장생/오=제왕/술=묘, 정화(음)-인=사/오=건록/술=양 — 여러 출처와 대조 일치)

   유파 안내: 12운성 자체가 "논란이 많은 관법"으로 알려져 있고(쓰는 사람도, 안 쓰는 사람도 많음),
   토(戊己)의 기준점은 화토동법 외에 다른 방식을 쓰는 유파도 있음. 여기서는 가장 널리 쓰이는
   화토동법을 기본으로 함. */
const { GAN, JI, GAN_ELEM, GAN_YIN_YANG } = require('./saju.js');

const STAGE_NAMES = ['절','태','양','장생','목욕','관대','건록','제왕','쇠','병','사','묘'];

// 오행별 삼합 생지(生支). 토는 화토동법으로 화와 동일(인오술 트리오의 생지=인).
const SAENG_JI = { 목: '해', 화: '인', 토: '인', 금: '사', 수: '신' };

function safeMod(n, m) { return ((n % m) + m) % m; }

// ganIdx: GAN 배열 인덱스, jiIdx: JI 배열 인덱스 -> 12운성 이름
function twelveStage(ganIdx, jiIdx) {
  const elem = GAN_ELEM[ganIdx];
  const yinYang = GAN_YIN_YANG[ganIdx];
  const saengIdx = JI.indexOf(SAENG_JI[elem]);
  const stageIdx = yinYang === '양'
    ? safeMod(3 + (jiIdx - saengIdx), 12)   // 양간: 생지=장생(3), 순행
    : safeMod(10 - (jiIdx - saengIdx), 12); // 음간: 생지=사(10), 역행
  return STAGE_NAMES[stageIdx];
}

// natalPillars: saju.js computeSaju().pillars. 일간(day.gan) 기준으로 연/월/일/시지의 12운성을 산출.
function twelveStagesForNatal(natalPillars) {
  if (!natalPillars.day) throw new Error('일간을 알 수 없으면 12운성을 산출할 수 없습니다.');
  const dayGanIdx = natalPillars.day.gan;
  const out = {};
  ['year', 'month', 'day', 'hour'].forEach(k => {
    if (natalPillars[k]) out[k] = twelveStage(dayGanIdx, natalPillars[k].ji);
  });
  return out;
}

module.exports = { STAGE_NAMES, twelveStage, twelveStagesForNatal };
