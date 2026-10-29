import type {Divided, Outside, Shadow} from "./coa";
export interface Field {
  type: string;
  t1: string;
  t2: string;
  pattern: string;
  charge: string;
  category: string;
  size: string;
}
export interface Transform {
  size: number;
  stretch: number;
  x: number;
  y: number;
  angle: number;
}
export interface EditorOrdinary extends Transform {
  ordinary: string;
  field: Field;
  line: string;
  showStroke: boolean;
  stroke: string;
  strokeWidth: number;
  divided: Divided | "";
  above: boolean;
  striped: string;
  componySize: number;
  gyronnyNumber: number;
  t2?: string;
}
export interface EditorCharge extends Transform {
  charge: string;
  type: string;
  showStroke: boolean;
  stroke: string;
  divided: Divided | "";
  field1: Field;
  field2?: Field;
  field3?: Field;
  p: string;
  sinister: boolean;
  reversed: boolean;
  layered: boolean;
  outside: Outside | "";
}
export interface EditorInscription {
  text: string;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  spacing: number;
  color: string;
  path: string;
  shadow?: Shadow;
}
export interface EditorMenu {
  shield?: string;
  name?: string;
  zoom: number;
  field: Field;
  division: Field & {division: string; line: string};
  ordinaries: EditorOrdinary[];
  charges: EditorCharge[];
  inscriptions: EditorInscription[];
}
