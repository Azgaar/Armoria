import {pathToFileURL} from "node:url";

export const command = {
  name: "armoria",
  type: 1,
  description: "Generate a coat of arms from a seed",
  options: [
    {
      name: "seed",
      type: 3,
      description: "Text without spaces; the same seed generates the same emblem",
      required: true,
      min_length: 1,
      max_length: 100
    }
  ]
};

export async function register(env = process.env, request = fetch) {
  const {DISCORD_APPLICATION_ID: applicationId, DISCORD_BOT_TOKEN: token, DISCORD_GUILD_ID: guildId} = env;
  if (!/^\d+$/.test(applicationId || "") || !token || (guildId && !/^\d+$/.test(guildId))) {
    throw new Error("Set DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN, and optionally DISCORD_GUILD_ID, in .env");
  }
  const scope = guildId ? `/guilds/${guildId}` : "";
  // POST upserts only /armoria. Bulk PUT would delete unrelated commands.
  const response = await request(`https://discord.com/api/v10/applications/${applicationId}${scope}/commands`, {
    method: "POST",
    headers: {Authorization: `Bot ${token}`, "Content-Type": "application/json"},
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`Discord command registration failed (HTTP ${response.status})`);
  return response.json();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  register()
    .then(() => {
      console.log(`Registered /armoria ${process.env.DISCORD_GUILD_ID ? "in the test server" : "globally"}.`);
      console.log(
        `Install: https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_APPLICATION_ID}&scope=applications.commands`
      );
    })
    .catch(error => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
