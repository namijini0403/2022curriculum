# 🌙 야간 자율 ingest 큐 (재개 가능 — 이 파일이 진실의 원천)

이 파일은 Claude Code가 밤사이 자율로 남은 초등 교과를 curriculum-kb에 ingest하기 위한 **실행 명세 + 진행 상태**다.
ScheduleWakeup으로 재진입할 때마다 **이 파일을 먼저 읽고**, status가 `todo`인 첫 교과를 처리한다.

## 작업 루프 (매 깨어남마다)
1. 이 파일을 읽는다. status `done`은 건너뛴다. `todo` 중 **가장 위 1개**(컨텍스트 여유 있으면 2개)를 처리.
2. 해당 별책 PDF를 읽어 **초등 성취기준 전체를 verbatim** 추출한다(코드·문구 원문 일치). **중학교(9X) 코드는 절대 제외.** PDF 페이지 ≈ 인쇄 페이지 + 6. "나. 성취기준" 섹션부터 영역 (1),(2)… 순서.
3. `_gen_<subj>.mjs` 생성기를 curriculum-kb 루트에 쓰고 `node`로 실행 후 `rm`. (writeFileSync는 덮어쓰기=idempotent, 중간에 끊겨 재실행해도 안전.)
   - 노드 규칙은 [`CLAUDE.md`](./CLAUDE.md) 준수: 파일명=id(standard=코드, concept/skill/misconception=한글 개념명), frontmatter 필수 필드, 본문 `## Edges`에 `관계:: [[대상]]`.
   - **각 교과당**: ① 성취기준 standard 노드 전수(verbatim, topic→해당 30-topics 허브) ② fine 개념/스킬/오개념 ~15–25개(가르치고 진단 가능한 원자) ③ 교과 내부 `requires`(5-6→3-4 결손 체인, 별책 "성취기준 적용 시 고려 사항"의 연계 정보 근거) ④ **교과 간 `relates_to`**(수학/국어/과학/사회/KSL 중 진짜 연결되는 것만 — 지어내지 말 것) ⑤ 오개념은 `contradicts`+`requires`.
   - 토픽 허브는 이미 생성됨: 30-topics/{도덕,영어,음악,체육,통합교과,KSL}. 미술·실과는 기존 허브 사용.
4. **lint 게이트**: 아래 lint 스크립트로 dangling 확인. **dangling이 0이 아니면 해당 교과를 done으로 표시하지 말 것** — 깨진 링크(코드 오타/제목으로 링크한 standard 등)를 고쳐 0으로 만든 뒤에만 done.
5. `index.md`에 교과 섹션 1블록 추가, `log.md`에 한 줄 append(고정 포맷, 과거 줄 수정 금지). 출처 노트 `10-sources/별책X-...md` 없으면 생성(페이지 범위 기록).
6. 이 파일에서 그 교과 status를 `done`으로 바꾸고 처리 메모(노드 수)를 적는다.
7. **남은 `todo`가 있으면** ScheduleWakeup으로 같은 작업을 다시 예약(delay ~120s). **모두 done이면** 재예약하지 말고 `log.md`에 최종 요약 append + 이 파일 맨 위 `## 상태`를 `ALL DONE`으로 바꾸고 종료.

## lint 스크립트 (curriculum-kb 루트에서 실행)
```
node -e 'const fs=require("fs"),p=require("path");const d="20-nodes";const fl=fs.readdirSync(d).filter(f=>f.endsWith(".md"));const N=new Set(fl.map(f=>f.replace(/\.md$/,"")));const T=new Set(fs.readdirSync("30-topics").filter(f=>f.endsWith(".md")).map(f=>"30-topics/"+f.replace(/\.md$/,"")));let dg=[];for(const f of fl){const t=fs.readFileSync(p.join(d,f),"utf8");for(const m of t.matchAll(/\[\[([^\]]+)\]\]/g)){const l=m[1].split("|")[0].trim();if(!N.has(l)&&!T.has(l)&&!l.startsWith("10-sources/")&&l!=="second brain CLAUDE.md")dg.push(f+" -> "+l);}}console.log("nodes",fl.length,"dangling",dg.length);if(dg.length)console.log([...new Set(dg)].join("\n"));'
```

## 안전 규칙 (반드시)
- **기존 노드를 지우거나 망가뜨리지 않는다.** 생성기는 id로 덮어쓸 뿐. 기존 bridge 노드(과학-*, 사회-*, 미술-* 등)는 그대로 둔다.
- **초등 전용**(1-2/3-4/5-6). 중학교 코드 금지.
- verbatim 정확성 우선. 불확실하면 PDF를 더 읽어 확인.
- 한 교과 끝낼 때마다 lint=0 게이트 통과 후에만 done. 그래야 끊겨도 다음 깨어남이 안전하게 이어받음.
- 깃헙 푸시 금지(로컬 자산). git 명령 쓰지 말 것.

## 교과 큐 (status: todo | done)
> 처리 순서 = 다문화 결손 관련성 우선. PDF는 `../2022개정교육과정(깃헙에 올리지마_자산구축용)/`.

1. **도덕** — done(2026-06-17, 44노드: standard 24 + fine 20, dangling 0) — 별책6.
2. **영어** — done(2026-06-17, 56노드: standard 40 + fine 16, dangling 0) — 별책14.
3. **KSL 한국어** — done(2026-06-17, 106노드: standard 96 + fine 10, dangling 0) — 별책41. 단계→학년군 매핑, level 필드.
4. **미술** — done(2026-06-17, 37노드: standard 26 + fine 11, dangling 0) — 별책13.
5. **음악** — done(2026-06-17, 37노드: standard 26 + fine 11, dangling 0) — 별책12.
6. **체육** — done(2026-06-18, 62노드: standard 49 + fine 13, dangling 0) — 별책11.
7. **실과** — done(2026-06-18, 57노드: standard 39 + fine 18, dangling 0) — 별책10. 5-6만.
8. **통합교과(바·슬·즐)** — done(2026-06-18, 59노드: standard 48 + fine 11, dangling 0) — 별책15. 1-2만, 4주제영역.

## 상태
**ALL DONE** (2026-06-18) — 8교과(도덕·영어·KSL·미술·음악·체육·실과·통합교과) 야간 자율 ingest 완료. 기존 4교과(수학·국어·과학·사회)와 합쳐 **초등 전 12교과 완전체**. 최종 **1041노드, dangling 0**. ScheduleWakeup 루프 종료(재예약 없음). 상세는 index.md·log.md 참조.
