# CLAUDE.md — 오행연(五行緣) 프로젝트 가이드

> 이 파일은 Claude Code가 세션을 시작할 때 자동으로 읽습니다.
> **새 세션을 시작하면 먼저 `engine/SESSION_SUMMARY.md`도 같이 읽고** 마지막 진행 상황을 파악하세요.
> 모든 대화는 **한국어**로 진행합니다.

---

## 0. 한 줄 소개

사주(四柱 명리학)와 검증된 심리검사(Big Five / IPIP)를 결합한 **팀 관리 웹 애플리케이션**.
개발자는 사주 상담 전문가이자 심리학 전공자(이하 "기석님"). Claude는 개발 파트너.

**제품 비전 — "피플 커넥티드" 3단계**
- Phase 1: 팀 관리 (현재)
- Phase 2: 채용 매칭
- Phase 3: 소셜/관계 매칭 (별도 앱)

---

## 1. 프로젝트 구조

```
ohaeng-project/
  CLAUDE.md                 ← 이 파일 (프로젝트 가이드)
  ohaeng-v14.html           ← 실제 앱 (단일 파일 HTML, 빈 상태)
  ohaeng-v14-demo.html      ← 데모 앱 (가상 인물 10명 사주가 미리 채워짐)
  engine/
    SESSION_SUMMARY.md      ← 세션 간 연속성. 매 세션 끝에 갱신.
    package.json            ← test 스크립트: "node --test"
    build.js                ← esbuild로 src/index.browser.js를 OhaengEngine 전역으로 번들링
    update-app.js           ← build + ohaeng-v14.html 첫 <script>에 번들 끼워넣기 (한 방에)
    gen-demo-members.js     ← 데모용 가상 인물 10명 생성 (시드 고정, 엔진으로 실제 계산)
    src/
      index.js              ← Node용 전체 엔트리 (모든 모듈)
      index.browser.js      ← 브라우저용 엔트리 (앱이 쓰는 모듈만)
      saju/
        saju.js             ← 핵심 계산: computeSaju, deepAnalyze (용신/신강신약/십신)
        relations.js        ← 지지/천간 관계 (합·충·형·파·해·방합·천간합충)
        sewoon.js           ← 세운(연운)
        daewoon.js          ← 대운 (성별 인자 필요, 절기 데이터 1899~2100)
        transit.js          ← 일운·월운 (특정 날짜의 일주·월주)
        timeline.js         ← combinedTimeline: 원국+대운+세운+extraPillars 통합
        twelve-stages.js    ← 12운성 (포태법)
        sinsal.js           ← 신살 5종 (천을귀인·도화살·역마살·화개살·양인살)
        johu.js             ← 조후 (isSimplified:true 플래그로 한계 명시)
        solar-terms-data.json ← MIT 라이선스 절기 데이터 (교차검증용)
        manse-inline.js     ← @fullstackfamily/manseryeok v1.0.8 인라인 번들
      personality/
        personality.js      ← Big Five. getPersonalityQuestions(20|50), Goldberg 1992 IPIP
      synergy/
        synergy.js          ← 궁합. pairSynergy(memberA, memberB), pairBranchRelations(A,B)
    test/                   ← 모듈별 단위 테스트 (현재 75개, 전부 통과)
```

---

## 2. 명령어 (engine/ 폴더에서 실행)

```bash
cd engine
npm install            # 최초 1회 (esbuild, jsdom 등)
node --test            # 단위 테스트 75개
node update-app.js                    # ../ohaeng-v14.html 갱신 (기본 경로)
node update-app.js ../ohaeng-v14.html # 경로 명시도 가능
```

`update-app.js`가 하는 일: ①번들링 → ②html 첫 `<script>` 교체 → ③`node --check` 문법 검증 → ④덮어쓰기. idempotent(두 번 돌려도 안전).

**문법 검사**: `.html`은 `node --check`가 직접 못 받음. script 블록을 추출해서 검사해야 함.

---

## 3. 핵심 설계 원칙 (반드시 지킬 것)

1. **직원이 데이터를 소유한다.** 직원이 공개 범위를 직접 통제(①성향요약 ②상세사주).
   관리자는 "팀에서 내보내기"만 가능(삭제 아님). 완전 삭제는 직원 본인만.

2. **팀보드/개인뷰 분리.** 대운·세운·월운·일운 등 상세 운세는 **직원 개인 뷰 전용**.
   관리자 팀보드(`memberDetailHtml`)에는 **절대 노출하지 않는다**(기석님 명시 요청).

3. **파(破)·해(害) 관계 제외.** 유파차(학파 간 해석 차이)로 인해 모든 시너지·타임라인
   표시에서 파·해는 제외. **확정된 설계 결정.**

4. **용신 동률은 배열로.** 용신이 동률이면 반드시 전체를 배열로 표시 + 안내 문구.
   임의 선택 절대 금지. (검증: 1986-09-17 08:30 → 용신 ["목","수"])

5. **유파차 명시 원칙.** 학파 간 이견이 있는 구현은 임의 결정하지 않고 명시적으로 플래그.
   예: `johu.js`의 `isSimplified:true`, 야자시 기본값 꺼짐(`{yajasi:true}` 옵션).

6. **데모 버전 동반 갱신.** `ohaeng-v14.html`을 수정할 때마다 `ohaeng-v14-demo.html`도
   같은 변경 기준으로 함께 갱신한다. (데모는 `gen-demo-members.js`로 실제 계산해 채움)

7. **기존 호출부 보호.** 시그니처가 바뀐 함수는 얇은 래퍼로 기존 호출부 수정을 최소화.
   예: 앱의 `pairSynergy(i,j)` 인덱스 래퍼.

---

## 4. 작업 워크플로우

```
기능 방향 논의 → 선택지 제시 → 로직 설계 및 Node로 검증 → HTML 수정
  → node --check (script 블록) → jsdom 통합 테스트 → 데모 버전도 갱신
  → 파일 전달 → 한국어 설명
```

- **"코드 이동"과 "코드 변경"을 분리**해서 진행한다 (한 커밋에 섞지 않기).
- 외부 라이브러리(MIT 데이터셋 등)로 **교차검증**한다. 내부 테스트만 믿지 않음.
- 기석님은 사주 수치를 **직접 교차 확인**한다. Claude 계산을 무조건 신뢰하지 않음 — 근거를 같이 제시.
- 아키텍처 결정 전 **트레이드오프를 먼저 파악**하고 방향을 선택한다.

### 회귀 테스트 기준값 (1986-09-17 08:30 남성)
연주 병인 / 월주 정유 / 일주 갑자 / 시주 무진, 일간 갑목, 신약,
용신 동률 ["목","수"], 대운 순행 7세 5개월 시작.
12운성: 연주=건록·월주=태·일주=목욕·시주=쇠.

---

## 5. 디자인 언어

- 화이트 배경 · 골드 액센트 · 緣 인장
- 오행 전통색: 목-녹 / 화-적 / 토-황 / 금-회 / 수-짙은먹색
- 서체: Cormorant Garamond (제목) + Pretendard (본문)

---

## 6. 다음 후보 작업 (SESSION_SUMMARY와 동기화 유지)

1. `ohaeng-v14-invite.html` 마무리 — 가장 오래된 미완료 항목
2. 신살·조후를 앱에 노출할지 결정 (엔진엔 있음, 12운성은 이미 포팅됨)
3. 합·충까지 포함한 관계 강도(weight) 체계 — 기석님 임상 기준으로 설계 예정
4. 지장간 활성 구간(사령법) 계산 — 절기 진행도 기준
5. 백엔드/엔진 실제 API 배포 (현재는 단일 HTML에 끼워넣는 방식)
6. Phase 2 구인구직 모드
7. 야자시 기준 시각 — 진태양시 보정 후 시각 기준 검토 (유파차)
8. 사주 콘텐츠 마케팅(네이버 블로그) — 코드와 별개 트랙

---

## 7. 세션 트리거 명령어

- **"안녕"** → `CLAUDE.md`와 `engine/SESSION_SUMMARY.md`를 열어서 마지막 진행 상황을 요약해줌
- **"고마워"** → 현재까지 작업 내용을 `engine/SESSION_SUMMARY.md`에 정리해줌

---

## 8. 세션 종료 시 체크리스트

- [ ] `engine/SESSION_SUMMARY.md`를 이번 세션 기준으로 갱신했는가
- [ ] `node --test` 전부 통과하는가
- [ ] `ohaeng-v14.html`과 `ohaeng-v14-demo.html` 둘 다 갱신했는가
- [ ] 위 "다음 후보 작업" 목록을 최신화했는가
