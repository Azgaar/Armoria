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
    colors: 3
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
  catPassantGuardant: {
    colors: 2,
    sinister: true
  },
  cavalier: {
    colors: 3,
    sinister: true,
    positions: {e: 1}
  },
  chalice: {
    colors: 2
  },
  cinquefoil: {
    reversed: true
  },
  cock: {
    colors: 3,
    sinister: true
  },
  cowStatant: {
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
  fly: {
    colors: 3,
    natural: "sable",
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
  goat: {
    colors: 3,
    sinister: true
  },
  goutte: {
    reversed: true
  },
  grapeBunch: {
    colors: 3
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
  heron: {
    colors: 2,
    sinister: true
  },
  hindStatant: {
    colors: 2,
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
  porcupine: {
    colors: 2,
    sinister: true
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
  spiral: {
    sinister: true,
    reversed: true
  },
  squirrel: {
    sinister: true
  },
  stagPassant: {
    colors: 2,
    sinister: true
  },
  stirrup: {
    colors: 2
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
    conventional: 30,
    crosses: 10,
    animals: 2,
    animalHeads: 1,
    birds: 2,
    aquatic: 1,
    seafaring: 1,
    fantastic: 3,
    plants: 1,
    agriculture: 1,
    arms: 3,
    bodyparts: 1,
    people: 1,
    architecture: 1,
    miscellaneous: 3,
    inescutcheon: 3,
    ornaments: 0,
    uploaded: 0
  },
  single: {
    conventional: 12,
    crosses: 8,
    plants: 2,
    animals: 10,
    animalHeads: 2,
    birds: 4,
    aquatic: 2,
    seafaring: 2,
    fantastic: 7,
    agriculture: 1,
    arms: 6,
    bodyparts: 1,
    people: 2,
    architecture: 1,
    miscellaneous: 10,
    inescutcheon: 5,
    ornaments: 0,
    uploaded: 0
  },
  semy: {
    conventional: 4,
    crosses: 1
  },
  conventional: {
    lozenge: 2,
    fusil: 4,
    mascle: 4,
    rustre: 2,
    lozengeFaceted: 3,
    lozengePloye: 1,
    roundel: 4,
    roundel2: 3,
    annulet: 4,
    mullet: 5,
    mulletPierced: 1,
    mulletFaceted: 1,
    mullet4: 3,
    mullet6: 4,
    mullet6Pierced: 1,
    mullet6Faceted: 1,
    mullet7: 1,
    mullet8: 1,
    mullet10: 1,
    estoile: 1,
    compassRose: 1,
    billet: 5,
    delf: 0,
    triangle: 3,
    trianglePierced: 1,
    goutte: 4,
    heart: 4,
    pique: 2,
    carreau: 1,
    trefle: 2,
    fleurDeLis: 6,
    sun: 3,
    sunInSplendour: 1,
    sunInSplendour2: 1,
    moonInCrescent: 1,
    crescent: 5,
    fountain: 1
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
    ribbon4: 1
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
  animals: {
    lionRampant: 6,
    lionPassant: 2,
    lionPassantGuardant: 1,
    lionSejant: 1,
    wolfRampant: 1,
    wolfPassant: 1,
    wolfStatant: 1,
    greyhoundCourant: 1,
    greyhoundRampant: 1,
    greyhoundSejant: 1,
    mastiffStatant: 1,
    talbotPassant: 1,
    talbotSejant: 1,
    martenCourant: 1,
    boarRampant: 1,
    stagPassant: 1,
    hindStatant: 1,
    horseRampant: 2,
    horseSalient: 1,
    horsePassant: 1,
    bearRampant: 2,
    bearPassant: 1,
    bullPassant: 1,
    cowStatant: 1,
    goat: 1,
    lamb: 1,
    lambPassantReguardant: 1,
    agnusDei: 1,
    ramPassant: 1,
    badgerStatant: 1,
    elephant: 1,
    rhinoceros: 1,
    camel: 1,
    porcupine: 1,
    hedgehog: 1,
    catPassantGuardant: 1,
    rabbitSejant: 1,
    ratRampant: 1,
    squirrel: 1,
    frog: 1,
    snake: 1,
    crocodile: 1,
    lizard: 1,
    scorpion: 1,
    snail: 1,
    butterfly: 1,
    bee: 1,
    wasp: 1,
    fly: 1,
    dragonfly: 1,
    ladybird: 1
  },
  animalHeads: {
    wolfHeadErased: 2,
    bullHeadCaboshed: 1,
    deerHeadCaboshed: 1,
    donkeyHeadCaboshed: 1,
    lionHeadCaboshed: 2,
    lionHeadErased: 2,
    boarHeadErased: 1,
    horseHeadCouped: 1,
    ramHeadErased: 1,
    elephantHeadErased: 1
  },
  fantastic: {
    dragonPassant: 2,
    dragonRampant: 2,
    wyvern: 1,
    wyvernWithWingsDisplayed: 1,
    griffinPassant: 1,
    griffinRampant: 1,
    eagleTwoHeads: 2,
    unicornRampant: 1,
    pegasus: 1,
    serpent: 1,
    basilisk: 1,
    sagittarius: 1
  },
  birds: {
    eagle: 9,
    falcon: 2,
    raven: 2,
    cock: 3,
    parrot: 1,
    swan: 2,
    swanErased: 1,
    heron: 1,
    owl: 1,
    owlDisplayed: 1,
    dove: 2,
    doveDisplayed: 1,
    duck: 1,
    peacock: 1,
    peacockInPride: 1,
    swallow: 1
  },
  plants: {
    tree: 1,
    oak: 1,
    pineTree: 1,
    palmTree: 1,
    trefoil: 1,
    quatrefoil: 1,
    cinquefoil: 1,
    sextifoil: 1,
    mapleLeaf: 1,
    rose: 1,
    apple: 1,
    pear: 1,
    grapeBunch: 1,
    wheatStalk: 1,
    pineCone: 1
  },
  aquatic: {
    escallop: 5,
    pike: 1,
    plaice: 1,
    salmon: 1,
    cancer: 1,
    dolphin: 1
  },
  seafaring: {
    anchor: 6,
    boat: 2,
    boat2: 1,
    lymphad: 2,
    caravel: 1,
    drakkar: 1,
    armillarySphere: 1,
    shipWheel: 1
  },
  agriculture: {
    garb: 2,
    sickle: 1,
    scythe: 1,
    rake: 1,
    plough: 2
  },
  arms: {
    sword: 4,
    falchion: 1,
    rapier: 1,
    sabre: 1,
    sabresCrossed: 1,
    sabre2: 1,
    hatchet: 3,
    axe: 3,
    lochaberAxe: 1,
    spear: 1,
    mallet: 1,
    bowWithArrow: 3,
    bow: 1,
    arrow: 1,
    arrowsSheaf: 1,
    arbalest: 1,
    helmet: 2,
    helmetCorinthian: 1,
    helmetGreat: 2,
    gauntlet: 1,
    shield: 1,
    cannon: 1
  },
  bodyparts: {
    hand: 4,
    head: 1,
    headWreathed: 1,
    foot: 1,
    skull: 1
  },
  people: {
    cavalier: 3,
    archer: 1,
    monk: 1,
    angel: 2
  },
  architecture: {
    tower: 1,
    castle: 1,
    bridge: 1,
    column: 1,
    lighthouse: 1,
    windmill: 1
  },
  miscellaneous: {
    crown: 2,
    crown2: 1,
    laurelWreath: 1,
    mitre: 1,
    orb: 1,
    chalice: 1,
    key: 1,
    buckle: 1,
    bugleHorn: 1,
    bugleHorn2: 1,
    bell: 2,
    pot: 1,
    bucket: 1,
    horseshoe: 3,
    stirrup: 1,
    attire: 1,
    stagsAttires: 1,
    ramsHorn: 1,
    cowHorns: 2,
    wing: 1,
    wingSword: 1,
    lute: 1,
    harp: 1,
    lyre: 1,
    drum: 1,
    wheel: 2,
    crosier: 1,
    sceptre: 1,
    fasces: 1,
    log: 1,
    chain: 1,
    anvil: 1,
    ladder: 1,
    trowel: 1,
    banner: 1,
    bookClosed: 1,
    bookOpen: 1,
    scrollClosed: 1,
    feather: 1,
    drawingCompass: 1,
    scissors: 1,
    hourglass: 1,
    scale: 1,
    scaleImbalanced: 1,
    fan: 1,
    snowflake: 1,
    spiral: 1
  },
  uploaded: {},
  data: chargeData
};

export const patternSize = {standard: 154, small: 20, smaller: 20, big: 5, smallest: 1};
