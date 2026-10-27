import {env} from "$env/dynamic/private";
import {mutateClaim} from "$lib/server/claimMutations";
import type {RequestHandler} from "./$types";

export const POST: RequestHandler = ({request, params}) => mutateClaim(request, params.name, env.MASTER_KEY);
export const DELETE: RequestHandler = POST;
