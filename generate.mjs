// 교육과정 지식그래프 → 옵시디언 vault 생성기.
// standards/*.json (성취기준 노드 + 선수개념 링크)을 읽어, 성취기준 1개당 노트 1개를
// frontmatter + [[위키링크]]로 써낸다. 선수개념의 역방향(이어지는 개념)도 계산해 그래프를
// 양방향으로 연결한다. 옵시디언 그래프 뷰 = "백그라운드에서 도는 second brain" 시연용.
//
// 사용:  node generate.mjs   (이 폴더에서)
import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const STD = path.join(ROOT, "standards");
const VAULT = path.join(ROOT, "vault");

const files = (await readdir(STD)).filter((f) => f.endsWith(".json")).sort();
const byCode = new Map();
for (const file of files) {
  const json = JSON.parse(await readFile(path.join(STD, file), "utf8"));
  const status = json._meta?.status ?? "";
  for (const node of json.nodes ?? []) {
    byCode.set(node.code, { ...node, _status: status });
  }
}

// 역방향 간선(이어지는 개념) 계산
const successors = new Map();
for (const node of byCode.values()) {
  for (const pre of node.prerequisites ?? []) {
    if (!successors.has(pre)) successors.set(pre, new Set());
    successors.get(pre).add(node.code);
  }
}

const link = (code) => {
  const n = byCode.get(code);
  return n ? `- [[${code}|${n.conceptName}]]` : `- [[${code}]] *(미정의)*`;
};
const subjectTag = (s) => (s === "KSL" ? "KSL" : s);

await rm(VAULT, { recursive: true, force: true });
await mkdir(VAULT, { recursive: true });

// 과목·영역별 MOC(목차) 집계
const moc = new Map(); // subject -> domain -> codes[]

for (const node of byCode.values()) {
  const succ = [...(successors.get(node.code) ?? [])];
  const frontmatter = [
    "---",
    `code: ${node.code}`,
    `subject: ${node.subject}`,
    `gradeBand: "${node.gradeBand}"`,
    `domain: ${node.domain}`,
    `aliases: ["${node.conceptName}"]`,
    `tags: [성취기준, 과목/${subjectTag(node.subject)}, 학년군/${node.gradeBand}]`,
    `status: ${node._status}`,
    `prerequisites: [${(node.prerequisites ?? []).map((c) => `"${c}"`).join(", ")}]`,
    `successors: [${succ.map((c) => `"${c}"`).join(", ")}]`,
    "---"
  ].join("\n");

  const body = [
    `# ${node.conceptName}  \`${node.code}\``,
    "",
    `> ${node.summary}`,
    "",
    "## ⬅ 선수 개념 (옛날 과정)",
    node.prerequisites?.length
      ? node.prerequisites.map(link).join("\n")
      : "- (없음 — 이 학년군의 시작 개념)",
    "",
    "## ➡ 이어지는 개념",
    succ.length ? succ.map(link).join("\n") : "- (없음)",
    "",
    `*${node.subject} · ${node.domain} · ${node.gradeBand}학년군*`
  ].join("\n");

  await writeFile(path.join(VAULT, `${node.code}.md`), `${frontmatter}\n\n${body}\n`, "utf8");

  if (!moc.has(node.subject)) moc.set(node.subject, new Map());
  const domains = moc.get(node.subject);
  if (!domains.has(node.domain)) domains.set(node.domain, []);
  domains.get(node.domain).push(node.code);
}

// 과목별 MOC 노트
for (const [subject, domains] of moc) {
  const lines = [`# 📚 ${subject} 성취기준 지도(MOC)`, ""];
  for (const [domain, codes] of domains) {
    lines.push(`## ${domain}`);
    for (const code of codes) lines.push(link(code));
    lines.push("");
  }
  await writeFile(path.join(VAULT, `_MOC-${subject}.md`), lines.join("\n"), "utf8");
}

console.log(`generated ${byCode.size} concept notes + ${moc.size} MOC notes → vault/`);
