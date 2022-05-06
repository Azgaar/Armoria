<script lang="ts">
  // @ts-check
  import {ordinaries as ordinariesData} from "data/dataModel";
  import {colors} from "data/stores";
  import {addPattern, getTemplate} from "scripts/getters";
  import {transformGroup} from "scripts/transform";
  import {drag} from "scripts/drag";
  import type {Coa, Ordinary} from "types.ts/coa";

  export let coa: Coa;
  export let ordinary: Ordinary;
  export let i: number;
  export let shieldPath: string;
  export let counterTincture: string = "";
  export let type: string;

  $: stroke = ordinary.stroke || "none";
  $: width = ordinary.strokeWidth || 1;

  $: currentColors = $colors;
  const counterChanged = ordinary.divided === "counter";

  // get color or link to pattern
  const getFill = (ordinary: string, selfTincture: string) => {
    const tincture = counterChanged && counterTincture ? counterTincture : selfTincture;

    // if clean color, not a pattern, return it
    if (currentColors[tincture]) return currentColors[tincture];

    // if pattern, check if can be applied to charge and load, or return clean color
    if (ordinariesData.patternable.includes(ordinary)) {
      addPattern(tincture);
      return "url(#" + tincture + ")";
    }

    const cleanColor = currentColors[tincture.split("-")[1]];
    return cleanColor || "black";
  };

  function addDrag(event: Event) {
    if (type !== "Edit") return;
    drag(event, ordinary, coa);
  }
</script>

{#if ordinary.ordinary === "bordure"}
  <g class="ordinary" data-i={i} transform={transformGroup(ordinary)} on:mousedown={addDrag}>
    <path d={shieldPath} fill="none" stroke={getFill("bordure", ordinary.t)} stroke-width="16.7%" />
  </g>
{:else if ordinary.ordinary === "orle"}
  <g class="ordinary" data-i={i} transform={transformGroup(ordinary)} on:mousedown={addDrag}>
    <path d={shieldPath} fill="none" stroke={getFill("orle", ordinary.t)} stroke-width="5%" transform="translate(15 15) scale(.85)" />
  </g>
{:else}
  <g
    class="ordinary"
    data-i={i}
    transform={transformGroup(ordinary)}
    fill={getFill(ordinary.ordinary, ordinary.t)}
    {stroke}
    stroke-width={width}
    on:mousedown={addDrag}
  >
    {@html getTemplate(ordinary.ordinary, ordinary.line)}
  </g>
{/if}
