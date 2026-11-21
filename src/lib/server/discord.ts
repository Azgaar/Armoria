import {createPublicKey, verify} from "node:crypto";

const json = (status: number, body: unknown) =>
  Response.json(body, {
    status,
    headers: {"Cache-Control": "no-store"}
  });

const reply = (content: string, ephemeral = false) =>
  json(200, {
    type: 4,
    data: {content, allowed_mentions: {parse: []}, ...(ephemeral ? {flags: 64} : {})}
  });

/** Handle Discord's HTTP interactions without fetching an image or opening a database connection. */
export async function handleDiscord(request: Request, publicKey?: string, apiUrl = "https://armoria.vercel.app/api") {
  if (request.method !== "POST") {
    const response = json(405, {error: "POST required"});
    response.headers.set("Allow", "POST");
    return response;
  }
  if (!/^[a-f0-9]{64}$/i.test(publicKey || "")) return json(503, {error: "Discord public key is not configured"});

  const signature = request.headers.get("x-signature-ed25519") || "";
  const timestamp = request.headers.get("x-signature-timestamp") || "";
  if (
    !/^[a-f0-9]{128}$/i.test(signature) ||
    !/^\d{1,12}$/.test(timestamp) ||
    Math.abs(Date.now() / 1000 - Number(timestamp)) > 300
  ) {
    return json(401, {error: "Invalid request signature"});
  }
  if (Number(request.headers.get("content-length")) > 65536) return json(413, {error: "Request too large"});
  const body = Buffer.from(await request.arrayBuffer());
  if (body.length > 65536) return json(413, {error: "Request too large"});

  const key = createPublicKey({
    key: Buffer.from("302a300506032b6570032100" + publicKey, "hex"),
    format: "der",
    type: "spki"
  });
  if (!verify(null, Buffer.concat([Buffer.from(timestamp), body]), key, Buffer.from(signature, "hex"))) {
    return json(401, {error: "Invalid request signature"});
  }

  let interaction;
  try {
    interaction = JSON.parse(body.toString("utf8"));
  } catch {
    return json(400, {error: "Invalid JSON"});
  }
  if (interaction?.type === 1) return json(200, {type: 1});
  if (interaction?.type !== 2 || interaction.data?.name !== "armoria" || interaction.data?.type !== 1) {
    return reply("Unknown command.", true);
  }

  const options: {name?: string; type?: number; value?: unknown}[] | undefined = interaction.data.options;
  const seed = Array.isArray(options) ? options.find(option => option?.name === "seed" && option.type === 3)?.value : undefined;
  if (typeof seed !== "string" || seed.length < 1 || seed.length > 100 || /[\s\x00-\x1f]/u.test(seed)) {
    return reply("Please supply a seed of 1–100 characters without spaces.", true);
  }

  try {
    const url = new URL(apiUrl);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Invalid API URL");
    url.search = "";
    url.hash = "";
    url.searchParams.set("format", "png");
    url.searchParams.set("size", "400");
    url.searchParams.set("seed", seed);
    return reply(url.href);
  } catch {
    return reply("The image API URL has not been configured correctly.", true);
  }
}
