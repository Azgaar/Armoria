<script>
  import Ordinary from './Ordinary.svelte';
  import Charge from './Charge.svelte';
  import {charges as chargesData, ordinaries as ordinariesData} from "./../../data/dataModel";
  import {shield, colors, patterns, grad, diaper} from '../../data/stores';
  export let coa, i, border, borderWidth, type;

  const {division, ordinaries = [], charges = []} = coa;
  const ordinariesRegular = ordinaries.filter(o => !o.above);
  const ordinariesAboveCharges = ordinaries.filter(o => o.above);

  let shieldPath, coaDiaper, diaperType;
  $: {
    shieldPath = document.querySelector(`#defs g#shields > #${$shield} > path`).getAttribute("d");
    coaDiaper = type === "menuItem" ? null : coa.diaper || $diaper;
    diaperType = getDieperType();
  }

  function getDieperType() {
    if (!coaDiaper || coaDiaper === "no") return null;
    const f = !coa.t1.includes("-");
    const d = !division?.t.includes("-");
    if (f && d) return "overall";
    if (f) return "field";
    if (d) return "division";
    return null;
  }

  function getTemplate(templateId, lineId) {
    if (!lineId) return document.getElementById(templateId)?.innerHTML;
    const template = document.getElementById(templateId);
    const line = document.getElementById(lineId) ? document.getElementById(lineId) : document.getElementById("straight");
    return template.innerHTML.replace(/{line}/g, line.getAttribute("d")).replace(/dpath/g, "d");
  }

  // if charge doesn't support pattern, return basic tincture
  function counterChange(t, charge) {
    if (!(/-/).test(t)) return clr(t); // not a pattern
    if (chargesData.patternable.includes(charge)) return clr(t); // patternable
    if (ordinariesData.patternable.includes(charge)) return clr(t); // patternable
    return clr(t.split("-")[1]); // not patternable, return basic color
  }

  // get color or link to pattern
  function clr(tincture) {
    if ($colors[tincture]) return $colors[tincture];
    $patterns[$patterns.length] = tincture;
    return "url(#"+tincture+")";
  }
</script>

<defs>
  {#if division && division.division !== "no"}
    <clipPath id="divisionClip{i}">
      {@html getTemplate(division.division, division.line)}
    </clipPath>
  {/if}
</defs>

<g id=shield clip-path="url(#{$shield})">

  <!-- Field -->
  <rect id=field x=0 y=0 width=200 height=200 fill="{clr(coa.t1)}"/>

  {#if division && division.division !== "no"}
    <!-- In field part -->
    {#each ordinariesRegular as ordinary, i}
      {#if ordinary.divided === "field"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type}/>
      {:else if ordinary.divided === "counter"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={counterChange(division.t, ordinary.ordinary)} {type}/>
      {/if}
    {/each}

    {#if diaperType === "field"}
      <rect class=diaper x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})" style="pointer-events: none"/>
    {/if}

    {#each charges as charge, i}
      {#if charge.divided === "field"}
        <Charge {coa} {charge} {i} shield={$shield} t={clr(charge.t)} {type}/>
      {:else if charge.divided === "counter"}
        <Charge {coa} {charge} {i} shield={$shield} t={counterChange(division.t, charge.charge)} {type}/>
      {/if}
    {/each}

    {#each ordinariesAboveCharges as ordinary, i}
      {#if ordinary.divided === "field"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type}/>
      {:else if ordinary.divided === "counter"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={counterChange(division.t, ordinary.ordinary)} {type}/>
      {/if}
    {/each}

    <!-- In division part -->
    <g id=division clip-path="url(#divisionClip{i})">
      <rect x=0 y=0 width=200 height=200 fill="{clr(division.t)}"/>

      {#each ordinariesRegular as ordinary, i}
        {#if ordinary.divided === "division"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type}/>
        {:else if ordinary.divided === "counter"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={counterChange(coa.t1, ordinary.ordinary)} {type}/>
        {/if}
      {/each}

      {#if diaperType === "division"}
        <rect class=diaper x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})" style="pointer-events: none"/>
      {/if}

      {#each charges as charge, i}
        {#if charge.divided === "division"}
          <Charge {coa} {charge} {i} shield={$shield} t={clr(charge.t)} {type}/>
        {:else if charge.divided === "counter"}
          <Charge {coa} {charge} {i} shield={$shield} t={counterChange(coa.t1, charge.charge)} {type}/>
        {/if}
      {/each}

      {#each ordinariesAboveCharges as ordinary, i}
        {#if ordinary.divided === "division"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type}/>
        {:else if ordinary.divided === "counter"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={counterChange(coa.t1, ordinary.ordinary)} {type}/>
        {/if}
      {/each}
    </g>
  {/if}

  <!-- Overall -->
  {#each ordinariesRegular as ordinary, i}
    {#if !ordinary.divided}
      <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type}/>
    {/if}
  {/each}

  {#if diaperType === "overall"}
    <rect class=diaper x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})" style="pointer-events: none"/>
  {/if}

  {#each charges as charge, i}
    {#if !charge.divided || !division}
      <Charge {coa} {charge} {i} shield={$shield} t={clr(charge.t)} {type}/>
    {/if}
  {/each}

  {#each ordinariesAboveCharges as ordinary, i}
    {#if !ordinary.divided}
      <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type}/>
    {/if}
  {/each}
</g>

<path class=grad d={shieldPath} fill="url(#{$grad})" stroke={border} stroke-width={borderWidth} style="pointer-events: none"/>