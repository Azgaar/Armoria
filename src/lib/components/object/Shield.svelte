<script lang="ts">
  // @ts-check
  import Ordinary from "./Ordinary.svelte";
  import Charge from "./Charge.svelte";
  import Inscription from "./Inscription.svelte";
  import {shield, colors, grad, diaper} from "$lib/data/stores";
  import {divisions, shields} from "$lib/data/dataModel";
  import {getTemplate, addPattern, addCharge} from "$lib/scripts/getters";
  import type {Coa} from "$lib/types/coa";

  export let coa: Coa;
  export let border: string;
  export let borderWidth: number;
  export let type: string;

  const id = coa.seed || Math.floor(Math.random() * 1e9);
  const {division, ordinaries = [], charges = [], inscriptions = []} = coa;
  const ordinariesRegular = ordinaries.filter(o => !o.above);
  const ordinariesAboveCharges = ordinaries.filter(o => o.above);
  charges.forEach(({charge}) => addCharge(charge));

  $: shieldPath = shields.data[coa.shield || $shield].path;
  $: coaDiaper = type === "menuItem" ? null : coa.diaper || $diaper;
  $: diaperType = getDiaperType(coaDiaper);
  $: overFill = !$grad || $grad === "no" ? "none" : `url(#${$grad})`;

  // get color or link to pattern
  $: clr = (tincture: string) => {
    if (!tincture) return null;
    if ($colors[tincture]) return $colors[tincture];
    if (tincture.includes("-")) {
      addPattern(tincture);
    } else {
      console.warn(`Tincture ${tincture} not found, fallback to black`);
      return "#000000";
    }
    return "url(#" + tincture + ")";
  };

  function getDiaperType(coaDiaper: string) {
    if (!coaDiaper || coaDiaper === "no") return null;
    const f = !coa.t1.includes("-");
    const d = !division?.t.includes("-");
    if (f && d) return "overall";
    if (f) return "field";
    if (d) return "division";
    return null;
  }
</script>

<defs>
  <clipPath id="shield_{id}">
    <path d={shieldPath} />
  </clipPath>
  {#if division && division.division !== "no"}
    <clipPath id="division_{id}">
      {@html getTemplate(divisions.data[division.division], division.line)}
    </clipPath>
  {/if}

  <style>
    .secondary {
      fill: var(--secondary);
    }
    .tertiary {
      fill: var(--tertiary);
    }
    .pseudostroke {
      fill: var(--stroke);
    }
    .background {
      display: var(--background);
    }
  </style>
</defs>

{#each charges as charge, i}
  {#if charge.outside === "below" || charge.outside === "around"}
    <Charge {coa} {charge} {i} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} {type} />
  {/if}
{/each}

{#each charges as charge, i}
  {#if charge.outside === "below" && charge.layered}
    <Charge {coa} {charge} {i} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} hideBackground={true} {type} />
  {/if}
{/each}

<g clip-path="url(#shield_{id})">
  <!-- Field -->
  <rect class="field" x="0" y="0" width="200" height="200" fill={clr(coa.t1)} />

  {#if division && division.division !== "no"}
    <!-- In field part -->
    {#each ordinariesRegular as ordinary, i}
      {#if ordinary.divided === "field"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} t2={clr(ordinary.t2)} {type} />
      {:else if ordinary.divided === "counter"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(division.t)} {type} />
      {/if}
    {/each}

    {#if diaperType === "field"}
      <rect class="diaper" x="0" y="0" width="200" height="200" fill="url(#{coaDiaper})" style="pointer-events: none" />
    {/if}

    {#each charges as charge, i}
      {#if charge.divided === "field"}
        <Charge {coa} {charge} {i} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} {type} />
      {:else if charge.divided === "counter"}
        <Charge {coa} {charge} {i} t={clr(division.t)} {type} />
      {/if}
    {/each}

    {#each charges as charge, i}
      {#if charge.divided === "field" && charge.layered}
        <Charge {coa} {charge} {i} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} hideBackground={true} {type} />
      {:else if charge.divided === "counter" && charge.layered}
        <Charge {coa} {charge} {i} t={clr(division.t)} {type} hideBackground={true} />
      {/if}
    {/each}

    {#each ordinariesAboveCharges as ordinary, i}
      {#if ordinary.divided === "field"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} t2={clr(ordinary.t2)} {type} />
      {:else if ordinary.divided === "counter"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(division.t)} {type} />
      {/if}
    {/each}

    <!-- In division part -->
    <g class="division" clip-path="url(#division_{id})">
      <rect x="0" y="0" width="200" height="200" fill={clr(division.t)} />

      {#each ordinariesRegular as ordinary, i}
        {#if ordinary.divided === "division"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} t2={clr(ordinary.t2)} {type} />
        {:else if ordinary.divided === "counter"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(coa.t1)} {type} />
        {/if}
      {/each}

      {#if diaperType === "division"}
        <rect
          class="diaper"
          x="0"
          y="0"
          width="200"
          height="200"
          fill="url(#{coaDiaper})"
          style="pointer-events: none"
        />
      {/if}

      {#each charges as charge, i}
        {#if charge.divided === "division"}
          <Charge {coa} {charge} {i} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} {type} />
        {:else if charge.divided === "counter"}
          <Charge {coa} {charge} {i} t={clr(coa.t1)} {type} />
        {/if}
      {/each}

      {#each charges as charge, i}
        {#if charge.divided === "division" && charge.layered}
          <Charge {coa} {charge} {i} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} hideBackground={true} {type} />
        {:else if charge.divided === "counter" && charge.layered}
          <Charge {coa} {charge} {i} t={clr(coa.t1)} hideBackground={true} {type} />
        {/if}
      {/each}

      {#each ordinariesAboveCharges as ordinary, i}
        {#if ordinary.divided === "division"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} t2={clr(ordinary.t2)} {type} />
        {:else if ordinary.divided === "counter"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(coa.t1)} {type} />
        {/if}
      {/each}
    </g>
  {/if}

  <!-- Overall -->
  {#each ordinariesRegular as ordinary, i}
    {#if !ordinary.divided}
      <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} t2={clr(ordinary.t2)} {type} />
    {/if}
  {/each}

  {#if diaperType === "overall"}
    <rect class="diaper" x="0" y="0" width="200" height="200" fill="url(#{coaDiaper})" style="pointer-events: none" />
  {/if}

  {#each charges as charge, i}
    {#if !charge.outside && (!charge.divided || !division)}
      <Charge {coa} {charge} {i} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} {type} />
    {/if}
  {/each}

  {#each charges as charge, i}
    {#if !charge.outside && (!charge.divided || !division) && charge.layered}
      <Charge {coa} {charge} {i} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} hideBackground={true} {type} />
    {/if}
  {/each}

  {#each ordinariesAboveCharges as ordinary, i}
    {#if !ordinary.divided}
      <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} t2={clr(ordinary.t2)} {type} />
    {/if}
  {/each}
</g>

<path
  class="grad"
  d={shieldPath}
  fill={overFill}
  stroke={border}
  stroke-width={borderWidth}
  style="pointer-events: none"
/>

{#each charges as charge, i}
  {#if charge.outside === "above"}
    <Charge {coa} {charge} {i} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} {type} />
  {/if}
{/each}

{#each charges as charge, i}
  {#if charge.outside === "above" && charge.layered || charge.outside === "around"}
    <Charge {coa} {charge} {i} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} hideBackground={true} {type} />
  {/if}
{/each}

{#each inscriptions as inscription, i}
  <Inscription {coa} {inscription} {i} pathId="inscription_{id}_{i}" {type} />
{/each}
