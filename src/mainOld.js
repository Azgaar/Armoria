'use strict';

// generation routine
const options = defineInitialOptions();
generateGalleryOnload();

function defineInitialOptions() {
  const options = localStorage.getItem("Armoria") ? JSON.parse(localStorage.getItem("Armoria")) : {};
  if (!options.size) options.size = 150;
  if (!options.grad) options.grad = "grad3";
  if (!options.diaper) options.diaper = "damask1";
  if (!options.shield) options.shield = rw({"heater":40, "oldFrench":15, "spanish":20, "french":5, "swiss":2, "wedged":2, "italian":1, "renaissance":1, "baroque":1, "polish":1, "round":1, "square":1, "vesicaPiscis":1});
  return options;
}

function generateGalleryOnload() {
  const [n, w, h] = defineGallerySize(150);
  insertSVGelements(n, w, h);
  updateGalleryCoas(n);
}

// define number and size of coas to display
function defineGallerySize(desiredSize) {
  const width = window.innerWidth - 4;
  const height = window.innerHeight - document.querySelector("#navbar ul").offsetHeight;
  const numberX = Math.ceil(width / desiredSize);
  const w = Math.floor(width / numberX);
  const numberY = Math.floor(height / w);
  const h = Math.floor(height / numberY - 7);
  return [numberX * numberY, w, h];
}

function insertSVGelements(n, w, h) {
  let html = "";
  for (let i=1; i < n+1; i++) {
    html += `<svg id="coa${i}" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 200 200"></g></svg>`;
  }
  document.getElementById("gallery").insertAdjacentHTML("beforeend", html);
}

function updateGalleryCoas(n) {
  if (!n) n = document.getElementById("gallery").childElementCount;
  for (let i=1; i < n+1; i++) {
    Armoria.render(Armoria.getCOA(), "coa"+i);
  }
}
