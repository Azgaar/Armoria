<script lang="ts">
  // @ts-check
  import {iconedNav, isTextReady, state} from "data/stores";
  import Logo from "./menu/Logo.svelte";
  import Options from "./menu/options/Options.svelte";
  import Rollback from "./menu/Rollback.svelte";
  import Reroll from "./menu/Reroll.svelte";
  import Save from "./menu/Save.svelte";
  import Upload from "./menu/Upload.svelte";
  import Install from "./menu/Install.svelte";
  import Other from "./menu/Other.svelte";
  import Undo from "./menu/Undo.svelte";
  import Redo from "./menu/Redo.svelte";
  import License from "./menu/License.svelte";
  import About from "./menu/About.svelte";
  import Support from "./menu/Support.svelte";
  import Language from "./menu/Language.svelte";
  import Back from "./menu/Back.svelte";
</script>

<nav>
  <Logo />
  {#if $isTextReady}
    <Options />
    <Rollback />
    <Reroll />
    <Save />

    {#if $iconedNav}
      {#if $state.edit}
        <Other>
          <Upload />
          <Language />
          <License />
          <Support />
          <About />
        </Other>
      {:else}
        <Upload />
        <Language />
        <Support />
        <Other>
          <License />
          <About />
        </Other>
      {/if}
    {:else}
      <Upload />
      <Language />
      <License />
      <Support />
      <About />
    {/if}

    <Install />

    {#if $state.edit}
      <Undo />
      <Redo />
      <Back />
    {/if}
  {/if}
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-height: 45px;
    background-color: #1b1c1d;
  }
</style>
