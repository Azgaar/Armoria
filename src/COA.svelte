<script>
  import Ordinary from './Ordinary.svelte';
  import Charge from './Charge.svelte';
  import Positions from './Positions.svelte';
  import {grad, diaper, shield, colors, border, borderWidth, patterns} from './stores';
  export let coa, i, w, h;

  const {ordinary, division, charges = []} = coa;
  const tDiv = division ? division.t : "";

  $: coaShield = coa.shield || $shield;
  $: shieldPath = document.querySelector(`#defs g#shields > #${coaShield} > path`).getAttribute("d");
  $: coaDiaper = coa.diaper || $diaper;
  $: diaperType = coaDiaper ? getDieperType() : null;
  $: strokeWidth = $borderWidth;
  $: coaGrad = coa.grad || $grad;
  $: coaColors = $colors;

  function getDieperType() {
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

<svg id="coa{i}" class="coa" xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 200 200" on:click={() => console.log(coa)}>
  <defs>
    {#if division}
      <clipPath id="divisionClip{i}">
        {@html getTemplate(division.division, division.line)}
      </clipPath>
    {/if}
  </defs>
  <g id="shield" clip-path="url(#{coaShield})">

    <!-- field layer -->
    <rect id="field" x=0 y=0 width=200 height=200 fill="{coaColors[coa.t1] || clr(coa.t1)}"/>
    {#if ordinary?.counter && division}<Ordinary {ordinary} {shieldPath} colors={coaColors} t={tDiv}/>{/if}
    {#if ordinary?.crop}<Ordinary {ordinary} {shieldPath} colors={coaColors} t={ordinary.t}/>{/if}
    {#if diaperType === "field"}<rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})"/>{/if}
    {#each charges as charge, i}
      {#if charge.type === "field"}
        <Charge {charge} {i} shield={coaShield} colors={coaColors} t={charge.t}/>
      {:else if charge.type === "counter" && division}
        <Charge {charge} {i} shield={coaShield} colors={coaColors} t={tDiv}/>
      {/if}
    {/each}

    <!-- division layer -->
    {#if division}
      <g id="division" clip-path="url(#divisionClip{i})">
        <rect x=0 y=0 width=200 height=200 fill="{coaColors[tDiv] || clr(tDiv)}"/>
        {#if ordinary?.counter}<Ordinary {ordinary} {shieldPath} colors={coaColors} t={coa.t1}/>{/if}
        {#if diaperType === "division"}<rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})"/>{/if}
        {#each charges as charge, i}
          {#if charge.type === "division"}
            <Charge {charge} {i} shield={coaShield} colors={coaColors} t={charge.t}/>
          {:else if charge.type === "counter"}
            <Charge {charge} {i} shield={coaShield} colors={coaColors} t={coa.t1}/>
          {/if}
        {/each}
      </g>
    {/if}

    <!-- overall layer -->
    {#if ordinary && !ordinary.crop && !ordinary.counter}<Ordinary {ordinary} {shieldPath} colors={coaColors} t={ordinary.t}/>{/if}
    {#if diaperType === "overall"}<rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})"/>{/if}
    {#each charges as charge, i}{#if !charge.type}<Charge {charge} {i} shield={coaShield} colors={coaColors} t={charge.t}/>{/if}{/each}
  </g>

  {#if i === "Edit"}<Positions/>{/if}

  <path class="grad" d={shieldPath} fill="url(#{coaGrad})" stroke={$border} stroke-width={strokeWidth}/>
</svg>

<style>
	.grad, .diaper {
		pointer-events: none;
	}

  /* svg {
    outline: 1px solid #000;
  } */
</style>