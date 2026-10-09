import type cds from "@sap/cds";
import type { BoundKeyParam } from "../types/request.types";

/** ID of the bound entity of an action/function (`/Goals(<ID>)/generatePlan`). */
export function boundKey(req: cds.Request): string {
  const key = req.params?.[0] as BoundKeyParam | undefined;
  const id = typeof key === "object" ? key?.ID : key;
  if (!id) throw new Error(`Bound operation ${req.event} called without a key`);
  return id;
}
