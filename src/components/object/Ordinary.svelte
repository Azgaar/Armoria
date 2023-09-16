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

<g class="ordinary" {i} transform={transform(ordinary)} fill={t} {stroke} stroke-width={width} on:mousedown={addDrag}>
  {#if ordinary.ordinary === "bordure"}
    <path d={shieldPath} fill="none" stroke={t} stroke-width="16.7%" />
  {:else if ordinary.ordinary === "orle"}
    <path d={shieldPath} fill="none" stroke={t} stroke-width="5%" transform="translate(15 15) scale(.85)" />
  {:else}
    <!-- Remove superfluous <g> for Svelte >= 3.48 (see https://github.com/sveltejs/svelte/issues/7450) -->
    <g>{@html getTemplate(ordinary.ordinary, ordinary.line)}</g>
  {/if}
</g>
