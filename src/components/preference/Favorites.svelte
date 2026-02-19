<script lang="ts">
  // @ts-check
  import {onMount} from "svelte";
  import {PREFERENCE_API_URL} from "config/preference";
  import COA from "../object/COA.svelte";
  import type {Coa} from "types/coa";

  type FavoriteEntry = {index: number; coa: Coa};

  const COA_SIZE = 140;

  let gridSelections: FavoriteEntry[] = [];
  let pairwiseWinners: FavoriteEntry[] = [];
  let loading = true;

  async function fetchFavorites() {
    loading = true;
    try {
      const response = await fetch(`${PREFERENCE_API_URL}/api/favorites`);
      if (response.ok) {
        const data = await response.json();
        gridSelections = data.grid_selections || [];
        pairwiseWinners = data.pairwise_winners || [];
      }
    } catch (error) {
      console.error(error);
    }
    loading = false;
  }

  function copyCoa(coa: Coa) {
    const json = JSON.stringify(coa, null, 2);
    navigator.clipboard.writeText(json).catch(console.error);
  }

  onMount(fetchFavorites);
</script>

<main class="favorites">
  <header class="header">
    <div>
      <h2>Favorites</h2>
      <p>Review the designs you liked. Click any coat of arms to copy its JSON.</p>
    </div>
    <div class="actions">
      <button class="secondary" on:click={fetchFavorites} disabled={loading}>
        {loading ? "Loading..." : "Refresh"}
      </button>
    </div>
  </header>

  {#if loading}
    <p class="empty">Loading favorites...</p>
  {:else if gridSelections.length === 0 && pairwiseWinners.length === 0}
    <p class="empty">No favorites yet. Select some designs in the Grid Selection or Pairwise phases.</p>
  {:else}
    {#if gridSelections.length > 0}
      <section class="section">
        <h3>Grid Selections <span class="count">({gridSelections.length})</span></h3>
        <p class="description">Designs you selected as favorites in the grid rounds.</p>
        <div class="grid">
          {#each gridSelections as entry}
            <button class="card" on:click={() => copyCoa(entry.coa)} title="Click to copy COA JSON">
              {#key entry.coa}
                <COA coa={entry.coa} i={`fav-grid-${entry.index}`} width={COA_SIZE} height={COA_SIZE} />
              {/key}
            </button>
          {/each}
        </div>
      </section>
    {/if}

    {#if pairwiseWinners.length > 0}
      <section class="section">
        <h3>Pairwise Winners <span class="count">({pairwiseWinners.length})</span></h3>
        <p class="description">Designs you chose as the preferred option in head-to-head comparisons.</p>
        <div class="grid">
          {#each pairwiseWinners as entry}
            <button class="card" on:click={() => copyCoa(entry.coa)} title="Click to copy COA JSON">
              {#key entry.coa}
                <COA coa={entry.coa} i={`fav-pair-${entry.index}`} width={COA_SIZE} height={COA_SIZE} />
              {/key}
            </button>
          {/each}
        </div>
      </section>
    {/if}
  {/if}
</main>

<style>
  .favorites {
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

  .section {
    margin-bottom: 28px;
  }

  .section h3 {
    margin: 0 0 4px;
    font-size: 1.05em;
  }

  .count {
    color: #b8b8b8;
    font-weight: normal;
    font-size: 0.9em;
  }

  .description {
    margin: 0 0 12px;
    color: #b8b8b8;
    font-size: 0.9em;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px;
    border-radius: 8px;
    border: 2px solid transparent;
    background: #00000040;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  .card:hover {
    border-color: #4d4d4d;
    transform: translateY(-2px);
  }

  .card:active {
    border-color: #3ddc84;
  }

  .empty {
    color: #b8b8b8;
  }

  .actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  button.secondary {
    border-radius: 4px;
    border: 1px solid #3a3a3a;
    padding: 8px 12px;
    background: transparent;
    color: #dcdcdc;
    cursor: pointer;
    font-size: 0.9em;
  }

  button.secondary:disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>