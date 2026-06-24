/* 팀워크 궁합(시너지) 엔진: 일간 상생상극 + 오행 보완 점수.
   ohaeng-v14.html의 동일 로직을 그대로 이동(점수 공식 변경 없음).
   단, pairSynergy()는 원래 앱 전역 state.members[i]를 직접 읽었으나,
   엔진은 앱 상태에 의존할 수 없으므로 멤버 객체({name,dayMasterElem,dist})를
   직접 받는 형태로 시그니처만 변경함(계산 공식은 동일). */
const { ELEMS } = require('../saju/saju.js');
const { analyzeBranchRelations } = require('../saju/relations.js');
const { JI } = require('../saju/saju.js');

const GENERATES={목:'화',화:'토',토:'금',금:'수',수:'목'}; // A생B
const CONTROLS={목:'토',토:'수',수:'화',화:'금',금:'목'};   // A극B

function dayMasterRelation(aName,a,bName,b){
  if(a===b) return {type:'비화',score:60,desc:`${aName}와 ${bName}의 일간이 같은 ${a} 기운이에요. 통하는 게 빠르고 닮았지만, 비슷한 만큼 같은 자리를 두고 경쟁할 수 있어요.`};
  if(GENERATES[a]===b) return {type:'상생',score:90,desc:`${aName}(${a})가 ${bName}(${b})를 생(生)해요. ${aName}가 ${bName}를 북돋고 키워주는 관계라, ${aName}가 멘토·지원 역할일 때 시너지가 커요.`};
  if(GENERATES[b]===a) return {type:'상생',score:90,desc:`${bName}(${b})가 ${aName}(${a})를 생(生)해요. ${bName}가 ${aName}를 받쳐주는 관계라, ${bName}가 지원·보조 역할일 때 잘 맞아요.`};
  if(CONTROLS[a]===b) return {type:'상극',score:45,desc:`${aName}(${a})가 ${bName}(${b})를 극(剋)해요. ${aName}가 주도권을 쥐는 구도라, 역할이 분명한 상하관계면 추진력이 되지만 수평 관계에선 마찰이 생길 수 있어요.`};
  if(CONTROLS[b]===a) return {type:'상극',score:45,desc:`${bName}(${b})가 ${aName}(${a})를 극(剋)해요. ${bName}가 주도권을 쥐는 구도라, 역할이 분명하면 균형이 되지만 아니면 긴장이 따라와요.`};
  return {type:'중립',score:55,desc:`${aName}와 ${bName}는 직접적인 생극 관계는 아니에요. 무난하게 협업할 수 있어요.`};
}
function complementScore(distA,distB){
  function fillRate(x,y){const empty=ELEMS.filter(e=>(x[e]||0)===0);if(!empty.length)return 0.5;return empty.filter(e=>(y[e]||0)>0).length/empty.length;}
  return (fillRate(distA,distB)+fillRate(distB,distA))/2;
}
// A,B: {name, dayMasterElem, dist} 형태의 멤버 데이터 (원본은 state.members[i]에서 같은 필드를 읽었음)
function pairSynergy(A,B){
  const rel=dayMasterRelation(A.name||'익명',A.dayMasterElem,B.name||'익명',B.dayMasterElem);
  const comp=complementScore(A.dist,B.dist);
  const score=Math.round(rel.score*0.7+comp*100*0.3);
  return {score,rel,comp:Math.round(comp*100)};
}
function synergyColor(score){
  if(score>=80)return '#4a8c5e';      // 높음 - 초록
  if(score>=65)return '#a8b85e';      // 양호 - 연두
  if(score>=55)return '#c99a3c';      // 보통 - 황
  return '#c98a6c';                   // 긴장 - 주황빛
}

/* ===== 지지관계(합·충·형) 설명 =====
   pairSynergy의 점수(일간관계 70% + 오행보완 30%)에는 합치지 않고, 두 사람 사이에
   걸치는 지지관계만 따로 찾아서 설명을 붙여 반환한다. 점수화하지 않으므로 가중치
   결정이 필요 없고, 최종 판단은 보는 사람(궁합표를 보는 관리자)에게 맡긴다.
   파(破)·해(害)는 유파 차이가 커서 제외 — 합(육합·삼합·반합·방합)·충·형만 다룬다. */
const PILLAR_LABEL = { year: '연지', month: '월지', day: '일지', hour: '시지' };

function buildBranchList(member, owner) {
  const out = [];
  if (!member.pillars) return out;
  ['year', 'month', 'day', 'hour'].forEach(k => {
    const p = member.pillars[k];
    if (p) out.push({ id: `${owner}-${k}`, ji: JI[p.ji], owner, name: member.name || '익명', pillarLabel: PILLAR_LABEL[k] });
  });
  return out;
}
function isCross(ids, meta) {
  return new Set(ids.map(id => meta[id].owner)).size > 1;
}
function describeMembers(ids, meta) {
  return ids.map(id => { const m = meta[id]; return `${m.name} ${m.pillarLabel}(${m.ji})`; }).join(' · ');
}
const RELATION_DESC = {
  '육합': elemTxt => `두 지지가 짝을 이루는 합이에요${elemTxt}. 서로 끌어당기고 조화를 이루는 인연의 합이에요.`,
  '삼합': elemTxt => `셋이 모여 ${elemTxt} 국(局)을 완성하는 큰 합이에요. 함께 있을 때 시너지가 강하게 묶여요.`,
  '반합': elemTxt => `${elemTxt} 국(局)의 절반이 모인 합이에요. 완전한 삼합보다는 약하지만 끌어당기는 힘이 있어요.`,
  '방합': elemTxt => `같은 계절의 지지가 모여 ${elemTxt} 기운을 이루는 합이에요. 같은 결의 흐름을 타는 관계예요.`,
  '충': () => `정반대 지지끼리 부딪히는 충이에요. 자극이 되기도 하지만 긴장과 마찰이 따라올 수 있어요.`,
  '삼형': name => `${name ? name + ' ' : ''}형(刑)이 완전히 성립해요. 부딪히며 단련되는 관계지만 갈등이 표면화되기 쉬워요.`,
  '형(부분)': name => `${name ? name + ' ' : ''}형(刑)이 부분적으로 성립해요(2글자만 해당). 약하게 마찰 기운이 있어요.`,
  '형': () => `자묘형(무례지형)이에요. 예의를 둘러싸고 부딪히는 형(刑)의 한 종류예요.`,
  '자형': () => `같은 지지가 겹치는 자형(自刑)이에요. 닮은 만큼 같은 약점이 부딫힐 수 있어요.`,
};
// A, B: {name, pillars} 형태의 멤버 데이터(computeSaju 결과의 pillars를 그대로 사용).
// 점수가 아니라 설명 목록을 반환 — pairSynergy의 점수식에는 영향 없음.
function pairBranchRelations(A, B) {
  const branches = [...buildBranchList(A, 'A'), ...buildBranchList(B, 'B')];
  if (branches.length < 2) return [];
  const meta = {};
  branches.forEach(b => { meta[b.id] = b; });
  const r = analyzeBranchRelations(branches.map(b => ({ id: b.id, ji: b.ji })));
  const out = [];
  const pushAll = (list, type) => {
    list.forEach(item => {
      if (!isCross(item.ids, meta)) return;
      const elemTxt = item.elem ? `(${item.elem} 기운)` : '';
      let desc;
      if (type === '삼형' || type === '형(부분)') desc = RELATION_DESC[type](item.name);
      else if (['육합', '삼합', '반합', '방합'].includes(type)) {
        desc = RELATION_DESC[type](elemTxt);
        if (type === '육합' && item.elem === null) desc += ' (오미합은 化기 없이 합 자체만 이뤄요)';
      } else desc = RELATION_DESC[type]();
      out.push({ type, members: describeMembers(item.ids, meta), desc });
    });
  };
  pushAll(r.combos6, '육합');
  pushAll(r.combos3, '삼합');
  pushAll(r.halfCombos, '반합');
  pushAll(r.bangHap, '방합');
  pushAll(r.clashes, '충');
  pushAll(r.punishTrio, '삼형');
  pushAll(r.punishTrioPartial, '형(부분)');
  pushAll(r.punishPair, '형');
  pushAll(r.punishSelf, '자형');
  return out;
}

module.exports = { GENERATES, CONTROLS, dayMasterRelation, complementScore, pairSynergy, synergyColor, pairBranchRelations };
