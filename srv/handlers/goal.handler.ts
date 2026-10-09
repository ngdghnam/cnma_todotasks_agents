import cds from "@sap/cds";
import {
  buildArtifactsZip,
  cancelGoal,
  initializeGoal,
  prepareReplanning,
  resolveOwner,
  startPlanningAfterCommit,
  stopAgentsAfterCommit,
} from "../services/goal.service";
import { recoverAfterRestart } from "../agents/orchestrator.service";
import { boundKey } from "../utils/request";
import { GoalStatus } from "../constants/goal.constants";

export default async function goalHandler(srv: cds.Service) {
  const { Goals } = srv.entities;

  srv.before("CREATE", Goals, async (req) => {
    req.data.owner_ID ??= await resolveOwner(req.user.id);
    req.data.status = GoalStatus.DRAFT;
  });

  // Goal created -> context, conversation, then the agents (after commit).
  srv.after("CREATE", Goals, async (_, req) => {
    const goalId: string = req.data.ID;
    await initializeGoal(goalId);
    if (req.data.autoGeneratePlan !== false)
      req.on("succeeded", () => startPlanningAfterCommit(goalId));
  });

  srv.on("generatePlan", Goals, async (req) => {
    const goalId = boundKey(req);
    await prepareReplanning(goalId);
    req.on("succeeded", () => startPlanningAfterCommit(goalId));
    return SELECT.one.from(Goals, goalId);
  });

  srv.on("cancel", Goals, async (req) => {
    const goalId = boundKey(req);
    if (await cancelGoal(goalId))
      req.on("succeeded", () => stopAgentsAfterCommit(goalId));
    return SELECT.one.from(Goals, goalId);
  });

  srv.on("downloadArtifacts", Goals, async (req) =>
    buildArtifactsZip(boundKey(req)),
  );

  cds.once("served", () => recoverAfterRestart());
}
