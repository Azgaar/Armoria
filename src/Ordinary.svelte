<script>
  import {drag, transform} from "./drag"
  export let coa, ordinary, i, shieldPath, colors, t, type;

  function getTemplate(templateId, lineId) {
    if (!lineId) return document.getElementById(templateId)?.innerHTML;
    const template = document.getElementById(templateId);
    const line = document.getElementById(lineId) ? document.getElementById(lineId) : document.getElementById("straight");
    return template.innerHTML.replace(/{line}/g, line.getAttribute("d")).replace(/dpath/g, "d");
  }

  function addDrag(event) {
    if (type !== "Edit") return;
    drag(event, ordinary, coa);
  }
</script>

{#if ordinary.ordinary === "bordure"}
  <g class="ordinary" {i} transform={transform(ordinary)} transform-origin="center" on:mousedown={addDrag}>
    <path d={shieldPath} fill="none" stroke={colors[t]} stroke-width="16.7%"/>
  </g>
{:else if ordinary.ordinary === "orle"}
  <g class="ordinary" {i} transform={transform(ordinary)} transform-origin="center" on:mousedown={addDrag}>
    <path d={shieldPath} fill="none" stroke={colors[t]} stroke-width="5%" transform="scale(.85)" transform-origin="center"/>
  </g>
{:else}
  <g class="ordinary" {i} transform={transform(ordinary)} transform-origin="center" fill={colors[t]} on:mousedown={addDrag}>
    {@html getTemplate(ordinary.ordinary, ordinary.line)}
  </g>
{/if}