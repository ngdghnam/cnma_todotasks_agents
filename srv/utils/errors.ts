/** Throw an error CAP turns into an HTTP response with this status and code. */
export function fail(status: number, code: string, message: string): never {
  throw Object.assign(new Error(message), { status, code });
}
