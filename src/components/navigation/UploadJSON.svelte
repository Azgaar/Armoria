<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {changes, history, matrices, matrix, message, state} from "data/stores";

  let dragging = false;

  const onFile = (getFilesFunction: any) => (event: any) => {
    dragging = false;
    const files = getFilesFunction(event);
    const file = files.length ? files[0] : [];

    if (!file.type.match(/text|json/)) {
      message.error("error.notJsonOrText");
      return;
    }

    loadCOA(file);
  };

  function getFilesFromDropEvent({dataTransfer: {files, items}}) {
    return files.length ? [...files] : items.filter(({kind}) => kind === "file").map(({getAsFile}) => getAsFile());
  }

  function getFilesFromInputEvent({target}) {
    const files = target.files ? [...target.files] : [];
    target.value = "";
    return files;
  }

  function loadCOA(file: Blob) {
    const reader = new FileReader();
    reader.onload = function () {
      let coas;
      try {
        coas = JSON.parse(this.result);
      } catch(error) {
        message.error("error.loadingCoa");
        return;
      }

      if ($state.edit) {
        // Load a single COA
        changes.add(JSON.stringify(coas[0]));
      } else {
        // Load a whole gallery
        const l = $history.length;
        for (const [i, coa] of coas.entries()) {
          $history[l + i] = coa;
        }
        const gallery = $matrices[$matrix].length;
        $matrix++;
        $matrices[$matrix] = Array.from({length: coas.length}, (_, i) => l + i++);
        for (let i = coas.length; i < gallery; i++) {
          // Fill up with empty COAs
          $history[l + i] = {t1: "argent"};
          $matrices[$matrix].push(l + i);
        }
      }
      $state.import = 0;
      message.success("success.coaLoaded");
    };
    reader.readAsText(file);
  }
</script>

<div
  id="jsonUpload"
  on:drop|preventDefault={onFile(getFilesFromDropEvent)}
  on:dragover|preventDefault={() => (dragging = true)}
  on:dragleave|preventDefault={() => (dragging = false)}
>
  <span on:click={() => ($state.import = 0)} class="close">&times;</span>
  <div class="container">
    <label class="dragging">
      <slot {dragging}>
        <div>Drag &amp; Drop JSON file here or <b>browse</b></div>
      </slot>
      <input type="file" accept=".json" on:input={onFile(getFilesFromInputEvent)} />
    </label>
  </div>
</div>

<style>
  #jsonUpload {
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
    max-height: 100%;
    max-width: 90%;
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
