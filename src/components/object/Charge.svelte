<script lang="ts">
  // @ts-check
  import {shieldPositions} from "data/shields";
  import {colors} from "data/stores";
  import {charges as chargesData} from "data/dataModel";
  import {addCharge, addPattern} from "scripts/getters";
  import {transformGroup, transformElement} from "scripts/transform";
  import {drag} from "scripts/drag";
  import type {Coa, Charge} from "types.ts/coa";

  export let coa: Coa;
  export let charge: Charge;
  export let i: number;
  export let shield: string;
  export let counterTincture: string = "";
  export let type: string;

  const isGroup = Boolean(charge?.elements?.length);
  const positions = shieldPositions[shield] || shieldPositions.spanish;

  $: currentColors = $colors;

  // get color or link to pattern
  const getFill = (element: Charge) => {
    const counterChanged = element.divided === "counter";
    const tincture = counterChanged && counterTincture ? counterTincture : element.t;

    // if clean color, not a pattern, return it
    if (currentColors[tincture]) return currentColors[tincture];

    // if pattern, check if can be applied to charge and load, or return clean color
    if (chargesData.patternable.includes(element.charge)) {
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

  const getPositions = (p: string) => [...new Set(p)].filter(p => positions[p]);

  function addDrag(event: Event) {
    if (type !== "Edit") return;
    drag(event, charge, coa);
  }
</script>

{#if isGroup}
  <g class="charge" data-i={i} data-charge={charge.charge} transform={transformGroup(charge)} stroke={charge.stroke || "#000"} on:mousedown={addDrag}>
    {#each getPositions(charge.p) as position}
      <g transform={transformElement(charge, position, shield)}>
        {#each charge.elements as element}
          <g fill={getFill(element)} data-charge={getCharge(element.charge)} transform={transformGroup(element)} stroke={element.stroke || "#000"}>
            {#each getPositions(element.p) as position}
              <use xlink:href="#{getCharge(element.charge)}" transform={transformElement(element, position, shield)} />
            {/each}
          </g>
        {/each}
      </g>
    {/each}
  </g>
{:else}
  <g
    class="charge"
    data-i={i}
    data-charge={getCharge(charge.charge)}
    fill={getFill(charge)}
    transform={transformGroup(charge)}
    stroke={charge.stroke || "#000"}
    on:mousedown={addDrag}
  >
    {#each getPositions(charge.p) as position}
      <use xlink:href="#{getCharge(charge.charge)}" transform={transformElement(charge, position, shield)} />
    {/each}
  </g>
{/if}
