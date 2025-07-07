<script lang="ts">
  // @ts-check
  import EditorCharge from "./EditorCharge.svelte";
  import EditorPattern from "./EditorPattern.svelte";
  import EditorSize from "./EditorSize.svelte";
  import EditorTincture from "./EditorTincture.svelte";
  import EditorType from "./EditorType.svelte";

  export let field;
  export let shield: string = undefined;
</script>

<div class="subsection">
  <EditorType bind:type={field.type} />
  {#if field.type !== "tincture"}
    <EditorSize bind:size={field.size} />
  {/if}
</div>

<div class="subsection">
  <EditorTincture bind:t1={field.t1} {shield} />
</div>

{#if field.type !== "tincture"}
  <div class="subsection">
    <EditorTincture bind:t1={field.t2} {shield} />
  </div>
{/if}

{#if field.type === "pattern"}
  <div class="subsection">
    <EditorPattern
      bind:pattern={field.pattern}
      t1={field.t1}
      t2={field.t2}
      size={field.size}
      {shield}
    />
  </div>
{/if}

{#if field.type === "semy"}
  <div class="subsection">
    <EditorCharge
      type="semy"
      bind:charge={field.charge}
      bind:category={field.category}
      t1={field.t1}
      t2={field.t2}
      size={field.size}
      {shield}
    />
  </div>
{/if}
