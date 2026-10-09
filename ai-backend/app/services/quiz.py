import os, json, time, uuid, random
from google import genai

MODEL = "gemini-3.5-flash"
LEVELS = {"easy", "medium", "hard"}
QUIZ_TTL = 2 * 3600
_QUIZZES = {}        # quiz_id -> {"answers", "meta", "ts"}  (answer key never leaves the server)

PROMPT = """Write {n} multiple-choice questions to test a learner on the skill "{skill}".
Cover these topics, spread the questions across them: {topics}
Difficulty: {level}. (easy = definitions and basics, medium = applying concepts, hard = debugging and trade-offs.)
Rules: exactly 4 options per question, exactly one correct, plausible wrong options, no "all of the above".
Each question must name which topic it covers using one of the topic names above exactly.
Return only JSON: [{{"topic": "...", "question": "...", "options": ["...","...","...","..."], "correct": 0, "explanation": "one sentence"}}]"""


def _valid(q, topics):
    return (isinstance(q.get("options"), list) and len(q["options"]) == 4
            and len(set(q["options"])) == 4
            and isinstance(q.get("correct"), int) and 0 <= q["correct"] < 4
            and q.get("question") and q.get("topic") in topics)


def create_quiz(skill, topics, level="easy", n=5):
    if level not in LEVELS:
        level = "easy"
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    r = client.models.generate_content(
        model=MODEL, contents=PROMPT.format(n=n, skill=skill, topics=topics, level=level),
        config={"response_mime_type": "application/json"})
    raw = [q for q in json.loads(r.text) if _valid(q, topics)][:n]
    if not raw:
        raise ValueError("Could not generate a valid quiz.")

    now = time.time()
    for k in [k for k, v in _QUIZZES.items() if now - v["ts"] > QUIZ_TTL]:
        del _QUIZZES[k]                                  # drop expired quizzes

    questions, answers = [], []
    for i, q in enumerate(raw):
        correct_text = q["options"][q["correct"]]
        options = q["options"][:]
        random.shuffle(options)                          # Gemini tends to favour option A
        questions.append({"id": i, "topic": q["topic"], "question": q["question"], "options": options})
        answers.append({"correct": options.index(correct_text), "topic": q["topic"],
                        "explanation": q.get("explanation", "")})

    quiz_id = uuid.uuid4().hex
    _QUIZZES[quiz_id] = {"answers": answers, "meta": {"skill": skill, "level": level}, "ts": now}
    return {"quiz_id": quiz_id, "skill": skill, "level": level, "questions": questions}


def grade_quiz(quiz_id, chosen):
    quiz = _QUIZZES.get(quiz_id)
    if not quiz:
        raise KeyError("Quiz expired or not found.")
    answers = quiz["answers"]
    review, per_topic = [], {}
    for i, a in enumerate(answers):
        pick = chosen.get(str(i))
        ok = pick == a["correct"]
        review.append({"id": i, "topic": a["topic"], "correct": ok,
                       "correct_index": a["correct"], "your_index": pick,
                       "explanation": a["explanation"]})
        t = per_topic.setdefault(a["topic"], {"right": 0, "total": 0})
        t["total"] += 1
        t["right"] += int(ok)

    score = sum(r["correct"] for r in review)
    percent = round(100 * score / len(answers))
    weak = [t for t, v in per_topic.items() if v["right"] < v["total"]]
    strong = [t for t, v in per_topic.items() if v["right"] == v["total"]]
    return {"score": score, "total": len(answers), "percent": percent,
            "level": quiz["meta"]["level"], "skill": quiz["meta"]["skill"],
            "strong_topics": strong, "weak_topics": weak, "review": review,
            "summary": _summary(quiz["meta"]["skill"], percent, strong, weak)}


def _summary(skill, percent, strong, weak):
    if not weak:
        return f"Excellent: you answered every {skill} question correctly. Try the next difficulty level."
    text = f"You scored {percent}% on {skill}. "
    if strong:
        text += f"You are solid on {', '.join(strong)}. "
    return text + f"Revisit {', '.join(weak)} before retaking the quiz."