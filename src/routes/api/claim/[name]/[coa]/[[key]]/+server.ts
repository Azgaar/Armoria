import {jsonError} from "$lib/api/responses";
import type {RequestHandler} from "./$types";

// Do not redirect, reflect credentials, access the database, or mutate on GET/HEAD.
export const GET: RequestHandler = () =>
  jsonError("This URL-based mutation endpoint is retired. Use POST or DELETE /api/claims/{name} with a JSON body", 410);
