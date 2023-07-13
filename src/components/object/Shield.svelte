<script lang="ts">
  // @ts-check
  import Ordinary from "./Ordinary.svelte";
  import Charge from "./Charge.svelte";
  import {charges as chargesData, ordinaries as ordinariesData} from "data/dataModel";
  import {shield, colors, grad, diaper} from "data/stores";
  import {shieldPaths} from "data/shields";
  import {getTemplate, addPattern, addCharge} from "scripts/getters";
  import type {Coa} from "types.ts/coa";

  export let coa: Coa;
  export let border: string;
  export let borderWidth: number;
  export let type: "menuItem" | undefined;

  const id = coa.seed || Math.floor(Math.random() * 1e9);
  const {division, ordinaries = [], charges = []} = coa;
  const ordinariesRegular = ordinaries.filter(o => !o.above);
  const ordinariesAboveCharges = ordinaries.filter(o => o.above);
  charges.forEach(({charge}) => addCharge(charge));

  $: shieldPath = shieldPaths[$shield];
  $: coaDiaper = type === "menuItem" ? null : coa.diaper || $diaper;
  $: diaperType = getDieperType(coaDiaper);
  $: overFill = !$grad || $grad === "no" ? "none" : `url(#${$grad})`;

  // get color or link to pattern
  $: clr = (tincture: string) => {
    if (!tincture) return null;
    if ($colors[tincture]) return $colors[tincture];
    addPattern(tincture);
    return "url(#" + tincture + ")";
  };

  function getDieperType(coaDiaper: string) {
    if (!coaDiaper || coaDiaper === "no") return null;
    const f = !coa.t1.includes("-");
    const d = !division?.t.includes("-");
    if (f && d) return "overall";
    if (f) return "field";
    if (d) return "division";
    return null;
  }

  // if charge doesn't support pattern, return basic tincture
  function counterChange(t: string, charge: string) {
    if (!/-/.test(t)) return clr(t); // not a pattern
    if (chargesData.patternable.includes(charge)) return clr(t); // patternable
    if (ordinariesData.patternable.includes(charge)) return clr(t); // patternable
    return clr(t.split("-")[1]); // not patternable, return basic color
  }
</script>

<defs>
  <clipPath id="shield_{id}">
    <path d={shieldPath} />
  </clipPath>
  {#if division && division.division !== "no"}
    <clipPath id="division_{id}">
      {@html getTemplate(division.division, division.line)}
    </clipPath>
  {/if}
</defs>

<g clip-path="url(#shield_{id})">
  <!-- Field -->
  <rect class="field" x="0" y="0" width="200" height="200" fill={clr(coa.t1)} />

  {#if division && division.division !== "no"}
    <!-- In field part -->
    {#each ordinariesRegular as ordinary, i}
      {#if ordinary.divided === "field"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type} />
      {:else if ordinary.divided === "counter"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={counterChange(division.t, ordinary.ordinary)} {type} />
      {/if}
    {/each}

    {#if diaperType === "field"}
      <rect class="diaper" x="0" y="0" width="200" height="200" fill="url(#{coaDiaper})" style="pointer-events: none" />
    {/if}

    {#each charges as charge, i}
      {#if charge.divided === "field"}
        <Charge {coa} {charge} {i} shield={$shield} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} {type} />
      {:else if charge.divided === "counter"}
        <Charge {coa} {charge} {i} shield={$shield} t={counterChange(division.t, charge.charge)} {type} />
      {/if}
    {/each}

    {#each ordinariesAboveCharges as ordinary, i}
      {#if ordinary.divided === "field"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type} />
      {:else if ordinary.divided === "counter"}
        <Ordinary {coa} {ordinary} {i} {shieldPath} t={counterChange(division.t, ordinary.ordinary)} {type} />
      {/if}
    {/each}

    <!-- In division part -->
    <g class="division" clip-path="url(#division_{id})">
      <rect x="0" y="0" width="200" height="200" fill={clr(division.t)} />

      {#each ordinariesRegular as ordinary, i}
        {#if ordinary.divided === "division"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type} />
        {:else if ordinary.divided === "counter"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={counterChange(coa.t1, ordinary.ordinary)} {type} />
        {/if}
      {/each}

      {#if diaperType === "division"}
        <rect class="diaper" x="0" y="0" width="200" height="200" fill="url(#{coaDiaper})" style="pointer-events: none" />
      {/if}

      {#each charges as charge, i}
        {#if charge.divided === "division"}
          <Charge {coa} {charge} {i} shield={$shield} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} {type} />
        {:else if charge.divided === "counter"}
          <Charge {coa} {charge} {i} shield={$shield} t={counterChange(coa.t1, charge.charge)} {type} />
        {/if}
      {/each}

      {#each ordinariesAboveCharges as ordinary, i}
        {#if ordinary.divided === "division"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type} />
        {:else if ordinary.divided === "counter"}
          <Ordinary {coa} {ordinary} {i} {shieldPath} t={counterChange(coa.t1, ordinary.ordinary)} {type} />
        {/if}
      {/each}
    </g>
  {/if}

  <!-- Overall -->
  {#each ordinariesRegular as ordinary, i}
    {#if !ordinary.divided}
      <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type} />
    {/if}
  {/each}

  {#if diaperType === "overall"}
    <rect class="diaper" x="0" y="0" width="200" height="200" fill="url(#{coaDiaper})" style="pointer-events: none" />
  {/if}

  {#each charges as charge, i}
    {#if !charge.divided || !division}
      <Charge {coa} {charge} {i} shield={$shield} t={clr(charge.t)} t2={clr(charge.t2)} t3={clr(charge.t3)} {type} />
    {/if}
  {/each}

  {#each ordinariesAboveCharges as ordinary, i}
    {#if !ordinary.divided}
      <Ordinary {coa} {ordinary} {i} {shieldPath} t={clr(ordinary.t)} {type} />
    {/if}
  {/each}
</g>

<path class="grad" d={shieldPath} fill={overFill} stroke={border} stroke-width={borderWidth} style="pointer-events: none" />
