export const DEFAULT_SIZE = 200;
export const DEFAULT_DIAPER = "no";
export const DEFAULT_GRADIENTS = ["luster", "spotlight", "backlight"];
export const DEFAULT_BORDER = "#333333";
export const DEFAULT_BORDER_WIDTH = 1;
export const DEFAULT_BACKGROUND = "#333333";
export const DEFAULT_SCALE = 2;
export const DEFAULT_ZOOM = 1;

export const DEFAULT_GRID = 1;
export const DEFAULT_SHOW_GRID = false;

export const DEFAULT_COLORS = {
  argent: "#fafafa",
  or: "#ffe066",
  gules: "#d7374a",
  sable: "#333333",
  azure: "#377cd7",
  vert: "#26c061",
  purpure: "#522d5b",
  murrey: "#85185b",
  sanguine: "#b63a3a",
  tenné: "#cc7f19"
};

export const DEFAULT_TINCTURES = {
  field: {metals: 32, colours: 49, stains: 1, patterns: 14},
  division: {metals: 35, colours: 49, stains: 1, patterns: 8},
  charge: {metals: 16, colours: 24, stains: 1, patterns: 0},
  metals: {argent: 3, or: 2},
  colours: {gules: 5, azure: 4, sable: 3, purpure: 3, vert: 2},
  stains: {murrey: 1, sanguine: 1, tenné: 1},
  patterns: {
    semy: 8,
    ermine: 6,
    vair: 4,
    counterVair: 1,
    vairInPale: 1,
    vairEnPointe: 2,
    vairAncien: 2,
    potent: 2,
    counterPotent: 1,
    potentInPale: 1,
    potentEnPointe: 1,
    chequy: 8,
    lozengy: 5,
    fusily: 2,
    pally: 8,
    barry: 10,
    gemelles: 1,
    bendy: 8,
    bendySinister: 4,
    palyBendy: 2,
    barryBendy: 1,
    pappellony: 2,
    pappellony2: 3,
    scaly: 1,
    plumetty: 1,
    masoned: 6,
    fretty: 3,
    grillage: 1,
    chainy: 1,
    maily: 2,
    honeycombed: 1
  }
};

export type Fonts = {
  [key: string]: {
    url?: string;
  };
};

// prettier-ignore
export const DEFAULT_FONTS: Fonts = {
  // google fonts
  "Almendra SC": {url: "https://fonts.gstatic.com/s/almendrasc/v13/Iure6Yx284eebowr7hbyTaZOrLQ.woff2"},
  Cinzel: {url: "https://fonts.gstatic.com/s/cinzel/v7/zOdksD_UUTk1LJF9z4tURA.woff2"},
  "Great Vibes": {url: "https://fonts.gstatic.com/s/greatvibes/v5/6q1c0ofG6NKsEhAc2eh-3Y4P5ICox8Kq3LLUNMylGO4.woff2"},
  "IM Fell English": {url: "https://fonts.gstatic.com/s/imfellenglish/v7/xwIisCqGFi8pff-oa9uSVAkYLEKE0CJQa8tfZYc_plY.woff2" },
  UnifrakturMaguntia: { url: "https://fonts.gstatic.com/s/unifrakturmaguntia/v16/WWXPlieVYwiGNomYU-ciRLRvEmK7oaVemGZM.woff2" },
  // web-safe fonts
  Arial: {},
  "Brush Script MT": {},
  "Courier New": {},
  Garamond: {},
  Georgia: {},
  Impact: {},
  "Times New Roman": {},
  Verdana: {}
};
