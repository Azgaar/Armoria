<script>
  import {shieldPositions} from "./dataModel.js";
  import {loadedCharges} from "./stores";
  import {drag, transform} from "./drag"
  export let coa, charge, i, shield, colors, t, type;

  $: positions = shieldPositions[shield] || shieldPositions.spanish;

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

  function getElTransform(positions, c, p) {
    const [x, y] = positions[p];
    const s = c.size || 1;
    const scale = c.sinister || c.reversed ? `${c.sinister ? "-" : ""}${s}, ${c.reversed ? "-" : ""}${s}` : s;
    return `translate(${x} ${y}) scale(${scale})`;
  }

  function addDrag(event) {
    if (type !== "Edit") return;
    drag(event, charge, coa);
  }
</script>

<g class="charge" {i} charge={getCharge(charge.charge)} transform={transform(charge)} transform-origin="center" stroke="#000" on:mousedown={addDrag}>
  {#each [...new Set(charge.p)].filter(p => positions[p]) as p}
    <use href="#{charge.charge}" transform={getElTransform(positions, charge, p)} transform-origin="center" fill="{colors[t]}"></use>
  {/each}
</g>