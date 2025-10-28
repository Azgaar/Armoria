import {get} from "svelte/store";
import {changes, grid, shield} from "data/stores";
import {shields} from "data/dataModel";

export function drag(
  event,
  charge,
  coa,
  options = {move: true, resize: true, rotate: true, onMove: undefined, onEnd: undefined}
) {
  const el = event.currentTarget;
  const x0 = event.x;
  const y0 = event.y;

  const sizeAdj = el.closest("svg").clientWidth / 200;
  document.addEventListener("mouseup", stopDragging, {once: true});

  const {x = 0, y = 0, size = 1} = charge;
  const gridSize = get(grid);
  const positionElements = el.querySelectorAll("use");
  const positions = shields.data[get(shield)].positions || shields.data.spanish.positions;

  if (options.resize && event.shiftKey) {
    document.addEventListener("mousemove", resize);
    document.body.style.cursor = "ns-resize";
  } else if (options.rotate && (event.ctrlKey || event.metaKey)) {
    document.addEventListener("mousemove", rotate);
    document.body.style.cursor = "ew-resize";
  } else if (options.move) {
    document.addEventListener("mousemove", move);
    document.body.style.cursor = "move";
  }

  function move(event) {
    const dx = x + (event.x - x0) / sizeAdj;
    const dy = y + (event.y - y0) / sizeAdj;

    charge.x = round(Math.round(dx / gridSize) * gridSize);
    charge.y = round(Math.round(dy / gridSize) * gridSize);
    setGroupTransform(el, charge);

    if (options.onMove) options.onMove(event, charge);
  }

  function resize(event) {
    const dy = y + (event.y - y0) / sizeAdj;
    charge.size = round(size + dy / -100);

    if (charge.p) {
      setElementTransform(charge);
    } else {
      setGroupTransform(el, charge);
    }
  }

  function rotate(event) {
    const cx = x + 100;
    const cy = y + 100;

    const x1 = event.x / sizeAdj;
    const y1 = event.y / sizeAdj;

    let a = 90 + (Math.atan2(y1 - cy, x1 - cx) * 180) / Math.PI;
    if (a > 180) a = (a % 180) - 180;
    if (a < -179) a = (a % 180) + 180;

    charge.angle = Math.round(a / gridSize) * gridSize;
    setGroupTransform(el, charge);
  }

  function setGroupTransform(el, charge) {
    const tr = transform(charge);

    if (tr) el.setAttribute("transform", tr);
    else el.removeAttribute("transform");
  }

  function setElementTransform(charge) {
    const validPositions = [...new Set(charge.p)].filter(p => positions[p]);
    validPositions.forEach((p, i) => {
      const element = positionElements[i];
      if (element) {
        const transform = getElTransform(charge, p, get(shield));
        if (transform) element.setAttribute("transform", transform);
        else element.removeAttribute("transform");
      }
    });
  }

  function stopDragging() {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mousemove", rotate);
    document.body.style.cursor = "auto";

    if (options.onEnd) options.onEnd(charge);
    changes.add(JSON.stringify(coa));
  }
}

function round(n) {
  return Math.round(n * 100) / 100;
}

export function transform(charge) {
  let {x = 0, y = 0, angle = 0, size = 1, stretch = 0, p} = charge;
  if (p) {
    // size and stretch are defined on use element level
    size = 1;
    stretch = 0;
  }

  let sx = size;
  let sy = size;
  if (stretch < 0) sx = round(sx * (1 - stretch));
  else if (stretch > 0) sy = round(sy * (1 + stretch));
  x = round(x - 100 * (sx - 1));
  y = round(y - 100 * (sy - 1));

  let transform = "";
  if (x || y) transform += `translate(${x} ${y})`;
  if (angle) transform += ` rotate(${angle} ${sx * 100} ${sy * 100})`;
  if (sx !== 1 || sy !== 1) transform += (sx === sy ? ` scale(${sx})` : ` scale(${sx} ${sy})`);

  return transform ? transform.trim() : null;
}

export function getElTransform(charge, p, shield) {
  const positions = shields.data[shield].positions || shields.data.spanish.positions;
  const sizeModifier = shields.data[shield].size || 1;

  const size = round((charge.size || 1) * sizeModifier);
  const stretch = charge.stretch;
  let sx = charge.sinister ? -size : size;
  let sy = charge.reversed ? -size : size;
  if (charge.stretch < 0) sx = round(sx * (1 - charge.stretch));
  else if (charge.stretch > 0) sy = round(sy * (1 + charge.stretch));
  let [x, y] = positions[p];
  x = round(x - 100 * (sx - 1));
  y = round(y - 100 * (sy - 1));

  let transform = "";
  if (x || y) transform += `translate(${x} ${y})`;
  if (sx !== 1 || sy !== 1) transform += (sx === sy ? ` scale(${sx})` : ` scale(${sx} ${sy})`);

  return transform ? transform.trim() : null;
}
