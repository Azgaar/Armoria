import {getClaim, reclaim, setClaim, unclaim} from "$lib/api/claims";
import {render} from "$lib/api/renderer";
import {parseColors, parseSeed} from "$lib/api/utils";
import {InvalidCoaError, jsonError} from "$lib/api/responses";
import {validateCoa} from "$lib/api/validation";
import {hashClaimPassword, isProtected, mayMutateClaim} from "./claimPasswords";

const MAX_BODY = 64 * 1024;
class RequestError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new RequestError("Use application/json", 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("Provide a JSON object", 400);
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) {
        await reader.cancel();
        throw new RequestError("Request body is too large", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  let body: unknown;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new RequestError("Provide a valid JSON object", 400);
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new RequestError("Provide a JSON object", 400);
  return body as Record<string, unknown>;
}

function success(body: object, status = 200) {
  return Response.json(body, {status, headers: {"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"}});
}

export async function mutateClaim(request: Request, name: string, masterKey?: string): Promise<Response> {
  try {
    const url = new URL(request.url);
    if (url.search) throw new RequestError("Send claim data and passwords in the JSON body, not the URL", 400);
    const body = await readBody(request);
    const allowed = request.method === "POST" ? ["coa", "key"] : ["key"];
    if (Object.keys(body).some(key => !allowed.includes(key))) throw new RequestError("Unknown request field", 400);
    const key = body.key === undefined ? "" : body.key;
    if (typeof key !== "string" || Buffer.byteLength(key) > 4096) throw new RequestError("Invalid claim password", 400);
    const authorization = request.headers.get("authorization");
    if (authorization && authorization.length > 8192) throw new RequestError("Invalid authorization header", 400);
    if (!name || name.length > 200 || /[\u0000-\u001f\u007f]/.test(name)) throw new RequestError("Invalid claim name", 400);
    const seed = parseSeed(name);
    if (Number.isInteger(Number(seed))) throw new RequestError("Numeric names cannot be claimed", 403);
    const claim = await getClaim(seed);
    if (claim && !(await mayMutateClaim(claim, key, authorization, masterKey))) {
      return jsonError("Provide the correct claim password or administrator authorization", 403);
    }
    if (request.method === "DELETE") {
      if (!claim) return jsonError("This name is not claimed", 404);
      const result = await unclaim(claim);
      if (!result.deletedCount) return jsonError("The claim changed; retry the request", 409);
      return success({status: "unclaimed", name: seed});
    }
    validateCoa(body.coa);
    // Keep the existing render validation, but do not echo submitted artwork or secrets.
    await render({...body.coa, seed}, 1200, parseColors(new URLSearchParams()));
    let protectedClaim: boolean;
    if (claim) {
      // Preserve the owner's password even for administrator updates. Upgrade
      // plaintext atomically with the artwork, removing the legacy key field.
      const keyHash = claim.keyHash ?? (claim.key ? await hashClaimPassword(claim.key) : undefined);
      const result = await reclaim(claim, body.coa, keyHash);
      if (!result.matchedCount) return jsonError("The claim changed; retry the request", 409);
      protectedClaim = isProtected(claim);
    } else {
      if (masterKey && key && key === masterKey) return jsonError("Use a claim-specific password", 400);
      const keyHash = key ? await hashClaimPassword(key) : undefined;
      await setClaim({name: seed, coa: body.coa, ...(keyHash ? {keyHash} : {})});
      protectedClaim = !!keyHash;
    }
    return success(
      {
        status: claim ? "reclaimed" : "claimed",
        name: seed,
        protected: protectedClaim,
        url: `/api?${new URLSearchParams({seed})}`
      },
      claim ? 200 : 201
    );
  } catch (error) {
    if (error instanceof RequestError) return jsonError(error.message, error.status);
    if (error instanceof InvalidCoaError) return jsonError(error.message, 400);
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return jsonError("The claim changed; retry the request", 409);
    }
    // Database/renderer errors may contain submitted records. Never log the error object.
    console.error("Claim mutation failed");
    return jsonError("Unable to process the claim", 500);
  }
}
