<script>
  import AnimatedCOA from './AnimatedCOA.svelte';
  import {state} from './../../data/stores';
  import {fade, fly} from 'svelte/transition';
  const duration = 1000;
</script>

<div id="about" transition:fade>
  <span on:click={() => $state.about = 0} class="close">&times;</span>
  <div id="aboutCont">
    <AnimatedCOA {duration}/>
    <div class=buttons in:fly="{{y:200, delay: duration, duration}}">
      <a target=_blank href=https://discord.com/invite/X7E84HU><span translate="no">Discord</span></a>
      <a target=_blank href=https://github.com/Azgaar/Armoria><span translate="no">GitHub</span></a>
      <a target=_blank href=https://github.com/Azgaar/armoria-api#readme><span translate="no">API</span></a>
      <a target=_blank href=https://www.patreon.com/azgaar><span translate="no">Patreon</span></a>
    </div>
  </div>
</div>

<style>
  #about {
    height: 100%;
    width: 100%;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    background-color: rgba(0,0,0, 0.9);
    transition: .5s;
    text-align: center;
    user-select: none;
  }

  #aboutCont {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  a, span {
    display: inline-block;
    cursor: pointer;
    color: #ddd;
  }

  a:hover, span:hover {
    color: #fff;
  }

  .buttons > a {
    margin: 2em;
    font-size: 1.2em;
  }

  span.close {
    position: fixed;
    top: 0em;
    right: .5em;
    font-size: 4em;
    padding: .2em 0;
    z-index: 2;
  }
</style>