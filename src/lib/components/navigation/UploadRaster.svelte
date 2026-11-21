<script lang="ts">
  import {getFilesFromDropEvent, getFilesFromInputEvent} from "#lib/scripts/files.ts";
  import {settingsStorage} from "#lib/data/storage.ts";
  // @ts-check
  import {onDestroy} from "svelte";
  import type {Snippet} from "svelte";
  import LicenseList from "./LicenseList.svelte";
  import {sanitizeSvg} from "#lib/scripts/sanitizeSvg.ts";
  import {state as editorState, message, shield, uploaded} from "#lib/data/stores.ts";
  import {charges, chargeSets, DEFAULT_SHIELD_BOX, shields} from "#lib/data/dataModel.js";
  import {registerCharge} from "#lib/data/charges.js";
  import {updateCharge} from "#lib/scripts/getters.js";
  import {tooltip} from "#lib/scripts/tooltip.ts";
  import {camelize} from "#lib/scripts/utils.ts";
  import {query} from "#lib/scripts/aliases.ts";

  let {children}: {children?: Snippet<[{dragging: boolean}]>} = $props();

  let dragging = $state(false);
  let selected = $state(false);

  let size = $state(50);
  let offsetX = $state(0);
  let offsetY = $state(0);

  let name = $state<string>();
  let category = $state("uploaded");
  let source = $state<string>();
  let license = $state<string>();
  let author = $state<string>();

  let reader: FileReader | undefined;
  function cancelRead() {
    if (!reader) return;
    reader.onload = null;
    reader.onerror = null;
    if (reader.readyState === 1) reader.abort();
    reader = undefined;
  }
  onDestroy(cancelRead);

  const onFile =
    <E extends Event>(getFilesFunction: (event: E) => File[]) =>
    (event: E) => {
      cancelRead();
      dragging = false;
      const files = getFilesFunction(event);
      const file = files[0];
      if (!file) return;

      if (!/^image\/(png|jpeg|gif|webp|avif|bmp)$/.test(file.type)) {
        message.error("error.notAnImage");
        return;
      }

      selected = true;
      message.info("info.tipUploadImageSize");
      name = camelize(file.name);
      loadImage(file);
    };

  function loadImage(file: Blob) {
    const activeReader = (reader = new FileReader());
    activeReader.onload = function () {
      const dataURL = String(activeReader.result || "");
      const image = document.getElementById("rasterUpload")?.querySelector("svg image");
      image?.setAttribute("href", dataURL);
    };
    activeReader.readAsDataURL(file);
  }

  function cancelSelection() {
    cancelRead();
    selected = false;
  }

  function addCharge() {
    const allCharges = Object.keys(charges.types)
      .map(type => Object.keys(chargeSets[type]))
      .flat();
    name = camelize(name || "");

    if (!name || document.getElementById(name) || allCharges.includes(name)) {
      message.error("error.notUniqueName");
      return;
    }

    const sourceImage = query("#rasterUpload svg image");
    if (!sourceImage) return;
    const image = sourceImage.cloneNode(true) as Element;
    registerCharge(name, category, 5);
    image.id = name;
    if (source) image.setAttribute("source", source);
    if (license) image.setAttribute("license", license);
    if (author) image.setAttribute("author", author);

    $uploaded[name] = {
      category,
      type: "raster",
      content: sanitizeSvg(image.outerHTML)
    };
    settingsStorage.setItem("uploaded", JSON.stringify($uploaded));
    updateCharge(name); // for the case where charge was previously not found

    selected = false;
    $editorState.raster = 0;
    message.success("success.chargeAdded");
  }
</script>

<div
  id="rasterUpload"
  ondrop={event => {
    event.preventDefault();
    onFile(getFilesFromDropEvent)(event);
  }}
  ondragover={event => {
    event.preventDefault();
    dragging = true;
  }}
  ondragleave={event => {
    event.preventDefault();
    dragging = false;
  }}
>
  <span onclick={() => ($editorState.raster = 0)} class="close">&times;</span>
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
            {#each Object.keys(charges.types) as c (c)}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </div>
        <div class="buttons">
          <button onclick={addCharge}>Add</button>
          <button onclick={cancelSelection}>Cancel</button>
        </div>
      </div>
    {:else}
      <label class="dragging">
        {#if children}
          {@render children({dragging})}
        {:else}
          <div>Drag &amp; Drop image here or <b>browse</b></div>
        {/if}
        <input
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/avif,image/bmp"
          oninput={onFile(getFilesFromInputEvent)}
        />
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
