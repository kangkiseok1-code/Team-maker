/* 사주 계산 엔진. ohaeng-v14.html의 동일 로직을 그대로 이동(로직 변경 없음). */
const manse = require('./manse-inline.js');
const manseSaju = manse.calculateSaju;
const manseLunarToSolar = manse.lunarToSolar;

// 주요 도시 경도 (진태양시 경도 보정용). 라이브러리는 longitude 옵션을 반영함.
const CITY_LNG={'서울':126.98,'부산':129.08,'대구':128.60,'인천':126.71,'광주':126.85,'대전':127.38,'울산':129.31,'수원':127.03,'창원':128.68,'제주':126.53,'강릉':128.90,'전주':127.15};
const GAN=['갑','을','병','정','무','기','경','신','임','계'];
const GAN_HANJA=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const JI_HANJA=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const JI=['자','축','인','묘','진','사','오','미','신','유','술','해'];
const GAN_ELEM=['목','목','화','화','토','토','금','금','수','수'];
const JI_ELEM=['수','토','목','목','토','화','화','토','금','금','토','수'];
const ELEMS=['목','화','토','금','수'];

/* ===== 사주 심화 분석: 십신 · 신강신약 · 용신 (자동 추정) =====
   용신은 억부 원칙 기반 자동 추정이며, 유파에 따라 달라질 수 있어 운영자 검수가 필요합니다. */
const GAN_YIN_YANG=['양','음','양','음','양','음','양','음','양','음'];
const JIJANGGAN={자:['계'],축:['기','계','신'],인:['갑','병','무'],묘:['을'],진:['무','을','계'],사:['병','무','경'],오:['정','기'],미:['기','정','을'],신:['경','임','무'],유:['신'],술:['무','신','정'],해:['임','갑']};
const SHENG={목:'화',화:'토',토:'금',금:'수',수:'목'};
const KE_={목:'토',토:'수',수:'화',화:'금',금:'목'};
const GENERATED_BY_={화:'목',토:'화',금:'토',수:'금',목:'수'};
const SIBSIN_GROUP={비견:'비겁',겁재:'비겁',식신:'식상',상관:'식상',편재:'재성',정재:'재성',편관:'관성',정관:'관성',편인:'인성',정인:'인성'};
function sibsinOf(dayGanIdx,targetGanIdx){
  const dE=GAN_ELEM[dayGanIdx],tE=GAN_ELEM[targetGanIdx];
  const same=GAN_YIN_YANG[dayGanIdx]===GAN_YIN_YANG[targetGanIdx];
  if(dE===tE)return same?'비견':'겁재';
  if(SHENG[dE]===tE)return same?'식신':'상관';
  if(KE_[dE]===tE)return same?'편재':'정재';
  if(KE_[tE]===dE)return same?'편관':'정관';
  return same?'편인':'정인';
}
function deepAnalyze(pillars){
  if(!pillars||!pillars.day)return null;
  const dayGan=pillars.day.gan, dayElem=GAN_ELEM[dayGan];
  const sibsin={비겁:0,식상:0,재성:0,관성:0,인성:0};
  ['year','month','hour'].forEach(k=>{if(pillars[k]){sibsin[SIBSIN_GROUP[sibsinOf(dayGan,pillars[k].gan)]]++;}});
  ['year','month','day','hour'].forEach(k=>{if(pillars[k]){const bongi=JIJANGGAN[JI[pillars[k].ji]][0];sibsin[SIBSIN_GROUP[sibsinOf(dayGan,GAN.indexOf(bongi))]]++;}});
  const power={목:0,화:0,토:0,금:0,수:0};
  ['year','month','hour'].forEach(k=>{if(pillars[k])power[GAN_ELEM[pillars[k].gan]]+=1.0;});
  ['year','month','day','hour'].forEach(k=>{if(pillars[k]){JIJANGGAN[JI[pillars[k].ji]].forEach((g,gi)=>{power[GAN_ELEM[GAN.indexOf(g)]]+=(gi===0?1.0:0.3);});}});
  const helpElems=[dayElem,GENERATED_BY_[dayElem]];
  const total=Object.values(power).reduce((a,b)=>a+b,0)||1;
  const helpRatio=helpElems.reduce((s,e)=>s+power[e],0)/total;
  const monthElem=pillars.month?JI_ELEM[pillars.month.ji]:null;
  const monthHelps=helpElems.includes(monthElem);
  const score=helpRatio+(monthHelps?0.15:-0.1);
  const status=score>=0.5?'신강':'신약';
  const r2=e=>Math.round(power[e]*100)/100; // 부동소수점 오차 방지(예: 1.0+0.3)
  let yongsin,reason;
  if(status==='신강'){
    const drain=[SHENG[dayElem],KE_[dayElem],Object.keys(KE_).find(k=>KE_[k]===dayElem)];
    const maxP=Math.max(...drain.map(r2));
    yongsin=[...new Set(drain.filter(e=>r2(e)===maxP))];
    reason='신강하니 넘치는 기운을 덜어내는 오행이 용신이에요(억부의 억).';
  }else{
    const minP=Math.min(...helpElems.map(r2));
    yongsin=[...new Set(helpElems.filter(e=>r2(e)===minP))];
    reason='신약하니 일간을 북돋아 힘을 더하는 오행이 용신이에요(억부의 부).';
  }
  if(yongsin.length>1)reason+=` (${yongsin.join('·')}의 세력이 같아 동률이에요. 둘 다 후보로 봐주세요.)`;
  const topSibsin=Object.entries(sibsin).sort((a,b)=>b[1]-a[1])[0][0];
  return {sibsin,topSibsin,power,helpRatio:+helpRatio.toFixed(2),monthHelps,status,yongsin,reason};
}

// 만세력 라이브러리 기반 정확 계산. 기존 앱이 쓰는 {gan,ji} 인덱스 형태로 변환해 호환 유지.
// 분(minute) 입력은 시주 진태양시 보정에 영향 — 시(hour)만 들어오면 0분으로 처리.
function pillarToIdx(hangul){
  // hangul 예: '병인' → {gan: GAN.indexOf('병'), ji: JI.indexOf('인')}
  if(!hangul||hangul.length<2)return null;
  const g=GAN.indexOf(hangul[0]);
  const j=JI.indexOf(hangul[1]);
  if(g<0||j<0)return null;
  return {gan:g,ji:j};
}
// 다음 양력 날짜(year/month/day 오버플로를 JS Date가 알아서 처리).
function nextCalendarDate(y,mo,d){
  const nd=new Date(y,mo-1,d+1);
  return {y:nd.getFullYear(), mo:nd.getMonth()+1, d:nd.getDate()};
}
function computeSaju(year,month,day,hour,opts){
  opts=opts||{};
  const minute = (opts.minute!==undefined&&opts.minute!=='')?parseInt(opts.minute,10):0;
  const calendar = opts.calendar||'solar';
  const leap = !!opts.leap;
  const city = opts.city;
  const yajasi = !!opts.yajasi; // 23시생을 다음날 일주로 볼지 — 유파차 영역이라 기본은 끔(조자시), 켜면 야자시 적용
  // 1) 음력이면 양력으로 변환
  let y=year,mo=month,d=day;
  if(calendar==='lunar'){
    try{ const conv=manseLunarToSolar(year,month,day,leap); y=conv.solar.year; mo=conv.solar.month; d=conv.solar.day; }
    catch(e){ console.error('음력 변환 오류',e); }
  }
  // 2) 경도 옵션
  const lngOpt = (city&&CITY_LNG[city]!=null) ? {longitude:CITY_LNG[city]} : undefined;
  const hasHour = (hour!==''&&hour!=null);
  const rawHour = hasHour?parseInt(hour,10):null;
  // 2.5) 야자시: 23시생이면 일주·월주·연주를 "다음날" 기준으로 다시 계산(만세력 라이브러리가 day stem
  // 기준으로 시주 천간도 같이 정하므로, 날짜만 다음날로 넘겨서 그대로 계산하면 시주까지 일관되게 맞음).
  let dayShiftedByYajasi=false, calcY=y, calcMo=mo, calcD=d;
  if(hasHour && yajasi && rawHour===23){
    const nd=nextCalendarDate(y,mo,d);
    calcY=nd.y; calcMo=nd.mo; calcD=nd.d;
    dayShiftedByYajasi=true;
  }
  // 3) 시:분 + 경도 반영해 계산
  let res;
  try{
    if(hasHour){
      res = lngOpt ? manseSaju(calcY,calcMo,calcD,rawHour,minute,lngOpt) : manseSaju(calcY,calcMo,calcD,rawHour,minute);
    }else{
      res = manseSaju(y,mo,d);
    }
  }catch(e){ console.error('만세력 계산 오류',e); res = manseSaju(y,mo,d); }
  const pillars={
    year: pillarToIdx(res.yearPillar),
    month: pillarToIdx(res.monthPillar),
    day: pillarToIdx(res.dayPillar),
    hour: hasHour ? pillarToIdx(res.hourPillar) : null
  };
  const dist={목:0,화:0,토:0,금:0,수:0};
  ['year','month','day','hour'].forEach(k=>{if(pillars[k]){dist[GAN_ELEM[pillars[k].gan]]++;dist[JI_ELEM[pillars[k].ji]]++;}});
  const dGan = pillars.day ? pillars.day.gan : 0;
  // 보정된 양력 날짜와 시각도 함께 반환(내 정보 표시용)
  return {pillars,dist,dayMaster:dGan,dayMasterElem:GAN_ELEM[dGan],solar:{y,m:mo,d},corrected:res.correctedTime||null,deep:deepAnalyze(pillars),dayShiftedByYajasi};
}

module.exports = {
  CITY_LNG, GAN, GAN_HANJA, JI_HANJA, JI, GAN_ELEM, JI_ELEM, ELEMS,
  GAN_YIN_YANG, JIJANGGAN, SHENG, KE_, GENERATED_BY_, SIBSIN_GROUP,
  sibsinOf, deepAnalyze, pillarToIdx, computeSaju
};
