<script>
  import {state} from "./stores"
  export let ordinary, shieldPath, colors, t;

  function transformOrdinary(o) {
    if (!o.x && !o.y && !o.size) return null;
    return `translate(${o.x||0}, ${o.y||0}) scale(${o.size||1})`;
  }

  function getTemplate(templateId, lineId) {
    if (!lineId) return document.getElementById(templateId)?.innerHTML;
    const template = document.getElementById(templateId);
    const line = document.getElementById(lineId) ? document.getElementById(lineId) : document.getElementById("straight");
    return template.innerHTML.replace(/{line}/g, line.getAttribute("d")).replace(/dpath/g, "d");
  }

  function addDrag() {
    if (!$state.edit) return;
    let dragStartX, dragStartY, objInitLeft, objInitTop;
    let inDrag = false;
    let dragTarget = this;

    const grid = 10;

    dragTarget.addEventListener("mousedown", function(e) {
      inDrag = true;
      objInitLeft = dragTarget.offsetLeft || 0;
      objInitTop = dragTarget.offsetTop || 0;
      dragStartX = e.pageX;
      dragStartY = e.pageY;
    });

    document.addEventListener("mousemove", function(e) {
      if (!inDrag) {return;}
      const x = Math.round((objInitLeft + e.pageX - dragStartX) / grid) * grid;
      const y = Math.round((objInitTop + e.pageY - dragStartY) / grid) * grid;
      dragTarget.setAttribute("transform", `translate(${x},${y})`);
    });

    document.addEventListener("mouseup", () => inDrag = false);
  }
</script>

{#if ordinary.ordinary === "bordure"}
  <g class="ordinary" class:editable={$state.edit} on:click={addDrag}>
    <path d={shieldPath} fill="none" stroke={colors[t]} stroke-width="16.7%"/>
  </g>
{:else if ordinary.ordinary === "orle"}
  <g class="ordinary" class:editable={$state.edit} on:click={addDrag}>
    <path d={shieldPath} fill="none" stroke={colors[t]} stroke-width="5%" transform="scale(.85)" transform-origin="center"/>
  </g>
{:else}
  <g class="ordinary" class:editable={$state.editn} transform={transformOrdinary(ordinary)} transform-origin="center" fill={colors[t]} on:click={addDrag}>
    {@html getTemplate(ordinary.ordinary, ordinary.variant)}
  </g>
{/if}

<style>
  .editable:hover {
    outline: 1px dashed #333;
    cursor: pointer;
  }
</style>