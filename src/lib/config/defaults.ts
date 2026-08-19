export const DEFAULT_SIZE = 200;
export const DEFAULT_DIAPER = "no";
export const DEFAULT_GRADIENTS = ["luster", "spotlight", "backlight"];
export const DEFAULT_BORDER = "#333333";
export const DEFAULT_BORDER_WIDTH = 1;
export const DEFAULT_BACKGROUND = "#333333";
export const DEFAULT_FONT_COLOR = "#f1f1f1";
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
  carnation: "#eabfa2",
  celeste: "#96c8fa",
  cendrée: "#777777",
  murrey: "#85185b",
  sanguine: "#b63a3a",
  tenné: "#cc7f19"
};

export const DEFAULT_TINCTURES = {
  field: {metals: 32, colours: 49, stains: 1, patterns: 14},
  division: {metals: 35, colours: 49, stains: 1, patterns: 8},
  charge: {metals: 16, colours: 24, stains: 1, patterns: 0},
  metals: {argent: 3, or: 2},
  colours: {gules: 5, azure: 4, sable: 3, purpure: 3, vert: 2, carnation: 0, celeste: 0, cendrée: 0},
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

export const DEFAULT_FONTS: Fonts = {
  // google fonts
  "Almendra SC": {url: "https://fonts.gstatic.com/s/almendrasc/v13/Iure6Yx284eebowr7hbyTaZOrLQ.woff2"},
  Amarante: {url: "https://fonts.gstatic.com/s/amarante/v22/xMQXuF1KTa6EvGx9bp-wAXs.woff2"},
  "Amatic SC": {url: "https://fonts.gstatic.com/s/amaticsc/v11/TUZ3zwprpvBS1izr_vOMscGKfrUC.woff2"},
  "Arima Madurai": {url: "https://fonts.gstatic.com/s/arimamadurai/v14/t5tmIRoeKYORG0WNMgnC3seB3T7Prw.woff2"},
  "Architects Daughter": {url: "https://fonts.gstatic.com/s/architectsdaughter/v8/RXTgOOQ9AAtaVOHxx0IUBM3t7GjCYufj5TXV5VnA2p8.woff2"},
  Bitter: {url: "https://fonts.gstatic.com/s/bitter/v12/zfs6I-5mjWQ3nxqccMoL2A.woff2"},
  "Caesar Dressing": {url: "https://fonts.gstatic.com/s/caesardressing/v6/yYLx0hLa3vawqtwdswbotmK4vrRHdrz7.woff2"},
  Cinzel: {url: "https://fonts.gstatic.com/s/cinzel/v7/zOdksD_UUTk1LJF9z4tURA.woff2"},
  "Dancing Script": {url: "https://fonts.gstatic.com/s/dancingscript/v9/KGBfwabt0ZRLA5W1ywjowUHdOuSHeh0r6jGTOGdAKHA.woff2"},
  "Eagle Lake": {url: "https://fonts.gstatic.com/s/eaglelake/v24/ptRMTiqbbuNJDOiKj9wG1On4KCFtpe4.woff2"},
  "Faster One": {url: "https://fonts.gstatic.com/s/fasterone/v17/H4ciBXCHmdfClFb-vWhf-LyYhw.woff2"},
  Forum: {url: "https://fonts.gstatic.com/s/forum/v16/6aey4Ky-Vb8Ew8IROpI.woff2"},
  "Fredericka the Great": {url: "https://fonts.gstatic.com/s/frederickathegreat/v6/9Bt33CxNwt7aOctW2xjbCstzwVKsIBVV--Sjxbc.woff2"},
  "Gloria Hallelujah": {url: "https://fonts.gstatic.com/s/gloriahallelujah/v9/CA1k7SlXcY5kvI81M_R28cNDay8z-hHR7F16xrcXsJw.woff2"},
  "Great Vibes": {url: "https://fonts.gstatic.com/s/greatvibes/v5/6q1c0ofG6NKsEhAc2eh-3Y4P5ICox8Kq3LLUNMylGO4.woff2"},
  "Henny Penny": {url: "https://fonts.gstatic.com/s/hennypenny/v17/wXKvE3UZookzsxz_kjGSfPQtvXI.woff2"},
  "IM Fell English": {url: "https://fonts.gstatic.com/s/imfellenglish/v7/xwIisCqGFi8pff-oa9uSVAkYLEKE0CJQa8tfZYc_plY.woff2"},
  "Kelly Slab": {url: "https://fonts.gstatic.com/s/kellyslab/v15/-W_7XJX0Rz3cxUnJC5t6fkQLfg.woff2"},
  Kranky: {url: "https://fonts.gstatic.com/s/kranky/v24/hESw6XVgJzlPsFn8oR2F.woff2"},
  "Lobster Two": {url: "https://fonts.gstatic.com/s/lobstertwo/v18/BngMUXZGTXPUvIoyV6yN5-fN5qU.woff2"},
  Lugrasimo: {url: "https://fonts.gstatic.com/s/lugrasimo/v4/qkBXXvoF_s_eT9c7Y7au455KsgbLMA.woff2"},
  "Kaushan Script": {url: "https://fonts.gstatic.com/s/kaushanscript/v6/qx1LSqts-NtiKcLw4N03IEd0sm1ffa_JvZxsF_BEwQk.woff2"},
  Macondo: {url: "https://fonts.gstatic.com/s/macondo/v21/RrQQboN9-iB1IXmOe2LE0Q.woff2"},
  MedievalSharp: {url: "https://fonts.gstatic.com/s/medievalsharp/v9/EvOJzAlL3oU5AQl2mP5KdgptMqhwMg.woff2"},
  "Metal Mania": {url: "https://fonts.gstatic.com/s/metalmania/v22/RWmMoKWb4e8kqMfBUdPFJdXFiaQ.woff2"},
  Metamorphous: {url: "https://fonts.gstatic.com/s/metamorphous/v7/Wnz8HA03aAXcC39ZEX5y133EOyqs.woff2"},
  Montez: {url: "https://fonts.gstatic.com/s/montez/v8/aq8el3-0osHIcFK6bXAPkw.woff2"},
  "Nova Script": {url: "https://fonts.gstatic.com/s/novascript/v10/7Au7p_IpkSWSTWaFWkumvlQKGFw.woff2"},
  Orbitron: {url: "https://fonts.gstatic.com/s/orbitron/v9/HmnHiRzvcnQr8CjBje6GQvesZW2xOQ-xsNqO47m55DA.woff2"},
  Oregano: {url: "https://fonts.gstatic.com/s/oregano/v13/If2IXTPxciS3H4S2oZDVPg.woff2"},
  "Pirata One": {url: "https://fonts.gstatic.com/s/pirataone/v22/I_urMpiDvgLdLh0fAtofhi-Org.woff2"},
  Sail: {url: "https://fonts.gstatic.com/s/sail/v16/DPEjYwiBxwYJJBPJAQ.woff2"},
  Satisfy: {url: "https://fonts.gstatic.com/s/satisfy/v8/2OzALGYfHwQjkPYWELy-cw.woff2"},
  "Shadows Into Light": {url: "https://fonts.gstatic.com/s/shadowsintolight/v7/clhLqOv7MXn459PTh0gXYFK2TSYBz0eNcHnp4YqE4Ts.woff2"},
  Tapestry: {url: "https://fonts.gstatic.com/s/macondo/v21/RrQQboN9-iB1IXmOe2LE0Q.woff2"},
  "Uncial Antiqua": {url: "https://fonts.gstatic.com/s/uncialantiqua/v5/N0bM2S5WOex4OUbESzoESK-i-MfWQZQ.woff2"},
  Underdog: {url: "https://fonts.gstatic.com/s/underdog/v6/CHygV-jCElj7diMroWSlWV8.woff2"},
  UnifrakturMaguntia: {url: "https://fonts.gstatic.com/s/unifrakturmaguntia/v16/WWXPlieVYwiGNomYU-ciRLRvEmK7oaVemGZM.woff2"},
  Yellowtail: {url: "https://fonts.gstatic.com/s/yellowtail/v8/GcIHC9QEwVkrA19LJU1qlPk_vArhqVIZ0nv9q090hN8.woff2"},
  // web-safe fonts
  Arial: {},
  "Brush Script MT": {},
  "Century Gothic": {},
  "Comic Sans MS": {},
  Copperplate: {},
  "Courier New": {},
  Garamond: {},
  Georgia: {},
  Herculanum: {},
  Impact: {},
  Papyrus: {},
  "Party LET": {},
  "Times New Roman": {},
  Verdana: {}
};
