export const positionsSelect = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "y",
  "z",
  "kn",
  "bh",
  "df",
  "pq",
  "jo",
  "lm",
  "abc",
  "def",
  "ghi",
  "adg",
  "beh",
  "cfi",
  "jeo",
  "jln",
  "kmo",
  "peq",
  "lem",
  "bhdf",
  "jleh",
  "acegi",
  "bdefh",
  "kenpq",
  "abcpqh",
  "abcdefgzi",
  "ABCDEFGHIJKL"
];

export const positions = {
  conventional: {
    e: 20,
    abcdefgzi: 3,
    beh: 3,
    behdf: 2,
    acegi: 1,
    kn: 3,
    bhdf: 1,
    jeo: 1,
    abc: 3,
    jln: 6,
    jlh: 3,
    kmo: 2,
    jleh: 1,
    def: 3,
    abcpqh: 4,
    ABCDEFGHIJKL: 1
  },
  complex: {e: 40, beh: 1, kn: 1, jeo: 1, abc: 2, jln: 7, jlh: 2, def: 1, abcpqh: 1},
  divisions: {
    perPale: {e: 15, pq: 5, jo: 2, jl: 2, ABCDEFGHIJKL: 1},
    perFess: {e: 12, kn: 4, jkl: 2, gizgiz: 1, jlh: 3, kmo: 1, ABCDEFGHIJKL: 1},
    perBend: {e: 5, lm: 5, bcfdgh: 1},
    perBendSinister: {e: 1, jo: 1},
    perCross: {e: 4, jlmo: 1, j: 1, jo: 2, jl: 1},
    perChevron: {e: 1, jlh: 1, dfk: 1, dfbh: 2, bdefh: 1},
    perChevronReversed: {e: 1, mok: 2, dfh: 2, dfbh: 1, bdefh: 1},
    perSaltire: {bhdf: 8, e: 3, abcdefgzi: 1, bh: 1, df: 1, ABCDEFGHIJKL: 1},
    perPile: {ee: 3, be: 2, abceh: 1, abcabc: 1, jleh: 1}
  },
  inescutcheon: {e: 4, jln: 1}
};

export const lines = {
  straight: 50,
  wavy: 8,
  engrailed: 4,
  invecked: 3,
  rayonne: 3,
  embattled: 1,
  raguly: 1,
  urdy: 1,
  dancetty: 1,
  indented: 2,
  dentilly: 1,
  bevilled: 1,
  angled: 1,
  flechy: 1,
  barby: 1,
  enclavy: 1,
  escartely: 1,
  arched: 2,
  archedReversed: 1,
  nowy: 1,
  nowyReversed: 1,
  embattledGhibellin: 1,
  embattledNotched: 1,
  embattledGrady: 1,
  dovetailedIndented: 1,
  dovetailed: 1,
  potenty: 1,
  potentyDexter: 1,
  potentySinister: 1,
  nebuly: 2,
  seaWaves: 1,
  dragonTeeth: 1,
  firTrees: 1
};

export const divisions = {
  variants: {
    perPale: 5,
    perFess: 5,
    perBend: 2,
    perBendSinister: 1,
    perChevron: 1,
    perChevronReversed: 1,
    perCross: 5,
    perPile: 1,
    perSaltire: 1,
    gyronny: 1,
    chevronny: 1
  },
  perPale: lines,
  perFess: lines,
  perBend: lines,
  perBendSinister: lines,
  perChevron: lines,
  perChevronReversed: lines,
  perCross: {
    straight: 20,
    wavy: 5,
    engrailed: 4,
    invecked: 3,
    rayonne: 1,
    embattled: 1,
    raguly: 1,
    urdy: 1,
    indented: 2,
    dentilly: 1,
    bevilled: 1,
    angled: 1,
    embattledGhibellin: 1,
    embattledGrady: 1,
    dovetailedIndented: 1,
    dovetailed: 1,
    potenty: 1,
    potentyDexter: 1,
    potentySinister: 1,
    nebuly: 1
  },
  perPile: lines
};

export const ordinaries = {
  lined: {
    pale: 7,
    fess: 5,
    bend: 3,
    bendSinister: 2,
    chief: 5,
    bar: 2,
    gemelle: 1,
    fessCotissed: 1,
    fessDoubleCotissed: 1,
    bendlet: 2,
    bendletSinister: 1,
    terrace: 3,
    cross: 6,
    crossParted: 1,
    saltire: 2,
    saltireParted: 1
  },
  straight: {
    bordure: 8,
    orle: 4,
    mount: 1,
    point: 2,
    flaunches: 1,
    gore: 1,
    gyron: 1,
    quarter: 1,
    canton: 2,
    pall: 3,
    pallReversed: 2,
    chevron: 4,
    chevronReversed: 3,
    pile: 2,
    pileInBend: 2,
    pileInBendSinister: 1,
    piles: 1,
    pilesInPoint: 2,
    label: 1
  },
  data: {
    bar: {
      positionsOn: {defdefdef: 1},
      positionsOff: {abc: 2, abcgzi: 1, jlh: 5, bgi: 2, ach: 1}
    },
    bend: {
      positionsOn: {ee: 2, jo: 1, joe: 1},
      positionsOff: {ccg: 2, ccc: 1}
    },
    bendSinister: {
      positionsOn: {ee: 1, lm: 1, lem: 4},
      positionsOff: {aai: 2, aaa: 1}
    },
    bendlet: {
      positionsOn: {joejoejoe: 1},
      positionsOff: {ccg: 2, ccc: 1}
    },
    bendletSinister: {
      positionsOn: {lemlemlem: 1},
      positionsOff: {aai: 2, aaa: 1}
    },
    bordure: {
      positionsOn: {ABCDEFGHIJKL: 1},
      positionsOff: {e: 4, jleh: 2, kenken: 1, peqpeq: 1}
    },
    canton: {
      positionsOn: {yyyy: 1},
      positionsOff: {e: 5, beh: 1, def: 1, bdefh: 1, kn: 1}
    },
    chevron: {
      positionsOn: {ach: 3, hhh: 1}
    },
    chevronReversed: {
      positionsOff: {bbb: 1}
    },
    chief: {
      positionsOn: {abc: 5, bbb: 1},
      positionsOff: {emo: 2, emoz: 1, ez: 2}
    },
    cross: {
      positionsOn: {eeee: 1, behdfbehdf: 3, behbehbeh: 2},
      positionsOff: {acgi: 1}
    },
    crossParted: {
      positionsOn: {e: 5, ee: 1}
    },
    fess: {
      positionsOn: {ee: 1, def: 3},
      positionsOff: {abc: 3, abcz: 1}
    },
    fessCotissed: {
      positionsOn: {ee: 1, def: 3}
    },
    fessDoubleCotissed: {
      positionsOn: {ee: 1, defdef: 3}
    },
    flaunches: {
      positionsOff: {e: 3, kn: 1, beh: 3}
    },
    gemelle: {
      positionsOff: {abc: 1}
    },
    gyron: {
      positionsOff: {bh: 1}
    },
    label: {
      positionsOff: {defgzi: 2, eh: 3, defdefhmo: 1, egiegi: 1, pqn: 5}
    },
    mount: {
      positionsOff: {e: 5, def: 1, bdf: 3}
    },
    orle: {
      positionsOff: {e: 4, jleh: 1, kenken: 1, peqpeq: 1}
    },
    pale: {
      positionsOn: {ee: 12, beh: 10, kn: 3, bb: 1},
      positionsOff: {yyy: 1}
    },
    pall: {
      positionsOn: {ee: 1, jleh: 5, jlhh: 3},
      positionsOff: {BCKFEILGJbdmfo: 1}
    },
    pallReversed: {
      positionsOn: {ee: 1, bemo: 5},
      positionsOff: {aczac: 1}
    },
    pile: {
      positionsOn: {bbb: 1},
      positionsOff: {acdfgi: 1, acac: 1}
    },
    pileInBend: {
      positionsOn: {eeee: 1, eeoo: 1},
      positionsOff: {cg: 1}
    },
    pileInBendSinister: {
      positionsOn: {eeee: 1, eemm: 1},
      positionsOff: {ai: 1}
    },
    point: {
      positionsOff: {e: 2, def: 1, bdf: 3, acbdef: 1}
    },
    quarter: {
      positionsOn: {jjj: 1},
      positionsOff: {e: 1}
    },
    saltire: {
      positionsOn: {ee: 5, jlemo: 1}
    },
    saltireParted: {
      positionsOn: {e: 5, ee: 1}
    },
    terrace: {
      positionsOff: {e: 5, def: 1, bdf: 3}
    }
  }
};

const chargeData = {
  agnusDei: {
    colors: 2,
    sinister: true
  },
  angel: {
    colors: 2,
    positions: {e: 1}
  },
  ant: {
    reversed: true
  },
  anvil: {
    sinister: true
  },
  apple: {
    colors: 2
  },
  arbalest: {
    colors: 3,
    reversed: true
  },
  archer: {
    colors: 3,
    sinister: true
  },
  armEmbowedHoldingSabre: {
    colors: 3,
    sinister: true
  },
  armEmbowedVambraced: {
    sinister: true
  },
  armEmbowedVambracedHoldingSword: {
    colors: 3,
    sinister: true
  },
  armillarySphere: {
    positions: {e: 1}
  },
  arrow: {
    colors: 3,
    reversed: true
  },
  arrowsSheaf: {
    colors: 3,
    reversed: true
  },
  axe: {
    colors: 2,
    sinister: true
  },
  badgerStatant: {
    colors: 2,
    sinister: true
  },
  banner: {
    colors: 2
  },
  basilisk: {
    colors: 3,
    sinister: true
  },
  bearPassant: {
    colors: 3,
    sinister: true
  },
  bearRampant: {
    colors: 3,
    sinister: true
  },
  bee: {
    colors: 3,
    reversed: true
  },
  bell: {
    colors: 2
  },
  boarHeadErased: {
    colors: 3,
    sinister: true
  },
  boarRampant: {
    colors: 3,
    sinister: true,
    positions: {e: 12, beh: 1, kn: 1, jln: 2}
  },
  boat: {
    colors: 2
  },
  bookClosed: {
    colors: 3,
    sinister: true
  },
  bookClosed2: {
    sinister: true
  },
  bookOpen: {
    colors: 3
  },
  bow: {
    sinister: true
  },
  bowWithArrow: {
    colors: 3,
    reversed: true
  },
  bowWithThreeArrows: {
    colors: 3
  },
  bucket: {
    colors: 2
  },
  bugleHorn: {
    colors: 2
  },
  bugleHorn2: {
    colors: 2
  },
  bullHeadCaboshed: {
    colors: 2
  },
  bullPassant: {
    colors: 3,
    sinister: true
  },
  butterfly: {
    colors: 3,
    reversed: true
  },
  camel: {
    colors: 2,
    sinister: true
  },
  camelBactrian: {
    colors: 2,
    sinister: true
  },
  cancer: {
    reversed: true
  },
  cannon: {
    colors: 2,
    sinister: true
  },
  caravel: {
    colors: 3,
    sinister: true
  },
  castle: {
    colors: 2
  },
  castle2: {
    colors: 3
  },
  catPassantGuardant: {
    colors: 2,
    sinister: true
  },
  cavalier: {
    colors: 3,
    sinister: true,
    positions: {e: 1}
  },
  centaur: {
    colors: 3,
    sinister: true
  },
  chalice: {
    colors: 2
  },
  church: {
    colors: 3
  },
  cinquefoil: {
    reversed: true
  },
  cock: {
    colors: 3,
    sinister: true
  },
  comet: {
    reversed: true
  },
  cowStatant: {
    colors: 3,
    sinister: true
  },
  cossack: {
    colors: 3,
    sinister: true
  },
  crescent: {
    reversed: true
  },
  crocodile: {
    colors: 2,
    sinister: true
  },
  crosier: {
    sinister: true
  },
  crossbow: {
    colors: 3,
    sinister: true
  },
  crossGamma: {
    sinister: true
  },
  crossLatin: {
    reversed: true
  },
  crossTau: {
    reversed: true
  },
  crossTriquetra: {
    reversed: true
  },
  crown: {
    colors: 2,
    positions: {
      e: 10,
      abcdefgzi: 1,
      beh: 3,
      behdf: 2,
      acegi: 1,
      kn: 1,
      pq: 2,
      abc: 1,
      jln: 4,
      jleh: 1,
      def: 2,
      abcpqh: 3
    }
  },
  crown2: {
    colors: 3,
    positions: {
      e: 10,
      abcdefgzi: 1,
      beh: 3,
      behdf: 2,
      acegi: 1,
      kn: 1,
      pq: 2,
      abc: 1,
      jln: 4,
      jleh: 1,
      def: 2,
      abcpqh: 3
    }
  },
  deerHeadCaboshed: {
    colors: 2
  },
  dolphin: {
    colors: 2,
    sinister: true
  },
  donkeyHeadCaboshed: {
    colors: 2
  },
  dove: {
    colors: 2,
    natural: "argent",
    sinister: true
  },
  doveDisplayed: {
    colors: 2,
    natural: "argent",
    sinister: true
  },
  dragonfly: {
    colors: 2,
    reversed: true
  },
  dragonPassant: {
    colors: 3,
    sinister: true
  },
  dragonRampant: {
    colors: 3,
    sinister: true
  },
  drakkar: {
    colors: 3,
    sinister: true
  },
  drawingCompass: {
    sinister: true
  },
  drum: {
    colors: 3
  },
  duck: {
    colors: 3,
    sinister: true
  },
  eagle: {
    colors: 3,
    sinister: true,
    positions: {e: 15, beh: 1, kn: 1, abc: 1, jlh: 2, def: 2, pq: 1}
  },
  eagleTwoHeads: {
    colors: 3
  },
  elephant: {
    colors: 2,
    sinister: true
  },
  elephantHeadErased: {
    colors: 2,
    sinister: true
  },
  falchion: {
    colors: 2,
    reversed: true
  },
  falcon: {
    colors: 3,
    sinister: true
  },
  fan: {
    colors: 2,
    reversed: true
  },
  fasces: {
    colors: 3,
    sinister: true
  },
  feather: {
    sinister: true
  },
  flamberge: {
    colors: 2,
    reversed: true
  },
  flangedMace: {
    reversed: true
  },
  fly: {
    colors: 3,
    reversed: true
  },
  foot: {
    sinister: true
  },
  fountain: {
    natural: "azure"
  },
  frog: {
    reversed: true
  },
  garb: {
    colors: 2,
    natural: "or",
    positions: {e: 1, def: 3, abc: 2, beh: 1, kn: 1, jln: 3, jleh: 1, abcpqh: 1, joe: 1, lme: 1}
  },
  gauntlet: {
    sinister: true,
    reversed: true
  },
  gladius: {
    colors: 2,
    reversed: true
  },
  goat: {
    colors: 3,
    sinister: true
  },
  goutte: {
    reversed: true
  },
  grapeBunch: {
    colors: 3,
    sinister: true
  },
  grapeBunch2: {
    colors: 3,
    sinister: true
  },
  grenade: {
    colors: 2
  },
  greyhoundCourant: {
    colors: 3,
    sinister: true,
    positions: {e: 10, def: 1, abc: 1, bdefh: 1, jlh: 1, abcpqh: 1}
  },
  greyhoundRampant: {
    colors: 2,
    sinister: true,
    positions: {e: 10, def: 1, abc: 1, bdefh: 1, jlh: 1, abcpqh: 1}
  },
  greyhoundSejant: {
    colors: 3,
    sinister: true
  },
  griffinPassant: {
    colors: 3,
    sinister: true,
    positions: {e: 10, def: 2, abc: 2, bdefh: 1, kn: 1, jlh: 2, abcpqh: 1}
  },
  griffinRampant: {
    colors: 3,
    sinister: true,
    positions: {e: 10, def: 1, abc: 1, bdefh: 1, jlh: 1, abcpqh: 1}
  },
  hand: {
    sinister: true,
    reversed: true,
    positions: {e: 10, jln: 2, kn: 1, jeo: 1, abc: 2, pqe: 1}
  },
  harp: {
    colors: 2,
    sinister: true
  },
  hatchet: {
    colors: 2,
    sinister: true
  },
  head: {
    colors: 2,
    sinister: true,
    positions: {e: 1}
  },
  headWreathed: {
    colors: 3,
    sinister: true,
    positions: {e: 1}
  },
  hedgehog: {
    colors: 3,
    sinister: true
  },
  helmet: {
    sinister: true
  },
  helmetCorinthian: {
    colors: 3,
    sinister: true
  },
  helmetGreat: {
    sinister: true
  },
  helmetZischagge: {
    sinister: true
  },
  heron: {
    colors: 2,
    sinister: true
  },
  hindStatant: {
    colors: 2,
    sinister: true
  },
  hook: {
    sinister: true
  },
  horseHeadCouped: {
    sinister: true
  },
  horsePassant: {
    colors: 2,
    sinister: true
  },
  horseRampant: {
    colors: 3,
    sinister: true
  },
  horseSalient: {
    colors: 2,
    sinister: true
  },
  horseshoe: {
    reversed: true
  },
  hourglass: {
    colors: 3
  },
  ladybird: {
    colors: 3,
    reversed: true
  },
  lamb: {
    colors: 2,
    sinister: true
  },
  lambPassantReguardant: {
    colors: 2,
    sinister: true
  },
  lanceWithBanner: {
    colors: 3,
    sinister: true
  },
  laurelWreath: {
    colors: 2
  },
  lighthouse: {
    colors: 3
  },
  lionHeadCaboshed: {
    colors: 2
  },
  lionHeadErased: {
    colors: 2,
    sinister: true
  },
  lionPassant: {
    colors: 3,
    sinister: true,
    positions: {e: 10, def: 1, abc: 1, bdefh: 1, jlh: 1, abcpqh: 1}
  },
  lionPassantGuardant: {
    colors: 3,
    sinister: true
  },
  lionRampant: {
    colors: 3,
    sinister: true,
    positions: {e: 10, def: 2, abc: 2, bdefh: 1, kn: 1, jlh: 2, abcpqh: 1}
  },
  lionSejant: {
    colors: 3,
    sinister: true
  },
  lizard: {
    reversed: true
  },
  lochaberAxe: {
    colors: 2,
    sinister: true
  },
  log: {
    sinister: true
  },
  lute: {
    colors: 2,
    sinister: true
  },
  lymphad: {
    colors: 3,
    sinister: true,
    positions: {e: 1}
  },
  mace: {
    colors: 2
  },
  maces: {
    colors: 2
  },
  mallet: {
    colors: 2
  },
  mantle: {
    colors: 3
  },
  martenCourant: {
    colors: 3,
    sinister: true
  },
  mascle: {
    positions: {
      e: 15,
      abcdefgzi: 3,
      beh: 3,
      bdefh: 4,
      acegi: 1,
      kn: 3,
      joe: 2,
      abc: 3,
      jlh: 8,
      jleh: 1,
      df: 3,
      abcpqh: 4,
      pqe: 3,
      eknpq: 3
    }
  },
  mastiffStatant: {
    colors: 3,
    sinister: true
  },
  mitre: {
    colors: 3
  },
  monk: {
    sinister: true
  },
  moonInCrescent: {
    sinister: true
  },
  mullet: {
    reversed: true
  },
  mullet7: {
    reversed: true
  },
  oak: {
    colors: 3
  },
  orb: {
    colors: 3
  },
  ouroboros: {
    sinister: true
  },
  owl: {
    colors: 2,
    sinister: true
  },
  owlDisplayed: {
    colors: 2
  },
  palmTree: {
    colors: 3
  },
  parrot: {
    colors: 2,
    sinister: true
  },
  peacock: {
    colors: 3,
    sinister: true
  },
  peacockInPride: {
    colors: 3,
    sinister: true
  },
  pear: {
    colors: 2
  },
  pegasus: {
    colors: 3,
    sinister: true
  },
  pike: {
    colors: 2,
    sinister: true
  },
  pineTree: {
    colors: 2
  },
  plaice: {
    colors: 2,
    sinister: true
  },
  plough: {
    colors: 2,
    sinister: true
  },
  ploughshare: {
    sinister: true
  },
  porcupine: {
    colors: 2,
    sinister: true
  },
  portcullis: {
    colors: 2
  },
  rabbitSejant: {
    colors: 2,
    sinister: true
  },
  rake: {
    reversed: true
  },
  rapier: {
    colors: 2,
    sinister: true,
    reversed: true
  },
  ramHeadErased: {
    colors: 3,
    sinister: true
  },
  ramPassant: {
    colors: 3,
    sinister: true
  },
  ratRampant: {
    colors: 2,
    sinister: true
  },
  raven: {
    colors: 2,
    natural: "sable",
    sinister: true,
    positions: {e: 15, beh: 1, kn: 1, jeo: 1, abc: 3, jln: 3, def: 1}
  },
  rhinoceros: {
    colors: 2,
    sinister: true
  },
  rose: {
    colors: 3
  },
  sabre: {
    colors: 2,
    sinister: true
  },
  sabre2: {
    colors: 2,
    sinister: true,
    reversed: true
  },
  sabresCrossed: {
    colors: 2,
    reversed: true
  },
  sagittarius: {
    colors: 3,
    sinister: true
  },
  salmon: {
    colors: 2,
    sinister: true
  },
  saw: {
    colors: 2
  },
  scale: {
    colors: 2
  },
  scaleImbalanced: {
    colors: 2,
    sinister: true
  },
  scissors: {
    reversed: true
  },
  scorpion: {
    reversed: true
  },
  scrollClosed: {
    colors: 2,
    sinister: true
  },
  scythe: {
    colors: 2,
    sinister: true,
    reversed: true
  },
  scythe2: {
    sinister: true
  },
  serpent: {
    colors: 2,
    sinister: true
  },
  shield: {
    colors: 2,
    sinister: true
  },
  sickle: {
    colors: 2,
    sinister: true,
    reversed: true
  },
  snail: {
    colors: 2,
    sinister: true
  },
  snake: {
    colors: 2,
    sinister: true
  },
  spear: {
    colors: 2,
    reversed: true
  },
  spider: {
    reversed: true
  },
  spiral: {
    sinister: true,
    reversed: true
  },
  squirrel: {
    sinister: true
  },
  stagLodgedRegardant: {
    colors: 3,
    sinister: true
  },
  stagPassant: {
    colors: 2,
    sinister: true
  },
  stirrup: {
    colors: 2
  },
  stork: {
    colors: 2,
    sinister: true
  },
  swallow: {
    colors: 2,
    sinister: true
  },
  swan: {
    colors: 3,
    sinister: true
  },
  swanErased: {
    colors: 3,
    sinister: true
  },
  sword: {
    colors: 2,
    reversed: true
  },
  talbotPassant: {
    colors: 3,
    sinister: true
  },
  talbotSejant: {
    colors: 3,
    sinister: true
  },
  tower: {
    colors: 2
  },
  tree: {
    positions: {e: 1}
  },
  trefoil: {
    reversed: true
  },
  trowel: {
    colors: 2,
    sinister: true,
    reversed: true
  },
  unicornRampant: {
    colors: 3,
    sinister: true
  },
  wasp: {
    colors: 3,
    reversed: true
  },
  wheatStalk: {
    colors: 2
  },
  windmill: {
    colors: 3,
    sinister: true
  },
  wing: {
    sinister: true
  },
  wingSword: {
    colors: 3,
    sinister: true
  },
  wolfHeadErased: {
    colors: 2,
    sinister: true
  },
  wolfPassant: {
    colors: 3,
    sinister: true,
    positions: {e: 10, def: 1, abc: 1, bdefh: 1, jlh: 1, abcpqh: 1}
  },
  wolfRampant: {
    colors: 3,
    sinister: true
  },
  wolfStatant: {
    colors: 3,
    sinister: true
  },
  wyvern: {
    colors: 3,
    sinister: true,
    positions: {e: 10, jln: 1}
  },
  wyvernWithWingsDisplayed: {
    colors: 3,
    sinister: true
  }
};

export const charges = {
  types: {
    conventional: 33, // 40 charges
    crosses: 13, // 30 charges
    beasts: 7, // 41 charges
    beastHeads: 3, // 10 charges
    birds: 3, // 16 charges
    reptiles: 2, // 5 charges
    bugs: 2, // 8 charges
    fishes: 1, // 3 charges
    molluscs: 1, // 2 charges
    plants: 3, // 18 charges
    fantastic: 5, // 14 charges
    agriculture: 2, // 8 charges
    arms: 5, // 32 charges
    bodyparts: 2, // 12 charges
    people: 2, // 4 charges
    architecture: 3, // 11 charges
    seafaring: 3, // 9 charges
    tools: 3, // 15 charges
    miscellaneous: 5, // 30 charges
    inescutcheon: 3, // 43 charges
    ornaments: 0, // 9 charges
    uploaded: 0
  },
  single: {
    conventional: 10,
    crosses: 8,
    beasts: 7,
    beastHeads: 3,
    birds: 3,
    reptiles: 2,
    bugs: 2,
    fishes: 1,
    molluscs: 1,
    plants: 3,
    fantastic: 5,
    agriculture: 2,
    arms: 5,
    bodyparts: 2,
    people: 2,
    architecture: 3,
    seafaring: 3,
    tools: 3,
    miscellaneous: 5,
    inescutcheon: 1
  },
  semy: {
    conventional: 4,
    crosses: 1
  },
  conventional: {
    annulet: 4,
    billet: 5,
    carreau: 1,
    comet: 1,
    compassRose: 1,
    crescent: 5,
    delf: 0,
    estoile: 1,
    fleurDeLis: 6,
    fountain: 1,
    fusil: 4,
    gear: 1,
    goutte: 4,
    heart: 4,
    lozenge: 2,
    lozengeFaceted: 3,
    lozengePloye: 1,
    mascle: 4,
    moonInCrescent: 1,
    mullet: 5,
    mullet10: 1,
    mullet4: 3,
    mullet6: 4,
    mullet6Faceted: 1,
    mullet6Pierced: 1,
    mullet7: 1,
    mullet8: 1,
    mulletFaceted: 1,
    mulletPierced: 1,
    pique: 2,
    roundel: 4,
    roundel2: 3,
    rustre: 2,
    spiral: 1,
    sun: 3,
    sunInSplendour: 1,
    sunInSplendour2: 1,
    trefle: 2,
    triangle: 3,
    trianglePierced: 1
  },
  crosses: {
    crossHummetty: 15,
    crossVoided: 1,
    crossPattee: 2,
    crossPatteeAlisee: 1,
    crossFormee: 1,
    crossFormee2: 2,
    crossPotent: 2,
    crossJerusalem: 1,
    crosslet: 1,
    crossClechy: 3,
    crossBottony: 1,
    crossFleury: 3,
    crossPatonce: 1,
    crossPommy: 1,
    crossGamma: 1,
    crossArrowed: 1,
    crossFitchy: 1,
    crossCercelee: 1,
    crossMoline: 2,
    crossFourchy: 1,
    crossAvellane: 1,
    crossErminee: 1,
    crossBiparted: 1,
    crossMaltese: 3,
    crossTemplar: 2,
    crossCeltic: 1,
    crossCeltic2: 1,
    crossTriquetra: 1,
    crossCarolingian: 1,
    crossOccitan: 1,
    crossSaltire: 3,
    crossBurgundy: 1,
    crossLatin: 3,
    crossPatriarchal: 1,
    crossOrthodox: 1,
    crossCalvary: 1,
    crossDouble: 1,
    crossTau: 1,
    crossSantiago: 1,
    crossAnkh: 1
  },
  beasts: {
    agnusDei: 1,
    badgerStatant: 1,
    bearPassant: 1,
    bearRampant: 3,
    boarRampant: 1,
    bullPassant: 1,
    camel: 1,
    camelBactrian: 1,
    catPassantGuardant: 1,
    cowStatant: 1,
    dolphin: 1,
    elephant: 1,
    goat: 1,
    greyhoundCourant: 1,
    greyhoundRampant: 1,
    greyhoundSejant: 1,
    hedgehog: 1,
    hindStatant: 1,
    horsePassant: 1,
    horseRampant: 2,
    horseSalient: 1,
    lamb: 1,
    lambPassantReguardant: 1,
    lionPassant: 3,
    lionPassantGuardant: 2,
    lionRampant: 7,
    lionSejant: 2,
    martenCourant: 1,
    mastiffStatant: 1,
    porcupine: 1,
    rabbitSejant: 1,
    ramPassant: 1,
    ratRampant: 1,
    rhinoceros: 1,
    squirrel: 1,
    stagLodgedRegardant: 1,
    stagPassant: 1,
    talbotPassant: 1,
    talbotSejant: 1,
    wolfPassant: 1,
    wolfRampant: 1,
    wolfStatant: 1
  },
  beastHeads: {
    boarHeadErased: 1,
    bullHeadCaboshed: 1,
    deerHeadCaboshed: 1,
    donkeyHeadCaboshed: 1,
    elephantHeadErased: 1,
    horseHeadCouped: 1,
    lionHeadCaboshed: 2,
    lionHeadErased: 2,
    ramHeadErased: 1,
    wolfHeadErased: 2
  },
  birds: {
    cock: 3,
    dove: 2,
    doveDisplayed: 1,
    duck: 1,
    eagle: 9,
    falcon: 2,
    heron: 1,
    owl: 1,
    owlDisplayed: 1,
    parrot: 1,
    peacock: 1,
    peacockInPride: 1,
    raven: 2,
    stork: 1,
    swallow: 1,
    swan: 2,
    swanErased: 1
  },
  reptiles: {
    crocodile: 1,
    frog: 1,
    lizard: 1,
    ouroboros: 1,
    snake: 1
  },
  bugs: {
    ant: 1,
    bee: 1,
    butterfly: 1,
    cancer: 1,
    dragonfly: 1,
    fly: 1,
    ladybird: 1,
    scorpion: 1,
    spider: 1,
    wasp: 1
  },
  fishes: {
    pike: 1,
    plaice: 1,
    salmon: 1
  },
  molluscs: {
    escallop: 4,
    snail: 1
  },
  plants: {
    apple: 1,
    cinquefoil: 1,
    earOfWheat: 1,
    grapeBunch: 1,
    grapeBunch2: 1,
    mapleLeaf: 1,
    oak: 1,
    palmTree: 1,
    pear: 1,
    pineCone: 1,
    pineTree: 1,
    quatrefoil: 1,
    rose: 1,
    sextifoil: 1,
    thistle: 1,
    tree: 1,
    trefoil: 1,
    wheatStalk: 1
  },
  fantastic: {
    angel: 3,
    basilisk: 1,
    centaur: 1,
    dragonPassant: 3,
    dragonRampant: 2,
    eagleTwoHeads: 2,
    griffinPassant: 1,
    griffinRampant: 2,
    pegasus: 1,
    sagittarius: 1,
    serpent: 1,
    unicornRampant: 1,
    wyvern: 1,
    wyvernWithWingsDisplayed: 1
  },
  agriculture: {
    garb: 2,
    millstone: 1,
    plough: 1,
    ploughshare: 1,
    rake: 1,
    scythe: 1,
    scythe2: 1,
    sickle: 1
  },
  arms: {
    arbalest: 1,
    arbalest2: 1,
    arrow: 1,
    arrowsSheaf: 1,
    axe: 3,
    bow: 1,
    bowWithArrow: 2,
    bowWithThreeArrows: 1,
    cannon: 1,
    falchion: 1,
    flamberge: 1,
    flangedMace: 1,
    gauntlet: 1,
    gladius: 1,
    grenade: 1,
    hatchet: 3,
    helmet: 2,
    helmetCorinthian: 1,
    helmetGreat: 2,
    helmetZischagge: 1,
    lanceHead: 1,
    lanceWithBanner: 1,
    lochaberAxe: 1,
    mace: 1,
    maces: 1,
    mallet: 1,
    rapier: 1,
    sabre: 1,
    sabre2: 1,
    sabresCrossed: 1,
    shield: 1,
    spear: 1,
    sword: 4
  },
  bodyparts: {
    armEmbowedHoldingSabre: 1,
    armEmbowedVambraced: 1,
    armEmbowedVambracedHoldingSword: 1,
    bone: 1,
    crossedBones: 2,
    foot: 1,
    hand: 4,
    head: 1,
    headWreathed: 1,
    skeleton: 2,
    skull: 2,
    skull2: 1
  },
  people: {
    archer: 1,
    cavalier: 3,
    cossack: 1,
    monk: 1
  },
  architecture: {
    bridge: 1,
    bridge2: 1,
    castle: 2,
    castle2: 1,
    church: 1,
    column: 1,
    lighthouse: 1,
    palace: 1,
    pillar: 1,
    portcullis: 1,
    tower: 2,
    windmill: 1
  },
  seafaring: {
    anchor: 6,
    armillarySphere: 1,
    boat: 2,
    boat2: 1,
    caravel: 1,
    drakkar: 1,
    lymphad: 2,
    raft: 1,
    shipWheel: 1
  },
  tools: {
    anvil: 2,
    drawingCompass: 2,
    fan: 1,
    hook: 1,
    ladder: 1,
    ladder2: 1,
    pincers: 1,
    saw: 1,
    scale: 1,
    scaleImbalanced: 1,
    scalesHanging: 1,
    scissors: 1,
    scissors2: 1,
    shears: 1,
    trowel: 1
  },
  miscellaneous: {
    attire: 2,
    banner: 2,
    bell: 3,
    bookClosed: 1,
    bookClosed2: 1,
    bookOpen: 1,
    bucket: 1,
    buckle: 1,
    bugleHorn: 2,
    bugleHorn2: 1,
    chain: 2,
    chalice: 2,
    cowHorns: 3,
    crosier: 1,
    crown: 3,
    crown2: 2,
    drum: 1,
    fasces: 1,
    feather: 3,
    harp: 2,
    horseshoe: 3,
    hourglass: 2,
    key: 3,
    laurelWreath: 2,
    laurelWreath2: 1,
    log: 1,
    lute: 2,
    lyre: 1,
    mitre: 1,
    orb: 1,
    pot: 2,
    ramsHorn: 1,
    sceptre: 1,
    scrollClosed: 1,
    snowflake: 1,
    stagsAttires: 1,
    stirrup: 2,
    violin: 1,
    wheel: 3,
    wing: 2,
    wingSword: 1
  },
  inescutcheon: {
    inescutcheonHeater: 1,
    inescutcheonSpanish: 1,
    inescutcheonFrench: 1,
    inescutcheonHorsehead: 1,
    inescutcheonHorsehead2: 1,
    inescutcheonPolish: 1,
    inescutcheonHessen: 1,
    inescutcheonSwiss: 1,
    inescutcheonBoeotian: 1,
    inescutcheonRoman: 1,
    inescutcheonKite: 1,
    inescutcheonOldFrench: 1,
    inescutcheonRenaissance: 1,
    inescutcheonBaroque: 1,
    inescutcheonTarge: 1,
    inescutcheonTarge2: 1,
    inescutcheonPavise: 1,
    inescutcheonWedged: 1,
    inescutcheonEmbowed: 1,
    inescutcheonFlag: 1,
    inescutcheonPennon: 1,
    inescutcheonGuidon: 1,
    inescutcheonBanner: 1,
    inescutcheonDovetail: 1,
    inescutcheonGonfalon: 1,
    inescutcheonPennant: 1,
    inescutcheonRound: 1,
    inescutcheonOval: 1,
    inescutcheonVesicaPiscis: 1,
    inescutcheonSquare: 1,
    inescutcheonDiamond: 1,
    inescutcheonHexagon: 1,
    inescutcheonNo: 1,
    inescutcheonFantasy1: 1,
    inescutcheonFantasy2: 1,
    inescutcheonFantasy3: 1,
    inescutcheonFantasy4: 1,
    inescutcheonFantasy5: 1,
    inescutcheonNoldor: 1,
    inescutcheonGondor: 1,
    inescutcheonEasterling: 1,
    inescutcheonErebor: 1,
    inescutcheonIronHills: 1,
    inescutcheonUrukHai: 1,
    inescutcheonMoriaOrc: 1
  },
  ornaments: {
    mantle: 0,
    ribbon1: 3,
    ribbon2: 2,
    ribbon3: 1,
    ribbon4: 1,
    ribbon5: 1,
    ribbon6: 1,
    ribbon7: 1,
    ribbon8: 1
  },
  uploaded: {},
  data: chargeData
};

export const patternSize = {standard: 154, small: 20, smaller: 20, big: 5, smallest: 1};
