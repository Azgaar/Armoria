<script>
  import {shieldPositions, shieldSize} from '../../data/shields';
  import {drag, transform} from "../../scripts/drag";
  export let coa, charge, i, shield, t, type;
  let chargeId, positions, size, stroke;

  $: {
    positions = shieldPositions[shield] || shieldPositions.spanish;
    size = shieldSize[shield] || 1;
    stroke = charge.stroke || "#000";

    chargeId = charge.charge;
    // select shield shape if charge is just 'inescutcheon'
    if (chargeId === "inescutcheon") chargeId = "inescutcheon" + shield.charAt(0).toUpperCase() + shield.slice(1);
  }

  function getElTransform(positions, c, p) {
    const [x, y] = positions[p];
    const translate = x || y ? `translate(${x} ${y})` : "";

    const s = (c.size || 1) * size;
    const scaleX = c.sinister ? -s : s;
    const scaleY = c.reversed ? -s : s;
    const scale = scaleX === scaleY ? s === 1 ? "" : `scale(${s})` : `scale(${scaleX} ${scaleY})`;

    return translate && scale ? `${translate} ${scale}` : translate ? translate : scale ? scale : null;
  }

  function addDrag(event) {
    if (type !== "Edit") return;
    drag(event, charge, coa);
  }
</script>

<g class="charge" {i} charge={chargeId} transform="{transform(charge)}" transform-origin="center" {stroke} on:mousedown={addDrag}>
  {#each [...new Set(charge.p)].filter(p => positions[p]) as p}
    <use href="#{chargeId}" transform="{getElTransform(positions, charge, p)}" transform-origin="center" fill="{t}"></use>
  {/each}
</g>