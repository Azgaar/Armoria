<script>
  import COA from './COA.svelte';
  import MenuItem from './MenuItem.svelte';
  import {quartInOut} from 'svelte/easing';
  import {generate, rw} from './generator.js';
  import {history, state} from './stores';
  import {charges, tinctures as tData} from "./dataModel.js";

  const min = Math.min(window.innerWidth, window.innerHeight);
  const ratio = window.innerHeight / window.innerWidth;
  const coaSize = Math.round(min * .9);
  const width = window.innerWidth < 600 || ratio > 1 ? 100 : Math.round((1.05 - ratio) * 100); // 56.25;
  const height = width === 100 ? null : "100%";
  const itemSize = Math.round(width * 1.473);
  const maxPanelHeight = Math.round(window.innerHeight * .65);

  const tinctures = ["argent", "or", "gules", "sable", "azure", "vert", "purpure"].map(t => new Object({t1: t}));
  const patterns = ["vair", "vairInPale", "vairEnPointe", "ermine", "chequy", "lozengy", "fusily", "pally", "barry", "gemelles", "bendy", "bendySinister", "palyBendy", "pappellony", "masoned", "fretty"];
  const chargeTypes = Object.keys(charges.types);

  let coa, fieldType, fieldT1, fieldT2, fieldPattern = "vair", semyType = "conventional", fieldCharge = "lozenge", fieldSize;
  $: {
    // generate coa or get if from history
    coa = $history[$state.c] || generate();
    if (!$history[$state.c]) $history[$state.c] = coa;

    // define initial menu state
    if (!fieldType) {
      fieldType = isSemy(coa.t1) ? "semy" : isPattern(coa.t1) ? "pattern" : "tincture";
      const split = coa.t1.split("-"); // parsed tincture
      fieldT1 = fieldType === "tincture" ? coa.t1 : split[1];
      if (fieldType !== "tincture") fieldT2 = split[2];
      if (!fieldT2) fieldT2 = selectSecondTincture(fieldT1, "field");
      if (fieldType === "pattern") fieldPattern = split[0];
      if (fieldType === "semy") {
        fieldCharge = split[0].split("_of_")[1];
        semyType = chargeTypes.find(type => type[fieldCharge]);
      }
      fieldSize = split[3] || "standard";
    }
  }

  // field attributes changed
  $: {
    if (fieldType === "tincture") coa.t1 = fieldT1;
    else if (fieldType !== "tincture") {
      const attr0 = fieldType === "semy" ? "semy_of_" + fieldCharge : fieldPattern;
      const attibutes = [attr0, fieldT1, fieldT2];
      if (fieldSize !== "standard") attibutes.push(fieldSize);
      coa.t1 = attibutes.join("-");
    }
  }

  function isPattern(string) {
    return string.includes("-");
  } 

  function isSemy(string) {
    return string.slice(0,4) === "semy";
  }

  function rolling(node, {duration = 1000}) {
    return {duration, css: t => `width: ${quartInOut(t) * width}%`}
  }

  function showSection(e) {
    e.target.classList.toggle("expanded");
    const panel = e.target.nextElementSibling;
    if (panel.style.maxHeight) panel.style.maxHeight = null;
    else panel.style.maxHeight = Math.min(panel.scrollHeight, maxPanelHeight) + "px";
  }

  function updateSection(e) {
    const panel = e.target.parentElement.parentElement;
    setTimeout(() => panel.style.maxHeight = Math.min(panel.scrollHeight, maxPanelHeight) + "px", 100);
  }

  function selectSecondTincture(t1, type) {
    const metal = t1 === "argent" || t1 === "or";
    const tinctures = metal ? tData["colours"] : tData["metals"];
    return rw(tinctures[type]);
  }

  function cap(string) {
    const split = string.split(/(?=[A-Z])/).join(" ");
    return split.charAt(0).toUpperCase() + split.slice(1);
  }
</script>

<div id="editor">
  {#key $state.c}
    <COA {coa} i={$state.i} w={coaSize} h={coaSize}/>
  {/key}
  <div id="menu" in:rolling style="width:{width}%; height:{height}">
    <ul>
      <div class="section" class:expanded={false} on:click={showSection}>Field</div>
      <div class="panel">
        <div class="subsection">Type:
          <select bind:value={fieldType} on:input={updateSection}>
            <option value="tincture">Tincture</option>
            <option value="pattern">Pattern</option>
            <option value="semy">Semy</option>
          </select>

          {#if fieldType !== "tincture"}
            <span class="leftMargin">Size:</span>
            <select bind:value={fieldSize}>
              <option value="big">Big</option>
              <option value="standard">Standard</option>
              <option value="small">Small</option>
              <option value="smaller">Smaller</option>
              <option value="smallest">Smallest</option>
            </select>
          {/if}
        </div>

        <div class="subsection">
          <div>Tincture:</div>
          {#each tinctures as coa}
            <div class=item class:selected={fieldT1 === coa.t1} on:click={() => fieldT1 = coa.t1}>
              <MenuItem {coa} title={cap(coa.t1)} {itemSize}/>
            </div>
          {/each}
        </div>

        {#if fieldType !== "tincture"}
          <div class="subsection">
            <div>Tincture 2:</div>
            {#each tinctures as coa}
              <div class=item class:selected={fieldT2 === coa.t1} on:click={() => fieldT2 = coa.t1}>
                <MenuItem {coa} title={cap(coa.t1)} {itemSize}/>
              </div>
            {/each}
          </div>
        {/if}

        {#if fieldType === "pattern"}
          <div class="subsection">
            <div>Pattern:</div>
            {#each patterns.map(p => new Object({t1: `${p}-${fieldT1}-${fieldT2}-${fieldSize}`, pattern: p})) as coa}
              <div class=item class:selected={fieldPattern === coa.pattern} on:click={() => fieldPattern = coa.pattern}>
                <MenuItem {coa} title={cap(coa.pattern)} {itemSize}/>
              </div>
            {/each}
          </div>
        {/if}

        {#if fieldType === "semy"}
          <div class="subsection">
            <div>Charge:
              <select bind:value={semyType}>
                {#each chargeTypes as type}
                  <option value={type}>{cap(type)}</option>
                {/each}
              </select>
            </div>

            {#each Object.keys(charges[semyType]).map(c => new Object({t1: `semy_of_${c}-${fieldT1}-${fieldT2}-${fieldSize}`, charge: c})) as coa}
              <div class=item class:selected={fieldCharge === coa.charge} on:click={() => fieldCharge = coa.charge}>
                <MenuItem {coa} title={cap(coa.charge)} {itemSize}/>
              </div>
            {/each}
          </div>
        {/if}
      </div>
      <div class="section" on:click={showSection}>Division</div>
      <div class="panel">
      </div>
      <div class="section" on:click={showSection}>Ordinary</div>
      <div class="panel">
      </div>
      <div class="section" on:click={showSection}>Charge</div>
      <div class="panel">
      </div>
    </ul>
  </div>
</div>

<style>
  #editor {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    user-select: none;
  }

  #menu {
    position: fixed;
    top: 45px;
    right: 0;
    background-color: #11111180;
    overflow: hidden;
    transition: .5s;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  .section {
    padding: 1em 1.14em;
    color: #fff;
    background-color: #00000060;
    cursor: pointer;
    transition: background-color .1s ease;
  }

  .section:hover {
    background-color: #00000080;
  }

  .section:before {
    content: "\276F";
    transition: .2s ease-out;
    margin-top: -.1em;
    position: absolute;
    right: 1em;
  }

  .expanded:before {
    transform: rotate(90deg);
  }

  .panel {
    max-height: 0;
    min-width: 100%;
    max-width: max-content;
    overflow-x: hidden;
    overflow-y: auto;
    transition: max-height .2s ease-out;
    background-color: #13131320;
    scrollbar-width: thin;
  }

  .panel::-webkit-scrollbar {
    width: 6px;
    background-color: #cccccc80;
  }

  .panel::-webkit-scrollbar-thumb {
    background-color: #111;
  }

  .subsection {
    color: #fff;
    padding: .5em 1em;
  }

  .subsection select {
    margin-left: .6em;
    cursor: pointer;
  }

  .item {
    display: inline-block;
    cursor: pointer;
    transition: background-color .2s ease;
  }

  .item:hover {
    background-color: #ffffff10;
  }

  .item:active {
    transform: translateY(1px);
  }

  .selected {
    background-color: #ffffff15;
  }

  .leftMargin {
    margin-left: 1em;
  }
</style>