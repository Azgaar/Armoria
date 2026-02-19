<script lang="ts">
  // @ts-check
  import {createEventDispatcher} from "svelte";
  import {generate} from "scripts/generator";
  import {PREFERENCE_API_URL} from "config/preference";
  import {shield} from "data/stores";
  import {shields} from "data/dataModel";
  import {rw} from "scripts/utils";
  import COA from "../object/COA.svelte";
  import type {Coa} from "types/coa";

  type ScoredCoa = {coa: Coa; score: number};

  const dispatch = createEventDispatcher();
  const BATCH_SIZE = 200;
  const TOP_K = 20;
  const COA_SIZE = 140;
  const FEEDBACK_SIZE = 220;

  let scored: ScoredCoa[] = [];
  let loading = false;
  let selectedIndex: number | null = null;
  let feedbackActive = false;
  let feedbackPair: ScoredCoa[] = [];
  let feedbackSubmitting = false;

  async function generateBatch() {
    if (loading) return;
    loading = true;
    selectedIndex = null;
    const savedRandom = Math.random;
    const seeds = new Uint32Array(BATCH_SIZE);
    crypto.getRandomValues(seeds);

    $shield = rw(shields[rw(shields.types)]);

    const candidates = Array.from(seeds, seed => generate(seed % 1000000000));
    Math.random = savedRandom;

    try {
      const response = await fetch(`${PREFERENCE_API_URL}/api/score`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({coas: candidates})
      });

      let scores: number[] = [];
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.scores)) scores = data.scores;
      }

      const scoredAll = candidates.map((coa, index) => ({
        coa,
        score: typeof scores[index] === "number" ? scores[index] : 0.5
      }));
      scoredAll.sort((a, b) => b.score - a.score);
      scored = scoredAll.slice(0, TOP_K);
    } catch (error) {
      console.error(error);
      scored = candidates.slice(0, TOP_K).map(coa => ({coa, score: 0.5}));
    }

    loading = false;
    if (feedbackActive) {
      pickFeedbackPair();
    }
  }

  function selectFinal(index: number) {
    selectedIndex = index;
  }

  function toggleFeedback() {
    feedbackActive = !feedbackActive;
    if (feedbackActive) {
      pickFeedbackPair();
    }
  }

  function pickFeedbackPair() {
    if (scored.length < 2) {
      feedbackPair = [];
      return;
    }
    const first = Math.floor(Math.random() * scored.length);
    let second = Math.floor(Math.random() * scored.length);
    while (second === first) {
      second = Math.floor(Math.random() * scored.length);
    }
    feedbackPair = [scored[first], scored[second]];
  }

  async function chooseFeedback(index: number) {
    if (feedbackSubmitting || feedbackPair.length < 2) return;
    feedbackSubmitting = true;
    const winner = feedbackPair[index].coa;
    const loser = feedbackPair[index === 0 ? 1 : 0].coa;

    try {
      const response = await fetch(`${PREFERENCE_API_URL}/api/preferences/pairwise`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({winner, loser})
      });
      if (!response.ok) throw new Error("Failed to submit feedback");
      dispatch("update");
    } catch (error) {
      console.error(error);
    }

    feedbackSubmitting = false;
    pickFeedbackPair();
  }
</script>

<main class="guided">
  <header class="header">
    <div>
      <h2>Guided Generation</h2>
      <p>Generate a batch and review the model's top-ranked results.</p>
    </div>
    <div class="actions">
      <button class="primary" on:click={generateBatch} disabled={loading}>
        {loading ? "Scoring..." : scored.length ? "Regenerate" : "Generate"}
      </button>
      <button class="secondary" on:click={toggleFeedback} disabled={scored.length < 2}>
        {feedbackActive ? "Hide Pairwise Feedback" : "Give Pairwise Feedback"}
      </button>
    </div>
  </header>

  {#if scored.length}
    <div class="grid">
      {#each scored as item, i}
        <button class="card" class:selected={selectedIndex === i} on:click={() => selectFinal(i)}>
          {#key item.coa}
            <COA coa={item.coa} i={`guided-${i}`} width={COA_SIZE} height={COA_SIZE} />
          {/key}
          <div class="score">Score: {item.score.toFixed(3)}</div>
          {#if selectedIndex === i}
            <div class="chosen-label">Selected</div>
          {/if}
        </button>
      {/each}
    </div>
  {:else}
    <p class="empty">Click "Generate" to score a new batch of coats of arms.</p>
  {/if}

  {#if feedbackActive}
    <section class="feedback">
      <div class="feedback-header">
        <div>
          <h3>Pairwise Feedback</h3>
          <p>Keep refining the model by choosing between two top picks.</p>
        </div>
        <button class="secondary" on:click={pickFeedbackPair} disabled={scored.length < 2 || feedbackSubmitting}>
          New Pair
        </button>
      </div>

      {#if feedbackPair.length === 2}
        <div class="feedback-pair">
          {#each feedbackPair as item, index}
            <button class="feedback-choice" on:click={() => chooseFeedback(index)} disabled={feedbackSubmitting}>
              {#key item.coa}
                <COA coa={item.coa} i={`feedback-${index}`} width={FEEDBACK_SIZE} height={FEEDBACK_SIZE} />
              {/key}
              <span class="label">{index === 0 ? "Option A" : "Option B"}</span>
            </button>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
</main>

<style>
  .guided {
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

  .card {
    display: flex;
    flex-direction: column;
    gap: 6px;
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

  .card.selected {
    border-color: #3ddc84;
    box-shadow: 0 0 0 1px #3ddc84;
  }

  .score {
    color: #b8b8b8;
    font-size: 0.85em;
  }

  .chosen-label {
    color: #3ddc84;
    font-size: 0.8em;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .empty {
    color: #b8b8b8;
  }

  .feedback {
    margin-top: 24px;
    padding: 16px;
    border-radius: 10px;
    border: 1px solid #2d2d2d;
    background: #00000045;
  }

  .feedback-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .feedback-header h3 {
    margin: 0;
    font-size: 1.05em;
  }

  .feedback-header p {
    margin: 4px 0 0;
    color: #b8b8b8;
    font-size: 0.9em;
  }

  .feedback-pair {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  .feedback-choice {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    border: 2px solid transparent;
    background: #00000050;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  .feedback-choice:hover {
    border-color: #5a5a5a;
    transform: translateY(-2px);
  }

  .feedback-choice:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .label {
    color: #c9c9c9;
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  button.primary,
  button.secondary {
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