# ==============================================================
# 🌌 AI Meaning Universe — main_meaning_universe.py
# 日本語の複数質問 → 回答群生成 → TF-IDF → PCA(3D) → KMeans
# → universe.json（Three.js用）とCSVを出力
# 依存: openai, pandas, numpy, scikit-learn, matplotlib(任意), tqdm
# ==============================================================

import os
import re
import json
from dataclasses import dataclass
from typing import List, Tuple

import numpy as np
import pandas as pd
from tqdm import tqdm

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans

# --- 日本語フォント対策（任意） ---
try:
    import matplotlib.pyplot as plt  # 解析デバッグで使うなら
    import matplotlib.font_manager as fm
    if os.name == "nt":
        FONT_PATH = "C:/Windows/Fonts/msgothic.ttc"  # 必要に応じて変更
        if os.path.exists(FONT_PATH):
            plt.rcParams["font.family"] = fm.FontProperties(fname=FONT_PATH).get_name()
            plt.rcParams["axes.unicode_minus"] = False
    try:
        import japanize_matplotlib  # noqa: F401
    except Exception:
        pass
except Exception:
    pass

# --- OpenAI SDK ---
from openai import OpenAI
client = OpenAI(api_key="")  # 環境変数 OPENAI_API_KEY が必要

# --- JSONエクスポート関数 ---
# 同ディレクトリまたはパスを通した上で読み込み
from exporter_universe_json import export_universe_json


# ==========================
# 設定
# ==========================
MODEL = "gpt-4o"

# ★ここを編集：質問リスト／サンプル数
QUESTIONS: List[str] = [
    "人間とは何か？30文字以内で答えてください。",
    "魂とは何か？30文字以内で答えてください。",
    "AIとは何か？30文字以内で答えてください。",
    "生命とは何か？30文字以内で答えてください。",
    "意識とは何か？30文字以内で答えてください。",
    "時間とは何か？30文字以内で答えてください。",
    "宇宙とは何か？30文字以内で答えてください。"
]

NUM_SAMPLES_PER_QUESTION = 15   # フルスケールなら 20〜50 推奨
NUM_CLUSTERS = None             # 自動推定（固定なら整数）

# 出力先（プロジェクトルートから見た相対パスを想定）
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
CSV_OUT = os.path.join(DATA_DIR, "ai_universe_dataset.csv")
JSON_OUT = os.path.join(DATA_DIR, "universe.json")

# 乱数固定（再現性）
RANDOM_STATE = 42


# ==========================
# データ収集
# ==========================
def generate_answers(questions: List[str], n_per_q: int) -> pd.DataFrame:
    rows = []
    for qi, q in enumerate(questions):
        print(f"🔹 問い {qi+1}/{len(questions)}: '{q}' を {n_per_q} 回生成…")
        for _ in tqdm(range(n_per_q)):
            res = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": q}],
            )
            text = res.choices[0].message.content.strip().replace("\n", " ")
            rows.append({"QID": qi, "Question": q, "Output": text})
    df = pd.DataFrame(rows)
    return df


# ==========================
# 前処理・ベクトル化・次元削減・クラスタ
# ==========================
def vectorize_and_reduce(outputs: pd.Series) -> Tuple[TfidfVectorizer, np.ndarray, np.ndarray]:
    """TF-IDFベクトル化し、PCAで3次元に還元。"""
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(outputs)
    pca = PCA(n_components=3, random_state=RANDOM_STATE)
    pts3 = pca.fit_transform(X.toarray())
    return vectorizer, X, pts3


def auto_k(n_points: int) -> int:
    """点数からラフにクラスタ数を推定。"""
    # ざっくり：15点につき1クラスタ、6〜16の範囲にクリップ
    k = int(np.clip(np.round(n_points / 15), 6, 16))
    return k


def cluster_points(X, num_clusters: int | None) -> Tuple[KMeans, np.ndarray]:
    if num_clusters is None:
        k = auto_k(X.shape[0])
    else:
        k = int(num_clusters)
    kmeans = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init="auto")
    labels = kmeans.fit_predict(X)
    return kmeans, labels


def cluster_top_terms(vectorizer: TfidfVectorizer, kmeans: KMeans, topn: int = 5) -> List[str]:
    """各クラスタの上位語を‘・’で連結して返す。"""
    terms = np.array(vectorizer.get_feature_names_out())
    order = kmeans.cluster_centers_.argsort()[:, ::-1]
    out = []
    for i in range(order.shape[0]):
        top = terms[order[i, :topn]]
        out.append("・".join(top))
    return out


# ==========================
# 要約（全体）
# ==========================
def summarize_all(df: pd.DataFrame, lang: str = "ja") -> str:
    joined = "\n".join(df["Output"].tolist())

    if lang == "ja":
        prompt = f"""
次のAIの回答群は、複数の哲学的問い（例：{ '、'.join(QUESTIONS[:3]) } …）に対するものです。
この集合から、AIがそれらの概念をどのように理解しているかを
①共通点 ②相違点 ③分布傾向（どの方向に解釈が寄るか）
の3項目で、平易な日本語で要約してください。
【回答群】
{joined}
"""
    else:
        prompt = f"""
These are AI-generated answers to multiple philosophical questions
(e.g., {"; ".join(QUESTIONS[:3])} …).
Please summarize how the AI seems to understand these concepts in three parts:
(1) Common points, (2) Differences, and (3) Overall tendencies of interpretation.
Use simple, clear English.
[Outputs]
{joined}
"""
    res = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    return res.choices[0].message.content.strip()


# ==========================
# メイン
# ==========================
def main():
    os.makedirs(DATA_DIR, exist_ok=True)

    # 1) 収集
    df = generate_answers(QUESTIONS, NUM_SAMPLES_PER_QUESTION)
    df.to_csv(CSV_OUT, index=False, encoding="utf-8-sig")
    print(f"💾 CSV: {CSV_OUT}")

    # 2) ベクトル化＋PCA(3D)
    vectorizer, X, pts3 = vectorize_and_reduce(df["Output"])

    # 3) クラスタリング
    kmeans, labels = cluster_points(X, NUM_CLUSTERS)
    df["Cluster"] = labels

    # 4) 代表語
    top_terms = cluster_top_terms(vectorizer, kmeans, topn=5)
    print("🧠 各クラスタ代表語:")
    for i, t in enumerate(top_terms):
        print(f"  C{i}: {t}")

    # 5) 全体要約（任意／Three.jsには不要だがログとして）
    try:
        summary_ja = summarize_all(df, lang="ja")
        summary_en = summarize_all(df, lang="en")
        with open(os.path.join(DATA_DIR, "summary_ja.txt"), "w", encoding="utf-8") as f:
            f.write(summary_ja)
        with open(os.path.join(DATA_DIR, "summary_en.txt"), "w", encoding="utf-8") as f:
            f.write(summary_en)
        print("💾 summaries: summary_ja.txt / summary_en.txt")
    except Exception as e:
        print(f"要約はスキップ: {e}")

    # 6) Three.js用の universe.json を出力
    export_universe_json(
        outfile=JSON_OUT,
        points3d=pts3,
        labels=labels,
        df=df[["Question", "Output"]],
        cluster_terms=top_terms,
        questions=QUESTIONS
    )
    print(f"✅ 完了: {JSON_OUT}")


if __name__ == "__main__":
    main()
    
    
