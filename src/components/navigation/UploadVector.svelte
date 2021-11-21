<script>
  import LicenseList from "./LicenseList.svelte";
  import {state, colors, tinctures, message, shield} from "@/data/stores";
  import {charges} from "@/data/dataModel";
  import {shieldPaths} from "@/data/shields";
  import {camelize} from "@/scripts/utils";
  import {tooltip} from "@/scripts/tooltip";

  let dragging = false,
    selected = false;
  let svg,
    transform = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0},
    name,
    category = "uploaded",
    color = "#d7374a";
  let source, license, author;
  const tinctureList = ["metals", "colours", "stains"].map(type => Object.keys($tinctures[type])).flat();

  $: updateTransform(transform);

  function updateTransform(transform) {
    if (!svg) return; // on component on load
    const el = document.createElement("html");
    el.innerHTML = svg;
    const g = el.querySelector("g");
    const transformString = Object.values(transform).join(" ");
    if (transformString === "1 0 0 1 0 0") g.removeAttribute("transform");
    else g.setAttribute("transform", "matrix(" + transformString + ")");
    svg = g.outerHTML;
  }

  const onFile = getFilesFunction => event => {
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

  function getFilesFromDropEvent({dataTransfer: {files, items}}) {
    return files.length ? [...files] : items.filter(({kind}) => kind === "file").map(({getAsFile}) => getAsFile());
  }

  function getFilesFromInputEvent({target}) {
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

      // remove sodipodi and inkscape attributes
      el.querySelectorAll("*").forEach(el => {
        const attributes = el.getAttributeNames();
        attributes.forEach(attr => {
          if (attr.includes("inkscape") || attr.includes("sodipodi")) el.removeAttribute(attr);
        });
      });

      const g = el.querySelector("g");
      if (!g) {
        $message = {type: "error", text: "File must be prepared svg. Download template for guidance!"};
        selected = false;
        return;
      }

      const consolidated = g.transform.baseVal.consolidate();
      if (consolidated) {
        const {a, b, c, d, e, f} = consolidated.matrix;
        const fix = n => +n.toFixed(4);
        transform = Object.assign(transform, {a: fix(a), b: fix(b), c: fix(c), d: fix(d), e: fix(e), f: fix(f)});
      }
      g.removeAttribute("id");
      svg = g.outerHTML;
    };
    reader.readAsText(file);
  }

  function addCharge() {
    const allCharges = Object.keys(charges.types)
      .map(type => Object.keys(charges[type]))
      .flat();
    name = camelize(name);

    if (!name || document.getElementById(name) || allCharges.includes(name)) {
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

    if (source) image.setAttribute("source", source);
    if (license) image.setAttribute("license", license);
    if (author) image.setAttribute("author", author);

    defs.insertAdjacentHTML("beforeend", image.outerHTML);

    selected = false;
    $state.vector = 0;
    $message = {type: "success", text: `Charge "${name}" is added to the category "${category}"`};
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

<div
  id="vectorUpload"
  on:drop|preventDefault={onFile(getFilesFromDropEvent)}
  on:dragover|preventDefault={() => (dragging = true)}
  on:dragleave|preventDefault={() => (dragging = false)}
>
  <span on:click={() => ($state.vector = 0)} class="close">&times;</span>
  <div class="container">
    {#if selected}
      <svg
        width="100%"
        height="100%"
        fill={color}
        stroke="#000"
        stroke-width="1"
        viewBox="0 0 200 200"
        title="Fit image into the rectangle for best result"
        use:tooltip
      >
        <g fill="#fff" fill-opacity=".05" stroke="#fff" stroke-width=".5">
          <path d={shieldPaths[$shield]} />
          <rect x="60" y="60" width="80" height="80" />
        </g>
        <g>{@html svg}</g>
      </svg>

      <div>
        <div class="label">SVG Markup:</div>
        <textarea rows="5" bind:value={svg} />
      </div>

      <div class="inputs">
        <div title="Charge translate: X and Y px" use:tooltip>
          <div class="label">Translate:</div>
          <input type="number" step=".1" class="paired" bind:value={transform.e} />
          <input type="number" step=".1" class="paired" bind:value={transform.f} />
        </div>

        <div title="Charge scale: X and Y, where 1 is default size" use:tooltip>
          <div class="label">Scale:</div>
          <input type="number" step=".01" class="paired" bind:value={transform.a} />
          <input type="number" step=".01" class="paired" bind:value={transform.d} />
        </div>

        <div
          title="Tincture preview color, does not affect uploaded actual color. Charges must not have exact color defined. In this case charge will support all tunctures"
          use:tooltip
        >
          <div class="label">Tincture:</div>
          <select bind:value={color}>
            {#each tinctureList as tincture}
              <option value={$colors[tincture]}>{tincture}</option>
            {/each}
          </select>
        </div>

        <div title="Link to the image source" use:tooltip>
          <div class="label">Source:</div>
          <input bind:value={source} />
        </div>
        <div title="Image author or source portal name" use:tooltip>
          <div class="label">Author:</div>
          <input bind:value={author} />
        </div>
        <div title="Image license" use:tooltip>
          <div class="label">License:</div>
          <LicenseList bind:license />
        </div>
        <div title="Charge unique name (id)" use:tooltip>
          <div class="label">Name:</div>
          <input placeholder="Charge id" required bind:value={name} />
        </div>
        <div title="Category to put a charge" use:tooltip>
          <div class="label">Category:</div>
          <select bind:value={category}>
            {#each Object.keys(charges.types) as c}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </div>

        <div class="buttons">
          <button on:click={addCharge}>Upload</button>
          <button on:click={() => (selected = false)}>Cancel</button>
        </div>
      </div>
    {:else}
      <label class="dragging">
        <slot {dragging}>
          <div>Drag &amp; Drop svg file here or <b>browse</b></div>
        </slot>
        <input type="file" accept=".svg" on:input={onFile(getFilesFromInputEvent)} />
      </label>
      <button class="template" on:click={downloadTemplate}>Download Template</button>
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
    background-color: #000000e6;
    transition: 0.5s;
    user-select: none;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
    overflow: auto;
  }

  .container {
    color: #ddd;
    max-height: 100%;
    max-width: 90%;
  }

  .inputs {
    column-count: 3;
  }

  textarea {
    width: 100%;
    font-size: 0.8em;
    font-family: "Courier New", Courier, monospace;
  }

  input,
  select {
    width: 10em;
  }

  input.paired {
    width: 4.85em;
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

  .template {
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: 2.5em;
    transform: translate(-50%, -50%);
  }

  .buttons > button {
    cursor: pointer;
    margin: 1.18em 0;
    width: 4.8em;
  }

  @media only screen and (orientation: portrait) {
    .inputs {
      column-count: 2;
    }

    .buttons {
      column-span: all;
    }
  }
</style>
