// 브라우저(ohaeng-v14.html)용 엔트리포인트. Node용 src/index.js와 달리
// 앱이 실제로 쓰는 모듈만 추려서 번들 크기를 줄인다.
// daewoon은 절기 데이터(solar-terms-data.json, 278KB)를 포함해서 번들이 커지지만,
// 직원 본인 만세력(대운·세운) 화면에 필요해서 포함함.
const saju = require('./saju/saju.js');
const personality = require('./personality/personality.js');
const synergy = require('./synergy/synergy.js');
const branchRelations = require('./saju/relations.js');
const daewoon = require('./saju/daewoon.js');
const sewoon = require('./saju/sewoon.js');
const timeline = require('./saju/timeline.js');
const transit = require('./saju/transit.js');
const twelveStages = require('./saju/twelve-stages.js');

module.exports = { saju, personality, synergy, branchRelations, daewoon, sewoon, timeline, transit, twelveStages };
