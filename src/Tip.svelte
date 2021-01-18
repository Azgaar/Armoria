<script>
  import {message} from './stores.js';
  export let tip, gesture = null, hotkey = null, position = "right", helpCursor = true;
  let text = tip;
  const touch = 'ontouchstart' in window;
  const hasSlot = $$props.$$slots;

  function showMessage() {
    // add Gesture or Hotkey postfix
    if (gesture && touch) text = tip + ". Gesture: " + gesture;
    else if (hotkey && !touch) text = tip + ". Hotkey: " + hotkey;

    setTimeout(() => {
      $message = {text, type: "tip", timeout: 10000};
    }, 500);
  }

  function hideMessage() {
    setTimeout(() => {
      if ($message?.text === text) $message = null;
    }, 500);
  }
</script>

<span class:helpCursor on:mouseenter={showMessage} on:focus={showMessage} on:mouseleave={hideMessage}>
  {#if hasSlot}
    <slot/>
  {:else}
    <svg class={position}>
      <use href="#info-icon"></use>
    </svg>
  {/if}
</span>

<style>
  .helpCursor {
    cursor: help;
  }

  svg {
    width: 1em;
    height: 1em;
    fill: #eee;
  }

  svg.left {
    margin-bottom: -2px;
  }

  svg.right {
    position: absolute;
    right: .6em;
  }

  svg:hover {
    fill: #fff;
  }
</style>