import type {RequestHandler} from "./$types";
import {isConnected, getClaim, reclaim, setClaim} from "$lib/api/db";
import {render} from "$lib/api/renderer";
import {getColors, parseSeed, README_URL} from "$lib/api/utils";

const SIZE_DEFAULT = 1200;

export const GET: RequestHandler = async ({ url, params }) => {
  const seed = parseSeed(params.name);

  // Not allowed to claims numeric names
  if (Number.isInteger(+seed)) {
    console.error(`Cannot claim numerical name ${seed}`);
    return new Response(`<h1>Armoria API</h1>
    <p>Numeric name <code>${seed}</code> cannot be claimed. Please provide alphabetic or alphanumerical name.</p>
    <p>See <a href="${README_URL}" target="_blank">README</a> for guidance.</p>`, {
      status: 403,
      headers: {
        "Content-Type": "text/html"
      }
    });
  }

  if (!isConnected()) {
    console.error(`Cannot claim as database connection is down`);
    return new Response(`<h1>Armoria API</h1><p>Cannot connect to the database</p>`, {
      status: 400,
      headers: {
        "Content-Type": "text/html"
      }
    });
  }

  const key = params.key;
  const claim = await getClaim(seed);

  // No rights to update existing claim
  if (claim && claim.key && claim.key !== key && key !== process.env.MASTER_KEY) {
    console.error(`Cannot reclaim ${seed}. Key expected: ${claim.key}. Key provided: ${key}`);
    return new Response(`<h1>Armoria API</h1>
    <p>Name <code>${seed}</code> is already claimed. Please provide correct password to update the claim.</p>
    <p>See <a href="${README_URL}" target="_blank">README</a> for guidance.</p>`, {
      status: 403,
      headers: {
        "Content-Type": "text/html"
      }
    });
  }

  const coaString = params.coa;
  const coa = JSON.parse(coaString);

  const query = url.searchParams;
  const size = parseInt(query.get("size")) || SIZE_DEFAULT;
  const colors = getColors(query);
  const svg = await render(seed, coa, size, colors);
  const link = `https://armoria.herokuapp.com/svg/${size}/${seed}`;

  if (claim) await reclaim({name: seed, coa, key});
  else await setClaim({name: seed, coa, key});

  console.log(`${seed} is ${claim ? "reclaimed" : "claimed"}. COA: ${coaString}. Key: ${key}`);
  return new Response(`<h1>Armoria API: <i>${seed}</i> is ${claim ? "reclaimed" : "claimed"}</h1>
  <p>Now use it like <a href=${link}>${link}</a></p>
  ${svg}${key ? `<p>Password: <code>${key}</code></p>` : ""}
  <p>COA: <code>${coaString}</code></p>
  <p>See <a href="${README_URL}" target="_blank">README</a> for guidance.</p>`, {
    status: 200,
    headers: {
      "Content-Type": "text/html"
    }
  });
};
