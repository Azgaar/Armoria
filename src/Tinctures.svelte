<script>
  import Tooltip from './Tooltip.svelte';
  import { fade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { colors, tinctures, state, message } from './stores';
  import { defaultTinctures, defaultColors } from './dataModel';
  import { camelize } from './utils';

  let add = {show: false, name: "", type: "colours", color: "#96C8FA", chance: 3};

  // remove stored weighted array
  for (const key in $tinctures) {delete $tinctures[key].array};

  $: tData = ["metals", "colours", "stains"].map(type => {
      return Object.keys($tinctures[type]).map(t => {
        return {t, type};
      });
    }).flat();

  $: lock("tinctures", $tinctures);
  $: lock("colors", $colors);

  // don't lock options on load
  let loaded = [];
  function lock(key, value) {
    if (loaded.includes(key)) localStorage.setItem(key, JSON.stringify(value));
    else loaded.push(key);
  }

  function getTotalChance(type) {
    return Object.entries($tinctures[type]).reduce((a, b) => a + b[1], 0);
  }

  function removeTincture(t) {
    if (t.type === "metals" || t.type === "colours") {
      const typeItems = Object.keys($tinctures[t.type]);
      if (typeItems.length < 3) {
        $message = {type: "error", text: `There should be at least 2 tinctures of type '${t.type}'!`};
        return;
      }
    }

    delete $tinctures[t.type][t.t];
    $tinctures = $tinctures;
  }

  function addTincture() {
    add.show = true;
    $message = {type: "warn", text: `Set tincture name, type, color and chance and then click on 'Apply Tincture'`, timeout: 8000};
  }

  function cancelAddTincture() {
    add.show = false;
  }

  function applyAddTincture() {
    const name = camelize(add.name);

    if (!name || $colors[name]) {
      $message = {type: "error", text: `Tincture name must be unique!`};
      return;
    }

    $tinctures[add.type][add.name] = add.chance;
    $colors[add.name] = add.color;
    add.show = false;
    $message = {type: "info", text: `Tincture ${add.name} is added`};
  }

  function restoreDefault() {
    $tinctures = JSON.parse(JSON.stringify(defaultTinctures));
    $colors = JSON.parse(JSON.stringify(defaultColors));
    localStorage.removeItem("tinctures");
    localStorage.removeItem("colors");
    loaded = [];
    $message = {type: "info", text: `Default values are restored`};
  }
</script>

<div id="tinctures" transition:fade|local>
  <span on:click={() => $state.tinctures = 0} class="close">&times;</span>
  <div id="tincturesCont">

    <div id=left>
      <table>
        <thead>
          <tr>
            <th>Element</th>
            <th>Metals</th>
            <th>Colours</th>
            <th>Stains</th>
            <th>Patterns</th>
          </tr>
        </thead>
        <tbody>
            <tr>
              <td>Field</td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.field.metals}/></td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.field.colours}/></td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.field.stains}/></td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.field.patterns}/></td>
            </tr>
            <tr>
              <td>Division</td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.division.metals}/></td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.division.colours}/></td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.division.stains}/></td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.division.patterns}/></td>
            </tr>
            <tr>
              <td>Charge</td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.charge.metals}/></td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.charge.colours}/></td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.charge.stains}/></td>
              <td><input type=number min=0 max=100 step=1 bind:value={$tinctures.charge.patterns}/></td>
            </tr>
        </tbody>
      </table>

      <div class=contolButtons>
        {#if add.show}
          <button on:click={applyAddTincture}>Apply Tincture</button>
        {:else}
          <button on:click={addTincture}>Add Tincture</button>
        {/if}
        <button on:click={restoreDefault}>Restore Default</button>
      </div>
    </div>

    <div id=right>
      <table id=tincturesTable>
        <thead>
          <tr>
            <th>Tincture</th>
            <th>Type</th>
            <th>Color</th>
            <th>Chance</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {#if add.show}
            <tr transition:fade>
              <td>
                <input type=text placeholder=Tincture bind:value={add.name}/>
              </td>
              <td>
                <select bind:value={add.type}>
                  <option value=metals>Metals</option>
                  <option value=colours>Colours</option>
                  <option value=stains>Stains</option>
                </select>
              </td>
              <td>
                <input type=color bind:value={add.color}/>
              </td>
              <td>
                <input type=number min=0 max=100 step=1 bind:value={add.chance}/>
              </td>
              <td>
                <span class=actionButton on:click={cancelAddTincture}>&times;</span>
              </td>
            </tr>
          {/if}
          {#each tData as t (t.t)}
            <tr animate:flip>
              <td>{t.t}</td>
              <td>{t.type}</td>
              <td>
                <input type=color bind:value={$colors[t.t]}/>
                {#if defaultColors[t.t] && $colors[t.t] !== defaultColors[t.t]}
                  <Tooltip tip="Restore default color">
                    <svg on:click={() => $colors[t.t] = defaultColors[t.t]} width=12 height=12 fill=#fff><use href="#undo-icon"></use></svg>
                  </Tooltip>
                {/if}
              </td>
              <td>
                <input type=number min=0 max=100 step=1 bind:value={$tinctures[t.type][t.t]}/>
                <span class=totalChance>/ {getTotalChance(t.type)}</span>
              </td>
              <td>
                <span class=actionButton on:click={() => removeTincture(t)}>&times;</span>
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
    background-color: rgba(0,0,0, 0.9);
    transition: .5s;
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
    right: .5em;
    font-size: 4em;
    padding: .2em 0;
    cursor: pointer;
    color: #ddd;
    z-index: 2;
  }

  .close:hover, .actionButton:hover {
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
    margin: .1em 0 0 -2.1em;
    color: #333;
    user-select: none;
    pointer-events: none;
    font-size: .6em;
  }

  .actionButton {
    font-size: 2em;
    cursor: pointer;
  }

  .contolButtons > button {
    width: 9em;
    margin: 1em .1em;
  }
</style>