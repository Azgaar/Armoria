import type {Tinctures} from "./tinctures";
export interface GenerationConfig {
  usedPattern: string | null;
  usedTinctures: string[];
  tData: Tinctures;
  divisioned: boolean | null;
  ordinary: string | null;
}
