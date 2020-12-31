<script>
  import Shield from './Shield.svelte';
  export let coa, title, itemSize;
  const i = Math.floor(1e6 * Math.random());
</script>

<svg class="menuItem" xmlns="http://www.w3.org/2000/svg" width={itemSize} height={itemSize} viewBox="0 0 200 200">
  <title>{title}</title>
  <Shield {coa} {i} border=#333 borderWidth=2 type=menuItem/>
</svg>