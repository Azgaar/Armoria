<script>
  export let charge, i, shield, colors, t, edit;

  const shields = {
    // shieldSpecific position: [x, y] (relative to center)
    heater:     {a:[-43.75, -50], b:[0, -50], c:[43.75, -50],
                d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
                g:[-32.25, 37.5], h:[0, 50], i:[32.25, 37.5],
                y:[-50, -50], z:[0, 62.5],
                j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
                m:[-32.5, 32.5], n:[0, 42.5], o:[32.5, 32.5],
                p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
                A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
                E:[66.2, -20], F:[55.5, 26], G:[33, 62], H:[0, 89.5],
                I:[-66.2, -20], K:[-55.5, 26], L:[-33, 62]},
    oldFrench:  {a:[-43.75, -50], b:[0, -50], c:[43.75, -50],
                d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
                g:[-37.5, 50], h:[0, 50], i:[37.5, 50],
                y:[-50, -50], z:[0, 62.5],
                j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
                m:[-37.5, 37.5], n:[0, 45], o:[37.5, 37.5],
                p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
                A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
                E:[66.2, -20], F:[64, 26], G:[45, 62], H:[0, 91.5],
                I:[-66.2, -20], K:[-64, 26], L:[-45, 62]},
    spanish:    {a:[-43.75, -50], b:[0, -50], c:[43.75, -50],
                d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
                g:[-43.75, 50], h:[0, 50], i:[43.75, 50],
                y:[-50, -50], z:[0, 50],
                j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
                m:[-37.5, 37.5], n:[0, 50], o:[37.5, 37.5],
                p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
                A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
                E:[66.4, -20], F:[66.4, 26], G:[49, 70], H:[0, 92],
                I:[-66.4, -20], K:[-66.4, 26], L:[-49, 70]},
    wedged:     {a:[-43.75, -50], b:[0, -50], c:[43.75, -50], // copy of heater
                d:[-43.75, 0], e:[0, 0], f:[43.75, 0],
                g:[-32.25, 37.5], h:[0, 50], i:[32.25, 37.5],
                y:[-50, -50], z:[0, 62.5],
                j:[-37.5, -37.5], k:[0, -37.5], l:[37.5, -37.5],
                m:[-32.5, 32.5], n:[0, 42.5], o:[32.5, 32.5],
                p:[-37.5, 0], q:[37.5, 0], r:[0, 37.5],
                A:[-66.2, -66.6], B:[-22, -66.6], C:[22, -66.6], D:[66.2, -66.6],
                E:[66.2, -20], F:[55.5, 26], G:[33, 62], H:[0, 89.5],
                I:[-66.2, -20], K:[-55.5, 26], L:[-33, 62]},
  };
  $: shieldPositions = shields[shield] || shields.spanish;

  const defs = document.getElementById("charges");
  function getCharge(charge) {
    if (loadedCharges[charge] || defs.querySelector("#"+charge)) return charge;
    loadedCharges[charge] = 1;

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

  function getElTransform(c, p) {
    const [x, y] = shieldPositions[p];
    const size = c.size || 1;
    const scale = c.sinister || c.reversed ? `${c.sinister ? "-" : ""}${size}, ${c.reversed ? "-" : ""}${size}` : size;
    return `translate(${x}, ${y}) scale(${scale})`;
  }

  function addDrag() {
    if (!edit.on) return;
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
</script>

<g class="charge" {i} class:editable={edit.on} charge={getCharge(charge.charge)} transform={getChargeTransform(charge)} stroke="#000" on:click={addDrag}>
  {#each [...charge.p] as p}
    <use href="#{charge.charge}" transform={getElTransform(charge, p)} transform-origin="center" fill="{colors[t]}"></use>
  {/each}
</g>

<style>
  .editable:hover {
    outline: 1px dashed #333;
    cursor: pointer;
  }
</style>