import {defineEnvVars} from "@sveltejs/kit/env";

const optional = (value: string | undefined) => value;

// Optional runtime services: procedural rendering and builds need no credentials.
export const variables = defineEnvVars({
  MONGO_ID: {schema: optional},
  MONGO_PASS: {schema: optional},
  MASTER_KEY: {schema: optional},
  DISCORD_PUBLIC_KEY: {schema: optional},
  ARMORIA_API_URL: {schema: optional}
});
