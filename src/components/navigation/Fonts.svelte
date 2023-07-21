<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {fade} from "svelte/transition";
  import {fonts, state, message} from "data/stores";
  import {tooltip} from "scripts/tooltip";

  const newFont = {name: "", type: "local", url: ""};

  $: lock("fonts", $fonts);

  // don't lock options on load
  let loaded = [];
  function lock(key: string, value: unknown) {
    if (loaded.includes(key)) localStorage.setItem(key, JSON.stringify(value));
    else loaded.push(key);
  }

  function confirm() {
    const {name, type, url} = newFont;

    if (!name) {
      message.error($t("error.emptyName"));
      return;
    }
    if ($fonts[name]) {
      message.error($t("error.notUniqueName"));
      return;
    }
    if (type === "web") {
      if (!url) {
        message.error($t("error.emptyFontURL"));
        return;
      }
      const font = new FontFace(name, `url(${url})`);
      font.load().then(
        () => {
          document.fonts.add(font);
          $fonts[name] = {url};
          updateFonts(name);
        },
        (err) => {
          message.error($t("error.loadingFont"));
        }
      );
    }
    else {
      $fonts[name] = {};
      updateFonts(name);
    }
  }

  function updateFonts(name) {
    $fonts = Object.fromEntries(Object.entries($fonts).sort());
    $state.fonts = 0;
    $state.currentInscription.font = name;
    $state.currentInscription = null;
    message.info($t("success.fontAdded"));
  }

  function cancel() {
    $state.fonts = 0;
    $state.currentInscription = null;
  }
</script>

<div id="fonts" transition:fade|local>
  <div>
    <div>
      <select bind:value={newFont.type}>
        <option value="local">{$t("fonts.local")}</option>
        <option value="web">{$t("fonts.web")}</option>
      </select>
      <input type="text" placeholder={$t("fonts.name")} bind:value={newFont.name} />
    </div>
    {#if newFont.type === "web"}
    <div transition:fade|local>
      <input type="text" class="url" placeholder={$t("fonts.url")} bind:value={newFont.url} />
    </div>
    {/if}
    <div>
      <button on:click={confirm}>{$t("fonts.confirm")}</button>
      <button on:click={cancel}>{$t("fonts.cancel")}</button>
    </div>
  </div>
</div>

<style>
  #fonts {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.9);
    transition: 0.5s;
    text-align: center;
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .url {
    width: 100%;
  }
</style>
