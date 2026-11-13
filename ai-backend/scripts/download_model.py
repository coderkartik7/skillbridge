import os
from fastembed import TextEmbedding

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(BASE_DIR, "../.model_cache")


def download():
    print(f"Pre-downloading model '{MODEL_NAME}' into {CACHE_DIR}...")
    os.makedirs(CACHE_DIR, exist_ok=True)
    model = TextEmbedding(model_name=MODEL_NAME, cache_dir=CACHE_DIR, threads=1)
    # Warm up with a single inference so weights & tokenizer are fully downloaded
    list(model.embed(["warmup"]))
    print("Model pre-download complete.")


if __name__ == "__main__":
    download()

