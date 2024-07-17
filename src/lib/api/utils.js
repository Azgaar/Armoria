import {DEFAULT_COLORS} from "$lib/config/defaults";

export const README_URL = "https://github.com/Azgaar/armoria-api#readme";

export function getColors(params) {
  const getColor = color => (params.get(color) && params.get(color).length === 6 ? "#" + params.get(color) : null);
  const colors = {};
  Object.keys(DEFAULT_COLORS).forEach(color => (colors[color] = getColor(color) || DEFAULT_COLORS[color]));
  return colors;
}

export function parseSeed(seed) {
  return seed.toLowerCase().replace(/#| |'/g, "_");
}

