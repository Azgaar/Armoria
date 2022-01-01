<script>
  import {shieldPositions} from "data/shields";
  import {drag, transform, getElTransform} from "scripts/drag";
  export let coa, charge, i, shield, t, type;

  let chargeId, validPositions;

  $: {
    const positions = shieldPositions[shield] || shieldPositions.spanish;
    validPositions = [...new Set(charge.p)].filter(p => positions[p]);
  }

  $: {
    chargeId = charge.charge;
    // select shield shape if charge is just 'inescutcheon'
    if (chargeId === "inescutcheon") chargeId = "inescutcheon" + shield.charAt(0).toUpperCase() + shield.slice(1);
  }

  function addDrag(event) {
    if (type !== "Edit") return;
    drag(event, charge, coa);
  }
</script>

<g class="charge" {i} charge={chargeId} fill={t} transform={transform(charge)} stroke={charge.stroke || "#000"} on:mousedown={addDrag}>
  {#each validPositions as position}
    <use xlink:href="#{chargeId}" transform={getElTransform(charge, position, shield)} />
  {/each}
</g>
