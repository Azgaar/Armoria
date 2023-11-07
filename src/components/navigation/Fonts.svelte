<script lang="ts">
  // @ts-check
  import {DEFAULT_FONTS} from "config/defaults";
  import {fonts, message, state} from "data/stores";
  import {markdown} from "scripts/i18n";
  import {t} from "svelte-i18n";
  import {fade, fly} from "svelte/transition";

  let name = "";
  let type: "local" | "web" = "local";
  let url = "";

  function confirm() {
    if (!name) return message.error($t("error.emptyName"));
    if ($fonts[name]) return message.error($t("error.notUniqueName"));

    if (type === "web") {
      if (!url) return message.error($t("error.emptyFontURL"));

      const font = new FontFace(name, `url(${url})`);
      font.load().then(
        () => {
          document.fonts.add(font);
          $fonts[name] = {url};
          message.info($t("success.fontAdded"));
          close();
        },
        err => {
          console.error(err);
          message.error($t("error.loadingFont"));
        }
      );
    } else {
      // type === "local"
      $fonts[name] = {};
      message.info($t("success.fontAdded"));
      close();
    }

    localStorage.setItem("fonts", JSON.stringify($fonts));
  }

  function restoreDefaultFonts() {
    $fonts = DEFAULT_FONTS;
    localStorage.removeItem("fonts");
  }

  function close() {
    $state.fonts = 0;
  }
</script>

<div id="fonts">
  <form name="add font" transition:fade|local on:submit|preventDefault={confirm}>
    <div class="input">
      <label for="fontType">{$t("fonts.type")}:</label>
      <select id="fontType" bind:value={type}>
        <option value="local">{$t("fonts.local")}</option>
        <option value="web">{$t("fonts.web")}</option>
      </select>
    </div>

    <div class="input">
      <label for="fontName">{$t(`fonts.name_${type}`)}:</label>
      <input id="fontName" bind:value={name} />
    </div>

    {#if type === "web"}
      <div class="input" in:fly|local>
        <label for="fontUrl">{$t("fonts.url")}:</label>
        <input id="fontUrl" bind:value={url} />
      </div>
    {/if}

    <div>{@html markdown($t("fonts.tip_local"))}</div>
    <div>{@html markdown($t("fonts.tip_web"))}</div>

    <div class="controls">
      <button type="submit">{$t("fonts.confirm")}</button>
      <button type="button" on:click={close}>{$t("fonts.close")}</button>
    </div>

    {#if Object.keys($fonts).length !== Object.keys(DEFAULT_FONTS).length}
      <button type="button" class="linkButton" on:click={restoreDefaultFonts}>{$t("fonts.restoreDefault")}</button>
    {/if}
  </form>
</div>

<style>
  #fonts {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    transition: 0.5s;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  form {
    width: 300px;

    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  form > div.input {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  form > div.controls {
    align-self: flex-end;
    display: flex;
    gap: 0.4rem;
  }

  form > button.linkButton {
    padding: 0;
    align-self: flex-start;

    background-color: transparent;
    border: none;
    color: #e6e6e6;
    text-decoration: underline;

    cursor: pointer;
    transition: 0.2s;
  }

  form > button.linkButton:hover {
    color: white;
  }
</style>
