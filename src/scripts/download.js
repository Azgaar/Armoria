import { get } from 'svelte/store';
import { scale, grad, diaper } from '../data/stores';

export async function download(i, format = "png") {
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
    window.setTimeout(() => window.URL.revokeObjectURL(URL), 5000);
  }

  function downloadRaster(url, i) {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      ctx.drawImage(img, i % numberX * width, Math.floor(i / numberX) * height, width, height);
      loaded++;
      if (loaded === coas.length) drawCanvas(canvas, format);
    }
  }
}

async function getURL(svg, width, height) {
  const clone = svg.cloneNode(true); // clone svg
  clone.setAttribute("width", width);
  clone.setAttribute("height", height);
  clone.removeAttribute("class");
  clone.removeAttribute("id");
  const d = clone.getElementsByTagName("defs")[0];

  // remove grid if any
  const grid = clone.getElementById("grid");
  const gridPattern = clone.getElementById("gridPattern");
  if (grid) grid.remove();
  if (gridPattern) gridPattern.remove();

  const gr = get(grad), di = get(diaper);
  if (gr) d.insertAdjacentHTML("beforeend", defs.getElementById(gr).outerHTML);
  if (di && di !== "no") d.insertAdjacentHTML("beforeend", defs.getElementById(di).outerHTML);
  clone.querySelectorAll(".charge[charge]").forEach(el => {
    const charge = el.getAttribute("charge");
    d.insertAdjacentHTML("beforeend", defs.getElementById(charge).outerHTML);
  });
  const fieldPattern = clone.getElementById("field").getAttribute("fill").split("(#")[1]?.split(")")[0];
  if (fieldPattern) d.insertAdjacentHTML("beforeend", document.getElementById(fieldPattern).outerHTML);
  const divisionPattern = clone.getElementById("division")?.querySelector("rect").getAttribute("fill").split("(#")[1]?.split(")")[0];
  if (divisionPattern) d.insertAdjacentHTML("beforeend", document.getElementById(divisionPattern).outerHTML);

  const serialized = (new XMLSerializer()).serializeToString(clone);
  const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  window.setTimeout(() => window.URL.revokeObjectURL(url), 6000);
  return url;
}

function drawCanvas(canvas, format) {
  const link = document.createElement("a");
  link.download = `armoria_${getTimestamp()}.${format}`;

  const URL = canvas.toDataURL("image/" + format, .92);
  link.href = URL;
  link.click();

  setTimeout(function() {
    canvas.remove();
    window.URL.revokeObjectURL(link.href);
  }, 5000);
}

function getTimestamp() {
  const formatTime = time => time < 10 ? "0" + time : time;
  const date = new Date();
  const year = date.getFullYear();
  const month = formatTime(date.getMonth() + 1);
  const day = formatTime(date.getDate());
  const hour = formatTime(date.getHours());
  const minutes = formatTime(date.getMinutes());
  const seconds = formatTime(date.getSeconds());
  return [year, month, day, hour, minutes, seconds].join('-');
}
