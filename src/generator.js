import {get} from 'svelte/store';
import {rw, P} from './utils';
import {charges, divisions, lines, ordinaries, positions} from "./dataModel";
import {tinctures} from './stores';

// main generation routine
export const generate = function(seed = Math.floor(Math.random() * 1e9)) {
  Math.seedrandom(seed); // define Math.random()

  // reset parameters to default
  let usedPattern = null, usedTinctures = [];
  const tData = get(tinctures); // tinctures data

  const coa = {seed, t1: getTincture("field")};

  let charge = P(usedPattern ? .5 : .9) ? true : false; // 80% for charge
  const linedOrdinary = charge && P(.3) || P(.5) ? rw(ordinaries.lined) : null;
  const ordinary = !charge && P(.6) || P(.3) ? linedOrdinary ? linedOrdinary : rw(ordinaries.straight) : null; // 36% for ordinary
  const rareDivided = ["chief", "terrace", "chevron", "quarter", "flaunches"].includes(ordinary);
  const divisioned = rareDivided ? P(.03) : charge && ordinary ? P(.03) : charge ? P(.3) : ordinary ? P(.7) : P(.995); // 33% for division
  const division = divisioned ? rw(divisions.variants) : null;
  if (charge) charge = selectCharge();

  if (division) {
    const t = getTincture("division", usedTinctures, P(.98) ? coa.t1 : null);
    coa.division = {division, t};
    if (divisions[division]) coa.division.line = usedPattern || (ordinary && P(.7)) ? "straight" : rw(divisions[division]);
  }

  if (ordinary) {
    coa.ordinaries = [{ordinary, t: getTincture("charge", usedTinctures, coa.t1)}];
    if (linedOrdinary) coa.ordinaries[0].line = usedPattern || (division && P(.7)) ? "straight" : rw(lines);
    if (division && !charge && !usedPattern && P(.5) && ordinary !== "bordure" && ordinary !== "orle") {
      if (P(.8)) coa.ordinaries[0].divided = "counter"; // 40%
      else if (P(.6)) coa.ordinaries[0].divided = "field"; // 6%
      else coa.ordinaries[0].divided = "division"; // 4%
    }
  }

  if (charge) {
    let p = "e", t = "gules";
    const ordinaryT = coa.ordinaries ? coa.ordinaries[0].t : null;
    if (positions.ordinariesOn[ordinary] && P(.8)) {
      // place charge over ordinary (use tincture of field type)
      p = rw(positions.ordinariesOn[ordinary]);
      while (charges.natural[charge] === ordinaryT) charge = selectCharge();
      t = !usedPattern && P(.3) ? coa.t1 : getTincture("charge", [], ordinaryT);
    } else if (positions.ordinariesOff[ordinary] && P(.95)) {
      // place charge out of ordinary (use tincture of ordinary type)
      p = rw(positions.ordinariesOff[ordinary]);
      while (charges.natural[charge] === coa.t1) charge = selectCharge();
      t = !usedPattern && P(.3) ? ordinaryT : getTincture("charge", usedTinctures, coa.t1);
    } else if (positions.divisions[division]) {
      // place charge in fields made by division
      p = rw(positions.divisions[division]);
      while (charges.natural[charge] === coa.t1) charge = selectCharge();
      t = getTincture("charge", ordinaryT ? usedTinctures.concat(ordinaryT) : usedTinctures, coa.t1);
    } else if (positions[charge]) {
      // place charge-suitable position
      p = rw(positions[charge]);
      while (charges.natural[charge] === coa.t1) charge = selectCharge();
      t = getTincture("charge", usedTinctures, coa.t1);
    } else {
      // place in standard position (use new tincture)
      p = usedPattern ? "e" : charges.conventional[charge] ? rw(positions.conventional) : rw(positions.complex);
      while (charges.natural[charge] === coa.t1) charge = selectCharge();
      t = getTincture("charge", usedTinctures.concat(ordinaryT), coa.t1);
    }

    if (charges.natural[charge]) t = charges.natural[charge]; // natural tincture
    coa.charges = [{charge, t, p}];

    if (p === "ABCDEFGHIKL" && P(.95)) {
      // add central charge if charge is in bordure
      coa.charges[0].charge = rw(charges.conventional);
      const charge = selectCharge(charges.single);
      const t = getTincture("charge", usedTinctures, coa.t1);
      coa.charges.push({charge, t, p: "e"});
    } else if (P(.8) && charge === "inescutcheon") {
      // add charge to inescutcheon
      const charge = selectCharge(charges.types);
      const t2 = getTincture("charge", [], t);
      coa.charges.push({charge, t: t2, p, size:.5});
    } else if (division && !ordinary) {
      const allowCounter = !usedPattern && (!coa.line || coa.line === "straight");

      // dimidiation: second charge at division basic positons
      if (P(.3) && ["perPale", "perFess"].includes(division) && coa.line === "straight") {
        coa.charges[0].layer = "field";
        if (P(.95)) {
          const p2 = p === "e" || P(.5) ? "e" : rw(positions.divisions[division]);
          const charge = selectCharge(charges.single);
          const t = getTincture("charge", usedTinctures, coa.t3);
          coa.charges.push({charge, t, p: p2, layer: "division"});
        }
      }
      else if (allowCounter && P(.4)) coa.charges[0].layer = "counter"; // countercharged, 40%
      else if (["perPale", "perFess", "perBend", "perBendSinister"].includes(division)) { // place 2 charges in division standard positions
        const [p1, p2] = division === "perPale" ? ["pp", "qq"] :
                         division === "perFess" ? ["kk", "nn"] :
                         division === "perBend" ? ["ll", "mm"] :
                        ["jj", "oo"]; // perBendSinister
        coa.charges[0].p = p1;
        const charge = selectCharge(charges.single);
        const t = getTincture("charge", usedTinctures, coa.t3);
        coa.charges.push({charge, t, p: p2});
      }
      else if (allowCounter && p.length > 1) coa.charges[0].layer = "counter"; // countercharged, 40%
    }

    coa.charges.forEach(c => defineChargeAttributes(c));
    function defineChargeAttributes(c) {
      // define size
      c.size = (c.size || 1) * getSize(c.p, ordinary);

      // clean-up position
      c.p = [...new Set(c.p)].join("");

      // define orientation
      if (P(.05) && charges.sinister.includes(c.charge)) c.sinister = 1;
      if (P(.05) && charges.reversed.includes(c.charge)) c.reversed = 1;
    }
  }

  function selectCharge(set) {
    const type = set ? rw(set) : ordinary || divisioned ? rw(charges.types): rw(charges.single);
    return type === "inescutcheon" ? "inescutcheon" : rw(charges[type]);
  }

  // select tincture: element type (field, division, charge), used field tinctures, field type to follow RoT
  function getTincture(element, fields = [], RoT) {
    const base = RoT ? RoT.includes("-") ? RoT.split("-")[1] : RoT : null;

    let type = rw(tData[element]); // metals, colours, stains, patterns
    if (RoT && type !== "patterns") type = getType(base) === "metals" ? "colours" : "metals"; // follow RoT
    if (type === "metals" && fields.includes("or") && fields.includes("argent")) type = "colours"; // exclude metals overuse
    let tincture = rw(tData[type]);

    while (tincture === base || fields.includes(tincture)) {tincture = rw(tData[type]);} // follow RoT

    if (type !== "patterns" && element !== "charge") usedTinctures.push(tincture); // add field tincture

    if (type === "patterns") {
      usedPattern = tincture;
      tincture = definePattern(tincture, element);
    }

    return tincture;
  }

  function getType(t) {
    const tincture = t.includes("-") ? t.split("-")[1] : t;
    if (Object.keys(tData.metals).includes(tincture)) return "metals";
    if (Object.keys(tData.colours).includes(tincture)) return "colours";
    if (Object.keys(tData.stains).includes(tincture)) return "stains";
    debugger; // exception
  }

  function definePattern(pattern, element, size = "") {
    let t1 = null, t2 = null;
    if (P(.15)) size = "-small";
    else if (P(.05)) size = "-smaller";
    else if (P(.035)) size = "-big";
    else if (P(.001)) size = "-smallest";

    // apply standard tinctures
    if (P(.5) && ["vair", "vairInPale", "vairEnPointe"].includes(pattern)) {t1 = "azure"; t2 = "argent";}
    else if (P(.8) && pattern === "ermine") {t1 = "argent"; t2 = "sable";}
    else if (pattern === "pappellony") {
      if (P(.2)) {t1 = "gules"; t2 = "or";}
      else if (P(.2)) {t1 = "argent"; t2 = "sable";}
      else if (P(.2)) {t1 = "azure"; t2 = "argent";}
    }
    else if (pattern === "masoned") {
      if (P(.3)) {t1 = "gules"; t2 = "argent";}
      else if (P(.3)) {t1 = "argent"; t2 = "sable";}
      else if (P(.1)) {t1 = "or"; t2 = "sable";}
    }
    else if (pattern === "fretty") {
      if (t2 === "sable" || P(.35)) {t1 = "argent"; t2 = "gules";}
      else if (P(.25)) {t1 = "sable"; t2 = "or";}
      else if (P(.15)) {t1 = "gules"; t2 = "argent";}
    }
    else if (pattern === "semy") pattern += "_of_" + selectCharge(charges.semy);


    if (!t1 || !t2) {
      const startWithMetal = P(.7);
      t1 = startWithMetal ? rw(tData.metals) : rw(tData.colours);
      t2 = startWithMetal ? rw(tData.colours) : rw(tData.metals);
    }

    // division should not be the same tincture as base field
    if (element === "division") {
      if (usedTinctures.includes(t1)) t1 = replaceTincture(t1);
      if (usedTinctures.includes(t2)) t2 = replaceTincture(t2);
    }

    usedTinctures.push(t1, t2);
    return `${pattern}-${t1}-${t2}${size}`;
  }

  function replaceTincture(t, n) {
    const type = getType(t);
    while (!n || n === t) {n = rw(tData[type]);}
    return n;
  }

  return coa;
}

export const getSize = (p, o) => {
  if (p === "e" && (o === "bordure" || o === "orle")) return 1.1;
  if (p === "e") return 1.5;
  if (["p", "q", "pp", "qq", "pq", "kn", "n", "n", "kk", "nn", "oo", "jj"].includes(p)) return .7;
  if (p === "jln" || p === "jlh") return .7;
  if (p === "abcpqh") return .5;
  if (p.length > 10) return .18; // >10 (bordure)
  if (p.length > 7) return .3; // 8, 9, 10
  if (p.length > 4) return .4; // 5, 6, 7
  return .5; // 1, 2, 3, 4
}