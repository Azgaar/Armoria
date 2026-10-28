<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {changes, colors, fonts, history, matrices, matrix, message, state, uploaded} from "$lib/data/stores";

  import {IMPORT_LIMITS, parseCoaImport} from "$lib/coa/validation";
  import {RequestLimitError} from "$lib/coa/errors";

  let dragging = false;

  const onFile = (getFilesFunction: any) => (event: any) => {
    dragging = false;
    const files = getFilesFunction(event);
    const file = files[0];
    if (!file) return;

    if (!file.type.match(/text|json/) && !/\.json$/i.test(file.name)) {
      message.error("error.notJsonOrText");
      return;
    }

    loadCOA(file);
  };

  function getFilesFromDropEvent(event: DragEvent) {
    const transfer = event.dataTransfer;
    if (!transfer) return [];
    return transfer.files.length
      ? Array.from(transfer.files)
      : Array.from(transfer.items)
          .filter(item => item.kind === "file")
          .map(item => item.getAsFile())
          .filter(Boolean);
  }

  function getFilesFromInputEvent(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    target.value = "";
    return files;
  }

  function loadCOA(file: Blob) {
    if (file.size > IMPORT_LIMITS.bytes) {
      message.error("error.coaImportTooLarge");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => message.error("error.loadingCoa");
    reader.onload = function () {
      let coas;
      try {
        coas = parseCoaImport(String(this.result), {colors: $colors, fonts: $fonts, uploaded: $uploaded});
      } catch (error) {
        message.error(error instanceof RequestLimitError ? "error.coaImportTooLarge" : "error.invalidCoaImport");
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
        $matrices[$matrix] = Array.from({length: coas.length}, (_, i) => l + i);
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
