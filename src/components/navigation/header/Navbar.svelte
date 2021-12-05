<script lang="ts">
  // @ts-check
  import {state, iconedNav} from "data/stores";
  import Logo from "./menu/Logo.svelte";
  import Options from "./menu/options/Options.svelte";
  import Rollback from "./menu/Rollback.svelte";
  import Reroll from "./menu/Reroll.svelte";
  import Save from "./menu/Save.svelte";
  import Upload from "./menu/Upload.svelte";
  import Install from "./menu/Install.svelte";
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
  <Options />
  <Rollback />
  <Reroll />
  <Save />
  <Upload />
  <Install />

  {#if $state.edit}
    <Undo />
    <Redo />
  {/if}

  {#if !$iconedNav || !$state.edit}
    <License />
    <About />
    <Support />
  {/if}

  {#if !$state.edit}
    <Language />
  {/if}

  <Back />
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    background-color: #1b1c1d;
  }
</style>
