<script>
  import {fade} from 'svelte/transition';
  import COA from './COA.svelte';
  export let matrices, matrix, edit, coas, w, h, grad, diaper, shield, colors, scale, border, borderWidth;

  function regenerate(i) {
    coas[i] = Armoria.history.length;
    matrix++;
    matrices[matrix] = coas;
  }

  async function download(i) {
    const coa = document.getElementById("coa"+i);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = Math.round(coa.getAttribute("width") * scale);
    const height = Math.round(coa.getAttribute("height") * scale);
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height);

    const url = await getURL(coa);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      ctx.drawImage(img, 0, 0, width, height);
      drawCanvas(canvas);
    }
  }

  async function getURL(svg) {
    const clone = svg.cloneNode(true); // clone svg
    const d = clone.getElementsByTagName("defs")[0];

    d.insertAdjacentHTML("beforeend", defs.getElementById(shield).outerHTML);
    if (grad) d.insertAdjacentHTML("beforeend", defs.getElementById(grad).outerHTML);
    if (diaper) d.insertAdjacentHTML("beforeend", defs.getElementById(diaper).outerHTML);
    clone.querySelectorAll(".charge[charge]").forEach(el => {
      const charge = el.getAttribute("charge");
      d.insertAdjacentHTML("beforeend", defs.getElementById(charge).outerHTML);
    });
    const fieldPattern = clone.getElementById("field").getAttribute("fill").split("(#")[1]?.split(")")[0];
    if (fieldPattern) d.insertAdjacentHTML("beforeend", document.getElementById(fieldPattern).outerHTML);
    const divisionPattern = clone.getElementById("division")?.querySelector("rect").getAttribute("fill").split("(#")[1]?.split(")")[0];
    if (divisionPattern) d.insertAdjacentHTML("beforeend", document.getElementById(divisionPattern).outerHTML);

    const serialized = (new XMLSerializer()).serializeToString(clone);
    const blob = new Blob([serialized], {type: 'image/svg+xml;charset=utf-8'});
    const url = window.URL.createObjectURL(blob);
    return url;
  }

  function drawCanvas(canvas) {
    const link = document.createElement("a");
    link.download = "armoria_download.png";
    canvas.toBlob(function(blob) {
      link.href = window.URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      setTimeout(function() {
        canvas.remove();
        window.URL.revokeObjectURL(link.href);
      }, 5000);
    });
  }
</script>

<div id="gallery" style="margin-top: 28px; font-size: {Math.ceil(w/20)}px" transition:fade>
  {#each coas as c, i}
    <div>
      {#key c}
        <COA {edit} {c} {i} {w} {h} {grad} {diaper} {shield} {colors} {border} {borderWidth}/>
      {/key}
        <div class="control">
        <svg on:click={() => regenerate(i)}><use href="#dice-icon"></use></svg>
        <svg on:click={() => edit = {on:1, c, i}}><use href="#pencil-icon"></use></svg>
        <svg on:click={() => download(i)}><use href="#download-icon"></use></svg>
      </div>
    </div>
  {/each}
</div>

<style>
  div {
    display: inline-table;
  }

  #gallery > div {
    display: inline-block;
    position: relative;
    user-select: none;
    transition: background .5s ease;
  }

  #gallery > div:hover {
    background: #00000020;
  }

  .control {
    display: block;
    position: absolute;
    opacity: 0;
    transition: .5s ease-in-out;
    color: #f1f1f1;
    transform: translate(-50%, -150%);
    left: 50%;
    font-size: 2em;
    white-space: nowrap;
  }

  #gallery > div:hover > .control {
    opacity: 1;
  }

  .control > svg {
    width: 1.2em;
    height: 1.2em;
    fill: #f1f1f1;
    stroke: #333;
    stroke-width: .5em;
    vertical-align: middle;
    margin: 0 .5em;
    padding: .2em;
    cursor: pointer;
  }

  .control > svg:hover {
    background-color: #44444490;
    color: #fff;
  }

  .control > svg:active {
    transform: translateY(1px);
  }
</style>