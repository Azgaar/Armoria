import type {ChancesObject} from "./tinctures";
export interface Template {
  template?: string;
  templateLined?: (line: string) => string;
  positions?: ChancesObject;
  positionsOn?: ChancesObject;
  positionsOff?: ChancesObject;
  line?: ChancesObject;
}
export interface ChargeData {
  colors?: number;
  sinister?: boolean;
  reversed?: boolean;
  layered?: boolean;
  natural?: string;
  positions?: ChancesObject;
}
export type Pattern = (id: string, c1: string, c2: string, size: number, chargeId?: string | false) => string;
export interface ShieldData {
  path: string;
  box?: string;
  size?: number;
  segments?: number[];
  positions?: Record<string, [number, number]>;
}
