import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Accelerometer } from 'expo-sensors';
import * as THREE from 'three';

const JAR_RADIUS = 0.55;
const JAR_HEIGHT = 1.6;
const COIN_RADIUS = 0.12;
const COIN_THICKNESS = 0.03;
const MAX_COINS = 20;

// Simple verlet physics body
function makeBody(x, y, z) {
  return {
    pos: new THREE.Vector3(x, y, z),
    prev: new THREE.Vector3(x, y, z),
    acc: new THREE.Vector3(0, 0, 0),
  };
}

function stepBodies(bodies, gravity, dt) {
  for (const b of bodies) {
    const vel = b.pos.clone().sub(b.prev);
    b.prev.copy(b.pos);
    b.pos.add(vel).add(b.acc.clone().multiplyScalar(dt * dt));
    b.acc.set(0, 0, 0);

    // Constrain inside jar cylinder
    const dx = b.pos.x;
    const dz = b.pos.z;
    const r = Math.sqrt(dx * dx + dz * dz);
    const maxR = JAR_RADIUS - COIN_RADIUS - 0.02;
    if (r > maxR) {
      const scale = maxR / r;
      b.pos.x = dx * scale;
      b.pos.z = dz * scale;
    }

    // Floor / ceiling
    const floor = -JAR_HEIGHT / 2 + COIN_THICKNESS;
    const ceil = JAR_HEIGHT / 2 - COIN_THICKNESS;
    if (b.pos.y < floor) { b.pos.y = floor; b.prev.y = b.pos.y + (b.pos.y - b.prev.y) * -0.4; }
    if (b.pos.y > ceil)  { b.pos.y = ceil;  b.prev.y = b.pos.y + (b.pos.y - b.prev.y) * -0.4; }
  }

  // Coin-coin separation
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const diff = bodies[i].pos.clone().sub(bodies[j].pos);
      const dist = diff.length();
      const minDist = COIN_RADIUS * 2.2;
      if (dist < minDist && dist > 0.001) {
        const push = diff.normalize().multiplyScalar((minDist - dist) * 0.5);
        bodies[i].pos.add(push);
        bodies[j].pos.sub(push);
      }
    }
  }
}

export default function CoinJar({ totalSaved = 0, maxAmount = 10000 }) {
  const glRef = useRef(null);
  const rafRef = useRef(null);
  const accelRef = useRef({ x: 0, y: -1, z: 0 });
  const bodiesRef = useRef([]);
  const meshesRef = useRef([]);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const jarGroupRef = useRef(null);

  const fillRatio = Math.min(totalSaved / Math.max(maxAmount, 1), 1);
  const coinCount = Math.max(0, Math.round(fillRatio * MAX_COINS));

  useEffect(() => {
    Accelerometer.setUpdateInterval(40);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      accelRef.current = { x, y, z };
    });
    return () => sub.remove();
  }, []);

  const onContextCreate = (gl) => {
    glRef.current = gl;
    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ context: gl, antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 50);
    camera.position.set(0, 0.4, 4.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // ── Lighting ──────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.2);
    keyLight.position.set(3, 5, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(512, 512);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc0e0ff, 0.8);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x80ffaa, 0.6);
    rimLight.position.set(0, -3, -3);
    scene.add(rimLight);

    // Point light inside jar for glow
    const innerGlow = new THREE.PointLight(0x44ff88, 0.5, 3);
    innerGlow.position.set(0, -0.3, 0);
    scene.add(innerGlow);

    // ── Jar group (tilts with accelerometer) ──────────────────────────────────
    const jarGroup = new THREE.Group();
    scene.add(jarGroup);
    jarGroupRef.current = jarGroup;

    // ── Glass material ────────────────────────────────────────────────────────
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x88ffcc,
      metalness: 0.0,
      roughness: 0.05,
      transmission: 0.92,       // glass transparency
      thickness: 0.4,
      ior: 1.5,                 // index of refraction
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      envMapIntensity: 1.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      depthWrite: false,
    });

    // ── Jar body (open-top cylinder) ──────────────────────────────────────────
    const jarGeo = new THREE.CylinderGeometry(
      JAR_RADIUS, JAR_RADIUS * 0.88, JAR_HEIGHT, 48, 1, true
    );
    const jarMesh = new THREE.Mesh(jarGeo, glassMat);
    jarMesh.castShadow = true;
    jarGroup.add(jarMesh);

    // Jar bottom cap
    const bottomGeo = new THREE.CircleGeometry(JAR_RADIUS * 0.88, 48);
    const bottomMesh = new THREE.Mesh(bottomGeo, glassMat);
    bottomMesh.rotation.x = -Math.PI / 2;
    bottomMesh.position.y = -JAR_HEIGHT / 2;
    jarGroup.add(bottomMesh);

    // Jar rim (torus at top)
    const rimGeo = new THREE.TorusGeometry(JAR_RADIUS, 0.025, 12, 48);
    const rimMat = new THREE.MeshPhysicalMaterial({
      color: 0xaaffcc, metalness: 0.1, roughness: 0.1,
      transparent: true, opacity: 0.6,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = JAR_HEIGHT / 2;
    jarGroup.add(rimMesh);

    // ── Lid ───────────────────────────────────────────────────────────────────
    const lidMat = new THREE.MeshPhysicalMaterial({
      color: 0x888888, metalness: 0.7, roughness: 0.25,
      clearcoat: 0.8, clearcoatRoughness: 0.1,
    });
    const lidGeo = new THREE.CylinderGeometry(JAR_RADIUS + 0.04, JAR_RADIUS + 0.04, 0.12, 48);
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.position.y = JAR_HEIGHT / 2 + 0.06;
    lidMesh.castShadow = true;
    jarGroup.add(lidMesh);

    // Lid top cap
    const lidTopGeo = new THREE.CircleGeometry(JAR_RADIUS + 0.04, 48);
    const lidTopMesh = new THREE.Mesh(lidTopGeo, lidMat);
    lidTopMesh.rotation.x = -Math.PI / 2;
    lidTopMesh.position.y = JAR_HEIGHT / 2 + 0.12;
    jarGroup.add(lidTopMesh);

    // Lid knob
    const knobGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.1, 24);
    const knobMesh = new THREE.Mesh(knobGeo, lidMat);
    knobMesh.position.y = JAR_HEIGHT / 2 + 0.17;
    jarGroup.add(knobMesh);

    // ── Coin material ─────────────────────────────────────────────────────────
    const coinMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4a017,
      metalness: 0.95,
      roughness: 0.15,
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.5,
    });
    const coinEdgeMat = new THREE.MeshPhysicalMaterial({
      color: 0xb8860b,
      metalness: 0.9,
      roughness: 0.2,
    });

    // ── Spawn coins ───────────────────────────────────────────────────────────
    bodiesRef.current = [];
    meshesRef.current = [];

    for (let i = 0; i < coinCount; i++) {
      const angle = (i / coinCount) * Math.PI * 2;
      const r = Math.random() * (JAR_RADIUS - COIN_RADIUS - 0.1);
      const startY = -JAR_HEIGHT / 2 + COIN_THICKNESS + i * (COIN_THICKNESS * 3);
      const body = makeBody(
        Math.cos(angle) * r,
        Math.min(startY, JAR_HEIGHT / 2 - COIN_THICKNESS),
        Math.sin(angle) * r
      );
      bodiesRef.current.push(body);

      const coinGeo = new THREE.CylinderGeometry(COIN_RADIUS, COIN_RADIUS, COIN_THICKNESS, 32);
      // Apply different material to top/bottom vs edge
      const materials = [coinEdgeMat, coinMat, coinMat];
      const coinMesh = new THREE.Mesh(coinGeo, materials);
      coinMesh.castShadow = true;
      coinMesh.receiveShadow = true;
      // Random tilt for realism
      coinMesh.rotation.x = (Math.random() - 0.5) * 0.4;
      coinMesh.rotation.z = (Math.random() - 0.5) * 0.4;
      coinMesh.position.copy(body.pos);
      jarGroup.add(coinMesh);
      meshesRef.current.push(coinMesh);
    }

    // ── Render loop ───────────────────────────────────────────────────────────
    let last = Date.now();
    const tiltX = { val: 0 };
    const tiltZ = { val: 0 };

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      const now = Date.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const a = accelRef.current;

      // Smooth jar tilt
      tiltX.val += (-a.y * 0.35 - tiltX.val) * 0.08;
      tiltZ.val += (a.x * 0.35 - tiltZ.val) * 0.08;
      jarGroup.rotation.x = tiltX.val;
      jarGroup.rotation.z = tiltZ.val;

      // Gravity direction from accelerometer
      const gx = a.x * 12;
      const gy = a.y * 12;
      const gz = a.z * 4;

      for (const b of bodiesRef.current) {
        b.acc.set(gx, -Math.abs(gy) - 6, gz);
      }

      stepBodies(bodiesRef.current, null, dt);

      for (let i = 0; i < meshesRef.current.length; i++) {
        meshesRef.current[i].position.copy(bodiesRef.current[i].pos);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);

  return (
    <View style={styles.wrapper}>
      <GLView style={styles.gl} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 220,
    height: 280,
    alignSelf: 'center',
  },
  gl: {
    flex: 1,
  },
});
