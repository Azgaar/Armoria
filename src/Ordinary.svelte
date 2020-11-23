<script>
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
</script>

{#if ordinary.ordinary === "bordure"}
  <g class="ordinary">
    <path d={shieldPath} fill="none" stroke={colors[t]} stroke-width="16.7%"/>
  </g>
{:else if ordinary.ordinary === "orle"}
  <g class="ordinary">
    <path d={shieldPath} fill="none" stroke={colors[t]} stroke-width="5%" transform="scale(.85)" transform-origin="center"/>
  </g>
{:else}
  <g class="ordinary" transform={transformOrdinary(ordinary)} transform-origin="center" fill={colors[t]}>
    {@html getTemplate(ordinary.ordinary, ordinary.variant)}
  </g>
{/if}