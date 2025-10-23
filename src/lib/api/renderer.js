import {read} from "$app/server";
import COA from "$lib/components/object/COA.svelte";
import {DEFAULT_FONTS} from "$lib/config/defaults";
import {shieldPaths} from "$lib/data/shields";
import * as stores from "$lib/data/stores";
import {patterns} from "$lib/data/templates";
import {getSizeMod, getTemplate, semy} from "$lib/scripts/getters";
import {parse} from "node-html-parser";

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
  const {division, ordinaries = [], charges = [], inscriptions = [], shield} = coa;
  logCOAdetails(coa, shield, division, ordinaries, charges);

  const shieldPath = shieldPaths[shield];
  const loadedCharges = await getCharges(coa, shieldPath);
  const loadedPatterns = getPatterns(coa);
  const loadedFonts = await getFonts(coa);
  const shieldClip = `<clipPath id="shield_${coa.seed}"><path d="${shieldPath}"/></clipPath>`;
  const divisionClip = division
    ? `<clipPath id="division_${coa.seed}">${getTemplate(division.division, division.line)}</clipPath>`
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

  function getPatterns(coa) {
    const isPattern = string => string.includes("-");
    let patternsToAdd = [];
    if (coa.t1.includes("-")) patternsToAdd.push(coa.t1); // add field pattern
    if (coa.division && isPattern(coa.division.t)) patternsToAdd.push(coa.division.t); // add division pattern
    if (coa.ordinaries)
      coa.ordinaries.filter(ordinary => isPattern(ordinary.t)).forEach(ordinary => patternsToAdd.push(ordinary.t)); // add ordinaries pattern
    if (coa.charges) coa.charges.filter(charge => isPattern(charge.t)).forEach(charge => patternsToAdd.push(charge.t)); // add charges pattern

    if (!patternsToAdd.length) return "";

    return [...new Set(patternsToAdd)]
      .map(patternString => {
        const [pattern, t1, t2, size] = patternString.split("-");
        const charge = semy(patternString);
        if (charge) return patterns.semy(patternString, clr(t1), clr(t2), getSizeMod(size), charge);
        return patterns[pattern](patternString, clr(t1), clr(t2), getSizeMod(size), charge);
      })
      .join("");
  }

  // get color or link to pattern
  function clr(tincture) {
    if (colors[tincture]) return colors[tincture];
    if (tincture[0] === "#") return tincture;
    return `url(#${tincture})`;
  }
}

async function getCharges(coa, shieldPath) {
  let charges = coa.charges ? coa.charges.map(charge => charge.charge) : []; // add charges
  if (semy(coa.t1)) charges.push(semy(coa.t1)); // add field semy charge
  if (semy(coa.division?.t)) charges.push(semy(coa.division.t)); // add division semy charge

  const uniqueCharges = [...new Set(charges)];
  const fetchedCharges = await Promise.all(
    uniqueCharges.map(async charge => {
      if (charge.slice(0, 12) === "inescutcheon") {
        const chargeId = charge.length === 12 ? charge + coa.shield[0].toUpperCase() + coa.shield.slice(1) : charge;
        const path = charge.length > 12 ? shieldPaths[charge.slice(12, 13).toLowerCase() + charge.slice(13)] : shieldPath;
        return `<g id="${chargeId}"><path transform="translate(66 66) scale(.34)" d="${path}"/></g>`;
      }

      const fetched = await fetchCharge(charge);
      return fetched || "";
    })
  );
  return fetchedCharges.join("");
}

async function fetchCharge(charge) {
  const url = charges[`/static/charges/${charge}.svg`];
  const text = await read(url).text();
  const root = parse(text);
  const g = root.querySelector("g");
  return g.outerHTML;
}

async function getFonts(coa) {
  if (!coa.inscriptions) return "";

  const fontSet = new Set();
  coa.inscriptions.forEach(inscription => {
    if (!fontSet.has(inscription.font) && DEFAULT_FONTS[inscription.font]?.url) {
      fontSet.add({family: inscription.font, url: DEFAULT_FONTS[inscription.font].url});
    }
  });

  if (!fontSet.size) return "";

  const dataURLfonts = await loadFontsAsDataURI(Array.from(fontSet));
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

function logCOAdetails(coa, shield, division, ordinaries, charges) {
  console.log("---------------");
  console.log("Field:", {t1: coa.t1, shield});
  if (division) console.log("Division:", division);
  if (ordinaries.length) ordinaries.forEach(ordinary => console.log("Ordinary:", ordinary));
  if (charges.length) charges.forEach(charge => console.log("Charge:", charge));
}
