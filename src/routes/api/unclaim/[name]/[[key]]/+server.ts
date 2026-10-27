import {MASTER_KEY} from "$env/static/private";
import {getClaim, unclaim} from "$lib/api/claims";
import {parseSeed, README_URL} from "$lib/api/utils";
import {apiError, escapeMarkup, htmlResponse, jsonError} from "$lib/api/responses";
import type {RequestHandler} from "./$types";

const handleUnclaim: RequestHandler = async ({params}) => {
  const seed = parseSeed(params.name);
  const key = params.key;
  const claim = await getClaim(seed);

  // Nothing to unclaim
  if (!claim) {
    console.error(`Cannot unclaim as ${seed} is not claimed`);
    return jsonError("This name has not been claimed", 400);
  }

  // No rights to update existing claim
  if (claim && claim.key && claim.key !== key && key !== MASTER_KEY) {
    console.error(`Cannot unclaim ${seed}. Key expected: ${claim.key}. Key provided: ${key}`);
    return jsonError("This claim is password protected. Provide the correct password to remove it", 403);
  }

  await unclaim(seed);
  console.log(`${seed} is unclaimed`);
  return htmlResponse(
    `<h1>Armoria API: <i>${escapeMarkup(seed)}</i> is unclaimed</h1>
  <p>See <a href="${README_URL}" target="_blank">README</a> for guidance.</p>`
  );
};

export const GET: RequestHandler = async event => {
  try {
    return await handleUnclaim(event);
  } catch (error) {
    return apiError(error);
  }
};
