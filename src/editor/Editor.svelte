<script>
  import COA from '../COA.svelte';
  import EditorType from './EditorType.svelte';
  import EditorSize from './EditorSize.svelte';
  import EditorTincture from './EditorTincture.svelte';
  import EditorPattern from './EditorPattern.svelte';
  import EditorCategory from './EditorCategory.svelte';
  import EditorCharge from './EditorCharge.svelte';
  import EditorDivision from './EditorDivision.svelte';
  import EditorDivided from './EditorDivided.svelte';
  import EditorLine from './EditorLine.svelte';
  import EditorOrdinary from './EditorOrdinary.svelte';
  import EditorStroke from './EditorStroke.svelte';
  import EditorPosition from './EditorPosition.svelte';
  import EditorShift from "./EditorShift.svelte";
  import EditorControls from "./EditorControls.svelte";
  import {slide, fly} from 'svelte/transition';
  import {rw, ra} from '../utils';
  import {history, changes, tinctures, state, grid, showGrid, message} from '../stores';
  import {charges, divisions, ordinaries} from "../dataModel";
  import {generate} from '../generator';
  export let c, seed;
  let menu = {}, section = {field: 0, division: 0, ordinary: [], charge: []};

  const min = Math.min(window.innerWidth, window.innerHeight);
  const ratio = window.innerHeight / window.innerWidth;
  const coaSize = Math.round(min * .9);
  let width = window.innerWidth < 600 || ratio > 1 ? 100 : Math.round((1.05 - ratio) * 100);
  if (width / 100 * window.innerWidth < 300) width = 100;
  const itemSize = Math.floor(width / 1000 * window.innerWidth - 4); // ~10 items in row

  $state.transform = null;
  $state.positions = null;

  let coa = $history[c] || generate(seed || undefined); // on load
  $: restore($changes); // on undo/redo
  $: reroll(c); // on reroll
  $: update(menu); // on menu update
  $: edit(coa); // on edit
  $: localStorage.setItem("grid", $grid); // on grid change
  $: localStorage.setItem("showGrid", $showGrid); // on grid change

  function reroll(c) {
    console.log("reroll");
    coa = $history[c] || generate(seed || undefined);
    if (!$history[c]) $history.push(coa);
    changes.reset();
    defineMenuState();
  }

  function edit(coa) {
    console.log("coa change");
    changes.add(JSON.stringify(coa));
  }

  // get coa from menu on menu change
  function update() {
    console.log("menu update");
    // field attributes changed
    if (menu.field.type === "tincture") coa.t1 = menu.field.t1; else {
      const type = menu.field.type === "semy" ? "semy_of_" + menu.field.charge : menu.field.pattern;
      const attibutes = [type, menu.field.t1, menu.field.t2];
      if (menu.field.size !== "standard") attibutes.push(menu.field.size);
      coa.t1 = attibutes.join("-");
    }

    // division attributes changed
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

    // ordinary attributes changed
    if (menu.ordinaries.length) {
      coa.ordinaries = menu.ordinaries.map(o => {
        const item = {ordinary: o.ordinary, t: o.t};
        if (ordinaries.lined[o.ordinary]) item.line = o.line;
        if (coa.division && o.divided) item.divided = o.divided;
        if (o.showStroke) item.stroke = o.stroke;
        if (o.showStroke && o.strokeWidth !== 1) item.strokeWidth = o.strokeWidth;
        if (o.size && o.size !== 1) item.size = o.size;
        if (o.x || o.y) {item.x = o.x; item.y = o.y;}
        if (o.angle) item.angle = o.angle;
        return item;
      });
    } else delete coa.ordinaries;

    // charges attributes changed
    if (menu.charges.length) {
      coa.charges = menu.charges.map(c => {
        const item = {charge: c.charge, t: c.t, p: c.p, size: c.size};
        if (!c.showStroke) item.stroke = "none";
        if (c.stroke !== "#000000") item.stroke = c.stroke;
        if (c.divided) item.divided = c.divided;
        if (c.sinister) item.sinister = 1;
        if (c.reversed) item.reversed = 1;
        if (c.x || c.y) {item.x = c.x; item.y = c.y;}
        if (c.angle) item.angle = c.angle;
        return item;
      });
    } else delete coa.charges;
  }

  function restore() {
    if (!changes.length()) return;
    console.log("restore");
    coa = JSON.parse($changes[0]);
    defineMenuState();
  }

  // define initial menu state
  function defineMenuState() {
    console.log("define menu");
    // Field
    menu.field = getField();
    function getField() {
      const type = isSemy(coa.t1) ? "semy" : isPattern(coa.t1) ? "pattern" : "tincture";
      let t1, t2, pattern = "vair", charge = "lozenge", semy = "conventional", size = "standard";

      const field = coa.t1.split("-"); // parsed field tincture

      if (type === "tincture") {
        t1 = coa.t1;
        t2 = selectSecondTincture(coa.t1);
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
        t2 = type === "tincture" ? selectSecondTincture(t1) : tSplit[2];
        if (type === "pattern") pattern = tSplit[0];
        if (type === "semy") {
          charge = getSemyCharge(tSplit);
          semy = getSemyType(tSplit);
        }
        size = tSplit[3] || "standard";
      } else {
        t1 = selectSecondTincture(menu.field.t1);
        t2 = selectSecondTincture(t1);
      }

      return {division, line, type, t1, t2, pattern, charge, semy, size};
    }

    // Ordinaries
    menu.ordinaries = getOrdinaries();
    function getOrdinaries() {
      if (!coa.ordinaries) return [];

      const ordinaries = coa.ordinaries.map(o => {
        const {ordinary, t} = o;
        const line = o.line || "straight";
        const showStroke = Boolean(o.stroke);
        const stroke = o.stroke || "#000000";
        const strokeWidth = o.strokeWidth || 1;
        const size = o.size || 1;
        const x = o.x || 0;
        const y = o.y || 0;
        const angle = o.angle || 0;
        const divided = o.divided || "";
        if (angle) $state.transform = `rotate(${angle})`;
        return {ordinary, t, line, showStroke, stroke, strokeWidth, size, x, y, angle, divided};
      });

      return ordinaries;
    }

    // Charges
    menu.charges = getCharges();
    function getCharges() {
      if (!coa.charges) return [];
      const charges = coa.charges.map(c => {
        const {charge, t, p, size} = c;
        const type = getChargeCategory(charge);
        const showStroke = c.stroke !== "none";
        const stroke = c.stroke || "#000000";
        const divided = c.divided || "";
        const sinister = c.sinister || false;
        const reversed = c.reversed || false;
        const x = c.x || 0;
        const y = c.y || 0;
        const angle = c.angle || 0;
        if (angle) $state.transform = `rotate(${angle})`;
        return {charge, type, showStroke, stroke, divided, t, p, size, sinister, reversed, x, y, angle};
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

    function getChargeCategory(charge) {
      const type = Object.keys(charges.types).find(type => charges[type][charge])
      return type || charge;
    }

    function getSemyType(array) {
      const charge = getSemyCharge(array);
      return getChargeCategory(charge);
    }

    function selectSecondTincture(t1) {
      const metal = t1 === "argent" || t1 === "or";
      return rw(metal ? $tinctures.colours : $tinctures.metals);
    }

    return menu;
  }

  function addOrdinary() {
    const ordinariesList = Object.keys(ordinaries.lined).concat(Object.keys(ordinaries.straight));
    const ordinary = ra(ordinariesList);
    const t = rw($tinctures[rw($tinctures.charge)]);
    const o = {ordinary, t, showStroke: false, stroke: "#000000", strokeWidth: 1, line: "straight", size: 1, x: 0, y: 0, angle: 0, divided: ""};
    menu.ordinaries = [...menu.ordinaries, o];
  }

  function addCharge() {
    const type = rw(charges.single);
    const charge = rw(charges[type]);
    const t = rw($tinctures[rw($tinctures.charge)]);
    const с = {charge, t, p: "e", showStroke: true, stroke: "#000000", type, size: 1.5, sinister: false, reversed: false, x: 0, y: 0, angle: 0, divided: ""};
    menu.charges = [...menu.charges, с];
  }

  if (!isTouchDevice() && (coa.ordinaries || coa.charges)) {
    $message = {type: "info", text: "Drag to move, hold SHIFT and drag vertically to resize, hold CONTROL and drag horizontally to rotate", timeout: 5000};
  }

  function isTouchDevice() {
    return 'ontouchstart' in window;
  }

  function isRaster(charge) {
    const el = document.getElementById(charge);
    return el ? el.tagName === "image" : false;
  }

  function cap(string = "no") {
    const split = string.split(/(?=[A-Z])/).join(" ");
    return split.charAt(0).toUpperCase() + split.slice(1);
  }
</script>

<div id=editor>
  {#key coa}
    <COA {coa} i=Edit w={coaSize} h={coaSize}/>
  {/key}
  <div id=menu in:fly={{x: 1000, duration: 1000}} style="width:{width}%">
    <!-- Field -->
    <div class=section class:expanded={section.field} on:click={() => section.field = !section.field}>Field</div>
    {#if section.field}
      <div class=panel transition:slide>
        <div class=subsection>
          <EditorType bind:type={menu.field.type}/>
          {#if menu.field.type !== "tincture"}
            <EditorSize bind:size={menu.field.size}/>
          {/if}
        </div>

        <div class=subsection>
          <EditorTincture bind:t1={menu.field.t1} {itemSize}/>
        </div>

        {#if menu.field.type !== "tincture"}
          <div class=subsection>
            <EditorTincture bind:t1={menu.field.t2} {itemSize}/>
          </div>
        {/if}

        {#if menu.field.type === "pattern"}
          <div class=subsection>
            <EditorPattern bind:pattern={menu.field.pattern} t1={menu.field.t1} t2={menu.field.t2} size={menu.field.size} {itemSize}/>
          </div>
        {/if}

        {#if menu.field.type === "semy"}
          <div class=subsection>
            <EditorCategory name=Charge bind:category={menu.field.semy}/>
            <EditorCharge type=semy bind:charge={menu.field.charge} category={menu.field.semy} t1={menu.field.t1} t2={menu.field.t2} size={menu.field.size} {itemSize}/>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Division -->
    <div class=section class:expanded={section.division} on:click={() => section.division = !section.division}>Division: {cap(menu.division.division)}</div>
    {#if section.division}
      <div class=panel transition:slide>
        <div class=subsection>
          <EditorDivision bind:division={menu.division.division} t1={coa.t1} t={coa.division ? coa.division.t : menu.division.t1} line={menu.division.line} {itemSize}/>
        </div>

        {#if divisions[coa.division?.division]}
          <div class=subsection>
            <EditorLine bind:line={menu.division.line} division={menu.division.division} t1={coa.t1} t={coa.division ? coa.division.t : menu.division.t1} {itemSize}/>
          </div>
        {/if}

        {#if coa.division}
          <div class=subsection>
            <EditorType bind:type={menu.division.type}/>
            {#if menu.division.type !== "tincture"}
              <EditorSize bind:size={menu.division.size}/>
            {/if}
          </div>

          <div class=subsection>
            <EditorTincture bind:t1={menu.division.t1} {itemSize}/>
          </div>

          {#if menu.division.type !== "tincture"}
            <div class=subsection>
              <EditorTincture bind:t1={menu.division.t2} {itemSize}/>
            </div>
          {/if}

          {#if menu.division.type === "pattern"}
            <div class=subsection>
              <EditorPattern bind:pattern={menu.division.pattern} t1={menu.division.t1} t2={menu.division.t2} size={menu.division.size} {itemSize}/>
            </div>
          {/if}

          {#if menu.division.type === "semy"}
            <div class=subsection>
              <EditorCategory name=Charge bind:category={menu.division.semy}/>
              <EditorCharge type=semy bind:charge={menu.division.charge} category={menu.division.semy} t1={menu.division.t1} t2={menu.division.t2} size={menu.division.size} {itemSize}/>
            </div>
          {/if}
        {/if}
      </div>
    {/if}

    <!-- Ordinaries -->
    {#each menu.ordinaries as o, i}
      <div class=section transition:slide class:expanded={section.ordinary[i]} on:click={() => section.ordinary[i] = !section.ordinary[i]}>
        Ordinary{menu.ordinaries.length > 1 ? " " + (i+1) : ""}: {cap(o.ordinary)}
        <EditorControls bind:els={menu.ordinaries} el={o} {i}/>
      </div>
      {#if section.ordinary[i]}
        <div class=panel transition:slide>
          {#if coa.division}
            <div class=subsection>
              <EditorDivided bind:divided={o.divided}/>
            </div>
          {/if}

          <div class=subsection>
            <EditorOrdinary bind:ordinary={o.ordinary} t1={coa.t1} line={o.line} t={o.t} {itemSize}/>
          </div>

          {#if ordinaries.lined[o.ordinary]}
            <div class=subsection>
              <EditorLine bind:line={o.line} ordinary={o.ordinary} t1={coa.t1} t={o.t} {itemSize}/>
            </div>
          {/if}

          {#if o.divided !== "counter"}
            <div class=subsection>
              <EditorTincture bind:t1={o.t} {itemSize}/>
            </div>
          {/if}

          {#if !["bordure", "orle"].includes(o.ordinary)}
            <div class=subsection>
              <EditorStroke bind:element={o}/>
            </div>
          {/if}

          <div class=subsection>
            <EditorShift bind:e={o}/>
          </div>
        </div>
      {/if}
    {/each}

    <!-- Charges -->
    {#each menu.charges as charge, i}
      <div class=section transition:slide class:expanded={section.charge[i]} on:click={() => section.charge[i] = !section.charge[i]}>
        Charge{menu.charges.length > 1 ? " " + (i+1) : ""}: {cap(charge.charge)}
        <EditorControls bind:els={menu.charges} el={charge} {i}/>
      </div>
      {#if section.charge[i]}
        <div class=panel transition:slide>

          <div class=subsection>
            <EditorCategory name=Categories bind:category={charge.type}/>
            {#if coa.division}
              <EditorDivided bind:divided={charge.divided} raster={isRaster(charge.charge)}/>
            {/if}
            <EditorCharge type=charge bind:charge={charge.charge} category={charge.type} t1={coa.t1} t2={charge.t} sinister={charge.sinister} reversed={charge.reversed} {itemSize}/>
          </div>

          {#if !isRaster(charge.charge) && charge.divided !== "counter"}
            <div class=subsection>
              <EditorTincture bind:t1={charge.t} {itemSize}/>
            </div>
          {/if}

          <div class=subsection>
            <EditorStroke bind:element={charge}/>
          </div>

          <div class=subsection>
            <EditorPosition bind:charge/>
          </div>

          <div class=subsection>
            <EditorShift bind:e={charge}/>
          </div>
        </div>
      {/if}
    {/each}

    <div class=buttonLine on:click={addOrdinary}>Add Ordinary</div>
    <div class=buttonLine on:click={addCharge}>Add Charge</div>
  </div>
</div>

<style>
  #editor {
    width: 100%;
    height: calc(100% - 45px);
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    flex-direction: row;
  }

  #menu {
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: thin;
    transition: .5s;
    background-color: #11111180;
    height: 100%;
  }

  @media only screen and (orientation: portrait) {
    #editor {
      flex-direction: column;
    }
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

  .section:after {
    content: "\276F";
    transition: .2s ease-out;
    margin-top: -.1em;
    float: right;
  }

  .expanded:after {
    transform: rotate(90deg);
  }

  :global(.section > span) {
    transition: 1s ease-out;
    opacity: 0;
    margin-left: .6em;
  }

  :global(.section:hover > span) {
    opacity: 1;
  }

  .panel {
    min-width: 100%;
    max-width: max-content;
    background-color: #13131320;
    overflow: hidden;
  }

  .subsection {
    color: #fff;
    padding: .5em 1em;
  }

  .buttonLine {
    padding: 1em 1.14em;
    color: #fff;
    background-color: #00000040;
    cursor: pointer;
    transition: background-color .1s ease;
  }

  .buttonLine:hover {
    background-color: #00000080;
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

  :global(.item.selected) {
    background-color: #ffffff15;
  }
</style>