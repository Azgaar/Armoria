type Options = {
  executablePath: string;
};

declare module "convert-svg-to-jpeg" {
  export function createConverter(options: Options): {
    convert(svg: string): Promise<Buffer>;
  };
}

declare module "convert-svg-to-png" {
  export function createConverter(options: Options): {
    convert(svg: string): Promise<Buffer>;
  };
}
