<script lang="ts">
  // @ts-check
  import {onMount} from "svelte";
  import {preferenceMode} from "data/stores";
  import {PREFERENCE_API_URL} from "config/preference";
  import GridSelection from "./GridSelection.svelte";
  import PairwiseComparison from "./PairwiseComparison.svelte";
  import GuidedGeneration from "./GuidedGeneration.svelte";
  import Favorites from "./Favorites.svelte";

  type Stats = {
    total_preferences: number;
    grid_preferences: number;
    pairwise_preferences: number;
    grid_selected: number;
    model_trained: boolean;
    model_accuracy: number;
    training_samples: number;
  };

  const phases = ["Grid Selection", "Pairwise", "Guided", "Favorites"];

  let phase = 0;
  let training = false;
  let stats: Stats = {
    total_preferences: 0,
    grid_preferences: 0,
    pairwise_preferences: 0,
    grid_selected: 0,
    model_trained: false,
    model_accuracy: 0,
    training_samples: 0
  };

  $: accuracyLabel = stats.model_trained ? `${(stats.model_accuracy * 100).toFixed(1)}%` : "—";

  async function fetchStats() {
    try {
      const response = await fetch(`${PREFERENCE_API_URL}/api/stats`);
      if (response.ok) {
        stats = await response.json();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function trainModel() {
    if (training) return;
    training = true;
    try {
      const response = await fetch(`${PREFERENCE_API_URL}/api/train`, {method: "POST"});
      if (response.ok) {
        const data = await response.json();
        stats = {
          ...stats,
          model_trained: data.trained ?? stats.model_trained,
          model_accuracy: data.accuracy ?? stats.model_accuracy,
          training_samples: data.n_samples ?? stats.training_samples
        };
      }
    } catch (error) {
      console.error(error);
    }
    training = false;
    await fetchStats();
  }

  function setPhase(index: number) {
    phase = index;
  }

  function finishPhase1() {
    phase = 1;
    trainModel();
  }

  function finishPhase2() {
    phase = 2;
    trainModel();
  }

  function exitPreference() {
    $preferenceMode = false;
  }

  onMount(fetchStats);
</script>

<div class="preference-mode">
  <div class="toolbar">
    <button class="back" on:click={exitPreference}>Back to Gallery</button>
    <div class="tabs">
      {#each phases as label, index}
        <button class="tab" class:active={phase === index} on:click={() => setPhase(index)}>
          {label}
        </button>
      {/each}
    </div>
    <button class="train" on:click={trainModel} disabled={training}>
      {training ? "Training..." : "Train Model"}
    </button>
  </div>

  <div class="stats">
    <div class="stat">
      <span class="label">Preferences</span>
      <span class="value">{stats.total_preferences}</span>
    </div>
    <div class="stat">
      <span class="label">Grid</span>
      <span class="value">{stats.grid_preferences} ({stats.grid_selected} selected)</span>
    </div>
    <div class="stat">
      <span class="label">Pairwise</span>
      <span class="value">{stats.pairwise_preferences}</span>
    </div>
    <div class="stat">
      <span class="label">Model</span>
      <span class="value">{stats.model_trained ? "Trained" : "Untrained"}</span>
    </div>
    <div class="stat">
      <span class="label">Accuracy</span>
      <span class="value">{accuracyLabel}</span>
    </div>
    <div class="stat">
      <span class="label">Samples</span>
      <span class="value">{stats.training_samples}</span>
    </div>
  </div>

  <section class="content">
    {#if phase === 0}
      <GridSelection on:update={fetchStats} on:finish={finishPhase1} />
    {:else if phase === 1}
      <PairwiseComparison modelReady={stats.model_trained} on:update={fetchStats} on:finish={finishPhase2} />
    {:else if phase === 2}
      <GuidedGeneration on:update={fetchStats} />
    {:else}
      <Favorites />
    {/if}
  </section>
</div>

<style>
  .preference-mode {
    color: #f1f1f1;
    min-height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-bottom: 20px;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px 0;
  }

  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tab {
    border-radius: 999px;
    border: 1px solid #3a3a3a;
    padding: 6px 14px;
    background: transparent;
    color: #dcdcdc;
    cursor: pointer;
  }

  .tab.active {
    background: #2b2b2b;
    border-color: #4d4d4d;
    color: #fff;
  }

  .back,
  .train {
    border-radius: 4px;
    border: 1px solid #3a3a3a;
    padding: 8px 12px;
    background: #222;
    color: #f1f1f1;
    cursor: pointer;
  }

  .train:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 12px;
    padding: 0 20px;
  }

  .stat {
    background: #00000040;
    border: 1px solid #2d2d2d;
    border-radius: 8px;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .label {
    color: #b8b8b8;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .value {
    font-size: 1.05em;
  }

  .content {
    flex: 1;
  }
</style>