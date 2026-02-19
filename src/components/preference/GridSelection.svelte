<script lang="ts">
  // @ts-check
  import {createEventDispatcher, onMount} from "svelte";
  import {generate} from "scripts/generator";
  import {PREFERENCE_API_URL} from "config/preference";
  import {shield} from "data/stores";
  import {shields} from "data/dataModel";
  import {rw} from "scripts/utils";
  import COA from "../object/COA.svelte";
  import type {Coa} from "types/coa";

  const dispatch = createEventDispatcher();
  const GRID_SIZE = 20;
  const COA_SIZE = 140;

  let round = 1;
  let coas: Coa[] = [];
  let selections: boolean[] = [];
  let submitting = false;

  /** Generate a batch of independent COAs using crypto-random seeds
   *  in the 0-999999999 range matching the generator's expected seed space.
   *  Save and restore Math.random so the normal gallery is unaffected.
   */
  function buildBatch() {
    const savedRandom = Math.random;
    const seeds = new Uint32Array(GRID_SIZE);
    crypto.getRandomValues(seeds);

    $shield = rw(shields[rw(shields.types)]);

    coas = Array.from(seeds, seed => generate(seed % 1000000000));
    Math.random = savedRandom;
    selections = Array(coas.length).fill(false);
  }

  $: selectedCount = selections.filter(Boolean).length;

  function toggleSelection(index: number) {
    selections[index] = !selections[index];
    selections = selections.slice();
  }

  async function submitRound() {
    if (submitting) return;
    submitting = true;
    const payload = {
      selections: coas.map((coa, index) => ({
        coa,
        selected: selections[index]
      }))
    };

    try {
      const response = await fetch(`${PREFERENCE_API_URL}/api/preferences/grid`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Failed to submit selections");
    } catch (error) {
      console.error(error);
    }

    round += 1;
    buildBatch();
    submitting = false;
    dispatch("update");
  }

  function finishPhase() {
    dispatch("finish");
  }

  onMount(buildBatch);
</script>

<main class="grid-selection">
  <header class="header">
    <div>
      <h2>Grid Selection</h2>
      <p>Round {round} • Selected {selectedCount}/{coas.length}</p>
    </div>
    <div class="actions">
      <button class="primary" on:click={submitRound} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit & Next Round"}
      </button>
      <button class="secondary" on:click={finishPhase}>Finish Phase 1</button>
    </div>
  </header>

  <div class="grid">
    {#each coas as coa, i}
      <div class="item" class:selected={selections[i]} on:click={() => toggleSelection(i)}>
        {#key coa}
          <COA {coa} i={`grid-${i}`} width={COA_SIZE} height={COA_SIZE} />
        {/key}
      </div>
    {/each}
  </div>
</main>

<style>
  .grid-selection {
    padding: 20px;
    color: #f1f1f1;
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .header h2 {
    margin: 0;
    font-size: 1.2em;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .header p {
    margin: 4px 0 0;
    color: #b8b8b8;
    font-size: 0.95em;
  }

  .actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .item {
    padding: 8px;
    border-radius: 8px;
    border: 2px solid transparent;
    background: #00000040;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  .item:hover {
    border-color: #4d4d4d;
    transform: translateY(-2px);
  }

  .item.selected {
    border-color: #3ddc84;
    box-shadow: 0 0 0 1px #3ddc84;
  }

  button {
    border-radius: 4px;
    border: 1px solid #3a3a3a;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.9em;
  }

  button.primary {
    background: #2b2b2b;
    color: #f1f1f1;
  }

  button.secondary {
    background: transparent;
    color: #dcdcdc;
  }

  button:disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>