import cds from "@sap/cds";
import {
  approvePlan,
  requestPlanChanges,
  startApprovedPlan,
  startPlanRevision,
} from "../services/plan.service";
import { boundKey } from "../utils/request";

export default async function planHandler(srv: cds.Service) {
  const { Plans } = srv.entities;

  srv.on("approve", Plans, async (req) => {
    const planId = boundKey(req);
    const goalId = await approvePlan(planId);
    req.on("succeeded", () => startApprovedPlan(goalId));
    return SELECT.one.from(Plans, planId);
  });

  srv.on("requestChanges", Plans, async (req) => {
    const planId = boundKey(req);
    const goalId = await requestPlanChanges(planId, req.data.feedback);
    req.on("succeeded", () => startPlanRevision(goalId));
    return SELECT.one.from(Plans, planId);
  });
}
