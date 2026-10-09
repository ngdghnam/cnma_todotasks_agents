export const PlanStatus = {
  /** Being generated / revised by the Planner. */
  DRAFT: "DRAFT",
  /** Accepted by the Reviewer, waiting for the user's approval. */
  PROPOSED: "PROPOSED",
  /** Approved by the user, Tasks are executing. */
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
