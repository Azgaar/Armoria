<script lang="ts">
  // @ts-check
  import {shieldPositions} from "data/shields";
  import {shield} from "data/stores";
  import {drag, transform, getElTransform} from "scripts/drag";
  import type {Coa, Charge} from "types/coa";

  export let coa: Coa;
  export let charge: Charge;
  export let i: number;
  export let t: string;
  export let t2: string | undefined = undefined;
  export let t3: string | undefined = undefined;
  export let hideBackground: boolean = false;
  export let type: string;

  let chargeId: string;
  let validPositions: string[];
  let coaShield: string;

  $: coaShield = coa.shield || $shield;

  $: {
    const positions = shieldPositions[coaShield] || shieldPositions.spanish;
    validPositions = [...new Set(charge.p)].filter(p => positions[p]);
  }

  $: {
    chargeId = charge.charge;
    // select shield shape if charge is just 'inescutcheon'
    if (chargeId === "inescutcheon") chargeId = "inescutcheon" + coaShield.charAt(0).toUpperCase() + coaShield.slice(1);
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
  style="--secondary: {t2 || t}; --tertiary: {t3 || t}; --stroke: {charge.stroke || "#000"}; --background: {hideBackground ? 'none' : 'block'}"
>
  {#each validPositions as position}
    <use xlink:href="#{chargeId}" transform={getElTransform(charge, position, coaShield)} />
  {/each}
</g>
