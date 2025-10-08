# 🌌 GPT-in-Universe

Languages:
<!-- 🌐 Language Switch -->
<p align="right">
  <b>🇺🇸 English</b> |
  <a href="./README_ja.md">🇯🇵 日本語</a>
</p>

### “Visualizing AI meaning space as a living galaxy.”

---

## I. Introduction

**GPT-in-Universe** is an experimental visualization project that transforms
the semantic relationships of ChatGPT’s answers into a **three-dimensional galaxy**.
Each star represents an AI-generated thought, and clusters form based on shared meaning.

It is not a game, not data art.
It is a **structural experiment** at the boundary of cognition, language, and visualization.

---

## II. Technical Overview

The project consists of two major layers:

| Layer                              | Description                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| **Python (Data Layer)**            | Clusters ChatGPT responses via semantic similarity, exports `universe.json`    |
| **Three.js (Visualization Layer)** | Renders the `universe.json` as a rotating 3D galaxy with zoom & orbit controls |

The entire process is local and self-contained — no external APIs are required.

---

## III. Setup & Usage

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<yourname>/gpt-in-universe.git
cd gpt-in-universe/web
```

### 2️⃣ Start a local web server

```bash
python -m http.server 8080
```

### 3️⃣ Open your browser

```
http://localhost:8080/web/
```

You’ll see an interactive galaxy.
Drag to rotate, scroll to zoom, orbit through the AI’s semantic cosmos.

---

## IV. Project Structure

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

## V. Data Generation Flow

1. Collect ChatGPT’s answers on abstract questions
   (“What is consciousness?”, “What is time?”, “What is life?”).
2. Encode each sentence as a numerical vector (semantic embedding).
3. Cluster similar meanings together using K-means.
4. Export results to `data/universe.json`.

The Python layer converts textual meaning into coordinates and color-coded clusters
that represent the structure of AI-generated cognition.

---

## VI. Visualization

Each data point becomes a **star**.

* Position (`pos`) → 3D coordinates
* Cluster ID → Color hue
* Semantic density → Spatial distribution

The points are rendered as luminous spheres arranged in a galactic formation.
A spiral distribution algorithm is used to create the galaxy structure.

```js
const [x, y, z] = p.pos.map(v => v * SCALE);
const sphere = new THREE.Mesh(geo, mat);
scene.add(sphere);
```

OrbitControls enables full navigation —
zoom in to enter the inner layers of the AI’s conceptual clusters.

---

## VII. Conceptual Background

> “Every AI answer is a point in meaning space.
> Together, they form a universe of cognition.”

Each question (e.g., “What is life?”, “What is soul?”) defines an **axis of meaning**.
By observing their distribution, we can sense **how language organizes cognition**.

This project proposes a new form of **structural visualization** —
not for entertainment, but for reading the *shape of understanding itself*.

---

## VIII. License / Author

MIT License © 2025
Developed by **Kaisei Yasuzaki**

---

## 🌐 Links

* Demo (GitHub Pages): *coming soon*
* Related Project: [Theory of Structural Description](https://github.com/uthuyomi/theory-of-structural-description)

---

### 🔖 Tagline

> “A visualization not of data — but of understanding itself.”

---

## 🧭 Note for Researchers

This repository can also serve as a **framework** for meaning-space visualization.
You can modify `exporter_universe_json.py` to map any kind of vectorized data —
embeddings, text similarity matrices, clustering models, or interpretability outputs.

The system can easily be adapted for other conceptual or emotional spaces.

---

## 🪶 Closing Note

GPT-in-Universe is both a visualization and a reflection —
a quiet experiment in mapping **how AI perceives meaning**.

> “In the beginning, there was a question —
> and from that question, a universe unfolded.”

