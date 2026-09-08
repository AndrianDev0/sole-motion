'use client';
import { useEffect, useRef, useState } from 'react';
import type { Mesh, MeshStandardMaterial, Texture } from 'three';
import { clamp01, flightPose } from './shoe-motion';
import ShoeImage from './shoe-image';

export default function ShoeScene({ edition, motion }: { edition: number; motion: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const settings = useRef({ edition, motion });
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { settings.current = { edition, motion }; }, [edition, motion]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let release = () => {};
    async function initialize() {
      const isPhone = window.matchMedia('(max-width: 767px)').matches;
      const [T, { GLTFLoader }, { RoomEnvironment }] = await Promise.all([
        import('three'), import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/environments/RoomEnvironment.js'),
      ]);
      if (disposed || !element) return;
      const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0xffffff, 0);
      renderer.domElement.setAttribute('role', 'img');
      renderer.domElement.setAttribute('aria-label', 'Nike Air Force 1 плавно разворачивается и приземляется при прокрутке страницы.');
      renderer.outputColorSpace = T.SRGBColorSpace;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      // Keep the white leather below clipping so its panel seams and grain remain visible.
      renderer.toneMappingExposure = isPhone ? .86 : .92;
      element.appendChild(renderer.domElement);
      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(-3, 3, 2, -2, .01, 40);
      camera.position.set(0, 0, 10);
      const generator = new T.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      const environment = generator.fromScene(room, .04);
      scene.environment = environment.texture;
      room.dispose(); generator.dispose();
      scene.add(new T.HemisphereLight(0xffffff, 0x202522, isPhone ? .92 : 1.05));
      const key = new T.DirectionalLight(0xffffff, isPhone ? 1.85 : 2.05);
      key.position.set(-3, 5, 7); scene.add(key);
      const fill = new T.DirectionalLight(0xffffff, isPhone ? .62 : .78);
      fill.position.set(4, 1, -3); scene.add(fill);
      const rim = new T.DirectionalLight(0x7349e8, isPhone ? .22 : .16);
      rim.position.set(4, 2, 5); scene.add(rim);
      const pivot = new T.Group(); scene.add(pivot);
      const normalized = new T.Group(); pivot.add(normalized);
      const meshes: Mesh[] = [];
      const materialSet = new Set<MeshStandardMaterial>();
      const surfaces = isPhone ? (await import('./shoe-surface')).createShoeSurfaces() : null;
      let raf = 0, loopRunning = false, previousTime = 0, progress = 0, pointerX = 0, pointerY = 0;
      let targetX = 0, targetY = 0, isVisible = true;
      let distance = 1, top = 0, aspect = 1, lastEdition = -1;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      const section = element.closest('.flight-section') as HTMLElement;
      const sticky = section.querySelector('.flight-sticky') as HTMLElement;
      const shadow = element.querySelector('.landing-shadow') as HTMLElement;
      const bounds = new T.Box3(), size = new T.Vector3(), center = new T.Vector3();
      const modelBounds = new T.Box3();
      let renderWidth = 0, renderHeight = 0;
      function resize() {
        if (!element) return;
        const width = Math.max(1, element.clientWidth), height = Math.max(1, element.clientHeight);
        if (width !== renderWidth || height !== renderHeight) {
          renderWidth = width; renderHeight = height;
          renderer.setSize(width, height);
          // Resizing clears the drawing buffer; repaint before the browser presents it.
          if (meshes.length) renderer.render(scene, camera);
        }
        aspect = width / height;
        top = window.scrollY + section.getBoundingClientRect().top;
        distance = Math.max(1, section.offsetHeight - sticky.offsetHeight);
      }
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(element); resizeObserver.observe(section); resize();
      const animate = (time: number) => {
        if (disposed || !isVisible || document.hidden) {
          loopRunning = false;
          return;
        }
        raf = requestAnimationFrame(animate);
        const dt = Math.min((time - previousTime) / 1000, .05); previousTime = time;
        if (!meshes.length) return;
        const active = settings.current.motion && !reduced.matches;
        const target = active ? clamp01((window.scrollY - top) / distance) : 0;
        progress = active ? T.MathUtils.lerp(progress, target, 1 - Math.exp(-9 * dt)) : 0;
        pointerX = T.MathUtils.lerp(pointerX, active ? targetX : 0, 1 - Math.exp(-5 * dt));
        pointerY = T.MathUtils.lerp(pointerY, active ? targetY : 0, 1 - Math.exp(-5 * dt));
        const pose = flightPose(progress, pointerX, pointerY);
        pivot.rotation.set(pose.rx, pose.ry, pose.rz);
        pivot.position.set(pose.x, pose.y, 0); pivot.scale.setScalar(pose.scale);
        pivot.updateMatrixWorld(true);
        bounds.copy(modelBounds).applyMatrix4(pivot.matrixWorld);
        const extentX = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
        const extentY = Math.max(Math.abs(bounds.min.y), Math.abs(bounds.max.y));
        const safety = isPhone ? 1.32 : 1.18;
        const halfHeight = Math.max(1.48, 2.18 / aspect, extentY * safety, extentX * safety / aspect);
        camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
        camera.top = halfHeight; camera.bottom = -halfHeight; camera.updateProjectionMatrix();
        shadow.style.opacity = String(pose.shadow);
        shadow.style.transform = 'translateX(-50%) scale(' + (.76 + progress * .24) + ')';
        const currentEdition = settings.current.edition;
        if (lastEdition !== currentEdition) {
          lastEdition = currentEdition;
          materialSet.forEach(material => {
            material.color.copy(material.userData.originalColor);
            if (currentEdition === 1) material.color.multiply(new T.Color('#202522'));
            if (currentEdition === 2) material.color.multiply(new T.Color('#b8f5d8'));
          });
        }
        renderer.render(scene, camera);
      };
      const startLoop = () => {
        if (!loopRunning && !disposed && isVisible && !document.hidden) {
          loopRunning = true;
          raf = requestAnimationFrame(animate);
        }
      };
      // Keep a generous visibility window: mobile browsers can briefly report a
      // sticky section as outside the viewport while the address bar collapses.
      const intersection = new IntersectionObserver(entries => { isVisible = entries[0].isIntersecting; if (isVisible) startLoop(); }, { rootMargin: '150% 0px' });
      intersection.observe(section);
      const visibility = () => { if (!document.hidden) startLoop(); };
      const wakeOnScroll = () => { if (!document.hidden) startLoop(); };
      document.addEventListener('visibilitychange', visibility);
      window.addEventListener('scroll', wakeOnScroll, { passive: true });
      const move = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;
        targetX = Math.max(-1, Math.min(1, event.clientX / window.innerWidth * 2 - 1));
        targetY = Math.max(-1, Math.min(1, event.clientY / window.innerHeight * 2 - 1));
      };
      window.addEventListener('pointermove', move, { passive: true });
      release = () => {
        cancelAnimationFrame(raf); resizeObserver.disconnect(); intersection.disconnect(); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('scroll', wakeOnScroll);
        window.removeEventListener('pointermove', move);
        const textures = new Set<Texture>();
        meshes.forEach(mesh => mesh.geometry.dispose());
        materialSet.forEach(material => {
          for (const value of Object.values(material)) if (value instanceof T.Texture) textures.add(value);
          material.dispose();
        });
        textures.forEach(texture => texture.dispose());
        surfaces?.leather.dispose(); surfaces?.fabric.dispose();
        environment.dispose(); renderer.dispose(); renderer.domElement.remove();
      };
      try {
        const gltf = await new GLTFLoader().loadAsync('/air-force-1.glb');
        if (disposed) {
          gltf.scene.traverse(object => {
            if (object instanceof T.Mesh) { object.geometry.dispose(); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose()); }
          });
          return;
        }
        // Keep the asset's own transforms; normalize with a separate wrapper.
        normalized.add(gltf.scene);
        bounds.setFromObject(normalized); bounds.getSize(size); bounds.getCenter(center);
        const modelScale = 3.65 / Math.max(size.x, size.y, size.z);
        normalized.scale.setScalar(modelScale);
        normalized.position.copy(center.multiplyScalar(-modelScale));
        normalized.updateMatrixWorld(true);
        modelBounds.setFromObject(normalized);
        gltf.scene.traverse(object => {
          if (object instanceof T.Mesh) {
            meshes.push(object);
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach(material => {
              if (material instanceof T.MeshStandardMaterial) {
                if (materialSet.has(material)) return;
                material.envMapIntensity = isPhone ? .52 : .62;
                material.userData.originalColor = material.color.clone().multiplyScalar(isPhone ? .9 : .95);
                material.roughness = Math.max(material.roughness, .48);
                if (material.normalMap) material.normalScale.set(1.18, 1.18);
                if (surfaces && object.geometry.getAttribute('uv')) {
                  const fabric = /fabric|cloth/i.test(material.name);
                  const leather = /leather/i.test(material.name);
                  if (fabric || leather) {
                    material.normalMap = fabric ? surfaces.fabric : surfaces.leather;
                    material.normalScale.setScalar(fabric ? .65 : .45);
                    material.roughness = fabric ? .92 : .64;
                  }
                  if (/^Metal$|Degradable_Metal/i.test(material.name)) {
                    material.metalness = .65;
                    material.roughness = .32;
                  }
                }
                materialSet.add(material);
                if (material.map) material.map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
              }
            });
          }
        });
        setLoaded(true);
      } catch { if (!disposed) setLoaded(false); }
      if (disposed) return;
      startLoop();
    }
    initialize().catch(() => { if (!disposed) { setLoaded(false); setFailed(true); } release(); });
    return () => { disposed = true; release(); };
  }, []);
  return <div className={'shoe-scene ' + (loaded ? 'is-loaded' : '')} ref={host}>
    <div className="landing-shadow" aria-hidden="true" />
    {!loaded && !failed && <div className="scene-loader" aria-hidden="true"><span /></div>}
    {failed && <ShoeImage alt="Nike Air Force 1" className="hero-fallback tint-white" />}
  </div>;
}
