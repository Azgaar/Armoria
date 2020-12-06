<script>
  export let type, updateSection;
</script>

Type:
<select bind:value={type} on:input={updateSection}>
  <option value="tincture">Tincture</option>
  <option value="pattern">Pattern</option>
  <option value="semy">Semy</option>
</select>