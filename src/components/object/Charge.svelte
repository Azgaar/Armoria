<script lang="ts">
  // @ts-check
  import {shieldPositions} from "data/shields";
  import {colors} from "data/stores";
  import {charges as chargesData} from "data/dataModel";
  import {addCharge, addPattern} from "scripts/getters";
  import {drag, transform, getElTransform} from "scripts/drag";
  import type {Coa, Charge} from "types.ts/coa";

  export let coa: Coa;
  export let charge: Charge;
  export let i: number;
  export let shield: string;
  export let counterTincture: string = "";
  export let type: string;

  console.log(coa);

  let validPositions: string[];

  $: {
    const positions = shieldPositions[shield] || shieldPositions.spanish;
    validPositions = [...new Set(charge.p)].filter(p => positions[p]);
  }

  $: currentColors = $colors;
  const counterChanged = charge.divided === "counter";

  // get color or link to pattern
  const getFill = (charge: string, selfTincture: string) => {
    const tincture = counterChanged && counterTincture ? counterTincture : selfTincture;

    // if clean color, not a pattern, return it
    if (currentColors[tincture]) return currentColors[tincture];

    // if pattern, check if can be applied to charge and load, or return clean color
    if (chargesData.patternable.includes(charge)) {
      addPattern(tincture);
      return "url(#" + tincture + ")";
    }

    const cleanColor = currentColors[tincture.split("-")[1]];
    return cleanColor || "black";
  };

  // add shield shape to charge name if charge is just 'inescutcheon'
  const getCharge = (charge: string) => {
    addCharge(charge);
    if (charge === "inescutcheon") return "inescutcheon" + shield.charAt(0).toUpperCase() + shield.slice(1);
    return charge;
  };

  function addDrag(event: Event) {
    if (type !== "Edit") return;
    drag(event, charge, coa);
  }
</script>

<g
  class="charge"
  data-i={i}
  data-charge={getCharge(charge.charge)}
  fill={getFill(charge.charge, charge.t)}
  transform={transform(charge)}
  stroke={charge.stroke || "#000"}
  on:mousedown={addDrag}
>
  {#if charge?.elements?.length}
    {#each charge.elements as element}
      <g fill={getFill(element.charge, element.t)} transform={transform(element)} stroke={element.stroke || "#000"}>
        {#each validPositions as position}
          <use xlink:href="#{getCharge(element.charge)}" transform={getElTransform(element, position, shield)} />
        {/each}
      </g>
    {/each}
  {:else}
    {#each validPositions as position}
      <use xlink:href="#{getCharge(charge.charge)}" transform={getElTransform(charge, position, shield)} />
    {/each}
  {/if}
</g>
