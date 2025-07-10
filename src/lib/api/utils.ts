import {DEFAULT_COLORS} from "$lib/config/defaults";

export const README_URL = "https://github.com/Azgaar/armoria#readme";

export function parseColors(params: URLSearchParams) {
  const getColor = (color: string) => (params.get(color) && params.get(color)?.length === 6 ? "#" + params.get(color) : null);

  return Object.keys(DEFAULT_COLORS).reduce(
    (colors, color) => {
      const clr = color as keyof typeof DEFAULT_COLORS;
      colors[clr] = getColor(color) || DEFAULT_COLORS[clr];
      return colors;
    },
    {} as typeof DEFAULT_COLORS
  );
}

export function parseSeed(seed: string) {
  return seed.toLowerCase().replace(/#| |'/g, "_");
}

export function generateSeed() {
  return String(Math.floor(Math.random() * 1e9));
}
