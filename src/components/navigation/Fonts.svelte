<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {fade} from "svelte/transition";
  import {fonts, state, message} from "data/stores";

  const newFont: {
    name: string;
    type: "local" | "web";
    url?: string;
  } = {name: "", type: "local", url: ""};

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
  }

  function close() {
    $state.fonts = 0;
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
      <button on:click={close}>{$t("fonts.cancel")}</button>
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
