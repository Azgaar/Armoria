import { get } from "svelte/store";
import { templates, lines, patterns } from "./../data/templates";
import { shieldPaths } from "./../data/shields";
import { colors, shield } from "./../data/stores";

const chargesGroup = document.getElementById("charges");
const colorsData = get(colors);
const loadedCharges = {};

export const getTemplate = (id, line) => {
  const linedId = id + "Lined";
  if (!line || line === "straight" || !templates[linedId]) return templates[id];
  const linePath = lines[line];
  return templates[linedId](linePath);
};

export const addPattern = (patternId) => {
  if (document.getElementById(patternId)) return; // already added;

  const [pattern, t1, t2, size] = patternId.split("-");
  const charge = semy(patternId);
  if (charge) addCharge(charge);

  const html = patterns[charge ? "semy" : pattern](
    patternId,
    clr(t1),
    clr(t2),
    getSizeMod(size),
    charge
  );
  document.getElementById("patterns").insertAdjacentHTML("beforeend", html);
};

function semy(string) {
  const isSemy = /^semy/.test(string);
  if (!isSemy) return false;
  return string.match(/semy_of_(.*?)-/)[1];
}

export function addCharge(charge) {
  charge.slice(0, 12) === "inescutcheon"
    ? addInescutcheon(charge)
    : fetchCharge(charge);
}

function addInescutcheon(charge) {
  const shieldName =
    charge.length > 12
      ? charge.slice(12, 13).toLowerCase() + charge.slice(13)
      : get(shield);
  const id =
    charge.length > 12
      ? charge
      : "inescutcheon" +
        shieldName.charAt(0).toUpperCase() +
        shieldName.slice(1);

  if (loadedCharges[id]) return; // already added
  loadedCharges[id] = true;

  const licenseAttrs = [
    "noldor",
    "gondor",
    "easterling",
    "ironHills",
    "urukHai",
    "moriaOrc",
  ].includes(shieldName)
    ? `author="Weta Workshop" source="www.wetanz.com" license="https://en.wikipedia.org/wiki/Fair_use"`
    : `author=Azgaar license="https://creativecommons.org/publicdomain/zero/1.0"`;
  const g = `<g id=${id} ${licenseAttrs}><path transform="translate(67 67) scale(.33)" d="${shieldPaths[shieldName]}"/></g>`;
  chargesGroup.insertAdjacentHTML("beforeend", g);
}

function fetchCharge(charge) {
  if (loadedCharges[charge]) return; // already added
  loadedCharges[charge] = true;

  fetch("charges/" + charge + ".svg")
    .then((res) => {
      if (res.ok) return res.text();
      else throw new Error("Cannot fetch charge");
    })
    .then((text) => {
      const el = document.createElement("html");
      el.innerHTML = text;
      const g = el.querySelector("g");
      const metadata = el.getElementsByTagName("metadata")[0];

      if (metadata) {
        const author = metadata.getAttribute("author");
        const source = metadata.getAttribute("source");
        const license = metadata.getAttribute("license");
        if (author) g.setAttribute("author", author);
        if (source) g.setAttribute("source", source);
        if (license) g.setAttribute("license", license);
      }

      chargesGroup.insertAdjacentHTML("beforeend", g.outerHTML);
    })
    .catch((err) => console.error(err));
}

function clr(tincture) {
  if (!colorsData[tincture])
    throw new error(`Tincture ${tincture} is not available in ${tincture}`);
  return colorsData[tincture];
}

function getSizeMod(size) {
  if (size === "small") return 0.8;
  if (size === "smaller") return 0.5;
  if (size === "smallest") return 0.25;
  if (size === "big") return 1.6;
  if (size === "bigger") return 2;
  return 1;
}
