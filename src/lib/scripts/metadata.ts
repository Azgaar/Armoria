// The coat of arms a downloaded image shows, kept inside the file: Fantasy Map Generator draws an uploaded
// emblem from it instead of the picture, and it marks the image as made in Armoria
export const COA_KEYWORD = "armoria-coa";

/** an SVG's metadata element holding the coat of arms */
export function coaMetadata(coa: string) {
  const metadata = document.createElementNS("http://www.w3.org/2000/svg", "metadata");
  metadata.setAttribute("class", COA_KEYWORD);
  metadata.textContent = coa;
  return metadata;
}

/** a PNG or JPEG with the coat of arms in a text chunk or comment; other formats are returned as they are */
export async function embedCoa(blob: Blob, coa: string): Promise<Blob> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const text = new TextEncoder().encode(coa);
  if (blob.type === "image/png") return new Blob([withPngText(bytes, text)], {type: blob.type});
  if (blob.type === "image/jpeg") return new Blob([withJpegComment(bytes, text)], {type: blob.type});
  return blob;
}

// an iTXt chunk before IEND: keyword, no compression, no language, UTF-8 text
function withPngText(png: Uint8Array, text: Uint8Array) {
  const keyword = new TextEncoder().encode(COA_KEYWORD);
  const data = concat(keyword, new Uint8Array([0, 0, 0, 0, 0]), text);
  const typed = concat(new TextEncoder().encode("iTXt"), data);
  const chunk = concat(uint32(data.length), typed, uint32(crc32(typed)));
  const iend = png.length - 12;
  return concat(png.subarray(0, iend), chunk, png.subarray(iend));
}

// a COM segment after the JFIF header, its text prefixed with the keyword
function withJpegComment(jpeg: Uint8Array<ArrayBuffer>, text: Uint8Array) {
  const data = concat(new TextEncoder().encode(`${COA_KEYWORD}:`), text);
  if (data.length > 65533) return jpeg;
  const segment = concat(new Uint8Array([0xff, 0xfe, (data.length + 2) >> 8, (data.length + 2) & 0xff]), data);
  const isJfif = jpeg[2] === 0xff && jpeg[3] === 0xe0;
  const at = isJfif ? 4 + ((jpeg[4] << 8) | jpeg[5]) : 2;
  return concat(jpeg.subarray(0, at), segment, jpeg.subarray(at));
}

function concat(...parts: Uint8Array[]) {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function uint32(value: number) {
  return new Uint8Array([value >>> 24, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff]);
}

const CRC_TABLE = Array.from({length: 256}, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
