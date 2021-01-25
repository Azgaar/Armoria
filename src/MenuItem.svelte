<script>
  import Shield from './Shield.svelte';
  import {message} from './stores.js';
  export let coa, tip, itemSize;
  const i = Math.floor(1e6 * Math.random());

  function showMessage() {
    if ($message?.text) return; // concurrent message
    setTimeout(() => $message = {text: cap(tip), type: "tip", timeout: 10000}, 500);
  }

  function hideMessage() {
    $message = null;
  }

  function cap(string) {
    return string
      .replace(/_/g, " ")
      .replace(/(?<!_)(?=[A-Z])/g, " ")
      .replace(/\w\S*/g, s => s.charAt(0).toUpperCase() + s.substr(1).toLowerCase());
  }
</script>

<svg class=menuItem xmlns=http://www.w3.org/2000/svg width={itemSize} height={itemSize} viewBox="0 0 200 200" on:mouseenter={showMessage} on:focus={showMessage} on:mouseleave={hideMessage}>
  <Shield {coa} {i} border=#333 borderWidth=2 type=menuItem/>
</svg>