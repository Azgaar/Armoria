<script>
  export let divided, raster = null;
</script>

<span>Divided:</span>
<select bind:value={divided}>
  <option value="">No (standard)</option>
  <option value="field">Crop by main field</option>
  <option value="division">Crop by division</option>
  {#if !raster}
    <option value="counter">Сounterchanged</option>
  {/if}
</select>