import "svelte/elements";
declare module "svelte/elements" {
  interface SVGAttributes<T> {
    i?: number;
    charge?: string;
    "xmlns:dc"?: string;
    "xmlns:rdf"?: string;
  }
}
declare global {
  interface SVGPathElement {
    getPathData(options?: {normalize?: boolean}): {type: string; values: number[]}[];
  }
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{outcome: "accepted" | "dismissed"; platform: string}>;
  }
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}
