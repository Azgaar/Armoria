<script>
  import COA from './COA.svelte';
  import MenuItem from './MenuItem.svelte';
  import EditorType from './EditorType.svelte';
  import EditorSize from './EditorSize.svelte';
  import EditorTincture from './EditorTincture.svelte';
  import Switch from './Switch.svelte';
  import {slide} from 'svelte/transition';
  import {quartInOut} from 'svelte/easing';
  import {rw} from './utils.js';
  import {changes} from './stores';
  import {charges, tinctures, divisions, ordinaries, lines} from "./dataModel.js";
  export let coa, c;

  const min = Math.min(window.innerWidth, window.innerHeight);
  const ratio = window.innerHeight / window.innerWidth;
  const coaSize = Math.round(min * .9);
  const width = window.innerWidth < 600 || ratio > 1 ? 100 : Math.round((1.05 - ratio) * 100); // 56.25;
  const height = width === 100 ? null : "calc(100% - 45px)";
  const itemSize = Math.round(width * 1.473);

  const patterns = ["vair", "vairInPale", "vairEnPointe", "ermine", "chequy", "lozengy", "fusily", "pally", "barry", "gemelles", "bendy", "bendySinister", "palyBendy", "pappellony", "masoned", "fretty"];
  const chargeTypes = Object.keys(charges.types);
  const ordinariesList = ["no"].concat(Object.keys(ordinaries.lined)).concat(Object.keys(ordinaries.straight));

  let menu = {}, change = 1;

  // on reroll
  $: defineMenuState(c);

  // on coa change
  $: {
    if (change) changes.add(JSON.stringify(coa));
    change = 1;
  }

  // on undo or redo
  $: {
    if (changes.length()) {
      coa = JSON.parse($changes[0]);
      defineMenuState();
      change = 0;
    }
  }

  // define initial menu state, run only when new coa is passed
  function defineMenuState() {
    // Field
    menu.field = getField();
    function getField() {
      const type = isSemy(coa.t1) ? "semy" : isPattern(coa.t1) ? "pattern" : "tincture";
      let t1, t2, pattern = "vair", charge = "lozenge", semy = "conventional", size = "standard";

      const field = coa.t1.split("-"); // parsed field tincture

      if (type === "tincture") {
        t1 = coa.t1;
        t2 = selectSecondTincture(coa.t1, "field");
      } else {
        t1 = field[1];
        t2 = field[2];
        size = field[3] || "standard"
      }

      if (type === "pattern") pattern = field[0];
      else if (type === "semy") {
        charge = getSemyCharge(field);
        semy = getSemyType(field);
      }

      return {type, t1, t2, pattern, charge, semy, size}
    }

    // Division
    menu.division = getDivision();
    function getDivision() {
      let type = "tincture", division = "no", line = "straight", t1, t2, pattern = "vair", charge = "lozenge", semy = "conventional", size = "standard";

      if (coa.division) {
        const tSplit = coa.division.t.split("-"); // parsed division tincture
        type = isSemy(coa.division.t) ? "semy" : isPattern(coa.division.t) ? "pattern" : "tincture";

        division = coa.division.division;
        line = coa.division.line || "straight";
        t1 = type === "tincture" ? coa.division.t : tSplit[1];
        t2 = type === "tincture" ? selectSecondTincture(t1, "division") : tSplit[2];
        if (type === "pattern") pattern = tSplit[0];
        if (type === "semy") {
          charge = getSemyCharge(tSplit);
          semy = getSemyType(tSplit);
        }
        size = tSplit[3] || "standard";
      } else {
        t1 = selectSecondTincture(menu.field.t1, "division");
        t2 = selectSecondTincture(t1, "division");
      }

      return {division, line, type, t1, t2, pattern, charge, semy, size};
    }

    // Ordinary
    menu.ordinary = getOrdinary();
    function getOrdinary() {
      const ordinary = coa.ordinary ? coa.ordinary.ordinary : "no";
      const line = coa.ordinary ? coa.ordinary.line : "straight";
      const t = coa.ordinary ? coa.ordinary.t : rw(tinctures["colours"]["charge"]);

      return {ordinary, line, t}
    }

    // Charges
    menu.charges = getCharges();
    function getCharges() {
      if (!coa.charges) return [];
      const charges = coa.charges.map(c => {
        const {charge, t, p, size} = c;
        const type = getChargeType(charge);
        const sinister = c.sinister || false;
        const reversed = c.reversed || false;
        const x = c.x || 0;
        const y = c.y || 0;
        return {charge, type, t, p, size, sinister, reversed, x, y};
      });

      return charges;
    }

    function isPattern(string) {
      return string?.includes("-");
    }

    function isSemy(string) {
      return string?.slice(0,4) === "semy";
    }

    function getSemyCharge(array) {
      return array[0].split("_of_")[1];
    }

    function getChargeType(charge) {
      return chargeTypes.find(type => charges[type][charge]);
    }

    function getSemyType(array) {
      const charge = getSemyCharge(array);
      return getChargeType(charge);
    }

    return menu;
  }

  function addCharge() {
    const type = rw(charges.single);
    const charge = rw(charges[type]);
    const t = rw(tinctures[rw(tinctures.charge)].charge);
    const с = {charge, t, p: "e", type, size: 1.5};
    menu.charges = [...menu.charges, с];
  }

  function removeCharge(index) {
    menu.charges = menu.charges.filter((e, i) => i !== index);
  }

  // field attributes changed
  $: {
    if (menu.field.type === "tincture") coa.t1 = menu.field.t1; else {
      const type = menu.field.type === "semy" ? "semy_of_" + menu.field.charge : menu.field.pattern;
      const attibutes = [type, menu.field.t1, menu.field.t2];
      if (menu.field.size !== "standard") attibutes.push(menu.field.size);
      coa.t1 = attibutes.join("-");
    }
  }

  // division attributes changed
  $: {
    if (menu.division.division && menu.division.division !== "no") {
      coa.division = {division: menu.division.division};
      if (divisions[menu.division.division]) coa.division.line = menu.division.line;
      if (menu.division.type === "tincture") coa.division.t = menu.division.t1;
      else {
        const attr0 = menu.division.type === "semy" ? "semy_of_" + menu.division.charge : menu.division.pattern;
        const attibutes = [attr0, menu.division.t1, menu.division.t2];
        if (menu.division.size !== "standard") attibutes.push(menu.division.size);
        coa.division.t = attibutes.join("-");
      }
    } else delete coa.division;
  }

  // ordinary attributes changed
  $: {
    if (menu.ordinary && menu.ordinary.ordinary !== "no") {
      coa.ordinary = {ordinary: menu.ordinary.ordinary, t: menu.ordinary.t, line: menu.ordinary.line};
      if (!ordinaries.lined[menu.ordinary.ordinary]) delete coa.ordinary.line;
    } else delete coa.ordinary;
  }

  // charges attributes changed
  $: {
    if (menu.charges.length) {
      coa.charges = menu.charges.map(c => {
        const item = {charge: c.charge, t: c.t, p: c.p, size: c.size};
        if (c.sinister) item.sinister = 1;
        if (c.reversed) item.reversed = 1;
        if (c.x || c.y) {item.x = c.x; item.y = c.y;}
        return item;
      });
    }
  }

  function rolling(node, {duration = 1000}) {
    return {duration, css: t => `width: ${quartInOut(t) * width}%`}
  }

  function showSection(e) {
    e.target.classList.toggle("expanded");
    const panel = e.target.nextElementSibling;
    if (panel.style.maxHeight) panel.style.maxHeight = null;
    else panel.style.maxHeight = panel.scrollHeight + "px";
  }

  function updateSection(e) {
    const panel = e.currentTarget.closest(".panel");
    setTimeout(() => panel.style.maxHeight = panel.scrollHeight + "px", 100);
  }

  function selectSecondTincture(t1, type) {
    const metal = t1 === "argent" || t1 === "or";
    const tincturesType = metal ? tinctures["colours"] : tinctures["metals"];
    return rw(tincturesType[type]);
  }

  function cap(string = "no") {
    const split = string.split(/(?=[A-Z])/).join(" ");
    return split.charAt(0).toUpperCase() + split.slice(1);
  }
</script>

<div id="editor">
  {#key coa}
    <COA {coa} i="Edit" w={coaSize} h={coaSize}/>
  {/key}
  <div id="menu" in:rolling style="width:{width}%; height:{height}">
    <!-- Field -->
    <div class="section" class:expanded={false} on:click={showSection}>Field</div>
    <div class="panel">
      <div class="subsection">
        <EditorType bind:type={menu.field.type} {updateSection}/>
        {#if menu.field.type !== "tincture"}
          <EditorSize bind:size={menu.field.size}/>
        {/if}
      </div>

      <div class="subsection">
        <EditorTincture bind:t1={menu.field.t1} {itemSize}/>
      </div>

      {#if menu.field.type !== "tincture"}
        <div class="subsection">
          <EditorTincture bind:t1={menu.field.t2} {itemSize}/>
        </div>
      {/if}

      {#if menu.field.type === "pattern"}
        <div class="subsection">
          <div>Pattern:</div>
          {#each patterns.map(p => new Object({t1: `${p}-${menu.field.t1}-${menu.field.t2}-${menu.field.size}`, pattern: p})) as coa}
            <div class=item class:selected={menu.field.pattern === coa.pattern} on:click={() => menu.field.pattern = coa.pattern}>
              <MenuItem {coa} title={cap(coa.pattern)} {itemSize}/>
            </div>
          {/each}
        </div>
      {/if}

      {#if menu.field.type === "semy"}
        <div class="subsection">
          <div>Charge:
            <select bind:value={menu.field.semy}>
              {#each chargeTypes as type}
                <option value={type}>{cap(type)}</option>
              {/each}
            </select>
          </div>

          {console.log(menu.field.semy, menu, coa)}
          {#each Object.keys(charges[menu.field.semy]).map(c => new Object({t1: `semy_of_${c}-${menu.field.t1}-${menu.field.t2}-${menu.field.size}`, charge: c})) as coa (coa)}
            <div class=item class:selected={menu.field.charge === coa.charge} on:click={() => menu.field.charge = coa.charge}>
              <MenuItem {coa} title={cap(coa.charge)} {itemSize}/>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Division -->
    <div class="section" on:click={showSection}>Division</div>
    <div class="panel">
      <div class="subsection" on:click={updateSection}>
        {#each ["no"].concat(Object.keys(divisions.variants)).map(division => new Object({t1: coa.t1, division: {division, t: coa.division ? coa.division.t : menu.division.t1, line: menu.division.line}})) as coa (coa)}
          <div class=item class:selected={menu.division.division === coa.division.division} on:click={() => menu.division.division = coa.division.division}>
            <MenuItem {coa} title={cap(coa.division.division)} {itemSize}/>
          </div>
        {/each}
      </div>

      {#if divisions[coa.division?.division]}
        <div class="subsection">
          <div>Line:</div>
          {#each Object.keys(lines).map(line => new Object({t1: coa.t1, division: {division: menu.division.division, t: coa.division ? coa.division.t : menu.division.t1, line}})) as coa (coa)}
            <div class=item class:selected={menu.division.line === coa.division.line} on:click={() => menu.division.line = coa.division.line}>
              <MenuItem {coa} title={cap(coa.division.line)} {itemSize}/>
            </div>
          {/each}
        </div>
      {/if}

      {#if coa.division}
        <div class="subsection">
          <EditorType bind:type={menu.division.type} {updateSection}/>
          {#if menu.division.type !== "tincture"}
            <EditorSize bind:size={menu.division.size}/>
          {/if}
        </div>

        <div class="subsection">
          <EditorTincture bind:t1={menu.division.t1} {itemSize}/>
        </div>

        {#if menu.division.type !== "tincture"}
          <div class="subsection">
            <EditorTincture bind:t1={menu.division.t2} {itemSize}/>
          </div>
        {/if}

        {#if menu.division.type === "pattern"}
          <div class="subsection">
            <div>Pattern:</div>
            {#each patterns.map(p => new Object({t1: `${p}-${menu.division.t1}-${menu.division.t2}-${menu.division.size}`, pattern: p})) as coa}
              <div class=item class:selected={menu.division.pattern === coa.pattern} on:click={() => menu.division.pattern = coa.pattern}>
                <MenuItem {coa} title={cap(coa.pattern)} {itemSize}/>
              </div>
            {/each}
          </div>
        {/if}

        {#if menu.division.type === "semy"}
          <div class="subsection">
            <div>Charge:
              <select bind:value={menu.division.semy}>
                {#each chargeTypes as type}
                  <option value={type}>{cap(type)}</option>
                {/each}
              </select>
            </div>

            {#each Object.keys(charges[menu.division.semy]).map(c => new Object({t1: `semy_of_${c}-${menu.division.t1}-${menu.division.t2}-${menu.division.size}`, charge: c})) as coa (coa)}
              <div class=item class:selected={menu.division.charge === coa.charge} on:click={() => menu.division.charge = coa.charge}>
                <MenuItem {coa} title={cap(coa.charge)} {itemSize}/>
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    </div>

    <!-- Ordinary -->
    <div class="section" on:click={showSection}>Ordinary</div>
    <div class="panel">
      <div class="subsection" on:click={updateSection}>
        {#each ordinariesList.map(ordinary => new Object({t1: coa.t1, ordinary: {ordinary, line: menu.ordinary.line, t: menu.ordinary.t}})) as coa (coa)}
          <div class=item class:selected={menu.ordinary.ordinary === coa.ordinary.ordinary} on:click={() => menu.ordinary.ordinary = coa.ordinary.ordinary}>
            <MenuItem {coa} title={cap(coa.ordinary.ordinary)} {itemSize}/>
          </div>
        {/each}
      </div>
    
      {#if ordinaries.lined[menu.ordinary.ordinary]}
        <div class="subsection">
          <div>Line:</div>
          {#each Object.keys(lines).map(line => new Object({t1: coa.t1, ordinary: {ordinary: menu.ordinary.ordinary, line, t: menu.ordinary.t}})) as coa (coa)}
            <div class=item class:selected={menu.ordinary.line === coa.ordinary.line} on:click={() => menu.ordinary.line = coa.ordinary.line}>
              <MenuItem {coa} title={cap(coa.ordinary.line)} {itemSize}/>
            </div>
          {/each}
        </div>
      {/if}
    
      {#if coa.ordinary}
        <div class="subsection">
          <EditorTincture bind:t1={menu.ordinary.t} {itemSize}/>
        </div>
      {/if}
    </div>

    <!-- Charges -->
    {#each menu.charges as charge, i}
      <div class="section" in:slide on:click={showSection}>Charge {menu.charges.length > 1 ? i+1 : ""}</div>
      <div class="panel">

        <div class="subsection">
          <div>Category:
            <select bind:value={charge.type} on:input={updateSection}>
              {#each chargeTypes as type}
                <option value={type}>{cap(type)}</option>
              {/each}
            </select>

            <span style="margin-left: 1em">Size:</span>
            <input type="number" min=.1 max=2 step=.01 bind:value={charge.size}/>

            <span style="margin-left: 1em">Sinister:</span>
            <Switch bind:checked={charge.sinister}/>

            <span style="margin-left: 1em">Reversed:</span>
            <Switch bind:checked={charge.reversed}/>

            <b on:click={() => removeCharge(i)} class="removeButton" title="Remove charge">✖</b>
          </div>

          {#each Object.keys(charges[charge.type]).map(c => new Object({c, t1: coa.t1, charges: [{charge:c, t: charge.t, p:"e", size: 1.5, sinister: charge.sinister, reversed: charge.reversed}]})) as coa (coa)}
            <div class=item class:selected={charge.charge === coa.c} on:click={() => charge.charge = coa.c}>
              <MenuItem {coa} title={cap(coa.c)} {itemSize}/>
            </div>
          {/each}
        </div>

        <div class="subsection">
          <EditorTincture bind:t1={charge.t} {itemSize}/>
        </div>
      </div>
    {/each}

    <div class="buttonLine" on:click={addCharge}>Add charge</div>
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
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: thin;
    transition: .5s;
  }

  #menu::-webkit-scrollbar {
    width: 6px;
    background-color: #cccccc80;
  }

  #menu::-webkit-scrollbar-thumb {
    background-color: #111;
  }

  .section {
    padding: 1em 1.14em;
    color: #fff;
    background-color: #00000060;
    cursor: pointer;
    transition: background-color .1s ease;
    overflow-x: hidden;
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
    transition: max-height .2s ease-out;
    background-color: #13131320;
    overflow: hidden;
  }

  .subsection {
    color: #fff;
    padding: .5em 1em;
  }

  .subsection select {
    margin-left: .6em;
    cursor: pointer;
  }

  .buttonLine {
    padding: 1em 1.14em;
    color: #fff;
    background-color: #00000060;
    cursor: pointer;
    transition: background-color .1s ease;
  }

  .buttonLine:hover {
    background-color: #00000080;
  }

  .removeButton {
    float: right;
    margin: .3em -0.1em 0 0;
    cursor: pointer;
  }

  .removeButton:active {
    transform: translateY(1px);
  }

  :global(.item) {
    display: inline-block;
    cursor: pointer;
    transition: background-color .2s ease;
  }

  :global(.item:hover) {
    background-color: #ffffff10;
  }

  :global(.item:active) {
    transform: translateY(1px);
  }

  :global(.selected) {
    background-color: #ffffff15;
  }
</style>