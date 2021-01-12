<script>
  import Ordinary from './Ordinary.svelte';
  import Charge from './Charge.svelte';
  import {shield, colors, patterns, grad, diaper} from './stores';
  export let coa, i, border, borderWidth, type;

  const {division, ordinaries = [], charges = []} = coa;
  const tDiv = division ? division.t : "";

  let coaColors, coaGrad, coaShield, shieldPath, coaDiaper, diaperType;
  $: {
    coaColors = $colors;
    coaGrad = coa.grad || $grad;
    coaShield = coa.shield || $shield;
    shieldPath = document.querySelector(`#defs g#shields > #${coaShield} > path`).getAttribute("d");
    coaDiaper = type === "menuItem" ? null : coa.diaper || $diaper;
    diaperType = getDieperType();
  }

  function getDieperType() {
    if (!coaDiaper || coaDiaper === "no") return null;
    const f = !coa.t1.includes("-");
    const d = !tDiv.includes("-");
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

  // get color or link to pattern
  function clr(tincture) {
    if (coaColors[tincture]) return coaColors[tincture];
    if (!tincture) debugger;
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

<g id="shield" clip-path="url(#{coaShield})">

  <!-- Field -->
  <rect id="field" x=0 y=0 width=200 height=200 fill="{coaColors[coa.t1] || clr(coa.t1)}"/>

  {#if division && division.division !== "no"}
    <!-- In field part -->
    {#each ordinaries as ordinary, i}
      {#if ordinary.divided === "field"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} colors={coaColors} t={ordinary.t} {type}/>
      {:else if ordinary.divided === "counter"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} colors={coaColors} t={tDiv} {type}/>
      {/if}
    {/each}

    {#if diaperType === "field"}
      <rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})" style="pointer-events: none"/>
    {/if}

    {#each charges as charge, i}
      {#if charge.layer === "field"}
        <Charge {coa} {charge} {i} shield={coaShield} colors={coaColors} t={charge.t} {type}/>
      {:else if charge.layer === "counter"}
        <Charge {coa} {charge} {i} shield={coaShield} colors={coaColors} t={tDiv} {type}/>
      {/if}
    {/each}

    <!-- In division part -->
    <g id="division" clip-path="url(#divisionClip{i})">
      <rect x=0 y=0 width=200 height=200 fill="{coaColors[tDiv] || clr(tDiv)}"/>

      {#each ordinaries as ordinary, i}
        {#if ordinary.divided === "division"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} colors={coaColors} t={ordinary.t} {type}/>
        {:else if ordinary.divided === "counter"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} colors={coaColors} t={coa.t1} {type}/>
        {/if}
      {/each}

      {#if diaperType === "division"}
        <rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})" style="pointer-events: none"/>
      {/if}

      {#each charges as charge, i}
        {#if charge.layer === "division"}
          <Charge {coa} {charge} {i} shield={coaShield} colors={coaColors} t={charge.t} {type}/>
        {:else if charge.layer === "counter"}
          <Charge {coa} {charge} {i} shield={coaShield} colors={coaColors} t={coa.t1} {type}/>
        {/if}
      {/each}
    </g>
  {/if}

  <!-- Overall -->
  {#each ordinaries as ordinary, i}
    {#if !ordinary.divided}
      <Ordinary {coa} {ordinary} {i} {shieldPath} colors={coaColors} t={ordinary.t} {type}/>
    {/if}
  {/each}

  {#if diaperType === "overall"}
    <rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})" style="pointer-events: none"/>
  {/if}

  {#each charges as charge, i}
    {#if !charge.layer || !division}
      <Charge {coa} {charge} {i} shield={coaShield} colors={coaColors} t={charge.t} {type}/>
    {/if}
  {/each}
</g>

<path class="grad" d={shieldPath} fill="url(#{coaGrad})" stroke={border} stroke-width={borderWidth} style="pointer-events: none"/>