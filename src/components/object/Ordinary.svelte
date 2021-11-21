<script>
  import {drag, transform} from "scripts/drag";
  import {getTemplate} from "scripts/getters";
  export let coa, ordinary, i, shieldPath, t, type;

  let stroke, width;
  $: {
    stroke = ordinary.stroke || "none";
    width = ordinary.strokeWidth || 1;
  }

  function addDrag(event) {
    if (type !== "Edit") return;
    drag(event, ordinary, coa);
  }
</script>

{#if ordinary.ordinary === "bordure"}
  <g class="ordinary" {i} transform={transform(ordinary)} on:mousedown={addDrag}>
    <path d={shieldPath} fill="none" stroke={t} stroke-width="16.7%" />
  </g>
{:else if ordinary.ordinary === "orle"}
  <g class="ordinary" {i} transform={transform(ordinary)} on:mousedown={addDrag}>
    <path d={shieldPath} fill="none" stroke={t} stroke-width="5%" transform="translate(15 15) scale(.85)" />
  </g>
{:else}
  <g class="ordinary" {i} transform={transform(ordinary)} fill={t} {stroke} stroke-width={width} on:mousedown={addDrag}>
    {@html getTemplate(ordinary.ordinary, ordinary.line)}
  </g>
{/if}
