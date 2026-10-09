import cds from "@sap/cds";
import { Messages, Sessions } from "#cds-models/cnma/todotasks";
import { DEFAULT_SESSION_TITLE, SessionStatus } from "../constants/session.constants";
import type { MessageRole } from "../types/session.types";

const { SELECT, INSERT } = cds.ql;

/** The Goal's ACTIVE conversation; created on first use. */
export async function getOrCreateSession(goalId: string, title = DEFAULT_SESSION_TITLE): Promise<string> {
  const existing = await SELECT.one
    .from(Sessions)
    .columns("ID")
    .where({ goal_ID: goalId, status: SessionStatus.ACTIVE })
    .orderBy("createdAt desc");
  if (existing) return existing.ID!;

  const ID = cds.utils.uuid();
  await INSERT.into(Sessions).entries({ ID, goal_ID: goalId, title, status: SessionStatus.ACTIVE });
  return ID;
}

export async function appendMessage(goalId: string, role: MessageRole, content: string): Promise<void> {
  const sessionId = await getOrCreateSession(goalId);
  const last = await SELECT.one
    .from(Messages)
    .columns("sequence")
    .where({ session_ID: sessionId })
    .orderBy("sequence desc");
  await INSERT.into(Messages).entries({
    session_ID: sessionId,
    role,
    content,
    sequence: (last?.sequence ?? 0) + 1,
  });
}
