<script>
  import {state, colors, message} from "./stores";
  import {charges} from "./dataModel.js";
  import {camelize} from './utils.js';
  let dragging = false, selected = false;
  let svg, name, category = "uploaded", color = "#d7374a";

  const onFile = (getFilesFunction) => (event) => {
    dragging = false;
    const files = getFilesFunction(event);
    const file = files.length ? files[0] : [];

    if (!file.type.match(/text.*|svg.*/)) {
      $message = {type: "error", text: "File must be text or svg!"};
      return;
    }

    selected = true;
    name = camelize(file.name);
    loadImage(file);
  };

  function getFilesFromDropEvent({ dataTransfer: { files, items } }) {
    return files.length ? [...files] : items.filter(({ kind }) => kind === "file").map(({ getAsFile }) => getAsFile());
  }

  function getFilesFromInputEvent({ target }) {
    const files = target.files ? [...target.files] : [];
    target.value = "";
    return files;
  }

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function (readerEvent) {
      const svgText = readerEvent.target.result;
      const el = document.createElement("html");
      el.innerHTML = svgText;
      const g = el.querySelector("g");

      if (!g) {
        $message = {type: "error", text: "File must be prepared svg. Download template for guidance!"};
        selected = false;
        return;
      }

      svg = g.outerHTML;
    };
    reader.readAsText(file);
  }

  function addCharge() {
    name = camelize(name);

    if (!name || document.getElementById(name)) {
      $message = {type: "error", text: "Name must be unique id!"};
      return;
    }

    if (!charges.types[category]) charges.types[category] = 6;
    if (!charges.single[category]) charges.single[category] = 6;
    charges[category][name] = 5;

    const el = document.createElement("html");
    el.innerHTML = svg;
    const image = el.querySelector("g");
    image.id = name;
    defs.insertAdjacentHTML("beforeend", image.outerHTML);

    selected = false;
    $state.vector = 0;
  }

  function downloadTemplate() {
    fetch("charges/template.svg").then(text => {
      return text.blob().then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.setAttribute("download", "armoriaChargeTemplate.txt");
        a.click();
      });
    });
  }
</script>

<div id=vectorUpload
  on:drop|preventDefault={onFile(getFilesFromDropEvent)}
  on:dragover|preventDefault={() => (dragging = true)}
  on:dragleave|preventDefault={() => (dragging = false)}>
  <span on:click={() => $state.vector = 0} class="close">&times;</span>
  <div class=container>
    {#if selected}
      <div class=input>
        <div class=label>SVG Markup:</div>
        <textarea rows=10 cols=30 bind:value={svg}/>
        
        <div>
          <button on:click={downloadTemplate}>Download Template</button>
        </div>
      </div>

      <div class=exampleCOA>
        <svg width=100% height=100% fill={color} viewBox="50 50 100 100">{@html svg}</svg>
      </div>

      <div class=output>
        <div>
          <div class=label>Tincture:</div>
          <select bind:value={color}>
            {#each ["argent", "or", "gules", "sable", "azure", "vert", "purpure"] as tincture}
              <option value={$colors[tincture]}>{tincture}</option>
            {/each}
          </select>
        </div>

        <div>
          <div class=label>Name:</div>
          <input placeholder="Charge name" required bind:value={name}/>
        </div>

        <div>
          <div class=label>Category:</div>
          <select bind:value={category}>
            {#each Object.keys(charges.types) as c}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </div>

        <div>
          <button on:click={addCharge}>Add</button>
          <button on:click={() => selected = false}>Cancel</button>
        </div>
      </div>
    {:else}
      <label class=dragging>
        <slot {dragging}>
          <div>Drag &amp; Drop image here or browse</div>
        </slot>
        <input type=file accept="image/svg, text/plain" on:input={onFile(getFilesFromInputEvent)} />
      </label>
    {/if}
  </div>
</div>

<style>
  #vectorUpload {
    height: 100%;
    width: 100%;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.9);
    transition: 0.5s;
    user-select: none;
  }

  .container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #ddd;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
  }

  @media only screen and (orientation: portrait) {
    .container {
      flex-flow: column;
    }
  }

  textarea {
    font-size: .8em;
    font-family: 'Courier New', Courier, monospace;
  }

  .container > div {
    width: max-content;
  }

  .exampleCOA {
    text-align: center;
  }

  input, select {
    width: 10em;
  }

  input[type="file"] {
    display: none;
  }

  .close {
    position: fixed;
    top: 0em;
    right: 0.5em;
    font-size: 4em;
    padding: 0.2em 0;
    display: inline-block;
    color: #ddd;
    z-index: 2;
  }

  label:hover,
  span:hover {
    cursor: pointer;
    color: #fff;
  }

  .dragging {
    width: max-content;
  }
</style>
