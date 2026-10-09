import cds from "@sap/cds";
import { Artifacts } from "#cds-models/cnma/todotasks";
import { listArtifactPaths } from "../context.service";
import type { ReadArtifactsInput, ToolHandler } from "../types/tool.types";

const { SELECT } = cds.ql;

/** READ_ARTIFACTS: list accepted files of this goal, or read given paths. */
export const readArtifacts: ToolHandler = async (raw, ctx) => {
  const input = toReadArtifactsInput(raw);
  if (!input.paths.length) return { paths: await listArtifactPaths(ctx.goalId) };

  const files = await SELECT.from(Artifacts)
    .columns("path", "content")
    .where({ goal_ID: ctx.goalId, path: { in: input.paths } });
  return { files };
};

/** Model-supplied input is untrusted: keep only well-typed fields. */
function toReadArtifactsInput(raw: Record<string, unknown>): ReadArtifactsInput {
  return { paths: Array.isArray(raw.paths) ? raw.paths.map(String) : [] };
}
