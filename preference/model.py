from __future__ import annotations

from typing import Dict, List, Optional, Tuple

import numpy as np
from joblib import dump, load
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler

from .features import extract_features, get_feature_names


class PreferenceModel:
    """Pairwise preference model based on a gradient boosted classifier."""

    def __init__(self) -> None:
        self.model: Optional[GradientBoostingClassifier] = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = get_feature_names()
        self.reference_features = np.zeros(len(self.feature_names), dtype=float)

    def _build_pairs(self, preferences: List[dict]) -> List[Tuple[dict, dict]]:
        pairwise: List[Tuple[dict, dict]] = []
        selected: List[dict] = []
        rejected: List[dict] = []

        for pref in preferences:
            pref_type = pref.get("type")
            if pref_type == "pairwise":
                winner = pref.get("winner")
                loser = pref.get("loser")
                if winner and loser:
                    pairwise.append((winner, loser))
            elif pref_type == "grid":
                coa = pref.get("coa")
                if not coa:
                    continue
                if pref.get("selected"):
                    selected.append(coa)
                else:
                    rejected.append(coa)

        if selected and rejected:
            for winner in selected:
                for loser in rejected:
                    pairwise.append((winner, loser))

        return pairwise

    def _compute_reference(self, preferences: List[dict]) -> np.ndarray:
        all_features: List[List[float]] = []
        for pref in preferences:
            pref_type = pref.get("type")
            if pref_type == "pairwise":
                if pref.get("winner"):
                    all_features.append(extract_features(pref["winner"]))
                if pref.get("loser"):
                    all_features.append(extract_features(pref["loser"]))
            elif pref_type == "grid" and pref.get("coa"):
                all_features.append(extract_features(pref["coa"]))

        if not all_features:
            return np.zeros(len(self.feature_names), dtype=float)

        return np.mean(np.array(all_features, dtype=float), axis=0)

    def fit(self, preferences: List[dict]) -> Dict[str, float]:
        """Train the model from collected preferences."""
        pairs = self._build_pairs(preferences)
        if not pairs:
            self.model = None
            self.is_trained = False
            return {"accuracy": 0.0, "n_samples": 0}

        X: List[np.ndarray] = []
        y: List[int] = []

        for winner, loser in pairs:
            winner_features = np.array(extract_features(winner), dtype=float)
            loser_features = np.array(extract_features(loser), dtype=float)
            diff = winner_features - loser_features

            X.append(diff)
            y.append(1)
            X.append(-diff)
            y.append(0)

        X_array = np.array(X, dtype=float)
        y_array = np.array(y, dtype=int)

        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X_array)

        self.model = GradientBoostingClassifier(random_state=42)
        self.model.fit(X_scaled, y_array)
        self.is_trained = True

        accuracy = float(self.model.score(X_scaled, y_array))
        self.reference_features = self._compute_reference(preferences)

        return {"accuracy": accuracy, "n_samples": int(len(y_array))}

    def score(self, coa: dict) -> float:
        """Return a preference score in [0, 1] for a single COA."""
        if not self.model or not self.is_trained:
            return 0.5

        features = np.array(extract_features(coa), dtype=float)
        diff = features - self.reference_features
        X_scaled = self.scaler.transform([diff])
        return float(self.model.predict_proba(X_scaled)[0][1])

    def score_batch(self, coas: List[dict]) -> List[float]:
        """Score a batch of COAs."""
        return [self.score(coa) for coa in coas]

    def get_uncertainty(self, coa1: dict, coa2: dict) -> float:
        """Return uncertainty for the comparison between two COAs."""
        if not self.model or not self.is_trained:
            return 0.5

        features1 = np.array(extract_features(coa1), dtype=float)
        features2 = np.array(extract_features(coa2), dtype=float)
        diff = features1 - features2
        X_scaled = self.scaler.transform([diff])
        proba = float(self.model.predict_proba(X_scaled)[0][1])
        return float(1.0 - abs(proba - 0.5) * 2.0)

    def save(self, path: str) -> None:
        """Persist the model to disk."""
        dump(
            {
                "model": self.model,
                "scaler": self.scaler,
                "is_trained": self.is_trained,
                "feature_names": self.feature_names,
                "reference_features": self.reference_features,
            },
            path,
        )

    def load(self, path: str) -> None:
        """Load the model from disk."""
        data = load(path)
        self.model = data.get("model")
        self.scaler = data.get("scaler", StandardScaler())
        self.is_trained = data.get("is_trained", False)
        self.feature_names = data.get("feature_names", get_feature_names())
        self.reference_features = data.get(
            "reference_features", np.zeros(len(self.feature_names), dtype=float)
        )

    def get_feature_importance(self) -> Dict[str, float]:
        """Return feature importance weights."""
        if not self.model or not self.is_trained:
            return {}

        importances = self.model.feature_importances_
        return {name: float(value) for name, value in zip(self.feature_names, importances)}