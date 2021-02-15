<script>
  import COA from './../object/COA.svelte';
  import {history} from './../../data/stores';
	import {generate} from './../../scripts/generator';
  export let c, seed, coaSize;
  let coa = $history[c] || generate(seed || undefined); // on load

  function edit() {
    if (/noedit/i.test(window.location.search)) return;
    const URL = window.location.href.replace("view=1", "view=0");
    const win = window.open(URL, "_blank");
    win.focus();
  }
</script>

<div id=viewer on:click={edit}>
  <COA {coa} i=View w={coaSize} h={coaSize}/>
</div>