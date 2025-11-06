<script lang="ts">
  // @ts-check
  import {charges, shields} from "data/dataModel";
  import {background, fonts, history, isTextReady, matrices, matrix, message, shield, size, state, uploaded} from "data/stores";
  import "scripts/i18n";
  import {rw} from "scripts/utils";
  import {locale} from "svelte-i18n";
  import Message from "./Message.svelte";
  import WindowEvents from "./WindowEvents.svelte";
  import Editor from "./editor/Editor.svelte";
  import About from "./navigation/About.svelte";
  import Fonts from "./navigation/Fonts.svelte";
  import Gallery from "./navigation/Gallery.svelte";
  import License from "./navigation/License.svelte";
  import Tinctures from "./navigation/Tinctures.svelte";
  import UploadJSON from "./navigation/UploadJSON.svelte";
  import UploadRaster from "./navigation/UploadRaster.svelte";
  import UploadVector from "./navigation/UploadVector.svelte";
  import Viewer from "./navigation/Viewer.svelte";
  import Navbar from "./navigation/header/Navbar.svelte";

  let quantity: number;
  let width: number;
  let height: number;
  let gallery = [];
  let seed: string = undefined;
  let coaSize = 200;

  $locale = "en"; // fallback locale

  loadFonts();
  loadCustomCharges();
  checkLoadParameters();

  $: [quantity, width, height] = defineGallerySize($size);
  $: handleMatrixChange($matrix, $size);

  function handleMatrixChange(matrix: number, size: number) {
    const l = $history.length;

    // reroll is clicked
    if (!$matrices[matrix]) {
      if ($state.edit) {
        // generate new coa
        $matrices[matrix] = $matrices[matrix - 1].slice();
        $matrices[matrix][$state.i] = l;
        seed = undefined; // use once
      } else {
        // reroll gallery
        $matrices[matrix] = Array.from({length: quantity}, (_, i) => l + i++);
      }

      // change shield if it's not locked (manually selected)
      if (!localStorage.getItem("shield")) {
        $shield = rw(shields[rw(shields.types)]);
      }
    }

    // add additional coas to matrix if size is smaller
    if ($matrices[matrix].length < quantity) {
      const m = $matrices[matrix];
      $matrices[matrix] = [...Array(quantity).keys()].map(i => (m[i] !== undefined ? m[i] : l + i));
    }
    gallery = $matrices[matrix].slice(0, quantity); // trim gallery if size was bigger

    // on coa edit or view mode
    if ($state.edit || $state.view) $state.c = $matrices[matrix][$state.i];
  }

  function loadFonts() {
    Object.entries($fonts).forEach(([name, {url}]) => {
      if (url) {
        const font = new FontFace(name, `url(${url})`);
        document.fonts.add(font);
      }
    });
  }

  function loadCustomCharges() {
    Object.entries($uploaded).forEach(([name, {category, type, data, content}]) => {
      charges[category][name] = 0;
      if (data) {
        charges.data[name] = data;
      }
    });
  }

  function checkLoadParameters() {
    const url = new URL(window.location.href);
    const viewParam = url.searchParams.get("view") === "1";
    const sizeParam = +url.searchParams.get("size");
    const coaParam = url.searchParams.get("coa");
    const seedParam = url.searchParams.get("seed");
    const from = url.searchParams.get("from");

    if (!coaParam && !seedParam) return; // no predefined coa, regular flow (generate gallery)

    if (coaParam) {
      // exact coa to render
      if (!validateJSON(coaParam)) return;
      $history.push(JSON.parse(coaParam));
    } else if (seedParam) {
      seed = seedParam;
    }

    if (coaParam || seedParam) {
      if (from === "FMG") {
        message.info("info.tipFromFmg", 10000);
      }

      $matrices[0] = [0];

      if (viewParam) {
        if (sizeParam) coaSize = sizeParam;
        $state.view = 1; // open in view only mode
      } else {
        $state.edit = 1; // open in edit mode
      }
    }
  }

  function validateJSON(text: string) {
    try {
      JSON.parse(text);
      return true;
    } catch (error) {
      console.error(error);
      message.error(error.message);
      return false;
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

{#if $state.view}
  <Viewer c={$state.c} {seed} {coaSize} />
{:else}
  <div style="background-color: {$background}">
    <header>
      <Navbar />
    </header>

    {#if $state.edit}<Editor historyId={$state.c} {seed} />
    {:else}<Gallery {gallery} {width} {height} />{/if}

    {#if $state.about}<About />{/if}
    {#if $state.license}<License />{/if}
    {#if $state.import}<UploadJSON />{/if}
    {#if $state.raster}<UploadRaster />{/if}
    {#if $state.vector}<UploadVector />{/if}
    {#if $state.tinctures}<Tinctures />{/if}
    {#if $state.fonts}<Fonts />{/if}

    {#if $message && $isTextReady}<Message />{/if}
  </div>
{/if}
<WindowEvents />

<style>
  div {
    height: 100%;
    width: 100%;
    background-image: url(../background.svg);
  }
</style>
