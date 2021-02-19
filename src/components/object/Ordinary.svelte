<script>
  import {drag, transform} from "../../scripts/drag";
  import {getTemplate} from "../../scripts/getTemplate";
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
  <g class="ordinary" {i} transform={transform(ordinary)} transform-origin="center" on:mousedown={addDrag}>
    <path d={shieldPath} fill="none" stroke={t} stroke-width="16.7%"/>
  </g>
{:else if ordinary.ordinary === "orle"}
  <g class="ordinary" {i} transform={transform(ordinary)} transform-origin="center" on:mousedown={addDrag}>
    <path d={shieldPath} fill="none" stroke={t} stroke-width="5%" transform="scale(.85)" transform-origin="center"/>
  </g>
{:else}
  <g class="ordinary" {i} transform={transform(ordinary)} transform-origin="center" fill={t} {stroke} stroke-width={width} on:mousedown={addDrag}>
    {@html getTemplate(ordinary.ordinary, ordinary.line)}
  </g>
{/if}