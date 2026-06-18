# 교육과정 지식그래프 (Curriculum Knowledge Graph)

2022 개정 교육과정 초등 **전 교과 성취기준**을 가르치고 진단할 수 있는 **개념 원자 노드 + 선수/교과 간 링크**로 구조화한 재사용 자산. 옵시디언 그래프로 "백그라운드에서 도는 교육과정 엔진"을 시연하고, **ClassTalk**(다문화 실시간 통역·결손 보완) 등 여러 앱에서 **단일 출처(source of truth)**로 참조한다.

- **1041 노드** (standard 707 · concept 248 · skill 54 · misconception 32), **dangling 0**
- 학년군 1-2 / 3-4 / 5-6, 교과: 국어·수학·과학·사회·영어·도덕·음악·체육·실과·KSL·통합교과
- 모든 성취기준은 별책 원문 **verbatim**, 교과 간 `relates_to`로 결손 체인이 학년·교과를 가로지름
- 다문화 결손 핵심: 생활 한국어 유창 ≠ 학습 한국어(BICS≠CALP) 오개념 노드 포함

> 원천 별책 PDF는 이 레포에 포함하지 않는다(용량·배포). 로컬 외부 폴더에서 참조.

## 구조
```
.
├─ CLAUDE.md / AGENTS.md     스키마·온톨로지·규약(노드 5종·엣지 9종·granularity §5)
├─ 20-nodes/                 개념 원자 노드 1041개 (한 파일 = 한 개념/성취기준)
├─ 30-topics/                주제·교과 허브
├─ 10-sources/               원천 별책 메타(읽기 전용, PDF는 외부)
├─ _templates/               노드 골격
├─ index.md / log.md         카탈로그 + append-only 수집 이력
├─ export-app-standards.mjs  ▶ 그래프 → 앱 소비용 JSON 변환기
├─ app-standards/            ▶ 앱이 소비하는 standards JSON (생성 산출물)
└─ (legacy) standards/ generate.mjs vault/   v0 coarse 내보내기(과거 자료)
```

## ClassTalk 앱이 참조하는 법 (git submodule)
앱(공용 레포 `classtalk-live-interpreter`)은 이 레포를 **submodule**로 끌어와 `app-standards/`의 JSON만 소비한다(`STANDARDS_DIR`).
```bash
# 앱 레포에서 (1회)
git submodule add <이 레포 URL> curriculum-graph
# 앱은 STANDARDS_DIR=curriculum-graph/app-standards 로 로드
# clone 시
git clone --recursive <앱 레포>   # 또는: git submodule update --init
```
앱은 이 레포의 특정 커밋을 **고정 참조**하므로 교육과정 데이터 버전이 명확히 관리된다.

## app-standards 재생성
```bash
node export-app-standards.mjs    # 20-nodes → app-standards/*.json (과학·사회·영어·도덕·음악·체육·실과)
```
- 각 노드 = `{ code, gradeBand, subject, domain, conceptName, summary, prerequisites[], successors[], kslLinks[] }`
- `summary`·`code`는 별책 verbatim, `prerequisites`는 그래프의 교과 내 결손 체인(standard→standard).
- `math-5-6.json` / `korean-5-6.json` / `ksl.json`은 현재 커밋된 산출물(별책8·5 verbatim 기반, KSL은 앱 다리 시드). 추후 생성기로 편입 가능.

## 옵시디언으로 보기 (시연)
1. 옵시디언 → **Open folder as vault** → 이 폴더 선택.
2. **그래프 뷰(Ctrl+G)** → 성취기준이 선수개념·교과로 연결된 네트워크.
3. 노드 라벨을 id 대신 제목으로 보려면 커뮤니티 플러그인 **Front Matter Title**(필드 `title`, Graph 토글 ON).
