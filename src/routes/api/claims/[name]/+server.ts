import {env} from "#lib/server/env.ts";
import {mutateClaim} from "#lib/server/claimMutations.ts";
import type {RequestHandler} from "./$types";

export const POST: RequestHandler = ({request, params}) => mutateClaim(request, params.name, env.MASTER_KEY);
export const DELETE: RequestHandler = POST;
