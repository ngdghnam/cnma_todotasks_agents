#!/usr/bin/env node
/**
 * Pilot agent-runtime gate.
 *
 * This runner deliberately does not invoke a model. The host session invokes
 * the selected agent. The runner owns deterministic preparation, scope
 * snapshots and completion validation, so a model cannot certify its own work
 * merely by writing a plausible result file.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { validate as schemaValidate, artifactSchemas } from './schema-validation.mjs';

const require = createRequire(import.meta.url);
const YAML = require('yaml');
// ROOT is the repository the runtime operates on. It normally derives from this
// script's location, but AGENT_RUNTIME_ROOT lets a harness test point the loop
// commands at an isolated temp repo. Bound JSON schemas always load from the real
// repo via schema-validation.mjs (which owns its own ROOT), so overriding this
// relocates only executions, git scope snapshots and fromRoot() lookups.
const ROOT = process.env.AGENT_RUNTIME_ROOT
  ? path.resolve(process.env.AGENT_RUNTIME_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXECUTIONS = path.join(ROOT, '.harness', 'executions');
const CURRENT_SCHEMA_VERSION = '1.3';
const FIXTURE_SCHEMA_VERSION = '1.2';
const REQUIRED_EVENTS = ['execution.prepared', 'prompt.compiled', 'context.loaded', 'human.dispatch-confirmed', 'agent.started', 'completion.evaluated'];
const EVENT_TYPES = new Set([
  ...REQUIRED_EVENTS,
  'agent.invoked', 'iteration.started', 'tool.called', 'artifact.changed', 'validation.completed',
  'progress.updated', 'finding.recorded', 'permission.denied', 'warning.dispositioned',
  'agent.completed', 'agent.paused', 'agent.blocked', 'agent.failed', 'gate.evaluated',
  // transition.proposed is retained solely to validate historical v1 records.
  'transition.proposed', 'transition.reference-resolved', 'session.closure-required', 'session.closed',
  'iteration.opened', 'iteration.resumed', 'iteration.recorded', 'iteration.abandoned',
  'iteration.rejected', 'loop.progress-detected', 'loop.no-progress', 'loop.stop-required'
]);
const COMPLETION_CHECKS = {
  dev: ['IMPL-WORK', 'IMPL-AC', 'IMPL-TESTS', 'IMPL-VALIDATION', 'IMPL-SCOPE', 'IMPL-NOTES', 'IMPL-BLOCKERS'],
  ba: ['BA-CONTEXT', 'BA-SCOPE', 'BA-TRACEABILITY', 'BA-ACCEPTANCE', 'BA-BOUNDARY']
};
const TRACKS = ['ba', 'dev'];
const V2_ENFORCEMENT_PROFILE = 'orchestrated-v2';
const ENFORCEMENT_PROFILE = 'orchestrated-v3';
const ORCHESTRATED_PROFILES = new Set(['orchestrated-v1', V2_ENFORCEMENT_PROFILE, ENFORCEMENT_PROFILE]);
const COMPLETED_LOOP_EVENTS = ['iteration.started', 'progress.updated', 'agent.completed'];
const V3_COMPLETED_LOOP_EVENTS = ['iteration.opened', 'iteration.recorded'];
const STATUS_RANK = {
  'pending': 0,
  'in-progress': 1,
  'completed': 2,
  'excluded': 2,
  'blocked': 2,
  'verified': 2,
  'not-applicable': 2,
  'pass': 2,
  'fail': 2,
  'passed': 2,
  'failed': 2
};

function fail(message) { throw new Error(message); }
function relative(file) { return path.relative(ROOT, file).replaceAll('\\', '/'); }
function fromRoot(rel) { return path.resolve(ROOT, rel); }
function readText(rel) { return fs.readFileSync(fromRoot(rel), 'utf8'); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8'); }
function writeText(file, value) { fs.writeFileSync(file, value, 'utf8'); }
function readYaml(rel) { return YAML.parse(readText(rel)); }
function sha256(file) { return createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function hashText(value) { return createHash('sha256').update(value).digest('hex'); }
function now() { return new Date().toISOString(); }
function trackConfig(bindings, track) {
  const config = bindings.runtime?.tracks?.[track];
  if (!config) fail(`No runtime configuration for ${track.toUpperCase()} track.`);
  return config;
}
function trackOf(execution) { return execution.track ?? 'dev'; }
function bindingKey(track) { return `feature_implementation.${track}.status`; }
function loadOrchestrationContract(track = 'dev') {
  const bindings = readYaml('.harness/agent-bindings.yml');
  return readYaml(trackConfig(bindings, track).orchestration_contract);
}
function transitionMoves() { return readYaml('.harness/transitions.yml').transitions.feature_implementation.moves; }
function orchestrationPolicyFor(liveState, track = 'dev') { return loadOrchestrationContract(track).states?.[liveState]; }
function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
function objectHash(value) { return hashText(stableJson(value)); }
function recordHash(record) {
  const { record_sha256: _ignored, ...payload } = record;
  return objectHash(payload);
}
function isV3Execution(execution) { return execution.schema_version === '1.3' || execution.enforcement_profile === ENFORCEMENT_PROFILE; }

// The orchestration contract references transition IDs, but transitions.yml
// remains the sole authority for their actual source and destination states.
// Validate that reference mechanically rather than trusting its name.
function transitionCompatibilityErrors(transitionId, liveState, track = 'dev') {
  const move = transitionMoves()[transitionId];
  if (!move) return [`Contract target_transition ${transitionId} is not a transitions.yml move.`];
  const errors = [];
  const stateField = `${track}_status`;
  if (move.from?.[stateField] !== liveState) {
    errors.push(`Contract target_transition ${transitionId} starts from ${track.toUpperCase()} state ${move.from?.[stateField] ?? '(none)'}, not live_state ${liveState}.`);
  }
  const destination = move.to?.[stateField];
  if (typeof destination !== 'string' || destination.length === 0) {
    errors.push(`Contract target_transition ${transitionId} does not end at a ${track.toUpperCase()} state.`);
  } else if (!orchestrationPolicyFor(destination, track)) {
    errors.push(`Contract target_transition ${transitionId} ends at undeclared ${track.toUpperCase()} state ${destination}.`);
  }
  return errors;
}

// may_propose_transition is intentionally declared both in the stable agent
// manifest and in the project-owned orchestration contract.  The former owns
// worker capability; the latter owns state routing.  A mismatch is unsafe and
// must fail instead of silently privileging either declaration.
function proposalAuthorityErrors(policy, manifestRef) {
  if (!manifestRef || !fs.existsSync(fromRoot(manifestRef))) {
    return [`Agent manifest is unavailable for proposal-authority check: ${manifestRef ?? '(missing)'}.`];
  }
  const manifest = readYaml(manifestRef);
  const manifestValue = manifest?.governance?.may_propose_transition;
  if (typeof manifestValue !== 'boolean') {
    return [`Agent manifest ${manifestRef} must declare governance.may_propose_transition as a boolean.`];
  }
  if (policy.agent_may_propose !== manifestValue) {
    return [`Orchestration policy agent_may_propose=${policy.agent_may_propose} disagrees with ${manifestRef} governance.may_propose_transition=${manifestValue}.`];
  }
  return [];
}

function policyConfigurationErrors(policy, liveState, manifestRef, track = 'dev') {
  const errors = [];
  for (const outcome of Object.values(policy.outcomes ?? {})) {
    if (outcome.action === 'propose_transition') {
      errors.push(...transitionCompatibilityErrors(outcome.target_transition, liveState, track));
    }
  }
  errors.push(...proposalAuthorityErrors(policy, manifestRef));
  return errors;
}

function appendEvent(executionDir, event) {
  const eventFile = path.join(executionDir, 'events.jsonl');
  const executionFile = path.join(executionDir, 'execution.json');
  const schemaVersion = event.schema_version
    ?? (fs.existsSync(executionFile) ? readJson(executionFile).schema_version : CURRENT_SCHEMA_VERSION);
  const prior = fs.existsSync(eventFile)
    ? fs.readFileSync(eventFile, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse)
    : [];
  const entry = { schema_version: schemaVersion, sequence: prior.length + 1, timestamp: now(), ...event };
  fs.appendFileSync(eventFile, `${JSON.stringify(entry)}\n`, 'utf8');
  return entry;
}

function args(argv) {
  const result = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith('--')) { result._.push(value); continue; }
    const key = value.slice(2);
    const next = argv[i + 1];
    result[key] = next && !next.startsWith('--') ? (i += 1, next) : true;
  }
  return result;
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

function dirtySnapshot() {
  const rows = git(['status', '--porcelain=v1']).split(/\r?\n/).filter(Boolean);
  return rows.map(row => {
    const file = row.slice(3).replace(/\\/g, '/');
    const absolute = fromRoot(file);
    return {
      path: file,
      status: row.slice(0, 2),
      sha256: fs.existsSync(absolute) && fs.statSync(absolute).isFile() ? sha256(absolute) : null
    };
  });
}

function changedSince(start) {
  const startByPath = new Map(start.entries.map(entry => [entry.path, entry.sha256]));
  return dirtySnapshot().filter(entry => startByPath.get(entry.path) !== entry.sha256);
}

function extractPlanInventory(planRel) {
  const text = readText(planRel);
  const wbs = text.match(/##[^\n]*\bWBS\b[^\n]*\n([\s\S]*?)(?=\n## )/i)?.[1] ?? '';
  const tableItems = [...wbs.matchAll(/^\|\s*((?:BE|FE)-\d+[a-z]?)\s*\|/gmi)]
    .map(match => match[1].toUpperCase());
  // A declared No-change heading is still governed work, even when omitted
  // from a build table because it has no target file (for example BE-5).
  const noChangeItems = [...text.matchAll(/^###\s+((?:BE|FE)-\d+[a-z]?)[^\n]*\n(?:\s*\n)?No change\./gmi)]
    .map(match => match[1].toUpperCase());
  const uniqueWorkItems = [...new Set([...tableItems, ...noChangeItems])];
  if (uniqueWorkItems.length === 0) fail(`No BE/FE work headings found in ${planRel}.`);

  const testPlan = text.match(/## Test Plan\s*([\s\S]*?)(?=\n## )/i)?.[1] ?? '';
  const testNames = [...testPlan.matchAll(/`([^`]+\.test\.js)`/g)].map(match => match[1]);
  const epicNumber = path.posix.basename(planRel).match(/^EP-(\d+)/i)?.[1];
  const testFiles = testNames.map(name => name.includes('/') ? name : `test/ep-${epicNumber}/${name}`);
  if (testFiles.length === 0) fail(`No test obligations found in ${planRel}.`);

  const acceptanceCriteria = [...text.matchAll(/\b(AC-US-\d+-\d+)\b/g)].map(match => match[1]);
  return {
    plan_ref: planRel,
    plan_sha256: sha256(fromRoot(planRel)),
    work_items: uniqueWorkItems,
    test_files: [...new Set(testFiles)],
    acceptance_criteria: [...new Set(acceptanceCriteria)]
  };
}

function findImplementation(implId) {
  const file = 'docs/04-delivery/feature-implementations.yml';
  const implementation = readYaml(file).feature_implementations.find(entry => entry.id === implId);
  if (!implementation) fail(`Unknown feature implementation: ${implId}`);
  return implementation;
}

function findPlan(implId) {
  const directory = fromRoot('docs/04-delivery/exec-plans/active');
  const expected = implId.toLowerCase();
  const match = fs.readdirSync(directory).find(file => file.toLowerCase().includes(expected));
  if (!match) fail(`No active execution plan found for ${implId}.`);
  return `docs/04-delivery/exec-plans/active/${match}`;
}

function regexEscape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function resolveVersionedBaselineRefs(implementation) {
  const implId = implementation.id;
  const version = Number(implementation.dev?.baseline_version);
  if (!Number.isInteger(version) || version < 1) fail(`${implId} has no valid dev.baseline_version.`);

  const allRefs = [
    ...(implementation.ba?.artifacts ?? []),
    ...(implementation.dev?.evidence ?? [])
  ];
  const baselinePattern = new RegExp(`(^|/)FS-${regexEscape(implId)}-v${version}\\.md$`);
  const handoffPattern = new RegExp(`(^|/)HANDOFF-${regexEscape(implId)}-BA-DEV-v${version}\\.yml$`);
  const baseline = allRefs.find(ref => ref.includes('/functional-specs/baselines/') && baselinePattern.test(ref));
  const handoff = allRefs.find(ref => ref.includes('/track-handoffs/ba-to-dev/') && handoffPattern.test(ref));

  if (!baseline) fail(`${implId} baseline_version ${version} has no matching frozen baseline artifact FS-${implId}-v${version}.md.`);
  if (!handoff) fail(`${implId} baseline_version ${version} has no matching BA->DEV handoff HANDOFF-${implId}-BA-DEV-v${version}.yml.`);
  return { baseline, handoff, version };
}

function assertResolvedBaselineRefs({ implementation, baseline, handoff, version }) {
  if (!fs.existsSync(fromRoot(baseline))) fail(`Resolved frozen baseline missing for ${implementation.id}: ${baseline}`);
  if (!fs.existsSync(fromRoot(handoff))) fail(`Resolved BA->DEV handoff missing for ${implementation.id}: ${handoff}`);

  const handoffDoc = readYaml(handoff);
  if (Number(handoffDoc.version) !== version) {
    fail(`Resolved BA->DEV handoff ${handoff} has version ${handoffDoc.version}, expected ${version}.`);
  }
  const specDocs = handoffDoc.baseline_ref?.spec_docs ?? [];
  if (!Array.isArray(specDocs) || !specDocs.includes(baseline)) {
    fail(`Resolved BA->DEV handoff ${handoff} does not reference frozen baseline ${baseline}.`);
  }
}

function workScopes(planRel) {
  const text = readText(planRel);
  const headings = [...text.matchAll(/^###\s+(?:(?:BE|FE)-\d+[a-z]?)[^\n]*$/gmi)].map(match => match[0]);
  const targets = headings.flatMap(heading => [...heading.matchAll(/`([^`]+)`/g)].map(match => match[1]))
    .filter(value => /\//.test(value) && !value.includes(' '))
    .map(value => /^(services|components|pages|hooks|src)\//.test(value) ? `app/manage-project/${value}` : value);
  const scopes = new Set(['test/**', 'docs/04-delivery/implementation-notes/**']);
  for (const target of targets) {
    const normalized = target.replaceAll('\\', '/').replace(/\*$/, '**');
    if (normalized.endsWith('/**')) scopes.add(normalized);
    else if (path.posix.extname(normalized)) scopes.add(`${path.posix.dirname(normalized)}/**`);
  }
  return [...scopes].sort();
}

function activeFunctionalSpec(implementation) {
  return (implementation.ba?.artifacts ?? []).find(ref => ref.includes('/functional-specs/active/')) ?? null;
}

function baInventory(implementation, liveState) {
  const source = activeFunctionalSpec(implementation) ?? 'docs/02-requirements/features.yml';
  return {
    plan_ref: source,
    plan_sha256: sha256(fromRoot(source)),
    work_items: [`BA-${liveState.toUpperCase()}`],
    test_files: [],
    acceptance_criteria: []
  };
}

function baWorkScopes() { return ['docs/04-delivery/functional-specs/active/**']; }

function expectedOutputs(track) {
  return track === 'ba'
    ? ['functional-analysis evidence', 'active functional-specification update when applicable', 'clarification or review evidence', 'build-readiness evidence']
    : ['implemented atomic work items', 'required test evidence', 'validation evidence', 'implementation notes'];
}

function requiredPromptKinds(track) {
  return track === 'ba'
    ? ['loop-policy', 'summary-contract', 'evaluation-policy', 'functional-context']
    : ['loop-policy', 'summary-contract', 'evaluation-policy', 'reconciled-exec-plan'];
}

// A write-capable execution receives the plan-derived source scope. Read-only
// workers can write only their execution artifacts (and declared generated
// output), even when they inspect a feature whose implementation scope is wide.
function projectWriteScopes(agentManifest, scopes) {
  const mayModify = agentManifest?.governance?.may_modify_project;
  if (mayModify === true) return scopes;
  if (mayModify === false) return [];
  fail(`Agent manifest ${agentManifest?.agent?.id ?? '(unknown)'} must declare governance.may_modify_project as a boolean.`);
}

// Loop stop limits are taken from the agent manifest: the no-progress ceiling
// plus a hard iteration cap that is the stricter of the loop and budget limits.
function resolveLoopLimits(agentManifest) {
  const id = agentManifest?.agent?.id ?? '(unknown)';
  const noProgress = agentManifest?.loop?.max_no_progress_iterations;
  const hardCandidates = [agentManifest?.loop?.hard_iteration_limit, agentManifest?.runtime?.budgets?.max_iterations]
    .filter(value => Number.isInteger(value) && value > 0);
  if (!Number.isInteger(noProgress) || noProgress < 1) fail(`Agent manifest ${id} must declare loop.max_no_progress_iterations as a positive integer.`);
  if (!hardCandidates.length) fail(`Agent manifest ${id} must declare loop.hard_iteration_limit or runtime.budgets.max_iterations.`);
  return { max_no_progress_iterations: noProgress, hard_iteration_limit: Math.min(...hardCandidates) };
}

// Project-source changes recorded during an attempt must fall inside the agent's
// declared project_write scope. Execution-local and generated artifacts are not
// project source and are excluded; read-only agents (empty project_write) may
// not change any project source. Returns the offending project paths.
function scopeViolations(changes, permissions) {
  const nonProjectScopes = [
    ...(permissions.execution_write ?? []),
    ...(permissions.agent_execution_write ?? []),
    ...(permissions.runtime_execution_write ?? []),
    ...(permissions.generated_write ?? [])
  ];
  return changes
    .filter(change => !allowedPath(change.path, nonProjectScopes))
    .filter(change => !allowedPath(change.path, permissions.project_write ?? []))
    .map(change => change.path);
}

// Runtime-owned initial loop artifacts for a fresh execution: the canonical
// loop-state plus the `initialized` ledger record, hash-anchored to progress.
// Shared by prepare and by harness tests that seed an isolated execution.
function initialLoopArtifacts(executionId, progress, limits, timestamp) {
  const progressHash = objectHash(progress);
  const initLedger = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: executionId, sequence: 1, record_kind: 'initialized',
    timestamp, agent: 'runtime', attempt_id: null, committed_iteration: 0, candidate_ref: null, candidate_sha256: null,
    meaningful_progress: false, summary: 'Runtime initialized canonical loop state.',
    previous_ledger_sha256: null, progress_before_sha256: progressHash, progress_after_sha256: progressHash
  };
  initLedger.record_sha256 = recordHash(initLedger);
  const loopState = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: executionId, committed_iteration_count: 0, next_attempt_number: 1,
    open_attempt: null, no_progress_iterations: 0, max_no_progress_iterations: limits.max_no_progress_iterations,
    hard_iteration_limit: limits.hard_iteration_limit, stop_required: false, stop_reason: null,
    scope_checkpoint: dirtySnapshot(), last_progress_sha256: progressHash, last_ledger_sha256: initLedger.record_sha256
  };
  return { loopState, initLedger };
}

function promptComponents({ track, workSource, implementation, agentManifestRel, workflowRel }) {
  const manifest = readYaml(agentManifestRel);
  const refs = [
    ['project-governance', 'AGENTS.md'],
    ['binding', '.harness/agent-bindings.yml'],
    ['command', '.harness/commands.yml'],
    ['workflow', workflowRel],
    ['human-dispatch', '.agent/agents/harness/runtime/human-gated-dispatch.md'],
    ['agent-manifest', agentManifestRel],
    ['agent-instructions', manifest.instructions],
    ...manifest.shared_context.map(ref => ['shared-context', ref]),
    ...manifest.skills.map(ref => ['skill', ref]),
    ['loop-policy', '.agent/agents/harness/runtime/loop-ledger-v3.md'],
    ['summary-contract', '.agent/agents/harness/runtime/summary-contract.md'],
    ['evaluation-policy', '.agent/agents/harness/runtime/evaluation-policy.md'],
    ['side-effect-policy', '.agent/agents/harness/runtime/side-effect-policy.md'],
    ['gate-policy', '.agent/agents/harness/runtime/gate-policy.md']
  ];
  if (track === 'ba') {
    refs.push(
      ['functional-context', workSource],
      ['feature-implementations', 'docs/04-delivery/feature-implementations.yml'],
      ['features', 'docs/02-requirements/features.yml'],
      ['user-stories', 'docs/02-requirements/user-stories.yml'],
      ['acceptance-criteria', 'docs/02-requirements/07-acceptance-criteria.md']
    );
  } else {
    const resolvedBaseline = resolveVersionedBaselineRefs(implementation);
    assertResolvedBaselineRefs({ implementation, ...resolvedBaseline });
    refs.push(['reconciled-exec-plan', workSource], ['frozen-baseline', resolvedBaseline.baseline], ['ba-dev-handoff', resolvedBaseline.handoff]);
  }
  return refs.map(([kind, ref]) => {
    if (!ref || !fs.existsSync(fromRoot(ref))) fail(`Prompt component missing: ${kind} ${ref ?? '(undefined)'}`);
    return { kind, ref, sha256: sha256(fromRoot(ref)) };
  });
}

function dispatchBrief({ executionId, implId, agent, displayName }) {
  return `# Human-gated agent dispatch\n\nThis is a project-owned execution package. It contains no dependency on a\nparticular AI product, model, IDE, or chat history.\n\n## Required worker\n\n- Stable agent ID: \`${agent}\`\n- Display name: **${displayName}**\n- Target: \`${implId}\`\n- Execution: \`${executionId}\`\n\n## Human gate\n\nA human has deliberately routed this work to the worker above. Open a fresh AI\nsession in any approved environment, then give it only this instruction:\n\n> Read \`AGENTS.md\`, then read \`.harness/executions/${executionId}/dispatch.md\` and execute the required \`${agent}\` work. Do not use prior chat history as project context.\n\n## First actions for the worker\n\n1. Read \`AGENTS.md\`.\n2. Read \`execution.json\`, \`context.json\`, \`prompt-manifest.json\`,\n   \`progress.json\`, and every referenced source in this execution directory.\n3. Confirm it is the required \`${agent}\` worker; otherwise stop without\n   changing project files.\n4. Record the acknowledgement:\n\n   \`node .harness/scripts/agent-runtime.mjs acknowledge --execution ${executionId} --agent ${agent}\`\n\n5. Record work start:\n\n   \`node .harness/scripts/agent-runtime.mjs start --execution ${executionId} --agent ${agent}\`\n\n6. Execute the loop and write only the artifacts and project files permitted\n   by \`context.json\`.\n7. When a result and evaluation are ready, run:\n\n   \`node .harness/scripts/agent-runtime.mjs finalize --execution ${executionId}\`\n\nThe worker never applies a lifecycle transition. A missing acknowledgement or\nstart event means no agent work has been proven to have occurred.\n`;
}

function dispatchBriefWithClosure({ executionId, implId, agent, displayName }) {
  return [
    '# Human-gated agent dispatch',
    '',
    'This is a project-owned execution package. It contains no dependency on a particular AI product, model, IDE, or chat history.',
    '',
    '## Required worker',
    '',
    `- Stable agent ID: \`${agent}\``,
    `- Display name: **${displayName}**`,
    `- Target: \`${implId}\``,
    `- Execution: \`${executionId}\``,
    '',
    '## First actions for the worker',
    '',
    '1. Read `AGENTS.md`, then this execution directory and every referenced source.',
    `2. Verify that the required stable agent ID is \`${agent}\`; otherwise stop without changing project files.`,
    `3. Run \`node .harness/scripts/agent-runtime.mjs acknowledge --execution ${executionId} --agent ${agent}\`.`,
    `4. Run \`node .harness/scripts/agent-runtime.mjs start --execution ${executionId} --agent ${agent}\`.`,
    `5. Open a runtime-owned loop attempt with \`node .harness/scripts/agent-runtime.mjs begin-iteration --execution ${executionId}\`.`,
    '6. Execute only the permitted work. Write evidence under `evidence/**` and iteration proposals under `iteration-candidates/**`; do not edit `progress.json`, `loop-state.json`, or `loop-ledger.jsonl` directly.',
    `7. Commit each proposal with \`node .harness/scripts/agent-runtime.mjs record-iteration --execution ${executionId} --candidate <candidate-json>\`.`,
    `8. When result/evaluation are ready, run \`node .harness/scripts/agent-runtime.mjs finalize --execution ${executionId}\`.`,
    '9. Complete `end-session`: append an execution-ID-cited progress entry, update `latest-session.md`, and perform the normal project-control checks.',
    `10. Run \`node .harness/scripts/agent-runtime.mjs close-session --execution ${executionId}\`.`,
    '',
    'The worker never applies a lifecycle transition. The execution cannot return to a Harness gate until `close-session` verifies end-session evidence.'
  ].join('\n');
}

function assertLiveBinding(execution) {
  const implementation = findImplementation(execution.target.id);
  const bindings = readYaml('.harness/agent-bindings.yml');
  const track = trackOf(execution);
  const binding = bindings.bindings[bindingKey(track)]?.[implementation[track]?.status];
  if (!binding || binding.agent !== execution.agent || binding.mode !== execution.mode) {
    fail(`Live routing no longer matches ${execution.execution_id}; prepare a new execution from current project state.`);
  }
}

function assertNoActiveClaim(execution) {
  const active = fs.readdirSync(EXECUTIONS, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name !== execution.execution_id)
    .map(entry => path.join(EXECUTIONS, entry.name, 'execution.json'))
    .filter(fs.existsSync)
    .map(readJson)
    .find(candidate => candidate.target?.type === execution.target.type
      && candidate.target?.id === execution.target.id
      && ['acknowledged', 'running', 'awaiting-session-close'].includes(candidate.status));
  if (active) fail(`${execution.target.id} already has an active human-routed execution: ${active.execution_id} (${active.status}).`);
}

function prepare(options) {
  const implId = options.impl;
  const executionId = options['execution-id'];
  const runIntent = options.intent ?? 'fresh';
  if (!implId || !executionId) fail('Usage: prepare --impl IMPL-### --execution-id EXEC-... [--track ba|dev] [--intent fresh|clean-replay] [--dry-run]');
  if (!['fresh', 'clean-replay'].includes(runIntent)) fail(`Unsupported run intent: ${runIntent}`);
  const implementation = findImplementation(implId);
  const bindings = readYaml('.harness/agent-bindings.yml');
  const route = resolveTrack(implementation, bindings, options.track);
  const { track, liveState, policy, binding } = route;
  const runtimeTrack = trackConfig(bindings, track);
  // Resolve the orchestration policy first so a declared no-agent boundary is a
  // clear diagnostic rather than a bare "no bound agent" error, and a live state
  // with no policy fails safe before any execution is created.
  for (const [rel, schemaRel] of [['.harness/agent-bindings.yml', bindings.schema], [runtimeTrack.orchestration_contract, bindings.runtime.orchestration_schema]]) {
    const check = schemaValidate(schemaRel, readYaml(rel));
    if (!check.ok) fail(`${rel} fails ${schemaRel}: ${check.errors.join('; ')}`);
  }
  if (policy.agent !== binding.agent || policy.mode !== binding.mode) fail(`Orchestration policy (${policy.agent}/${policy.mode}) disagrees with routing binding (${binding.agent}/${binding.mode}) for ${track.toUpperCase()} ${liveState}.`);
  const catalog = bindings.catalog[binding.agent];
  const policyErrors = policyConfigurationErrors(policy, liveState, catalog?.manifest, track);
  if (policyErrors.length) fail(`Orchestration policy is invalid for ${track.toUpperCase()} ${liveState}: ${policyErrors.join(' ')}`);
  const agentManifest = readYaml(catalog.manifest);
  const workSource = track === 'dev' ? findPlan(implId) : (activeFunctionalSpec(implementation) ?? 'docs/02-requirements/features.yml');
  const inventory = track === 'dev' ? extractPlanInventory(workSource) : baInventory(implementation, liveState);
  const executionDir = path.join(EXECUTIONS, executionId);
  if (fs.existsSync(executionDir)) fail(`Execution directory already exists: ${relative(executionDir)}`);

  const scopes = track === 'dev' ? workScopes(workSource) : baWorkScopes();
  const timestamp = now();
  const components = promptComponents({ track, workSource, implementation, agentManifestRel: catalog.manifest, workflowRel: runtimeTrack.workflow });
  const prior = runIntent === 'clean-replay'
    ? (options.supersedes ?? '').split(',').filter(Boolean).map(id => `.harness/executions/${id}/evaluation.json`)
    : [];
  if (runIntent === 'clean-replay' && prior.length === 0) fail('clean-replay requires --supersedes EXEC-...,EXEC-...');

  const prefix = `.harness/executions/${executionId}`;
  const agentExecutionWrite = [
    `${prefix}/iteration-candidates/**`,
    `${prefix}/evidence/**`,
    `${prefix}/result.json`,
    `${prefix}/evaluation.json`
  ];
  const runtimeExecutionWrite = [
    `${prefix}/execution.json`,
    `${prefix}/context.json`,
    `${prefix}/prompt-manifest.json`,
    `${prefix}/work-inventory.json`,
    `${prefix}/progress.json`,
    `${prefix}/loop-state.json`,
    `${prefix}/loop-ledger.jsonl`,
    `${prefix}/events.jsonl`,
    `${prefix}/scope-start.json`,
    `${prefix}/scope-end.json`,
    `${prefix}/dispatch.md`
  ];
  const context = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: executionId, workflow_id: runtimeTrack.workflow.includes('prepare-functional-spec') ? 'prepare-functional-spec' : 'implement-feature', track,
    agent: binding.agent, mode: binding.mode, target: { type: 'feature_implementation', id: implId },
    live_state: liveState, run_intent: runIntent,
    prior_execution_policy: runIntent === 'clean-replay' ? 'exclude-prior-output-use-prior-as-evaluation-only' : 'none',
    routing: { mode: 'human-gated', required_human_action: 'start-a-new-agent-session-and-confirm-dispatch' },
    completion_contract_ref: `.agent/agents/harness/contracts/states/${binding.mode}-completion.yml`,
    progress_ref: `${prefix}/progress.json`,
    project_state: { sprint: implementation.sprint, baseline_version: track === 'dev' ? implementation.dev.baseline_version : null },
    references: components.map(component => ({ path: component.ref, purpose: component.kind })),
    permissions: { read: ['docs/**', 'db/**', 'srv/**', 'app/**', 'packages/**', 'test/**', '.harness/**', '.agent/agents/harness/**'], project_write: projectWriteScopes(agentManifest, scopes), generated_write: bindings.permissions.generated_write, agent_execution_write: agentExecutionWrite, runtime_execution_write: runtimeExecutionWrite, deny: bindings.permissions.protected, tools: agentManifest.tools.allow },
    side_effects: { policy_ref: bindings.runtime.side_effect_policy, classification_required: true },
    expected_outputs: expectedOutputs(track),
    prior_execution_outputs: prior,
    open_questions: []
  };
  const progress = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: executionId, agent: binding.agent, mode: binding.mode,
    iteration: 0, no_progress_iterations: 0, work_plan_source: workSource,
    work_item_inventory_complete: true, unaccounted_source_item_ids: [],
    work_items: inventory.work_items.map(id => ({ id, parent_id: null, atomic: true, description: `${track.toUpperCase()} work item ${id}`, source_ref: `${workSource}#${id}`, status: 'pending', disposition: 'pending', evidence_refs: [] })),
    acceptance_criteria: inventory.acceptance_criteria.map(id => ({ id, parent_id: null, atomic: true, description: id, source_ref: workSource, status: 'pending', disposition: 'pending', evidence_refs: [] })),
    test_obligations: inventory.test_files.map(file => ({ id: `TEST-${file}`, path: file, source_ref: `${workSource}#test-plan`, status: 'pending', evidence_refs: [] })),
    completion_checks: COMPLETION_CHECKS[track].map(id => ({ id, status: 'pending', evidence_refs: [] })),
    completion_evaluation: { all_required_checks_pass: false, pending_check_ids: COMPLETION_CHECKS[track], pending_work_item_ids: inventory.work_items, pending_acceptance_criteria_ids: inventory.acceptance_criteria, pending_test_ids: inventory.test_files.map(file => `TEST-${file}`) },
    validations: [], progress_signature: createHash('sha256').update(JSON.stringify(inventory)).digest('hex'), last_progress_at: timestamp,
    termination: { status: 'running', reason: null }
  };
  const { loopState, initLedger } = initialLoopArtifacts(executionId, progress, resolveLoopLimits(agentManifest), timestamp);
  const execution = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: executionId, workflow_id: context.workflow_id, track, target: context.target,
    live_state: liveState, agent: binding.agent, display_name: catalog.display_name,
    agent_version: agentManifest.agent.version, mode: binding.mode, run_intent: runIntent,
    supersedes_execution: runIntent === 'clean-replay' ? (options.supersedes ?? '').split(',').filter(Boolean) : [],
    prior_execution_policy: context.prior_execution_policy, manifest_ref: catalog.manifest,
    enforcement_mode: bindings.runtime.enforcement_mode, routing_mode: 'human-gated', completion_contract_ref: context.completion_contract_ref,
    side_effect_policy_ref: bindings.runtime.side_effect_policy, status: 'awaiting-human-dispatch', session_closure_status: 'required', created_at: timestamp,
    context_ref: `${prefix}/context.json`, prompt_manifest_ref: `${prefix}/prompt-manifest.json`, progress_ref: `${prefix}/progress.json`,
    result_ref: `${prefix}/result.json`, evaluation_ref: `${prefix}/evaluation.json`, events_ref: `${prefix}/events.jsonl`, dispatch_brief_ref: `${prefix}/dispatch.md`,
    loop_protocol_ref: '.agent/agents/harness/runtime/loop-ledger-v3.md', loop_state_ref: `${prefix}/loop-state.json`, loop_ledger_ref: `${prefix}/loop-ledger.jsonl`, iteration_candidates_ref: `${prefix}/iteration-candidates`,
    effective_permissions: context.permissions, enforcement_profile: ENFORCEMENT_PROFILE, eligible_transition: null
  };
  const prompt = { schema_version: CURRENT_SCHEMA_VERSION, execution_id: executionId, agent: binding.agent, mode: binding.mode, compiled_at: timestamp,
    precedence: ['system-safety', 'project-governance', 'agent-instructions', 'shared-context', 'state-skill', 'execution-context', 'loop-and-completion', 'permissions', 'summary-and-evaluation', 'output-contract'],
    components, completion_contract_ref: context.completion_contract_ref, loop_policy_ref: '.agent/agents/harness/runtime/loop-ledger-v3.md', output_schema_ref: '.agent/agents/harness/schemas/agent-result.schema.json', secrets_included: false };
  if (options['dry-run']) {
    console.log(JSON.stringify({ execution_id: executionId, status: 'dry-run-prepared', track, work_source: workSource, required_agent: binding.agent, atomic_work_items: inventory.work_items, required_tests: inventory.test_files, write_scope: scopes }, null, 2));
    return;
  }
  fs.mkdirSync(executionDir, { recursive: true });
  fs.mkdirSync(path.join(executionDir, 'iteration-candidates'), { recursive: true });
  fs.mkdirSync(path.join(executionDir, 'evidence'), { recursive: true });
  writeJson(path.join(executionDir, 'work-inventory.json'), { schema_version: '1.0', execution_id: executionId, ...inventory });
  writeJson(path.join(executionDir, 'scope-start.json'), { schema_version: '1.0', execution_id: executionId, captured_at: timestamp, entries: dirtySnapshot() });
  writeJson(path.join(executionDir, 'context.json'), context);
  writeJson(path.join(executionDir, 'progress.json'), progress);
  writeJson(path.join(executionDir, 'loop-state.json'), loopState);
  fs.writeFileSync(path.join(executionDir, 'loop-ledger.jsonl'), `${JSON.stringify(initLedger)}\n`, 'utf8');
  writeJson(path.join(executionDir, 'execution.json'), execution);
  writeJson(path.join(executionDir, 'prompt-manifest.json'), prompt);
  writeText(path.join(executionDir, 'dispatch.md'), dispatchBriefWithClosure({ executionId, implId, agent: binding.agent, displayName: catalog.display_name }));
  fs.writeFileSync(path.join(executionDir, 'events.jsonl'), `${JSON.stringify({ schema_version: CURRENT_SCHEMA_VERSION, execution_id: executionId, sequence: 1, timestamp, event: 'execution.prepared', agent: 'runtime', status: 'awaiting-human-dispatch', summary: 'Runtime preparation completed.' })}\n${JSON.stringify({ schema_version: CURRENT_SCHEMA_VERSION, execution_id: executionId, sequence: 2, timestamp, event: 'prompt.compiled', agent: 'runtime', status: 'awaiting-human-dispatch', summary: 'Prompt inputs hashed and persisted.' })}\n${JSON.stringify({ schema_version: CURRENT_SCHEMA_VERSION, execution_id: executionId, sequence: 3, timestamp, event: 'context.loaded', agent: 'runtime', status: 'awaiting-human-dispatch', summary: 'Live state, scope and atomic work inventory resolved.' })}\n`, 'utf8');
  console.log(JSON.stringify({ execution_id: executionId, status: 'awaiting-human-dispatch', track, required_agent: binding.agent, work_source: workSource, atomic_work_items: inventory.work_items, required_tests: inventory.test_files, human_next_step: `Start a new session and give it .harness/executions/${executionId}/dispatch.md` }, null, 2));
}

function acknowledge(options) {
  const executionId = options.execution;
  const agent = options.agent;
  if (!executionId || !agent) fail('Usage: acknowledge --execution EXEC-... --agent cap-...');
  const dir = path.join(EXECUTIONS, executionId);
  const executionFile = path.join(dir, 'execution.json');
  const execution = readJson(executionFile);
  if (execution.schema_version !== CURRENT_SCHEMA_VERSION || execution.routing_mode !== 'human-gated') fail(`${executionId} is not a current human-gated execution.`);
  if (execution.status !== 'awaiting-human-dispatch') fail(`${executionId} cannot be acknowledged from status ${execution.status}.`);
  if (execution.agent !== agent) fail(`${executionId} requires ${execution.agent}, not ${agent}.`);
  assertLiveBinding(execution);
  assertNoActiveClaim(execution);
  execution.status = 'acknowledged';
  execution.acknowledged_at = now();
  writeJson(executionFile, execution);
  appendEvent(dir, { execution_id: executionId, event: 'human.dispatch-confirmed', agent: 'runtime', status: 'acknowledged', summary: `Human gate confirmed routing to ${agent}.` });
  console.log(`ACKNOWLEDGED ${executionId}: ${agent} may start work.`);
}

function start(options) {
  const executionId = options.execution;
  const agent = options.agent;
  if (!executionId || !agent) fail('Usage: start --execution EXEC-... --agent cap-...');
  const dir = path.join(EXECUTIONS, executionId);
  const executionFile = path.join(dir, 'execution.json');
  const execution = readJson(executionFile);
  if (execution.status !== 'acknowledged') fail(`${executionId} cannot start from status ${execution.status}.`);
  if (execution.agent !== agent) fail(`${executionId} requires ${execution.agent}, not ${agent}.`);
  assertLiveBinding(execution);
  execution.status = 'running';
  execution.started_at = now();
  writeJson(executionFile, execution);
  appendEvent(dir, { execution_id: executionId, event: 'agent.started', agent, status: 'running', summary: `${agent} work loop started.` });
  console.log(`STARTED ${executionId}: ${agent} work loop is running.`);
}

function allowedPath(file, scopes) {
  return scopes.some(scope => scope.endsWith('/**') ? file.startsWith(scope.slice(0, -2)) : file === scope);
}

function readJsonLines(file) {
  return fs.existsSync(file)
    ? fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse)
    : [];
}

function loopFiles(dir) {
  return {
    progress: path.join(dir, 'progress.json'),
    state: path.join(dir, 'loop-state.json'),
    ledger: path.join(dir, 'loop-ledger.jsonl')
  };
}

function appendLedgerRecord(dir, state, record) {
  const files = loopFiles(dir);
  const progress = readJson(files.progress);
  const ledger = readJsonLines(files.ledger);
  const sequence = ledger.length + 1;
  const progressHash = objectHash(progress);
  const entry = {
    schema_version: CURRENT_SCHEMA_VERSION,
    execution_id: state.execution_id,
    sequence,
    timestamp: now(),
    previous_ledger_sha256: state.last_ledger_sha256,
    progress_before_sha256: progressHash,
    progress_after_sha256: progressHash,
    ...record
  };
  entry.record_sha256 = recordHash(entry);
  fs.appendFileSync(files.ledger, `${JSON.stringify(entry)}\n`, 'utf8');
  state.last_ledger_sha256 = entry.record_sha256;
  state.last_progress_sha256 = entry.progress_after_sha256;
  writeJson(files.state, state);
  return entry;
}

function validateLoopIntegrity(dir, bundle = null) {
  const files = loopFiles(dir);
  if (!bundle && (!fs.existsSync(files.state) || !fs.existsSync(files.ledger))) return ['V3 loop-state.json and loop-ledger.jsonl are required.'];
  const state = bundle?.loopState ?? readJson(files.state);
  const progress = bundle?.progress ?? readJson(files.progress);
  const ledger = bundle?.loopLedger ?? readJsonLines(files.ledger);
  const errors = [];
  if (!ledger.length) errors.push('loop-ledger.jsonl must contain an initialized record.');
  let previous = null;
  let committed = 0;
  for (const [index, record] of ledger.entries()) {
    const expected = recordHash(record);
    if (record.record_sha256 !== expected) errors.push(`loop-ledger record ${index + 1} hash mismatch.`);
    if (record.previous_ledger_sha256 !== previous) errors.push(`loop-ledger record ${index + 1} previous hash mismatch.`);
    if (record.record_kind === 'committed-iteration') committed += 1;
    previous = record.record_sha256;
  }
  const tail = ledger.at(-1);
  const progressHash = objectHash(progress);
  if (tail && tail.progress_after_sha256 !== progressHash) errors.push('progress.json hash does not match loop ledger tail.');
  if (state.last_progress_sha256 !== progressHash) errors.push('loop-state last_progress_sha256 does not match progress.json.');
  if (tail && state.last_ledger_sha256 !== tail.record_sha256) errors.push('loop-state last_ledger_sha256 does not match loop ledger tail.');
  if (state.committed_iteration_count !== committed) errors.push(`loop-state committed count ${state.committed_iteration_count} does not match ledger count ${committed}.`);
  if (progress.iteration !== committed) errors.push(`progress.iteration ${progress.iteration} does not match committed ledger count ${committed}.`);
  return errors;
}

function assertRunningV3(executionId) {
  const dir = path.join(EXECUTIONS, executionId);
  const execution = readJson(path.join(dir, 'execution.json'));
  if (!isV3Execution(execution)) fail(`${executionId} is not an orchestrated-v3 execution.`);
  if (execution.status !== 'running') fail(`${executionId} must be running before loop commands are accepted.`);
  return { dir, execution };
}

function beginIteration(options) {
  const executionId = options.execution;
  if (!executionId) fail('Usage: begin-iteration --execution EXEC-...');
  const { dir, execution } = assertRunningV3(executionId);
  const integrity = validateLoopIntegrity(dir);
  if (integrity.length) fail(`Loop integrity failed: ${integrity.join(' ')}`);
  const files = loopFiles(dir);
  const state = readJson(files.state);
  if (state.committed_iteration_count >= (state.hard_iteration_limit ?? Infinity)) fail(`${executionId} reached the hard iteration limit (${state.hard_iteration_limit}); a human decision is required before further iterations.`);
  if (state.stop_required) fail(`${executionId} requires stop before new iterations: ${state.stop_reason ?? 'no reason recorded'}.`);
  if (state.open_attempt) fail(`${executionId} already has an open attempt ${state.open_attempt.attempt_id}; resume or abandon it before opening another.`);
  const attemptId = `ATTEMPT-${String(state.next_attempt_number).padStart(4, '0')}`;
  state.open_attempt = { attempt_id: attemptId, opened_at: now(), agent: execution.agent };
  state.next_attempt_number += 1;
  appendLedgerRecord(dir, state, {
    record_kind: 'attempt-opened',
    agent: execution.agent,
    attempt_id: attemptId,
    committed_iteration: state.committed_iteration_count,
    candidate_ref: null,
    candidate_sha256: null,
    meaningful_progress: false,
    summary: `Opened ${attemptId}.`
  });
  appendEvent(dir, { execution_id: executionId, event: 'iteration.opened', agent: execution.agent, status: 'running', summary: `Opened ${attemptId}.` });
  console.log(`OPENED ${executionId}: ${attemptId}`);
}

function resumeIteration(options) {
  const executionId = options.execution;
  const confirmedBy = options['confirmed-by'];
  if (!executionId || !confirmedBy) fail('Usage: resume-iteration --execution EXEC-... --confirmed-by <name-or-session>');
  const { dir, execution } = assertRunningV3(executionId);
  const integrity = validateLoopIntegrity(dir);
  if (integrity.length) fail(`Loop integrity failed: ${integrity.join(' ')}`);
  const files = loopFiles(dir);
  const state = readJson(files.state);
  if (!state.open_attempt) fail(`${executionId} has no open attempt to resume.`);
  state.open_attempt.resumed_at = now();
  state.open_attempt.resumed_by = confirmedBy;
  appendLedgerRecord(dir, state, {
    record_kind: 'attempt-resumed',
    agent: execution.agent,
    attempt_id: state.open_attempt.attempt_id,
    committed_iteration: state.committed_iteration_count,
    candidate_ref: null,
    candidate_sha256: null,
    meaningful_progress: false,
    summary: `Resumed ${state.open_attempt.attempt_id}.`,
    confirmed_by: confirmedBy
  });
  appendEvent(dir, { execution_id: executionId, event: 'iteration.resumed', agent: execution.agent, status: 'running', summary: `Resumed ${state.open_attempt.attempt_id}.` });
  console.log(`RESUMED ${executionId}: ${state.open_attempt.attempt_id}`);
}

function abandonIteration(options) {
  const executionId = options.execution;
  const reason = options.reason;
  const confirmedBy = options['confirmed-by'];
  if (!executionId || !reason || !confirmedBy) fail('Usage: abandon-iteration --execution EXEC-... --reason "..." --confirmed-by <name-or-session>');
  const { dir, execution } = assertRunningV3(executionId);
  const integrity = validateLoopIntegrity(dir);
  if (integrity.length) fail(`Loop integrity failed: ${integrity.join(' ')}`);
  const files = loopFiles(dir);
  const state = readJson(files.state);
  if (!state.open_attempt) fail(`${executionId} has no open attempt to abandon.`);
  const attemptId = state.open_attempt.attempt_id;
  state.open_attempt = null;
  appendLedgerRecord(dir, state, {
    record_kind: 'attempt-abandoned',
    agent: execution.agent,
    attempt_id: attemptId,
    committed_iteration: state.committed_iteration_count,
    candidate_ref: null,
    candidate_sha256: null,
    meaningful_progress: false,
    summary: `Abandoned ${attemptId}.`,
    reason,
    confirmed_by: confirmedBy
  });
  appendEvent(dir, { execution_id: executionId, event: 'iteration.abandoned', agent: execution.agent, status: 'running', summary: `Abandoned ${attemptId}: ${reason}` });
  console.log(`ABANDONED ${executionId}: ${attemptId}`);
}

function ensureEvidence(ref, executionId) {
  if (!ref) return;
  const normalized = ref.replaceAll('\\', '/');
  const executionPrefix = `.harness/executions/${executionId}/`;
  const absolute = fromRoot(normalized);
  if (!normalized.startsWith(executionPrefix) && !fs.existsSync(absolute)) {
    fail(`Evidence ref does not exist: ${ref}`);
  }
  if (normalized.startsWith(executionPrefix) && !fs.existsSync(absolute)) {
    fail(`Evidence ref does not exist: ${ref}`);
  }
}

function updateTrackedCollection(collection, updates, label, executionId) {
  let changed = false;
  if (!Array.isArray(updates)) return changed;
  const byId = new Map(collection.map(item => [item.id, item]));
  for (const update of updates) {
    const target = byId.get(update.id);
    if (!target) fail(`Unknown ${label} update id: ${update.id}`);
    if ((STATUS_RANK[update.status] ?? 0) < (STATUS_RANK[target.status] ?? 0)) fail(`Status regression for ${label} ${update.id}: ${target.status} -> ${update.status}`);
    for (const ref of update.evidence_refs ?? []) ensureEvidence(ref, executionId);
    const before = objectHash(target);
    target.status = update.status;
    if (update.disposition) target.disposition = update.disposition;
    if (update.notes) target.notes = update.notes;
    target.evidence_refs = [...new Set([...(target.evidence_refs ?? []), ...(update.evidence_refs ?? [])])];
    if (objectHash(target) !== before) changed = true;
  }
  return changed;
}

function updateValidations(progress, updates, executionId) {
  let changed = false;
  if (!Array.isArray(updates)) return changed;
  const byId = new Map(progress.validations.map(item => [item.id, item]));
  for (const update of updates) {
    if (update.evidence_ref) ensureEvidence(update.evidence_ref, executionId);
    const current = byId.get(update.id);
    if (!current) {
      progress.validations.push({ id: update.id, status: update.status, evidence_ref: update.evidence_ref ?? null });
      changed = true;
    } else {
      if ((STATUS_RANK[update.status] ?? 0) < (STATUS_RANK[current.status] ?? 0)) fail(`Status regression for validation ${update.id}: ${current.status} -> ${update.status}`);
      const before = objectHash(current);
      current.status = update.status;
      current.evidence_ref = update.evidence_ref ?? current.evidence_ref ?? null;
      if (objectHash(current) !== before) changed = true;
    }
  }
  return changed;
}

function recomputeCompletion(progress) {
  const pendingChecks = progress.completion_checks.filter(check => check.status !== 'pass').map(check => check.id);
  const pendingWork = progress.work_items.filter(item => !['completed', 'excluded'].includes(item.status)).map(item => item.id);
  const pendingAc = progress.acceptance_criteria.filter(item => item.status !== 'completed').map(item => item.id);
  const pendingTests = progress.test_obligations.filter(item => item.status !== 'verified').map(item => item.id);
  progress.completion_evaluation = {
    all_required_checks_pass: pendingChecks.length === 0 && pendingWork.length === 0 && pendingAc.length === 0 && pendingTests.length === 0,
    pending_check_ids: pendingChecks,
    pending_work_item_ids: pendingWork,
    pending_acceptance_criteria_ids: pendingAc,
    pending_test_ids: pendingTests
  };
  progress.progress_signature = objectHash({
    work_items: progress.work_items.map(item => [item.id, item.status, item.disposition, item.evidence_refs]),
    acceptance_criteria: progress.acceptance_criteria.map(item => [item.id, item.status, item.disposition, item.evidence_refs]),
    test_obligations: progress.test_obligations.map(item => [item.id, item.status, item.evidence_refs]),
    completion_checks: progress.completion_checks.map(item => [item.id, item.status, item.evidence_refs]),
    validations: progress.validations
  });
}

function recordIteration(options) {
  const executionId = options.execution;
  const candidateArg = options.candidate;
  if (!executionId || !candidateArg) fail('Usage: record-iteration --execution EXEC-... --candidate <candidate-json>');
  const { dir, execution } = assertRunningV3(executionId);
  const integrity = validateLoopIntegrity(dir);
  if (integrity.length) fail(`Loop integrity failed: ${integrity.join(' ')}`);
  const candidatePath = path.resolve(ROOT, candidateArg);
  const candidateRel = relative(candidatePath);
  if (!candidateRel.startsWith(`.harness/executions/${executionId}/iteration-candidates/`)) fail(`Candidate must be under .harness/executions/${executionId}/iteration-candidates/.`);
  const candidate = readJson(candidatePath);
  const schemas = artifactSchemas();
  const candidateValidation = schemaValidate(schemas.iterationCandidate, candidate);
  if (!candidateValidation.ok) fail(`Candidate schema failed: ${candidateValidation.errors.join('; ')}`);
  if (candidate.execution_id !== executionId) fail(`Candidate execution_id ${candidate.execution_id} does not match ${executionId}.`);
  const files = loopFiles(dir);
  const state = readJson(files.state);
  if (!state.open_attempt) fail(`${executionId} has no open attempt; run begin-iteration first.`);
  if (candidate.attempt_id !== state.open_attempt.attempt_id) fail(`Candidate attempt_id ${candidate.attempt_id} does not match open attempt ${state.open_attempt.attempt_id}.`);
  const context = readJson(path.join(dir, 'context.json'));
  const violations = scopeViolations(changedSince({ entries: state.scope_checkpoint ?? [] }), context.permissions);
  if (violations.length) fail(`Out-of-scope source change since the last checkpoint: ${violations.join(', ')}.`);
  const progress = readJson(files.progress);
  const beforeHash = objectHash(progress);
  let meaningful = false;
  meaningful = updateTrackedCollection(progress.work_items, candidate.work_item_updates, 'work item', executionId) || meaningful;
  meaningful = updateTrackedCollection(progress.acceptance_criteria, candidate.acceptance_criteria_updates, 'acceptance criterion', executionId) || meaningful;
  meaningful = updateTrackedCollection(progress.test_obligations, candidate.test_updates, 'test obligation', executionId) || meaningful;
  meaningful = updateTrackedCollection(progress.completion_checks, candidate.completion_check_updates, 'completion check', executionId) || meaningful;
  meaningful = updateValidations(progress, candidate.validation_updates, executionId) || meaningful;
  meaningful = meaningful || (candidate.findings?.length ?? 0) > 0 || (candidate.blockers?.length ?? 0) > 0 || (candidate.warnings?.length ?? 0) > 0;
  const hasAnyCandidateContent = ['work_item_updates', 'acceptance_criteria_updates', 'test_updates', 'completion_check_updates', 'validation_updates', 'findings', 'blockers', 'warnings']
    .some(key => Array.isArray(candidate[key]) && candidate[key].length > 0);
  if (!hasAnyCandidateContent) fail('Candidate has no updates, evidence, findings, blockers, or warnings.');
  progress.iteration += 1;
  progress.last_progress_at = meaningful ? now() : progress.last_progress_at;
  progress.no_progress_iterations = meaningful ? 0 : progress.no_progress_iterations + 1;
  recomputeCompletion(progress);
  const afterHash = objectHash(progress);
  if (afterHash === beforeHash && !meaningful) fail('Candidate produced no canonical progress.');
  writeJson(files.progress, progress);
  state.open_attempt = null;
  state.committed_iteration_count = progress.iteration;
  state.no_progress_iterations = progress.no_progress_iterations;
  const hardStop = state.committed_iteration_count >= (state.hard_iteration_limit ?? Infinity);
  const noProgressStop = progress.no_progress_iterations >= (state.max_no_progress_iterations ?? 2);
  state.stop_required = hardStop || noProgressStop;
  state.stop_reason = hardStop ? 'hard-iteration-limit-reached' : (noProgressStop ? 'no-progress-limit-reached' : null);
  state.scope_checkpoint = dirtySnapshot();
  state.last_progress_sha256 = afterHash;
  const ledger = readJsonLines(files.ledger);
  const record = {
    schema_version: CURRENT_SCHEMA_VERSION,
    execution_id: executionId,
    sequence: ledger.length + 1,
    record_kind: 'committed-iteration',
    timestamp: now(),
    agent: execution.agent,
    attempt_id: candidate.attempt_id,
    committed_iteration: progress.iteration,
    candidate_ref: candidateRel,
    candidate_sha256: sha256(candidatePath),
    meaningful_progress: meaningful,
    summary: candidate.summary,
    previous_ledger_sha256: state.last_ledger_sha256,
    progress_before_sha256: beforeHash,
    progress_after_sha256: afterHash
  };
  record.record_sha256 = recordHash(record);
  fs.appendFileSync(files.ledger, `${JSON.stringify(record)}\n`, 'utf8');
  state.last_ledger_sha256 = record.record_sha256;
  writeJson(files.state, state);
  appendEvent(dir, { execution_id: executionId, event: 'iteration.recorded', agent: execution.agent, status: 'running', summary: `Committed ${candidate.attempt_id}: ${candidate.summary}` });
  appendEvent(dir, { execution_id: executionId, event: meaningful ? 'loop.progress-detected' : 'loop.no-progress', agent: 'runtime', status: 'running', summary: meaningful ? 'Runtime committed meaningful progress.' : 'Runtime committed no-progress iteration.' });
  if (state.stop_required) appendEvent(dir, { execution_id: executionId, event: 'loop.stop-required', agent: 'runtime', status: 'running', summary: state.stop_reason });
  console.log(`RECORDED ${executionId}: ${candidate.attempt_id} -> iteration ${progress.iteration}`);
}

// Ajv validation of the persisted artifact set against their bound schemas.
// Both orchestrated profiles are validated; v2 adds forward-only loop-event
// requirements and never rewrites or retro-fails valid v1 history.
function schemaErrors(bundle) {
  const schemas = artifactSchemas();
  const pairs = [
    ['execution', schemas.execution], ['context', schemas.context], ['prompt', schemas.prompt],
    ['progress', schemas.progress], ['result', schemas.result], ['evaluation', schemas.evaluation]
  ];
  const errors = [];
  for (const [key, schemaRel] of pairs) {
    if (!schemaRel || !bundle[key]) continue;
    const result = schemaValidate(schemaRel, bundle[key]);
    if (!result.ok) errors.push(...result.errors.map(error => `[${key}] ${error}`));
  }
  for (const [index, event] of (bundle.events ?? []).entries()) {
    const result = schemaValidate(schemas.event, event);
    if (!result.ok) errors.push(...result.errors.map(error => `[events#${index + 1}] ${error}`));
  }
  if (isV3Execution(bundle.execution)) {
    const stateResult = schemaValidate(schemas.loopState, bundle.loopState);
    if (!stateResult.ok) errors.push(...stateResult.errors.map(error => `[loop-state] ${error}`));
    for (const [index, record] of (bundle.loopLedger ?? []).entries()) {
      const recordResult = schemaValidate(schemas.loopLedgerRecord, record);
      if (!recordResult.ok) errors.push(...recordResult.errors.map(error => `[loop-ledger#${index + 1}] ${error}`));
    }
  }
  return errors;
}

// Deterministic orchestration outcome enforcement keyed on the live DEV state
// and the result status. It never applies a transition; it only checks that the
// result maps to a policy-allowed action and that a transition candidate, when
// present, matches the contract-derived eligible transition.
function orchestrationErrors(bundle) {
  const { execution, result } = bundle;
  const errors = [];
  const liveState = execution.live_state;
  const track = trackOf(execution);
  const contract = loadOrchestrationContract(track);
  const policy = contract.states?.[liveState];
  if (!policy || policy.kind === 'boundary' || policy.agent === null) {
    errors.push(`No active orchestration policy for live_state ${liveState}.`);
    return errors;
  }
  if (policy.mode !== execution.mode) errors.push(`execution.mode ${execution.mode} does not match contract mode ${policy.mode} for ${liveState}.`);
  if (result.mode !== execution.mode) errors.push(`result.mode ${result.mode} does not match execution.mode ${execution.mode}.`);
  if (result.agent !== execution.agent) errors.push(`result.agent ${result.agent} does not match execution.agent ${execution.agent}.`);
  if (policy.agent !== execution.agent) errors.push(`contract agent ${policy.agent} does not match execution.agent ${execution.agent}.`);
  errors.push(...policyConfigurationErrors(policy, liveState, execution.manifest_ref, track));
  const outcome = policy.outcomes?.[result.status];
  if (!outcome) {
    errors.push(`Result status ${result.status} has no outcome policy for ${liveState}.`);
    return errors;
  }
  if (outcome.action === 'propose_transition') {
    if (result.status === 'COMPLETED_WITH_WARNINGS' && !(Array.isArray(result.warning_disposition) && result.warning_disposition.length)) {
      errors.push('COMPLETED_WITH_WARNINGS requires a non-empty warning_disposition before a transition may be proposed.');
    }
    const candidate = result.proposed_transition;
    if (candidate && !policy.agent_may_propose) {
      errors.push(`${execution.agent} may not propose a transition (manifest may_propose_transition=false); result.proposed_transition must be null.`);
    } else if (candidate && candidate.transition_id !== outcome.target_transition) {
      errors.push(`result.proposed_transition ${candidate.transition_id} does not match the eligible transition ${outcome.target_transition}.`);
    }
  } else {
    if (result.proposed_transition) errors.push(`${result.status} retains the current state; result.proposed_transition must be null.`);
    if (!result.continuation || !result.continuation.next_work_item) errors.push(`${result.status} requires an actionable continuation.`);
    if (result.status === 'BLOCKED' && !(Array.isArray(result.blockers) && result.blockers.length)) {
      errors.push('BLOCKED requires at least one blocker record.');
    }
  }
  return errors;
}

// Runtime-derived eligible transition for a completed result (audit-only).
function deriveEligibleTransition(execution, result) {
  const outcome = orchestrationPolicyFor(execution.live_state, trackOf(execution))?.outcomes?.[result.status];
  return outcome && outcome.action === 'propose_transition' ? outcome.target_transition : null;
}

// A human-facing transition reference for a closed execution. This is not a
// transition proposal: transitions.yml still owns gate/evidence checks, and a
// separate human CONFIRM-TRANSITION is required only after those checks pass.
function proposalRecommendation(execution) {
  const transitionId = execution.eligible_transition;
  if (!transitionId) return null;
  const move = readYaml('.harness/transitions.yml').transitions.feature_implementation.moves[transitionId];
  const role = move?.requires_role?.join(' or ') ?? 'the owning role';
  const track = trackOf(execution);
  const from = execution.live_state;
  const to = move?.to?.[`${track}_status`] ?? '(see transitions.yml)';
  return [
    `NEXT-TRANSITION-REFERENCE feature_implementation ${execution.target.id} ${track}:${from}->${to} (${transitionId})`,
    'Gate readiness: not evaluated by the runtime.',
    `Required confirmer role if the gate later passes: ${role}`,
    'Do not issue CONFIRM-TRANSITION until transitions.yml evidence and gates have been independently satisfied.'
  ].join('\n');
}

function validateBundle(bundle) {
  const errors = [];
  const { execution, context, prompt, inventory, progress, result, evaluation, events, scopeStart, scopeEnd } = bundle;
  const sameId = [execution, context, prompt, inventory, progress, result, evaluation].every(item => item.execution_id === execution.execution_id);
  if (!sameId) errors.push('Artifact execution_id values disagree.');
  for (const [name, item] of Object.entries({ execution, context, prompt, progress, result, evaluation })) {
    if (item.schema_version !== execution.schema_version) errors.push(`${name} must use schema_version ${execution.schema_version}.`);
  }
  if (execution.routing_mode !== 'human-gated' || execution.enforcement_mode !== 'human-gated-manual-audited') errors.push('Execution must use the human-gated manual-audited routing policy.');
  if (!['required', 'completed'].includes(execution.session_closure_status)) errors.push('Execution must declare session_closure_status as required or completed.');
  if (execution.status === 'awaiting-session-close' && execution.session_closure_status !== 'required') errors.push('An execution awaiting session closure must require closure.');
  if (execution.status === 'closed' && execution.session_closure_status !== 'completed') errors.push('A closed execution must record completed session closure.');
  if (Object.hasOwn(execution, 'adapter_ref') || Object.hasOwn(context, 'adapter_ref')) errors.push('Current executions must not bind a host adapter.');
  if (execution.run_intent === 'clean-replay' && (!execution.supersedes_execution?.length || context.prior_execution_policy !== 'exclude-prior-output-use-prior-as-evaluation-only')) errors.push('clean-replay requires a prior execution and evaluation-only carry-forward policy.');
  if (execution.run_intent === 'fresh' && (execution.supersedes_execution?.length || context.prior_execution_policy !== 'none')) errors.push('fresh execution must not inherit prior execution output.');
  if (!Array.isArray(prompt.components) || prompt.components.some(component => !/^[a-f0-9]{64}$/i.test(component.sha256))) errors.push('Prompt components require real SHA-256 hashes.');
  for (const kind of requiredPromptKinds(trackOf(execution))) {
    if (!prompt.components.some(component => component.kind === kind)) errors.push(`Prompt is missing required component: ${kind}.`);
  }
  const plannedIds = new Set(inventory.work_items);
  const ledgerIds = progress.work_items.map(item => item.id);
  if (new Set(ledgerIds).size !== ledgerIds.length || ledgerIds.some(id => !plannedIds.has(id)) || plannedIds.size !== ledgerIds.length) errors.push('Atomic ledger does not reconcile one-to-one with the plan inventory.');
  if (progress.work_items.some(item => item.atomic !== true || /\.\.|,/.test(item.id))) errors.push('Ledger contains grouped or non-atomic work items.');
  if (!progress.work_item_inventory_complete || progress.unaccounted_source_item_ids.length) errors.push('Work inventory is incomplete or has unaccounted items.');
  if (progress.no_progress_iterations >= 2 && ['completed', 'completed-with-warnings'].includes(progress.termination.status)) errors.push('No-progress limit was reached but the execution was marked complete.');
  const plannedTests = new Set(inventory.test_files);
  const ledgerTests = new Set(progress.test_obligations.map(item => item.path));
  if (plannedTests.size !== ledgerTests.size || [...plannedTests].some(file => !ledgerTests.has(file))) errors.push('Test obligations do not reconcile with the plan test inventory.');
  const completed = ['COMPLETED', 'COMPLETED_WITH_WARNINGS'].includes(result.status);
  if (completed) {
    if (!result.completion_contract_satisfied) errors.push('Completed result has completion_contract_satisfied=false.');
    if (progress.work_items.some(item => !['completed', 'excluded'].includes(item.status))) errors.push('Completed result has unfinished atomic work.');
    if (progress.acceptance_criteria.some(item => item.status !== 'completed')) errors.push('Completed result has unfinished acceptance criteria.');
    if (progress.test_obligations.some(item => item.status !== 'verified')) errors.push('Completed result has unverified required tests.');
    if (progress.completion_checks.some(check => check.status !== 'pass')) errors.push('Completed result has a non-passing completion check.');
    if (!progress.completion_evaluation.all_required_checks_pass || progress.completion_evaluation.pending_work_item_ids.length || progress.completion_evaluation.pending_test_ids.length) errors.push('Completed result has a non-complete completion evaluation.');
  } else if (!result.continuation || !result.continuation.next_work_item || !result.continuation.why_stopped) {
    errors.push('Non-completed result requires an actionable continuation.');
  }
  const eventKinds = new Set(events.map(event => event.event));
  for (const event of events) if (!EVENT_TYPES.has(event.event)) errors.push(`Unknown event type: ${event.event}.`);
  for (const required of REQUIRED_EVENTS) if (!eventKinds.has(required)) errors.push(`Missing required event: ${required}.`);
  if (!events.some(event => event.event === 'agent.started' && event.agent === execution.agent)) errors.push('Agent start event does not match the bound agent.');
  if (execution.enforcement_profile === V2_ENFORCEMENT_PROFILE && completed) {
    for (const required of COMPLETED_LOOP_EVENTS) {
      if (!eventKinds.has(required)) errors.push(`Completed v2 execution is missing required loop event: ${required}.`);
    }
  }
  if (isV3Execution(execution)) {
    if (!context.permissions.agent_execution_write || context.permissions.execution_write) errors.push('V3 context must use split agent/runtime execution write permissions.');
    if (bundle.loopState?.committed_iteration_count < 1) errors.push('V3 execution requires at least one committed iteration before finalize.');
    if (bundle.loopState?.open_attempt) errors.push(`V3 execution has open attempt ${bundle.loopState.open_attempt.attempt_id}; resume, record, or abandon before finalize.`);
    for (const required of V3_COMPLETED_LOOP_EVENTS) if (!eventKinds.has(required)) errors.push(`V3 execution is missing required loop event: ${required}.`);
    errors.push(...validateLoopIntegrity(path.join(EXECUTIONS, execution.execution_id), bundle));
  }
  const startEntries = new Map(scopeStart.entries.map(entry => [entry.path, entry.sha256]));
  const newChanges = scopeEnd.entries.filter(entry => startEntries.get(entry.path) !== entry.sha256);
  const executionOrGeneratedChanges = newChanges.filter(change => allowedPath(change.path, [
    ...(context.permissions.execution_write ?? []),
    ...(context.permissions.agent_execution_write ?? []),
    ...(context.permissions.runtime_execution_write ?? []),
    ...(context.permissions.generated_write ?? [])
  ]));
  const projectChanges = newChanges.filter(change => !executionOrGeneratedChanges.includes(change));
  for (const change of projectChanges) if (!allowedPath(change.path, context.permissions.project_write)) errors.push(`Out-of-scope change: ${change.path}.`);
  const reported = new Set(result.changed_files ?? []);
  for (const change of projectChanges) if (!reported.has(change.path)) errors.push(`Changed file missing from result.changed_files: ${change.path}.`);
  for (const file of reported) if (!projectChanges.some(change => change.path === file)) errors.push(`Result reports a file not changed during this execution: ${file}.`);
  if (evaluation.runtime_adherence?.status !== 'pass') errors.push('Evaluation must report runtime_adherence=pass.');
  if (ORCHESTRATED_PROFILES.has(execution.enforcement_profile)) errors.push(...orchestrationErrors(bundle));
  return errors;
}

function promptComponentDrift(bundle) {
  if (!isV3Execution(bundle.execution)) return [];
  return bundle.prompt.components
    .filter(component => {
      const absolute = fromRoot(component.ref);
      return !fs.existsSync(absolute) || sha256(absolute) !== component.sha256;
    })
    .map(component => component.ref);
}

function validatePersistedBundle(bundle, { requireCurrentPrompt = false } = {}) {
  const errors = validateBundle(bundle);
  if (requireCurrentPrompt) {
    for (const ref of promptComponentDrift(bundle)) errors.push(`Prompt component hash mismatch: ${ref}.`);
  }
  for (const test of bundle.progress.test_obligations) {
    if (test.status === 'verified' && !fs.existsSync(fromRoot(test.path))) errors.push(`Verified test file does not exist: ${test.path}.`);
  }
  return errors;
}

function loadBundle(executionId) {
  const dir = path.join(EXECUTIONS, executionId);
  const required = ['execution.json', 'context.json', 'prompt-manifest.json', 'work-inventory.json', 'progress.json', 'result.json', 'evaluation.json', 'scope-start.json', 'scope-end.json', 'events.jsonl'];
  for (const name of required) if (!fs.existsSync(path.join(dir, name))) fail(`Missing execution artifact: ${relative(path.join(dir, name))}`);
  const execution = readJson(path.join(dir, 'execution.json'));
  const bundle = {
    execution, context: readJson(path.join(dir, 'context.json')),
    prompt: readJson(path.join(dir, 'prompt-manifest.json')), inventory: readJson(path.join(dir, 'work-inventory.json')),
    progress: readJson(path.join(dir, 'progress.json')), result: readJson(path.join(dir, 'result.json')),
    evaluation: readJson(path.join(dir, 'evaluation.json')), scopeStart: readJson(path.join(dir, 'scope-start.json')),
    scopeEnd: readJson(path.join(dir, 'scope-end.json')), events: fs.readFileSync(path.join(dir, 'events.jsonl'), 'utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse)
  };
  if (isV3Execution(execution)) {
    for (const name of ['loop-state.json', 'loop-ledger.jsonl']) if (!fs.existsSync(path.join(dir, name))) fail(`Missing execution artifact: ${relative(path.join(dir, name))}`);
    bundle.loopState = readJson(path.join(dir, 'loop-state.json'));
    bundle.loopLedger = readJsonLines(path.join(dir, 'loop-ledger.jsonl'));
  }
  return bundle;
}

function finalize(options) {
  const executionId = options.execution;
  if (!executionId) fail('Usage: finalize --execution EXEC-...');
  const dir = path.join(EXECUTIONS, executionId);
  const executionFile = path.join(dir, 'execution.json');
  const execution = readJson(executionFile);
  if (execution.status !== 'running') fail(`${executionId} cannot finalize from status ${execution.status}; acknowledgement and agent start are required first.`);
  const eventFile = path.join(dir, 'events.jsonl');
  const existingEvents = readJsonLines(eventFile);
  if (!existingEvents.some(event => event.event === 'completion.evaluated')) {
    appendEvent(dir, { execution_id: executionId, event: 'completion.evaluated', agent: 'runtime', status: 'running', summary: 'Runtime completion evaluation started.' });
  }
  const scopeStart = readJson(path.join(dir, 'scope-start.json'));
  writeJson(path.join(dir, 'scope-end.json'), { schema_version: '1.0', execution_id: executionId, captured_at: now(), entries: changedSince(scopeStart) });
  const bundle = loadBundle(executionId);
  const orchestrated = ORCHESTRATED_PROFILES.has(execution.enforcement_profile);
  const errors = validatePersistedBundle(bundle, { requireCurrentPrompt: true });
  if (orchestrated) errors.push(...schemaErrors(bundle));
  if (errors.length) {
    console.error(`REJECTED ${executionId}`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 2;
    return;
  }
  const result = readJson(path.join(dir, 'result.json'));
  if (orchestrated) execution.eligible_transition = deriveEligibleTransition(execution, result);
  execution.status = 'awaiting-session-close';
  execution.session_closure_status = 'required';
  execution.completed_at = now();
  writeJson(executionFile, execution);
  appendEvent(dir, { execution_id: executionId, event: 'session.closure-required', agent: 'runtime', status: 'awaiting-session-close', summary: `Result ${result.status} passed runtime validation; end-session is required before gate return.` });
  console.log(`ACCEPTED ${executionId}: runtime completion gate passed; session closure is required.`);
}

function closeSession(options) {
  const executionId = options.execution;
  if (!executionId) fail('Usage: close-session --execution EXEC-...');
  const dir = path.join(EXECUTIONS, executionId);
  const executionFile = path.join(dir, 'execution.json');
  const execution = readJson(executionFile);
  if (execution.status !== 'awaiting-session-close') fail(`${executionId} cannot close from status ${execution.status}; finalize must succeed first.`);
  const requiredControlFiles = [
    'docs/00-project-control/logs/progress-log.md',
    'docs/04-delivery/session-handoffs/latest-session.md'
  ];
  for (const file of requiredControlFiles) {
    if (!fs.existsSync(fromRoot(file)) || !readText(file).includes(executionId)) {
      fail(`end-session evidence missing: ${file} must cite ${executionId}.`);
    }
  }
  execution.status = 'closed';
  execution.session_closure_status = 'completed';
  execution.closed_at = now();
  writeJson(executionFile, execution);
  appendEvent(dir, { execution_id: executionId, event: 'session.closed', agent: 'runtime', status: 'closed', summary: 'end-session evidence verified; execution may return to the Harness gate.' });
  console.log(`CLOSED ${executionId}: project-control closure verified.`);
  if (ORCHESTRATED_PROFILES.has(execution.enforcement_profile) && execution.eligible_transition) {
    appendEvent(dir, { execution_id: executionId, event: 'transition.reference-resolved', agent: 'runtime', status: 'closed', summary: `Runtime resolved next transition reference ${execution.eligible_transition}; gate readiness not evaluated.` });
    console.log(`\n${proposalRecommendation(execution)}`);
  }
}

// A complete, schema-valid, orchestrated-v2 bundle (implement mode, COMPLETED).
// Conformance mutates this to assert each guard, so it must pass validateBundle,
// schemaErrors, and orchestrationErrors as-is.
function fixture() {
  const id = 'EXEC-20990101-IMPL-999-01';
  const ts = '2099-01-01T00:00:00.000Z';
  const prefix = `.harness/executions/${id}`;
  const work = ['BE-1', 'BE-2'];
  const tests = ['test/example.test.js'];
  const execution = {
    schema_version: FIXTURE_SCHEMA_VERSION, execution_id: id, workflow_id: 'implement-feature',
    target: { type: 'feature_implementation', id: 'IMPL-999' },
    live_state: 'implement', agent: 'cap-implementation', display_name: 'Forge', agent_version: '0.1.0',
    mode: 'implement', run_intent: 'fresh', supersedes_execution: [], prior_execution_policy: 'none',
    manifest_ref: '.agent/agents/harness/agents/forge/manifest.yml', enforcement_mode: 'human-gated-manual-audited',
    routing_mode: 'human-gated', completion_contract_ref: '.agent/agents/harness/contracts/states/implement-completion.yml',
    side_effect_policy_ref: '.agent/agents/harness/runtime/side-effect-policy.md', status: 'running',
    session_closure_status: 'required', created_at: ts,
    context_ref: `${prefix}/context.json`, prompt_manifest_ref: `${prefix}/prompt-manifest.json`,
    progress_ref: `${prefix}/progress.json`, result_ref: `${prefix}/result.json`,
    evaluation_ref: `${prefix}/evaluation.json`, events_ref: `${prefix}/events.jsonl`,
    dispatch_brief_ref: `${prefix}/dispatch.md`, effective_permissions: {},
    enforcement_profile: V2_ENFORCEMENT_PROFILE, eligible_transition: null
  };
  const context = {
    schema_version: FIXTURE_SCHEMA_VERSION, execution_id: id, workflow_id: 'implement-feature',
    agent: 'cap-implementation', mode: 'implement', target: { type: 'feature_implementation', id: 'IMPL-999' },
    live_state: 'implement', run_intent: 'fresh', prior_execution_policy: 'none',
    routing: { mode: 'human-gated', required_human_action: 'start-a-new-agent-session-and-confirm-dispatch' },
    completion_contract_ref: '.agent/agents/harness/contracts/states/implement-completion.yml', progress_ref: `${prefix}/progress.json`,
    project_state: { sprint: 'SPRINT-0002', baseline_version: 1 },
    references: [{ path: 'plan.md', purpose: 'reconciled-exec-plan' }],
    permissions: { read: ['docs/**'], project_write: ['app/**'], generated_write: ['coverage/**'], execution_write: [`${prefix}/**`], deny: ['.agent/agents/harness/**'], tools: ['filesystem.read'] },
    side_effects: { policy_ref: '.agent/agents/harness/runtime/side-effect-policy.md', classification_required: true },
    expected_outputs: ['implemented atomic work items']
  };
  const prompt = {
    schema_version: FIXTURE_SCHEMA_VERSION, execution_id: id, agent: 'cap-implementation', mode: 'implement', compiled_at: ts,
    precedence: ['system-safety', 'project-governance', 'agent-instructions', 'shared-context', 'state-skill', 'execution-context', 'loop-and-completion', 'permissions', 'summary-and-evaluation', 'output-contract'],
    components: ['loop-policy', 'summary-contract', 'evaluation-policy', 'reconciled-exec-plan'].map(kind => ({ kind, ref: `${kind}.md`, sha256: 'a'.repeat(64) })),
    completion_contract_ref: '.agent/agents/harness/contracts/states/implement-completion.yml', loop_policy_ref: '.agent/agents/harness/runtime/work-ledger-policy.md',
    output_schema_ref: '.agent/agents/harness/schemas/agent-result.schema.json', secrets_included: false
  };
  const progress = {
    schema_version: FIXTURE_SCHEMA_VERSION, execution_id: id, agent: 'cap-implementation', mode: 'implement',
    iteration: 2, no_progress_iterations: 0, work_plan_source: 'plan.md', work_item_inventory_complete: true, unaccounted_source_item_ids: [],
    work_items: work.map(wid => ({ id: wid, parent_id: null, atomic: true, description: `Plan item ${wid}`, source_ref: `plan.md#${wid}`, status: 'completed', disposition: 'implemented', evidence_refs: ['e'] })),
    acceptance_criteria: [{ id: 'AC-1', parent_id: null, atomic: true, description: 'AC-1', source_ref: 'plan.md', status: 'completed', disposition: 'implemented', evidence_refs: ['e'] }],
    test_obligations: tests.map(testPath => ({ id: `TEST-${testPath}`, path: testPath, source_ref: 'plan.md#test-plan', status: 'verified', evidence_refs: ['e'] })),
    completion_checks: COMPLETION_CHECKS.dev.map(cid => ({ id: cid, status: 'pass', evidence_refs: ['e'] })),
    completion_evaluation: { all_required_checks_pass: true, pending_check_ids: [], pending_work_item_ids: [], pending_acceptance_criteria_ids: [], pending_test_ids: [] },
    validations: [{ id: 'V-1', status: 'passed', evidence_ref: 'e' }],
    progress_signature: 'sig', last_progress_at: ts, termination: { status: 'completed', reason: null }
  };
  const result = {
    schema_version: FIXTURE_SCHEMA_VERSION, execution_id: id, agent: 'cap-implementation', display_name: 'Forge', mode: 'implement',
    status: 'COMPLETED', summary: 'done', progress_ref: `${prefix}/progress.json`, completion_contract_satisfied: true,
    termination_reason: 'completion-predicate-satisfied', source_refs: ['plan.md'], outputs: ['out'], findings: [], blockers: [], warnings: [],
    warning_disposition: null, continuation: null, changed_files: ['app/x.js'],
    validation: [{ command: 'npm test', working_directory: '.', outcome: 'passed', evidence_path: 'e' }],
    recommended_action: 'Prepare governed implement->self-review proposal.', proposed_transition: { transition_id: 'dev_implement_to_self_review' }
  };
  const evaluation = {
    schema_version: FIXTURE_SCHEMA_VERSION, execution_id: id, agent: 'cap-implementation', rubric_ref: '.agent/agents/harness/evals/forge.eval.yml',
    context_assembly: { score: 2, evidence_refs: ['e'] }, criteria: [{ id: 'FORGE-CONTEXT', score: 2, evidence_refs: ['e'] }],
    runtime_adherence: { status: 'pass', violations: [] }, overall_result: 'pass', evaluator: 'runtime'
  };
  const events = [...REQUIRED_EVENTS, ...COMPLETED_LOOP_EVENTS]
    .map((event, index) => ({ schema_version: FIXTURE_SCHEMA_VERSION, execution_id: id, sequence: index + 1, timestamp: ts, event, agent: ['agent.started', 'iteration.started', 'progress.updated', 'agent.completed'].includes(event) ? 'cap-implementation' : 'runtime', summary: 'x' }));
  return {
    execution, context, prompt, inventory: { schema_version: '1.0', execution_id: id, work_items: work, test_files: tests },
    progress, result, evaluation,
    scopeStart: { entries: [] },
    scopeEnd: { entries: [{ path: 'app/x.js', sha256: 'b'.repeat(64) }, { path: `${prefix}/result.json`, sha256: 'c'.repeat(64) }] },
    events
  };
}

function v3Fixture() {
  const id = 'EXEC-20990101-IMPL-999-V3';
  const ts = '2099-01-01T00:00:00.000Z';
  const prefix = `.harness/executions/${id}`;
  const progress = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: id, agent: 'cap-quality', mode: 'verify',
    iteration: 1, no_progress_iterations: 0, work_plan_source: 'plan.md', work_item_inventory_complete: true, unaccounted_source_item_ids: [],
    work_items: [{ id: 'BE-1', parent_id: null, atomic: true, description: 'Plan item BE-1', source_ref: 'plan.md#BE-1', status: 'completed', disposition: 'implemented', evidence_refs: ['docs/evidence.md'] }],
    acceptance_criteria: [{ id: 'AC-1', parent_id: null, atomic: true, description: 'AC-1', source_ref: 'plan.md', status: 'completed', disposition: 'implemented', evidence_refs: ['docs/evidence.md'] }],
    test_obligations: [{ id: 'TEST-test/example.test.js', path: 'test/example.test.js', source_ref: 'plan.md#test-plan', status: 'verified', evidence_refs: ['docs/evidence.md'] }],
    completion_checks: COMPLETION_CHECKS.dev.map(cid => ({ id: cid, status: 'pass', evidence_refs: ['docs/evidence.md'] })),
    completion_evaluation: { all_required_checks_pass: true, pending_check_ids: [], pending_work_item_ids: [], pending_acceptance_criteria_ids: [], pending_test_ids: [] },
    validations: [{ id: 'V-1', status: 'passed', evidence_ref: 'docs/evidence.md' }],
    progress_signature: 'sig', last_progress_at: ts, termination: { status: 'completed', reason: null }
  };
  const initProgress = structuredClone(progress);
  initProgress.iteration = 0;
  const initHash = objectHash(initProgress);
  const finalHash = objectHash(progress);
  const initRecord = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: id, sequence: 1, record_kind: 'initialized', timestamp: ts,
    agent: 'runtime', attempt_id: null, committed_iteration: 0, candidate_ref: null, candidate_sha256: null,
    meaningful_progress: false, summary: 'Runtime initialized canonical loop state.',
    previous_ledger_sha256: null, progress_before_sha256: initHash, progress_after_sha256: initHash
  };
  initRecord.record_sha256 = recordHash(initRecord);
  const commitRecord = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: id, sequence: 2, record_kind: 'committed-iteration', timestamp: ts,
    agent: 'cap-quality', attempt_id: 'ATTEMPT-0001', committed_iteration: 1,
    candidate_ref: `${prefix}/iteration-candidates/verify-001.json`, candidate_sha256: 'b'.repeat(64),
    meaningful_progress: true, summary: 'Read-only verification evidence recorded.',
    previous_ledger_sha256: initRecord.record_sha256, progress_before_sha256: initHash, progress_after_sha256: finalHash
  };
  commitRecord.record_sha256 = recordHash(commitRecord);
  const execution = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: id, workflow_id: 'implement-feature',
    target: { type: 'feature_implementation', id: 'IMPL-999' },
    live_state: 'verify', agent: 'cap-quality', display_name: 'Verity', agent_version: '0.1.0',
    mode: 'verify', run_intent: 'fresh', supersedes_execution: [], prior_execution_policy: 'none',
    manifest_ref: '.agent/agents/harness/agents/verity/manifest.yml', enforcement_mode: 'human-gated-manual-audited',
    routing_mode: 'human-gated', completion_contract_ref: '.agent/agents/harness/contracts/states/verify-completion.yml',
    side_effect_policy_ref: '.agent/agents/harness/runtime/side-effect-policy.md', status: 'running',
    session_closure_status: 'required', created_at: ts,
    context_ref: `${prefix}/context.json`, prompt_manifest_ref: `${prefix}/prompt-manifest.json`, progress_ref: `${prefix}/progress.json`,
    result_ref: `${prefix}/result.json`, evaluation_ref: `${prefix}/evaluation.json`, events_ref: `${prefix}/events.jsonl`,
    dispatch_brief_ref: `${prefix}/dispatch.md`, loop_protocol_ref: '.agent/agents/harness/runtime/loop-ledger-v3.md',
    loop_state_ref: `${prefix}/loop-state.json`, loop_ledger_ref: `${prefix}/loop-ledger.jsonl`, iteration_candidates_ref: `${prefix}/iteration-candidates`,
    effective_permissions: {}, enforcement_profile: ENFORCEMENT_PROFILE, eligible_transition: null
  };
  const context = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: id, workflow_id: 'implement-feature',
    agent: 'cap-quality', mode: 'verify', target: { type: 'feature_implementation', id: 'IMPL-999' },
    live_state: 'verify', run_intent: 'fresh', prior_execution_policy: 'none',
    routing: { mode: 'human-gated', required_human_action: 'start-a-new-agent-session-and-confirm-dispatch' },
    completion_contract_ref: '.agent/agents/harness/contracts/states/verify-completion.yml', progress_ref: `${prefix}/progress.json`,
    project_state: { sprint: 'SPRINT-0002', baseline_version: 1 },
    references: [{ path: 'plan.md', purpose: 'reconciled-exec-plan' }],
    permissions: {
      read: ['docs/**'],
      project_write: [],
      generated_write: ['coverage/**'],
      agent_execution_write: [`${prefix}/iteration-candidates/**`, `${prefix}/evidence/**`, `${prefix}/result.json`, `${prefix}/evaluation.json`],
      runtime_execution_write: [`${prefix}/progress.json`, `${prefix}/loop-state.json`, `${prefix}/loop-ledger.jsonl`, `${prefix}/events.jsonl`, `${prefix}/scope-end.json`],
      deny: ['.agent/agents/harness/**'],
      tools: ['filesystem.read']
    },
    side_effects: { policy_ref: '.agent/agents/harness/runtime/side-effect-policy.md', classification_required: true },
    expected_outputs: ['verification evidence']
  };
  const prompt = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: id, agent: 'cap-quality', mode: 'verify', compiled_at: ts,
    precedence: ['system-safety', 'project-governance', 'agent-instructions', 'shared-context', 'state-skill', 'execution-context', 'loop-and-completion', 'permissions', 'summary-and-evaluation', 'output-contract'],
    components: ['loop-policy', 'summary-contract', 'evaluation-policy', 'reconciled-exec-plan'].map(kind => ({ kind, ref: `${kind}.md`, sha256: 'a'.repeat(64) })),
    completion_contract_ref: '.agent/agents/harness/contracts/states/verify-completion.yml', loop_policy_ref: '.agent/agents/harness/runtime/loop-ledger-v3.md',
    output_schema_ref: '.agent/agents/harness/schemas/agent-result.schema.json', secrets_included: false
  };
  const result = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: id, agent: 'cap-quality', display_name: 'Verity', mode: 'verify',
    status: 'COMPLETED', summary: 'verified', progress_ref: `${prefix}/progress.json`, completion_contract_satisfied: true,
    termination_reason: 'completion-predicate-satisfied', source_refs: ['plan.md'], outputs: ['out'], findings: [], blockers: [], warnings: [],
    warning_disposition: null, continuation: null, changed_files: [],
    validation: [{ command: 'npm test', working_directory: '.', outcome: 'passed', evidence_path: 'docs/evidence.md' }],
    recommended_action: 'Prepare governed verify->ready-for-delivery proposal.', proposed_transition: null
  };
  const evaluation = {
    schema_version: CURRENT_SCHEMA_VERSION, execution_id: id, agent: 'cap-quality', rubric_ref: '.agent/agents/harness/evals/verity.eval.yml',
    context_assembly: { score: 2, evidence_refs: ['docs/evidence.md'] }, criteria: [{ id: 'VERITY-CONTEXT', score: 2, evidence_refs: ['docs/evidence.md'] }],
    runtime_adherence: { status: 'pass', violations: [] }, overall_result: 'pass', evaluator: 'runtime'
  };
  const events = [...REQUIRED_EVENTS, ...V3_COMPLETED_LOOP_EVENTS]
    .map((event, index) => ({ schema_version: CURRENT_SCHEMA_VERSION, execution_id: id, sequence: index + 1, timestamp: ts, event, agent: event.startsWith('iteration.') || event === 'agent.started' ? 'cap-quality' : 'runtime', summary: 'x' }));
  return {
    execution, context, prompt, inventory: { schema_version: '1.0', execution_id: id, work_items: ['BE-1'], test_files: ['test/example.test.js'] },
    progress, result, evaluation,
    loopState: {
      schema_version: CURRENT_SCHEMA_VERSION, execution_id: id, committed_iteration_count: 1, next_attempt_number: 2, open_attempt: null,
      no_progress_iterations: 0, max_no_progress_iterations: 2, hard_iteration_limit: 60, stop_required: false, stop_reason: null,
      scope_checkpoint: [], last_progress_sha256: finalHash, last_ledger_sha256: commitRecord.record_sha256
    },
    loopLedger: [initRecord, commitRecord],
    scopeStart: { entries: [] },
    scopeEnd: { entries: [{ path: `${prefix}/result.json`, sha256: 'c'.repeat(64) }] },
    events
  };
}

// Orchestration outcome unit cases run directly against orchestrationErrors with
// minimal execution+result objects, so verify/plan (may-not-propose) rules can be
// exercised without rebuilding a full agent-consistent bundle.
function orchestrationSamples() {
  const implement = over => ({ execution: { live_state: 'implement', mode: 'implement', agent: 'cap-implementation', manifest_ref: '.agent/agents/harness/agents/forge/manifest.yml' }, result: { status: 'COMPLETED', mode: 'implement', agent: 'cap-implementation', proposed_transition: null, warning_disposition: null, continuation: null, blockers: [], ...over } });
  const disposition = [{ warning: 'w', owner: 'o', rationale: 'r', follow_up_ref: 'f' }];
  return [
    ['implement completed, null candidate (runtime derives)', implement({}), true],
    ['implement completed, correct candidate', implement({ proposed_transition: { transition_id: 'dev_implement_to_self_review' } }), true],
    ['implement completed, wrong candidate', implement({ proposed_transition: { transition_id: 'dev_unit_test_to_verify' } }), false],
    ['verify completed, runtime derives (null candidate)', { execution: { live_state: 'verify', mode: 'verify', agent: 'cap-quality', manifest_ref: '.agent/agents/harness/agents/verity/manifest.yml' }, result: { status: 'COMPLETED', mode: 'verify', agent: 'cap-quality', proposed_transition: null } }, true],
    ['verify may-not-propose carries candidate', { execution: { live_state: 'verify', mode: 'verify', agent: 'cap-quality', manifest_ref: '.agent/agents/harness/agents/verity/manifest.yml' }, result: { status: 'COMPLETED', mode: 'verify', agent: 'cap-quality', proposed_transition: { transition_id: 'dev_verify_to_ready_for_delivery' } } }, false],
    ['completed-with-warnings missing disposition', implement({ status: 'COMPLETED_WITH_WARNINGS' }), false],
    ['completed-with-warnings with disposition', implement({ status: 'COMPLETED_WITH_WARNINGS', warning_disposition: disposition }), true],
    ['blocked retains with continuation + blocker', implement({ status: 'BLOCKED', continuation: { next_work_item: 'x' }, blockers: ['b'] }), true],
    ['blocked carries a transition', implement({ status: 'BLOCKED', proposed_transition: { transition_id: 'dev_implement_to_self_review' }, continuation: { next_work_item: 'x' }, blockers: ['b'] }), false],
    ['blocked missing continuation', implement({ status: 'BLOCKED', continuation: null, blockers: ['b'] }), false],
    ['result mode mismatch', implement({ mode: 'verify' }), false],
    ['no active policy for boundary state', { execution: { live_state: 'not-started', mode: 'implement', agent: 'cap-implementation', manifest_ref: '.agent/agents/harness/agents/forge/manifest.yml' }, result: { status: 'COMPLETED', mode: 'implement', agent: 'cap-implementation', proposed_transition: null } }, false]
  ];
}

function conformance() {
  const bundleCases = [
    ['valid complete execution', bundle => bundle],
    ['execution memory is not a project-source change', bundle => bundle],
    ['missing required test', bundle => { bundle.progress.test_obligations[0].status = 'pending'; return bundle; }],
    ['grouped work item', bundle => { bundle.progress.work_items = [{ id: 'BE-1..2', parent_id: null, atomic: true, description: 'x', source_ref: 'plan.md', status: 'completed', disposition: 'implemented', evidence_refs: ['e'] }]; return bundle; }],
    ['out-of-scope write', bundle => { bundle.scopeEnd.entries.push({ path: 'srv/external/x.csn', sha256: 'c'.repeat(64) }); return bundle; }],
    ['unknown event', bundle => { bundle.events.push({ schema_version: FIXTURE_SCHEMA_VERSION, execution_id: bundle.execution.execution_id, sequence: 99, timestamp: bundle.execution.created_at, event: 'invented.event', agent: 'runtime' }); return bundle; }],
    ['unhashed prompt component', bundle => { bundle.prompt.components[0].sha256 = 'not-a-hash'; return bundle; }],
    ['missing lifecycle event', bundle => { bundle.events = bundle.events.filter(event => event.event !== 'completion.evaluated'); return bundle; }],
    ['missing human dispatch confirmation', bundle => { bundle.events = bundle.events.filter(event => event.event !== 'human.dispatch-confirmed'); return bundle; }],
    ['completed execution missing loop event', bundle => { bundle.events = bundle.events.filter(event => event.event !== 'iteration.started'); return bundle; }],
    ['host adapter leakage', bundle => { bundle.context.adapter_ref = '.agent/agents/harness/runtime/adapters/codex.yml'; return bundle; }],
    ['no-progress completion', bundle => { bundle.progress.no_progress_iterations = 2; bundle.progress.termination = { status: 'completed', reason: null }; return bundle; }],
    ['unsafe replay carry-forward', bundle => { bundle.execution.run_intent = 'clean-replay'; return bundle; }],
    ['invalid validation outcome (Ajv)', bundle => { bundle.result.validation[0].outcome = 'passed-with-known-warnings'; return bundle; }],
    ['completed proposes wrong transition', bundle => { bundle.result.proposed_transition = { transition_id: 'dev_unit_test_to_verify' }; return bundle; }]
  ];
  const bundlePass = new Set(['valid complete execution', 'execution memory is not a project-source change']);
  const v3Cases = [
    ['valid v3 read-only verification iteration', bundle => bundle],
    ['v3 zero committed iteration', bundle => { bundle.progress.iteration = 0; bundle.loopState.committed_iteration_count = 0; bundle.loopLedger = bundle.loopLedger.filter(record => record.record_kind !== 'committed-iteration'); return bundle; }],
    ['v3 broken ledger chain', bundle => { bundle.loopLedger[1].previous_ledger_sha256 = '0'.repeat(64); return bundle; }],
    ['v3 progress hash mismatch', bundle => { bundle.progress.validations[0].status = 'failed'; return bundle; }],
    ['v3 legacy execution_write rejected', bundle => { bundle.context.permissions.execution_write = [`.harness/executions/${bundle.execution.execution_id}/**`]; return bundle; }],
    ['v3 open attempt rejects finalize', bundle => { bundle.loopState.open_attempt = { attempt_id: 'ATTEMPT-0002', opened_at: bundle.execution.created_at, agent: bundle.execution.agent }; return bundle; }],
    ['v3 committed-count tampering rejected', bundle => { bundle.loopState.committed_iteration_count = 2; return bundle; }],
    ['v3 abandoned attempt audit trail validates', bundle => {
      const prev = bundle.loopLedger.at(-1);
      const record = {
        schema_version: CURRENT_SCHEMA_VERSION, execution_id: bundle.execution.execution_id, sequence: bundle.loopLedger.length + 1,
        record_kind: 'attempt-abandoned', timestamp: prev.timestamp, agent: bundle.execution.agent, attempt_id: 'ATTEMPT-0002',
        committed_iteration: bundle.loopState.committed_iteration_count, candidate_ref: null, candidate_sha256: null,
        meaningful_progress: false, summary: 'Attempt abandoned before a candidate was ready.',
        previous_ledger_sha256: prev.record_sha256, progress_before_sha256: prev.progress_after_sha256, progress_after_sha256: prev.progress_after_sha256
      };
      record.record_sha256 = recordHash(record);
      bundle.loopLedger.push(record);
      bundle.loopState.last_ledger_sha256 = record.record_sha256;
      bundle.loopState.next_attempt_number = 3;
      return bundle;
    }]
  ];
  const v3Pass = new Set(['valid v3 read-only verification iteration', 'v3 abandoned attempt audit trail validates']);
  const orchCases = orchestrationSamples();
  const policyCases = [
    ['contract transition source and destination match implement', transitionCompatibilityErrors('dev_implement_to_self_review', 'implement'), true],
    ['contract transition source mismatch is rejected', transitionCompatibilityErrors('dev_unit_test_to_verify', 'implement'), false],
    ['BA contract transition source and destination match clarify', transitionCompatibilityErrors('ba_clarify_to_draft', 'clarify', 'ba'), true],
    ['BA contract transition source mismatch is rejected', transitionCompatibilityErrors('ba_draft_to_reviewed', 'clarify', 'ba'), false],
    ['contract proposal authority matches Forge', proposalAuthorityErrors(orchestrationPolicyFor('implement'), '.agent/agents/harness/agents/forge/manifest.yml'), true],
    ['contract proposal authority drift is rejected', proposalAuthorityErrors(orchestrationPolicyFor('implement'), '.agent/agents/harness/agents/atlas/manifest.yml'), false],
    ['BA proposal authority matches Clarity', proposalAuthorityErrors(orchestrationPolicyFor('clarify', 'ba'), '.agent/agents/harness/agents/clarity/manifest.yml'), true]
  ];
  const baselineCases = [
    ['versioned baseline resolution selects v2 after v1 artifacts', () => {
      const resolved = resolveVersionedBaselineRefs({
        id: 'IMPL-003',
        ba: {
          artifacts: [
            'docs/04-delivery/functional-specs/baselines/FS-IMPL-003-v1.md',
            'docs/04-delivery/track-handoffs/ba-to-dev/HANDOFF-IMPL-003-BA-DEV-v1.yml',
            'docs/04-delivery/functional-specs/baselines/FS-IMPL-003-v2.md',
            'docs/04-delivery/track-handoffs/ba-to-dev/HANDOFF-IMPL-003-BA-DEV-v2.yml'
          ]
        },
        dev: { baseline_version: 2, evidence: [] }
      });
      return resolved.baseline.endsWith('/FS-IMPL-003-v2.md') && resolved.handoff.endsWith('/HANDOFF-IMPL-003-BA-DEV-v2.yml');
    }, true],
    ['missing requested baseline version is rejected', () => {
      try {
        resolveVersionedBaselineRefs({
          id: 'IMPL-003',
          ba: { artifacts: ['docs/04-delivery/functional-specs/baselines/FS-IMPL-003-v1.md'] },
          dev: { baseline_version: 2, evidence: [] }
        });
        return false;
      } catch {
        return true;
      }
    }, true]
  ];
  let passed = 0;
  for (const [name, mutate] of bundleCases) {
    const bundle = mutate(structuredClone(fixture()));
    const errors = [...validateBundle(bundle), ...schemaErrors(bundle)];
    const ok = bundlePass.has(name) ? errors.length === 0 : errors.length > 0;
    if (!ok) fail(`Conformance case failed: ${name}. ${errors.join(' | ')}`);
    passed += 1;
  }
  for (const [name, mutate] of v3Cases) {
    const bundle = mutate(structuredClone(v3Fixture()));
    const errors = [...validateBundle(bundle), ...schemaErrors(bundle)];
    const ok = v3Pass.has(name) ? errors.length === 0 : errors.length > 0;
    if (!ok) fail(`V3 conformance case failed: ${name}. ${errors.join(' | ')}`);
    passed += 1;
  }
  for (const [name, sample, expectPass] of orchCases) {
    const errors = orchestrationErrors(sample);
    const ok = expectPass ? errors.length === 0 : errors.length > 0;
    if (!ok) fail(`Orchestration case failed: ${name}. ${errors.join(' | ')}`);
    passed += 1;
  }
  for (const [name, errors, expectPass] of policyCases) {
    const ok = expectPass ? errors.length === 0 : errors.length > 0;
    if (!ok) fail(`Orchestration configuration case failed: ${name}. ${errors.join(' | ')}`);
    passed += 1;
  }
  for (const [name, run, expectPass] of baselineCases) {
    const ok = run() === expectPass;
    if (!ok) fail(`Baseline resolution case failed: ${name}.`);
    passed += 1;
  }
  console.log(`Conformance passed: ${passed}/${bundleCases.length + v3Cases.length + orchCases.length + policyCases.length + baselineCases.length} deterministic cases.`);
}

function routeCandidate(implementation, bindings, track) {
  const liveState = implementation[track]?.status;
  if (!liveState) return { track, eligible: false, reason: 'track has no live status' };
  const policy = orchestrationPolicyFor(liveState, track);
  if (!policy) return { track, eligible: false, reason: `no orchestration policy for ${liveState}` };
  if (policy.kind === 'boundary' || policy.agent === null) return { track, eligible: false, reason: `declared boundary: ${(policy.note ?? liveState).trim()}` };
  const binding = bindings.bindings[bindingKey(track)]?.[liveState];
  if (!binding) return { track, eligible: false, reason: `no binding for ${liveState}` };
  return { track, liveState, policy, binding, eligible: true };
}

function resolveTrack(implementation, bindings, requestedTrack) {
  if (requestedTrack && !TRACKS.includes(requestedTrack)) fail(`Unsupported track ${requestedTrack}; use --track ba or --track dev.`);
  const candidates = TRACKS.map(track => routeCandidate(implementation, bindings, track));
  if (requestedTrack) {
    const selected = candidates.find(candidate => candidate.track === requestedTrack);
    if (!selected.eligible) fail(`${implementation.id} ${requestedTrack.toUpperCase()} route is not eligible: ${selected.reason}.`);
    return selected;
  }
  const eligible = candidates.filter(candidate => candidate.eligible);
  if (eligible.length === 1) return eligible[0];
  if (eligible.length === 0) fail(`${implementation.id} has no eligible BA or DEV agent route. ${candidates.map(candidate => `${candidate.track.toUpperCase()}: ${candidate.reason}`).join(' | ')}`);
  fail(`${implementation.id} has multiple eligible routes: ${eligible.map(candidate => `${candidate.track.toUpperCase()} ${candidate.liveState} -> ${candidate.binding.agent}`).join('; ')}. Choose explicitly with --track ba or --track dev.`);
}

export { extractPlanInventory, validateBundle, workScopes, projectWriteScopes, resolveLoopLimits, scopeViolations, validateLoopIntegrity, updateTrackedCollection, initialLoopArtifacts, resolveVersionedBaselineRefs, routeCandidate, resolveTrack };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = args(process.argv.slice(2));
  try {
    if (options._[0] === 'prepare') prepare(options);
    else if (options._[0] === 'finalize') finalize(options);
    else if (options._[0] === 'validate') {
      const bundle = loadBundle(options.execution);
      const orchestrated = ORCHESTRATED_PROFILES.has(bundle.execution.enforcement_profile);
      const errors = validatePersistedBundle(bundle);
      const drift = promptComponentDrift(bundle);
      if (orchestrated) errors.push(...schemaErrors(bundle));
      if (errors.length) { console.error(errors.map(error => `- ${error}`).join('\n')); process.exitCode = 2; }
      else if (bundle.execution.status !== 'closed' || bundle.execution.session_closure_status !== 'completed') {
        console.error(`Session closure is pending for ${options.execution}; run end-session and close-session before returning to a Harness gate.`);
        process.exitCode = 2;
      }
      else {
        console.log(`VALID ${options.execution}`);
        if (drift.length) console.log(`CONTEXT-DRIFT ${options.execution}: current project inputs differ from the recorded prompt manifest: ${drift.join(', ')}`);
        if (orchestrated) { const recommendation = proposalRecommendation(bundle.execution); if (recommendation) console.log(`\n${recommendation}`); }
      }
    } else if (options._[0] === 'conformance') conformance();
    else if (options._[0] === 'acknowledge') acknowledge(options);
    else if (options._[0] === 'start') start(options);
    else if (options._[0] === 'begin-iteration') beginIteration(options);
    else if (options._[0] === 'record-iteration') recordIteration(options);
    else if (options._[0] === 'resume-iteration') resumeIteration(options);
    else if (options._[0] === 'abandon-iteration') abandonIteration(options);
    else if (options._[0] === 'close-session') closeSession(options);
    else fail('Usage: agent-runtime.mjs <prepare|acknowledge|start|begin-iteration|record-iteration|resume-iteration|abandon-iteration|finalize|close-session|validate|conformance>');
  } catch (error) {
    console.error(`agent-runtime: ${error.message}`);
    process.exitCode = 2;
  }
}

