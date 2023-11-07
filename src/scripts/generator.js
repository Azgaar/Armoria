import {charges, divisions, lines, ordinaries, patternSize, positions} from "data/dataModel";
import {tinctures} from "data/stores";
import {get} from "svelte/store";
import {aleaPRNG} from "./alea";
import {P, rw} from "./utils";

export const createConfig = () => ({
  usedPattern: null,
  usedTinctures: [],
  tData: get(tinctures),
  divisioned: null,
  ordinary: null
});

// main generation routine
export const generate = function (providedSeed) {
  const seed = providedSeed || Math.floor(Math.random() * 1e9);
  Math.random = aleaPRNG(seed);

  const config = createConfig();
  const coa = {seed, t1: getTincture(config, "field")};

  const addCharge = P(config.usedPattern ? 0.5 : 0.93); // 80% for charge
  const linedOrdinary = (addCharge && P(0.3)) || P(0.5) ? rw(ordinaries.lined) : null;
  config.ordinary =
    (!addCharge && P(0.65)) || P(0.3) ? (linedOrdinary ? linedOrdinary : rw(ordinaries.straight)) : null; // 36% for ordinary

  const rareDivided = ["chief", "terrace", "chevron", "quarter", "flaunches"].includes(config.ordinary);
  config.divisioned = rareDivided
    ? P(0.03)
    : addCharge && config.ordinary
    ? P(0.03)
    : addCharge
    ? P(0.3)
    : config.ordinary
    ? P(0.7)
    : P(0.995); // 33% for division

  const division = config.divisioned ? rw(divisions.variants) : null;

  if (division) {
    const t = getTincture(config, "division", config.usedTinctures, P(0.98) ? coa.t1 : null);
    coa.division = {division, t};
    if (divisions[division])
      coa.division.line = config.usedPattern || (config.ordinary && P(0.7)) ? "straight" : rw(divisions[division]);
  }

  if (config.ordinary) {
    const t = getTincture(config, "charge", config.usedTinctures, coa.t1);
    coa.ordinaries = [{ordinary: config.ordinary, t}];
    if (linedOrdinary) coa.ordinaries[0].line = config.usedPattern || (division && P(0.7)) ? "straight" : rw(lines);
    if (
      division &&
      !addCharge &&
      !config.usedPattern &&
      P(0.5) &&
      config.ordinary !== "bordure" &&
      config.ordinary !== "orle"
    ) {
      if (P(0.8)) coa.ordinaries[0].divided = "counter";
      // 40%
      else if (P(0.6)) coa.ordinaries[0].divided = "field";
      // 6%
      else coa.ordinaries[0].divided = "division"; // 4%
    }
  }

  if (addCharge) {
    const charge = selectCharge(config.ordinary || config.divisioned ? charges.types : charges.single);
    const chargeData = charges.data[charge] || {};

    let p = "e";
    let t = "gules";

    const ordinaryData = ordinaries.data[config.ordinary];
    const tOrdinary = coa.ordinaries ? coa.ordinaries[0].t : null;

    if (ordinaryData?.positionsOn && P(0.8)) {
      // place charge over ordinary (use tincture of field type)
      p = rw(ordinaryData.positionsOn);
      t = !config.usedPattern && P(0.3) ? coa.t1 : getTincture(config, "charge", [], tOrdinary);
    } else if (ordinaryData?.positionsOff && P(0.95)) {
      // place charge out of ordinary (use tincture of ordinary type)
      p = rw(ordinaryData.positionsOff);
      t = !config.usedPattern && P(0.3) ? tOrdinary : getTincture(config, "charge", config.usedTinctures, coa.t1);
    } else if (positions.divisions[division]) {
      // place charge in fields made by division
      p = rw(positions.divisions[division]);
      t = getTincture(
        config,
        "charge",
        tOrdinary ? config.usedTinctures.concat(tOrdinary) : config.usedTinctures,
        coa.t1
      );
    } else if (chargeData.positions) {
      // place charge-suitable position
      p = rw(chargeData.positions);
      t = getTincture(config, "charge", config.usedTinctures, coa.t1);
    } else {
      // place in standard position (use new tincture)
      p = config.usedPattern ? "e" : charges.conventional[charge] ? rw(positions.conventional) : rw(positions.complex);
      t = getTincture(config, "charge", config.usedTinctures.concat(tOrdinary), coa.t1);
    }

    if (chargeData.natural && chargeData.natural !== t && chargeData.natural !== tOrdinary) t = chargeData.natural;

    const item = {charge: charge, t, p};
    const colors = chargeData.colors || 1;
    if (colors > 1) item.t2 = P(0.25) ? getTincture(config, "charge", config.usedTinctures, coa.t1) : t;
    if (colors > 2 && item.t2) item.t3 = P(0.5) ? getTincture(config, "charge", config.usedTinctures, coa.t1) : t;
    coa.charges = [item];

    if (p === "ABCDEFGHIKL" && P(0.95)) {
      // add central charge if charge is in bordure
      coa.charges[0].charge = rw(charges.conventional);
      const charge = selectCharge(charges.single);
      const t = getTincture(config, "charge", config.usedTinctures, coa.t1);
      coa.charges.push({charge, t, p: "e"});
    } else if (P(0.8) && charge === "inescutcheon") {
      // add charge to inescutcheon
      const charge = selectCharge(charges.types);
      const t2 = getTincture(config, "charge", [], t);
      coa.charges.push({charge, t: t2, p, size: 0.5});
    } else if (division && !config.ordinary) {
      const allowCounter = !config.usedPattern && (!coa.line || coa.line === "straight");

      // dimidiation: second charge at division basic positons
      if (P(0.3) && ["perPale", "perFess"].includes(division) && coa.line === "straight") {
        coa.charges[0].divided = "field";
        if (P(0.95)) {
          const p2 = p === "e" || P(0.5) ? "e" : rw(positions.divisions[division]);
          const charge = selectCharge(charges.single);
          const t = getTincture(config, "charge", config.usedTinctures, coa.division.t);
          coa.charges.push({charge, t, p: p2, divided: "division"});
        }
      } else if (allowCounter && P(0.4)) coa.charges[0].divided = "counter";
      // counterchanged, 40%
      else if (["perPale", "perFess", "perBend", "perBendSinister"].includes(division) && P(0.8)) {
        // place 2 charges in division standard positions
        const [p1, p2] =
          division === "perPale"
            ? ["p", "q"]
            : division === "perFess"
            ? ["k", "n"]
            : division === "perBend"
            ? ["l", "m"]
            : ["j", "o"]; // perBendSinister
        coa.charges[0].p = p1;

        const charge = selectCharge(charges.single);
        const t = getTincture(config, "charge", config.usedTinctures, coa.division.t);
        coa.charges.push({charge, t, p: p2});
      } else if (["perCross", "perSaltire"].includes(division) && P(0.5)) {
        // place 4 charges in division standard positions
        const [p1, p2, p3, p4] = division === "perCross" ? ["j", "l", "m", "o"] : ["b", "d", "f", "h"];
        coa.charges[0].p = p1;

        const c2 = selectCharge(charges.single);
        const t2 = getTincture(config, "charge", [], coa.division.t);

        const c3 = selectCharge(charges.single);
        const t3 = getTincture(config, "charge", [], coa.division.t);

        const c4 = selectCharge(charges.single);
        const t4 = getTincture(config, "charge", [], coa.t1);
        coa.charges.push({charge: c2, t: t2, p: p2}, {charge: c3, t: t3, p: p3}, {charge: c4, t: t4, p: p4});
      } else if (allowCounter && p.length > 1) coa.charges[0].divided = "counter"; // counterchanged, 40%
    }

    coa.charges.forEach(c => defineChargeAttributes(config, division, c));
  }

  return coa;
};

export const getSize = (p, o = null, d = null) => {
  if (p === "e" && (o === "bordure" || o === "orle")) return 1.1;
  if (p === "e") return 1.5;
  if (p === "jln" || p === "jlh") return 0.7;
  if (p === "abcpqh" || p === "ez" || p === "be") return 0.5;
  if (["a", "b", "c", "d", "f", "g", "h", "i", "bh", "df"].includes(p)) return 0.5;
  if (["j", "l", "m", "o", "jlmo"].includes(p) && d === "perCross") return 0.6;
  if (p.length > 10) return 0.18; // >10 (bordure)
  if (p.length > 7) return 0.3; // 8, 9, 10
  if (p.length > 4) return 0.4; // 5, 6, 7
  if (p.length > 2) return 0.5; // 3, 4
  return 0.7; // 1, 2
};

function defineChargeAttributes(config, division, c) {
  // define size
  c.size = (c.size || 1) * getSize(c.p, config.ordinary, division);

  // clean-up position
  c.p = [...new Set(c.p)].join("");

  // define orientation
  if (P(0.02) && charges.data[c.charge]?.sinister) c.sinister = 1;
  if (P(0.02) && charges.data[c.charge]?.reversed) c.reversed = 1;
}

function selectCharge(set) {
  const type = rw(set);
  return type === "inescutcheon" ? "inescutcheon" : rw(charges[type]);
}

function replaceTincture(config, tincture) {
  const type = getType(config, tincture);
  const typeTinctures = config.tData[type];

  const candidateTinctures = {...typeTinctures};
  delete candidateTinctures[tincture];

  const newTincture = rw(candidateTinctures, false);
  if (!newTincture) {
    console.warn(`Type ${type} has only one valid tincture. Cannot follow the Rule of Tincture`);
    return tincture;
  }

  return rw(candidateTinctures, false);
}

function getType(config, t) {
  const tincture = getBaseTincture(t);
  if (Object.keys(config.tData.metals).includes(tincture)) return "metals";
  if (Object.keys(config.tData.colours).includes(tincture)) return "colours";
  if (Object.keys(config.tData.stains).includes(tincture)) return "stains";
  throw new Error("Unknown tincture type", t);
}

function definePattern(config, patternName, element) {
  let t1 = null;
  let t2 = null;

  // apply standard tinctures
  if (P(0.5) && (patternName.includes("air") || patternName.includes("otent"))) {
    t1 = "argent";
    t2 = "azure";
  } else if (patternName === "ermine") {
    if (P(0.7)) {
      t1 = "argent";
      t2 = "sable";
    } else if (P(0.3)) {
      t1 = "sable";
      t2 = "argent";
    } else if (P(0.1)) {
      t1 = "or";
      t2 = "sable";
    } else if (P(0.1)) {
      t1 = "sable";
      t2 = "or";
    } else if (P(0.1)) {
      t1 = "gules";
      t2 = "argent";
    }
  } else if (patternName.includes("pappellony") || patternName === "scaly") {
    if (P(0.2)) {
      t1 = "gules";
      t2 = "or";
    } else if (P(0.2)) {
      t1 = "sable";
      t2 = "argent";
    } else if (P(0.2)) {
      t1 = "argent";
      t2 = "sable";
    } else if (P(0.2)) {
      t1 = "azure";
      t2 = "argent";
    }
  } else if (P(0.2) && patternName === "plumetty") {
    t1 = "gules";
    t2 = "or";
  } else if (patternName === "masoned") {
    if (P(0.3)) {
      t1 = "gules";
      t2 = "argent";
    } else if (P(0.3)) {
      t1 = "argent";
      t2 = "sable";
    } else if (P(0.1)) {
      t1 = "or";
      t2 = "sable";
    }
  } else if (patternName === "fretty" || patternName === "grillage" || patternName === "chainy") {
    if (P(0.35)) {
      t1 = "argent";
      t2 = "gules";
    } else if (P(0.1)) {
      t1 = "sable";
      t2 = "or";
    } else if (P(0.2)) {
      t1 = "gules";
      t2 = "argent";
    }
  } else if (patternName === "honeycombed") {
    if (P(0.4)) {
      t1 = "sable";
      t2 = "or";
    } else if (P(0.3)) {
      t1 = "or";
      t2 = "sable";
    }
  } else if (patternName === "semy") patternName += "_of_" + selectCharge(charges.semy);

  if (!t1 || !t2) {
    const startWithMetal = P(0.7);
    t1 = startWithMetal ? rw(config.tData.metals) : rw(config.tData.colours);
    t2 = startWithMetal ? rw(config.tData.colours) : rw(config.tData.metals);
  }

  // division should not be the same tincture as base field
  if (element === "division") {
    if (config.usedTinctures.includes(t1)) t1 = replaceTincture(config, t1);
    if (config.usedTinctures.includes(t2)) t2 = replaceTincture(config, t2);
  }

  config.usedTinctures.push(t1, t2);
  const size = rw(patternSize);
  const sizeString = size === "standard" ? "" : "-" + size;

  return `${patternName}-${t1}-${t2}${sizeString}`;
}

function getBaseTincture(tincture) {
  return tincture.includes("-") ? tincture.split("-")[1] : tincture;
}

function excludeTinctures(typeTinctures, usedTinctures) {
  const unusedTinctures = {...typeTinctures};
  usedTinctures.forEach(usedTincture => {
    delete unusedTinctures[usedTincture];
  });

  const isAnyUnused = Object.keys(unusedTinctures).length && Object.values(unusedTinctures).reduce((a, b) => a + b, 0);
  return isAnyUnused ? unusedTinctures : typeTinctures;
}

// select tincture: element type (field, division, charge), used field tinctures, field type to follow RoT
export function getTincture(config, element, fields = [], RoT) {
  let type = rw(config.tData[element]); // random type

  if (type === "patterns") {
    const patternName = rw(config.tData[type]);
    config.usedPattern = patternName;
    const tincture = definePattern(config, patternName, element);
    return tincture;
  }

  // follow Rule of Tinctures: metal should not be put on metal, nor colour on colour
  if (RoT) {
    const underlyingTincture = getBaseTincture(RoT);
    const underlyingType = getType(config, underlyingTincture);
    type = underlyingType === "metals" ? "colours" : "metals";
  }

  const typeTinctures = config.tData[type];
  const candidateTinctures = fields.length ? excludeTinctures(typeTinctures, fields) : typeTinctures;
  let tincture = rw(candidateTinctures, false);

  if (element !== "charge") config.usedTinctures.push(tincture); // add field tincture

  return tincture;
}
