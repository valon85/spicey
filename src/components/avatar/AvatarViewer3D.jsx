/**
 * AvatarViewer3D — renders a Ready Player Me GLB avatar using Three.js
 * Falls back to a 2D image if no GLB URL is provided.
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Dynamically import GLTFLoader to avoid SSR issues
let GLTFLoader = null;

async function getGLTFLoader() {
  if (GLTFLoader) return GLTFLoader;
  const mod = await import('three/examples/jsm/loaders/GLTFLoader.js');
  GLTFLoader = mod.GLTFLoader;
  return GLTFLoader;
}

const ANIMATIONS = {
  idle: null,    // just breathing/idle from RPM default
  wave: null,
  dance: null,
};

export default function AvatarViewer3D({
  glbUrl,
  fallbackImageUrl,
  width = 280,
  height = 320,
  autoRotate = false,
  animation = 'idle',
  style = {},
}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const mixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const frameRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!glbUrl || !mountRef.current) return;

    const mount = mountRef.current;
    const w = mount.clientWidth || width;
    const h = mount.clientHeight || height;

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = null; // transparent
    sceneRef.current = scene;

    // ── Camera ───────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 1.5, 3.5);
    cameraRef.current = camera;

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Lights ───────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xff8844, 1.8);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8844ff, 0.8);
    fillLight.position.set(-2, 2, -1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff2d55, 0.5);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // ── Load GLB ─────────────────────────────────────────────────────────────
    let cancelled = false;

    getGLTFLoader().then(Loader => {
      if (cancelled) return;
      const loader = new Loader();
      loader.load(
        glbUrl,
        (gltf) => {
          if (cancelled) return;

          const model = gltf.scene;

          // Center + scale the model to fit nicely
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 2.2 / maxDim;
          model.scale.setScalar(scale);
          model.position.set(
            -center.x * scale,
            -box.min.y * scale,
            -center.z * scale
          );

          scene.add(model);

          // Play embedded animations if any
          if (gltf.animations?.length) {
            const mixer = new THREE.AnimationMixer(model);
            mixerRef.current = mixer;
            const clip = gltf.animations[0];
            const action = mixer.clipAction(clip);
            action.play();
          }

          setLoading(false);
        },
        undefined,
        (err) => {
          console.error('[AvatarViewer3D] GLB load error:', err);
          setError(true);
          setLoading(false);
        }
      );
    });

    // ── Render loop ──────────────────────────────────────────────────────────
    let rotY = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      if (mixerRef.current) mixerRef.current.update(delta);
      if (autoRotate) {
        rotY += delta * 0.4;
        if (sceneRef.current.children[3]) {
          sceneRef.current.children[3].rotation.y = rotY;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelled = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [glbUrl, width, height, autoRotate]);

  // 2D fallback
  if (!glbUrl || error) {
    return (
      <div style={{ width, height, ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
        {fallbackImageUrl
          ? <img src={fallbackImageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ fontSize: 48 }}>🧑</div>
        }
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width, height, ...style }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden' }} />
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', borderRadius: 16,
          background: 'rgba(5,0,8,0.85)',
        }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(255,106,0,0.2)', borderTopColor: '#FF6A00', borderRadius: '50%', animation: 'spin3d 0.8s linear infinite' }} />
          <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Loading 3D Avatar…</div>
        </div>
      )}
      <style>{`@keyframes spin3d { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}