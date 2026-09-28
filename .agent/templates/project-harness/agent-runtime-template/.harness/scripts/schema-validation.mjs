#!/usr/bin/env node
/**
 * Ajv-based JSON Schema validation for the agent runtime.
 *
 * The pilot schemas are JSON Schema draft 2020-12, which requires the dedicated
 * Ajv2020 build; draft versions must not be mixed inside one instance. This
 * module owns a single strict Ajv instance, compiles/caches validators, and
 * returns normalized errors so the runner can treat the schemas as the real
 * runtime contract instead of re-checking a few fields by hand.
 */
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const YAML = require('yaml');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// strict:true keeps unknown-keyword (strictSchema) and strictNumbers protection
// plus format validation. strictTypes/strictRequired are schema-authoring lints
// (they fault an if/then whose `required` names properties declared in the parent
// schema, and `required` without a local `type:object`); the pre-existing pilot
// schemas predate Ajv and do not follow those lints. Disabling the two lints does
// not weaken how strictly DATA is validated (enum/const/required/additionalProperties
// still fully apply); it only stops Ajv from rejecting the schemas at compile time.
const ajv = new Ajv2020({ allErrors: true, strict: true, strictTypes: false, strictRequired: false, validateFormats: true });
addFormats(ajv);

const validators = new Map();

function fromRoot(rel) { return path.resolve(ROOT, rel); }
function readText(rel) { return fs.readFileSync(fromRoot(rel), 'utf8'); }
function parseFile(rel) {
  const text = readText(rel);
  return /\.ya?ml$/.test(rel) ? YAML.parse(text) : JSON.parse(text);
}

function compile(schemaRel) {
  if (!validators.has(schemaRel)) {
    validators.set(schemaRel, ajv.compile(parseFile(schemaRel)));
  }
  return validators.get(schemaRel);
}

function normalize(schemaRel, errors) {
  return (errors ?? []).map(error => {
    const where = error.instancePath ? ` at ${error.instancePath}` : '';
    const params = error.params && Object.keys(error.params).length
      ? ` (${Object.entries(error.params).map(([key, value]) => `${key}=${Array.isArray(value) ? value.join('/') : value}`).join(', ')})`
      : '';
    return `${schemaRel}${where}: ${error.message}${params}`;
  });
}

/** Validate an in-memory object against a schema file. Returns { ok, errors }. */
export function validate(schemaRel, data) {
  const validator = compile(schemaRel);
  return validator(data)
    ? { ok: true, errors: [] }
    : { ok: false, errors: normalize(schemaRel, validator.errors) };
}

/** Validate a persisted JSON/YAML file against a schema file. */
export function validateFile(dataRel, schemaRel) {
  return validate(schemaRel, parseFile(dataRel));
}

/** Compile a list of schemas; return [{ schema, error }] for any that fail. */
export function compileAll(schemaRels) {
  const failures = [];
  for (const schemaRel of schemaRels) {
    try { compile(schemaRel); } catch (error) { failures.push({ schema: schemaRel, error: error.message }); }
  }
  return failures;
}

/**
 * Artifact kind -> schema path, resolved from agent-bindings so the mapping is
 * declared once. `orchestration` is present only for schema_version >= 1.2.
 */
export function artifactSchemas(bindingsRel = '.harness/agent-bindings.yml') {
  const bindings = parseFile(bindingsRel);
  const runtime = bindings.runtime;
  return {
    bindings: bindings.schema,
    execution: runtime.execution_schema,
    context: runtime.context_schema,
    event: runtime.event_schema,
    prompt: runtime.prompt_schema,
    progress: runtime.progress_schema,
    result: runtime.result_schema,
    evaluation: runtime.evaluation_schema,
    manifest: runtime.manifest_schema,
    orchestration: runtime.orchestration_schema,
    loopState: runtime.loop_state_schema,
    loopLedgerRecord: runtime.loop_ledger_record_schema,
    iterationCandidate: runtime.iteration_candidate_schema
  };
}

// Minimal CLI: `node schema-validation.mjs smoke` compiles every bound schema.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === 'smoke') {
    const schemas = Object.values(artifactSchemas()).filter(Boolean);
    const failures = compileAll(schemas);
    if (failures.length) {
      for (const failure of failures) console.error(`- ${failure.schema}: ${failure.error}`);
      process.exitCode = 2;
    } else {
      console.log(`schema-validation: ${schemas.length} bound schemas compiled under Ajv2020 strict.`);
    }
  } else {
    console.error('Usage: schema-validation.mjs smoke');
    process.exitCode = 2;
  }
}

