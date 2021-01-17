<script>
  import {charges} from "../dataModel";
  export let name, category;
  const categories = Object.keys(charges.types);
  const cap = string => string.charAt(0).toUpperCase() + string.slice(1);
</script>

<span>{name}:</span>
<select bind:value={category}>
  {#each categories as type}
    <option value={type}>{cap(type)}</option>
  {/each}
</select>