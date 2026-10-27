# Armoria

Armoria is a procedural heraldry generator and editor by Azgaar. It's both a serverless GUI tool and server-side API. It is also used as a part of the [Fantasy Map Generator](https://github.com/Azgaar/Fantasy-Map-Generator) project.

The GUI is available on [Vercel](https://armoria.vercel.app/). Join our [Reddit community](https://www.reddit.com/r/FantasyMapGenerator) and [Discord server](https://discordapp.com/invite/X7E84HU) to share your creations, discuss the tool, suggest ideas and get the most recent updates.

You can support the project on [Patreon](https://www.patreon.com/azgaar).

A tutorial is available [on Wiki](https://github.com/Azgaar/Armoria/wiki/Armoria-Tutorial). In case you want to help with translation, join the project on [Crowdin](https://crowdin.com/project/armoria).

![Gallery View](static/preview.png)

![Editor View](static/preview2.png)

## For Developers

The tool is almost zero-dependency vanilla JS based on [SvelteKit](https://github.com/sveltejs/kit). [Svelte](https://github.com/sveltejs/svelte) is a framework used for UI that compiles components to vanilla JS.

Pull requests are welcomed.

### Installation

Clone the repository and install the dependencies, then run `dev` to build and start the application in dev mode:

```
git clone https://github.com/Azgaar/Armoria.git
cd Armoria
npm install
npm run dev
```

Navigate to [localhost:5173](http://localhost:5173). You should see the app running. Edit a component file in `src`, save it, and reload the page to see your changes.

To create an optimised version run `npm run build`.

## Links and the address bar

While a coat of arms is edited, the `coa` URL parameter follows every change, so a reload or a shared address shows it as it is. The address, copied links, COA strings and JSON exports all carry the coat of arms as drawn here: with the shield it uses, and with every tincture recoloured or added in this browser written as its hex colour (`{"t1": "#0000ff"}`, or `vair-#0000ff-or` in a pattern), as the API accepts it. Default tinctures keep their names.

## API

The API allows to `GET` random or predefined vector and raster heraldic images of a given size.

For more details, see [the documentation](https://github.com/Azgaar/Armoria/wiki/Armoria-API).

Invalid COA JSON or unsupported COA elements return a JSON error with HTTP 400. Unexpected rendering or service failures return a generic HTTP 500 JSON error; raw request data and internal error details are not included. Claim authorization failures return HTTP 403 JSON errors, while successful claim/unclaim requests retain their HTML confirmation pages.

Run `npm run test:api` with Node 24 to check API error responses, SVG output escaping, and claim confirmations. The tests compile the actual routes and Svelte renderer, use local charge assets, and replace database access and raster conversion with test fixtures; they require no credentials or running services.

## Live editing from Fantasy Map Generator

When Fantasy Map Generator opens an emblem for editing, Armoria receives `from=FMG`, a `session` token and `returnOrigin`. Every edit, undo, redo and tincture recolouring is then sent back to the map once editing pauses for half a second: Armoria posts `{type: "armoria:coa", version: 1, session, coa, svg}` to its opener at `returnOrigin`. `coa` is the edited blazon. A tincture recoloured or added here is sent as its hex colour, as the API accepts it (`{"t1": "#228833"}`, or `vair-#228833-or` in a pattern), so the map draws the shades shown in Armoria; default tinctures keep their names. `svg` is the complete SVG export, which the map uses when it cannot draw the blazon itself. The unchanged original is not sent, nor anything once the map tab is closed. The map accepts messages only from Armoria's origin with the live session token of that emblem. No message is sent when Armoria was opened directly.

## Alternatives

While Armoria is focused on coat of arms generation and UI simplicity, there are some alternatives that cover heraldry more precisely.

[Heraldry.Digital](https://github.com/heraldry/armory) aims to support most of the heraldry features and create a system able to convert between blazonry and metadata. It allows users to create much more complex coats of arms, while it is not a generator and can be hard to use.

[DrawShield](https://github.com/drawshield/Drawshield-Code) is another wonderful project. It allows to render a coat of arms taking the heraldic blazon as input.

## Discord command

`/armoria seed:barrulus` replies with `https://armoria.vercel.app/api?format=png&size=400&seed=barrulus`.
Vercel deploys `/discord` as a separate function, without the image renderer or MongoDB dependencies. The endpoint verifies Discord's signed HTTP interactions and returns the link immediately. It does not fetch the image or connect to MongoDB; Discord loads the image separately. The existing frontend, image API and Atlas database stay in place.

Use the existing Discord application if access is available, or create one in the [Discord Developer Portal](https://discord.com/developers/applications):

1. Set `DISCORD_PUBLIC_KEY` in the Vercel project's environment variables, using the application's **Public Key** from **General Information**, and redeploy. An optional `ARMORIA_API_URL` overrides the default `https://armoria.vercel.app/api`.
2. Set the application's **Interactions Endpoint URL** to `https://armoria.vercel.app/discord`. Discord verifies it by sending a signed PING. Receiving interactions over HTTP replaces Gateway interaction delivery for that application, so check any other commands before reusing an application.
3. Add `DISCORD_APPLICATION_ID` and `DISCORD_BOT_TOKEN` to your local `.env` (the variables are listed in `.env.example`). Keep the app's existing MongoDB variables. The bot token is used only for registration and is not needed on Vercel.
4. With Node 24, run `npm run discord:register`. It creates or updates only `/armoria` and leaves other commands registered. Set `DISCORD_GUILD_ID` for a test-server command, or omit it for a global command. Remove a guild test command when finished so it does not shadow the global one.
5. Open the installation URL printed by the script using an account allowed to add applications to the server, then invoke `/armoria`. The `applications.commands` scope is sufficient; no persistent bot process or message-content intent is needed.

Seeds must contain 1–100 characters without spaces; they are URL-encoded. The reply is public, while usage errors are private. Image previews depend on Discord settings and the image API's response time.

Run `npm run test:discord` with Node 24 to verify signatures, request handling, URL encoding and command registration without credentials or a database. Registration is never run as part of a deployment build.

References: [Discord interactions](https://docs.discord.com/developers/interactions/overview) and [application commands](https://docs.discord.com/developers/interactions/application-commands).


## License

The code is distributed under [MIT](https://opensource.org/licenses/MIT). Feel free to use it for any purpose.

Simple svg shapes and charges are self-made and available under [CC0](https://creativecommons.org/share-your-work/public-domain/cc0/). A lot of the complex charge renders are from [WappenWiki](http://wappenwiki.org) and available for [non-commercial use only](https://creativecommons.org/licenses/by-nc/3.0/). Check out the license details added to svg files and available on the _License_ screen on UI.

All images are manually optimized by me.
