<script>
  import {onMount} from 'svelte';
  import {fade, fly} from 'svelte/transition';
  let show = true;

  onMount(async () => {
    setTimeout(() => show = false, 8000);
	});
</script>

{#if show}
  <div in:fly={{y:100, delay: 2000, duration: 1500}} out:fade>
    Drag to move, hold SHIFT and drag vertically to resize, hold CONTROL and drag horizontally to rotate
  </div>
{/if}

<style>
  div {
    position: absolute;
    bottom: 2%;
    line-height: 1.4em;
    padding: .8em;
    color: #fff;
    background-color: #00000060;
    text-align: center;
  }
</style>