from sentence_transformers import util
from app.services.embeddings import encode_text, occ_embeddings, oc_df

def match_occupation(res_text : str | None):
    resume_emb = encode_text(res_text)
    scores = util.cos_sim(resume_emb, occ_embeddings)[0]
    top5 = scores.topk(5)

    top_job = []
    for score, idx in zip(top5.values, top5.indices):
        top_job.append([oc_df.iloc[int(idx)]['occupation_code'], oc_df.iloc[int(idx)]['title'], float(score)])
    return top_job