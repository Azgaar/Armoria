<script>
  import {shieldPositions, shieldSize} from "./dataModel.js";
  import {loadedCharges} from "./stores";
  import {drag, transform} from "./drag"
  export let coa, charge, i, shield, t, type;
  let chargeId, positions, size, stroke;

  const defs = document.getElementById("charges");

  $: {
    positions = shieldPositions[shield] || shieldPositions.spanish;
    size = shieldSize[shield] || 1;
    stroke = charge.stroke || "#000";

    chargeId = charge.charge;
    // select shield shape if charge is just 'inescutcheon'
    if (chargeId === "inescutcheon") chargeId = "inescutcheon" + shield.charAt(0).toUpperCase() + shield.slice(1);
  }

  function getCharge(charge) {
    if ($loadedCharges[charge] || defs.querySelector("#"+charge)) return charge;
    if (charge.slice(0, 12) === "inescutcheon") {
      getInescutcheon(charge);
      return charge;
    }
    $loadedCharges[charge] = 1;

    fetch("charges/"+charge+".svg").then(response => response.text()).then(text => {
      const el = document.createElement("html");
      el.innerHTML = text;
      defs.insertAdjacentHTML("beforeend", el.querySelector("g").outerHTML);
    });
    return charge;
  }

  function getInescutcheon(id) {
    const shield = id.slice(12, 13).toLowerCase() + id.slice(13);
    const d = document.querySelector("#shields > #"+ shield + "> path").getAttribute("d");
    const g = `<g id=${id}><path transform="scale(.33)" transform-origin="center" d="${d}"/></g>`
    defs.insertAdjacentHTML("beforeend", g);
  }

  function getElTransform(positions, c, p) {
    const [x, y] = positions[p];
    const s = (c.size || 1) * size;
    const scale = c.sinister || c.reversed ? `${c.sinister ? "-" : ""}${s}, ${c.reversed ? "-" : ""}${s}` : s;
    return `translate(${x} ${y}) scale(${scale})`;
  }

  function addDrag(event) {
    if (type !== "Edit") return;
    drag(event, charge, coa);
  }
</script>

<g class="charge" {i} charge={getCharge(chargeId)} transform="{transform(charge)}" transform-origin="center" {stroke} on:mousedown={addDrag}>
  {#each [...new Set(charge.p)].filter(p => positions[p]) as p}
    <use href="#{chargeId}" transform="{getElTransform(positions, charge, p)}" transform-origin="center" fill="{t}"></use>
  {/each}
</g>