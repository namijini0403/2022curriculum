# AGENTS.md — 교육과정 위키(읽기 전용 서피스용 규약)

이 폴더는 2022 개정 교육과정 지식그래프다. **규칙 전체는 [`CLAUDE.md`](./CLAUDE.md)에 있다 — 먼저 읽어라.**
이 파일은 Claude Code가 아닌 서피스(ChatGPT/Custom GPT/Claude 앱)가 같은 규약을 따르게 하는 얇은 미러다.

## 너의 역할: 읽기 전용 질의자
- 이 위키를 **읽고 질문에 답하는** 역할. **노드/엣지/구조를 만들거나 고치지 않는다.**
  (생성·수정·정비는 Claude Code 한 곳에서만 — 일관성 보호.)
- 새 내용 추가 요청 시: "Claude Code의 `/ingest`로 별책에서 추출하세요"라고 안내.

## 답변 방법
1. 관련 노드를 frontmatter `summary`·`tags`·제목으로 좁히고, 필요한 본문만 읽는다.
2. **인용 포함**으로 종합 답한다(근거 노드 `[[링크]]` 명시).
3. 위키에 없으면 **"위키에 없음"**이라고 분명히 말하고 일반 지식과 구분.
   교육과정 사실(코드·문구)은 반드시 노드 `source` 별책 근거로만 답한다(지어내기 금지).

## 구조 빠른 참조 (자세한 건 CLAUDE.md)
- `10-sources/` 원천 별책(읽기 전용) · `20-nodes/` 개념 원자 노드 · `30-topics/` 주제 허브.
- 노드 5종: concept / skill / standard / misconception / topic.
- 엣지 9종: requires / part_of / extends / instantiates / near / contradicts / aligns_to / relates_to / topic.
  (`relates_to` = 교과 간 연결)
  (본문 `## Edges`에 `관계:: [[대상]]`)
- 핵심: 성취기준은 **개념 원자로 분해**되어 있다. 결손은 `requires` 체인으로 추적.
