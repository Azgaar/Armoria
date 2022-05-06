export function isRaster(charge: string) {
  const el = document.getElementById(charge);
  return el ? el.tagName === "image" : false;
}
