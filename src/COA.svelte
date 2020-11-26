<script>
  import Ordinary from './Ordinary.svelte';
  import Charge from './Charge.svelte';
  export let edit, c, i, w, h, grad, diaper, shield, colors, border, borderWidth;

  const coa = Armoria.history[c] || Armoria.getCOA();
  const {ordinary, division, charges = []} = coa;
  $: shieldPath = document.querySelector("#defs g#shields > #"+shield+" > path").getAttribute("d");
  $: console.log("coa rendering:", i, " - ", c);

  $: strokeWidth = borderWidth * (edit.on ? 1 : 2);

  const diaperType = diaper ? getDieperType() : null;
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
    if (colors[tincture]) return colors[tincture];
    patterns[patterns.length] = tincture;
    return "url(#"+tincture+")";
  }
</script>

<svg id="coa{i}" class="coa" xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox="0 0 200 200" on:click={() => console.log(coa)}>
  <defs>
    {#if division}
      <clipPath id="divisionClip{i}">
        {@html getTemplate(division, coa.line)}
      </clipPath>
    {/if}
  </defs>
  <g id="shield" clip-path="url(#{shield})">

    <!-- field layer -->
    <rect id="field" x=0 y=0 width=200 height=200 fill="{colors[coa.t1] || clr(coa.t1)}"/>
    {#if ordinary?.counter}<Ordinary {ordinary} {shieldPath} {colors} t={coa.t3} {edit}/>{/if}
    {#if ordinary?.crop}<Ordinary {ordinary} {shieldPath} {colors} t={coa.t2} {edit}/>{/if}
    {#if diaperType === "field"}<rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{diaper})"/>{/if}
    {#each charges as charge, i}
      {#if charge.type === "field"}
        <Charge {charge} {i} {shield} {colors} t={charge.t} {edit}/>
      {:else if charge.type === "counter"}
        <Charge {charge} {i} {shield} {colors} t={coa.t3} {edit}/>
      {/if}
    {/each}

    <!-- division layer -->
    {#if division}
      <g id="division" clip-path="url(#divisionClip{i})">
        <rect x=0 y=0 width=200 height=200 fill="{colors[coa.t3] || clr(coa.t3)}"/>
        {#if ordinary?.counter}<Ordinary {ordinary} {shieldPath} {colors} t={coa.t1} {edit}/>{/if}
        {#if diaperType === "division"}<rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{diaper})"/>{/if}
        {#each charges as charge, i}
          {#if charge.type === "division"}
            <Charge {charge} {i} {shield} {colors} t={charge.t} {edit}/>
          {:else if charge.type === "counter"}
            <Charge {charge} {i} {shield} {colors} t={coa.t1} {edit}/>
          {/if}
        {/each}
      </g>
    {/if}

    <!-- overall layer -->
    {#if ordinary && !ordinary.crop && !ordinary.counter}<Ordinary {ordinary} {shieldPath} {colors} t={coa.t2} {edit}/>{/if}
    {#if diaperType === "overall"}<rect class="diaper" x=0 y=0 width=200 height=200 fill="url(#{diaper})"/>{/if}
    {#each charges as charge, i}{#if !charge.type}<Charge {charge} {i} {shield} {colors} t={charge.t} {edit}/>{/if}{/each}
  </g>

  <path class="grad" d={shieldPath} fill="url(#{grad})" stroke={border} stroke-width={strokeWidth}/>
</svg>

<style>
	.grad, .diaper {
		pointer-events: none;
	}

  /* svg {
    outline: 1px solid #000;
  } */
</style>