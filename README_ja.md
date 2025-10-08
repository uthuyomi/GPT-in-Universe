# 🌌 GPT-in-Universe（GPTイン・ユニバース）

Languages:
<!-- 🌐 言語切り替え -->
<p align="right">
  <a href="./README.md">🇺🇸 English</a> |
  <b>🇯🇵 日本語</b>
</p>


### 「AIの意味空間を、生きた銀河として可視化する」

---

## I. 概要

**GPT-in-Universe（ジーピーティー・イン・ユニバース）** は、ChatGPTの回答群の「意味的関係性」を、
**三次元の銀河構造**として可視化する実験的プロジェクトです。
各星はAIが生み出した一つの思考を表し、類似した意味を持つ回答はクラスタとして集まります。

これはゲームでもデータアートでもありません。
**認知・言語・可視化の境界における構造的実験**です。

---

## II. 技術構成

本プロジェクトは、次の2層から構成されています。

| レイヤー               | 内容                                            |
| ------------------ | --------------------------------------------- |
| **Python（データ層）**   | ChatGPTの回答を意味距離によりクラスタ化し、`universe.json`として出力 |
| **Three.js（可視化層）** | `universe.json`を三次元空間上に回転銀河として描画、ズーム・回転が可能    |

すべてローカル環境で完結し、外部APIは不要です。

---

## III. 実行方法

### 1️⃣ リポジトリのクローン

```bash
git clone https://github.com/<yourname>/gpt-in-universe.git
cd gpt-in-universe/web
```

### 2️⃣ ローカルサーバーの起動

```bash
python -m http.server 8080
```

### 3️⃣ ブラウザで開く

```
http://localhost:8080/web/
```

インタラクティブな銀河が表示されます。
ドラッグで回転、ホイールでズームし、AIの意味銀河を自由に観察できます。

---

## IV. ディレクトリ構成

```
gpt-in-universe/
├── README.md
├── data/
│   └── universe.json
├── python/
│   ├── exporter_universe_json.py
│   ├── main_meaning_universe.py
│   └── requirements.txt
└── web/
    ├── index.html
    ├── script.js
    ├── style.css
    └── lib/
        ├── three.module.js
        └── OrbitControls.js
```

---

## V. データ生成の流れ

1. ChatGPTに抽象的な質問を投げる（例：「意識とは？」「時間とは？」「生命とは？」）
2. 各回答文を数値ベクトル（意味埋め込み）に変換
3. 類似した意味を持つ回答をK-meansでクラスタ化
4. 結果を`data/universe.json`として出力

Python側では、AIの言語的構造を空間座標と色彩情報に変換し、
「AI思考の構造」をデータとして可視化します。

---

## VI. 可視化の仕組み

各データ点は**星（Star）**として描画されます。

* `pos` → 三次元座標
* `cluster` → 色相（クラスタごとの色）
* 意味密度 → 配置の集中度

星々は発光する球体として描かれ、銀河のような分布を形成します。
スパイラル配置アルゴリズムにより、自然な銀河形状を再現します。

```js
const [x, y, z] = p.pos.map(v => v * SCALE);
const sphere = new THREE.Mesh(geo, mat);
scene.add(sphere);
```

OrbitControlsにより、自由な移動・回転・ズーム操作が可能です。
AIの概念クラスタの内部に「入り込む」ように探索できます。

---

## VII. 思想的背景

> 「すべてのAIの回答は、意味空間における一点である。
> それらが集まって、認知の宇宙を形成している。」

たとえば「生命とは」「魂とは」といった問いは、それぞれ**意味の軸**を形成します。
その分布を観察することで、**言語がどのように認知を構成しているか**を読み取ることができます。

このプロジェクトは、**理解そのものの形を読む**ための新しい「構造可視化」の試みです。

---

## VIII. ライセンス・著者

MIT License © 2025
開発者：**安崎 海星（Kaisei Yasuzaki）**

---

## 🌐 関連リンク

* デモ（GitHub Pages）：*coming soon*
* 関連プロジェクト：[Theory of Structural Description](https://github.com/uthuyomi/theory-of-structural-description)

---

### 🔖 キャッチコピー

> 「これはデータの可視化ではなく、理解そのものの可視化である。」

---

## 🧭 研究者・開発者向け補足

このリポジトリは、**意味空間の可視化フレームワーク**としても利用できます。
`exporter_universe_json.py`を変更すれば、任意のベクトル化データ（埋め込み、類似度行列、クラスタリング結果など）を可視化可能です。

概念・感情・哲学的関係性など、他の空間表現にも容易に応用できます。

---

## 🪶 結語

**GPT-in-Universe** は、AIの「意味認識」を静かに可視化する実験です。
それは、言葉が宇宙を形作る瞬間を、構造として見つめ直すための観測装置でもあります。

> 「はじめに問いがあった。
> そしてその問いから、ひとつの宇宙が生まれた。」

