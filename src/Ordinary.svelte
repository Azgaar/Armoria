<script>
  import {state, grid, changes} from "./stores"
  export let coa, shieldPath, colors, t;
  const ordinary = coa.ordinary;

  function addDrag(e, c) {
    if (!$state.edit) return;
    const el = e.currentTarget;
    const [a0, x0, y0] = parseTransform(el.getAttribute("transform"));
    const x1 = e.x, y1 = e.y;
    const sizeAdj = +el.closest("svg").getAttribute("width") / 200;

    const angle = -a0 * (Math.PI / 180);
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragStop, {once: true});

    function drag(e) {
      document.body.style.cursor = "move";
      const dx = x0 + (e.x - x1) / sizeAdj;
      const dy = y0 + (e.y - y1) / sizeAdj;

      const relX = (dx * cosAngle) - (dy * sinAngle);
      const relY = (dx * sinAngle) + (dy * cosAngle);

      c.x = Math.round(relX / $grid) * $grid;
      c.y = Math.round(relY / $grid) * $grid;
      const tr = getTransform(c);
      if (tr) el.setAttribute("transform", tr); else el.removeAttribute("transform");
    }

    function dragStop() {
      document.removeEventListener("mousemove", drag);
      document.body.style.cursor = "auto";
      changes.add(JSON.stringify(coa));
    }
  }

  function parseTransform(string) {
    if (!string) {return [0,0,0,0,0,1];}
    const a = string.replace(/[a-z()]/g, "").replace(/[ ]/g, ",").split(",");
    return [+a[0] || 0, +a[1] || 0, +a[2] || 0, +a[3] || 0, +a[4] || 0, +a[5] || 1];
  }

  function getTransform(c) {
    if (!c.x && !c.y && !c.angle && !c.size) return null;
    return `rotate(${c.angle||0}) translate(${c.x||0} ${c.y||0}) scale(${c.size||1})`;
  }

  function getTemplate(templateId, lineId) {
    if (!lineId) return document.getElementById(templateId)?.innerHTML;
    const template = document.getElementById(templateId);
    const line = document.getElementById(lineId) ? document.getElementById(lineId) : document.getElementById("straight");
    return template.innerHTML.replace(/{line}/g, line.getAttribute("d")).replace(/dpath/g, "d");
  }
</script>

{#if ordinary.ordinary === "bordure"}
  <g class="ordinary" class:editable={$state.edit} on:mousedown={function(e) {if ($state.edit) drag(e, ordinary, coa)}}>
    <path d={shieldPath} fill="none" stroke={colors[t]} stroke-width="16.7%"/>
  </g>
{:else if ordinary.ordinary === "orle"}
  <g class="ordinary" class:editable={$state.edit} on:mousedown={function(e) {if ($state.edit) drag(e, ordinary, coa)}}>
    <path d={shieldPath} fill="none" stroke={colors[t]} stroke-width="5%" transform="scale(.85)" transform-origin="center"/>
  </g>
{:else}
  <g class="ordinary" class:editable={$state.edit} transform={getTransform(ordinary)} transform-origin="center" fill={colors[t]} on:mousedown={function(e) {if ($state.edit) addDrag(e, ordinary)}}>
    {@html getTemplate(ordinary.ordinary, ordinary.line)}
  </g>
{/if}

<style>
  .editable {
    cursor: move;
  }
</style>