import {get} from "svelte/store";
import {scale, grad, diaper, fonts} from "data/stores";

const isFirefox = navigator.userAgent.includes("Firefox");

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
      if (loaded === coas.length) drawCanvas(canvas, format);
    };
  }

  function downloadJSON(coas) {
    const blob = new Blob([JSON.stringify(coas)], {type: "application/json"});
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const name = coas.length === 1 && coas[0].name && coas[0].name.toLowerCase().replaceAll(/[^a-z]/g, "") || "armoria";
    link.download = `${name}_${getTimestamp()}.json`;
    link.href = url;
    link.click();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  }
}

async function getURL(svg, width, height) {
  const addedElements = {};
  const clone = svg.cloneNode(true); // clone svg
  clone.setAttribute("width", width);
  clone.setAttribute("height", height);
  clone.removeAttribute("class");
  clone.removeAttribute("id");
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

  const gr = get(grad),
    di = get(diaper);
  if (gr && gr !== "no") d.insertAdjacentHTML("beforeend", defs.getElementById(gr).outerHTML);
  if (di && di !== "no") d.insertAdjacentHTML("beforeend", defs.getElementById(di).outerHTML);
  clone.querySelectorAll(".charge[charge]").forEach(el => {
    const chargePattern = el.getAttribute("fill").split("(#")[1]?.split(")")[0];
    if (chargePattern) addPattern(chargePattern, d);
    const charge = el.getAttribute("charge");
    if (addedElements[charge]) return;
    d.insertAdjacentHTML("beforeend", defs.getElementById(charge).outerHTML);
    addedElements[charge] = true;
  });
  clone.querySelectorAll(".ordinary").forEach(el => {
    const ordinaryPattern = el.getAttribute("fill").split("(#")[1]?.split(")")[0];
    if (ordinaryPattern) addPattern(ordinaryPattern, d);
  });
  const fieldPattern = clone.getElementsByClassName("field")[0].getAttribute("fill").split("(#")[1]?.split(")")[0];
  if (fieldPattern) addPattern(fieldPattern, d);
  const divisionPattern = clone.getElementsByClassName("division")[0]?.querySelector("rect").getAttribute("fill").split("(#")[1]?.split(")")[0];
  if (divisionPattern) addPattern(divisionPattern, d);

  function addPattern(pattern, d) {
    if (addedElements[pattern]) return;
    d.insertAdjacentHTML("beforeend", document.getElementById(pattern).outerHTML);

    if (pattern.slice(0, 4) === "semy") {
      const charge = pattern.match(/semy_of_(.*?)-/)[1];
      if (!addedElements[charge]) {
        d.insertAdjacentHTML("beforeend", document.getElementById(charge).outerHTML);
        addedElements[charge] = true;
      }
    }
    addedElements[pattern] = true;
  }

  // load needed web fonts
  const usedFonts = getUsedWebFonts(clone);
  if (usedFonts) {
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
  const pretty = isFirefox ? serialized : prettify(serialized); // don't prettify in Firefox
  const blob = new Blob([pretty], {type: "image/svg+xml;charset=utf-8"});
  const url = window.URL.createObjectURL(blob);
  window.setTimeout(() => window.URL.revokeObjectURL(url), 6000);
  return url;
}

function drawCanvas(canvas, format) {
  const link = document.createElement("a");
  link.download = `armoria_${getTimestamp()}.${format}`;

  const URL = canvas.toDataURL("image/" + format, 0.92);
  link.href = URL;
  link.click();

  setTimeout(function () {
    canvas.remove();
    window.URL.revokeObjectURL(link.href);
  }, 5000);
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

function prettify(source) {
  const xmlDoc = new DOMParser().parseFromString(source, "image/svg+xml");
  const xsltDoc = new DOMParser().parseFromString(
    [
      '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
      '  <xsl:strip-space elements="*"/>',
      '  <xsl:template match="para[content-style][not(text())]">',
      '    <xsl:value-of select="normalize-space(.)"/>',
      "  </xsl:template>",
      '  <xsl:template match="node()|@*">',
      '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
      "  </xsl:template>",
      '  <xsl:output indent="yes"/>',
      "</xsl:stylesheet>"
    ].join("\n"),
    "application/xml"
  );

  const xsltProcessor = new XSLTProcessor();
  xsltProcessor.importStylesheet(xsltDoc);
  const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
  const resultXml = new XMLSerializer().serializeToString(resultDoc);
  return resultXml;
}

function getUsedWebFonts(svg) {
  const usedFonts = new Set();
  const allFonts = get(fonts);

  for (const text of svg.querySelectorAll("text")) {
    const family = text.getAttribute("font-family");
    if (family && allFonts[family]?.url)
      usedFonts.add({family, url: allFonts[family].url});
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
