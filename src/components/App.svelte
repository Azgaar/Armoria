<script>
  import {isLoading, locale} from "svelte-i18n";
  import WindowEvents from "./WindowEvents.svelte";
  import Navbar from "./navigation/header/Navbar.svelte";
  import About from "./navigation/About.svelte";
  import License from "./navigation/License.svelte";
  import Viewer from "./navigation/Viewer.svelte";
  import Editor from "./editor/Editor.svelte";
  import Gallery from "./navigation/Gallery.svelte";
  import UploadRaster from "./navigation/UploadRaster.svelte";
  import UploadVector from "./navigation/UploadVector.svelte";
  import Tinctures from "./navigation/Tinctures.svelte";
  import Message from "./Message.svelte";
  import {background, size, history, matrices, matrix, state, message, shield} from "data/stores";
  import {shields} from "data/shields";
  import {rw} from "scripts/utils";
  import "scripts/i18n";

  let n,
    w,
    h,
    gallery = [],
    seed,
    coaSize = 200;

  $locale = "en"; // fallback locale

  checkLoadParameters(); // on load
  $: [n, w, h] = defineGallerySize($size);
  $: handleMatrixChange($matrix, $size);

  function handleMatrixChange() {
    const l = $history.length;

    // reroll is clicked
    if (!$matrices[$matrix]) {
      if ($state.edit) {
        // generate new coa
        $matrices[$matrix] = $matrices[$matrix - 1].slice();
        $matrices[$matrix][$state.i] = l;
        seed = undefined; // use once
      } else {
        // reroll gallery
        $matrices[$matrix] = Array.from({length: n}, (_, i) => l + i++);
      }

      // change shield if it's not locked (manually selected)
      if (!localStorage.getItem("shield")) {
        $shield = rw(shields[rw(shields.types)]);
      }
    }

    // add additional coas to matrix if size is smaller
    if ($matrices[$matrix].length < n) {
      const m = $matrices[$matrix];
      $matrices[$matrix] = [...Array(n).keys()].map(i => (m[i] !== undefined ? m[i] : l + i));
    }
    gallery = $matrices[$matrix].slice(0, n); // trim gallery if size was bigger

    // on coa edit or view mode
    if ($state.edit || $state.view) $state.c = $matrices[$matrix][$state.i];
  }

  function checkLoadParameters() {
    const url = new URL(window.location);
    const viewParam = url.searchParams.get("view") == 1;
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
      // exact seed to use
      seed = isNaN(+seedParam) ? seedParam : +seedParam;
    }

    if (coaParam || seedParam) {
      if (from === "FMG") {
        const text = "Configure emblem, save it in SVG format and then load back to the Fantasy Map Generator";
        $message = {type: "info", text, timeout: 10000};
      }
      $matrices[0] = [0];
      if (viewParam) {
        if (sizeParam) coaSize = sizeParam;
        $state.view = 1; // open in view only mode
      } else $state.edit = 1; // open in edit mode
    }
  }

  function validateJSON(text) {
    try {
      JSON.parse(text);
      return true;
    } catch (e) {
      console.error(e);
      $message = {type: "error", text: `URL error: ${e.message}`, timeout: 5000};
      return false;
    }
  }

  // define number and size of coas to display
  function defineGallerySize(desiredSize) {
    const width = window.innerWidth;
    const height = window.innerHeight - 60;
    const numberX = Math.ceil(width / desiredSize);
    const w = Math.floor(width / numberX);
    const numberY = Math.floor(height / w);
    const h = Math.floor(height / numberY);
    return [numberX * numberY, w, h];
  }
</script>

{#if $isLoading}
  <h1>Loading...</h1>
{:else if $state.view}
  <Viewer c={$state.c} {seed} {coaSize} />
{:else if !$isLoading}
  <main style="background-color: {$background}">
    <Navbar />
    {#if $state.about}<About />{/if}
    {#if $state.license}<License />{/if}
    {#if $state.raster}<UploadRaster />{/if}
    {#if $state.vector}<UploadVector />{/if}
    {#if $state.tinctures}<Tinctures />{/if}
    {#if $state.edit}<Editor c={$state.c} {seed} />
    {:else}<Gallery {gallery} {w} {h} />{/if}
    {#if $message}<Message />{/if}
  </main>
{/if}
<WindowEvents />

<style>
  h1 {
    inset: 0;
    margin: 0;
    position: absolute;
    background-color: #222;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  main {
    background-image: url("data:image/svg+xml,%3Csvg width='84' height='84' viewBox='0 0 84 84' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23222' fill-opacity='.2'%3E%3Cpath d='M84 23c-4.417 0-8-3.584-8-7.998V8h-7.002C64.58 8 61 4.42 61 0H23c0 4.417-3.584 8-7.998 8H8v7.002C8 19.42 4.42 23 0 23v38c4.417 0 8 3.584 8 7.998V76h7.002C19.42 76 23 79.58 23 84h38c0-4.417 3.584-8 7.998-8H76v-7.002C76 64.58 79.58 61 84 61V23zM59.05 83H43V66.95c5.054-.5 9-4.764 9-9.948V52h5.002c5.18 0 9.446-3.947 9.95-9H83v16.05c-5.054.5-9 4.764-9 9.948V74h-5.002c-5.18 0-9.446 3.947-9.95 9zm-34.1 0H41V66.95c-5.053-.502-9-4.768-9-9.948V52h-5.002c-5.184 0-9.447-3.946-9.95-9H1v16.05c5.053.502 9 4.768 9 9.948V74h5.002c5.184 0 9.447 3.946 9.95 9zm0-82H41v16.05c-5.054.5-9 4.764-9 9.948V32h-5.002c-5.18 0-9.446 3.947-9.95 9H1V24.95c5.054-.5 9-4.764 9-9.948V10h5.002c5.18 0 9.446-3.947 9.95-9zm34.1 0H43v16.05c5.053.502 9 4.768 9 9.948V32h5.002c5.184 0 9.447 3.946 9.95 9H83V24.95c-5.053-.502-9-4.768-9-9.948V10h-5.002c-5.184 0-9.447-3.946-9.95-9zM50 50v7.002C50 61.42 46.42 65 42 65c-4.417 0-8-3.584-8-7.998V50h-7.002C22.58 50 19 46.42 19 42c0-4.417 3.584-8 7.998-8H34v-7.002C34 22.58 37.58 19 42 19c4.417 0 8 3.584 8 7.998V34h7.002C61.42 34 65 37.58 65 42c0 4.417-3.584 8-7.998 8H50z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
</style>
