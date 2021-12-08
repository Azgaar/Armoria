<script lang="ts">
  // @ts-check
  import {t} from "svelte-i18n";
  import {fade} from "svelte/transition";
  import {flip} from "svelte/animate";
  import {colors, tinctures, state, message, changes} from "data/stores";
  import {camelize} from "scripts/utils";
  import {tooltip} from "scripts/tooltip";
  import {DEFAULT_COLORS, DEFAULT_TINCTURES} from "config/defaults";

  let add = {show: false, name: "", type: "colours", color: "#96C8FA", chance: 3};

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
    add.show = true;
    message.info($t("info.tipAddTincture"), 8000);
  }

  function cancelAddTincture() {
    add.show = false;
  }

  function closeTincturesScreen() {
    $state.tinctures = 0;
  }

  function applyAddTincture() {
    const name = camelize(add.name);

    if (!name || $colors[name]) {
      message.error($t("error.nonUniqueTincture"));
      return;
    }

    $tinctures[add.type][name] = add.chance;
    $colors[name] = add.color;
    add.show = false;
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
  <div id="tincturesCont">
    <div id="left">
      <table>
        <thead>
          <tr>
            <th />
            <th>{$t("tinctures.metals")}</th>
            <th>{$t("tinctures.colours")}</th>
            <th>{$t("tinctures.stains")}</th>
            <th>{$t("tinctures.patterns")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{$t("tinctures.field")}</td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.field.metals} /></td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.field.colours} /></td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.field.stains} /></td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.field.patterns} /></td>
          </tr>
          <tr>
            <td>{$t("tinctures.division")}</td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.division.metals} /></td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.division.colours} /></td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.division.stains} /></td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.division.patterns} /></td>
          </tr>
          <tr>
            <td>{$t("tinctures.charge")}</td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.charge.metals} /></td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.charge.colours} /></td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.charge.stains} /></td>
            <td><input type="number" min="0" max="100" step="1" bind:value={$tinctures.charge.patterns} /></td>
          </tr>
        </tbody>
      </table>

      <div class="contolButtons">
        {#if add.show}
          <button on:click={applyAddTincture}>{$t("tinctures.apply")}</button>
        {:else}
          <button on:click={addTincture}>{$t("tinctures.add")}</button>
        {/if}
        <button on:click={restoreDefault}>{$t("tinctures.restore")}</button>
      </div>
    </div>

    <div id="right">
      <table id="tincturesTable">
        <thead>
          <tr>
            <th>{$t("tinctures.name")}</th>
            <th>{$t("tinctures.type")}</th>
            <th>{$t("tinctures.color")}</th>
            <th>{$t("tinctures.chance")}</th>
            <th>{$t("tinctures.remove")}</th>
          </tr>
        </thead>
        <tbody>
          {#if add.show}
            <tr transition:fade>
              <td>
                <input type="text" placeholder={$t("tinctures.name")} bind:value={add.name} />
              </td>
              <td>
                <select bind:value={add.type}>
                  <option value="metals">{$t("tinctures.metals")}</option>
                  <option value="colours">{$t("tinctures.colours")}</option>
                  <option value="stains">{$t("tinctures.stains")}</option>
                </select>
              </td>
              <td>
                <input type="color" bind:value={add.color} />
              </td>
              <td>
                <input type="number" min="0" max="100" step="1" bind:value={add.chance} />
              </td>
              <td>
                <span class="actionButton" on:click={cancelAddTincture}>&times;</span>
              </td>
            </tr>
          {/if}
          {#each tData as {t: tinctureName, type} (tinctureName)}
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
                    fill="#fff"
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
</div>

<style>
  #tinctures {
    height: 100%;
    width: 100%;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    background-color: rgba(0, 0, 0, 0.9);
    transition: 0.5s;
    text-align: center;
    user-select: none;
  }

  #tincturesCont {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: auto;
    scrollbar-width: thin;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #tincturesCont::-webkit-scrollbar {
    width: 6px;
    background-color: #cccccc80;
  }

  #tincturesCont::-webkit-scrollbar-thumb {
    background-color: #111;
  }

  @media only screen and (orientation: portrait) {
    #tincturesCont {
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
    width: 4em;
  }

  #tincturesTable td:nth-child(3) {
    width: 5em;
  }

  svg {
    cursor: pointer;
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
    width: 4em;
  }

  .totalChance {
    position: absolute;
    margin: 0.1em 0 0 -2.1em;
    color: #333;
    user-select: none;
    pointer-events: none;
    font-size: 0.6em;
  }

  .actionButton {
    font-size: 2em;
    cursor: pointer;
  }

  .contolButtons > button {
    width: 9em;
    margin: 1em 0.1em;
  }
</style>
