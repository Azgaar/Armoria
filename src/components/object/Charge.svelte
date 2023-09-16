<script lang="ts">
  // @ts-check
  import {shieldPositions} from "data/shields";
  import {drag, transform, getElTransform} from "scripts/drag";
  import type {Coa, Charge} from "types/coa";

  export let coa: Coa;
  export let charge: Charge;
  export let i: number;
  export let shield: string;
  export let t: string;
  export let t2: string | undefined = undefined;
  export let t3: string | undefined = undefined;
  export let type: string;

  let chargeId: string;
  let validPositions: string[];

  $: {
    const positions = shieldPositions[shield] || shieldPositions.spanish;
    validPositions = [...new Set(charge.p)].filter(p => positions[p]);
  }

  $: {
    chargeId = charge.charge;
    // select shield shape if charge is just 'inescutcheon'
    if (chargeId === "inescutcheon") chargeId = "inescutcheon" + shield.charAt(0).toUpperCase() + shield.slice(1);
  }

  function addDrag(event: Event) {
    if (type !== "Edit") return;
    drag(event, charge, coa);
  }
</script>

<g
  class="charge"
  {i}
  charge={chargeId}
  fill={t}
  transform={transform(charge)}
  stroke={charge.stroke || "#000"}
  on:mousedown={addDrag}
  style="--secondary: {t2 || t}; --tertiary: {t3 || t}"
>
  {#each validPositions as position}
    <use xlink:href="#{chargeId}" transform={getElTransform(charge, position, shield)} />
  {/each}
</g>
