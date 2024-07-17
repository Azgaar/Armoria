import {parse} from "node-html-parser";
import {readFileSync} from "fs";
import {shieldPaths, shieldPositions, shieldSize, shieldBox} from "$lib/data/shields";
import {lines, patterns, templates} from "$lib/data/templates";
import {getSizeMod, semy} from "$lib/scripts/getters";

const backlight = `<radialGradient id="backlight" cx="100%" cy="100%" r="150%">
  <stop stop-color="#fff" stop-opacity=".3" offset="0"/>
  <stop stop-color="#fff" stop-opacity=".15" offset=".25"/>
  <stop stop-color="#000" stop-opacity="0" offset="1"/>
</radialGradient>`;

export async function render(id, coa, size, colors) {
  const {division, ordinaries = [], charges = [], shield} = coa;
  logCOAdetails(coa, shield, division, ordinaries, charges);

  const ordinariesRegular = ordinaries.filter(o => !o.above);
  const ordinariesAboveCharges = ordinaries.filter(o => o.above);
  const shieldPath = shieldPaths[shield];
  const tDiv = division ? (division.t.includes("-") ? division.t.split("-")[1] : division.t) : null;
  const positions = shieldPositions[shield];
  const sizeModifier = shieldSize[shield] || 1;
  const viewBox = shieldBox[shield] || "0 0 200 200";

  const loadedCharges = await getCharges(coa, id, shieldPath);
  const loadedPatterns = getPatterns(coa, id);
  const shieldClip = `<clipPath id="${shield}_${id}"><path d="${shieldPath}"/></clipPath>`;
  const divisionClip = division
    ? `<clipPath id="divisionClip_${id}">${getTemplate(division.division, division.line)}</clipPath>`
    : "";
  const field = `<rect x="0" y="0" width="200" height="200" fill="${clr(coa.t1)}"/>`;
  const divisionGroup = division ? templateDivision() : "";
  const overlay = `<path d="${shieldPath}" fill="url(#backlight)" stroke="#333"/>`;

  return `<svg id="${id}" width="${size}" height="${size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>${shieldClip}${divisionClip}${loadedCharges}${loadedPatterns}${backlight}</defs>
      <g clip-path="url(#${shield}_${id})">${field}${divisionGroup}${templateAboveAll()}</g>
      ${overlay}</svg>`;

  function templateDivision() {
    let svg = "";

    // In field part
    for (const ordinary of ordinariesRegular) {
      if (ordinary.divided === "field") svg += templateOrdinary(ordinary, ordinary.t);
      else if (ordinary.divided === "counter") svg += templateOrdinary(ordinary, tDiv);
    }

    for (const charge of charges) {
      if (charge.divided === "field") svg += templateCharge(charge, charge.t);
      else if (charge.divided === "counter") svg += templateCharge(charge, tDiv);
    }

    for (const ordinary of ordinariesAboveCharges) {
      if (ordinary.divided === "field") svg += templateOrdinary(ordinary, ordinary.t);
      else if (ordinary.divided === "counter") svg += templateOrdinary(ordinary, tDiv);
    }

    // In division part
    svg += `<g clip-path="url(#divisionClip_${id})"><rect x="0" y="0" width="200" height="200" fill="${clr(
      division.t
    )}"/>`;

    for (const ordinary of ordinariesRegular) {
      if (ordinary.divided === "division") svg += templateOrdinary(ordinary, ordinary.t);
      else if (ordinary.divided === "counter") svg += templateOrdinary(ordinary, coa.t1);
    }

    for (const charge of charges) {
      if (charge.divided === "division") svg += templateCharge(charge, charge.t);
      else if (charge.divided === "counter") svg += templateCharge(charge, coa.t1);
    }

    for (const ordinary of ordinariesAboveCharges) {
      if (ordinary.divided === "division") svg += templateOrdinary(ordinary, ordinary.t);
      else if (ordinary.divided === "counter") svg += templateOrdinary(ordinary, coa.t1);
    }

    return (svg += `</g>`);
  }

  function templateAboveAll() {
    let svg = "";

    ordinariesRegular
      .filter(o => !o.divided)
      .forEach(ordinary => {
        svg += templateOrdinary(ordinary, ordinary.t);
      });

    charges
      .filter(o => !o.divided || !division)
      .forEach(charge => {
        svg += templateCharge(charge, charge.t, charge.t2, charge.t3);
      });

    ordinariesAboveCharges
      .filter(o => !o.divided)
      .forEach(ordinary => {
        svg += templateOrdinary(ordinary, ordinary.t);
      });

    return svg;
  }

  function templateOrdinary(ordinary, tincture) {
    const fill = clr(tincture);
    let svg = `<g fill="${fill}" stroke="none"${tr(transform(ordinary))}>`;
    if (ordinary.ordinary === "bordure")
      svg += `<path d="${shieldPath}" fill="none" stroke="${fill}" stroke-width="33.3"/>`;
    else if (ordinary.ordinary === "orle")
      svg += `<path d="${shieldPath}" fill="none" stroke="${fill}" stroke-width="10" transform="translate(15 15) scale(.85)"/>`;
    else svg += getTemplate(ordinary.ordinary, ordinary.line);
    return svg + "</g>";
  }

  function templateCharge(charge, tincture, secondaryTincture, tertiaryTincture) {
    const primary = clr(tincture);
    const secondary = clr(secondaryTincture || tincture);
    const tertiary = clr(tertiaryTincture || tincture);
    const stroke = charge.stroke || "#000";

    const chargePositions = [...new Set(charge.p)].filter(position => positions[position]);

    let svg = `<g fill="${primary}" stroke="${stroke}"${tr(transform(charge))}>`;
    svg += `<style>
      g.secondary,path.secondary {fill: ${secondary};}
      g.tertiary,path.tertiary {fill: ${tertiary};}
    </style>`;

    for (const p of chargePositions) {
      const transformAttr = tr(getElTransform(charge, p, sizeModifier, positions));
      svg += `<use xlink:href="#${charge.charge}_${id}"${transformAttr}/>`;
    }
    return svg + "</g>";
  }

  function getPatterns(coa, id) {
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
        if (charge) return patterns.semy(patternString, clr(t1), clr(t2), getSizeMod(size), charge + "_" + id);
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

async function getCharges(coa, id, shieldPath) {
  let charges = coa.charges ? coa.charges.map(charge => charge.charge) : []; // add charges
  if (semy(coa.t1)) charges.push(semy(coa.t1)); // add field semy charge
  if (semy(coa.division?.t)) charges.push(semy(coa.division.t)); // add division semy charge

  const uniqueCharges = [...new Set(charges)];
  const fetchedCharges = await Promise.all(
    uniqueCharges.map(async charge => {
      if (charge.slice(0, 12) === "inescutcheon") {
        const path =
          charge.length > 12 ? shieldPaths[charge.slice(12, 13).toLowerCase() + charge.slice(13)] : shieldPath;
        return `<g id="${charge}_${id}"><path transform="translate(66 66) scale(.34)" d="${path}"/></g>`;
      }

      const fetched = await fetchCharge(charge, id);
      return fetched || "";
    })
  );
  return fetchedCharges.join("");
}

async function fetchCharge(charge, id) {
  const text = readFileSync("static/charges/" + charge + ".svg", "utf8");
  const root = parse(text);
  const g = root.querySelector("g");
  g.setAttribute("id", charge + "_" + id);
  return g.outerHTML;
}

function getTemplate(template, line) {
  if (!line || line === "straight") return templates[template];
  const templateId = template + "Lined",
    linePath = lines[line];
  return templates[templateId](linePath);
}

function round(n) {
  return Math.round(n * 100) / 100;
}

function tr(value) {
  return value ? ` transform="${value}"` : "";
}

function getElTransform(c, p, sizeModifier, positions) {
  const s = round((c.size || 1) * sizeModifier);
  const sx = c.sinister ? -s : s;
  const sy = c.reversed ? -s : s;
  let [x, y] = positions[p];
  x = round(x - 100 * (sx - 1));
  y = round(y - 100 * (sy - 1));

  const translate = x || y ? `translate(${x} ${y})` : null;
  const scale = sx !== 1 || sy !== 1 ? (sx === sy ? `scale(${sx})` : `scale(${sx} ${sy})`) : null;
  return translate && scale ? `${translate} ${scale}` : translate ? translate : scale ? scale : null;
}

function transform(charge) {
  let {x = 0, y = 0, angle = 0, size = 1, p} = charge;
  if (p) size = 1; // size is defined on use element level

  if (size !== 1) {
    x = round(x + 100 - size * 100);
    y = round(y + 100 - size * 100);
  }

  let transform = "";
  if (x || y) transform += `translate(${x} ${y})`;
  if (angle) transform += ` rotate(${angle} ${size * 100} ${size * 100})`;
  if (size !== 1) transform += ` scale(${size})`;

  return transform ? transform.trim() : null;
}

function logCOAdetails(coa, shield, division, ordinaries, charges) {
  console.log("---------------");
  console.log("Field:", {t1: coa.t1, shield});
  if (division) console.log("Division:", division);
  if (ordinaries.length) ordinaries.forEach(ordinary => console.log("Ordinary:", ordinary));
  if (charges.length) charges.forEach(charge => console.log("Charge:", charge));
}
