<script>
  import Ordinary from './Ordinary.svelte';
  import Charge from './Charge.svelte';
  import {shield, colors, patterns} from './stores';
  export let coa, title, itemSize;

  let {ordinary, division, charges = []} = coa;
  if (ordinary?.ordinary === "no") ordinary = null;
  let tDiv = division ? division.t : "";
  let i = Math.floor(1e6 * Math.random());

  $: coaShield = coa.shield || $shield;
  $: shieldPath = document.querySelector(`#defs g#shields > #${coaShield} > path`).getAttribute("d");
  $: coaColors = $colors;

  function getTemplate(templateId, lineId) {
    if (!lineId) return document.getElementById(templateId)?.innerHTML;
    const template = document.getElementById(templateId);
    const line = document.getElementById(lineId) ? document.getElementById(lineId) : document.getElementById("straight");
    return template.innerHTML.replace(/{line}/g, line.getAttribute("d")).replace(/dpath/g, "d");
  }

  // get color or link to pattern
  function clr(tincture) {
    if (coaColors[tincture]) return coaColors[tincture];
    $patterns[$patterns.length] = tincture;
    return "url(#"+tincture+")";
  }
</script>

<svg class="menuItem" xmlns="http://www.w3.org/2000/svg" width={itemSize} height={itemSize} viewBox="0 0 200 200">
  <title>{title}</title>
  <defs>
    {#if division && division.division !== "no"}
      <clipPath id="divisionClipMenu{i}">
        {@html getTemplate(division.division, division.line)}
      </clipPath>
    {/if}
  </defs>
  <g id="shield" clip-path="url(#{coaShield})">

    <!-- field layer -->
    <rect id="field" x=0 y=0 width=200 height=200 fill="{coaColors[coa.t1] || clr(coa.t1)}"/>
    {#if ordinary?.counter && division}<Ordinary {ordinary} {shieldPath} colors={coaColors} t={tDiv}/>{/if}
    {#if ordinary?.crop}<Ordinary {ordinary} {shieldPath} colors={coaColors} t={ordinary.t}/>{/if}
    {#each charges as charge, i}
      {#if charge.type === "field"}
        <Charge {charge} {i} shield={coaShield} colors={coaColors} t={charge.t}/>
      {:else if charge.type === "counter" && division}
        <Charge {charge} {i} shield={coaShield} colors={coaColors} t={tDiv}/>
      {/if}
    {/each}

    <!-- division layer -->
    {#if division && division.division !== "no"}
      <g id="division" clip-path="url(#divisionClipMenu{i})">
        <rect x=0 y=0 width=200 height=200 fill="{coaColors[tDiv] || clr(tDiv)}"/>
        {#if ordinary?.counter}<Ordinary {ordinary} {shieldPath} colors={coaColors} t={coa.t1}/>{/if}
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
    {#each charges as charge, i}{#if !charge.type}<Charge {charge} {i} shield={coaShield} colors={coaColors} t={charge.t}/>{/if}{/each}
  </g>

  <path d={shieldPath} fill="url(#spotlight)" stroke="#333" stroke-width="2"/>
</svg>