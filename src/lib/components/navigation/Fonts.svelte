<script lang="ts">
  import {settingsStorage} from "#lib/data/storage.ts";
  // @ts-check
  import {DEFAULT_FONTS} from "#lib/config/defaults.ts";
  import {fonts, message, state as editorState} from "#lib/data/stores.ts";
  import {markdown} from "#lib/scripts/i18n.ts";
  import {t} from "svelte-i18n";
  import {onDestroy} from "svelte";
  import {fade, fly} from "svelte/transition";

  let name = $state("");
  let type = $state<"local" | "web">("local");
  let url = $state("");

  let revision = 0;
  onDestroy(() => revision++);

  function confirm() {
    const version = ++revision;
    if (!name) return message.error($t("error.emptyName"));
    if ($fonts[name]) return message.error($t("error.notUniqueName"));

    if (type === "web") {
      if (!url) return message.error($t("error.emptyFontURL"));

      const family = name;
      const source = url;
      const font = new FontFace(family, `url(${JSON.stringify(source)})`);
      font.load().then(
        () => {
          if (version !== revision) return;
          document.fonts.add(font);
          addFont(family, {url: source});
        },
        err => {
          if (version !== revision) return;
          console.error(err);
          message.error($t("error.loadingFont"));
        }
      );
    } else {
      // type === "local"
      addFont(name, {});
    }
  }

  function addFont(name: string, data: {url?: string}) {
    $fonts[name] = data;
    settingsStorage.setItem("fonts", JSON.stringify($fonts));
    message.info($t("success.fontAdded"));
    close();
  }

  function restoreDefaultFonts() {
    revision++;
    $fonts = DEFAULT_FONTS;
    settingsStorage.removeItem("fonts");
  }

  function close() {
    revision++;
    $editorState.fonts = 0;
  }
</script>

<div id="fonts">
  <form
    name="add font"
    transition:fade|local
    onsubmit={event => {
      event.preventDefault();
      confirm();
    }}
  >
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
      <button type="button" onclick={close}>{$t("fonts.close")}</button>
    </div>

    {#if Object.keys($fonts).length !== Object.keys(DEFAULT_FONTS).length}
      <button type="button" class="linkButton" onclick={restoreDefaultFonts}>{$t("fonts.restoreDefault")}</button>
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
