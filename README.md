# Armoria

Armoria is a procedural heraldry generator and editor by Azgaar.

Project is under development, alpha version is available on [Github Pages](https://azgaar.github.io/Armoria/).

![Gallery View](public/preview.png)
![Editor View](https://cdn.discordapp.com/attachments/587406457725779968/787792526907015234/preview2.png)

Join our [Reddit community](https://www.reddit.com/r/FantasyMapGenerator) and [Discord server](https://discordapp.com/invite/X7E84HU) to share your creations, discuss the Tool, suggest ideas and get the most recent updates. You can support the project on [Patreon](https://www.patreon.com/azgaar).

## For Developers

The tool is almost zero-dependency vanilla JS with just [Svelte](https://github.com/sveltejs/svelte) to build UI. Svelte is a bit specific framework that compiles components to vanilla JS.

I am not a profi in web-development or Svelte, so help from professional developers and Rull Requests is welcomed.

### Installation

Clone the repository and install the dependencies.

```sh
$ git clone https://github.com/Azgaar/Armoria.git
$ cd Armoria
$ npm install
```

### Usage

Run `dev` to start Rollup and build in dev mode

```sh
$ npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see the app running.

Edit a component file in `src`, save it, and reload the page to see your changes.

To create an optimised version of the app run:

```bash
npm run build
```

## License

The code is distributed under MIT. Simple svg shapes and charges are self-made and available under CC0. Complex charges are historical, svg renders are coming from WappenWiki(http://wappenwiki.org) and available for non-commercial use under CC3. Source info is added to svg files as a comment. All images are manually optimized by me.