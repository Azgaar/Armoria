<script>
  import Ordinary from './Ordinary.svelte';
  import Charge from './Charge.svelte';
  import {shield, colors, patterns} from './stores';
  export let coa, title, itemSize;

  const {ordinary, division, charges = []} = coa;

  $: coaShield = coa.shield || $shield;
  $: shieldPath = document.querySelector(`#defs g#shields > #${coaShield} > path`).getAttribute("d");
  $: coaColors = $colors;

  function getDieperType() {
    const f = !coa.t1.includes("-");
    const d = !coa.t3 || !coa.t3.includes("-");
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
    $patterns[$patterns.length] = tincture;
    return "url(#"+tincture+")";
  }
</script>

<svg class="menuItem" xmlns="http://www.w3.org/2000/svg" width={itemSize} height={itemSize} viewBox="0 0 200 200">
  <title>{title}</title>
  <defs>
    {#if division}
      <clipPath id="divisionClip">
        {@html getTemplate(division, coa.line)}
      </clipPath>
    {/if}
  </defs>
  <g id="shield" clip-path="url(#{coaShield})">

    <!-- field layer -->
    <rect id="field" x=0 y=0 width=200 height=200 fill="{coaColors[coa.t1] || clr(coa.t1)}"/>
    {#if ordinary?.counter}<Ordinary {ordinary} {shieldPath} colors={coaColors} t={coa.t3}/>{/if}
    {#if ordinary?.crop}<Ordinary {ordinary} {shieldPath} colors={coaColors} t={coa.t2}/>{/if}
    {#each charges as charge, i}
      {#if charge.type === "field"}
        <Charge {charge} {i} shield={coaShield} colors={coaColors} t={charge.t}/>
      {:else if charge.type === "counter"}
        <Charge {charge} {i} shield={coaShield} colors={coaColors} t={coa.t3}/>
      {/if}
    {/each}

    <!-- division layer -->
    {#if division}
      <g id="division" clip-path="url(#divisionClip)">
        <rect x=0 y=0 width=200 height=200 fill="{coaColors[coa.t3] || clr(coa.t3)}"/>
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
    {#if ordinary && !ordinary.crop && !ordinary.counter}<Ordinary {ordinary} {shieldPath} colors={coaColors} t={coa.t2}/>{/if}
    {#each charges as charge, i}{#if !charge.type}<Charge {charge} {i} shield={coaShield} colors={coaColors} t={charge.t}/>{/if}{/each}
  </g>

  <path d={shieldPath} fill="url(#spotlight)" stroke="#333"/>
</svg>