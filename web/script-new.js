// ================================================================
// 🌌 GPT-in-Universe Viewer (Three.js + OrbitControls)
// ChatGPT answer clusters visualized as a galaxy universe
// ================================================================
// 🌌 GPT-in-Universe ビューア（Three.js + OrbitControls）
// ChatGPTの回答群を銀河宇宙として可視化
// ================================================================

import * as THREE from "./lib/three.module.js";
import { OrbitControls } from "./lib/OrbitControls.js";

console.log("✅ Galaxy Universe (CDN test) active");

// ================================================================
// 🪐 Parameters / パラメータ設定
// ================================================================

// Number of small stars generated per data point
// データ点あたりの小星の生成数（多いほど密度が上がる）
const STAR_MULTIPLIER = 100;

// Number of spiral arms of the galaxy
// 銀河の腕（スパイラルアーム）の数
const GALAXY_ARMS = 100;

// Galaxy spread scale (radius)
// 銀河全体の広がり（半径スケール）
const GALAXY_SPREAD = 500;

// Depth factor for Z-axis dispersion (1=flat, 2+=3D)
// Z軸方向の散布係数（1=平面、2以上で立体感増加）
const Z_DEPTH_FACTOR = 2.0;

// Global rotation speed of the galaxy
// 銀河全体の回転速度（小さいほどゆっくり）
const ROTATION_SPEED = 0.0005;

// Star radius (visual size)
// 星の大きさ（見た目の半径）
const STAR_RADIUS = 6;

init();
loadUniverse();

// ================================================================
// 🎬 Initialization / 初期化処理
// ================================================================
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000010);

  // PerspectiveCamera(fov, aspect, near, far)
  // 視野角, アスペクト比, 手前の切り捨て距離, 奥の切り捨て距離
  camera = new THREE.PerspectiveCamera(
    120,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 0, 1500); // 初期位置

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // ✅ OrbitControls for camera movement
  // ✅ 視点操作用のOrbitControlsを追加
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 慣性付き操作 / Smooth motion
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.zoomSpeed = 1.0;
  controls.rotateSpeed = 0.6;
  controls.panSpeed = 0.6;
  controls.minDistance = 200;
  controls.maxDistance = 4000;
  controls.target.set(0, 0, 0);

  // Handle browser resize / リサイズ対応
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ================================================================
// 🌠 Galaxy position generator / 銀河座標生成
// ================================================================
function createGalaxyPosition(i, cluster) {
  // Each cluster slightly shifts the spiral pattern
  // 各クラスタでスパイラルパターンを少しずらす
  const armAngle =
    ((i + cluster * 137) % GALAXY_ARMS) * ((2 * Math.PI) / GALAXY_ARMS);
  const r = Math.pow(Math.random(), 0.55) * GALAXY_SPREAD;
  const theta = armAngle + r * 0.018 + Math.random() * 0.3;

  // Random Z depth for 3D volume
  // Z軸方向のランダムな奥行き
  const z = (Math.random() - 0.5) * (r * Z_DEPTH_FACTOR);
  const x = Math.cos(theta) * r + (Math.random() - 0.5) * 50;
  const y = Math.sin(theta) * r + (Math.random() - 0.5) * 50;

  return [x, y, z];
}

// ================================================================
// 📡 Load universe.json and render / JSONを読み込み描画
// ================================================================
async function loadUniverse() {
  try {
    // JSONデータを取得
    const res = await fetch("../data/universe.json"); // ← 相対パス注意
    const data = await res.json();

    // カラーパレット（クラスタごとに色分け）
    const palette = [
      0xff88ff, 0xaaffff, 0xffffaa, 0x99ffcc, 0xcc99ff, 0xff8888, 0x88aaff,
    ];

    // 星のジオメトリを再利用
    const geo = new THREE.SphereGeometry(STAR_RADIUS, 12, 12);

    // スケーリング係数（JSON内のposが小さい値なので拡大する）
    const SCALE = 800; // 数値を上げると広がる（例: 800〜1200推奨）

    // 各データ点を描画
    data.points.forEach((p, i) => {
      const clusterColor = new THREE.Color(palette[p.cluster % palette.length]);

      // posが存在するかチェック
      if (!p.pos || p.pos.length < 3) return;

      const [x, y, z] = p.pos.map((v) => v * SCALE);

      // 色の明るさをランダム調整
      const color = clusterColor.clone();
      color.multiplyScalar(0.8 + Math.random() * 0.2);

      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color.clone().multiplyScalar(0.8),
        emissiveIntensity: 1.5,
        metalness: 0.3,
        roughness: 0.5,
      });

      const sphere = new THREE.Mesh(geo, mat);
      sphere.position.set(x, y, z);
      scene.add(sphere);
    });

    // 照明設定
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const light = new THREE.PointLight(0xffffff, 3, 5000);
    light.position.set(0, 0, 0);
    scene.add(light);

    // 描画開始
    animate();
  } catch (err) {
    console.error("❌ universe.json の読み込みに失敗しました:", err);
  }
}

// ================================================================
// ♻️ Animation loop / アニメーションループ
// ================================================================
function animate() {
  requestAnimationFrame(animate);
  scene.rotation.y += ROTATION_SPEED; // 自動回転 / auto rotation
  controls.update(); // ユーザー操作反映 / update camera controls
  renderer.render(scene, camera);
}
