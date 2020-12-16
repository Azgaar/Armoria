<script>
  import {shields} from "./dataModel.js";
  import {loadedCharges, state, changes, grid} from "./stores"
  export let coa, charge, i, shield, colors, t;

  $: shieldPositions = shields[shield] || shields.spanish;
  $: positions = [...new Set(charge.p)].filter(p => shieldPositions[p]);

  const defs = document.getElementById("charges");
  function getCharge(charge) {
    if ($loadedCharges[charge] || defs.querySelector("#"+charge)) return charge;
    $loadedCharges[charge] = 1;

    fetch("charges/"+charge+".svg").then(response => response.text()).then(text => {
      const el = document.createElement("html");
      el.innerHTML = text;
      defs.insertAdjacentHTML("beforeend", el.querySelector("g").outerHTML);
    });
    return charge;
  }

  function getElTransform(shieldPositions, c, p) {
    const [x, y] = shieldPositions[p];
    const size = c.size || 1;
    const scale = c.sinister || c.reversed ? `${c.sinister ? "-" : ""}${size}, ${c.reversed ? "-" : ""}${size}` : size;
    return `translate(${x} ${y}) scale(${scale})`;
  }

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
    if (!c.x && !c.y && !c.angle) return null;
    return `rotate(${c.angle||0}) translate(${c.x||0} ${c.y||0})`;
  }

</script>

<g class="charge" {i} class:editable={$state.edit} charge={getCharge(charge.charge)} transform={getTransform(charge)} transform-origin="center" stroke="#000" on:mousedown={function(e) {addDrag(e, charge)}}>
  {#each positions as p}
    <use href="#{charge.charge}" transform={getElTransform(shieldPositions, charge, p)} transform-origin="center" fill="{colors[t]}"></use>
  {/each}
</g>

<style>
  .editable {
    cursor: move;
  }
</style>