<script lang="ts">
  // @ts-check
  import {getFilesFromDropEvent, getFilesFromInputEvent} from "#lib/scripts/files.ts";
  import {onDestroy} from "svelte";
  import type {Snippet} from "svelte";
  import {changes, colors, fonts, history, matrices, matrix, message, state as editorState, uploaded} from "#lib/data/stores.ts";

  import {IMPORT_LIMITS, parseCoaImport} from "#lib/coa/validation.ts";
  import {RequestLimitError} from "#lib/coa/errors.ts";

  let {children}: {children?: Snippet<[{dragging: boolean}]>} = $props();

  let dragging = $state(false);

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

      if (!file.type.match(/text|json/) && !/\.json$/i.test(file.name)) {
        message.error("error.notJsonOrText");
        return;
      }

      loadCOA(file);
    };

  function loadCOA(file: Blob) {
    if (file.size > IMPORT_LIMITS.bytes) {
      message.error("error.coaImportTooLarge");
      return;
    }
    const activeReader = (reader = new FileReader());
    activeReader.onerror = () => message.error("error.loadingCoa");
    activeReader.onload = function () {
      let coas;
      try {
        coas = parseCoaImport(String(this.result), {colors: $colors, fonts: $fonts, uploaded: $uploaded});
      } catch (error) {
        message.error(error instanceof RequestLimitError ? "error.coaImportTooLarge" : "error.invalidCoaImport");
        return;
      }

      if ($editorState.edit) {
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
      $editorState.import = 0;
      message.success("success.coaLoaded");
    };
    activeReader.readAsText(file);
  }
</script>

<div
  id="jsonUpload"
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
  <span onclick={() => ($editorState.import = 0)} class="close">&times;</span>
  <div class="container">
    <label class="dragging">
      {#if children}
        {@render children({dragging})}
      {:else}
        <div>Drag &amp; Drop JSON file here or <b>browse</b></div>
      {/if}
      <input type="file" accept=".json" oninput={onFile(getFilesFromInputEvent)} />
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
