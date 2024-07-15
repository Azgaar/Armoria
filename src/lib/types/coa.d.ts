export interface Coa {
  seed?: number | string;
  t1: string;
  shield?: string;
  division?: Division;
  ordinaries?: Ordinary[];
  charges?: Charge[];
  inscriptions?: Inscription[];
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
  t2?: string;
  t3?: string;
  p: string;
  divided?: Divided;
  size?: number;
  x?: number;
  y?: number;
  angle?: number;
  stroke?: string;
  reversed?: true;
  sinister?: true;
  layered?: true;
  outside?: Outside;
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
}

interface Inscription {
  text: string;
  font: string;
  bold?: true;
  italic?: true;
  size: number;
  spacing?: number;
  color: string;
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

interface Inscription {
  text: string;
  font: string;
  size: number;
  bold: true;
  italic: true;
  spacing: number;
  color: string;
  path: string;
}
