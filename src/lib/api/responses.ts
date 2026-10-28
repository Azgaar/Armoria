import {InvalidCoaError, RequestLimitError} from "$lib/coa/errors";
export {InvalidCoaError, RequestLimitError} from "$lib/coa/errors";

/** Escape text and quoted attributes in the API's manually assembled HTML/SVG. */
export function escapeMarkup(value: string): string {
  return value.replace(/[&<>"']/g, character => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

export function apiError(error: unknown): Response {
  if (error instanceof RequestLimitError) return jsonError(error.message, error.status);
  const invalid = error instanceof InvalidCoaError;
  if (!invalid) console.error("API request failed", error);
  return jsonError(invalid ? error.message : "Unable to process the request", invalid ? 400 : 500);
}

export function jsonError(message: string, status: number): Response {
  return Response.json(
    {error: message},
    {
      status,
      headers: {"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"}
    }
  );
}

export function htmlResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; font-src data:; sandbox"
    }
  });
}
