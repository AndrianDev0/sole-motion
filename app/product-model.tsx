'use client';

import { useEffect, useRef, useState } from 'react';
import type { Mesh, MeshStandardMaterial, Texture } from 'three';
import ShoeImage from './shoe-image';

type ModelView = 'product' | 'toe' | 'swoosh' | 'heel';

export default function ProductModel({ edition, label, view = 'product' }: { edition: number; label: string; view?: ModelView }) {
  const host = useRef<HTMLDivElement>(null);
  const selected = useRef(edition);
  const applyEdition = useRef<(value: number) => void>(() => {});
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    selected.current = edition;
    applyEdition.current(edition);
    host.current?.querySelector('canvas')?.setAttribute('aria-label', `Интерактивный 3D-ракурс Nike Air Force 1, цвет ${label}.`);
  }, [edition, label, view]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const container = element;
    let disposed = false;
    let cleanup = () => {};
    async function initialize() {
      const isPhone = window.matchMedia('(max-width: 767px)').matches;
      if (view !== 'product' && isPhone) {
        setFailed(true);
        return;
      }
      const [T, { GLTFLoader }, { RoomEnvironment }] = await Promise.all([
        import('three'), import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/environments/RoomEnvironment.js'),
      ]);
      if (disposed) return;
      const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0xffffff, 0);
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = view === 'product' ? 1 : 1.12;
      renderer.domElement.setAttribute('role', 'img');
      renderer.domElement.setAttribute('aria-label', 'Интерактивная 3D-модель Nike Air Force 1 с переключаемым цветом.');
      container.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(-2.25, 2.25, 1.5, -1.5, .01, 30);
      camera.position.set(0, 0, 8);
      const generator = new T.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environment = generator.fromScene(room, .04);
      scene.environment = environment.texture;
      room.dispose(); generator.dispose();
      scene.add(new T.HemisphereLight(0xffffff, 0x202522, 1.32));
      const key = new T.DirectionalLight(0xffffff, 2.55);
      key.position.set(-4, 5, 7); scene.add(key);
      const rim = new T.DirectionalLight(0xb8f5d8, 1.55);
      rim.position.set(5, 1, 2); scene.add(rim);
      const violetFill = new T.DirectionalLight(0x7349e8, .48);
      violetFill.position.set(2, -2, 4); scene.add(violetFill);
      const pivot = new T.Group(); scene.add(pivot);
      const normalized = new T.Group(); pivot.add(normalized);
      const materials = new Set<MeshStandardMaterial>();
      const meshes: Mesh[] = [];
      let raf = 0, loopRunning = false, visible = true, targetX = 0, targetY = 0, x = 0, y = 0;
      let dragPointer: number | null = null;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const basePose = {
        product: { x: .12, y: -.48, z: -.13 },
        toe: { x: .12, y: .58, z: -.07 },
        swoosh: { x: .1, y: -.34, z: -.08 },
        heel: { x: .16, y: -1.02, z: -.09 },
      }[view];
      const gltf = await new GLTFLoader().loadAsync('/air-force-1.glb');
      if (disposed) return;
      normalized.add(gltf.scene);
      const bounds = new T.Box3().setFromObject(normalized);
      const size = bounds.getSize(new T.Vector3()), center = bounds.getCenter(new T.Vector3());
      const displayScale = view === 'product' ? 3.65 : view === 'heel' ? 4.1 : view === 'toe' ? 3.7 : 3.6;
      const scale = displayScale / Math.max(size.x, size.y, size.z);
      normalized.scale.setScalar(scale); normalized.position.copy(center.multiplyScalar(-scale));
      gltf.scene.traverse(object => {
        if (!(object instanceof T.Mesh)) return;
        meshes.push(object);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          if (!(material instanceof T.MeshStandardMaterial)) continue;
          material.userData.originalColor = material.color.clone();
          material.userData.originalRoughness = material.roughness;
          material.userData.originalMetalness = material.metalness;
          material.envMapIntensity = .72;
          materials.add(material);
        }
      });
      const updateEdition = (current: number) => {
        materials.forEach(material => {
          material.color.copy(material.userData.originalColor);
          if (current === 1) material.color.multiply(new T.Color('#202522'));
          if (current === 2) material.color.multiply(new T.Color('#b8f5d8'));
          material.roughness = current === 1 ? .9 : Math.max(.62, material.userData.originalRoughness);
          material.metalness = current === 1 ? .02 : material.userData.originalMetalness;
          material.opacity = 1; material.transparent = false; material.visible = true;
          material.needsUpdate = true;
        });
        renderer.render(scene, camera);
      };
      applyEdition.current = updateEdition;
      updateEdition(selected.current);
      setLoaded(true);
      let renderWidth = 0, renderHeight = 0;
      const resize = () => {
        const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight);
        if (width !== renderWidth || height !== renderHeight) {
          renderWidth = width; renderHeight = height;
          renderer.setSize(width, height);
        }
        const aspect = width / height;
        const mobileSafety = isPhone && view === 'product' ? 1.12 : 1;
        const halfHeight = Math.max(view === 'product' ? 1.45 : 1.58, (view === 'product' ? 2.2 : 2.02) * mobileSafety / aspect);
        camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
        camera.top = halfHeight; camera.bottom = -halfHeight; camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
      const animate = () => {
        if (disposed || !visible || document.hidden) {
          loopRunning = false;
          return;
        }
        x += (targetX - x) * .08; y += (targetY - y) * .08;
        pivot.rotation.set(basePose.x - y, basePose.y + x, basePose.z + x * .18);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      const startLoop = () => {
        if (!loopRunning && !disposed && visible && !document.hidden) {
          loopRunning = true;
          raf = requestAnimationFrame(animate);
        }
      };
      const intersection = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) startLoop();
      });
      intersection.observe(container);
      const visibility = () => { if (!document.hidden) startLoop(); };
      document.addEventListener('visibilitychange', visibility);
      const move = (event: PointerEvent) => {
        if (reduced || (event.pointerType === 'touch' && dragPointer !== event.pointerId)) return;
        const rect = container.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width - .5) * .22;
        targetY = ((event.clientY - rect.top) / rect.height - .5) * .12;
      };
      const down = (event: PointerEvent) => {
        if (reduced || event.pointerType !== 'touch') return;
        dragPointer = event.pointerId;
        container.setPointerCapture(event.pointerId);
        move(event);
      };
      const up = (event: PointerEvent) => {
        if (dragPointer !== event.pointerId) return;
        if (container.hasPointerCapture(event.pointerId)) container.releasePointerCapture(event.pointerId);
        dragPointer = null;
      };
      const leave = () => { targetX = 0; targetY = 0; };
      container.addEventListener('pointerdown', down);
      container.addEventListener('pointermove', move);
      container.addEventListener('pointerup', up);
      container.addEventListener('pointercancel', up);
      container.addEventListener('pointerleave', leave);
      startLoop();
      cleanup = () => {
        cancelAnimationFrame(raf); resizeObserver.disconnect(); intersection.disconnect();
        document.removeEventListener('visibilitychange', visibility);
        container.removeEventListener('pointerdown', down);
        container.removeEventListener('pointermove', move);
        container.removeEventListener('pointerup', up);
        container.removeEventListener('pointercancel', up);
        container.removeEventListener('pointerleave', leave);
        const textures = new Set<Texture>();
        meshes.forEach(mesh => mesh.geometry.dispose());
        materials.forEach(material => {
          for (const value of Object.values(material)) if (value instanceof T.Texture) textures.add(value);
          material.dispose();
        });
        textures.forEach(texture => texture.dispose());
        applyEdition.current = () => {};
        environment.dispose(); renderer.dispose(); renderer.domElement.remove();
      };
    }
    initialize().catch(() => { if (!disposed) { setLoaded(false); setFailed(true); } cleanup(); });
    return () => { disposed = true; cleanup(); };
  }, [view]);
  return <div className={'product-model '+(view === 'product' ? '' : 'editorial-model')+(loaded ? ' is-loaded' : '')} ref={host}>
    {!loaded && (failed || view === 'product' ? <ShoeImage alt={`Nike Air Force 1, ${label}`} className={`product-model-fallback tint-${edition === 0 ? 'white' : edition === 1 ? 'ink' : 'mint'}`}/> : <span className="editorial-model-loader" aria-hidden="true"><i/></span>)}
  </div>;
}
