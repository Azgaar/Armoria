<script>
  import {shields} from "./dataModel.js";
  import {loadedCharges, state} from "./stores"
  export let charge, i, shield, colors, t;

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

  function getChargeTransform(charge) {
    if (charge.x || charge.y) return `translate(${charge.x||0}, ${charge.y||0})`;
    return null;
  }

  function getElTransform(shieldPositions, c, p) {
    const [x, y] = shieldPositions[p];
    const size = c.size || 1;
    const scale = c.sinister || c.reversed ? `${c.sinister ? "-" : ""}${size}, ${c.reversed ? "-" : ""}${size}` : size;
    return `translate(${x}, ${y}) scale(${scale})`;
  }

  function addDrag() {
    if ($state.edit) return;
    let dragStartX, dragStartY, objInitLeft, objInitTop;
    let inDrag = false;
    let dragTarget = this;

    const grid = 20;

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

  function parseTransform(string) {
    if (!string) {return [0,0,0,0,0,1];}
    const a = string.replace(/[a-z()]/g, "").replace(/[ ]/g, ",").split(",");
    return [a[0] || 0, a[1] || 0, a[2] || 0, a[3] || 0, a[4] || 0, a[5] || 1];
  }

</script>

<g class="charge" {i} class:editable={$state.edit} charge={getCharge(charge.charge)} transform={getChargeTransform(charge)} stroke="#000" on:click={addDrag}>
  {#each positions as p}
    <use href="#{charge.charge}" transform={getElTransform(shieldPositions, charge, p)} transform-origin="center" fill="{colors[t]}"></use>
  {/each}
</g>

<style>
  .editable:hover {
    outline: 1px dashed #333;
    cursor: pointer;
  }
</style>