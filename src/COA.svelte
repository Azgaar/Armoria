<script>
  import Ordinary from './Ordinary.svelte';
  import Charge from './Charge.svelte';
  import Grid from './Grid.svelte';
  import Positions from './Positions.svelte';
  import {grad, diaper, shield, colors, border, borderWidth, patterns} from './stores';
  export let coa, i, w, h;

  const {ordinary, division, charges = []} = coa;
  const tDiv = division ? division.t : "";

  const viewBox = {
    no: "0 0 200 200",
    heater: "0 10 200 200",
    oldFrench: "0 10 200 200",
    spanish: "0 10 200 200",
    french: "0 10 200 200",
    swiss: "0 10 200 200",
    wedged: "0 10 200 200",
    italian: "0 0 200 200",
    kite: "0 0 200 200",
    renaissance: "0 0 200 200",
    baroque: "0 10 200 200",
    polish: "0 0 200 200",
    german: "0 0 200 200",
    diamond: "0 0 200 200",
    round: "0 0 200 200",
    vesicaPiscis: "0 0 200 200",
    square: "0 0 200 200",
    flag: "0 0 200 200",
    pennon: "2.5 0 200 200",
    guidon: "2.5 0 200 200",
    banner: "0 10 200 200",
    dovetail: "0 10 200 200",
    gonfalon: "0 10 200 200",
    pennant: "0 0 200 200"
  }

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

<svg id="coa{i}" class="coa" xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox={viewBox[coaShield]} on:click={() => console.log(coa)}>
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
    {#if division && ordinary?.divided}
      {#if ordinary.divided === "counter"}<Ordinary {coa} {shieldPath} colors={coaColors} t={tDiv}/>{/if}
      {#if ordinary.divided === "field"}<Ordinary {coa} {shieldPath} colors={coaColors} t={ordinary.t}/>{/if}
    {/if}
    {#if diaperType === "field"}<rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})" style="pointer-events: none"/>{/if}
    {#if division}
      {#each charges as charge, i}
        {#if charge.layer === "field"}
          <Charge {coa} {charge} {i} shield={coaShield} colors={coaColors} t={charge.t}/>
        {:else if charge.layer === "counter"}
          <Charge {coa} {charge} {i} shield={coaShield} colors={coaColors} t={tDiv}/>
        {/if}
      {/each}
    {/if}

    <!-- division layer -->
    {#if division}
      <g id="division" clip-path="url(#divisionClip{i})">
        <rect x=0 y=0 width=200 height=200 fill="{coaColors[tDiv] || clr(tDiv)}"/>
        {#if ordinary?.divided}
          {#if ordinary.divided === "counter"}<Ordinary {coa} {shieldPath} colors={coaColors} t={coa.t1}/>{/if}
          {#if ordinary.divided === "division"}<Ordinary {coa} {shieldPath} colors={coaColors} t={ordinary.t}/>{/if}
        {/if}
        {#if diaperType === "division"}<rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})" style="pointer-events: none"/>{/if}
        {#if division}
          {#each charges as charge, i}
            {#if charge.layer === "division"}
              <Charge {coa} {charge} {i} shield={coaShield} colors={coaColors} t={charge.t}/>
            {:else if charge.layer === "counter"}
              <Charge {coa} {charge} {i} shield={coaShield} colors={coaColors} t={coa.t1}/>
            {/if}
          {/each}
        {/if}
      </g>
    {/if}

    <!-- overall layer -->
    {#if ordinary && !ordinary.divided}
      <Ordinary {coa} {shieldPath} colors={coaColors} t={ordinary.t}/>
    {/if}
    {#if diaperType === "overall"}<rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{coaDiaper})" style="pointer-events: none"/>{/if}
    {#each charges as charge, i}
      {#if !charge.layer || !division}
        <Charge {coa} {charge} {i} shield={coaShield} colors={coaColors} t={charge.t}/>
      {/if}
    {/each}
  </g>

  {#if i === "Edit"}
    <Grid/>
    <Positions/>
  {/if}

  <path class="grad" d={shieldPath} fill="url(#{coaGrad})" stroke={$border} stroke-width={strokeWidth} style="pointer-events: none"/>
</svg>