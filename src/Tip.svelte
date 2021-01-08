<script>
  import {message} from './stores.js';
  export let tip, gesture = null, hotkey = null;
  const touch = 'ontouchstart' in window;
  const hasSlot = $$props.$$slots;

  function showMessage() {
    if ($message?.text) return; // concurrent message

    // add Gesture or Hotkey postfix
    let text = tip;
    if (gesture && touch) text += ". Gesture: " + gesture;
    else if (hotkey && !touch) text += ". Hotkey: " + hotkey;

    setTimeout(() => $message = {text, type: "tip", timeout: 10000}, 500);
  }

  function hideMessage() {
    $message = null;
  }
</script>

<span class=tip on:mouseenter={showMessage} on:focus={showMessage} on:mouseleave={hideMessage}>
  {#if hasSlot}
    <slot/>
  {:else}
    <svg>
      <use href="#info-icon"></use>
    </svg>
  {/if}
</span>

<style>
  .tip {
    cursor: help;
  }

  svg {
    width: 1em;
    height: 1em;
    fill: #eee;
    position: absolute;
    right: .6em;
  }

  svg:hover {
    fill: #fff;
  }
</style>