import {get} from "svelte/store";
import {changes, grid} from "data/stores";

export function drag(e, c, coa) {
  const el = e.currentTarget;
  const x0 = e.x,
    y0 = e.y;
  const sizeAdj = +el.closest("svg").getAttribute("width") / 200;
  document.addEventListener("mouseup", dragStop, {once: true});

  const x = c.x || 0;
  const y = c.y || 0;
  const size = c.size || 1;
  const angle = c.angle || 0;
  const gridSize = get(grid);

  if (e.shiftKey) {
    document.addEventListener("mousemove", resize);
    document.body.style.cursor = "ns-resize";
  } else if (e.ctrlKey || e.metaKey) {
    document.addEventListener("mousemove", rotate);
    document.body.style.cursor = "ew-resize";
  } else {
    document.addEventListener("mousemove", move);
    document.body.style.cursor = "move";
  }

  function move(e) {
    const dx = x + (e.x - x0) / sizeAdj;
    const dy = y + (e.y - y0) / sizeAdj;

    c.x = Math.round(dx / gridSize) * gridSize;
    c.y = Math.round(dy / gridSize) * gridSize;
    setTransform(el, c);
  }

  function resize(e) {
    const dy = y + (e.y - y0) / sizeAdj;
    c.size = round(size + dy / -100);
    setTransform(el, c);
    if (c.p) changes.add(JSON.stringify(coa));
  }

  function rotate(e) {
    const cx = x + 100,
      cy = y + 100;
    const x1 = e.x / sizeAdj,
      y1 = e.y / sizeAdj;

    let a = 90 + (Math.atan2(y1 - cy, x1 - cx) * 180) / Math.PI;
    if (a > 180) a = (a % 180) - 180;
    if (a < -179) a = (a % 180) + 180;

    c.angle = Math.round(a / gridSize) * gridSize;
    setTransform(el, c);
  }

  function setTransform(el, c) {
    const tr = transform(c);
    if (tr) el.setAttribute("transform", tr);
    else el.removeAttribute("transform");
  }

  function dragStop() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mousemove", rotate);
    document.body.style.cursor = "auto";
    changes.add(JSON.stringify(coa));
  }
}

function round(n) {
  return Math.round(n * 100) / 100;
}

export function transform(charge) {
  let {x = 0, y = 0, angle = 0, size = 1, p} = charge;
  if (p) size = 1; // size is defined on use element level

  if (size !== 1) {
    x = round(x + 100 - size * 100);
    y = round(y + 100 - size * 100);
  }

  let transform = "";
  if (x || y) transform += `translate(${x} ${y})`;
  if (angle) transform += ` rotate(${angle} ${size * 100} ${size * 100})`;
  if (size !== 1) transform += ` scale(${size})`;

  return transform ? transform.trim() : null;
}
