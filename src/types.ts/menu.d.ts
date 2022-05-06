export interface Menu {
  field: Field;
  division: Division;
  ordinaries: Ordinary[];
  charges: Charge[];
}

interface Field {
  t1: string;
  t2: string;
  type: FieldType;
  charge: string;
  pattern: string;
  size: FieldSize;
  semy: string;
}

export type FieldType = "tincture" | "pattern" | "semy";

export type FieldSize = "smallest" | "smaller" | "small" | "standard" | "big" | "bigger";

interface Division {
  t1: string;
  t2: string;
  division: string;
  line: string;
  type: FieldType;
  charge: string;
  pattern: string;
  size: FieldSize;
  semy: string;
}

interface Ordinary {
  ordinary: string;
  t: string;
  line: string;
  divided: Divided;
  size: number;
  x: number;
  y: number;
  angle: number;
  above: boolean;
  stroke: string;
  strokeWidth: number;
  showStroke: boolean;
}

interface Charge {
  charge: string;
  type: string;
  t: string;
  p: string;
  elements: ChargeElement[];
  divided: Divided;
  size: number;
  x: number;
  y: number;
  angle: number;
  stroke: string;
  reversed: boolean;
  sinister: boolean;
  showStroke: boolean;
}

type ChargeElement = Omit<Charge, "elements", "divided">;

export type Divided = "field" | "division" | "counter" | "";
