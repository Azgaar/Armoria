<script>
  export let size;
</script>

<span style="margin-left: 1em">Size:</span>
<select bind:value={size}>
  <option value="bigger">Bigger</option>
  <option value="big">Big</option>
  <option value="standard">Standard</option>
  <option value="small">Small</option>
  <option value="smaller">Smaller</option>
  <option value="smallest">Smallest</option>
</select>