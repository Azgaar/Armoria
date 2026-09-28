import {DEFAULT_COLORS} from "config/defaults";

/** the tinctures recoloured or added in this browser, which elsewhere would draw in their default shades */
export function customColors(palette: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(palette).filter(([name, color]) => DEFAULT_COLORS[name] !== color));
}

/**
 * The coat of arms as it is drawn here, for the URL, shared links, exports and Fantasy Map Generator:
 * the default shield when it has none of its own, and a tincture recoloured or added in this browser
 * as its hex colour, as the API accepts it. Default tinctures keep their names
 */
export function resolveCoa(coa: string, palette: Record<string, string>, defaultShield: string) {
  const shades = customColors(palette);
  const shade = (tincture: string | undefined) => {
    if (!tincture) return tincture;
    const parts = tincture.split("-"); // a pattern names its tinctures second and third
    if (parts.length === 1) return shades[tincture] ?? tincture;
    return parts.map((part, i) => ((i === 1 || i === 2) && shades[part]) || part).join("-");
  };

  const blazon = JSON.parse(coa);
  delete blazon.seed;
  blazon.shield ||= defaultShield;
  blazon.t1 = shade(blazon.t1);
  if (blazon.division) blazon.division.t = shade(blazon.division.t);
  for (const ordinary of blazon.ordinaries ?? []) {
    ordinary.t = shade(ordinary.t);
    if (ordinary.t2) ordinary.t2 = shade(ordinary.t2);
  }
  for (const charge of blazon.charges ?? []) {
    charge.t = shade(charge.t);
    if (charge.t2) charge.t2 = shade(charge.t2);
    if (charge.t3) charge.t3 = shade(charge.t3);
  }
  return blazon;
}
