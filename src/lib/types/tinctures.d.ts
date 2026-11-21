export interface Tinctures {
  field: TinctureTypeChances;
  division: TinctureTypeChances;
  charge: TinctureTypeChances;
  metals: ChancesObject;
  colours: ChancesObject;
  stains: ChancesObject;
  patterns: ChancesObject;
}

export interface TinctureTypeChances {
  metals: number;
  colours: number;
  stains: number;
  patterns: number;
}

export interface ChancesObject {
  [key: string]: number;
}
