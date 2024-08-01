declare module "convert-svg-to-jpeg" {
  export function createConverter(): {
    convert(svg: string): Promise<Buffer>;
  };
}

declare module "convert-svg-to-png" {
  export function createConverter(): {
    convert(svg: string): Promise<Buffer>;
  };
}
