export const GoalStatus = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

/** Email domain for Users rows auto-created from the authenticated user id. */
export const AUTO_USER_EMAIL_DOMAIN = "users.local";
