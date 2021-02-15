<script>
  import Shield from './../object/Shield.svelte';
  import {tooltip} from './../../scripts/tooltip';
  export let coa, tip, itemSize;
  const i = Math.floor(1e6 * Math.random());

  $: title = cap(tip);

  function cap(string) {
    return string
      .replace(/_/g, " ")
      .replace(/(?<!_)(?=[A-Z])/g, " ")
      .replace(/\w\S*/g, s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());
  }
</script>

<svg class=menuItem xmlns=http://www.w3.org/2000/svg width={itemSize} height={itemSize} viewBox="0 0 200 200" {title} use:tooltip>
  <Shield {coa} {i} border=#333 borderWidth=2 type=menuItem/>
</svg>