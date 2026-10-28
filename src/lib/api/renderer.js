import {read} from "$app/server";
import COA from "$lib/components/object/COA.svelte";
import {DEFAULT_FONTS} from "$lib/config/defaults";
import {divisions, patterns, shields} from "$lib/data/dataModel";
import * as stores from "$lib/data/stores";
import {getSizeMod, getTemplate, patternId, semy} from "$lib/scripts/getters";
import {capitalize} from "$lib/scripts/utils";
import {parse} from "node-html-parser";
import {createHash} from "node:crypto";
import {escapeMarkup, InvalidCoaError} from "./responses";
import {validateImageSize} from "./limits";
import {normalizeCoa} from "./validation";

const SHIELD_DEFAULT = "heater";

const charges = import.meta.glob("/static/charges/*.svg", {
  query: "?url",
  import: "default",
  eager: true
});

const backlight = `<radialGradient id="backlight" cx="100%" cy="100%" r="150%">
  <stop stop-color="#fff" stop-opacity=".3" offset="0"/>
  <stop stop-color="#fff" stop-opacity=".15" offset=".25"/>
  <stop stop-color="#000" stop-opacity="0" offset="1"/>
</radialGradient>`;

export async function render(coa, size, colors) {
  validateImageSize(size);
  coa = normalizeCoa(coa);
  // A seed selects the artwork; it must not become raw markup or an unsafe fragment identifier.
  coa = {
    ...coa,
    shield: coa.shield ?? SHIELD_DEFAULT,
    seed: createHash("sha256")
      .update(String(coa.seed ?? ""))
      .digest("hex")
  };
  const {division, shield} = coa;
  const dependencies = collectDependencies(coa);

  const shieldPath = shields.data[shield].path;
  const loadedCharges = await getCharges(dependencies.charges);
  const loadedPatterns = getPatterns();
  const loadedFonts = await getFonts(coa);
  const shieldClip = `<clipPath id="shield_${coa.seed}"><path d="${shieldPath}"/></clipPath>`;
  const divisionClip = division
    ? `<clipPath id="division_${coa.seed}">${getTemplate(divisions.data[division.division], division.line)}</clipPath>`
    : "";
  const style = `<style>
    .secondary {fill: var(--secondary);}
    .tertiary {fill: var(--tertiary);}
    .pseudostroke {fill: var(--stroke);}
    .background {display: var(--background)}
  </style>`;

  stores.grad.set("backlight");
  stores.colors.set(colors);

  const svg = COA.render({coa, height: size, width: size, i: "View"});
  const root = parse(svg.html);
  root.querySelector("defs").innerHTML =
    `${shieldClip}${divisionClip}${loadedCharges}${loadedPatterns}${loadedFonts}${backlight}${style}`;
  return root.outerHTML;

  function getPatterns() {
    return [...dependencies.patterns]
      .map(patternString => {
        const [pattern, t1, t2, size] = patternString.split("-");
        const charge = semy(patternString);
        const id = escapeMarkup(patternId(patternString));
        if (charge) return patterns.semy(id, clr(t1), clr(t2), getSizeMod(size), escapeMarkup(resolveChargeId(charge, shield)));
        return patterns[pattern](id, clr(t1), clr(t2), getSizeMod(size), charge);
      })
      .join("");
  }

  // get color or link to pattern
  function clr(tincture) {
    if (Object.hasOwn(colors, tincture)) return escapeMarkup(colors[tincture]);
    if (tincture[0] === "#") return escapeMarkup(tincture);
    return escapeMarkup(`url(#${tincture})`);
  }
}

// A semy pattern depends on a charge definition, including when it is used in
// secondary/tertiary fills. Resolve IDs before deduplication so generic and named
// inescutcheons share a definition when they use the same shield.
/** @param {string} charge @param {string} shield */
function resolveChargeId(charge, shield) {
  return charge === "inescutcheon" ? charge + capitalize(shield) : charge;
}

/** @param {import("$lib/types/coa").Coa & {shield: string}} coa */
function collectDependencies(coa) {
  const tinctures = [
    coa.t1,
    coa.division?.t,
    ...(coa.ordinaries || []).flatMap(item => [item.t, item.t2]),
    ...(coa.charges || []).flatMap(item => [item.t, item.t2, item.t3])
  ];
  /** @type {Set<string>} */
  const patterns = new Set();
  for (const tincture of tinctures) if (tincture?.includes("-")) patterns.add(tincture);
  const charges = new Set((coa.charges || []).map(item => resolveChargeId(item.charge, coa.shield)));
  for (const pattern of patterns) {
    const charge = semy(pattern);
    if (charge) charges.add(resolveChargeId(charge, coa.shield));
  }
  return {patterns, charges};
}

/** @param {Set<string>} charges */
async function getCharges(charges) {
  const fetchedCharges = await Promise.all(
    [...charges].map(async charge => {
      if (charge.startsWith("inescutcheon")) {
        const shieldType = charge.slice(12, 13).toLowerCase() + charge.slice(13);
        const path = shields.data[shieldType]?.path;
        if (!path) {
          throw new InvalidCoaError("Unknown inescutcheon shield");
        }
        return `<g id="${escapeMarkup(charge)}"><path transform="translate(67 67) scale(.33)" d="${path}"/></g>`;
      }

      return await fetchCharge(charge);
    })
  );
  return fetchedCharges.join("");
}

async function fetchCharge(charge) {
  const url = charges[`/static/charges/${charge}.svg`];
  if (typeof url !== "string") throw new InvalidCoaError("Unknown COA charge");
  const text = await read(url).text();
  const root = parse(text);
  const g = root.querySelector("g");
  return g.outerHTML;
}

async function getFonts(coa) {
  if (!coa.inscriptions) return "";

  const fontSet = new Map();
  coa.inscriptions.forEach(inscription => {
    if (!fontSet.has(inscription.font) && DEFAULT_FONTS[inscription.font]?.url) {
      fontSet.set(inscription.font, {family: inscription.font, url: DEFAULT_FONTS[inscription.font].url});
    }
  });

  if (!fontSet.size) return "";

  const dataURLfonts = await loadFontsAsDataURI(Array.from(fontSet.values()));
  const fontFaces = dataURLfonts
    .map(({family, src}) => {
      return `@font-face {font-family: "${family}"; src: ${src};}`;
    })
    .join("\n");

  return `<style type="text/css">${fontFaces}</style>`;
}

async function loadFontsAsDataURI(fonts) {
  const promises = fonts.map(async font => {
    const resp = await fetch(font.url);
    const buffer = Buffer.from(await resp.arrayBuffer());
    const dataURL = "data:font/woff2;base64," + buffer.toString("base64");

    return {family: font.family, src: `url('${dataURL}')`};
  });

  return await Promise.all(promises);
}
