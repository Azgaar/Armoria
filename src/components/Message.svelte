<script>
  import {onMount} from "svelte";
  import {fly, fade} from "svelte/transition";
  import {message} from "data/stores";

  const {text, type = "info", timeout = 4000} = $message;

  onMount(async () => {
    const text = $message.text;
    setTimeout(() => {
      if ($message?.text === text) $message = null;
    }, timeout);
  });

  function hideMessage() {
    $message = null;
  }
</script>

<div class={type} in:fly={{y: 200, duration: 500}} out:fade={{duration: 300}} on:click={hideMessage}>
  {text}
</div>

<style>
  div {
    position: absolute;
    bottom: 0%;
    left: 50%;
    line-height: 1.4em;
    padding: 0.8em;
    transform: translate(-50%, -50%);
    z-index: 99;
    max-width: 80%;
    width: max-content;
    user-select: none;
    background-color: #00000095;
  }

  .error {
    color: #e90000;
  }

  .warn {
    color: #dd7200;
  }

  .info {
    color: #fff;
  }

  .tip {
    color: #fff;
    border-radius: 10px;
  }

  .success {
    color: #0fc63a;
  }
</style>
