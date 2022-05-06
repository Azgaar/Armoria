import {get} from "svelte/store";
import {changes, grid, shield} from "data/stores";
import {shieldPositions} from "data/shields";
import {transformGroup, transformElement} from "./transform";

export function drag(event, charge, coa) {
  const el = event.currentTarget;
  const x0 = event.x;
  const y0 = event.y;

  const sizeAdj = el.closest("svg").clientWidth / 200;
  document.addEventListener("mouseup", stopDragging, {once: true});

  const {x = 0, y = 0, size = 1} = charge;
  const gridSize = get(grid);
  const positionElements = el.querySelectorAll("use");
  const positions = shieldPositions[get(shield)] || shieldPositions.spanish;

  if (event.shiftKey) {
    document.addEventListener("mousemove", resize);
    document.body.style.cursor = "ns-resize";
  } else if (event.ctrlKey || event.metaKey) {
    document.addEventListener("mousemove", rotate);
    document.body.style.cursor = "ew-resize";
  } else {
    document.addEventListener("mousemove", move);
    document.body.style.cursor = "move";
  }

  function move(event) {
    const dx = x + (event.x - x0) / sizeAdj;
    const dy = y + (event.y - y0) / sizeAdj;

    charge.x = Math.round(dx / gridSize) * gridSize;
    charge.y = Math.round(dy / gridSize) * gridSize;
    setGroupTransform(el, charge);
  }

  function resize(event) {
    const dy = y + (event.y - y0) / sizeAdj;
    charge.size = Math.round((size + dy / -100) * 100) / 100;

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
    const tr = transformGroup(charge);

    if (tr) el.setAttribute("transform", tr);
    else el.removeAttribute("transform");
  }

  function setElementTransform(charge) {
    const validPositions = [...new Set(charge.p)].filter(p => positions[p]);
    validPositions.forEach((p, i) => {
      const element = positionElements[i];
      if (element) {
        const transform = transformElement(charge, p, get(shield));
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
    changes.add(JSON.stringify(coa));
  }
}
