import numpy as np
from app.services.embeddings import encode_text, occ_embeddings, oc_df, cosine_similarity


def match_occupation(res_text: str | None):
    resume_emb = encode_text(res_text)
    scores = cosine_similarity(resume_emb, occ_embeddings)
    top5_indices = np.argsort(scores)[::-1][:5]

    top_job = []
    for idx in top5_indices:
        idx_int = int(idx)
        top_job.append([
            oc_df.iloc[idx_int]["occupation_code"],
            oc_df.iloc[idx_int]["title"],
            float(scores[idx_int]),
        ])
    return top_job
