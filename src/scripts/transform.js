import {shieldSize, shieldPositions} from "data/shields";

export function transformGroup(charge) {
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

export function transformElement(charge, p, shield) {
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

function round(n) {
  return Math.round(n * 100) / 100;
}
