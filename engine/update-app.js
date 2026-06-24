// 엔진을 번들링하고, 그 번들을 team-maker.html의 첫 <script>에 통째로 끼워넣는 걸 한 번에 한다.
// 사용법: node update-app.js [html경로]  (생략하면 ../team-maker.html을 기본으로 봄)
//
// 무엇을 하는지:
//   1) build.js와 동일하게 esbuild로 src/index.browser.js를 OhaengEngine 전역으로 번들링
//   2) html 파일에서 첫 <script>...</script> 블록을 찾아 그 내용을 번들로 교체
//   3) node --check로 결과 스크립트 문법 검증
//   4) 파일을 덮어쓰고, 바뀐 크기를 알려줌
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ENGINE_DIR = __dirname;
const htmlPath = path.resolve(process.argv[2] || path.join(ENGINE_DIR, '..', 'team-maker.html'));

if (!fs.existsSync(htmlPath)) {
  console.error(`html 파일을 못 찾았어요: ${htmlPath}`);
  console.error('node update-app.js <team-maker.html 경로> 로 직접 지정해주세요.');
  process.exit(1);
}

// 1) 번들링
console.log('1/4 엔진 번들링 중...');
esbuild.buildSync({
  entryPoints: [path.join(ENGINE_DIR, 'src/index.browser.js')],
  bundle: true,
  format: 'iife',
  globalName: 'OhaengEngine',
  platform: 'browser',
  target: 'es2018',
  outfile: path.join(ENGINE_DIR, 'dist/ohaeng-engine.browser.js'),
});
const bundle = fs.readFileSync(path.join(ENGINE_DIR, 'dist/ohaeng-engine.browser.js'), 'utf8');
console.log(`    번들 크기: ${(bundle.length / 1024).toFixed(0)}KB`);

// 2) html의 첫 <script> 블록 찾아서 교체
console.log('2/4 team-maker.html의 첫 <script> 교체 중...');
const html = fs.readFileSync(htmlPath, 'utf8');
const lines = html.split('\n');
const startIdx = lines.findIndex(l => l.trim() === '<script>');
if (startIdx === -1) {
  console.error('<script> 태그를 못 찾았어요. html 구조가 바뀐 건 아닌지 확인해주세요.');
  process.exit(1);
}
const endIdx = lines.findIndex((l, i) => i > startIdx && l.trim() === '</script>');
if (endIdx === -1) {
  console.error('첫 <script>를 닫는 </script>를 못 찾았어요.');
  process.exit(1);
}
const before = lines.slice(0, startIdx + 1); // '<script>' 줄까지 포함
const after = lines.slice(endIdx); // '</script>' 줄부터
const newLines = [...before, bundle.trimEnd(), ...after];
const newHtml = newLines.join('\n');

// 3) 문법 검증 (두 <script> 블록을 합쳐서 확인)
console.log('3/4 문법 검증 중...');
const scriptMatches = [...newHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const tmpPath = path.join(ENGINE_DIR, '.update-app-check.js');
fs.writeFileSync(tmpPath, scriptMatches.map(m => m[1]).join('\n'));
try {
  execFileSync(process.execPath, ['--check', tmpPath]);
} catch (e) {
  fs.unlinkSync(tmpPath);
  console.error('문법 검증 실패 — html 파일은 덮어쓰지 않았어요.');
  console.error(e.stderr ? e.stderr.toString() : e.message);
  process.exit(1);
}
fs.unlinkSync(tmpPath);

// 4) 저장
fs.writeFileSync(htmlPath, newHtml);
console.log(`4/4 완료 → ${htmlPath} (${(newHtml.length / 1024).toFixed(0)}KB)`);
