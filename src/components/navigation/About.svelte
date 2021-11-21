<script>
  import AnimatedCOA from "./AnimatedCOA.svelte";
  import {state} from "data//stores";
  import {fade, fly} from "svelte/transition";

  const duration = 1000;
  const handleClose = () => {
    $state.about = 0;
  };
</script>

<div id="about" transition:fade>
  <span on:click={handleClose} class="close">&times;</span>
  <AnimatedCOA {duration} />
  <div class="buttons" in:fly={{y: 200, delay: duration, duration}}>
    <a target="_blank" href="https://github.com/Azgaar/Armoria/wiki/Armoria-Tutorial"><span translate="no">Tutorial</span></a>
    <a target="_blank" href="https://discord.com/invite/X7E84HU"><span translate="no">Discord</span></a>
    <a target="_blank" href="https://github.com/Azgaar/Armoria"><span translate="no">GitHub</span></a>
    <a target="_blank" href="https://github.com/Azgaar/armoria-api#readme"><span translate="no">API</span></a>
    <a target="_blank" href="https://www.patreon.com/azgaar"><span translate="no">Patreon</span></a>
  </div>
</div>

<style>
  #about {
    position: fixed;
    inset: 0;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.9);
    transition: 0.5s;
    text-align: center;
    user-select: none;

    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
  }

  a:hover,
  span:hover {
    color: #fff;
    text-decoration: none;
  }

  .buttons {
    display: flex;
    justify-content: space-evenly;
    width: min(100%, 80vw);
    font-size: 1.2em;
  }

  .buttons > a {
    margin: 0.5em;
    color: #ddd;
  }

  .buttons > a:hover {
    color: #fff;
    text-decoration: none;
  }

  @media (max-width: 600px) {
    .buttons {
      flex-direction: column;
    }
  }

  span.close {
    position: absolute;
    top: 0;
    right: 1.2rem;
    font-size: 4em;
    cursor: pointer;
    color: #ddd;
  }

  span.close:hover {
    color: #fff;
  }
</style>
