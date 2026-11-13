import os
import json
import logging
import numpy as np
import pandas as pd
from fastembed import TextEmbedding

logger = logging.getLogger(__name__)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "../../data/processed")
OCCUPATIONS_CSV = os.path.join(DATA_DIR, "occupations.csv")
EMBEDDINGS_FILE = os.path.join(DATA_DIR, "occupation_embeddings.npy")
META_FILE = os.path.join(DATA_DIR, "occupation_embeddings.meta.json")
CACHE_DIR = os.path.join(BASE_DIR, "../../.model_cache")

# Load only necessary columns from occupations.csv
oc_df = pd.read_csv(OCCUPATIONS_CSV, usecols=["occupation_code", "title", "description"])

# Global singleton for FastEmbed model
_model_instance = None


def get_model() -> TextEmbedding:
    global _model_instance
    if _model_instance is None:
        _model_instance = TextEmbedding(
            model_name=MODEL_NAME,
            cache_dir=CACHE_DIR,
            threads=1,
            enable_cpu_mem_arena=False,
        )
    return _model_instance


def encode_many(texts: list[str], batch_size: int = 32) -> np.ndarray:
    """Encode a list of texts into L2-normalized float32 embeddings of shape (n, dim)."""
    if not texts:
        return np.empty((0, 384), dtype=np.float32)
    m = get_model()
    raw = list(m.embed(texts, batch_size=batch_size))
    arr = np.array(raw, dtype=np.float32)
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return (arr / norms).astype(np.float32)


def encode_text(text: str | None) -> np.ndarray:
    """Encode a single text into an L2-normalized float32 embedding of shape (dim,)."""
    if not text or not str(text).strip():
        return np.zeros(384, dtype=np.float32)
    m = get_model()
    raw = list(m.embed([str(text)]))[0]
    arr = np.array(raw, dtype=np.float32)
    norm = np.linalg.norm(arr)
    if norm > 0:
        arr = arr / norm
    return arr.astype(np.float32)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """
    Compute cosine similarity by normalizing rows and taking matrix dot product.
    Supports 1D vs 2D, 2D vs 2D, etc.
    """
    a = np.asarray(a, dtype=np.float32)
    b = np.asarray(b, dtype=np.float32)

    a_1d = a.ndim == 1
    b_1d = b.ndim == 1

    if a_1d:
        a = a.reshape(1, -1)
    if b_1d:
        b = b.reshape(1, -1)

    a_norm = np.linalg.norm(a, axis=1, keepdims=True)
    a_norm[a_norm == 0] = 1.0
    a_normed = a / a_norm

    b_norm = np.linalg.norm(b, axis=1, keepdims=True)
    b_norm[b_norm == 0] = 1.0
    b_normed = b / b_norm

    sims = np.dot(a_normed, b_normed.T)

    if a_1d and b_1d:
        return float(sims[0, 0])
    if a_1d:
        return sims[0]
    if b_1d:
        return sims[:, 0]
    return sims


class ModelHelper:
    """Encoder helper maintaining backward compatibility with SentenceTransformer interface."""
    def encode(self, texts, batch_size: int = 32, **kwargs) -> np.ndarray:
        if isinstance(texts, str):
            return encode_text(texts)
        return encode_many(list(texts), batch_size=batch_size)


model = ModelHelper()


def _load_or_compute_embeddings() -> np.ndarray:
    row_count = len(oc_df)
    if os.path.exists(EMBEDDINGS_FILE) and os.path.exists(META_FILE):
        try:
            with open(META_FILE, "r", encoding="utf-8") as f:
                meta = json.load(f)
            if (
                meta.get("model_name") == MODEL_NAME
                and meta.get("row_count") == row_count
                and meta.get("dim") == 384
            ):
                emb = np.load(EMBEDDINGS_FILE)
                if emb.shape == (row_count, 384):
                    return emb.astype(np.float32)
        except Exception as e:
            logger.warning(f"Failed to read existing occupation embeddings: {e}")

    logger.warning("Occupation embeddings missing or mismatched; recomputing once (this is slow)...")
    occ_texts = (oc_df["title"].fillna("") + ". " + oc_df["description"].fillna("")).tolist()
    emb = encode_many(occ_texts, batch_size=32)
    os.makedirs(DATA_DIR, exist_ok=True)
    np.save(EMBEDDINGS_FILE, emb)
    meta = {
        "model_name": MODEL_NAME,
        "row_count": row_count,
        "dim": int(emb.shape[1]),
    }
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    return emb


# Load occupation embeddings from disk at module load time (fast load, no inference)
occ_embeddings = _load_or_compute_embeddings()
