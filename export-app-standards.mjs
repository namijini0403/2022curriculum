// curriculum-kb(20-nodes) → ClassTalk 앱 standards JSON 변환기.
// standard 노드의 verbatim 문구 + standard→standard requires(결손 체인)를 앱 ConceptNode로 export.
// 사용: node export-app-standards.mjs   (과학·사회 → ../classtalk-live-interpreter/curriculum/standards/)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const NODES = "20-nodes";
// 데이터 레포 내부로 출력(앱은 이 폴더를 submodule로 참조). 환경변수로 덮어쓰기 가능.
const APP = process.env.APP_STANDARDS_DIR ?? "app-standards";

// 파싱: frontmatter + verbatim quote(> ) + requires 엣지(코드 대상만)
function parseNode(file) {
  const t = readFileSync(path.join(NODES, file), "utf8");
  const fm = (t.match(/^---\n([\s\S]*?)\n---/) || [])[1] || "";
  const g = (k) => (fm.match(new RegExp(`^${k}:\\s*"?([^"\\n]+)"?`, "m")) || [])[1];
  const type = g("type");
  if (type !== "standard") return null;
  const quote = (t.match(/^>\s*(.+)$/m) || [])[1] || "";
  const requires = [...t.matchAll(/requires::\s*\[\[([^\]]+)\]\]/g)]
    .map((m) => m[1].split("|")[0].trim())
    .filter((c) => /^\d[가-힣]\d/.test(c)); // 코드 대상만(예: 6영01-01), 개념명 제외
  return {
    code: g("id"),
    subject: g("subject"),
    domain: g("domain"),
    gradeBand: g("gradeBand"),
    conceptName: g("title"),
    summary: quote,
    requires
  };
}

function exportSubject({ prefix5, prefix3, subject, outFile, sourceLabel }) {
  const files = readdirSync(NODES).filter((f) => f.endsWith(".md"));
  const all = new Map();
  for (const f of files) {
    const n = parseNode(f);
    if (n && n.code) all.set(n.code, n);
  }
  // 5-6 전체 + requires로 참조되는 3-4
  const out = new Map();
  for (const [code, n] of all) {
    if (code.startsWith(prefix5)) out.set(code, n);
  }
  for (const n of [...out.values()]) {
    for (const r of n.requires) {
      if (r.startsWith(prefix3) && all.has(r)) out.set(r, all.get(r));
    }
  }
  // 노드 직렬화(prerequisites는 export 집합 내에서 resolve되는 것만)
  const codes = new Set(out.keys());
  const nodes = [...out.values()]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((n) => ({
      code: n.code,
      gradeBand: n.gradeBand,
      subject: n.subject,
      domain: n.domain,
      conceptName: n.conceptName,
      summary: n.summary,
      prerequisites: n.requires.filter((r) => codes.has(r)),
      successors: [],
      kslLinks: []
    }));
  const doc = {
    _meta: {
      source: `${sourceLabel} — 성취기준 코드·문구 verbatim. curriculum-kb(20-nodes)에서 자동 export.`,
      status: "verbatim",
      note: "성취기준 코드·문구(summary)는 별책 원문 그대로. prerequisites는 curriculum-kb의 교과 내 결손 체인(standard→standard requires)을 그대로 가져온 것(교사 검수 권장). 5-6 전체 + 결손 체인에 참조되는 3-4만 포함. kslLinks는 후속 보강 대상.",
      gradeBandFocus: "5-6"
    },
    nodes
  };
  const unresolved = nodes.flatMap((n) => n.prerequisites.filter((p) => !codes.has(p)));
  writeFileSync(path.join(APP, outFile), JSON.stringify(doc, null, 2) + "\n", "utf8");
  console.log(`${outFile}: ${nodes.length} nodes (5-6 + 참조 3-4), unresolved prereqs: ${unresolved.length}`);
}

exportSubject({
  prefix5: "6과", prefix3: "4과", subject: "과학", outFile: "science-5-6.json",
  sourceLabel: "2022 개정 교육과정 과학과(교육부 고시 제2022-33호 별책9)"
});
exportSubject({
  prefix5: "6사", prefix3: "4사", subject: "사회", outFile: "social-5-6.json",
  sourceLabel: "2022 개정 교육과정 사회과(교육부 고시 제2022-33호 별책7)"
});
exportSubject({
  prefix5: "6영", prefix3: "4영", subject: "영어", outFile: "english-5-6.json",
  sourceLabel: "2022 개정 교육과정 영어과(교육부 고시 제2022-33호 별책14)"
});
exportSubject({
  prefix5: "6도", prefix3: "4도", subject: "도덕", outFile: "moral-5-6.json",
  sourceLabel: "2022 개정 교육과정 도덕과(교육부 고시 제2022-33호 별책6)"
});
exportSubject({
  prefix5: "6음", prefix3: "4음", subject: "음악", outFile: "music-5-6.json",
  sourceLabel: "2022 개정 교육과정 음악과(교육부 고시 제2022-33호 별책12)"
});
exportSubject({
  prefix5: "6체", prefix3: "4체", subject: "체육", outFile: "pe-5-6.json",
  sourceLabel: "2022 개정 교육과정 체육과(교육부 고시 제2022-33호 별책11)"
});
exportSubject({
  prefix5: "6실", prefix3: "4실", subject: "실과", outFile: "practical-5-6.json",
  sourceLabel: "2022 개정 교육과정 실과(교육부 고시 제2022-33호 별책10) — 초등 5-6만 편성"
});
