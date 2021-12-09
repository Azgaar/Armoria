<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {fade} from "svelte/transition";
  import {flip} from "svelte/animate";
  import {colors, tinctures, state, message, changes} from "data/stores";
  import {camelize} from "scripts/utils";
  import {tooltip} from "scripts/tooltip";
  import {DEFAULT_COLORS, DEFAULT_TINCTURES} from "config/defaults";

  const addLine = {show: false, name: "", type: "colours", color: "#96C8FA", chance: 3};

  // remove stored weighted array
  for (const key in $tinctures) {
    delete $tinctures[key].array;
  }

  const types = ["metals", "colours", "stains"] as const;
  $: tData = types.map(type => Object.keys($tinctures[type]).map(tincture => ({t: tincture, type}))).flat();

  $: lock("tinctures", $tinctures);
  $: lock("colors", $colors);
  $: updateCOAonColorChange($colors);

  // don't lock options on load
  let loaded = [];
  function lock(key: string, value: unknown) {
    if (loaded.includes(key)) localStorage.setItem(key, JSON.stringify(value));
    else loaded.push(key);
  }

  function updateCOAonColorChange() {
    changes.refresh();
  }

  function getTotalChance(type: string) {
    const chances = Object.values($tinctures[type]) as number[];
    return chances.reduce((a, b) => a + b, 0);
  }

  function removeTincture(tinctureName: string, type: string) {
    if (type === "metals" || type === "colours") {
      const typeItems = Object.keys($tinctures[type]);

      if (typeItems.length < 3) {
        message.error($t("error.tinctureRemove"));
        return;
      }
    }

    delete $tinctures[type][tinctureName];
    $tinctures = $tinctures;
  }

  function addTincture() {
    addLine.show = true;
    message.info($t("info.tipAddTincture"), 8000);
  }

  function cancelAddTincture() {
    addLine.show = false;
  }

  function closeTincturesScreen() {
    $state.tinctures = 0;
  }

  function applyAddTincture() {
    const name = camelize(addLine.name);

    if (!name || $colors[name]) {
      message.error($t("error.nonUniqueTincture"));
      return;
    }

    $tinctures[addLine.type][name] = addLine.chance;
    $colors[name] = addLine.color;
    addLine.show = false;
    addLine.name = "";
    message.info($t("success.tinctureAdded"));
  }

  function restoreDefault() {
    $tinctures = JSON.parse(JSON.stringify(DEFAULT_TINCTURES));
    $colors = JSON.parse(JSON.stringify(DEFAULT_COLORS));
    localStorage.removeItem("tinctures");
    localStorage.removeItem("colors");
    loaded = [];
    message.info($t("info.restoredDefaults"));
  }

  function getTinctureName(tinctureName: string) {
    const translated = $t(`tinctures.${tinctureName}`);
    return translated.startsWith("tinctures.") ? tinctureName : translated;
  }
</script>

<div id="tinctures" transition:fade|local>
  <span on:click={closeTincturesScreen} class="close">&times;</span>

  <div id="left">
    <table>
      <thead>
        <tr>
          <th />
          {#each Object.keys($tinctures.field) as type (type)}
            <th>{$t(`tinctures.${type}`)}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each ["field", "division", "charge"] as element (element)}
          <tr>
            <td>{$t(`tinctures.${element}`)}</td>
            {#each Object.keys($tinctures[element]) as type (type)}
              <td>
                <input type="number" min="0" max="100" step="1" bind:value={$tinctures[element][type]} />
                <span class="totalChance">/ {getTotalChance(element)}</span>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr>
          <td />
          <td colspan="2">
            {#if addLine.show}
              <button on:click={applyAddTincture}>{$t("tinctures.apply")}</button>
            {:else}
              <button on:click={addTincture}>{$t("tinctures.add")}</button>
            {/if}
          </td>
          <td colspan="2">
            <button on:click={restoreDefault}>{$t("tinctures.restore")}</button>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>

  <div id="right">
    <table id="tincturesTable">
      <thead>
        <tr>
          {#each ["name", "type", "color", "chance", "remove"] as header}
            <th>{$t(`tinctures.${header}`)}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if addLine.show}
          <tr transition:fade>
            <td>
              <input type="text" placeholder={$t("tinctures.name")} bind:value={addLine.name} />
            </td>
            <td>
              <select bind:value={addLine.type}>
                <option value="metals">{$t("tinctures.metals")}</option>
                <option value="colours">{$t("tinctures.colours")}</option>
                <option value="stains">{$t("tinctures.stains")}</option>
              </select>
            </td>
            <td>
              <input type="color" bind:value={addLine.color} />
            </td>
            <td>
              <input type="number" min="0" max="100" step="1" bind:value={addLine.chance} />
            </td>
            <td>
              <span class="actionButton" on:click={cancelAddTincture}>&times;</span>
            </td>
          </tr>
        {/if}
        {#each tData as { t: tinctureName, type } (tinctureName)}
          <tr animate:flip>
            <td>{getTinctureName(tinctureName)}</td>
            <td>{$t(`tinctures.${type}`)}</td>
            <td>
              <input type="color" bind:value={$colors[tinctureName]} />
              {#if DEFAULT_COLORS[tinctureName] && $colors[tinctureName] !== DEFAULT_COLORS[tinctureName]}
                <svg
                  on:click={() => ($colors[tinctureName] = DEFAULT_COLORS[tinctureName])}
                  width="12"
                  height="12"
                  data-tooltip={$t("tooltip.undoColorChange")}
                  use:tooltip
                >
                  <use href="#undo-icon" />
                </svg>
              {/if}
            </td>
            <td>
              <input type="number" min="0" max="100" step="1" bind:value={$tinctures[type][tinctureName]} />
              <span class="totalChance">/ {getTotalChance(type)}</span>
            </td>
            <td>
              <span class="actionButton" on:click={() => removeTincture(tinctureName, type)}>&times;</span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  #tinctures {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.9);
    transition: 0.5s;
    text-align: center;
    user-select: none;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #tinctures::-webkit-scrollbar {
    width: 6px;
    background-color: #cccccc80;
  }

  #tinctures::-webkit-scrollbar-thumb {
    background-color: #111;
  }

  @media only screen and (orientation: portrait) {
    #tinctures {
      flex-direction: column;
    }
  }

  span.close {
    position: fixed;
    top: 0em;
    right: 0.5em;
    font-size: 4em;
    padding: 0.2em 0;
    cursor: pointer;
    color: #ddd;
    z-index: 2;
  }

  .close:hover,
  .actionButton:hover {
    color: #fff;
  }

  table {
    color: #ddd;
    text-transform: capitalize;
    min-width: 350px;
    max-width: 80vw;
    display: block;
    max-height: 80vh;
  }

  td {
    position: relative;
    width: 4em;
    height: 2.2em;
  }

  tfoot td {
    text-align: right;
  }

  #tincturesTable td:nth-child(3) {
    width: 5em;
  }

  input {
    position: absolute;
    transform: translate(-50%, -50%);
  }

  input[type="color"] {
    padding: 0;
    border: 0;
    cursor: pointer;
  }

  input[type="text"] {
    width: 6em;
  }

  input[type="number"] {
    width: 100%;
  }

  .totalChance {
    position: absolute;
    top: 6%;
    right: 10%;
    color: #333;
    user-select: none;
    pointer-events: none;
    font-size: 0.6em;
  }

  svg {
    cursor: pointer;
    position: absolute;
    transform: translate(-50%, -50%);
    fill: currentColor;
  }

  svg:hover {
    fill: #fff;
  }

  .actionButton {
    font-size: 2em;
    cursor: pointer;
  }
</style>
