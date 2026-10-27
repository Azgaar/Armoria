import createDOMPurify from "dompurify";

const SVG_NS = "http://www.w3.org/2000/svg";
const fragment = /^#[A-Za-z_][\w:.-]*$/;
const localPaint = /^url\(\s*["']?(#[A-Za-z_][\w:.-]*)["']?\s*\)$/i;
const raster = /^data:image\/(?:png|jpeg|gif|webp|avif|bmp);base64,[a-z\d+/=\s]+$/i;
const presentation = [
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-dasharray",
  "stroke-dashoffset",
  "opacity",
  "color",
  "clip-path",
  "clip-rule",
  "mask",
  "stop-color",
  "stop-opacity",
  "display",
  "visibility",
  "vector-effect",
  "paint-order",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "text-anchor",
  "dominant-baseline"
];

// Only static presentation values and same-document paint servers are supported.
// Reject CSS escapes/comments as well as external URLs, including in inline styles.
function safePresentation(value: string) {
  return localPaint.test(value) || (/^[\w\s#.,%()+-]+$/.test(value) && !/url\s*\(/i.test(value));
}

let purifier: ReturnType<typeof createDOMPurify>;
function getPurifier() {
  if (purifier) return purifier;
  purifier = createDOMPurify(window);
  purifier.addHook("uponSanitizeAttribute", (node, data) => {
    const {attrName, attrValue} = data;
    if (attrName === "href" || attrName === "xlink:href") {
      data.keepAttr = fragment.test(attrValue) || (node.localName === "image" && raster.test(attrValue));
    } else if (attrName === "style") {
      const style = document.createElementNS(SVG_NS, "g").style;
      style.cssText = attrValue;
      data.attrValue = presentation
        .flatMap(property => {
          const value = style.getPropertyValue(property).trim();
          return value && safePresentation(value) ? [`${property}:${value}`] : [];
        })
        .join(";");
    } else if (presentation.includes(attrName)) {
      data.keepAttr = safePresentation(attrValue);
    } else if (attrName === "class") {
      data.attrValue = attrValue
        .split(/\s+/)
        .filter(name => name === "secondary" || name === "tertiary")
        .join(" ");
    }
  });
  return purifier;
}

/** Sanitize untrusted uploads before parsing, previewing, saving, or inserting into SVG definitions.
 * Supports static shapes, groups, text, local references, gradients, clips/masks and embedded raster images.
 * Scripts, HTML, animation, stylesheets, filters and external resources are deliberately unsupported.
 */
export function sanitizeSvg(markup: string): string {
  if (typeof window === "undefined" || typeof markup !== "string") return "";
  // Wrap fragments so legacy xlink references inherit their namespace. The inert
  // HTML parser also accepts XML declarations and editor-generated SVG markup.
  const clean = getPurifier().sanitize(`<svg xmlns="${SVG_NS}" xmlns:xlink="http://www.w3.org/1999/xlink">${markup}</svg>`, {
    RETURN_DOM_FRAGMENT: true,
    ALLOWED_NAMESPACES: [SVG_NS],
    ALLOWED_TAGS: [
      "svg",
      "g",
      "path",
      "circle",
      "ellipse",
      "rect",
      "line",
      "polygon",
      "polyline",
      "defs",
      "use",
      "image",
      "clipPath",
      "mask",
      "linearGradient",
      "radialGradient",
      "stop",
      "pattern",
      "title",
      "desc",
      "text",
      "tspan",
      "textPath"
    ],
    ALLOWED_ATTR: [
      "id",
      "class",
      "style",
      "transform",
      "d",
      "points",
      "x",
      "y",
      "x1",
      "y1",
      "x2",
      "y2",
      "cx",
      "cy",
      "r",
      "rx",
      "ry",
      "width",
      "height",
      "viewBox",
      "preserveAspectRatio",
      "href",
      "xlink:href",
      "xmlns",
      "xmlns:xlink",
      "gradientUnits",
      "gradientTransform",
      "spreadMethod",
      "offset",
      "fx",
      "fy",
      "fr",
      "patternUnits",
      "patternContentUnits",
      "patternTransform",
      "clipPathUnits",
      "maskUnits",
      "maskContentUnits",
      "dx",
      "dy",
      "rotate",
      "textLength",
      "lengthAdjust",
      "startOffset",
      "author",
      "source",
      "license",
      ...presentation
    ],
    ALLOW_ARIA_ATTR: false,
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: false
  });
  return clean.firstElementChild?.innerHTML ?? "";
}

/** Parse only sanitized markup in an SVG namespace, never raw HTML. */
export function parseUploadedSvg(markup: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.innerHTML = sanitizeSvg(markup);
  return svg;
}
