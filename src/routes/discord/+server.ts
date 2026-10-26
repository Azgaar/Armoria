import {env} from "$env/dynamic/private";
import {handleDiscord} from "$lib/server/discord";
import type {Config} from "@sveltejs/adapter-vercel";
import type {RequestHandler} from "./$types";

// Keep interaction startup separate from the image renderer and its dependencies.
export const config = {split: true} satisfies Config;

export const POST: RequestHandler = ({request}) =>
  handleDiscord(request, env.DISCORD_PUBLIC_KEY, env.ARMORIA_API_URL || undefined);
