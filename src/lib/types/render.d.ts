/** Settings owned by one render, independent of browser/editor stores. */
export interface RenderOptions {
  colors: Record<string, string>;
  shield: string;
  gradient: string;
  diaper: string;
  border: string;
  borderWidth: number;
}
