import type {number} from "svelte-i18n";

interface Tinctures {
  field: TinctureTypeChances;
  division: TinctureTypeChances;
  charge: TinctureTypeChances;
  metals: ChancesObject;
  colours: ChancesObject;
  stains: ChancesObject;
  patterns: ChancesObject;
}

interface TinctureTypeChances {
  metals: number;
  colours: number;
  stains: number;
  patterns: number;
}

interface ChancesObject {
  [key: string]: number;
}
