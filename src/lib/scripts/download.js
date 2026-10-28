import {get} from "svelte/store";
import {scale, fonts} from "$lib/data/stores";
import {coaMetadata, embedCoa} from "$lib/scripts/metadata";

export async function download(i, format = "png") {
  if (format === "json") {
    return downloadJSON(i);
  }

  const coas = i || i === 0 ? [document.getElementById("coa" + i)] : document.querySelectorAll("svg.coa");
  let {width, height} = coas[0].getBoundingClientRect();
  const numberX = coas.length > 1 ? Math.floor(window.innerWidth / width) : 1;
  const numberY = coas.length > 1 ? Math.ceil(coas.length / numberX) : 1;

  const scaleValue = get(scale);
  width = Math.round(width * scaleValue);
  height = Math.round(height * scaleValue);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width * numberX;
  canvas.height = height * numberY;

  let loaded = 0;
  coas.forEach(async function (svg, i) {
    const url = await getURL(svg, width, height);
    format === "svg" ? downloadVector(url) : downloadRaster(url, i);
  });

  function downloadVector(url) {
    const link = document.createElement("a");
    link.download = `armoria_${getTimestamp()}.svg`;
    link.href = url;
    link.click();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  }

  function downloadRaster(url, i) {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      ctx.drawImage(img, (i % numberX) * width, Math.floor(i / numberX) * height, width, height);
      loaded++;
      if (loaded === coas.length) drawCanvas(canvas, format, coas.length === 1 ? coas[0].getAttribute("data-coa") : null);
    };
  }

  function downloadJSON(coas) {
    const blob = new Blob([JSON.stringify(coas)], {type: "application/json"});
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const name = (coas.length === 1 && coas[0].name && coas[0].name.toLowerCase().replaceAll(/[^a-z]/g, "")) || "armoria";
    link.download = `${name}_${getTimestamp()}.json`;
    link.href = url;
    link.click();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  }
}

export async function getSvgForMap() {
  const svg = document.getElementById("coaEdit");
  if (!svg) throw new Error("No edited emblem is open");
  const url = await getURL(svg, 500, 500);
  try {
    const response = await fetch(url);
    return await response.text();
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function getURL(svg, width, height) {
  const clone = svg.cloneNode(true); // clone svg
  clone.setAttribute("width", width);
  clone.setAttribute("height", height);
  clone.removeAttribute("class");
  clone.removeAttribute("id");
  clone.removeAttribute("data-coa");
  if (svg.dataset.coa) clone.prepend(coaMetadata(svg.dataset.coa));
  const d = clone.getElementsByTagName("defs")[0];

  // remove grid and positions if any
  const grid = clone.getElementById("grid");
  const gridPattern = clone.getElementById("gridPattern");
  const positions = clone.getElementById("positions");
  if (grid) grid.remove();
  if (gridPattern) gridPattern.remove();
  if (positions) positions.remove();

  // remove inscription handles
  clone.querySelectorAll(".text-path").forEach(el => {
    el.setAttribute("stroke", "none");
  });
  clone.querySelectorAll(".points").forEach(el => {
    el.remove();
  });

  // Follow actual SVG references, including CSS-variable fills and dependencies
  // inside semy patterns. Each definition is copied once, even through cycles.
  const addedElements = new Set([...clone.querySelectorAll("[id]")].map(element => element.id));
  const definitions = document.getElementById("defs");
  addReferences(clone);

  /** @param {Element} root */
  function addReferences(root) {
    for (const element of [root, ...root.querySelectorAll("*")]) {
      for (const attribute of element.attributes) {
        if (attribute.localName === "href" && attribute.value.startsWith("#")) addDefinition(attribute.value.slice(1));
        for (const match of attribute.value.matchAll(/url\(#([^)]*)\)/g)) addDefinition(match[1]);
      }
    }
  }

  /** @param {string} id */
  function addDefinition(id) {
    if (addedElements.has(id)) return;
    addedElements.add(id);
    const source = document.getElementById(id);
    if (!source || !definitions?.contains(source)) return; // unavailable charges stay blank
    const definition = /** @type {Element} */ (source.cloneNode(true));
    for (const child of definition.querySelectorAll("[id]")) addedElements.add(child.id);
    d.appendChild(definition);
    addReferences(definition);
  }

  // load needed web fonts
  const usedFonts = getUsedWebFonts(clone);
  if (usedFonts.length) {
    const dataURLfonts = await loadFontsAsDataURI(usedFonts);

    const fontFaces = dataURLfonts
      .map(({family, src}) => {
        return `@font-face {font-family: "${family}"; src: ${src};}`;
      })
      .join("\n");

    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.innerHTML = fontFaces;
    clone.querySelector("defs").appendChild(style);
  }

  const serialized = new XMLSerializer().serializeToString(clone);
  // Keep text nodes intact, including whitespace-only inscription lines. Export
  // must not depend on optional browser XSLT support or XML pretty-printing.
  const blob = new Blob([serialized], {type: "image/svg+xml;charset=utf-8"});
  const url = window.URL.createObjectURL(blob);
  window.setTimeout(() => window.URL.revokeObjectURL(url), 6000);
  return url;
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} format
 * @param {string | null} coa
 */
function drawCanvas(canvas, format, coa) {
  canvas.toBlob(
    async blob => {
      if (!blob) return;
      const link = document.createElement("a");
      link.download = `armoria_${getTimestamp()}.${format}`;
      link.href = URL.createObjectURL(coa ? await embedCoa(blob, coa) : blob);
      link.click();

      setTimeout(function () {
        canvas.remove();
        URL.revokeObjectURL(link.href);
      }, 5000);
    },
    "image/" + format,
    0.92
  );
}

function getTimestamp() {
  const formatTime = time => (time < 10 ? "0" + time : time);
  const date = new Date();
  const year = date.getFullYear();
  const month = formatTime(date.getMonth() + 1);
  const day = formatTime(date.getDate());
  const hour = formatTime(date.getHours());
  const minutes = formatTime(date.getMinutes());
  const seconds = formatTime(date.getSeconds());
  return [year, month, day, hour, minutes, seconds].join("-");
}

function getUsedWebFonts(svg) {
  const usedFonts = new Set();
  const allFonts = get(fonts);

  for (const text of svg.querySelectorAll("text")) {
    const family = text.getAttribute("font-family");
    if (family && allFonts[family]?.url) usedFonts.add({family, url: allFonts[family].url});
  }
  return Array.from(usedFonts);
}

function readBlobAsDataURL(blob) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function loadFontsAsDataURI(fonts) {
  const promises = fonts.map(async font => {
    const resp = await fetch(font.url);
    const blob = await resp.blob();
    const dataURL = await readBlobAsDataURL(blob);

    return {family: font.family, src: `url('${dataURL}')`};
  });

  return await Promise.all(promises);
}
