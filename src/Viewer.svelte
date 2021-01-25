<script>
  import COA from './COA.svelte';
  import {history} from './stores';
  import {generate} from './generator';
  export let c, seed, coaSize;
  let coa = $history[c] || generate(seed || undefined); // on load
</script>

<div id=viewer>
  <COA {coa} i=View w={coaSize} h={coaSize}/>
</div>