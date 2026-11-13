import os
import json
import pandas as pd
import numpy as np
from fastembed import TextEmbedding

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
BATCH_SIZE = 32

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OCCUPATIONS_CSV = os.path.join(BASE_DIR, "../data/processed/occupations.csv")
PROCESSED_DIR = os.path.join(BASE_DIR, "../data/processed")
EMBEDDINGS_FILE = os.path.join(PROCESSED_DIR, "occupation_embeddings.npy")
META_FILE = os.path.join(PROCESSED_DIR, "occupation_embeddings.meta.json")
CACHE_DIR = os.path.join(BASE_DIR, "../.model_cache")


def build_embeddings():
    print(f"Reading occupations from {OCCUPATIONS_CSV}...")
    df = pd.read_csv(OCCUPATIONS_CSV, usecols=["occupation_code", "title", "description"])
    occ_texts = (df["title"].fillna("") + ". " + df["description"].fillna("")).tolist()
    row_count = len(occ_texts)
    print(f"Loaded {row_count} occupations.")

    print(f"Initializing TextEmbedding with model '{MODEL_NAME}'...")
    model = TextEmbedding(model_name=MODEL_NAME, cache_dir=CACHE_DIR, threads=1)

    print("Encoding occupations...")
    raw_embeddings = list(model.embed(occ_texts, batch_size=BATCH_SIZE))
    embeddings = np.array(raw_embeddings, dtype=np.float32)

    # L2 normalize
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    embeddings = (embeddings / norms).astype(np.float32)

    dim = int(embeddings.shape[1])
    print(f"Generated embeddings with shape {embeddings.shape}.")

    os.makedirs(PROCESSED_DIR, exist_ok=True)
    np.save(EMBEDDINGS_FILE, embeddings)
    print(f"Saved embeddings to {EMBEDDINGS_FILE}.")

    meta = {
        "model_name": MODEL_NAME,
        "row_count": row_count,
        "dim": dim,
    }
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print(f"Saved metadata to {META_FILE}.")


if __name__ == "__main__":
    build_embeddings()

