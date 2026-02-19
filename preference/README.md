# Armoria Preference Learning System

A human-preference model that helps you pick your ideal coat of arms. The system uses a three-phase workflow: grid selection, pairwise comparison with active learning, and model-guided generation via rejection sampling.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Armoria Svelte  │────▶│  Preference API   │────▶│  Reward Model   │
│  Frontend        │     │  (FastAPI, 8080)  │     │  (GBC + feature │
│  (Svelte 3)      │◀────│                   │◀────│   extraction)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

- **Frontend**: Svelte 3 components integrated into Armoria's existing UI
- **Backend**: FastAPI server handling preference storage, model training, scoring, and active learning
- **Model**: Gradient Boosted Classifier trained on pairwise feature differences
- **Storage**: JSON file (`preference_data.json`) for easy inspection and portability

## Setup

### 1. Install Python dependencies

```bash
cd armoria/preference
pip install -r requirements.txt
```

### 2. Start the backend

```bash
cd armoria
python -m uvicorn preference.server:app --reload --port 8787 --host 0.0.0.0
```

#### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PREFERENCE_CORS_ORIGINS` | `http://localhost:5000` | Comma-separated list of allowed CORS origins |
| `PREFERENCE_HOST` | `0.0.0.0` | Server bind host |
| `PREFERENCE_PORT` | `8787` | Server bind port |

Example with custom CORS:

```bash
PREFERENCE_CORS_ORIGINS='http://localhost:5000,http://localhost:8080' \
  python -m uvicorn preference.server:app --reload --port 8787 --host 0.0.0.0
```

### 3. Start the frontend

```bash
cd armoria
npm install
npm run dev
```

The frontend runs on `http://localhost:5000` by default (or pass `PORT=8080 npm run dev`).

### 4. Enter Preference Mode

Click the **"Preference Mode"** button in the top-right corner of the Armoria header.

## Three-Phase Workflow

### Phase 1: Grid Selection

- A grid of 20 randomly generated coats of arms is displayed
- Click on any coat of arms to select it as a favourite (green border)
- Click **"Submit & Next Round"** to record your preferences and get a new batch
- Repeat for several rounds (recommended: 5-10 rounds, ~100-200 preferences)
- Click **"Finish Phase 1"** to auto-train the model and proceed

### Phase 2: Pairwise Comparison

- Two coats of arms are shown side by side
- Click the one you prefer
- If the model is trained, active learning selects the most informative pairs
- Otherwise, pairs are random
- Repeat for 50-200 comparisons to refine the model
- Click **"Finish Phase 2"** to auto-retrain and proceed

### Phase 3: Guided Generation

- Click **"Generate"** to create 200 random coats of arms, score them with the model, and display the top 20
- Each coat of arms shows its preference score
- Click one to select it as your final choice
- Use **"Give Pairwise Feedback"** to continue refining the model on the top picks
- Click **"Regenerate"** to run another batch

### Training the Model

- The model auto-trains when transitioning between phases
- You can also click **"Train Model"** at any time from the toolbar
- Stats (preference count, model accuracy, training samples) are shown in the dashboard

### Favorites

- Click the **"Favorites"** tab to review all designs you liked
- **Grid Selections**: Coats of arms you selected as favourites during grid rounds
- **Pairwise Winners**: Coats of arms you chose in head-to-head comparisons
- Click any coat of arms to copy its JSON to clipboard

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/preferences/grid` | Submit grid selection preferences |
| POST | `/api/preferences/pairwise` | Submit a pairwise comparison |
| POST | `/api/train` | Train/retrain the model |
| POST | `/api/score` | Score a batch of COAs |
| POST | `/api/suggest-pair` | Get the most uncertain pair (active learning) |
| GET | `/api/stats` | Get preference and model statistics |
| POST | `/api/reset` | Clear all preferences and reset the model |
| GET | `/api/favorites` | Get liked COAs grouped by source (grid selections and pairwise winners) |

## Feature Extraction

The model extracts ~68 structured features from each COA JSON:

- **Tincture encoding**: One-hot encoding of field and charge tinctures (argent, or, gules, sable, azure, vert, purpure, murrey, sanguine, tenné)
- **Pattern detection**: Whether the field uses a heraldic pattern (ermine, vair, etc.)
- **Division encoding**: One-hot encoding of division types (per pale, per fess, etc.)
- **Ordinary encoding**: One-hot encoding of ordinary types (fess, pale, chevron, etc.)
- **Charge features**: Charge count, charge tincture encoding
- **Complexity metric**: Combined measure of charges, ordinaries, divisions, and patterns

## Data Storage

Preferences are stored in `preference_data.json` in this directory. To start fresh, either delete the file or use the `/api/reset` endpoint.