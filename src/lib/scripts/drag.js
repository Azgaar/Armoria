import {get} from "svelte/store";
import {changes, grid, shield} from "$lib/data/stores";
import {shieldPositions, shieldSize} from "$lib/data/shields";

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
  const positions = shieldPositions[get(shield)] || shieldPositions.spanish;

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

    charge.x = Math.round(dx / gridSize) * gridSize;
    charge.y = Math.round(dy / gridSize) * gridSize;
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

export function getElTransform(charge, p, shield) {
  const positions = shieldPositions[shield] || shieldPositions.spanish;
  const sizeModifier = shieldSize[shield] || 1;

  const size = round((charge.size || 1) * sizeModifier);
  const sx = charge.sinister ? -size : size;
  const sy = charge.reversed ? -size : size;
  let [x, y] = positions[p];
  x = round(x - 100 * (sx - 1));
  y = round(y - 100 * (sy - 1));

  const translate = x || y ? `translate(${x} ${y})` : null;
  const scale = sx !== 1 || sy !== 1 ? (sx === sy ? `scale(${sx})` : `scale(${sx} ${sy})`) : null;
  return translate && scale ? `${translate} ${scale}` : translate ? translate : scale ? scale : null;
}
