/**
 * Extracts a JSON value from model text. Tries, in order: the whole text,
 * a ```json fence wrapping the answer, then the outermost {...} block.
 * (Fences INSIDE JSON strings, e.g. a generated readme, must not be mistaken
 * for the wrapper — so the fence only counts when it opens the answer.)
 */
export function parseJsonOutput<T>(text: string): T | undefined {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*\n([\s\S]*)\n```$/i.exec(trimmed);
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  for (const candidate of [trimmed, fenced?.[1], start >= 0 && end > start ? trimmed.slice(start, end + 1) : undefined]) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // try the next candidate
    }
  }
  return undefined;
}

/** Rough token estimate (~4 chars per token) for budgeting and audit. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
