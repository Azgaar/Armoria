import {get} from "svelte/store";
import {aleaPRNG} from "./alea";
import {rw, P} from "./utils";
import {charges, divisions, lines, ordinaries, positions, patternSize} from "../data/dataModel";
import {tinctures} from "../data/stores";

const createConfig = function() {
  return {
    usedPattern: null,
    usedTinctures: [],
    tData: get(tinctures),
    divisioned: null,
    ordinary: null
  };
};

// main generation routine
export const generate = function(seed = Math.floor(Math.random() * 1e9)) {
  Math.random = aleaPRNG(seed);

  const config = createConfig();
  const coa = {seed, t1: getTincture(config, "field")};

  let charge = P(config.usedPattern ? .5 : .93) ? true : false; // 80% for charge
  const linedOrdinary = (charge && P(.3)) || P(.5) ? rw(ordinaries.lined) : null;
  config.ordinary = (!charge && P(.65)) || P(.3) ? (linedOrdinary ? linedOrdinary : rw(ordinaries.straight)) : null; // 36% for ordinary

  const rareDivided = ["chief", "terrace", "chevron", "quarter", "flaunches"].includes(config.ordinary);
  config.divisioned = rareDivided ? P(.03) : charge && config.ordinary ? P(.03) : charge ? P(.3) : config.ordinary ? P(.7) : P(.995); // 33% for division
  const division = config.divisioned ? rw(divisions.variants) : null;

  if (division) {
    const t = getTincture(config, "division", config.usedTinctures, P(.98) ? coa.t1 : null);
    coa.division = {division, t};
    if (divisions[division]) coa.division.line = config.usedPattern || (config.ordinary && P(0.7)) ? "straight" : rw(divisions[division]);
  }

  if (config.ordinary) {
    coa.ordinaries = [{ordinary: config.ordinary, t: getTincture(config, "charge", config.usedTinctures, coa.t1)}];
    if (linedOrdinary) coa.ordinaries[0].line = config.usedPattern || (division && P(.7)) ? "straight" : rw(lines);
    if (division && !charge && !config.usedPattern && P(.5) && config.ordinary !== "bordure" && config.ordinary !== "orle") {
      if (P(.8)) coa.ordinaries[0].divided = "counter"; // 40%
      else if (P(.6)) coa.ordinaries[0].divided = "field"; // 6%
      else coa.ordinaries[0].divided = "division"; // 4%
    }
  }

  if (charge) {
    charge = selectCharge(config);

    let p = "e", t = "gules";

    const ordinaryT = coa.ordinaries ? coa.ordinaries[0].t : null;
    if (positions.ordinariesOn[config.ordinary] && P(.8)) {
      // place charge over config.ordinary (use tincture of field type)
      p = rw(positions.ordinariesOn[config.ordinary]);
      while (charges.natural[charge] === ordinaryT) charge = selectCharge(config);
      t = !config.usedPattern && P(.3) ? coa.t1 : getTincture(config, "charge", [], ordinaryT);
    } else if (positions.ordinariesOff[config.ordinary] && P(.95)) {
      // place charge out of config.ordinary (use tincture of ordinary type)
      p = rw(positions.ordinariesOff[config.ordinary]);
      while (charges.natural[charge] === coa.t1) charge = selectCharge(config);
      t = !config.usedPattern && P(.3) ? ordinaryT : getTincture(config, "charge", config.usedTinctures, coa.t1);
    } else if (positions.divisions[division]) {
      // place charge in fields made by division
      p = rw(positions.divisions[division]);
      while (charges.natural[charge] === coa.t1) charge = selectCharge(config);
      t = getTincture(config, "charge", ordinaryT ? config.usedTinctures.concat(ordinaryT) : config.usedTinctures, coa.t1);
    } else if (positions[charge]) {
      // place charge-suitable position
      p = rw(positions[charge]);
      while (charges.natural[charge] === coa.t1) charge = selectCharge(config);
      t = getTincture(config, "charge", config.usedTinctures, coa.t1);
    } else {
      // place in standard position (use new tincture)
      p = config.usedPattern ? "e" : charges.conventional[charge] ? rw(positions.conventional) : rw(positions.complex);
      while (charges.natural[charge] === coa.t1) charge = selectCharge(config);
      t = getTincture(config, "charge", config.usedTinctures.concat(ordinaryT), coa.t1);
    }

    if (charges.natural[charge]) t = charges.natural[charge]; // natural tincture
    coa.charges = [{charge, t, p}];

    if (p === "ABCDEFGHIKL" && P(.95)) {
      // add central charge if charge is in bordure
      coa.charges[0].charge = rw(charges.conventional);
      const charge = selectCharge(charges.single);
      const t = getTincture(config, "charge", config.usedTinctures, coa.t1);
      coa.charges.push({charge, t, p: "e"});
    } else if (P(.8) && charge === "inescutcheon") {
      // add charge to inescutcheon
      const charge = selectCharge(charges.types);
      const t2 = getTincture(config, "charge", [], t);
      coa.charges.push({charge, t: t2, p, size: .5});
    } else if (division && !config.ordinary) {
      const allowCounter = !config.usedPattern && (!coa.line || coa.line === "straight");

      // dimidiation: second charge at division basic positons
      if (P(.3) && ["perPale", "perFess"].includes(division) && coa.line === "straight") {
        coa.charges[0].divided = "field";
        if (P(.95)) {
          const p2 = p === "e" || P(.5) ? "e" : rw(positions.divisions[division]);
          const charge = selectCharge(charges.single);
          const t = getTincture(config, "charge", config.usedTinctures, coa.division.t);
          coa.charges.push({charge, t, p: p2, divided: "division"});
        }
      } else if (allowCounter && P(0.4)) coa.charges[0].divided = "counter";
      // counterchanged, 40%
      else if (["perPale", "perFess", "perBend", "perBendSinister"].includes(division) && P(0.8)) {
        // place 2 charges in division standard positions
        const [p1, p2] = division === "perPale" ? ["p", "q"] : division === "perFess" ? ["k", "n"] : division === "perBend" ? ["l", "m"] : ["j", "o"]; // perBendSinister
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
  if (P(0.02) && charges.sinister.includes(c.charge)) c.sinister = 1;
  if (P(0.02) && charges.reversed.includes(c.charge)) c.reversed = 1;
}

function selectCharge(config, set) {
  const type = set ? rw(set) : config.ordinary || config.divisioned ? rw(charges.types) : rw(charges.single);
  return type === "inescutcheon" ? "inescutcheon" : rw(charges[type]);
}

function replaceTincture(config, t, n) {
  const type = getType(config, t);
  while (!n || n === t) {
    n = rw(config.tData[type]);
  }
  return n;
}

function getType(config, t) {
  const tincture = t.includes("-") ? t.split("-")[1] : t;
  if (Object.keys(config.tData.metals).includes(tincture)) return "metals";
  if (Object.keys(config.tData.colours).includes(tincture)) return "colours";
  if (Object.keys(config.tData.stains).includes(tincture)) return "stains";
  debugger; // exception
}

function definePattern(config, pattern, element) {
  let t1 = null, t2 = null;

  // apply standard tinctures
  if (P(.5) && (pattern.includes("air") || pattern.includes("otent"))) {
    t1 = "argent";
    t2 = "azure";
  } else if (pattern === "ermine") {
    if (P(.7)) {
      t1 = "argent";
      t2 = "sable";
    } else if (P(.3)) {
      t1 = "sable";
      t2 = "argent";
    } else if (P(.1)) {
      t1 = "or";
      t2 = "sable";
    } else if (P(.1)) {
      t1 = "sable";
      t2 = "or";
    } else if (P(.1)) {
      t1 = "gules";
      t2 = "argent";
    }
  } else if (pattern.includes("pappellony") || pattern === "scaly") {
    if (P(.2)) {
      t1 = "gules";
      t2 = "or";
    } else if (P(.2)) {
      t1 = "sable";
      t2 = "argent";
    } else if (P(.2)) {
      t1 = "argent";
      t2 = "sable";
    } else if (P(.2)) {
      t1 = "azure";
      t2 = "argent";
    }
  } else if (P(.2) && pattern === "plumetty") {
    t1 = "gules";
    t2 = "or";
  } else if (pattern === "masoned") {
    if (P(.3)) {
      t1 = "gules";
      t2 = "argent";
    } else if (P(.3)) {
      t1 = "argent";
      t2 = "sable";
    } else if (P(.1)) {
      t1 = "or";
      t2 = "sable";
    }
  } else if (pattern === "fretty" || pattern === "grillage" || pattern === "chainy") {
    if (P(.35)) {
      t1 = "argent";
      t2 = "gules";
    } else if (P(.1)) {
      t1 = "sable";
      t2 = "or";
    } else if (P(.2)) {
      t1 = "gules";
      t2 = "argent";
    }
  } else if (pattern === "honeycombed") {
    if (P(.4)) {
      t1 = "sable";
      t2 = "or";
    } else if (P(.3)) {
      t1 = "or";
      t2 = "sable";
    }
  } else if (pattern === "semy") pattern += "_of_" + selectCharge(charges.semy);

  if (!t1 || !t2) {
    const startWithMetal = P(.7);
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

  return `${pattern}-${t1}-${t2}${sizeString}`;
}

// select tincture: element type (field, division, charge), used field tinctures, field type to follow RoT
function getTincture(config, element, fields = [], RoT) {
  const base = RoT ? (RoT.includes("-") ? RoT.split("-")[1] : RoT) : null;

  let type = rw(config.tData[element]); // metals, colours, stains, patterns
  if (RoT && type !== "patterns") type = getType(config, base) === "metals" ? "colours" : "metals"; // follow RoT
  if (type === "metals" && fields.includes("or") && fields.includes("argent")) type = "colours"; // exclude metals overuse
  let tincture = rw(config.tData[type]);

  while (tincture === base || fields.includes(tincture)) {
    tincture = rw(config.tData[type]);
  } // follow RoT

  if (type !== "patterns" && element !== "charge") config.usedTinctures.push(tincture); // add field tincture

  if (type === "patterns") {
    config.usedPattern = tincture;
    tincture = definePattern(config, tincture, element);
  }

  return tincture;
}
