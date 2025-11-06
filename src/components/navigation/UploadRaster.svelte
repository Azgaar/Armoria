<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import LicenseList from "./LicenseList.svelte";
  import {state, message, shield, uploaded} from "data/stores";
  import {charges, DEFAULT_SHIELD_BOX, shields} from "data/dataModel";
  import {updateCharge} from "scripts/getters";
  import {tooltip} from "scripts/tooltip";
  import {camelize} from "scripts/utils";
  import {query} from "scripts/aliases";

  let dragging = false;
  let selected = false;

  let size = 50;
  let offsetX = 0;
  let offsetY = 0;

  let name: string;
  let category = "uploaded";
  let source: string;
  let license: string;
  let author: string;

  const onFile = getFilesFunction => event => {
    dragging = false;
    const files = getFilesFunction(event);
    const file = files.length ? files[0] : [];

    if (!file.type.match(/image.*/)) {
      message.error("error.notAnImage");
      return;
    }

    selected = true;
    message.info("info.tipUploadImageSize");
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

  function loadImage(file: Blob) {
    const reader = new FileReader();
    reader.onload = function (readerEvent) {
      const dataURL = readerEvent.target.result as string;
      const image = document.getElementById("rasterUpload").querySelector("svg image");
      image.setAttribute("href", dataURL);
    };
    reader.readAsDataURL(file);
  }

  function addCharge() {
    const allCharges = Object.keys(charges.types)
      .map(type => Object.keys(charges[type]))
      .flat();
    name = camelize(name);

    if (!name || document.getElementById(name) || allCharges.includes(name)) {
      message.error("error.notUniqueName");
      return;
    }

    if (!charges.types[category]) charges.types[category] = 6;
    if (!charges.single[category]) charges.single[category] = 6;
    charges[category][name] = 5;

    // remove stored weighted arrays
    delete charges.types.array;
    delete charges.single.array;
    delete charges[category].array;

    const image = query("#rasterUpload svg image").cloneNode(true) as Element;
    image.id = name;
    if (source) image.setAttribute("source", source);
    if (license) image.setAttribute("license", license);
    if (author) image.setAttribute("author", author);

    $uploaded[name] = {
      category,
      type: "raster",
      content: image.outerHTML,
    };
    localStorage.setItem("uploaded", JSON.stringify($uploaded));
    updateCharge(name); // for the case where charge was previously not found

    selected = false;
    $state.raster = 0;
    message.success("success.chargeAdded");
  }
</script>

<div
  id="rasterUpload"
  on:drop|preventDefault={onFile(getFilesFromDropEvent)}
  on:dragover|preventDefault={() => (dragging = true)}
  on:dragleave|preventDefault={() => (dragging = false)}
>
  <span on:click={() => ($state.raster = 0)} class="close">&times;</span>
  <div class="container">
    {#if selected}
      <svg
        width="100%"
        height="100%"
        stroke="#000"
        stroke-width="1"
        viewBox={DEFAULT_SHIELD_BOX}
        data-tooltip="Fit image into the rectangle for best result"
        use:tooltip
      >
        <g fill="#fff" fill-opacity=".05" stroke="#fff" stroke-width=".5">
          <image
            id="imageLoaded"
            x="{(100 - size) / 2 + offsetX}%"
            y="{(100 - size) / 2 + offsetY}%"
            width="{size}%"
            height="{size}%"
          />
          <path d={shields.data[$shield].path} />
          <rect x="60" y="60" width="80" height="80" />
        </g>
      </svg>

      <div class="inputs">
        <div data-tooltip="Image size in percents" use:tooltip>
          <div class="label">Size:</div>
          <input type="number" bind:value={size} />
        </div>
        <div data-tooltip="Offset by X axis in pixels" use:tooltip>
          <div class="label">Offset X:</div>
          <input type="number" bind:value={offsetX} />
        </div>
        <div data-tooltip="Offset by Y axis in pixels" use:tooltip>
          <div class="label">Offset Y:</div>
          <input type="number" bind:value={offsetY} />
        </div>
        <div data-tooltip="Link to the image source" use:tooltip>
          <div class="label">Source:</div>
          <input bind:value={source} />
        </div>
        <div data-tooltip="Image author or source portal name" use:tooltip>
          <div class="label">Author:</div>
          <input bind:value={author} />
        </div>
        <div data-tooltip="Image license" use:tooltip>
          <div class="label">License:</div>
          <LicenseList bind:license />
        </div>
        <div data-tooltip="Charge unique name (id)" use:tooltip>
          <div class="label">Name:</div>
          <input placeholder="Charge id" required bind:value={name} />
        </div>
        <div data-tooltip="Category to put a charge" use:tooltip>
          <div class="label">Category:</div>
          <select bind:value={category}>
            {#each Object.keys(charges.types) as c}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </div>
        <div class="buttons">
          <button on:click={addCharge}>Add</button>
          <button on:click={() => (selected = false)}>Cancel</button>
        </div>
      </div>
    {:else}
      <label class="dragging">
        <slot {dragging}>
          <div>Drag &amp; Drop image here or <b>browse</b></div>
        </slot>
        <input type="file" accept="image/*" on:input={onFile(getFilesFromInputEvent)} />
      </label>
    {/if}
  </div>
</div>

<style>
  #rasterUpload {
    height: 100%;
    width: 100%;
    position: fixed;
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
    max-height: 90%;
    max-width: 90%;
  }

  .inputs {
    column-count: 3;
  }

  input,
  select {
    width: 10em;
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
