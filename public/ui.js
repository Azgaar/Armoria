'use strict';

// menu
document.getElementById("shieldField").addEventListener("change", function() {
  if (this.value === "tincture") {
    document.getElementById("shieldSemy").style.display = "none";
    document.getElementById("shieldTincture2Select").style.display = "none";
    document.getElementById("shieldPattern").style.display = "none";
    document.getElementById("shieldPatternSize").style.display = "none";
  } else if (this.value === "pattern") {
    document.getElementById("shieldSemy").style.display = "none";
    document.getElementById("shieldTincture2Select").style.display = "inline-block";
    document.getElementById("shieldPattern").style.display = "inline-block";
    document.getElementById("shieldPatternSize").style.display = "inline-block";
  } else if (this.value === "semy") {
    document.getElementById("shieldPattern").style.display = "none";
    document.getElementById("shieldTincture2Select").style.display = "inline-block";
    document.getElementById("shieldSemy").style.display = "inline-block";
    document.getElementById("shieldPatternSize").style.display = "inline-block";
  }
});

document.getElementById("divisionField").addEventListener("change", function() {
  if (this.value === "tincture") {
    document.getElementById("divisionSemy").style.display = "none"; 
    document.getElementById("divisionTincture2Select").style.display = "none";
    document.getElementById("divisionPattern").style.display = "none";
    document.getElementById("divisionPatternSize").style.display = "none";
  } else if (this.value === "pattern") {
    document.getElementById("divisionSemy").style.display = "none";
    document.getElementById("divisionTincture2Select").style.display = "inline-block";
    document.getElementById("divisionPattern").style.display = "inline-block";
    document.getElementById("divisionPatternSize").style.display = "inline-block";
  } else if (this.value === "semy") {
    document.getElementById("divisionPattern").style.display = "none";
    document.getElementById("divisionTincture2Select").style.display = "inline-block";
    document.getElementById("divisionSemy").style.display = "inline-block";
    document.getElementById("divisionPatternSize").style.display = "inline-block";
  }
});

const linedOrdinaries = ["pale", "fess", "bend", "bendSinister", "chief", "bar", "gemelle", "fessCotissed", "fessDoubleCotissed", "bendlet", "bendletSinister", "terrace", "cross", "crossParted", "saltire", "saltireParted"];
document.getElementById("ordinarySelect").addEventListener("change", function() {
  const lined = linedOrdinaries.includes(this.value);
  document.getElementById("ordinaryLineSelect").style.display = lined ? "inline-block" : "none";
});

// document.getElementById("chargePositionSelect").addEventListener("change", function() {
//   document.getElementById("chargePositionInput").value = this.value;
// });

document.getElementById("menu").addEventListener("change", e => {
  Armoria.step = Armoria.history.length;
  updateHistoryButtons();
  Armoria.parseInputs();
});

document.getElementById("generateCOA").addEventListener("click", () => {
  Armoria.step = Armoria.history.length;
  Armoria.generate();
  updateHistoryButtons();
});

document.getElementById("back").addEventListener("click", function() {
  if (Armoria.history.length === 1 || Armoria.step === 0) return;
  Armoria.step = Armoria.step ? Armoria.step-1 : Armoria.history.length-2;
  const coa = Armoria.history[Armoria.step];
  Armoria.render(coa);
  Armoria.setInputs(coa);
  updateHistoryButtons();
});

document.getElementById("next").addEventListener("click", function() {
  if (Armoria.step === Armoria.history.length-1 || !Armoria.step) return;
  Armoria.step++;
  const coa = Armoria.history[Armoria.step];
  Armoria.render(coa);
  Armoria.setInputs(coa);
  updateHistoryButtons();
});

function updateHistoryButtons() {
  document.getElementById("next").disabled = Armoria.step >= Armoria.history.length-1;
  document.getElementById("back").disabled = !Armoria.step;
}

//document.getElementById("archive").addEventListener("click", Armoria.archive);

// download coa in svg
document.getElementById("downloadPNG").addEventListener("click", download);

async function download() {
  const url = await getURL();

  const link = document.createElement("a");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 400;
  canvas.height = 400;
  const img = new Image();
  img.src = url;

  img.onload = function() {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    link.download = "coa.png";
    canvas.toBlob(function(blob) {
        link.href = window.URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        window.setTimeout(function() {
          canvas.remove();
          window.URL.revokeObjectURL(link.href);
        }, 1000);
    });
  }
}

async function getURL() {
  const defs = document.getElementById("defs"); // source defs

  const clone = document.getElementById("coa").cloneNode(true); // clone svg
  const d = clone.getElementsByTagName("defs")[0]; // new defs
  const coa = JSON.parse(clone.getElementById("shield").getAttribute("coa"));

  clone.insertAdjacentHTML("beforeend", "<metadata xmlns='http://www.w3.org/2000/svg'>&lt;dc:format&gt;image/svg+xml&lt;/dc:format&gt;</metadata>");
  d.insertAdjacentHTML("beforeend", defs.getElementById(coa.shield).outerHTML);
  d.insertAdjacentHTML("beforeend", defs.getElementById(coa.grad).outerHTML);

  const serialized = (new XMLSerializer()).serializeToString(clone);
  const svg_xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>` + serialized;

  const blob = new Blob([svg_xml], {type: 'image/svg+xml;charset=utf-8'});
  const url = window.URL.createObjectURL(blob);
  window.setTimeout(() => window.URL.revokeObjectURL(url), 5000);
  return url;
}

// drag behaviour
function drag(e) {
  const grid = +document.getElementById("gridSize").value;
  if (!grid) return;
  const tr = parseTransform(this.getAttribute("transform"));
  const x0 = +tr[0] - e.x, y0 = +tr[2] - e.y, scale = +tr[3];

  const i = this.dataset.i ? this.dataset.i : "";
  let counter = null;
  if (this.dataset.type === "charge") counter = document.getElementById("counter"+i);
  if (this.dataset.type === "counter") counter = document.getElementById("charge"+i);
  const type = this.dataset.type === "counter" ? "charge" : this.dataset.type;
  const inputX = document.getElementById(`${type}ShiftXInput${i}`);
  const inputY = document.getElementById(`${type}ShiftYInput${i}`);

  e.on("drag", function(e) {
    const x = Math.round((x0 + e.x) / grid) * grid, y = Math.round((y0 + e.y) / grid) * grid;
    let tr = `translate(${x},${y})`;
    if (scale) tr+= `scale(${scale})`;
    this.setAttribute("transform", tr);
    if (counter) counter.setAttribute("transform", tr);
    if (inputX) inputX.value = x;
    if (inputY) inputY.value = y;
  });

  e.on("end", function() {
    Armoria.step = Armoria.history.length;
    updateHistoryButtons();
    Armoria.parseInputs();
  });
}

// for tests
d3.select("#canvas").on("mousemove", e => {const p = d3.pointer(e); x.value = ~~p[0]; y.value = ~~p[1]}).on("click", e => console.log(d3.pointer(e)));
d3.select("#coa").on("mousemove", e => {const p = d3.pointer(e); x.value = ~~p[0]; y.value = ~~p[1]});