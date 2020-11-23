(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Armoria = factory());
}(this, (function () {'use strict';

const defs = document.getElementById("defs").getElementsByTagName("defs")[0];

const tinctures = {
  field: {metals:5, colours:7, patterns:2},
  division: {metals:5, colours:7, patterns:1},
  charge: {metals:2, colours:3},
  metals: {
    field: {argent:3, or:2},
    division: {argent:3, or:2},
    charge: {argent:1, or:2}
  },
  colours: {
    field: {gules:5, sable:3, azure:4, vert:2, purpure:3},
    division: {gules:5, sable:3, azure:4, vert:2, purpure:3},
    charge: {gules:7, sable:1, azure:5, vert:3, purpure:2}
  },
  patterns: { // patterns including furs
    field: {semy:1, vair:2, vairInPale:1, vairEnPointe:2, ermine:2, chequy:4, lozengy:2, fusily:1, pally: 4, barry: 4, gemelles:1, bendy:3, bendySinister:2, palyBendy:1, pappellony:2, masoned:3, fretty:2},
    division: {semy:1, vair:3, vairInPale:2, vairEnPointe:3, ermine:4, chequy:3, lozengy:1, fusily:1,
    pally: 5, barry: 5, bendy:2, bendySinister:1, pappellony:1, masoned:3, fretty:1}
  }
};

const shields = {
  // shieldSpecific position: [x, y] (relative to center)
  heater:     {a:[-43.75, -50], b:[0, -50], c:[43.75, -50],
               d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
               g:[-32.25, 37.5], h:[0, 50], i:[32.25, 37.5],
               y:[-50, -50], z:[0, 62.5],
               j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
               m:[-32.5, 32.5], n:[0, 42.5], o:[32.5, 32.5],
               p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
               A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
               E:[66.2, -20], F:[55.5, 26], G:[33, 62], H:[0, 89.5],
               I:[-66.2, -20], K:[-55.5, 26], L:[-33, 62]},
  oldFrench:  {a:[-43.75, -50], b:[0, -50], c:[43.75, -50],
               d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
               g:[-37.5, 50], h:[0, 50], i:[37.5, 50],
               y:[-50, -50], z:[0, 62.5],
               j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
               m:[-37.5, 37.5], n:[0, 45], o:[37.5, 37.5],
               p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
               A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
               E:[66.2, -20], F:[64, 26], G:[45, 62], H:[0, 91.5],
               I:[-66.2, -20], K:[-64, 26], L:[-45, 62]},
  spanish:    {a:[-43.75, -50], b:[0, -50], c:[43.75, -50],
               d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
               g:[-43.75, 50], h:[0, 50], i:[43.75, 50],
               y:[-50, -50], z:[0, 50],
               j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
               m:[-37.5, 37.5], n:[0, 50], o:[37.5, 37.5],
               p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
               A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
               E:[66.4, -20], F:[66.4, 26], G:[49, 70], H:[0, 92],
               I:[-66.4, -20], K:[-66.4, 26], L:[-49, 70]},
  wedged:     {a:[-43.75, -50], b:[0, -50], c:[43.75, -50], // copy of heater
              d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
              g:[-32.25, 37.5], h:[0, 50], i:[32.25, 37.5],
              y:[-50, -50], z:[0, 62.5],
              j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
              m:[-32.5, 32.5], n:[0, 42.5], o:[32.5, 32.5],
              p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
              A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
              E:[66.2, -20], F:[55.5, 26], G:[33, 62], H:[0, 89.5],
              I:[-66.2, -20], K:[-55.5, 26], L:[-33, 62]},
};

const positions = {
  conventional: {e:20, abcdefgzi:3, beh:3, behdf:2, acegi:1, kn:3, bhdf:1, jei:1, abc:3, jln:8, jlh:4, jleh:1, def:3, abcpqh:4, ABCDEFGHIKL:1},
  complex: {e:40, beh:1, kn:1, jei:1, abc:2, jln:8, jlh:2, def:1, abcpqh:1},
  divisions: {
    perPale: {e:15, pq:5, jo:2, jl:2, ABCDEFGHIKL:1},
    perFess: {e:12, kn:4, jkl:2, gizgiz:1, jlh:3, kmo:1, ABCDEFGHIKL:1},
    perBend: {e:5, lm:5, bcfdgh:1},
    perBendSinister: {e:1, jo:1},
    perCross: {e:4, jlmo:1, jj:1, jo:2, jl:1},
    perChevron: {e:1, jlh:1, dfk:1, dfkh:2, bdefh:1},
    perChevronReversed: {e:1, mok:2, dfh:2, dfkh:1, bdefh:1},
    // perChevronReversed: {e:1, mo:2, dfh:2},
    perSaltire: {bhdf:8, e:3, abcdefgzi:1, bh:1, df:1, beh:1, behdf:1, ABCDEFGHIKL:1},
    perPile: {ee:3, be:2, abceh:1, abcabc:1, jleh:1}
  },
  ordinariesOn: {
    pale: {ee:12, beh:10, kn:3, bb:1},
    fess: {ee:1, def:3},
    bar: {defdefdef:1},
    fessCotissed: {ee:1, def:3},
    fessDoubleCotissed: {ee:1, defdef:3},
    bend: {ee:2, jo:1, joe:1},
    bendSinister: {ee:1, lm:1, lem:4},
    bendlet: {joejoejoe:1},
    bendletSinister: {lemlemlem:1},
    bordure: {ABCDEFGHIKL:1},
    chief: {abc:5, bb:1},
    quarter: {jjj:1},
    canton: {yyyy:1},
    cross: {eeee:1, behdfbehdf:3, behbehbeh:2},
    crossParted: {e:5, ee:1},
    saltire: {ee:5, jlemo:1},
    saltireParted: {e:5, ee:1},
    pall: {ee:1, acez:5, jlhh:3},
    pallReversed: {ee:1, bemo:5},
    pile: {bb:1},
    pileInBend: {eeee:1, eeoo:1},
    pileInBendSinister: {eeee:1, eemm:1}
  },
  ordinariesOff: {
    pale: {yy:1},
    fess: {abc:3, abcz:1},
    bar: {abc:2, abcgzi:1, jlh:5, bgi:2, ach:1},
    gemelle: {abc:1},
    bend: {cg:2, cc:1},
    bendSinister: {ai:2, aa:1},
    bendlet: {cg:2, cc:1},
    bendletSinister: {ai:2, aa:1},
    bordure: {e:3, kerker:1, peqpeq:1},
    orle: {e:3, kerker:1, peqpeq:1},
    chief: {emo:2, emoz:1, ez:2},
    terrace: {e:5, def:1, bdf:3},
    mount: {e:5, def:1, bdf:3},
    point: {e:2, def:1, bdf:3, acbdef:1},
    flaunches: {e:3, kn:1, beh:3},
    qyron: {bh:1},
    quarter: {e:1},
    canton: {e:5, beh:1, def:1, bdefh:1, kn:1},
    cross: {acgi:1},
    pall: {BCKFEILGbdmfo:1},
    pallReversed: {aczac:1},
    chevron: {ach:3, hh:1},
    chevronReversed: {bb:1},
    pile: {acdfgi:1, acac:1},
    pileInBend: {cg:1},
    pileInBendSinister: {ai:1},
    label: {defgzi:2, eh:3, defdefhmo:1, egiegi:1, pqn:5}
  },
  // charges
  inescutcheon: {e:3, jln:1},
  mascle: {e:15, abcdefgzi:3, beh:3, bdefh:4, acegi:1, kn:3, joe:2, abc:3, jlh:8, jleh:1, df:3, abcpqh:4, pqe:3, eknpq:3},
  lionRampant: {e:10, def:2, abc:2, bdefh:1, kn:1, jlh:2, abcpqh:1},
  lionPassant:{e:10, def:1, abc:1, bdefh:1, jlh:1, abcpqh:1},
  wolfPassant:{e:10, def:1, abc:1, bdefh:1, jlh:1, abcpqh:1},
  greyhoundСourant:{e:10, def:1, abc:1, bdefh:1, jlh:1, abcpqh:1},
  griffinRampant: {e:10, def:2, abc:2, bdefh:1, kn:1, jlh:2, abcpqh:1},
  griffinPassant:{e:10, def:1, abc:1, bdefh:1, jlh:1, abcpqh:1},
  boarRampant:{e:12, beh:1, kn:1, jln:2},
  eagle:{e:15, beh:1, kn:1, abc:1, jlh:2, def:2, pq:1},
  raven:{e:15, beh:1, kn:1, jei:1, abc:3, jln:3, def:1},
  wyvern:{e:10, jln:1},
  garb: {e:1, def:3, abc:2, beh:1, kn:1, jln:3, jleh:1, abcpqh:1, joe:1, lme:1},
  crown: {e:10, abcdefgzi:1, beh:3, behdf:2, acegi:1, kn:1, pq:2, abc:1, jln:4, jleh:1, def:2, abcpqh:3},
  hand:{e:10, jln:2, kn:1, jei:1, abc:2, pqe:1}
};

const lines = {straight:40, wavy:8, engrailed:4, invecked:3, rayonne:3, embattled:1, raguly:1, urdy:1, dancetty:1, indented:2,
  dentilly:1, bevilled:1, angled:1, flechy:1, barby:1, enclavy:1, escartely:1, arched:2, archedReversed:1, nowy:1, nowyReversed:1,
  embattledGhibellin:1, embattledNotched:1, embattledGrady:1, dovetailedIntented:1, dovetailed:1,
  potenty:1, potentyDexter:1, potentySinister:1, nebuly:2, seaWaves:1, dragonTeeth:1, firTrees:1};

const divisions = {
  variants: {perPale:5, perFess:5, perBend:2, perBendSinister:1, perChevron:1, perChevronReversed:1, perCross:5, perPile:1, perSaltire:1, gyronny:1, chevronny:1},
  perPale: lines,
  perFess: lines,
  perBend: lines,
  perBendSinister: lines,
  perChevron: lines,
  perChevronReversed: lines,
  perCross: {straight:20, wavy:5, engrailed:4, invecked:3, rayonne:1, embattled:1, raguly:1, urdy:1, indented:2, dentilly:1, bevilled:1, angled:1, embattledGhibellin:1, embattledGrady:1, dovetailedIntented:1, dovetailed:1, potenty:1, potentyDexter:1, potentySinister:1, nebuly:1},
  perPile: lines
};

const ordinaries = {
  lined: {pale:7, fess:5, bend:3, bendSinister:2, chief:5, bar:2, gemelle:1, fessCotissed:1, fessDoubleCotissed:1,
    bendlet:2, bendletSinister:1, terrace:3, cross:6, crossParted:1, saltire:2, saltireParted:1},
  straight: {bordure:7, orle:3, mount:1, point:2, flaunches:1, gore:1,
    qyron:1, quarter:1, canton:2, pall:3, pallReversed:2, chevron:4, chevronReversed:3,
    pile:2, pileInBend:2, pileInBendSinister:1, piles:1, pilesInPoint:2, label:1}
};

const charges = {
  types: {conventional:30, plants:1, animals:3, birds:2, aquatic:1, fantastic:3, agriculture:1, arms:1, bodyparts:1, miscellaneous:3},
  single: {conventional:12, plants:2, animals:11, birds:4, aquatic:2, fantastic:7, agriculture:1, arms:5, bodyparts:1, miscellaneous:8},
  semy: {lozenge:2, fusil:4, mascle:4, rustre:2, lozengeFaceted:1, lozengePloye:1, roundel:2, annulet:1,
    mullet:4, mulletPierced:1, mulletFaceted:1, mullet4:2, mullet6:3,
    mullet6Pierced:1, mullet6Faceted:1, mullet7:1, mullet8:1, mullet10:1, estoile:1, sun:1, fleurDeLis:5, crescent:2,
    delf: 1, billet:6, triangle:3, trianglePierced:1, goutte:5, heart:5, pique:1, trefle:1, сarreau:1, cross:7},
  conventional: {lozenge:2, fusil:4, mascle:4, rustre:2, lozengeFaceted:3, lozengePloye:1, roundel:7, annulet:4,
    mullet:5, mulletPierced:1, mulletFaceted:1, mullet4:3, mullet6:4,
    mullet6Pierced:1, mullet6Faceted:1, mullet7:1, mullet8:1, mullet10:1, estoile:1, sun:3,
    inescutcheon:7, billet:5, triangle:3, trianglePierced:1, goutte:4, heart:4, pique:2, trefle:2, сarreau:1,
    fleurDeLis:6, sunInSplendour:1, crescent:5, fountain:1, compassRose:1, cross:12, fountain:1},
  inescutcheon: {heater:2, oldFrench:1, spanish:4},
  cross: {hummetty:15, voided:1, pattee:3, potent:2, clechy:3, crosslet:1, bottony:1, fleury:3, patonce:1, pommy:1, gamma:1, arrowed:1,
    fitchy:1, cercelee:1, moline:2, fourchy:1, avellane:1, erminee:1, maltese:3, celtic:1, occitan:1, saltire:3, tau:1},
  animals:{lionRampant:4, lionPassant:1, wolfPassant:1, greyhoundСourant:1, boarRampant:1, horseRampant:1, horseSalient:1, bullPassant:1, bullHeadCaboshed:1, deerHeadCaboshed:1},
  fantastic:{dragonPassant:3, wyvern:2, griffinPassant:1, griffinRampant:1, eagleTwoHeards:2, unicornRampant:1, pegasus:1, serpent:1},
  birds:{eagle:9, raven:2, cock:3, parrot:1, swan:2, swanErased:1, heron:1},
  plants:{cinquefoil:1, rose:1},
  aquatic:{escallop:5, pike:1, cancer:1},
  agriculture: {garb:1},
  arms:{sword:5, hatchet:2, lochaberAxe:1, mallet:1},
  bodyparts:{hand:1},
  miscellaneous:{crown:3, key:1, buckle:1, bugleHorn:1, horseshoe:3, stagsAttires:1, cowHorns:2, wing:1, wingSword:1, lute:1, harp:1, wheel:2, boat:1},
  natural: {fountain:"azure", garb:"or", raven:"sable"} // charges to use predefined colours
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
  else if (pattern === "semy") {
    let charge = rw(charges.semy);
    if (charges[charge]) charge = charge + capitalize(rw(charges[charge]));
    pattern += "_of_"+charge;
  }

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

// get color or link to pattern
function clr(tincture) {
  if (options.colors[tincture]) return options.colors[tincture];
  const pattern = document.getElementById(tincture);
  if (!pattern) renderPattern(tincture);
  return "url(#"+tincture+")";
}

function renderPattern(tincture) {
  const [pattern, t1, t2, size] = tincture.split("-");
  const semy = pattern.slice(0, 4) === "semy";

  const template = document.getElementById(semy ? "semy" : pattern);
  let html = template.innerHTML.replace(/{id}/, tincture);

  const width = template.querySelector("pattern").getAttribute("width");
  const height = template.querySelector("pattern").getAttribute("height");

  if (t1) html = html.replace(/{c1}/g, clr(t1));
  if (t2) html = html.replace(/{c2}/g, clr(t2));

  defs.insertAdjacentHTML("beforeend", html);

  if (semy) {
    const charge = pattern.split("_of_")[1];
    const el = document.getElementById(tincture);

    if (document.querySelector("#charges > #"+charge)) {
      const inner = document.querySelector("#charges > #"+charge).innerHTML;
      el.innerHTML = el.innerHTML.replace(/<charge>/g, inner);
    } else {
      fetch("charges/"+charge+".svg").then(response => response.text()).then(text => {
        const html = document.createElement("html");
        html.innerHTML = text;
        el.innerHTML = el.innerHTML.replace(/<charge>/g, html.querySelector("g").outerHTML);
      });
    }
  }

  if (size) {
    let mod = 1;
    if (size === "small") mod = .5;
    if (size === "smaller") mod = .25;
    if (size === "smallest") mod = .125;
    if (size === "big") mod = 2;

    const el = document.getElementById(tincture);
    el.setAttribute("width", width * mod);
    el.setAttribute("height", height * mod);
  }
}

// main generation routine
const getCOA = function(seed = Math.floor(Math.random() * 1e9)) {
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
    const o = coa.ordinary = {ordinary};
    coa.t2 = getTincture("charge", tinctures.f, coa.t1);
    if (linedOrdinary) o.variant = tinctures.pattern || (division && P(.7)) ? "straight" : rw(lines);
    if (division && !charge && !tinctures.pattern && P(.5) && ordinary !== "bordure" && ordinary !== "orle") {
      if (P(.8)) o.counter = 1; // 40%
      else o.crop = 1; // 10%
    }
  }

  if (charge) {
    let p = "e", t = "gules";
    if (positions.ordinariesOn[ordinary] && P(.8)) {
      // place charge over ordinary (use tincture of field type)
      p = rw(positions.ordinariesOn[ordinary]);
      while (charges.natural[charge] === coa.t2) selectCharge();
      t = !tinctures.pattern && P(.3) ? coa.t1 : getTincture("charge", [], coa.t2, charge);
    } else if (positions.ordinariesOff[ordinary] && P(.95)) {
      // place charge out of ordinary (use tincture of ordinary type)
      p = rw(positions.ordinariesOff[ordinary]);
      while (charges.natural[charge] === coa.t1) selectCharge();
      t = !tinctures.pattern && P(.3) ? coa.t2 : getTincture("charge", tinctures.f, coa.t1, charge);
    } else if (positions.divisions[division]) {
      // place charge in fields made by division
      p = rw(positions.divisions[division]);
      while (charges.natural[charge] === coa.t1) selectCharge();
      t = getTincture("charge", coa.t2 ? tinctures.f.concat(coa.t2) : tinctures.f, coa.t1, charge);
    } else if (positions[charge]) {
      // place charge-suitable position
      p = rw(positions[charge]);
      while (charges.natural[charge] === coa.t1) selectCharge();
      t = getTincture("charge", tinctures.f, coa.t1, charge);
    } else {
      // place in standard position (use new tincture)
      p = tinctures.pattern ? "e" : charges.conventional[charge] ? rw(positions.conventional) : rw(positions.complex);
      while (charges.natural[charge] === coa.t1) selectCharge();
      t = getTincture("charge", tinctures.f.concat(coa.t2), coa.t1, charge);
    }

    if (charges.natural[charge]) t = charges.natural[charge]; // natural tincture
    coa.charges = [{charge, t, p}];

    if (p === "ABCDEFGHIKL" && P(.95)) {
      // add central charge if charge is in bordure
      coa.charges[0].charge = rw(charges.conventional);
      coa.charges.push({"charge":rw(charges[rw(charges.single)]), t:getTincture("charge", tinctures.f, coa.t1, charge), p:"e"});
    } else if (charge === "inescutcheon" && P(.8)) {
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

    // specify type of charge if multiple are available
    coa.charges?.forEach((c,i) => {
      if (c.charge === "inescutcheon") {
        const shield = ["heater", "oldFrench"].includes(options.shield) ? options.shield : "spanish";
        c.charge += capitalize(shield);
        return;
      }
      if (!charges[c.charge]) return;
      c.charge += capitalize(rw(charges[c.charge]));
    });
  }

  history.push(coa);
  return coa;
}

const render = function(coa, id = "coa1") {
  if (typeof coa === "string") coa = JSON.parse(coa);
  const el = document.getElementById(id);
  el.innerHTML = ""; // remove old coa

  const d3el = d3.select(el);
  const shieldPath = defs.querySelector("g#shields > #"+coa.shield+" > path").getAttribute("d");

  // check if diaper should be rendered
  const diaper = coa.diaper && (!coa.t1.includes("-") || (coa.t3 && !coa.t3.includes("-")));

  // draw base layer and set clip
  const shield = d3el.append("g").attr("id", "shield").attr("clip-path", "url(#"+coa.shield+")").attr("coa", JSON.stringify(coa));
  shield.append("rect").attr("id", "field").attr("data-type", "field")
    .attr("x", 0).attr("y", 0).attr("width", "100%").attr("height", "100%")
    .attr("fill", clr(coa.t1))
    //.call(d3.drag().on("start", drag));

  if (diaper && !coa.t1.includes("-")) shield.append("rect").attr("class", "diaper").attr("x", 0).attr("y", 0).attr("width", "100%").attr("height", "100%").attr("fill", "url(#"+coa.diaper+")");

  const ordinary = coa.ordinary;
  if (ordinary && (ordinary.crop || ordinary.counter)) drawOrdinary(ordinary, shield, ordinary.counter ? coa.t3 : coa.t2);

  if (coa.division) {
    const division = shield.append("g").attr("id", "division").attr("data-type", "division").attr("clip-path", "url(#"+renderClipPath(coa.division, coa.line)+")");
    //division.call(d3.drag().on("start", drag));
    division.append("rect").attr("x", 0).attr("y", 0).attr("width", "100%").attr("height", "100%").attr("fill", clr(coa.t3));
    if (diaper && !coa.t3.includes("-")) division.append("rect").attr("class", "diaper").attr("x", 0).attr("y", 0).attr("width", "100%").attr("height", "100%").attr("fill", "url(#"+coa.diaper+")");
    if (ordinary && ordinary.counter) drawOrdinary(ordinary, division, coa.t1);
  }

  if (ordinary && !ordinary.crop && !ordinary.counter) drawOrdinary(ordinary, shield, coa.t2);

  // render charges
  if (coa.charges) coa.charges.forEach((charge, i) => drawCharge(charge, i));

  // render gradient and border
  d3el.append("path").attr("id", "grad").attr("d", shieldPath).attr("fill", "url(#"+coa.grad+")").attr("stroke", "#333").attr("stroke-width", 2);

  function drawOrdinary(o, g, t) {
    if (o.ordinary === "bordure" || o.ordinary === "orle") {
      const path = g.append("path").attr("d", shieldPath).attr("fill", "none").attr("stroke", clr(t));
      if (o.ordinary === "bordure") path.attr("stroke-width", "16.7%");
      if (o.ordinary === "orle") path.attr("stroke-width", "6%").attr("transform", "translate(15,17) scale(.85)");
    } else {
      const id = renderClipPath(o.ordinary, o.variant);
      const ordinary = g.append("g").attr("id", "ordinary").attr("data-type", "ordinary").attr("clip-path", "url(#"+id+")").call(d3.drag().on("start", drag));
      if (o.x || o.y || o.size) ordinary.attr("transform", `translate(${o.x||0}, ${o.y||0}) scale(${o.size||1})`).attr("transform-origin", "center");
      ordinary.append("rect").attr("x", 0).attr("y", 0).attr("width", "100%").attr("height", "100%").attr("fill", clr(t));
      if (!el.querySelector("#"+id)) el.insertAdjacentHTML("beforeend", document.querySelector("#templates > #"+id).outerHTML);
      if (diaper) ordinary.append("rect").attr("class", "diaper").attr("x", 0).attr("y", 0).attr("width", "100%").attr("height", "100%").attr("fill", "url(#"+coa.diaper+")");
    }
  }

  function drawCharge(charge, i) {
    // g, charge, position, t, size = 1, sinister = 0, reversed = 0
    const positions = [...charge.p];
    const shieldPositions = shields[coa.shield] ? shields[coa.shield] : shields.spanish;
    const ref = charge.charge === "inescutcheon" ? document.getElementById("inescutcheon_"+coa.shield) ? "inescutcheon_"+coa.shield : "inescutcheon_heater" : charge.charge;

    // add charge html to defs
    if (!defs.querySelector("#"+ref)) {
      if (document.querySelector("#defs #charges > #"+ref)) {
        const html = document.querySelector("#charges > #"+ref).outerHTML;
        //defs.insertAdjacentHTML("beforeend", html);
      } else {
        fetch("charges/"+ref+".svg").then(response => response.text()).then(text => {
          if (defs.querySelector("#"+ref)) return false;
          const el = document.createElement("html");
          el.innerHTML = text;
          defs.insertAdjacentHTML("beforeend", el.querySelector("g").outerHTML);
        });
      }
    }

    let size = charge.size || 1;
    if (charge.p === "e" && (coa.ordinary?.ordinary === "bordure" || coa.ordinary?.ordinary === "orle")) size *= 1.1;
    else if (charge.p === "e") size *= 1.5;
    else if (["pp", "qq", "kn", "kk", "nn", "oo", "jj"].includes(charge.p)) size *= .7;
    else if (charge.p === "jln" || charge.p === "jlh") size *= .7;
    else if (positions.length > 10) size *= .18; // >10 (bordure)
    else if (positions.length > 7) size *= .3; // 8, 9, 10
    else if (positions.length > 5) size *= .4; // 6, 7
    else if (positions.length > 3) size *= .4; // 4 or 5
    else if (positions.length > 1) size *= .5; // 2

    const g = charge.type === "counter" || charge.type === "field" ? shield.insert("g", "#division") :
      charge.type === "division" ? shield.select("#division").append("g") : shield.append("g");

    g.attr("id", "charge"+i).attr("data-type", "charge").attr("data-i", i).call(d3.drag().on("start", drag)).on("click", function() {console.log("+")});
    if (charge.x || charge.y) g.attr("transform", `translate(${charge.x||0}, ${charge.y||0})`);

    const scale = charge.sinister || charge.reversed ? `${charge.sinister ? "-" : ""}${size}, ${charge.reversed ? "-" : ""}${size}` : size;
    const fill = charge.type === "counter" ? clr(coa.t3) : clr(charge.t);

    [...new Set(positions)].forEach(p => {
      const [x, y] = shieldPositions[p];
      const tr = `translate(${x}, ${y}) scale(${scale})`;
      g.append("use").attr("href", "#"+ref).attr("transform", tr).attr("transform-origin", "center").attr("fill", fill).attr("stroke", "#000");
    });

    // render again in division for countercharged charges
    if (charge.type === "counter") {
      const fill = clr(coa.t1);
      const g = shield.select("#division").append("g").attr("id", "counter"+i).attr("data-type", "counter").attr("data-i", i).call(d3.drag().on("start", drag));
      if (charge.x || charge.y) g.attr("transform", `translate(${charge.x||0}, ${charge.y||0})`);

      [...new Set(positions)].forEach(p => {
        const [x, y] = shieldPositions[p];
        const tr = `translate(${x}, ${y}) scale(${scale})`;
        g.append("use").attr("href", "#"+ref).attr("transform", tr).attr("transform-origin", "center").attr("fill", fill).attr("stroke", "#000");
      });
    }

  }

  function renderClipPath(templateId, lineId) {
    if (!templateId) return false;
    if (!lineId) {
      const template = document.querySelector("#templates > #"+templateId);
      if (!el.querySelector("#"+templateId) && template) el.insertAdjacentHTML("beforeend", template.outerHTML);
      return templateId;
    }

    const id = templateId + lineId[0].toUpperCase() + lineId.slice(1);
    if (el.querySelector("#"+id)) return id; // already added

    const template = document.getElementById(templateId);
    const path = document.getElementById(lineId) ? document.getElementById(lineId) : document.getElementById("straight");
    const html = template.innerHTML.replace(/{id}/, id).replace(/{line}/g, path.getAttribute("d")).replace(/dpath/g, "d");
    el.insertAdjacentHTML("beforeend", html);
    return id;
  }
}

const parseInputs = function() {
  const shield = document.getElementById("shieldSelect").value;
  const grad = document.getElementById("gradientSelect").value;
  const coa = {shield, grad};

  // main field tincture of pattern
  const field = document.getElementById("shieldField").value;
  if (field == "tincture") {
    coa.t1 = document.getElementById("shieldTincture1Select").value;
  } else {
    const charge = document.getElementById("shieldSemy").value;
    const pattern = document.getElementById("shieldPattern").value;
    const t1 = document.getElementById("shieldTincture1Select").value;
    const t2 = document.getElementById("shieldTincture2Select").value;
    const size = document.getElementById("shieldPatternSize").value;
    const t = [field === "pattern" ? pattern : "semy_of_"+charge, t1, t2];
    if (size !== "standard") t.push(size);
    coa.t1 = t.join("-");
  }

  if (document.getElementById("divisionSelect").value !== "no") {
    coa.division = document.getElementById("divisionSelect").value;
    if (divisions[coa.division]) coa.line = document.getElementById("divisionLineSelect").value;

    // division field tincture of pattern
    const field = document.getElementById("divisionField").value;
    if (field == "tincture") {
      coa.t3 = document.getElementById("divisionTincture1Select").value;
    } else {
      const charge = document.getElementById("divisionSemy").value;
      const pattern = document.getElementById("divisionPattern").value;
      const t1 = document.getElementById("divisionTincture1Select").value;
      const t2 = document.getElementById("divisionTincture2Select").value;
      const size = document.getElementById("divisionPatternSize").value;
      const t = [field === "pattern" ? pattern : "semy_of_"+charge, t1, t2];
      if (size !== "standard") t.push(size);
      coa.t3 = t.join("-");
    }
  }

  if (document.getElementById("ordinarySelect").value !== "no") {
    const o = coa.ordinary = {ordinary:document.getElementById("ordinarySelect").value};
    if (ordinaries.lined[o.ordinary]) o.variant = document.getElementById("ordinaryLineSelect").value;
    coa.t2 = document.getElementById("ordinaryTinctureSelect").value;
    const type = document.getElementById("ordinaryTypeSelect").value;
    if (type === "counter") o.counter = 1;
    if (type === "crop") o.crop = 1;

    const size = +document.getElementById("ordinarySizeInput").value;
    if (size && size !== 1) o.size = size;
    const shiftX = +document.getElementById("ordinaryShiftXInput").value || 0;
    const shiftY = +document.getElementById("ordinaryShiftYInput").value || 0;
    if (shiftX) o.x = shiftX;
    if (shiftY) o.y = shiftY;
  }

  document.getElementById("menu").querySelectorAll("fieldset[id^='charge']").forEach((fieldset, i) => {
    const charge = fieldset.querySelector("select").value;
    if (charge === "no") return;
    if (!coa.charges) coa.charges = [];
    const p = document.getElementById("chargePositionInput"+i).value || document.getElementById("chargePositionSelect"+i).value;
    const t = document.getElementById("chargeTinctureSelect"+i).value;
    const chargeObj = {charge, p, t};
    const type = document.getElementById("chargeTypeSelect"+i).value;

    if (type !== "overall") chargeObj.type = type;
    const size = +document.getElementById("chargeSizeInput"+i).value;
    if (size && size !== 1) chargeObj.size = size;
    const shiftX = +document.getElementById("chargeShiftXInput"+i).value || 0;
    const shiftY = +document.getElementById("chargeShiftYInput"+i).value || 0;
    if (shiftX) chargeObj.x = shiftX;
    if (shiftY) chargeObj.y = shiftY;

    if (document.getElementById("chargeSinister"+i).checked) chargeObj.sinister = 1;
    if (document.getElementById("chargeReversed"+i).checked) chargeObj.reversed = 1;
    coa.charges.push(chargeObj);
  });

  console.log(JSON.stringify(coa));
  history.push(coa);
  render(coa);
}

const setInputs = coa => {
  document.getElementById("shieldSelect").value = coa.shield;
  document.getElementById("gradientSelect").value = coa.grad;

  // main field tincture of pattern
  if (coa.t1.includes("-")) {
    const [pattern, t1, t2, size] = coa.t1.split("-");
    const semy = pattern.slice(0, 4) === "semy";

    if (semy) {
      document.getElementById("shieldField").value = "semy";
      document.getElementById("shieldSemy").style.display = "inline-block";
      document.getElementById("shieldSemy").style.display = pattern.split("_of_")[1];
      document.getElementById("shieldPattern").style.display = "none";
    } else {
      document.getElementById("shieldField").value = "pattern";
      document.getElementById("shieldPattern").style.display = "inline-block";
      document.getElementById("shieldPattern").value = pattern;
      document.getElementById("shieldSemy").style.display = "none";
    }

    document.getElementById("shieldTincture1Select").value = t1;
    document.getElementById("shieldTincture2Select").style.display = "inline-block";
    document.getElementById("shieldTincture2Select").value = t2;
    document.getElementById("shieldPatternSize").style.display = "inline-block";
    document.getElementById("shieldPatternSize").value = size || "standard";
  } else {
    document.getElementById("shieldField").value = "tincture";
    document.getElementById("shieldTincture1Select").value = coa.t1;
    document.getElementById("shieldPattern").style.display = "none";
    document.getElementById("shieldTincture2Select").style.display = "none";
    document.getElementById("shieldSemy").style.display = "none";
    document.getElementById("shieldPatternSize").style.display = "none";
  }

  if (coa.division) {
    document.getElementById("divisionSelect").value = coa.division;
    document.getElementById("divisionLineSelect").value = coa.line || "straight";

    // division field tincture of pattern
    if (coa.t3.includes("-")) {
      const [pattern, t1, t2, size] = coa.t3.split("-");
      const semy = pattern.slice(0, 4) === "semy";

      if (semy) {
        document.getElementById("divisionField").value = "semy";
        document.getElementById("divisionSemy").style.display = "inline-block";
        document.getElementById("divisionSemy").style.display = pattern.split("_of_")[1];
        document.getElementById("divisionPattern").style.display = "none";
      } else {
        document.getElementById("divisionField").value = "pattern";
        document.getElementById("divisionPattern").style.display = "inline-block";
        document.getElementById("divisionPattern").value = pattern;
        document.getElementById("divisionSemy").style.display = "none";
      }

      document.getElementById("divisionTincture1Select").value = t1;
      document.getElementById("divisionTincture2Select").style.display = "inline-block";
      document.getElementById("divisionTincture2Select").value = t2;
      document.getElementById("divisionPatternSize").style.display = "inline-block";
      document.getElementById("divisionPatternSize").value = size || "standard";
    } else {
      document.getElementById("divisionField").value = "tincture";
      document.getElementById("divisionTincture1Select").value = coa.t3;
      document.getElementById("divisionPattern").style.display = "none";
      document.getElementById("divisionTincture2Select").style.display = "none";
      document.getElementById("divisionSemy").style.display = "none";
      document.getElementById("divisionPatternSize").style.display = "none";
    }

  } else document.getElementById("divisionSelect").value = "no";

  if (coa.ordinary) {
    const o = coa.ordinary;
    document.getElementById("ordinarySelect").value = o.ordinary;
    document.getElementById("ordinaryLineSelect").value = o.variant || "straight";
    document.getElementById("ordinaryTinctureSelect").value = coa.t2;
    document.getElementById("ordinaryTypeSelect").value = o.counter ? "counter" : o.crop ? "crop" : "full";
    document.getElementById("ordinarySizeInput").value = o.size || 1;
    document.getElementById("ordinaryShiftXInput").value = o.x || 0;
    document.getElementById("ordinaryShiftYInput").value = o.y || 0;
  } else document.getElementById("ordinarySelect").value = "no";

  menu.querySelectorAll("fieldset[id^='charge']").forEach(e => e.remove());
  addCharge(0);

  coa.charges?.forEach(function(c, i) {
    if (!document.getElementById("chargeSelect"+i)) addCharge(i);
    document.getElementById("chargeSelect"+i).value = c.charge;
    document.getElementById("chargePositionInput"+i).value = c.p;
    document.getElementById("chargeTinctureSelect"+i).value = c.t;
    document.getElementById("chargeTypeSelect"+i).value = c.type || "overall";
    document.getElementById("chargeSizeInput"+i).value = c.size || 1;
    document.getElementById("chargeShiftXInput"+i).value = c.x || 0;
    document.getElementById("chargeShiftYInput"+i).value = c.y || 0;
    document.getElementById("chargeSinister"+i).value = c.sinister;
    document.getElementById("chargeReversed"+i).value = c.reversed;
  });
}

function addCharge(i) {
  const template = document.getElementById("chargeTemplate").content.querySelector("fieldset");
  const fieldset = document.getElementById("menu").appendChild(template.cloneNode(true));
  fieldset.querySelectorAll("[id]").forEach(el => el.id += i);
  fieldset.id += i;

  const button = document.createElement("button");
  button.innerHTML = i ? "➖" : "➕";
  button.addEventListener("click", () => {
    if (i) {
      fieldset.remove();
      parseInputs();
    } else addCharge(menu.querySelectorAll("fieldset[id^='charge']").length);
  });
  fieldset.querySelector("legend").appendChild(button);
}

function drawHelpShield(shield) {
  d3.select("#canvas").selectAll("circle, text, path").remove();

  const d = d3.select("g#shields > clipPath#"+shield+" > *").attr("d");
  d3.select("#form").append("path").attr("d", d).attr("fill", "none").attr("stroke", "#000");
  const circles = d3.select("#circles");
  const letters = d3.select("#letters");
  const entries = shields[shield] ? Object.entries(shields[shield]) : Object.entries(shields.heater);

  entries.forEach(e => {
    circles.append("circle").attr("cx", e[1][0]).attr("cy", e[1][1]).attr("r", 2);
    letters.append("text").attr("x", e[1][0]).attr("y", e[1][1]).text(e[0]);
  });
}

const generate = function(seed) {
  const coa = getCOA(seed);
  console.log(JSON.stringify(coa));
  render(coa);
  setInputs(coa);
  drawHelpShield(coa.shield);
}

const history = [];
let step = 0;

return {getCOA, generate, render, setInputs, parseInputs, history, step:history.length-1};

})));