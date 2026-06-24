/* 성향분석 엔진: 빅파이브(IPIP) + 가치관/개인주의 채점 로직.
   문항 출처: Goldberg, L. R. (1992). The development of markers for the Big-Five factor
   structure. Psychological Assessment, 4, 26-42. — IPIP(ipip.ori.org) 공개 도메인 50문항 전체.
   (기존 20문항은 이 50문항 중 Donnellan et al. (2006) Mini-IPIP가 선별한 요인별 4개와 동일한
   문항을 번역한 것이었음. 이번에 나머지 30문항을 ipip.ori.org 원문 그대로 확인해 추가해서
   요인별 4개 → 10개로 늘림. 각 항목 끝 숫자는 ipip.ori.org 50문항 원문에서의 문항 번호.) */
const BIG5_KEYS=['E','A','C','N','O'];

// 50문항 (각 요인 10개: +keyed/-keyed 비율은 Goldberg 원문과 동일하게 유지). dir:-1은 역채점.
const PERSONALITY_Q=[
  {q:'나는 모임에서 분위기를 띄우는 사람이다',f:'E',dir:1}, // #1
  {q:'나는 처음 보는 사람들과도 잘 이야기한다',f:'E',dir:1}, // #21
  {q:'나는 말수가 적은 편이다',f:'E',dir:-1}, // #6
  {q:'나는 주로 뒤에서 조용히 있는 편이다',f:'E',dir:-1}, // #16
  {q:'나는 다른 사람의 감정에 잘 공감한다',f:'A',dir:1}, // #17
  {q:'나는 타인의 기분을 민감하게 느낀다',f:'A',dir:1}, // #42
  {q:'나는 사실 다른 사람에게 별 관심이 없다',f:'A',dir:-1}, // #32
  {q:'나는 남의 고민에는 마음이 잘 가지 않는다',f:'A',dir:-1}, // #22
  {q:'나는 할 일을 미루지 않고 바로 처리한다',f:'C',dir:1}, // #23
  {q:'나는 질서 있고 정돈된 상태를 좋아한다',f:'C',dir:1}, // #33
  {q:'나는 물건을 제자리에 두는 것을 자주 잊는다',f:'C',dir:-1}, // #28
  {q:'나는 일을 어수선하게 벌여놓곤 한다',f:'C',dir:-1}, // #18
  {q:'나는 기분의 변화가 잦은 편이다',f:'N',dir:1}, // #39
  {q:'나는 사소한 일에도 쉽게 속상해진다',f:'N',dir:1}, // #29
  {q:'나는 대체로 마음이 편안하고 느긋하다',f:'N',dir:-1}, // #9
  {q:'나는 좀처럼 우울해지지 않는다',f:'N',dir:-1}, // #19
  {q:'나는 상상력이 풍부하다',f:'O',dir:1}, // #15
  {q:'나는 추상적인 개념을 이해하기 어렵다',f:'O',dir:-1}, // #10
  {q:'나는 추상적이고 이론적인 생각에 흥미가 없다',f:'O',dir:-1}, // #20
  {q:'나는 상상력이 풍부한 편은 아니다',f:'O',dir:-1}, // #30
  // ↓ 이번에 추가한 30문항 (요인별 6개씩, 기존과 합쳐 10개씩)
  {q:'나는 사람들과 있을 때 편안함을 느낀다',f:'E',dir:1}, // #11
  {q:'나는 할 말이 별로 없는 편이다',f:'E',dir:-1}, // #26
  {q:'나는 모임에서 여러 사람과 폭넓게 이야기한다',f:'E',dir:1}, // #31
  {q:'나는 남의 시선을 끄는 것을 좋아하지 않는다',f:'E',dir:-1}, // #36
  {q:'나는 주목받는 것을 꺼리지 않는다',f:'E',dir:1}, // #41
  {q:'나는 낯선 사람 앞에서는 조용해진다',f:'E',dir:-1}, // #46
  {q:'나는 다른 사람의 일에 별로 신경 쓰지 않는다',f:'A',dir:-1}, // #2
  {q:'나는 사람들에게 관심이 많다',f:'A',dir:1}, // #7
  {q:'나는 남에게 모욕적인 말을 할 때가 있다',f:'A',dir:-1}, // #12
  {q:'나는 마음이 따뜻하고 여린 편이다',f:'A',dir:1}, // #27
  {q:'나는 다른 사람을 위해 시간을 내어준다',f:'A',dir:1}, // #37
  {q:'나는 사람들을 편안하게 해주는 편이다',f:'A',dir:1}, // #47
  {q:'나는 항상 준비가 되어 있다',f:'C',dir:1}, // #3
  {q:'나는 물건을 아무 데나 늘어놓는다',f:'C',dir:-1}, // #8
  {q:'나는 세부적인 것까지 꼼꼼히 챙긴다',f:'C',dir:1}, // #13
  {q:'나는 해야 할 일을 회피하곤 한다',f:'C',dir:-1}, // #38
  {q:'나는 정해진 일정을 잘 따른다',f:'C',dir:1}, // #43
  {q:'나는 일을 할 때 기준이 엄격하고 정확하다',f:'C',dir:1}, // #48
  {q:'나는 스트레스를 쉽게 받는다',f:'N',dir:1}, // #4
  {q:'나는 이런저런 걱정이 많다',f:'N',dir:1}, // #14
  {q:'나는 작은 일에도 쉽게 흔들린다',f:'N',dir:1}, // #24
  {q:'나는 감정 기복이 큰 사람이다',f:'N',dir:1}, // #34
  {q:'나는 쉽게 짜증이 난다',f:'N',dir:1}, // #44
  {q:'나는 자주 기분이 가라앉는다',f:'N',dir:1}, // #49
  {q:'나는 어휘력이 풍부하다',f:'O',dir:1}, // #5
  {q:'나는 좋은 아이디어를 잘 낸다',f:'O',dir:1}, // #25
  {q:'나는 새로운 것을 빠르게 이해한다',f:'O',dir:1}, // #35
  {q:'나는 어려운 단어를 즐겨 쓴다',f:'O',dir:1}, // #40
  {q:'나는 어떤 것에 대해 깊이 생각하는 시간을 갖는다',f:'O',dir:1}, // #45
  {q:'나는 아이디어가 넘치는 사람이다',f:'O',dir:1}, // #50
];
// 문항 수 선택: 20(기존 Mini-IPIP, 배열 앞 20개와 동일) 또는 50(전체). 그 외 값은 50으로 처리.
function getPersonalityQuestions(count){
  return count===20 ? PERSONALITY_Q.slice(0,20) : PERSONALITY_Q;
}
// 채점: 응답(1~5) → 역채점 6-x → 요인별 평균(1~5)과 0~100 환산. count: 20 또는 50(기본값)
function scorePersonality(answers,count=50){
  const items=getPersonalityQuestions(count);
  const sum={E:0,A:0,C:0,N:0,O:0},n={E:0,A:0,C:0,N:0,O:0};
  items.forEach((it,qi)=>{
    let v=answers[qi]; if(v==null)return;
    if(it.dir===-1)v=6-v;
    sum[it.f]+=v; n[it.f]++;
  });
  const mean={},pct={},level={};
  BIG5_KEYS.forEach(f=>{
    const mv=n[f]?sum[f]/n[f]:3;
    mean[f]=+mv.toFixed(2);
    pct[f]=Math.round((mv-1)/4*100);            // 1~5 → 0~100
    level[f]= mv>=3.5?'높음' : mv<=2.5?'낮음' : '보통';
  });
  // 대표 강점 = 가장 높은 요인 (정서성은 낮을수록 강점이라 제외하고 표시)
  const ranked=BIG5_KEYS.filter(f=>f!=='N').sort((a,b)=>mean[b]-mean[a]);
  return {mean,pct,level,top:ranked[0]};
}

/* ===== 가치관 파트 (빅파이브와 분리 채점) =====
   추구가치 5축 · 개인주의 4문항. 화면엔 빅파이브와 섞어 배치하되 집계는 분리. */
const VALUE_KEYS=['money','exp','fame','stable','rel'];
// 추구가치 문항: 각 항목에 얼마나 동의하나 (1~5)
const VALUE_Q=[
  {t:'일의 보상으로 경제적 성취가 가장 중요하다',k:'money'},
  {t:'돈보다 새로운 경험과 성장이 더 끌린다',k:'exp'},
  {t:'사람들에게 인정받고 이름을 알리는 게 중요하다',k:'fame'},
  {t:'무엇보다 안정적이고 오래가는 것을 원한다',k:'stable'},
  {t:'함께하는 사람들과의 관계가 가장 소중하다',k:'rel'},
];
function scoreValues(vresp){
  const pct={};VALUE_KEYS.forEach(k=>pct[k]=Math.round(((vresp[k]||3)-1)/4*100));
  const sorted=VALUE_KEYS.slice().sort((a,b)=>(vresp[b]||3)-(vresp[a]||3));
  return {pct,top:sorted[0],second:sorted[1]};
}
// 개인주의 4문항 (역채점 포함)
const INDIV_Q=[
  {t:'중요한 일은 혼자 결정하고 책임지는 게 편하다',dir:1},
  {t:'성과는 개인별로 분명히 구분되는 게 좋다',dir:1},
  {t:'나는 팀으로 함께할 때 더 힘이 난다',dir:-1},
  {t:'결정은 다 같이 합의해서 내리는 게 좋다',dir:-1},
];
function scoreIndiv(iresp){
  let sum=0,n=0;INDIV_Q.forEach((q,i)=>{let v=iresp[i];if(v==null)return;if(q.dir===-1)v=6-v;sum+=v;n++;});
  const mean=n?sum/n:3,pct=Math.round((mean-1)/4*100);
  return {pct,label: pct>=60?'개인주의(독립 지향)':pct<=40?'협력 지향(팀 우선)':'균형형'};
}

module.exports = {
  BIG5_KEYS, PERSONALITY_Q, getPersonalityQuestions, scorePersonality,
  VALUE_KEYS, VALUE_Q, scoreValues,
  INDIV_Q, scoreIndiv
};
