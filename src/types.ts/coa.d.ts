export interface Coa {
  seed?: number | string;
  t1: string;
  shield?: string;
  division?: Division;
  ordinaries?: Ordinary[];
  charges?: Charge[];
  diaper?: string;
}

interface Division {
  division: string;
  t: string;
  line: string;
}

export interface Ordinary {
  ordinary: string;
  t: string;
  line?: string;
  divided?: Divided;
  size?: number;
  x?: number;
  y?: number;
  angle?: number;
  above?: true;
  stroke?: string;
  strokeWidth?: number;
}

export interface Charge {
  charge: string;
  t: string;
  p: string;
  elements?: ChargeElement[];
  divided?: Divided;
  size?: number;
  x?: number;
  y?: number;
  angle?: number;
  stroke?: string;
  reversed?: true;
  sinister?: true;
}

type ChargeElement = Omit<Charge, "elements", "divided">;

type Divided = "field" | "division" | "counter";
