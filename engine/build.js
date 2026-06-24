// 엔진(engine/src) 전체를 브라우저에서 쓸 수 있는 단일 IIFE로 번들링.
// 결과: window.OhaengEngine = { saju, personality, synergy, branchRelations, sewoon, daewoon, twelveStages, sinsal, johu, timeline }
// 앱(ohaeng-v14.html)은 이 파일을 <script>로 인라인 삽입해서 쓴다 — 로직을 손으로 복사하지 않는다.
const esbuild = require('esbuild');
const path = require('path');

esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'src/index.browser.js')],
  bundle: true,
  format: 'iife',
  globalName: 'OhaengEngine',
  platform: 'browser',
  target: 'es2018',
  outfile: path.join(__dirname, 'dist/ohaeng-engine.browser.js'),
});

console.log('빌드 완료 → dist/ohaeng-engine.browser.js');
