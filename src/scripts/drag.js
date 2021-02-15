import {get} from "svelte/store";
import {changes, grid} from "../stores";

export function drag(e, c, coa) {
  const el = e.currentTarget;
  const [a0, x0, y0] = parseTransform(el.getAttribute("transform"));
  const x1 = e.x, y1 = e.y;
  const sizeAdj = +el.closest("svg").getAttribute("width") / 200;
  document.addEventListener("mouseup", dragStop, { once: true });

  const size = c.size || 1;
  const angle = c.angle || 0;
  const rad = -a0 * (Math.PI / 180);
  const cosAngle = Math.cos(rad);
  const sinAngle = Math.sin(rad);
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
  };

  function move(e) {
    const dx = x0 + (e.x - x1) / sizeAdj;
    const dy = y0 + (e.y - y1) / sizeAdj;

    const relX = (dx * cosAngle) - (dy * sinAngle);
    const relY = (dx * sinAngle) + (dy * cosAngle);

    c.x = Math.round(relX / gridSize) * gridSize;
    c.y = Math.round(relY / gridSize) * gridSize;
    setTransform(el, c);
  }

  function resize(e) {
    const dy = y0 + (e.y - y1) / sizeAdj;
    c.size = size + Math.round(dy) / -100;
    setTransform(el, c);
    if (c.p) changes.add(JSON.stringify(coa));
  }

  function rotate(e) {
    const dx = x0 + (e.x - x1) / sizeAdj;
    let a = angle + Math.round(dx / 1.8);
    if (a > 180) a = a % 180 - 180;
    if (a < -179) a = a % 180 + 180;
    c.angle = a;
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

export function transform(c) {
  if (!c.x && !c.y && !c.angle && !c.size) return null;

  // charges have c.p and have size on use level, not on g level
  const size = c.p ? 1 : c.size;
  return `rotate(${c.angle||0}) translate(${c.x||0} ${c.y||0}) scale(${size||1})`;
}

function parseTransform(string) {
  if (!string) { return [0, 0, 0, 0, 0, 1]; }
  const a = string.replace(/[a-z()]/g, "").replace(/[ ]/g, ",").split(",");
  return [+a[0] || 0, +a[1] || 0, +a[2] || 0, +a[3] || 0, +a[4] || 0, +a[5] || 1];
}