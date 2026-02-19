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

  export let modelReady = false;

  const dispatch = createEventDispatcher();
  const CANDIDATE_POOL = 40;
  const COA_SIZE = 260;

  let pair: Coa[] = [];
  let comparisons = 0;
  let loading = false;

  /** Generate candidates with independent crypto-random seeds in 0-999999999. */
  function buildCandidates() {
    const savedRandom = Math.random;
    const seeds = new Uint32Array(CANDIDATE_POOL);
    crypto.getRandomValues(seeds);

    $shield = rw(shields[rw(shields.types)]);

    const result = Array.from(seeds, seed => generate(seed % 1000000000));
    Math.random = savedRandom;
    return result;
  }

  function pickRandomPair(candidates: Coa[]) {
    if (candidates.length < 2) return [];
    const arr = new Uint32Array(2);
    crypto.getRandomValues(arr);
    const first = arr[0] % candidates.length;
    let second = arr[1] % candidates.length;
    while (second === first) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      second = buf[0] % candidates.length;
    }
    return [candidates[first], candidates[second]];
  }

  async function loadPair() {
    loading = true;
    const candidates = buildCandidates();

    if (modelReady) {
      try {
        const response = await fetch(`${PREFERENCE_API_URL}/api/suggest-pair`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({candidates})
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.pair) && data.pair.length === 2) {
            pair = data.pair;
            loading = false;
            return;
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    pair = pickRandomPair(candidates);
    loading = false;
  }

  async function choose(index: number) {
    if (loading || pair.length < 2) return;
    loading = true;
    const winner = pair[index];
    const loser = pair[index === 0 ? 1 : 0];

    try {
      const response = await fetch(`${PREFERENCE_API_URL}/api/preferences/pairwise`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({winner, loser})
      });
      if (!response.ok) throw new Error("Failed to submit pairwise preference");
      dispatch("update");
    } catch (error) {
      console.error(error);
    }

    comparisons += 1;
    await loadPair();
  }

  function finishPhase() {
    dispatch("finish");
  }

  onMount(loadPair);
</script>

<main class="pairwise">
  <header class="header">
    <div>
      <h2>Pairwise Comparison</h2>
      <p>Comparisons: {comparisons} {modelReady ? "• Active learning" : "• Random pairs"}</p>
    </div>
    <div class="actions">
      <button class="secondary" on:click={loadPair} disabled={loading}>New Pair</button>
      <button class="secondary" on:click={finishPhase}>Finish Phase 2</button>
    </div>
  </header>

  {#if pair.length === 2}
    <div class="pair">
      {#each pair as coa, index}
        <button class="choice" on:click={() => choose(index)} disabled={loading}>
          {#key coa}
            <COA {coa} i={`pair-${index}`} width={COA_SIZE} height={COA_SIZE} />
          {/key}
          <span class="label">{index === 0 ? "Option A" : "Option B"}</span>
        </button>
      {/each}
    </div>
  {:else}
    <p class="loading">Generating a new pair...</p>
  {/if}
</main>

<style>
  .pairwise {
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

  .pair {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }

  .choice {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    padding: 12px;
    border-radius: 10px;
    border: 2px solid transparent;
    background: #00000045;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  .choice:hover {
    border-color: #5a5a5a;
    transform: translateY(-2px);
  }

  .choice:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .label {
    color: #c9c9c9;
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .loading {
    color: #c9c9c9;
  }

  button.secondary {
    border-radius: 4px;
    border: 1px solid #3a3a3a;
    padding: 8px 12px;
    background: transparent;
    color: #dcdcdc;
    cursor: pointer;
  }

  button.secondary:disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>