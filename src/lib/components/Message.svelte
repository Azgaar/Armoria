<script lang="ts">
  // @ts-check
  import {onMount} from "svelte";
  import {fly, fade} from "svelte/transition";
  import {t} from "svelte-i18n";
  import {message} from "$lib/data/stores";

  const {text, type, timeout} = $message;

  onMount(async () => {
    const textOnMount = $message.text;

    setTimeout(() => {
      if ($message?.text === textOnMount) message.clear();
    }, timeout);
  });
</script>

<div class={type} in:fly={{y: 200, duration: 500}} out:fade={{duration: 300}} on:click={() => message.clear()}>
  {$t(text)}
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
