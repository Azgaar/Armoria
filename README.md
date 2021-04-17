# Armoria

Armoria is a procedural heraldry generator and editor by Azgaar. It's both a serverless GUI tool and server-side API. Almost the same code is also used as a part of the [Fantasy Map Generator](https://github.com/Azgaar/Fantasy-Map-Generator) project.

Armoria is under development, the GUI version is available on [Github Pages](https://azgaar.github.io/Armoria/) and [here is the tutorial](https://github.com/Azgaar/Armoria/wiki/Armoria-Tutorial). Join our [Reddit community](https://www.reddit.com/r/FantasyMapGenerator) and [Discord server](https://discordapp.com/invite/X7E84HU) to share your creations, discuss the tool, suggest ideas and get the most recent updates.

You can support the project on [Patreon](https://www.patreon.com/azgaar).


![Gallery View](public/preview.png)

![Editor View](https://cdn.discordapp.com/attachments/587406457725779968/787792526907015234/preview2.png)

## For Developers

The tool is almost zero-dependency vanilla JS with just [Svelte](https://github.com/sveltejs/svelte) to build GUI. Svelte is a bit specific framework that compiles components to vanilla JS.

I am not a profi in web-development or Svelte, so help from professional developers and Pull Requests are welcomed.

### Installation

Clone the repository and install the dependencies, then run `dev` to start Rollup and build in dev mode:

```
git clone https://github.com/Azgaar/Armoria.git
cd Armoria
npm install
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see the app running. Edit a component file in `src`, save it, and reload the page to see your changes.

To create an optimised version run `npm run build`.

## API

Armoria API is available as a seperate project, see [the documentation](https://github.com/Azgaar/armoria-api#readme). The API allows to `GET` random or predefined vector and raster heraldic images of a given size.

## License

The code is distributed under [MIT](https://opensource.org/licenses/MIT).

Simple svg shapes and charges are self-made and available under [CC0](https://creativecommons.org/share-your-work/public-domain/cc0/). Complex charges are historical, svg renders are coming from [WappenWiki](http://wappenwiki.org) and available for non-commercial use under [CC3](https://creativecommons.org/licenses/by-nc/3.0/). Source info is added to svg files as a comment.

All images are manually optimized by me.