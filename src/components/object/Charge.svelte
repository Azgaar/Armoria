<script>
  import {shieldPositions, shieldSize} from "@/data/shields";
  import {drag, transform} from "@/scripts/drag";
  export let coa, charge, i, shield, t, type;
  let chargeId, positions, sizeModifier, stroke;

  $: {
    positions = shieldPositions[shield] || shieldPositions.spanish;
    sizeModifier = shieldSize[shield] || 1;
    stroke = charge.stroke || "#000";

    chargeId = charge.charge;
    // select shield shape if charge is just 'inescutcheon'
    if (chargeId === "inescutcheon") chargeId = "inescutcheon" + shield.charAt(0).toUpperCase() + shield.slice(1);
  }

  function round(n) {
    return Math.round(n * 100) / 100;
  }

  function getElTransform(c, p) {
    const s = round((c.size || 1) * sizeModifier);
    const sx = c.sinister ? -s : s;
    const sy = c.reversed ? -s : s;
    let [x, y] = positions[p];
    x = round(x - 100 * (sx - 1));
    y = round(y - 100 * (sy - 1));

    const translate = x || y ? `translate(${x} ${y})` : null;
    const scale = sx !== 1 || sy !== 1 ? (sx === sy ? `scale(${sx})` : `scale(${sx} ${sy})`) : null;
    return translate && scale ? `${translate} ${scale}` : translate ? translate : scale ? scale : null;
  }

  function addDrag(event) {
    if (type !== "Edit") return;
    drag(event, charge, coa);
  }
</script>

<g class="charge" {i} charge={chargeId} fill={t} transform={transform(charge)} {stroke} on:mousedown={addDrag}>
  {#each [...new Set(charge.p)].filter(p => positions[p]) as p}
    <use xlink:href="#{chargeId}" transform={getElTransform(charge, p)} />
  {/each}
</g>
