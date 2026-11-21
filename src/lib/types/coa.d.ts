export interface Coa {
  name?: string;
  seed?: number | string;
  t1: string;
  shield?: string;
  division?: Division;
  ordinaries?: Ordinary[];
  charges?: Charge[];
  inscriptions?: Inscription[];
  diaper?: string;
  zoom?: number;
}

interface Division {
  division: string;
  t: string;
  line?: string;
}

interface Charge {
  charge: string;
  t: string;
  t2?: string;
  t3?: string;
  p: string;
  divided?: Divided;
  size?: number;
  stretch?: number;
  x?: number;
  y?: number;
  angle?: number;
  stroke?: string;
  strokeWidth?: number;
  reversed?: boolean | 0 | 1;
  sinister?: boolean | 0 | 1;
  layered?: boolean | 0 | 1;
  outside?: Outside;
}

interface Ordinary {
  ordinary: string;
  t: string;
  t2?: string;
  line?: string;
  divided?: Divided;
  size?: number;
  stretch?: number;
  x?: number;
  y?: number;
  angle?: number;
  above?: boolean | 0 | 1;
  stroke?: string;
  strokeWidth?: number;
  compony?: number;
  gyronny?: number;
}

interface Inscription {
  text: string;
  font: string;
  bold?: boolean | 0 | 1;
  italic?: boolean | 0 | 1;
  size: number;
  spacing?: number;
  color?: string;
  path: string;
  shadow?: Shadow;
}

interface Shadow {
  x: number;
  y: number;
  blur: number;
  color: string;
}

type Divided = "field" | "division" | "counter";
type Outside = "above" | "below" | "around";
