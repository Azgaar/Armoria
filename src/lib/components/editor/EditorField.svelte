<script lang="ts">
  // @ts-check
  import EditorCharge from "./EditorCharge.svelte";
  import EditorPattern from "./EditorPattern.svelte";
  import EditorSize from "./EditorSize.svelte";
  import EditorTincture from "./EditorTincture.svelte";
  import EditorType from "./EditorType.svelte";

  let {field = $bindable(), shield}: {field: import("#lib/types/editor.js").Field; shield?: string} = $props();

  // Notify the legacy parent when a nested field control changes.
  function update<K extends keyof typeof field>(key: K, value: (typeof field)[K]) {
    field = {...field, [key]: value};
  }
</script>

<div class="subsection">
  <EditorType bind:type={() => field.type, value => update("type", value)} />
  {#if field.type !== "tincture"}
    <EditorSize bind:size={() => field.size, value => update("size", value)} />
  {/if}
</div>

<div class="subsection">
  <EditorTincture bind:t1={() => field.t1, value => update("t1", value)} {shield} />
</div>

{#if field.type !== "tincture"}
  <div class="subsection">
    <EditorTincture bind:t1={() => field.t2, value => update("t2", value)} {shield} />
  </div>
{/if}

{#if field.type === "pattern"}
  <div class="subsection">
    <EditorPattern
      bind:pattern={() => field.pattern, value => update("pattern", value)}
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
      bind:charge={() => field.charge, value => update("charge", value)}
      bind:category={() => field.category, value => update("category", value)}
      t1={field.t1}
      t2={field.t2}
      size={field.size}
      {shield}
    />
  </div>
{/if}
