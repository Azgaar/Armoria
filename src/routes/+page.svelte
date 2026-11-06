<script lang="ts">
  import {settingsStorage, reportSettingsRecovery} from "#lib/data/storage.ts";
  // @ts-check
  import {charges, shields, shieldSets} from "#lib/data/dataModel.js";
  import {
    background,
    colors,
    fonts,
    history,
    isTextReady,
    matrices,
    matrix,
    message,
    shield,
    size,
    state as editorState,
    uploaded
  } from "#lib/data/stores.ts";
  import {parseCoa} from "#lib/coa/validation.ts";
  import {RequestLimitError} from "#lib/coa/errors.ts";
  import {registerCharge} from "#lib/data/charges.js";
  import "#lib/scripts/i18n.ts";
  import {rw} from "#lib/scripts/utils.ts";
  import {untrack} from "svelte";
  import {locale} from "svelte-i18n";
  import StorageNotice from "#lib/components/StorageNotice.svelte";
  import Message from "#lib/components/Message.svelte";
  import WindowEvents from "#lib/components/WindowEvents.svelte";
  import Editor from "#lib/components/editor/Editor.svelte";
  import About from "#lib/components/navigation/About.svelte";
  import Fonts from "#lib/components/navigation/Fonts.svelte";
  import Gallery from "#lib/components/navigation/Gallery.svelte";
  import License from "#lib/components/navigation/License.svelte";
  import Tinctures from "#lib/components/navigation/Tinctures.svelte";
  import UploadJSON from "#lib/components/navigation/UploadJSON.svelte";
  import UploadRaster from "#lib/components/navigation/UploadRaster.svelte";
  import UploadVector from "#lib/components/navigation/UploadVector.svelte";
  import Viewer from "#lib/components/navigation/Viewer.svelte";
  import Navbar from "#lib/components/navigation/header/Navbar.svelte";
  import CoaSync from "#lib/components/CoaSync.svelte";

  let gallery = $state.raw<number[]>([]);
  let seed = $state<string>();
  let coaSize = $state(200);

  $locale = "en"; // fallback locale

  loadFonts();
  loadCustomCharges();
  checkLoadParameters();

  const dimensions = $derived(defineGallerySize($size));
  const [, width, height] = $derived(dimensions);
  $effect.pre(() => {
    const currentMatrix = $matrix;
    const count = dimensions[0];
    // History/state writes belong to this transition, not to its dependencies.
    untrack(() => handleMatrixChange(currentMatrix, count));
  });

  function handleMatrixChange(matrix: number, quantity: number) {
    const l = $history.length;

    // reroll is clicked
    if (!$matrices[matrix]) {
      if ($editorState.edit) {
        // generate new coa
        $matrices[matrix] = $matrices[matrix - 1].slice();
        $matrices[matrix][$editorState.i] = l;
        seed = undefined; // use once
      } else {
        // reroll gallery
        $matrices[matrix] = Array.from({length: quantity}, (_, i) => l + i);
      }

      // change shield if it's not locked (manually selected)
      if (!settingsStorage.getItem("shield")) {
        $shield = rw(shieldSets[rw(shields.types)]);
      }
    }

    // add additional coas to matrix if size is smaller
    if ($matrices[matrix].length < quantity) {
      const m = $matrices[matrix];
      $matrices[matrix] = [...Array(quantity).keys()].map(i => (m[i] !== undefined ? m[i] : l + i));
    }
    gallery = $matrices[matrix].slice(0, quantity); // trim gallery if size was bigger

    // on coa edit or view mode
    if ($editorState.edit || $editorState.view) $editorState.c = $matrices[matrix][$editorState.i];
  }

  function loadFonts() {
    Object.entries($fonts).forEach(([name, {url}]) => {
      if (url) {
        try {
          const font = new FontFace(name, `url(${JSON.stringify(url)})`);
          document.fonts.add(font);
        } catch {
          reportSettingsRecovery();
        }
      }
    });
  }

  function loadCustomCharges() {
    Object.entries($uploaded).forEach(([name, {category, data}]) => {
      registerCharge(name, category, 5);
      if (data) {
        charges.data[name] = data;
      }
    });
  }

  function checkLoadParameters() {
    const url = new URL(window.location.href);
    const viewParam = url.searchParams.get("view") === "1";
    const sizeParam = Number(url.searchParams.get("size"));
    const coaParam = url.searchParams.get("coa");
    const seedParam = url.searchParams.get("seed");
    const from = url.searchParams.get("from");

    if (coaParam === null && !seedParam) return; // no predefined coa, regular flow (generate gallery)

    if (coaParam !== null) {
      try {
        const coa = parseCoa(coaParam, {colors: $colors, fonts: $fonts, uploaded: $uploaded});
        $history.push(coa);
      } catch (error) {
        message.error(error instanceof RequestLimitError ? "error.coaTooLarge" : "error.invalidCoa");
        return;
      }
    } else if (seedParam) {
      seed = seedParam;
    }

    if (coaParam || seedParam) {
      if (from === "FMG") {
        const live = url.searchParams.has("session") && window.opener; // the map receives each edit
        message.info(live ? "info.tipFromFmgLive" : "info.tipFromFmg", 10000);
      }

      $matrices[0] = [0];

      if (viewParam) {
        if (sizeParam) coaSize = sizeParam;
        $editorState.view = 1; // open in view only mode
      } else {
        $editorState.edit = 1; // open in edit mode
      }
    }
  }

  // define number and size of coas to display
  function defineGallerySize(desiredSize: number) {
    const width = window.innerWidth;
    const height = window.innerHeight - 60;

    const numberX = Math.ceil(width / desiredSize);
    const w = Math.floor(width / numberX);
    const numberY = Math.floor(height / w);
    const h = Math.floor(height / numberY);

    return [numberX * numberY, w, h];
  }
</script>

{#if $editorState.view}
  <Viewer c={$editorState.c} {seed} {coaSize} />
{:else}
  <div style="background-color: {$background}">
    <header>
      <Navbar />
    </header>

    {#if $editorState.edit}<Editor historyId={$editorState.c} {seed} />
    {:else}<Gallery {gallery} {width} {height} />{/if}

    {#if $editorState.about}<About />{/if}
    {#if $editorState.license}<License />{/if}
    {#if $editorState.import}<UploadJSON />{/if}
    {#if $editorState.raster}<UploadRaster />{/if}
    {#if $editorState.vector}<UploadVector />{/if}
    {#if $editorState.tinctures}<Tinctures />{/if}
    {#if $editorState.fonts}<Fonts />{/if}

    {#if $message && $isTextReady}{#key $message}<Message />{/key}{/if}
  </div>
{/if}
{#if $isTextReady}<StorageNotice />{/if}
<WindowEvents />
<CoaSync />

<style>
  div {
    height: 100%;
    width: 100%;
    background-image: url(/background.svg);
  }
</style>
