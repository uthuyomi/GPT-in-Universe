// ====================================================
// 🌌 GPT-in-Universe Viewer (Babylon.js版・JSON追記対応)
// ====================================================

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color3(0, 0, 0);

// ====================================================
// 📷 Camera & Light
// ====================================================
const camera = new BABYLON.ArcRotateCamera(
  "camera",
  Math.PI / 2,
  Math.PI / 3,
  2500,
  BABYLON.Vector3.Zero(),
  scene
);
camera.attachControl(canvas, true);
camera.wheelPrecision = 20;
camera.minZ = 1;
new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// ====================================================
// 🎨 Color Palette
// ====================================================
const palette = [
  new BABYLON.Color3(1.0, 1.0, 1.0),
  new BABYLON.Color3(0.85, 0.9, 1.0),
  new BABYLON.Color3(0.8, 0.85, 1.0),
  new BABYLON.Color3(1.0, 0.95, 0.9),
];

// ====================================================
// 🧮 Parameters
// ====================================================
const params = {
  starCount: 2000,
  radius: 1500,
  depth: 600,
  arms: 6,
  twist: 5.0,
  pointSize: 10,
  emissive: 1.2,
  rotationSpeed: 0.0003,
  density: 0.25,
};

let pcs, material;

// ====================================================
// 🌌 ランダム銀河生成
// ====================================================
function createGalaxy() {
  if (pcs && pcs.mesh) pcs.mesh.dispose();

  pcs = new BABYLON.PointsCloudSystem(
    "stars",
    BABYLON.PointsCloudSystem.POINTMODE,
    scene
  );

  pcs.addPoints(params.starCount, (p, i) => {
    const armIndex = i % params.arms;
    const baseAngle = (armIndex / params.arms) * 2 * Math.PI;
    const radius = Math.pow(Math.random(), 0.8) * params.radius;
    const theta = baseAngle + (radius / params.radius) * params.twist * Math.PI;
    const phi = Math.random() * Math.PI * 2;

    const spread = params.density;
    const x =
      Math.cos(theta) * Math.sin(phi) * radius +
      (Math.random() - 0.5) * radius * spread * 0.1;
    const y =
      (Math.random() - 0.5) * params.depth * (1 - radius / params.radius);
    const z =
      Math.sin(theta) * Math.sin(phi) * radius +
      (Math.random() - 0.5) * radius * spread * 0.1;

    p.position = new BABYLON.Vector3(x, y, z);

    const t = radius / params.radius;
    const base = palette[Math.floor(Math.random() * palette.length)];
    p.color = new BABYLON.Color4(
      base.r * (1.0 - t * 0.15),
      base.g * (1.0 - t * 0.25),
      base.b * (1.0 - t * 0.45),
      1.0
    );
  });

  pcs.buildMeshAsync().then(() => {
    material = new BABYLON.PointsMaterial("pointsMat", scene);
    material.pointSize = params.pointSize;
    material.disableLighting = true;
    material.emissiveColor = new BABYLON.Color3(
      params.emissive,
      params.emissive,
      params.emissive
    );
    pcs.mesh.material = material;
    pcs.mesh.alwaysSelectAsActiveMesh = true;
    scene.addMesh(pcs.mesh);
    console.log("✅ ランダム銀河生成完了");
  });
}

// ====================================================
// 🪐 JSONデータを既存の銀河に追記
// ====================================================
function addGalaxyFromData(data) {
  if (!pcs) {
    console.warn(
      "⚠️ 既存の星が存在しません。createGalaxy() を先に呼んでください。"
    );
    return;
  }

  const SCALE = 3000;
  const colorMap = [
    new BABYLON.Color3(0.9, 0.9, 1.0),
    new BABYLON.Color3(1.0, 0.85, 0.85),
    new BABYLON.Color3(0.85, 1.0, 0.9),
    new BABYLON.Color3(0.95, 0.95, 1.0),
    new BABYLON.Color3(1.0, 0.9, 0.7),
    new BABYLON.Color3(0.7, 0.9, 1.0),
    new BABYLON.Color3(0.8, 0.8, 0.8),
  ];

  data.points.forEach((p) => {
    if (!p.pos || p.pos.length < 3) return;
    const [x, y, z] = p.pos.map((v) => v * SCALE);
    const clusterColor =
      colorMap[p.cluster % colorMap.length] || new BABYLON.Color3(1, 1, 1);

    pcs.addPoints(1, (pt) => {
      pt.position = new BABYLON.Vector3(x, y, z);
      pt.color = new BABYLON.Color4(
        clusterColor.r,
        clusterColor.g,
        clusterColor.b,
        1.0
      );
    });
  });

  pcs.buildMeshAsync().then(() => {
    pcs.mesh.material = material;
    scene.addMesh(pcs.mesh);
    console.log("✨ JSONデータの星を既存銀河に追記しました");
  });
}

// ====================================================
// JSONファイルを読み込み → 追記モードで適用
// ====================================================
fetch("../data/universe.json")
  .then((res) => {
    if (!res.ok) throw new Error("JSONなし → ランダム生成へ");
    return res.json();
  })
  .then((data) => {
    createGalaxy(); // まずランダム生成
    setTimeout(() => addGalaxyFromData(data), 500); // 少し遅延して追記
  })
  .catch(() => {
    console.warn("⚠️ universe.json が見つからないためランダム銀河のみ描画");
    createGalaxy();
  });

// ====================================================
// 🎛 dat.GUI Setup (日本語 + English)
// ====================================================
const gui = new dat.GUI({ width: 360 });
gui
  .add(params, "starCount", 500, 10000, 500)
  .name("星の数 / Star Count")
  .onChange(createGalaxy);
gui
  .add(params, "radius", 500, 3000, 100)
  .name("銀河の広がり / Radius")
  .onChange(createGalaxy);
gui
  .add(params, "depth", 100, 1200, 50)
  .name("厚み / Depth")
  .onChange(createGalaxy);
gui
  .add(params, "arms", 2, 12, 1)
  .name("腕の数 / Spiral Arms")
  .onChange(createGalaxy);
gui
  .add(params, "twist", 0, 10, 0.5)
  .name("渦のねじれ / Twist")
  .onChange(createGalaxy);
gui
  .add(params, "pointSize", 2, 20, 1)
  .name("星の大きさ / Point Size")
  .onChange(() => {
    if (material) material.pointSize = params.pointSize;
  });
gui
  .add(params, "emissive", 0.5, 2.0, 0.1)
  .name("明るさ / Brightness")
  .onChange(() => {
    if (material)
      material.emissiveColor = new BABYLON.Color3(
        params.emissive,
        params.emissive,
        params.emissive
      );
  });
gui
  .add(params, "rotationSpeed", 0, 0.002, 0.0001)
  .name("回転速度 / Rotation Speed");
gui
  .add(params, "density", 0.05, 0.6, 0.05)
  .name("密度 / Density")
  .onChange(createGalaxy);

// ====================================================
// ♻️ Animation Loop
// ====================================================
engine.runRenderLoop(() => {
  scene.render();
  if (pcs && pcs.mesh) {
    pcs.mesh.rotation.y += params.rotationSpeed;
    pcs.mesh.rotation.x += params.rotationSpeed / 3;
  }
});

window.addEventListener("resize", () => engine.resize());
