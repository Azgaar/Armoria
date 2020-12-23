<script>
  import {state} from "./stores";
  import {charges} from "./dataModel.js";
  import {camelize} from './utils.js';
  let dragging = false, selected = false;
  let size = 50, offsetX = 0, offsetY = 0;
  let name, category;

  const categories = Object.keys(charges.types);

  const onFile = (getFilesFunction) => (event) => {
    dragging = false;
    const files = getFilesFunction(event);
    const file = files.length ? files[0] : [];

    if (!file.type.match(/image.*/)) {
      console.error("Not an image file!");
      return;
    }

    selected = true;
    name = camelize(file.name);
    loadImage(file);
  };

  function getFilesFromDropEvent({ dataTransfer: { files, items } }) {
    return files.length
      ? [...files]
      : items
          .filter(({ kind }) => kind === "file")
          .map(({ getAsFile }) => getAsFile());
  }

  function getFilesFromInputEvent({ target }) {
    const files = target.files ? [...target.files] : [];
    target.value = "";
    return files;
  }

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function (readerEvent) {
      const dataURL = readerEvent.target.result;
      const image = document.getElementById("rasterUpload").querySelector("svg image");
      image.setAttribute("href", dataURL);
    };
    reader.readAsDataURL(file);
  }

  function addCharge() {
    name = camelize(name);

    if (!name || document.getElementById(name)) {
      console.error("Name must be unique id!");
      return;
    }

    if (!charges[category]) {
      charges[category] = {};
      charges.types[category] = 5;
      charges.single[category] = 5;
    }
    charges[category][name] = 5;

    const image = document.getElementById("rasterUpload").querySelector("svg image").cloneNode(true);
    image.id = name;
    document.getElementById("charges").appendChild(image);

    selected = false;
    $state.raster = 0;
  }
</script>

<div id=rasterUpload
  on:drop|preventDefault={onFile(getFilesFromDropEvent)}
  on:dragover|preventDefault={() => (dragging = true)}
  on:dragleave|preventDefault={() => (dragging = false)}>
  <span on:click={() => $state.raster = 0} class="close">&times;</span>
  <div class=container>
    {#if selected}
      <div class=input>
        <div><div class=label>Size:</div><input type=number bind:value={size}/></div>
        <div><div class=label>Offset X:</div><input type=number bind:value={offsetX}/></div>
        <div><div class=label>Offset Y:</div><input type=number bind:value={offsetY}/></div>
      </div>

      <div class=exampleCOA>
        <svg width=100% height=100% viewBox="0 0 200 200">
          <g clip-path="url(#heater)" stroke="#fff" stroke-width=.5>
            <rect x=0 y=0 width=100% height=100% fill=#d7374a/>
            <image id=imageLoaded x={(100 - size) / 2 + offsetX}% y={(100 - size) / 2 + offsetY}% width={size}% height={size}%/>
            <rect x=30% y=30% width=40% height=40% fill=none stroke=#000 stroke-width=.5/>
            <g stroke=#000 fill="url(#backlight)">
              <path d="M25,25 h150 v50 a150,150,0,0,1,-75,125 a150,150,0,0,1,-75,-125 z"/>
            </g>
          </g>
        </svg>
      </div>

      <div class=output>
        <div><div class=label>Name:</div><input placeholder="Charge name" required bind:value={name}/></div>
        <div><div class=label>Category:</div>
          <select bind:value={category}>
            <option value=uploaded selected>uploaded</option>
            {#each categories as c}
              <option value={c}>{c}</option>
            {/each}
          </select>
        </div>
        <div class=buttons>
          <button on:click={addCharge}>Add</button>
          <button on:click={() => selected = false}>Cancel</button>
        </div>
      </div>
    {:else}
      <label class=dragging>
        <slot {dragging}>
          <div>Drag &amp; Drop image here or browse</div>
        </slot>
        <input type=file accept=image/* on:input={onFile(getFilesFromInputEvent)} />
      </label>
    {/if}
  </div>
</div>

<style>
  #rasterUpload {
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

  .exampleCOA {
    text-align: center;
    width: max-content;
  }

  .buttons {
    text-align: center;
  }

  input, select {
    width: 10em;
  }

  .buttons > button {
    cursor: pointer;
    margin: 1em .1em;
    width: 4em;
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
