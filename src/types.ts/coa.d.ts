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

interface Charge {
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

interface ChargeElement {
  charge: string;
  t: string;
  p: string;
  size?: number;
  x?: number;
  y?: number;
  angle?: number;
  stroke?: string;
  reversed?: true;
  sinister?: true;
}

interface Ordinary {
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

type Divided = "field" | "division" | "counter";
