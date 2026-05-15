import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import { GLView } from 'expo-gl';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import * as THREE from 'three';

// ── Minimal GLB parser — zero browser APIs ────────────────────────────────────
function parseGLB(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  if (view.getUint32(0, true) !== 0x46546C67) throw new Error('Not a GLB');
  const jsonLen = view.getUint32(12, true);
  const json = JSON.parse(new TextDecoder().decode(new Uint8Array(arrayBuffer, 20, jsonLen)));
  const binStart = 20 + jsonLen;
  let binBuffer = null;
  if (binStart < arrayBuffer.byteLength) {
    const binLen = view.getUint32(binStart, true);
    binBuffer = arrayBuffer.slice(binStart + 8, binStart + 8 + binLen);
  }
  return { json, binBuffer };
}

function accessorData(json, bin, idx) {
  const acc = json.accessors[idx];
  const bv = json.bufferViews[acc.bufferView];
  const offset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const TypedArray = { 5121: Uint8Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array }[acc.componentType];
  const elems = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }[acc.type];
  return new TypedArray(bin, offset, acc.count * elems);
}

function buildScene(json, bin) {
  const group = new THREE.Group();
  const buildNode = (ni) => {
    const node = json.nodes[ni];
    const obj = new THREE.Group();
    if (node.translation) obj.position.fromArray(node.translation);
    if (node.rotation) obj.quaternion.fromArray(node.rotation);
    if (node.scale) obj.scale.fromArray(node.scale);
    if (node.matrix) { obj.matrix.fromArray(node.matrix); obj.matrix.decompose(obj.position, obj.quaternion, obj.scale); }
    if (node.mesh !== undefined) {
      for (const prim of json.meshes[node.mesh].primitives) {
        const geo = new THREE.BufferGeometry();
        const A = prim.attributes;
        if (A.POSITION !== undefined) geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(accessorData(json, bin, A.POSITION)), 3));
        if (A.NORMAL !== undefined) geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(accessorData(json, bin, A.NORMAL)), 3));
        if (A.TEXCOORD_0 !== undefined) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(accessorData(json, bin, A.TEXCOORD_0)), 2));
        if (prim.indices !== undefined) geo.setIndex(new THREE.BufferAttribute(new Uint32Array(accessorData(json, bin, prim.indices)), 1));
        if (!geo.attributes.normal) geo.computeVertexNormals();
        let mat;
        if (prim.material !== undefined && json.materials?.[prim.material]) {
          const m = json.materials[prim.material];
          const pbr = m.pbrMetallicRoughness || {};
          const c = pbr.baseColorFactor || [1, 1, 1, 1];
          mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(c[0], c[1], c[2]), metalness: pbr.metallicFactor ?? 0, roughness: pbr.roughnessFactor ?? 0.5, opacity: c[3], transparent: c[3] < 1 });
        } else {
          mat = new THREE.MeshStandardMaterial({ color: 0xff9999 });
        }
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        obj.add(mesh);
      }
    }
    if (node.children) node.children.forEach(c => obj.add(buildNode(c)));
    return obj;
  };
  const scene = json.scenes[json.scene || 0];
  scene.nodes.forEach(ni => group.add(buildNode(ni)));
  return group;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PiggyBank({ size = 300, totalSaved = 0 }) {
  const rafRef = useRef(null);
  const modelRef = useRef(null);
  const rendererRef = useRef(null);
  const targetRotY = useRef(0);
  const targetRotX = useRef(0);
  const currentRotY = useRef(0);
  const currentRotX = useRef(0);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const lastTouch = useRef(null);
  const isDragging = useRef(false);

  // Parallax animated values for the background text — removed, text is always visible

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      isDragging.current = true;
      lastTouch.current = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
    },
    onPanResponderMove: (e) => {
      const t = { x: e.nativeEvent.locationX, y: e.nativeEvent.locationY };
      if (lastTouch.current) {
        targetRotY.current += (t.x - lastTouch.current.x) * 0.012;
        targetRotX.current += (t.y - lastTouch.current.y) * 0.012;
        targetRotX.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetRotX.current));
      }
      targetX.current = ((t.x / size) - 0.5) * 1.4;
      targetY.current = -((t.y / size) - 0.5) * 1.4;
      lastTouch.current = t;
    },
    onPanResponderRelease: () => {
      isDragging.current = false;
      lastTouch.current = null;
      targetX.current = 0;
      targetY.current = 0;
    },
  })).current;

  const onContextCreate = async (gl) => {
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;

    // Give Three.js a canvas-like object that points at the real GL context
    // This bypasses document.createElement('canvas') entirely
    const canvas = {
      width: w,
      height: h,
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
      getContext: () => gl,
    };

    const renderer = new THREE.WebGLRenderer({
      canvas,
      context: gl,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.01, 100);
    camera.position.set(0, 0.5, 4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const key = new THREE.DirectionalLight(0xfff5e0, 3.5);
    key.position.set(4, 6, 4);
    key.castShadow = true;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8e0ff, 1.2);
    fill.position.set(-4, 2, -2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(0, -3, -3);
    scene.add(rim);

    try {
      const asset = Asset.fromModule(require('../assets/piggy_bank.glb'));
      await asset.downloadAsync();
      const b64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: 'base64',
      });
      // Decode base64 to ArrayBuffer without Buffer (not available in Hermes)
      const binaryStr = atob(b64);
      const arrayBuffer = new ArrayBuffer(binaryStr.length);
      const uint8 = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryStr.length; i++) uint8[i] = binaryStr.charCodeAt(i);
      const { json, binBuffer } = parseGLB(arrayBuffer);
      const model = buildScene(json, binBuffer);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const sz = box.getSize(new THREE.Vector3());
      const scale = 2.2 / Math.max(sz.x, sz.y, sz.z);
      model.scale.setScalar(scale);
      model.position.sub(center.multiplyScalar(scale));
      scene.add(model);
      modelRef.current = model;
    } catch (e) {
      console.error('PiggyBank error:', e);
    }

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      if (modelRef.current) {
        currentRotY.current += (targetRotY.current - currentRotY.current) * 0.1;
        currentRotX.current += (targetRotX.current - currentRotX.current) * 0.1;
        currentX.current += (targetX.current - currentX.current) * 0.06;
        currentY.current += (targetY.current - currentY.current) * 0.06;
        modelRef.current.rotation.y = currentRotY.current;
        modelRef.current.rotation.x = currentRotX.current;
        modelRef.current.position.x = currentX.current;
        modelRef.current.position.y = currentY.current;
        if (!isDragging.current) targetRotY.current += 0.004;
      }
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (rendererRef.current) rendererRef.current.dispose();
  }, []);

  return (
    <View style={[styles.wrapper, { width: size + 160, height: size }]} {...panResponder.panHandlers}>
      {/* Always-visible background text with glow */}
      <View style={styles.bgLayer} pointerEvents="none">
        <Text style={styles.savingsLabel}>TOTAL SAVINGS</Text>
        <Text style={styles.savingsAmount}>₹{totalSaved.toFixed(0)}</Text>
      </View>

      {/* 3D model — centered on top */}
      <GLView style={[StyleSheet.absoluteFill, { left: 40, right: 40 }]} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    top: 20,
  },
  savingsLabel: {
    color: '#4ade80',
    fontFamily: 'PixelFont',
    fontSize: 13,
    letterSpacing: 4,
    marginBottom: 4,
    opacity: 0.9,
    textShadowColor: '#4ade80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  savingsAmount: {
    color: '#4ade80',
    fontFamily: 'PixelFont',
    fontSize: 80,
    letterSpacing: 4,
    opacity: 0.75,
    textShadowColor: '#4ade80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 32,
  },
});
