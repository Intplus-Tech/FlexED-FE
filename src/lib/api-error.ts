/**
 * Turns whatever RTK Query handed back into a message fit to show a user.
 *
 * RTK Query errors arrive in three shapes — a `FetchBaseQueryError` carrying the
 * API envelope, a serialized thrown error, or a bare string — and the table
 * error state needs one line of text out of any of them.
 */
export function normalizeError(error: unknown): { message: string; status?: number } {
  if (!error) return { message: "" };

  if (typeof error === "string") return { message: error };

  const candidate = error as {
    status?: number | string;
    data?: unknown;
    error?: string;
    message?: string;
  };

  const status = typeof candidate.status === "number" ? candidate.status : undefined;

  // The API's own envelope: { success, message, statusCode }.
  const data = candidate.data as { message?: unknown; errors?: unknown } | undefined;
  if (data && typeof data.message === "string" && data.message) {
    return { message: data.message, status };
  }
  if (data && Array.isArray(data.errors) && typeof data.errors[0] === "string") {
    return { message: data.errors[0] as string, status };
  }

  // FETCH_ERROR / PARSING_ERROR carry the reason on `error`.
  if (typeof candidate.error === "string" && candidate.error) {
    return { message: candidate.error, status };
  }
  if (typeof candidate.message === "string" && candidate.message) {
    return { message: candidate.message, status };
  }

  if (candidate.status === "FETCH_ERROR") {
    return { message: "Couldn't reach the server. Check your connection." };
  }

  return { message: "Something went wrong.", status };
}
