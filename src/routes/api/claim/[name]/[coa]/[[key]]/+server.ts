import {MASTER_KEY} from "$env/static/private";
import {getClaim, reclaim, setClaim} from "$lib/api/claims";
import {render} from "$lib/api/renderer";
import {parseColors, parseSeed, README_URL} from "$lib/api/utils";
import {apiError, escapeMarkup, htmlResponse, jsonError} from "$lib/api/responses";
import {parseCoa} from "$lib/api/validation";
import type {RequestHandler} from "./$types";

const SIZE_DEFAULT = 1200;

const handleClaim: RequestHandler = async ({url, params}) => {
  const seed = parseSeed(params.name);

  // Not allowed to claims numeric names
  if (Number.isInteger(Number(seed))) {
    console.error(`Cannot claim numerical name ${seed}`);
    return jsonError("Numeric names cannot be claimed", 403);
  }

  const key = params.key;
  const claim = await getClaim(seed);

  // No rights to update existing claim
  if (claim && claim.key && claim.key !== key && key !== MASTER_KEY) {
    console.error(`Cannot reclaim ${seed}. Key expected: ${claim.key}. Key provided: ${key}`);
    return jsonError("This name is already claimed. Provide the correct password to update it", 403);
  }

  const coaString = params.coa;
  const coa = parseCoa(coaString);

  const query = url.searchParams;
  const size = Number(query.get("size")) || SIZE_DEFAULT;
  const colors = parseColors(query);
  const svg = await render({...coa, seed}, size, colors);
  const link = `https://armoria.vercel.app/api/svg/${size}/${encodeURIComponent(seed)}`;

  if (claim) await reclaim({name: seed, coa, key});
  else await setClaim({name: seed, coa, key});

  console.log(`${seed} is ${claim ? "reclaimed" : "claimed"}. COA: ${coaString}. Key: ${key}`);
  return htmlResponse(
    `<h1>Armoria API: <i>${escapeMarkup(seed)}</i> is ${claim ? "reclaimed" : "claimed"}</h1>
  <p>Now use it like <a href="${escapeMarkup(link)}">${escapeMarkup(link)}</a></p>
  ${svg}${key ? `<p>Password: <code>${escapeMarkup(key)}</code></p>` : ""}
  <p>COA: <code>${escapeMarkup(coaString)}</code></p>
  <p>See <a href="${README_URL}" target="_blank">README</a> for guidance.</p>`
  );
};

export const GET: RequestHandler = async event => {
  try {
    return await handleClaim(event);
  } catch (error) {
    return apiError(error);
  }
};
