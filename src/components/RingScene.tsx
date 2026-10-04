import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import gsap from 'gsap';
import ringAsset from '@/assets/ring_webgi.glb.asset.json';

const hero = { position: new THREE.Vector3(1.28, -1.7, 5.86), target: new THREE.Vector3(.91, .03, -.25) };
const forever = { position: new THREE.Vector3(-1.83, -.14, 6.15), target: new THREE.Vector3(-.78, -.03, -.12) };
const emotions = { position: new THREE.Vector3(-.06, -1.15, 4.42), target: new THREE.Vector3(-.01, .9, .07) };

export default function RingScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(window.innerWidth < 700 ? 65 : 25, 1, .01, 100);
    camera.position.set(3, -.8, 1.2);
    const target = new THREE.Vector3(2.5, -.07, -.1);
    scene.add(new THREE.AmbientLight(0xffffff, 2.6));
    const lights: [number, number, number, number, number][] = [
      [-3, 6, 8, 0xffffff, 100], [4, 0, 6, 0xffd8ce, 80], [0, -4, -2, 0xffffff, 50], [-2, 2, -5, 0xffd49b, 65]
    ];
    lights.forEach(([x,y,z,color,intensity]) => { const light = new THREE.PointLight(color, intensity); light.position.set(x,y,z); scene.add(light); });
    const draco = new DRACOLoader();
    draco.setDecoderPath('/draco/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    let ring: THREE.Object3D | undefined;
    let disposed = false;
    let intro: gsap.core.Timeline | undefined;
    const motion = { x: 0, y: 0, z: 0, color: 0 };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    loader.load(ringAsset.url, (gltf) => {
      if (disposed) return;
      ring = gltf.scene;
      scene.add(ring);
      ring.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const name = object.name.toLowerCase();
        if (name.includes('diamond')) {
          const material = new THREE.MeshPhysicalMaterial({ color: 0xd8e8ff, metalness: .05, roughness: .055, transmission: .12, thickness: .35, ior: 2.2, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2, side: THREE.DoubleSide });
          object.material = material;
        } else if (name.includes('gold')) {
          object.material = new THREE.MeshPhysicalMaterial({ color: 0xc7976f, metalness: .82, roughness: .12, clearcoat: 1, side: THREE.DoubleSide });
        } else if (name.includes('silver')) {
          object.material = new THREE.MeshPhysicalMaterial({ color: 0xd6c9d6, metalness: .82, roughness: .1, clearcoat: 1, side: THREE.DoubleSide });
        }
      });
      intro = gsap.timeline({ onComplete: () => window.dispatchEvent(new Event('jewelry-ready')) });
      intro.to(camera.position, { x: hero.position.x, y: hero.position.y, z: hero.position.z, duration: reduced ? .01 : 4, ease: 'power2.inOut' }, 0)
        .to(target, { x: window.innerWidth < 700 ? -.21 : hero.target.x, y: hero.target.y, z: hero.target.z, duration: reduced ? .01 : 4, ease: 'power2.inOut' }, 0);
    }, undefined, (error) => { console.error('Ring failed to load', error); window.dispatchEvent(new Event('jewelry-ready')); });

    function resize() {
      const width = window.innerWidth; const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 700 ? 65 : 25;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);
    const clock = new THREE.Clock();
    let frame = 0;
    let scroll = 0;
    const onScroll = () => { scroll = window.scrollY / Math.max(window.innerHeight, 1); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    function tick() {
      frame = requestAnimationFrame(tick);
      if (ring && scroll > 0) {
        const a = THREE.MathUtils.clamp(scroll, 0, 1);
        const b = THREE.MathUtils.clamp(scroll - 1, 0, 1);
        const p = hero.position.clone().lerp(forever.position, a).lerp(emotions.position, b);
        const t = hero.target.clone().lerp(forever.target, a).lerp(emotions.target, b);
        if (window.innerWidth < 700) { t.x -= 1.12 * (1 - a); t.y += 1.5 * a * (1 - b); }
        camera.position.lerp(p, .055);
        target.lerp(t, .055);
        const rotation = new THREE.Euler(0, 0, 0).setFromVector3(new THREE.Vector3(0, 0, 0));
        const rx = THREE.MathUtils.lerp(0, 0, a);
        rotation.set(THREE.MathUtils.lerp(rx, 0, b), 0, THREE.MathUtils.lerp(0, Math.PI / 2, a) * (1 - b) - b * Math.PI / 2);
        ring.rotation.x = THREE.MathUtils.damp(ring.rotation.x, rotation.x, 4, clock.getDelta());
        ring.rotation.z = THREE.MathUtils.lerp(ring.rotation.z, rotation.z, .045);
        motion.color = a * (1 - b);
        ring.traverse((object) => {
          if (!(object instanceof THREE.Mesh) || !object.name.toLowerCase().includes('diamond')) return;
          const material = object.material;
          if (material instanceof THREE.MeshPhysicalMaterial) material.color.lerpColors(new THREE.Color(0xd8e8ff), new THREE.Color(0x66d5ff), motion.color);
        });
      }
      camera.lookAt(target);
      renderer.render(scene, camera);
    }
    tick();
    return () => { disposed = true; cancelAnimationFrame(frame); intro?.kill(); window.removeEventListener('resize', resize); window.removeEventListener('scroll', onScroll); scene.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); if (object.material instanceof THREE.Material) object.material.dispose(); } }); renderer.dispose(); draco.dispose(); };
  }, []);
  return <canvas ref={canvasRef} className="jewelry-canvas" aria-label="Animated diamond ring" />;
}
