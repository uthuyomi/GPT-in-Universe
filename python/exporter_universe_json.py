# ==============================================================
# 🌌 exporter_universe_json.py
# AI Meaning Universe — Three.js用データ出力モジュール
# ==============================================================

import json
import numpy as np


def export_universe_json(
    outfile: str,
    points3d: np.ndarray,
    labels: np.ndarray,
    df,
    cluster_terms,
    questions,
):
    """
    points3d: (N, 3) 位置情報 (PCA結果)
    labels: 各点のクラスタID
    df: DataFrame（Question, Output含む）
    cluster_terms: 各クラスタ代表語（上位語5個程度）
    questions: 入力質問リスト
    """

    data = []
    for i in range(len(df)):
        qid = int(df.iloc[i]["QID"]) if "QID" in df.columns else 0
        q = df.iloc[i]["Question"]
        o = df.iloc[i]["Output"]
        x, y, z = points3d[i]
        cluster = int(labels[i])

        data.append({
            "id": i,
            "question": q,
            "output": o,
            "cluster": cluster,
            "qid": qid,
            "pos": [float(x), float(y), float(z)]
        })

    clusters_meta = [
        {"id": i, "terms": cluster_terms[i]}
        for i in range(len(cluster_terms))
    ]

    payload = {
        "meta": {
            "total_points": len(df),
            "num_clusters": len(cluster_terms),
            "questions": questions,
        },
        "clusters": clusters_meta,
        "points": data
    }

    with open(outfile, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(f"💾 Universe JSON Exported: {outfile}")
