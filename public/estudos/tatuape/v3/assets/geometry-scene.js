/**
 * Talma · cena GIS de exploração, isolada do painel e do estudo v2.
 * Primitivas e materialidade inspiradas no DsTerrainEnvelopeScene canônico.
 * Entrada: geometryData.featuresById[id].polygons[{outer,holes}], metros E/N.
 * Three: X=leste, Y=altura relativa, Z=−norte. Nenhum convex hull é calculado.
 * Apenas lote0003 é explorado; lote_faixa0004 nunca é desenhado.
 */
import * as THREE from '/estudos/tatuape/v3/assets/vendor/three.module.js';
import { OrbitControls } from '/estudos/tatuape/v3/assets/vendor/OrbitControls.js';

const COLORS = Object.freeze({
  background: '#f2f3ef', ground: '#e5e6de', lot: '#dddcd0',
  clay: '#905e4b', mass: '#b5826b', massAlt: '#aa7660',
  envelope: '#b48770', line: '#835640', white: '#fbfbf6',
  ink: '#343d36', secondary: '#777f74', grid: '#d5d9ce',
});
const ENVELOPE_HEIGHT_M = 28;
const FLOOR_HEIGHT_M = 3;
const num = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

/** Validation is deliberately geometric, never a certificate of buildability. */
export function openMetricRing(ring) {
  if (!Array.isArray(ring)) throw new Error('Anel ausente.');
  const points = ring.map((p) => {
    if (!Array.isArray(p) || p.length < 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) {
      throw new Error('Vértice métrico inválido.');
    }
    return [p[0], p[1]];
  });
  if (points.length > 1 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1]) points.pop();
  if (points.length < 3) throw new Error('Polígono sem três vértices.');
  let twiceArea = 0;
  points.forEach((p, i) => { const q = points[(i + 1) % points.length]; twiceArea += p[0] * q[1] - q[0] * p[1]; });
  if (Math.abs(twiceArea) < 1e-8) throw new Error('Polígono de área nula.');
  return points;
}

export function shapeForPolygon(polygon) {
  const outer = openMetricRing(polygon.outer);
  const shape = new THREE.Shape(outer.map(([east, north]) => new THREE.Vector2(east, north)));
  shape.closePath();
  for (const hole of polygon.holes ?? []) {
    const path = new THREE.Path(openMetricRing(hole).map(([east, north]) => new THREE.Vector2(east, north)));
    path.closePath();
    shape.holes.push(path);
  }
  return shape;
}

export function extrudeMetricPolygon(polygon, height) {
  if (!(Number.isFinite(height) && height > 0)) throw new Error('Altura inválida.');
  const geometry = new THREE.ExtrudeGeometry(shapeForPolygon(polygon), { depth: height, bevelEnabled: false, curveSegments: 1, steps: 1 });
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

export function validateGeometryData(data) {
  const features = data?.featuresById;
  if (!features || !features.lote_principal?.polygons?.length) throw new Error('Perímetro do lote0003 não disponível.');
  for (const id of ['lote_principal', 'envelope_5_3', 'envelope_5_todas']) {
    if (!features[id]?.polygons?.length) throw new Error(`Geometria necessária ausente: ${id}.`);
    features[id].polygons.forEach((polygon) => { openMetricRing(polygon.outer); (polygon.holes ?? []).forEach(openMetricRing); });
  }
  const massIds = Object.keys(features).filter((id) => /^volume_[abc]$/.test(id));
  massIds.forEach((id) => features[id].polygons.forEach((polygon) => { openMetricRing(polygon.outer); (polygon.holes ?? []).forEach(openMetricRing); }));
  if (!massIds.length) throw new Error('Geometrias das massas de estudo ausentes.');
  return { features, massIds };
}

function disposeTree(group) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  group.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : object.material ? [object.material] : []) {
      materials.add(material);
      if (material.map) textures.add(material.map);
    }
  });
  textures.forEach((texture) => texture.dispose());
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  group.clear();
}

function outline(polygon, y, color, opacity = 1) {
  const group = new THREE.Group();
  for (const ring of [polygon.outer, ...(polygon.holes ?? [])]) {
    const points = openMetricRing(ring);
    const geometry = new THREE.BufferGeometry().setFromPoints(points.map(([e, n]) => new THREE.Vector3(e, y, -n)));
    const line = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity, depthTest: true }));
    line.renderOrder = 6;
    group.add(line);
  }
  return group;
}

function labelSprite(text, scale, color = COLORS.ink) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;
  const fontSize = 36;
  context.font = `600 ${fontSize}px Inter, Arial, sans-serif`;
  const measured = context.measureText(text).width;
  canvas.width = Math.ceil(measured + 36);
  canvas.height = 68;
  context.font = `600 ${fontSize}px Inter, Arial, sans-serif`;
  context.fillStyle = 'rgba(252,251,247,.94)';
  context.beginPath();
  context.roundRect(1, 1, canvas.width - 2, canvas.height - 2, 10);
  context.fill();
  context.strokeStyle = 'rgba(90,75,61,.18)';
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false }));
  sprite.scale.set(scale * canvas.width / canvas.height, scale, 1);
  sprite.renderOrder = 20;
  return sprite;
}

function pathLength(points) {
  return points.slice(1).reduce((sum, point, i) => sum + Math.hypot(point[0] - points[i][0], point[1] - points[i][1]), 0);
}

function pathMiddle(points) {
  const half = pathLength(points) / 2;
  let distance = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], segment = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (distance + segment >= half) {
      const t = segment ? (half - distance) / segment : 0;
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    distance += segment;
  }
  return points[0];
}

export function initGeometryScene(root = document) {
  const host = root.getElementById('geometryScene');
  const status = root.getElementById('geoStatus');
  const dataElement = root.getElementById('geometryData');
  if (!host || !dataElement) return null;
  if (host.__talmaScene) return host.__talmaScene;
  const setStatus = (message) => { if (status) status.textContent = message; };
  const showFallback = (message) => {
    host.dataset.sceneState = 'unavailable';
    const fallback = document.createElement('p');
    fallback.className = 'geometry-fallback';
    fallback.setAttribute('role', 'status');
    fallback.textContent = message;
    Object.assign(fallback.style, { padding: '28px', maxWidth: '54ch', lineHeight: '1.6' });
    host.appendChild(fallback);
    setStatus(message);
  };
  let data, features, massIds;
  try {
    data = JSON.parse(dataElement.textContent);
    ({ features, massIds } = validateGeometryData(data));
  } catch (error) {
    showFallback(`Cena 3D indisponível: ${error.message} O estudo e o mapa permanecem disponíveis.`);
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', 'Modelo tridimensional exploratório do lote0003. Arraste para girar; use a roda para aproximar.');
  canvas.setAttribute('role', 'img');
  canvas.tabIndex = 0;
  Object.assign(canvas.style, { display: 'block', width: '100%', height: '100%', touchAction: 'none', outlineOffset: '-3px' });
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  } catch {
    showFallback('Visualização 3D indisponível neste navegador. As áreas, geometrias e premissas seguem no estudo.');
    return null;
  }
  host.appendChild(canvas);
  host.dataset.sceneState = 'ready';
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.background);
  const camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.1, 5000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.screenSpacePanning = true;
  controls.minZoom = 0.35;
  controls.maxZoom = 12;
  controls.minPolarAngle = 0.01;
  controls.maxPolarAngle = Math.PI / 2 - 0.012;
  controls.rotateSpeed = 0.62;
  controls.zoomSpeed = 0.82;
  controls.panSpeed = 0.8;

  const lotPoints = features.lote_principal.polygons.flatMap((polygon) => openMetricRing(polygon.outer));
  const minE = Math.min(...lotPoints.map((p) => p[0])), maxE = Math.max(...lotPoints.map((p) => p[0]));
  const minN = Math.min(...lotPoints.map((p) => p[1])), maxN = Math.max(...lotPoints.map((p) => p[1]));
  const center = new THREE.Vector3((minE + maxE) / 2, ENVELOPE_HEIGHT_M / 3, -(minN + maxN) / 2);
  const span = Math.max(maxE - minE, maxN - minN, 40);
  const groups = Object.fromEntries(['lot', 'envelope', 'masses', 'dimensions'].map((id) => [id, new THREE.Group()]));
  Object.entries(groups).forEach(([id, group]) => { group.name = id; scene.add(group); });
  scene.add(new THREE.HemisphereLight('#ffffff', '#c6c9bb', 2.7));
  const sun = new THREE.DirectionalLight('#fff8ed', 2.4);
  sun.position.set(center.x + span, span * 1.8, center.z + span * 0.5);
  scene.add(sun);
  const gridSize = Math.ceil(span * 2.4 / 10) * 10;
  const grid = new THREE.GridHelper(gridSize, Math.round(gridSize / 10), COLORS.grid, '#e0e3d9');
  grid.position.set(center.x, -0.06, center.z);
  grid.material.transparent = true;
  grid.material.opacity = 0.58;
  scene.add(grid);

  const elements = Object.fromEntries(['geoView', 'geoSetbacks', 'geoLevels', 'geoEnvelope', 'geoMasses', 'geoDimensions', 'geoLot', 'geoReset'].map((id) => [id, root.getElementById(id)]));
  let disposed = false, frame = 0, resizeFrame = 0;
  let levels = 8, envelopeId = 'envelope_5_3';
  let geometryInitialized = false;
  const listeners = [];
  function listen(target, event, fn) { if (target) { target.addEventListener(event, fn); listeners.push(() => target.removeEventListener(event, fn)); } }
  function render() {
    if (disposed || frame) return;
    frame = requestAnimationFrame(() => { frame = 0; if (!disposed) renderer.render(scene, camera); });
  }
  controls.addEventListener('change', render);

  function addLot() {
    for (const polygon of features.lote_principal.polygons) {
      const mesh = new THREE.Mesh(extrudeMetricPolygon(polygon, 0.035), new THREE.MeshStandardMaterial({ color: COLORS.lot, roughness: 0.94, metalness: 0 }));
      mesh.position.y = -0.035;
      groups.lot.add(mesh, outline(polygon, 0.03, COLORS.clay));
    }
  }

  function addEnvelope() {
    disposeTree(groups.envelope);
    for (const polygon of features[envelopeId].polygons) {
      const geometry = extrudeMetricPolygon(polygon, ENVELOPE_HEIGHT_M);
      const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: COLORS.envelope, opacity: 0.065, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      mesh.renderOrder = 3;
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 15), new THREE.LineBasicMaterial({ color: COLORS.clay, transparent: true, opacity: 0.6 }));
      edges.renderOrder = 5;
      groups.envelope.add(mesh, edges, outline(polygon, 0.10, COLORS.clay, 0.75));
    }
  }

  function addMasses() {
    disposeTree(groups.masses);
    massIds.forEach((id, index) => {
      const selectedFeature = features[`${id}_${envelopeId === 'envelope_5_todas' ? '5_todas' : '5_3'}`] ?? features[id];
      for (const polygon of selectedFeature.polygons) {
        const mesh = new THREE.Mesh(extrudeMetricPolygon(polygon, levels * FLOOR_HEIGHT_M), new THREE.MeshStandardMaterial({ color: index === 1 ? COLORS.massAlt : COLORS.mass, roughness: 0.78, metalness: 0.025 }));
        mesh.renderOrder = 1;
        groups.masses.add(mesh);
        groups.masses.add(outline(polygon, levels * FLOOR_HEIGHT_M + 0.015, COLORS.line, 0.75));
        for (let floor = 1; floor <= levels; floor++) {
          const band = new THREE.Mesh(extrudeMetricPolygon(polygon, 0.10), new THREE.MeshStandardMaterial({ color: COLORS.white, roughness: 0.9, metalness: 0 }));
          band.position.y = floor * FLOOR_HEIGHT_M - 0.10;
          band.renderOrder = 2;
          groups.masses.add(band);
          groups.masses.add(outline(polygon, floor * FLOOR_HEIGHT_M - 0.11, COLORS.white, 0.84));
        }
      }
    });
  }

  function addDimensions() {
    disposeTree(groups.dimensions);
    const textScale = Math.max(2.2, span * 0.018);
    for (const [id, feature] of Object.entries(features)) {
      if (!id.startsWith('borda_') || !feature.lines?.length) continue;
      for (const points of feature.lines) {
        if (points.length < 2) continue;
        const length = pathLength(points), midpoint = pathMiddle(points);
        const dimension = labelSprite(`${num.format(length)} m`, textScale);
        if (dimension) {
          const e = midpoint[0] - center.x, z = -midpoint[1] - center.z;
          const lengthFromCenter = Math.hypot(e, z) || 1;
          dimension.position.set(midpoint[0] + e / lengthFromCenter * textScale, 1.2, -midpoint[1] + z / lengthFromCenter * textScale);
          groups.dimensions.add(dimension);
        }
      }
    }
    const envelopePoint = openMetricRing(features[envelopeId].polygons[0].outer).reduce((best, point) => point[0] > best[0] ? point : best);
    const heightLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(envelopePoint[0] + 1.5, 0.1, -envelopePoint[1]),
      new THREE.Vector3(envelopePoint[0] + 1.5, ENVELOPE_HEIGHT_M, -envelopePoint[1]),
    ]), new THREE.LineBasicMaterial({ color: COLORS.clay }));
    groups.dimensions.add(heightLine);
    const heightLabel = labelSprite('28 m · limite físico', textScale, COLORS.clay);
    if (heightLabel) { heightLabel.position.set(envelopePoint[0] + textScale * 2.6, ENVELOPE_HEIGHT_M + textScale, -envelopePoint[1]); groups.dimensions.add(heightLabel); }
    massIds.forEach((id, index) => {
      const polygon = features[id].polygons[0];
      const points = openMetricRing(polygon.outer);
      const average = points.reduce((sum, p) => [sum[0] + p[0] / points.length, sum[1] + p[1] / points.length], [0, 0]);
      const name = labelSprite(`${String.fromCharCode(65 + index)} · ${levels} pav. / ${num.format(levels * FLOOR_HEIGHT_M)} m`, textScale);
      if (name) { name.position.set(average[0], levels * FLOOR_HEIGHT_M + textScale * 1.4, -average[1]); groups.dimensions.add(name); }
    });
    const north = labelSprite('N ↑', textScale * 0.86);
    if (north) { north.position.set(maxE + textScale * 2, 0.2, -maxN - textScale * 2); groups.dimensions.add(north); }
  }

  function updateLayers() {
    for (const [id, control] of [['lot', 'geoLot'], ['envelope', 'geoEnvelope'], ['masses', 'geoMasses'], ['dimensions', 'geoDimensions']]) {
      groups[id].visible = elements[control] ? elements[control].checked : true;
    }
    render();
  }

  function updateGeometry() {
    const requestedLevels = Number(elements.geoLevels?.value ?? 8);
    const nextLevels = Math.max(4, Math.min(8, Number.isFinite(requestedLevels) ? Math.round(requestedLevels) : 8));
    const nextEnvelopeId = elements.geoSetbacks?.value === 'all5' ? 'envelope_5_todas' : 'envelope_5_3';
    if (geometryInitialized && nextLevels === levels && nextEnvelopeId === envelopeId) return;
    levels = nextLevels; envelopeId = nextEnvelopeId; geometryInitialized = true;
    addEnvelope(); addMasses(); addDimensions(); updateLayers();
    setStatus(`Lote 0003 · ${levels} níveis × 3 m = ${levels * FLOOR_HEIGHT_M} m · envelope limite 28 m.`);
    host.dataset.levels = String(levels);
    host.dataset.envelope = envelopeId;
    host.dispatchEvent(new CustomEvent('talma:geometry-change', { bubbles: true, detail: { levels, heightM: levels * FLOOR_HEIGHT_M, envelopeId, setbackMode: envelopeId === 'envelope_5_todas' ? 'all5' : 'mixed' } }));
  }

  function resize() {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight || 500);
    renderer.setSize(width, height, false);
    const aspect = width / height;
    camera.updateMatrixWorld(true);
    let extentX = 0, extentY = 0;
    for (const [east, north] of lotPoints) {
      for (const elevation of [0, ENVELOPE_HEIGHT_M]) {
        const projected = new THREE.Vector3(east, elevation, -north).applyMatrix4(camera.matrixWorldInverse);
        extentX = Math.max(extentX, Math.abs(projected.x));
        extentY = Math.max(extentY, Math.abs(projected.y));
      }
    }
    const halfHeight = Math.max(22, extentY * 1.24, extentX * 1.24 / aspect);
    camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
    camera.top = halfHeight; camera.bottom = -halfHeight;
    camera.updateProjectionMatrix(); render();
  }

  function selectView(view = elements.geoView?.value ?? 'iso') {
    const distance = span * 2.2;
    const direction = view === 'top' ? new THREE.Vector3(0, 1, 0.0001) : view === 'front' ? new THREE.Vector3(0, 0.025, 1) : new THREE.Vector3(1, 0.88, 1.05).normalize();
    controls.target.copy(center);
    camera.position.copy(center).addScaledVector(direction, distance);
    camera.up.set(0, 1, 0);
    camera.zoom = 1;
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    controls.update(); resize(); render();
  }

  addLot(); updateGeometry(); resize(); selectView();
  for (const id of ['geoLot', 'geoEnvelope', 'geoMasses', 'geoDimensions']) listen(elements[id], 'change', updateLayers);
  listen(elements.geoLevels, 'input', updateGeometry);
  listen(elements.geoLevels, 'change', updateGeometry);
  listen(elements.geoSetbacks, 'change', updateGeometry);
  listen(elements.geoView, 'change', () => selectView());
  listen(elements.geoReset, 'click', () => selectView());
  listen(canvas, 'keydown', (event) => {
    if (event.key === '+' || event.key === '=') { camera.zoom = Math.min(controls.maxZoom, camera.zoom * 1.15); event.preventDefault(); }
    else if (event.key === '-') { camera.zoom = Math.max(controls.minZoom, camera.zoom / 1.15); event.preventDefault(); }
    else if (event.key.toLowerCase() === 'r') { selectView(); event.preventDefault(); return; }
    else return;
    camera.updateProjectionMatrix(); render();
  });
  listen(canvas, 'webglcontextlost', (event) => { event.preventDefault(); host.dataset.sceneState = 'lost'; setStatus('O navegador interrompeu a cena3D. Recarregue a página para retomá-la; os dados do estudo permanecem disponíveis.'); });
  const observer = new ResizeObserver(() => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => { resizeFrame = 0; resize(); });
  });
  observer.observe(host);
  const api = {
    reset: () => selectView(),
    render,
    getState: () => ({ levels, envelopeId, lotId: 'lote_principal', layers: Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, value.visible])) }),
    dispose() {
      if (disposed) return;
      disposed = true;
      observer.disconnect(); listeners.forEach((off) => off());
      if (frame) cancelAnimationFrame(frame);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      controls.removeEventListener('change', render); controls.dispose();
      disposeTree(scene); renderer.dispose(); canvas.remove(); delete host.__talmaScene;
    },
  };
  host.__talmaScene = api;
  return api;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initGeometryScene(), { once: true });
  else initGeometryScene();
}
