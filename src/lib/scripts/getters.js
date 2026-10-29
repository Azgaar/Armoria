import {get} from "svelte/store";
import {lines, patterns, shields} from "$lib/data/dataModel";
import {colors, shield, uploaded} from "$lib/data/stores";
import {sanitizeSvg} from "$lib/scripts/sanitizeSvg";
import {browser} from "$app/environment";

/** @type {Record<string, boolean>} */
const loadedCharges = {};

/** @param {import("$lib/types/data").Template} obj @param {string} [line] */
export const getTemplate = (obj, line) => {
  if (!line || line === "straight" || !obj.templateLined) return obj.template || "";
  const linePath = lines.data[line];
  return obj.templateLined(linePath);
};

// a pattern's element id: its tincture string without the "#" of hex colours, which would break url(#id) links
/** @param {string} tincture */
export const patternId = tincture => tincture.replaceAll("#", "");

/** @param {string} tincture */
export const addPattern = tincture => {
  if (!browser) return;
  if (!tincture) return console.error("No patternId");
  const id = patternId(tincture);
  const elem = document.getElementById(id);

  const [pattern, t1, t2, size] = tincture.split("-");
  const charge = semy(tincture);
  if (charge) addCharge(charge);

  const patternName = /** @type {keyof typeof patterns} */ (charge ? "semy" : pattern);
  const html = patterns[patternName](id, clr(t1), clr(t2), getSizeMod(size), charge);
  if (elem?.outerHTML === html) return; // already added
  elem?.remove();
  document.getElementById("patterns")?.insertAdjacentHTML("beforeend", html);
};

/** @param {string} string */
function checkPattern(string) {
  if (string?.includes("-")) addPattern(string);
}

/** @param {string} string */
export function semy(string) {
  const isSemy = /^semy/.test(string);
  if (!isSemy) return false;
  return string.match(/semy_of_(.*?)-/)?.[1] || false;
}

/** @param {string} charge */
export function addCharge(charge) {
  charge.slice(0, 12) === "inescutcheon" ? addInescutcheon(charge) : fetchCharge(charge);
}

/** @param {string} charge */
function addInescutcheon(charge) {
  const shieldName = charge.length > 12 ? charge.slice(12, 13).toLowerCase() + charge.slice(13) : get(shield);
  const id = charge.length > 12 ? charge : "inescutcheon" + shieldName.charAt(0).toUpperCase() + shieldName.slice(1);

  if (loadedCharges[id]) return; // already added
  if (!browser) return;
  loadedCharges[id] = true;

  const licenseAttrs = ["noldor", "gondor", "easterling", "ironHills", "urukHai", "moriaOrc"].includes(shieldName)
    ? `author="Weta Workshop" source="www.wetanz.com" license="https://en.wikipedia.org/wiki/Fair_use"`
    : `author=Azgaar license="https://creativecommons.org/publicdomain/zero/1.0"`;
  const g = `<g id=${id} ${licenseAttrs}><path transform="translate(67 67) scale(.33)" d="${shields.data[shieldName].path}"/></g>`;
  document.getElementById("charges")?.insertAdjacentHTML("beforeend", g);
}

/** @param {string} charge */
function fetchCharge(charge) {
  if (loadedCharges[charge]) return; // already added
  if (!browser) return;
  loadedCharges[charge] = true;

  const customCharge = get(uploaded)[charge];
  if (customCharge) {
    document.getElementById("charges")?.insertAdjacentHTML("beforeend", sanitizeSvg(customCharge.content));
    return;
  }

  fetch("charges/" + charge + ".svg")
    .then(res => {
      if (res.ok) return res.text();
      else throw new Error(`Cannot fetch charge ${charge}`);
    })
    .then(text => {
      const el = document.createElement("html");
      el.innerHTML = text;
      const g = el.querySelector("g");
      if (!g) throw new Error(`Charge ${charge} has no SVG group`);
      const metadata = el.getElementsByTagName("metadata")[0];

      if (metadata) {
        const author = metadata.getAttribute("author");
        const source = metadata.getAttribute("source");
        const license = metadata.getAttribute("license");
        if (author) g.setAttribute("author", author);
        if (source) g.setAttribute("source", source);
        if (license) g.setAttribute("license", license);
      }

      document.getElementById("charges")?.insertAdjacentHTML("beforeend", g.outerHTML);
    })
    .catch(err => console.error(err.message));
}

/** @param {string} charge */
export function removeCharge(charge) {
  document.getElementById(charge)?.remove();
  delete loadedCharges[charge];
}

/** @param {string} charge */
export function updateCharge(charge) {
  removeCharge(charge);
  fetchCharge(charge);
}

/** @param {string} tincture */
function clr(tincture) {
  if (/^#[\da-f]{3,8}$/i.test(tincture)) return tincture; // an exact colour, as the API accepts
  const palette = get(colors);
  if (!palette[tincture]) throw new Error(`Tincture ${tincture} is not found`);
  return palette[tincture];
}

/** @param {string} [size] */
export function getSizeMod(size) {
  if (size === "small") return 0.8;
  if (size === "smaller") return 0.5;
  if (size === "smallest") return 0.25;
  if (size === "big") return 1.6;
  if (size === "bigger") return 2;
  return 1;
}

/** @param {number} number */
function round(number, precision = 3) {
  return Math.round(number * 10 ** precision) / 10 ** precision;
}

/** @param {string} string */
export function analyzePath(string) {
  // Line
  let match = string.match(/^M(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) L(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)$/);
  if (match) {
    const values = match.splice(1).map(x => Number(x));
    return {
      type: "line",
      points: [
        {index: 0, x: values[0], y: values[1]},
        {index: 1, x: values[2], y: values[3]}
      ]
    };
  }

  // Quadratic Bezier curve
  match = string.match(
    /^M(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) Q(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)$/
  );
  if (match) {
    const values = match.splice(1).map(x => Number(x));
    return {
      type: "curve",
      points: [
        {index: 0, x: values[0], y: values[1]},
        {index: 1, x: values[4], y: values[5]},
        {index: 2, x: values[2], y: values[3]}
      ]
    };
  }

  // Custom path
  return {
    type: "custom",
    points: []
  };
}

/** @param {string} type @param {{x: number, y: number}[]} points */
export function buildPath(type, points) {
  if (type === "line") return `M${round(points[0].x)} ${round(points[0].y)} L${round(points[1].x)} ${round(points[1].y)}`;
  if (type === "curve")
    return `M${round(points[0].x)} ${round(points[0].y)} Q${round(points[2].x)} ${round(points[2].y)} ${round(points[1].x)} ${round(points[1].y)}`;
  throw new Error(`Cannot build a ${type} path`);
}
