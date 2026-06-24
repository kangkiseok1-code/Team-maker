/* 오행연 엔진 통합 엔트리포인트.
   사주분석 / 성향분석 / 궁합 / 지지천간관계 / 세운 / 대운 / 12운성 / 신살 / 조후 / 통합타임라인
   모듈을 한 곳에서 가져올 수 있게 재export. */
const saju = require('./saju/saju.js');
const personality = require('./personality/personality.js');
const synergy = require('./synergy/synergy.js');
const branchRelations = require('./saju/relations.js');
const sewoon = require('./saju/sewoon.js');
const daewoon = require('./saju/daewoon.js');
const twelveStages = require('./saju/twelve-stages.js');
const sinsal = require('./saju/sinsal.js');
const johu = require('./saju/johu.js');
const timeline = require('./saju/timeline.js');
const transit = require('./saju/transit.js');

module.exports = {
  saju, personality, synergy, branchRelations, sewoon, daewoon,
  twelveStages, sinsal, johu, timeline, transit,
};
