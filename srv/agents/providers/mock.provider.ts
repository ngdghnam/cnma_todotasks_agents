import { estimateTokens, parseJsonOutput } from "../utils/json";
import { SECTION } from "../constants/context.constants";
import type {
  ContextSummary,
  GoalAnalysis,
  PlanProposal,
  ProposedFile,
  ProposedTask,
  ReviewDecision,
  TaskResult,
} from "../types/agent.types";
import type { GoalContextState, TaskRef } from "../types/context.types";
import type { DetectedStack } from "../types/mock.provider.types";
import type { GenerateRequest, GenerateResponse } from "../types/provider.types";

/**
 * Deterministic stand-in for a real LLM, so the whole agent loop runs offline.
 * It reads the rendered ContextPackage the way a model would (by section) and
 * answers with JSON matching each purpose's output contract.
 *
 * Intentional demo behaviour, to make the control loop observable:
 *  - The Planner "forgets" a test task on its first attempt. The Reviewer
 *    rejects it because the user's preferences require tests. The retry sees
 *    the review feedback and adds the task.
 *  - A Worker whose task has dependencies first calls READ_ARTIFACTS (tool
 *    loop), then answers.
 *
 * Replace by registering a real provider in provider.service.ts.
 */
const MOCK_LATENCY_MS = Number(process.env.MOCK_LATENCY_MS ?? 300);

export async function generate(request: GenerateRequest): Promise<GenerateResponse> {
  await delay(MOCK_LATENCY_MS, request.signal);

  const prompt = [...request.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const usedTools = request.messages.some((m) => m.role === "tool");
  const purpose = request.metadata?.purpose;

  let output: unknown;
  switch (purpose) {
    case "GOAL_ANALYSIS":
      output = analyzeGoal(prompt);
      break;
    case "PLAN_GENERATION":
      output = proposePlan(prompt);
      break;
    case "TASK_EXECUTION": {
      const hasDependencies = !/^none/i.test(section(prompt, SECTION.DEPENDENCY_RESULTS).trim());
      const canRead = request.tools?.some((t) => t.name === "READ_ARTIFACTS");
      if (hasDependencies && canRead && !usedTools) {
        return respond("", request, [{ id: "call_1", name: "READ_ARTIFACTS", arguments: {} }]);
      }
      output = executeTask(prompt);
      break;
    }
    case "REVIEW":
      output = review(prompt);
      break;
    case "CONTEXT_SYNC":
      output = summarizeContext(prompt);
      break;
    default:
      throw new Error(`Mock provider has no behaviour for purpose "${purpose}"`);
  }
  return respond(JSON.stringify(output, null, 2), request);
}

// ---------------------------------------------------------------------------
// Purposes
// ---------------------------------------------------------------------------

function analyzeGoal(prompt: string): GoalAnalysis {
  const goal = section(prompt, SECTION.GOAL);
  const stack = detectStack(goal);
  const preferences = section(prompt, SECTION.PREFERENCES);
  const requirements = stack.code
    ? [
        stack.cap && "SAP CAP backend exposing an OData service",
        stack.cap && "Persist data with CDS entities and seed data",
        stack.react && "React frontend consuming the service",
        "Deliver a runnable project that can be downloaded",
      ]
    : ["Break the goal into concrete learning/working steps", "Produce written deliverables per step"];
  return {
    objective: field(goal, "Title"),
    requirements: requirements.filter((r): r is string => Boolean(r)),
    constraints: preferences
      .split(/(?<=\.)\s+/)
      .filter(Boolean)
      .slice(0, 5)
      .map((p) => `Preference: ${p}`),
    expectedOutcome: stack.code
      ? "A downloadable project following the user's structure and coding style"
      : "A set of documents guiding the user to the goal",
    assumptions: stack.cap ? ["SQLite for local development"] : [],
    ambiguities: field(goal, "Description") ? [] : ["No detailed feature list; assuming standard CRUD features"],
  };
}

function proposePlan(prompt: string): PlanProposal {
  const goal = section(prompt, SECTION.GOAL);
  const title = field(goal, "Title");
  const stack = detectStack(goal);
  const feedback = section(prompt, SECTION.REVIEW_FEEDBACK);
  const changeRequests = [...section(prompt, SECTION.CONVERSATION).matchAll(/Plan change request: (.+)/g)].map(
    (m) => m[1].trim(),
  );

  const tasks: ProposedTask[] = stack.code
    ? [
        task("scaffold", "Scaffold project structure", "Create package.json, tsconfig, .gitignore following the preferred structure.", []),
        task("domain", "Create domain model", "CDS entities with cuid + managed, plus seed data.", ["scaffold"]),
        task("service", "Implement service layer", "CDS service, thin handler and business functions.", ["domain"]),
        ...(stack.react
          ? [task("frontend", "Build React frontend", "Vite + React + Tailwind UI calling the OData service via src/api.ts.", ["domain"])]
          : []),
      ]
    : [
        task("research", "Research and scope", "Collect the key concepts and resources.", []),
        task("outline", "Write learning outline", "Structure the topic into ordered steps.", ["research"]),
        task("practice", "Design practice exercises", "Hands-on exercises per step.", ["outline"]),
        task("checklist", "Create progress checklist", "Checklist to track mastery.", ["outline"]),
      ];

  // Demo: only the retry (which sees the Reviewer's feedback) adds tests.
  if (stack.code && /test/i.test(feedback)) {
    tasks.push(task("tests", "Write unit tests", "Unit tests for the business functions.", ["service"]));
  }
  changeRequests.forEach((text, i) =>
    tasks.push(task(`change-${i + 1}`, `Apply change request: ${text.slice(0, 80)}`, text, tasks.map((t) => t.key))),
  );
  if (stack.code) {
    tasks.push(task("docs", "Write readme", "Run instructions and project structure.", tasks.map((t) => t.key)));
  }

  return {
    title: `Plan: ${title}`,
    summary: `${tasks.length} tasks. Independent tasks can run in parallel.${feedback ? " Revised after review feedback." : ""}`,
    tasks,
  };
}

function executeTask(prompt: string): TaskResult {
  const goal = section(prompt, SECTION.GOAL);
  const current = section(prompt, SECTION.CURRENT_TASK);
  const title = field(current, "Title");
  const app = appName(field(goal, "Title"));
  const files = filesFor(title, app, field(current, "Description"));
  return {
    summary: `${title}: produced ${files.length} file(s): ${files.map((f) => f.path).join(", ")}`,
    files,
    decisions: /domain/i.test(title) ? [`Entity "${capitalize(app)}s" lives in namespace ${app}`] : [],
  };
}

function review(prompt: string): ReviewDecision {
  const proposal = parseJsonOutput<Partial<PlanProposal & TaskResult>>(section(prompt, SECTION.PROPOSAL));
  const issues: string[] = [];

  if (!proposal) {
    issues.push("Proposal is not valid JSON.");
  } else if (proposal.tasks) {
    const keys = new Set(proposal.tasks.map((t) => t.key));
    if (!proposal.tasks.length) issues.push("Plan has no tasks.");
    for (const t of proposal.tasks) {
      for (const dep of t.dependsOn ?? []) {
        if (!keys.has(dep)) issues.push(`Task "${t.key}" depends on unknown task "${dep}".`);
      }
    }
    const wantsTests = /test/i.test(section(prompt, SECTION.PREFERENCES));
    const isCode = detectStack(section(prompt, SECTION.GOAL)).code;
    if (isCode && wantsTests && !proposal.tasks.some((t) => /test/i.test(t.title))) {
      issues.push("User preferences require unit tests, but no task writes tests.");
    }
  } else if (proposal.files) {
    if (!proposal.files.length) issues.push("Task produced no files.");
    for (const f of proposal.files) {
      if (!f.content?.trim()) issues.push(`File ${f.path} is empty.`);
      if (/\/\/ TODO|<placeholder>/.test(f.content ?? "")) issues.push(`File ${f.path} contains placeholders.`);
    }
  }

  return issues.length
    ? { decision: "REJECT", feedback: issues.join(" "), issues }
    : { decision: "ACCEPT", feedback: null, issues: [] };
}

function summarizeContext(prompt: string): ContextSummary {
  const state = parseJsonOutput<GoalContextState>(section(prompt, SECTION.STATE));
  if (!state) return { summary: "Execution state unavailable." };
  const list = (refs: TaskRef[]) => (refs.length ? refs.map((r) => r.title).join(", ") : "none");
  return {
    summary:
      `Phase ${state.phase}. Completed: ${list(state.completed)}. Active: ${list(state.active)}. ` +
      `Pending: ${list(state.pending)}. Blocked: ${list(state.blocked)}. ` +
      `Decisions: ${state.acceptedDecisions.length ? state.acceptedDecisions.join("; ") : "none"}. ` +
      `Next: ${state.nextAction}.`,
  };
}

// ---------------------------------------------------------------------------
// File templates (what a model would write for the mock's own plan)
// ---------------------------------------------------------------------------

function filesFor(title: string, app: string, description: string): ProposedFile[] {
  const Entity = `${capitalize(app)}s`;
  if (/scaffold/i.test(title)) {
    return [
      file("package.json", JSON.stringify({
        name: app,
        version: "1.0.0",
        private: true,
        scripts: { start: "cds-serve", watch: "cds watch", test: "node --test --import tsx test/" },
        dependencies: { "@sap/cds": "^10", express: "^5" },
        devDependencies: { "@cap-js/sqlite": "^3", "@cap-js/cds-types": "^0.18.0", typescript: "^5", tsx: "^4" },
        cds: { requires: { db: { kind: "sqlite", credentials: { url: ":memory:" } } } },
      }, null, 2)),
      file("tsconfig.json", JSON.stringify({
        compilerOptions: { target: "ES2022", module: "NodeNext", moduleResolution: "NodeNext", strict: true, skipLibCheck: true, types: ["node", "@cap-js/cds-types"], noEmit: true },
        include: ["srv/**/*.ts", "test/**/*.ts"],
      }, null, 2)),
      file(".gitignore", ["node_modules/", "*.sqlite", "@cds-models/", "gen/", "app/*/dist/"].join("\n")),
    ];
  }
  if (/domain/i.test(title)) {
    return [
      file("db/schema.cds", [
        `namespace ${app};`,
        "",
        "using { cuid, managed } from '@sap/cds/common';",
        "",
        `entity ${Entity} : cuid, managed {`,
        "    title       : String(255) not null;",
        "    description : LargeString;",
        "    // OPEN / DONE",
        "    status      : String(20) default 'OPEN';",
        "    dueDate     : Date;",
        "}",
      ].join("\n")),
      file(`db/data/${app}-${Entity}.csv`, [
        "ID;title;status",
        "8f3c1a52-1c1e-4b55-9f7a-1d2b3c4d5e01;Try the generated app;OPEN",
        "8f3c1a52-1c1e-4b55-9f7a-1d2b3c4d5e02;Read the readme;DONE",
      ].join("\n")),
    ];
  }
  if (/service/i.test(title)) {
    return [
      file(`srv/${app}-service.cds`, [
        `using { ${app} as db } from '../db/schema';`,
        "",
        `@path: '/${app}'`,
        `service ${capitalize(app)}Service {`,
        `    entity ${Entity} as projection on db.${Entity} actions {`,
        `        action complete() returns ${Entity};`,
        "    };",
        "}",
      ].join("\n")),
      file(`srv/${app}-service.ts`, [
        'import cds from "@sap/cds";',
        `import ${app}Handler from "./handlers/${app}.handler";`,
        "",
        `export class ${capitalize(app)}Service extends cds.ApplicationService {`,
        "  async init() {",
        `    await ${app}Handler(this);`,
        "    await super.init();",
        "  }",
        "}",
      ].join("\n")),
      file(`srv/handlers/${app}.handler.ts`, [
        'import cds from "@sap/cds";',
        `import { completeItem, validateTitle } from "../services/${app}.service";`,
        "",
        `export default async function ${app}Handler(srv: cds.Service) {`,
        `  srv.before(["CREATE", "UPDATE"], "${Entity}", (req) => {`,
        "    const error = validateTitle(req.data.title);",
        "    if (error) req.reject(400, error);",
        "  });",
        "",
        `  srv.on("complete", "${Entity}", async (req) => {`,
        "    const id = (req.params[0] as { ID: string }).ID;",
        "    return completeItem(id);",
        "  });",
        "}",
      ].join("\n")),
      file(`srv/services/${app}.service.ts`, [
        'import cds from "@sap/cds";',
        "",
        "const { SELECT, UPDATE } = cds.ql;",
        `const LOG = cds.log("${app}");`,
        "",
        "export function validateTitle(title: unknown): string | undefined {",
        '  if (title === undefined) return undefined; // PATCH without title',
        '  if (typeof title !== "string" || !title.trim()) return "Title is required";',
        '  if (title.length > 255) return "Title must be at most 255 characters";',
        "  return undefined;",
        "}",
        "",
        "export async function completeItem(id: string) {",
        `  await UPDATE.entity("${app}.${Entity}", id).set({ status: "DONE" });`,
        '  LOG.info("completed", id);',
        `  return SELECT.one.from("${app}.${Entity}", id);`,
        "}",
      ].join("\n")),
    ];
  }
  if (/frontend|react/i.test(title)) {
    const ui = `app/${app}-ui`;
    return [
      file(`${ui}/package.json`, JSON.stringify({
        name: `${app}-ui`,
        private: true,
        type: "module",
        scripts: { dev: "vite", build: "tsc -b && vite build" },
        dependencies: { react: "^19", "react-dom": "^19" },
        devDependencies: { "@vitejs/plugin-react": "^5", "@tailwindcss/vite": "^4", tailwindcss: "^4", typescript: "^5", vite: "^7", "@types/react": "^19", "@types/react-dom": "^19" },
      }, null, 2)),
      file(`${ui}/vite.config.ts`, [
        'import { defineConfig } from "vite";',
        'import react from "@vitejs/plugin-react";',
        'import tailwindcss from "@tailwindcss/vite";',
        "",
        "export default defineConfig({",
        "  plugins: [react(), tailwindcss()],",
        `  server: { proxy: { "/${app}": "http://localhost:4004" } },`,
        "});",
      ].join("\n")),
      file(`${ui}/index.html`, [
        "<!doctype html>",
        '<html lang="en">',
        '  <head><meta charset="UTF-8" /><title>' + capitalize(app) + "</title></head>",
        '  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>',
        "</html>",
      ].join("\n")),
      file(`${ui}/src/index.css`, '@import "tailwindcss";'),
      file(`${ui}/src/main.tsx`, [
        'import { StrictMode } from "react";',
        'import { createRoot } from "react-dom/client";',
        'import App from "./App";',
        'import "./index.css";',
        "",
        'createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);',
      ].join("\n")),
      file(`${ui}/src/api.ts`, [
        `const BASE = "/${app}/${Entity}";`,
        "",
        "export interface Item { ID: string; title: string; status: string }",
        "",
        "export async function listItems(): Promise<Item[]> {",
        "  const res = await fetch(BASE);",
        "  return (await res.json()).value;",
        "}",
        "",
        "export async function createItem(title: string): Promise<void> {",
        '  await fetch(BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });',
        "}",
        "",
        "export async function completeItem(id: string): Promise<void> {",
        '  await fetch(BASE + "(" + id + ")/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });',
        "}",
      ].join("\n")),
      file(`${ui}/src/App.tsx`, [
        'import { useEffect, useState } from "react";',
        'import { completeItem, createItem, listItems, type Item } from "./api";',
        "",
        "export default function App() {",
        "  const [items, setItems] = useState<Item[]>([]);",
        '  const [title, setTitle] = useState("");',
        "  const reload = () => listItems().then(setItems);",
        "  useEffect(() => { reload(); }, []);",
        "",
        "  return (",
        '    <main className="mx-auto max-w-xl p-6">',
        `      <h1 className="mb-4 text-2xl font-semibold">${capitalize(app)}</h1>`,
        '      <form className="mb-4 flex gap-2" onSubmit={async (e) => { e.preventDefault(); await createItem(title); setTitle(""); reload(); }}>',
        '        <input className="flex-1 rounded border px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />',
        '        <button className="rounded bg-blue-600 px-4 py-2 text-white">Add</button>',
        "      </form>",
        '      <ul className="space-y-2">',
        "        {items.map((item) => (",
        '          <li key={item.ID} className="flex items-center justify-between rounded border px-3 py-2">',
        '            <span className={item.status === "DONE" ? "line-through text-gray-400" : ""}>{item.title}</span>',
        '            {item.status !== "DONE" && <button className="text-sm text-blue-600" onClick={() => completeItem(item.ID).then(reload)}>Done</button>}',
        "          </li>",
        "        ))}",
        "      </ul>",
        "    </main>",
        "  );",
        "}",
      ].join("\n")),
    ];
  }
  if (/test/i.test(title)) {
    return [
      file(`test/${app}.service.test.ts`, [
        'import { test } from "node:test";',
        'import assert from "node:assert/strict";',
        `import { validateTitle } from "../srv/services/${app}.service";`,
        "",
        'test("rejects empty titles", () => {',
        '  assert.equal(validateTitle("  "), "Title is required");',
        "});",
        "",
        'test("accepts a normal title", () => {',
        '  assert.equal(validateTitle("Buy milk"), undefined);',
        "});",
      ].join("\n")),
    ];
  }
  if (/readme/i.test(title)) {
    return [
      file("readme.md", [
        `# ${capitalize(app)}`,
        "",
        "Generated by the Todo AI Agent.",
        "",
        "## Run",
        "",
        "```bash",
        "npm install && npm run watch",
        `cd app/${app}-ui && npm install && npm run dev`,
        "```",
        "",
        "## Structure",
        "",
        "- `db/` CDS domain model and seed data",
        "- `srv/` service definition, thin handlers, business functions",
        `- \`app/${app}-ui/\` React + Vite + Tailwind frontend`,
        "- `test/` unit tests (`npm test`)",
      ].join("\n")),
    ];
  }
  // Generic tasks (non-code goals, change requests): one document per task.
  return [file(`docs/${slug(title)}.md`, `# ${title}\n\n${description || "Notes for this step."}\n`)];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function respond(content: string, request: GenerateRequest, toolCalls?: GenerateResponse["toolCalls"]): GenerateResponse {
  const input = request.messages.map((m) => m.content).join("\n");
  return {
    content,
    toolCalls,
    usage: { inputTokens: estimateTokens(input), outputTokens: estimateTokens(content || JSON.stringify(toolCalls)) },
  };
}

/** Content of a `## <title>` block in the rendered context. */
function section(prompt: string, title: string): string {
  const start = prompt.indexOf(`## ${title}\n`);
  if (start < 0) return "";
  const body = prompt.slice(start + title.length + 4);
  const end = body.search(/\n## /);
  return (end < 0 ? body : body.slice(0, end)).trim();
}

/** `Key: value` line inside a section. */
function field(text: string, key: string): string {
  return new RegExp(`^${key}: (.*)$`, "m").exec(text)?.[1]?.trim() ?? "";
}

function detectStack(text: string): DetectedStack {
  const cap = /\bcap\b|sap cap|cds/i.test(text);
  const react = /react/i.test(text);
  const code = cap || react || /full[- ]?stack|app\b|api\b|backend|frontend/i.test(text);
  return { cap: cap || (code && !react), react, code };
}

function appName(title: string): string {
  if (/todo/i.test(title)) return "todo";
  return slug(title).split("-").slice(0, 2).join("") || "app";
}

function task(key: string, title: string, description: string, dependsOn: string[]): ProposedTask {
  return { key, title, description, priority: "MEDIUM", estimatedMinutes: 30, dependsOn };
}

function file(path: string, content: string): ProposedFile {
  return { path, content: content.endsWith("\n") ? content : content + "\n" };
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error("Aborted"));
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new Error("Aborted"));
    }, { once: true });
  });
}
