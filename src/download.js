import { get } from 'svelte/store';
import { background, scale, shield, grad, diaper } from './stores';

export async function download(i) {
  const coas = i !== undefined ? [document.getElementById("coa" + i)] : document.querySelectorAll("svg.coa");
  let width = +coas[0].getAttribute("width");
  let height = +coas[0].getAttribute("height");
  const numberX = coas.length > 1 ? Math.floor(window.innerWidth / width) : 1;
  const numberY = coas.length > 1 ? Math.ceil(coas.length / numberX) : 1;

  const scaleValue = get(scale);
  width = Math.round(width * scaleValue);
  height = Math.round(height * scaleValue);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width * numberX;
  canvas.height = height * numberY;
  ctx.fillStyle = get(background);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let loaded = 0;
  coas.forEach(async function (svg, i) {
    const url = await getURL(svg);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      ctx.drawImage(img, i % numberX * width, Math.floor(i / numberX) * height, width, height);
      loaded++;
      if (loaded === coas.length) drawCanvas(canvas);
    }
  });
}

async function getURL(svg) {
  const clone = svg.cloneNode(true); // clone svg
  const d = clone.getElementsByTagName("defs")[0];

  // remove grid if any
  const grid = clone.getElementById("grid");
  const gridPattern = clone.getElementById("gridPattern");
  if (grid) grid.remove();
  if (gridPattern) gridPattern.remove();

  const sh = get(shield), gr = get(grad), di = get(diaper);
  d.insertAdjacentHTML("beforeend", defs.getElementById(sh).outerHTML);
  if (gr) d.insertAdjacentHTML("beforeend", defs.getElementById(gr).outerHTML);
  if (di) d.insertAdjacentHTML("beforeend", defs.getElementById(di).outerHTML);
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
  return url;
}

function drawCanvas(canvas) {
  const link = document.createElement("a");
  link.download = "armoria_download.png";
  canvas.toBlob(function (blob) {
    console.log(blob);
    link.href = window.URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    setTimeout(function () {
      canvas.remove();
      window.URL.revokeObjectURL(link.href);
    }, 5000);
  });
}

