<script>
  import {t} from "svelte-i18n";
  import {fade, fly, slide} from "svelte/transition";
  import {changes, grid, history, message, shield, showGrid, state, tinctures, iconedNav} from "data/stores";
  import {charges, divisions, ordinaries} from "data/dataModel";
  import {generate} from "scripts/generator";
  import {capitalize, minmax, ra, rw} from "scripts/utils";
  import COA from "./../object/COA.svelte";
  import EditorAbove from "./EditorAbove.svelte";
  import EditorCharge from "./EditorCharge.svelte";
  import EditorControls from "./EditorControls.svelte";
  import EditorDivided from "./EditorDivided.svelte";
  import EditorDivision from "./EditorDivision.svelte";
  import EditorLine from "./EditorLine.svelte";
  import EditorOrdinary from "./EditorOrdinary.svelte";
  import EditorPattern from "./EditorPattern.svelte";
  import EditorPosition from "./EditorPosition.svelte";
  import EditorShift from "./EditorShift.svelte";
  import EditorSize from "./EditorSize.svelte";
  import EditorStroke from "./EditorStroke.svelte";
  import EditorTincture from "./EditorTincture.svelte";
  import EditorType from "./EditorType.svelte";
  export let historyId, seed;

  let menu = {};
  let section = {field: 0, division: 0, ordinary: [], charge: []};

  const {innerWidth: width, innerHeight: height} = window;
  const isLandscape = innerWidth > innerHeight;
  const rawSize = width < 600 ? width / 10 - 5 : width / 5 - 10;
  const itemSize = minmax(rawSize, 50, 100);

  $state.transform = null;
  $state.positions = null;

  let coa = $history[historyId] || generate(seed || undefined); // on load
  $: restore($changes); // on undo/redo
  $: reroll(historyId); // on reroll
  $: update(menu); // on menu update
  $: edit(coa); // on edit
  $: localStorage.setItem("grid", $grid); // on grid change
  $: localStorage.setItem("showGrid", $showGrid); // on grid change

  function reroll(historyId) {
    coa = $history[historyId] || generate(seed || undefined);
    if (!$history[historyId]) $history.push(coa);
    changes.reset();
    defineMenuState();
  }

  function edit(coa) {
    if (!coa.shield) coa.shield = $shield;
    changes.add(JSON.stringify(coa));
  }

  // get coa from menu on menu change
  function update() {
    // remove see reference as it would be confusing
    delete coa.seed;

    // field attributes changed
    if (menu.field.type === "tincture") coa.t1 = menu.field.t1;
    else {
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
        if (o.x || o.y) {
          item.x = o.x;
          item.y = o.y;
        }
        if (o.angle) item.angle = o.angle;
        if (o.above) item.above = 1;
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
        if (c.x || c.y) {
          item.x = c.x;
          item.y = c.y;
        }
        if (c.angle) item.angle = c.angle;
        return item;
      });
    } else delete coa.charges;
  }

  function restore() {
    if (!changes.length()) return;
    coa = JSON.parse($changes[0]);
    defineMenuState();
  }

  // define initial menu state
  function defineMenuState() {
    // Shield
    if (coa.shield) $shield = coa.shield;

    // Field
    menu.field = getField();
    function getField() {
      const type = isSemy(coa.t1) ? "semy" : isPattern(coa.t1) ? "pattern" : "tincture";
      let t1,
        t2,
        pattern = "vair",
        charge = "lozenge",
        semy = "conventional",
        size = "standard";

      const field = coa.t1.split("-"); // parsed field tincture

      if (type === "tincture") {
        t1 = coa.t1;
        t2 = selectSecondTincture(coa.t1);
      } else {
        t1 = field[1];
        t2 = field[2];
        size = field[3] || "standard";
      }

      if (type === "pattern") pattern = field[0];
      else if (type === "semy") {
        charge = getSemyCharge(field);
        semy = getSemyType(field);
      }

      return {type, t1, t2, pattern, charge, semy, size};
    }

    // Division
    menu.division = getDivision();
    function getDivision() {
      let type = "tincture",
        division = "no",
        line = "straight",
        t1,
        t2,
        pattern = "vair",
        charge = "lozenge",
        semy = "conventional",
        size = "standard";

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
        const above = o.above || 0;
        if (angle) $state.transform = `rotate(${angle})`;
        return {ordinary, t, line, showStroke, stroke, strokeWidth, size, x, y, angle, divided, above};
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
      return string?.slice(0, 4) === "semy";
    }

    function getSemyCharge(array) {
      return array[0].split("_of_")[1];
    }

    function getChargeCategory(charge) {
      const type = Object.keys(charges.types).find(type => charges[type][charge] !== undefined);
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

  if (!("ontouchstart" in window) && (coa.ordinaries || coa.charges)) {
    if (!$message) message.info($t("info.tipEditControls"));
  }

  function isRaster(charge) {
    const el = document.getElementById(charge);
    return el ? el.tagName === "image" : false;
  }
</script>

<main out:fade>
  <div in:fly={{x: isLandscape ? 0 : 1000, y: isLandscape ? 1000 : 0, duration: 800}}>
    {#key coa}
      <COA {coa} i="Edit" />
    {/key}
  </div>
  <div id="menu" in:fly={{x: isLandscape ? 1000 : 0, y: isLandscape ? 0 : 1000, duration: 1000}}>
    <!-- Field -->
    <div class="section" class:expanded={section.field} on:click={() => (section.field = !section.field)}>{$t("tinctures.field")}</div>
    {#if section.field}
      <div class="panel" transition:slide>
        <div class="subsection">
          <EditorType bind:type={menu.field.type} />
          {#if menu.field.type !== "tincture"}
            <EditorSize bind:size={menu.field.size} />
          {/if}
        </div>

        <div class="subsection">
          <EditorTincture bind:t1={menu.field.t1} {itemSize} />
        </div>

        {#if menu.field.type !== "tincture"}
          <div class="subsection">
            <EditorTincture bind:t1={menu.field.t2} {itemSize} />
          </div>
        {/if}

        {#if menu.field.type === "pattern"}
          <div class="subsection">
            <EditorPattern bind:pattern={menu.field.pattern} t1={menu.field.t1} t2={menu.field.t2} size={menu.field.size} {itemSize} />
          </div>
        {/if}

        {#if menu.field.type === "semy"}
          <div class="subsection">
            <EditorCharge
              type="semy"
              bind:charge={menu.field.charge}
              bind:category={menu.field.semy}
              t1={menu.field.t1}
              t2={menu.field.t2}
              size={menu.field.size}
              {itemSize}
            />
          </div>
        {/if}
      </div>
    {/if}

    <!-- Division -->
    <div class="section" class:expanded={section.division} on:click={() => (section.division = !section.division)}>
      {$t("tinctures.division")}: {capitalize(menu.division.division)}
    </div>
    {#if section.division}
      <div class="panel" transition:slide>
        <div class="subsection">
          <EditorDivision
            bind:division={menu.division.division}
            t1={coa.t1}
            t={coa.division ? coa.division.t : menu.division.t1}
            line={menu.division.line}
            {itemSize}
          />
        </div>

        {#if divisions[coa.division?.division]}
          <div class="subsection">
            <EditorLine
              bind:line={menu.division.line}
              division={menu.division.division}
              t1={coa.t1}
              t={coa.division ? coa.division.t : menu.division.t1}
              {itemSize}
            />
          </div>
        {/if}

        {#if coa.division}
          <div class="subsection">
            <EditorType bind:type={menu.division.type} />
            {#if menu.division.type !== "tincture"}
              <EditorSize bind:size={menu.division.size} />
            {/if}
          </div>

          <div class="subsection">
            <EditorTincture bind:t1={menu.division.t1} {itemSize} />
          </div>

          {#if menu.division.type !== "tincture"}
            <div class="subsection">
              <EditorTincture bind:t1={menu.division.t2} {itemSize} />
            </div>
          {/if}

          {#if menu.division.type === "pattern"}
            <div class="subsection">
              <EditorPattern bind:pattern={menu.division.pattern} t1={menu.division.t1} t2={menu.division.t2} size={menu.division.size} {itemSize} />
            </div>
          {/if}

          {#if menu.division.type === "semy"}
            <div class="subsection">
              <EditorCharge
                type="semy"
                bind:charge={menu.division.charge}
                bind:category={menu.division.semy}
                t1={menu.division.t1}
                t2={menu.division.t2}
                size={menu.division.size}
                {itemSize}
              />
            </div>
          {/if}
        {/if}
      </div>
    {/if}

    <!-- Ordinaries -->
    {#each menu.ordinaries as o, i}
      <div class="section" transition:slide class:expanded={section.ordinary[i]} on:click={() => (section.ordinary[i] = !section.ordinary[i])}>
        {$t("editor.ordinary")}{menu.ordinaries.length > 1 ? ` ${i + 1}` : ""}: {capitalize(o.ordinary)}
        {#if o.above}
          <i>[above charges]</i>
        {/if}
        <EditorControls bind:els={menu.ordinaries} el={o} {i} />
      </div>
      {#if section.ordinary[i]}
        <div class="panel" transition:slide>
          {#if coa.division}
            <div class="subsection">
              <EditorDivided bind:divided={o.divided} />
            </div>
          {/if}

          <div class="subsection">
            <EditorOrdinary bind:ordinary={o.ordinary} t1={coa.t1} line={o.line} t={o.t} {itemSize} />
          </div>

          {#if ordinaries.lined[o.ordinary]}
            <div class="subsection">
              <EditorLine bind:line={o.line} ordinary={o.ordinary} t1={coa.t1} t={o.t} {itemSize} />
            </div>
          {/if}

          {#if o.divided !== "counter"}
            <div class="subsection">
              <EditorTincture bind:t1={o.t} {itemSize} />
            </div>
          {/if}

          <div class="subsection">
            {#if !["bordure", "orle"].includes(o.ordinary)}
              <EditorStroke bind:element={o} />
            {/if}
            <EditorAbove bind:above={o.above} />
          </div>

          <div class="subsection">
            <EditorShift bind:e={o} />
          </div>
        </div>
      {/if}
    {/each}

    <!-- Charges -->
    {#each menu.charges as charge, i}
      <div class="section" transition:slide class:expanded={section.charge[i]} on:click={() => (section.charge[i] = !section.charge[i])}>
        {$t("tinctures.charge")}{menu.charges.length > 1 ? ` ${i + 1}` : ""}: {capitalize(charge.charge)}
        <EditorControls bind:els={menu.charges} el={charge} {i} />
      </div>
      {#if section.charge[i]}
        <div class="panel" transition:slide>
          <div class="subsection">
            {#if coa.division}
              <EditorDivided bind:divided={charge.divided} raster={isRaster(charge.charge)} />
            {/if}
            <EditorCharge
              type="charge"
              bind:charge={charge.charge}
              bind:category={charge.type}
              t1={coa.t1}
              t2={charge.t}
              sinister={charge.sinister}
              reversed={charge.reversed}
              division={coa.division}
              {itemSize}
            />
          </div>

          {#if !isRaster(charge.charge) && charge.divided !== "counter"}
            <div class="subsection">
              <EditorTincture bind:t1={charge.t} {itemSize} />
            </div>
          {/if}

          <div class="subsection">
            <EditorStroke bind:element={charge} />
          </div>

          <div class="subsection">
            <EditorPosition bind:charge />
          </div>

          <div class="subsection">
            <EditorShift bind:e={charge} />
          </div>
        </div>
      {/if}
    {/each}

    <div class="buttonLine" on:click={addOrdinary}>{$t("editor.addOrdinary")}</div>
    <div class="buttonLine" on:click={addCharge}>{$t("editor.addCharge")}</div>
  </div>
</main>

<style>
  main {
    width: 100%;
    height: calc(100% - 45px);
    display: grid;
    justify-items: center;
    grid-template-columns: auto minmax(40%, 60%);
  }

  @media only screen and (orientation: portrait) {
    main {
      grid-template-columns: none;
      grid-template-rows: minmax(25%, 1fr) auto;
    }
  }

  #menu {
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: thin;
    transition: 1s;
    background-color: #11111180;
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
    transition: background-color 0.1s ease;
    overflow-x: hidden;
  }

  .section:hover {
    background-color: #00000080;
  }

  .section:after {
    content: "\276F";
    transition: 0.2s ease-out;
    margin-top: -0.1em;
    float: right;
  }

  .expanded:after {
    transform: rotate(90deg);
  }

  :global(.section > span) {
    transition: 1s ease-out;
    opacity: 0;
    margin-left: 0.6em;
  }

  :global(.section:hover > span) {
    opacity: 1;
  }

  .section > i {
    font-size: smaller;
  }

  .panel {
    min-width: 100%;
    max-width: max-content;
    background-color: #13131320;
    overflow: hidden;
  }

  .subsection {
    color: #fff;
    padding: 0.5em 1em;
  }

  .buttonLine {
    padding: 1em 1.14em;
    color: #fff;
    background-color: #00000040;
    cursor: pointer;
    transition: background-color 0.1s ease;
  }

  .buttonLine:hover {
    background-color: #00000080;
  }

  :global(.item) {
    display: inline-block;
    cursor: pointer;
    transition: background-color 0.2s ease;
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
