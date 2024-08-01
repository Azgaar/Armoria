import type {RequestHandler} from "./$types";
import {isConnected, getClaim, unclaim} from "$lib/api/db";
import {parseSeed, README_URL} from "$lib/api/utils";

export const GET: RequestHandler = async ({url, params}) => {
  if (!isConnected()) {
    console.error(`Cannot unclaim as database connection is down`);
    return new Response(`<h1>Armoria API</h1><p>Cannot connect to the database</p>`, {
      status: 400,
      headers: {
        "Content-Type": "text/html"
      }
    });
  }

  const seed = parseSeed(params.name);
  const key = params.key;
  const claim = await getClaim(seed);

  // Nothing to unclaim
  if (!claim) {
    console.error(`Cannot unclaim as ${seed} is not claimed`);
    return new Response(`<h1>Armoria API</h1>
    <p>Cannot unclaim ${seed} as it was not claimed before.</a></p>
    <p>See <a href="${README_URL}" target="_blank">README</a> for guidance.</p>`, {
      status: 400,
      headers: {
        "Content-Type": "text/html"
      }
    });
  }

  // No rights to update existing claim
  if (claim && claim.key && claim.key !== key && key !== process.env.MASTER_KEY) {
    console.error(`Cannot unclaim ${seed}. Key expected: ${claim.key}. Key provided: ${key}`);
    return new Response(`<h1>Armoria API</h1>
    <p><code>${seed}</code> claim is password protected. Please provide correct password to unclaim.</p>
    <p>See <a href="${README_URL}" target="_blank">README</a> for guidance.</p>`, {
      status: 403,
      headers: {
        "Content-Type": "text/html"
      }
    });
  }

  await unclaim(seed);
  console.log(`${seed} is unclaimed`);
  return new Response(`<h1>Armoria API: <i>${seed}</i> is unclaimed</h1>
  <p>See <a href="${README_URL}" target="_blank">README</a> for guidance.</p>`, {
    status: 200,
    headers: {
      "Content-Type": "text/html"
    }
  });
};
