import os
import pandas as pd
import spacy
from spacy.matcher import PhraseMatcher
from spacy.tokens import Span
from spacy.util import filter_spans

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROC = os.path.join(BASE_DIR, "../../data/processed")

ALLOWED_TYPES = {"tech_specific", "software"}          # Layer 3: tech only
NOISE = {"science", "leadership", "speaking", "writing", "learning", "management",
         "mathematics", "judgment", "coordination", "negotiation", "persuasion"}

skills_df = pd.read_csv(os.path.join(PROC, "skills.csv"))
skills_df = skills_df[skills_df["skill_type"].isin(ALLOWED_TYPES)]
skills_df = skills_df.dropna(subset=["skill_name"])

# pattern -> canonical name
canon = {s.lower(): s.lower() for s in skills_df["skill_name"]}

alias_path = os.path.join(PROC, "aliases.csv")           # Layer 2: aliases
if os.path.exists(alias_path):
    al = pd.read_csv(alias_path)
    al = al.dropna(subset=["alias", "canonical"]) 
    canon.update({a.lower(): c.lower() for a, c in zip(al["alias"], al["canonical"])})

canon = {k: v for k, v in canon.items() if k not in NOISE}

nlp = spacy.blank("en")                                  # tokenizer only, fast
matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
for pattern in canon:
    matcher.add(pattern, [nlp.make_doc(pattern)])


def extract_skills(text: str | None):
    if not text:
        return set()
    doc = nlp.make_doc(text)
    spans = [Span(doc, s, e, label=mid) for mid, s, e in matcher(doc)]
    spans = filter_spans(spans)                          # keep longest: "react native" beats "react"
    return {canon[nlp.vocab.strings[sp.label]] for sp in spans}