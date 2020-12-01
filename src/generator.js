import {charges, divisions, lines, ordinaries, positions, tinctures} from "./dataModel.js";

// main generation routine
export const generate = function(seed = Math.floor(Math.random() * 1e9)) {
  Math.seedrandom(seed); // define Math.random()

  // reset parameters to default
  tinctures.f = [];
  tinctures.pattern = null;

  const coa = {seed, t1: getTincture("field")};

  let charge = P(tinctures.pattern ? .5 : .9) ? true : false; // 80% for charge
  const linedOrdinary = charge && P(.3) || P(.5) ? rw(ordinaries.lined) : null;
  const ordinary = !charge && P(.6) || P(.3) ? linedOrdinary ? linedOrdinary : rw(ordinaries.straight) : null; // 36% for ordinary
  const rareDivided = ["chief", "terrace", "chevron", "quarter", "flaunches"].includes(ordinary);
  const divisioned = rareDivided ? P(.03) : charge && ordinary ? P(.03) : charge ? P(.3) : ordinary ? P(.7) : P(.995); // 33% for division
  const division = divisioned ? rw(divisions.variants) : null;

  const selectCharge = () => charge = ordinary || divisioned ? rw(charges[rw(charges.types)]) : rw(charges[rw(charges.single)]);
  if (charge) selectCharge();

  if (division) {
    coa.division = division;
    coa.t3 = getTincture("division", tinctures.f, P(.98) ? coa.t1 : null);
    if (divisions[division]) coa.line = tinctures.pattern || (ordinary && P(.7)) ? "straight" : rw(divisions[division]);
  }

  if (ordinary) {
    coa.ordinary = {ordinary, t: getTincture("charge", tinctures.f, coa.t1)};
    if (linedOrdinary) coa.ordinary.line = tinctures.pattern || (division && P(.7)) ? "straight" : rw(lines);
    if (division && !charge && !tinctures.pattern && P(.5) && ordinary !== "bordure" && ordinary !== "orle") {
      if (P(.8)) coa.ordinary.counter = 1; // 40%
      else coa.ordinary.crop = 1; // 10%
    }
  }

  if (charge) {
    let p = "e", t = "gules", ordinaryT = coa.ordinary?.t;
    if (positions.ordinariesOn[ordinary] && P(.8)) {
      // place charge over ordinary (use tincture of field type)
      p = rw(positions.ordinariesOn[ordinary]);
      while (charges.natural[charge] === ordinaryT) selectCharge();
      t = !tinctures.pattern && P(.3) ? coa.t1 : getTincture("charge", [], ordinaryT, charge);
    } else if (positions.ordinariesOff[ordinary] && P(.95)) {
      // place charge out of ordinary (use tincture of ordinary type)
      p = rw(positions.ordinariesOff[ordinary]);
      while (charges.natural[charge] === coa.t1) selectCharge();
      t = !tinctures.pattern && P(.3) ? ordinaryT : getTincture("charge", tinctures.f, coa.t1, charge);
    } else if (positions.divisions[division]) {
      // place charge in fields made by division
      p = rw(positions.divisions[division]);
      while (charges.natural[charge] === coa.t1) selectCharge();
      t = getTincture("charge", ordinaryT ? tinctures.f.concat(ordinaryT) : tinctures.f, coa.t1, charge);
    } else if (positions[charge]) {
      // place charge-suitable position
      p = rw(positions[charge]);
      while (charges.natural[charge] === coa.t1) selectCharge();
      t = getTincture("charge", tinctures.f, coa.t1, charge);
    } else {
      // place in standard position (use new tincture)
      p = tinctures.pattern ? "e" : charges.conventional[charge] ? rw(positions.conventional) : rw(positions.complex);
      while (charges.natural[charge] === coa.t1) selectCharge();
      t = getTincture("charge", tinctures.f.concat(ordinaryT), coa.t1, charge);
    }

    if (charges.natural[charge]) t = charges.natural[charge]; // natural tincture
    coa.charges = [{charge, t, p}];

    if (p === "ABCDEFGHIKL" && P(.95)) {
      // add central charge if charge is in bordure
      coa.charges[0].charge = rw(charges.conventional);
      coa.charges.push({"charge":rw(charges[rw(charges.single)]), t:getTincture("charge", tinctures.f, coa.t1, charge), p:"e"});
    } else if (P(.8) && charge.slice(0,12) === "inescutcheon") {
      // add charge to inescutcheon
      coa.charges.push({"charge":rw(charges[rw(charges.types)]), t:getTincture("charge", [], t, charge), p, size:.5});
    } else if (division && !ordinary) {
      const allowCounter = !tinctures.pattern && (!coa.line || coa.line === "straight");

      // dimidiation: second charge at division basic positons
      if (P(.3) && ["perPale", "perFess"].includes(division) && coa.line === "straight") {
        coa.charges[0].type = "field";
        if (P(.95)) {
          const p2 = p === "e" || P(.5) ? "e" : rw(positions.divisions[division]);
          coa.charges.push({"charge":rw(charges[rw(charges.single)]), t:getTincture("charge", tinctures.f, coa.t3, charge), p: p2, type:"division"});
        }
      }
      else if (allowCounter && P(.4)) coa.charges[0].type = "counter"; // countercharged, 40%
      else if (["perPale", "perFess", "perBend", "perBendSinister"].includes(division)) { // place 2 charges in division standard positions
        const [p1, p2] = division === "perPale" ? ["pp", "qq"] :
                         division === "perFess" ? ["kk", "nn"] :
                         division === "perBend" ? ["ll", "mm"] :
                        ["jj", "oo"]; // perBendSinister
        coa.charges[0].p = p1;
        coa.charges.push({"charge":rw(charges[rw(charges.single)]), t:getTincture("charge", tinctures.f, coa.t3, charge), p: p2});
      }
      else if (allowCounter && p.length > 1) coa.charges[0].type = "counter"; // countercharged, 40%
    }

    coa.charges.forEach(c => defineChargeSize(c));
    function defineChargeSize(c) {
      let size = c.size || 1;
      if (c.p === "e" && (ordinary === "bordure" || ordinary === "orle")) size *= 1.1;
      else if (c.p === "e") size *= 1.5;
      else if (["pp", "qq", "kn", "kk", "nn", "oo", "jj"].includes(c.p)) size *= .7;
      else if (c.p === "jln" || c.p === "jlh") size *= .7;
      else if (c.p.length > 10) size *= .18; // >10 (bordure)
      else if (c.p.length > 7) size *= .3; // 8, 9, 10
      else if (c.p.length > 5) size *= .4; // 6, 7
      else if (c.p.length > 3) size *= .4; // 4 or 5
      else if (c.p.length > 1) size *= .5; // 2
      c.size = size;

    }
  }

  return coa;
}

// select tincture: element type (field, division, charge), all field tinctures, field type to follow RoT
function getTincture(element, fields = [], RoT, charge) {
  if (charge && tinctures[charge]) element = charge;
  const base = RoT ? RoT.includes("-") ? RoT.split("-")[1] : RoT : null;

  let type = rw(tinctures[element]);
  if (type !== "patterns" && base) type = getType(base) === "metals" ? "colours" : "metals";
  if (type === "metals" && fields.includes("or") && fields.includes("argent")) type = "colours";
  let tincture = rw(tinctures[type][element]);

  while (tincture === base || fields.includes(tincture)) {tincture = rw(tinctures[type][element]);}

  if (type !== "patterns" && element !== "charge") tinctures.f.push(tincture); // add field tincture

  if (type === "patterns") {
    tinctures.pattern = tincture;
    tincture = definePattern(tincture, element);
  }

  return tincture;
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
  else if (pattern === "semy") pattern += "_of_" + rw(charges[rw(charges.semy)]);

  if (!t1 || !t2) {
    const startWithMetal = P(.7);
    t1 = startWithMetal ? rw(tinctures.metals[element]) : rw(tinctures.colours[element]);
    t2 = startWithMetal ? rw(tinctures.colours[element]) : rw(tinctures.metals[element]);
  }

  // division should not be the same tincture as base field
  if (element === "division") {
    if (tinctures.f.includes(t1)) t1 = replaceTincture(t1);
    if (tinctures.f.includes(t2)) t2 = replaceTincture(t2);
  }

  tinctures.f.push(t1, t2);
  return `${pattern}-${t1}-${t2}${size}`;
}

function replaceTincture(t, n) {
  if (t === "or") return "argent";
  if (t === "argent") return "or";

  const type = getType(t);
  while (!n || n === t) {n = rw(tinctures[type].division);}
  return n;
}

function getType(t) {
  const tincture = t.includes("-") ? t.split("-")[1] : t;
  if (tincture === "argent" || tincture === "or") return "metals";
  return "colours";
}

// UTILS
// return random value from weighted array {"key1":weight1, "key2":weight2}
export function rw(object) {
  const array = [];
  for (const key in object) {
    for (let i=0; i < object[key]; i++) {
      array.push(key);
    }
  };
  return array[Math.floor(Math.random() * array.length)];
}

// probability shorthand
function P(probability) {
  return Math.random() < probability;
}