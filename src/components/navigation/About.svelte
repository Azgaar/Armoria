<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import AnimatedCOA from "./AnimatedCOA.svelte";
  import {state} from "data//stores";
  import {fade, fly} from "svelte/transition";

  const duration = 1000;
</script>

<div id="about" transition:fade>
  <span on:click={() => ($state.about = 0)} class="close">&times;</span>

  <AnimatedCOA {duration} />

  <div in:fly={{y: 200, delay: duration, duration}} class="content">
    <div class="title">{$t("about.title")}</div>

    <div class="links">
      <a target="_blank" href="https://github.com/Azgaar/Armoria/wiki/Armoria-Tutorial">{$t("about.tutorial")}</a>
      <a target="_blank" href="https://discord.com/invite/X7E84HU">{$t("about.discord")}</a>
      <a target="_blank" href="https://github.com/Azgaar/Armoria">{$t("about.gitHub")}</a>
      <a target="_blank" href="https://github.com/Azgaar/armoria-api#readme"> {$t("about.api")}</a>
      <a target="_blank" href="https://www.patreon.com/azgaar"> {$t("about.patreon")}</a>
    </div>
  </div>
</div>

<style>
  #about {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.9);
    transition: 0.5s;
    text-align: center;
    user-select: none;

    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    padding: 20px;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 2em;
    font-size: 1.2em;
    color: #ddd;
  }

  a:hover,
  span:hover {
    color: #fff;
    text-decoration: none;
  }

  div.title {
    font-weight: bold;
  }

  .links {
    display: flex;
    justify-content: space-evenly;
    gap: 1em;
  }

  .links > a {
    color: #ddd;
    text-decoration: none;
  }

  .links > a:hover {
    color: #fff;
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
