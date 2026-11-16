import "server-only";

/**
 * fetch() for third-party APIs. Network failures and timeouts are rethrown
 * with the service name, so callers can log a clear cause and fall back.
 */
export async function fetchService(
  service: string,
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err) {
    const e = err as Error;
    const reason =
      e.name === "TimeoutError" || e.name === "AbortError"
        ? "timed out"
        : `was unreachable (${e.message})`;
    throw new Error(`${service} ${reason}`, { cause: err });
  }
}
