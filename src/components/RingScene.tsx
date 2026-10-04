import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import gsap from 'gsap';
import ringAsset from '@/assets/ring_webgi.glb.asset.json';

const hero = { position: new THREE.Vector3(1.28, -1.7, 5.86), target: new THREE.Vector3(.91, .03, -.25) };
const forever = { position: new THREE.Vector3(-1.83, -.14, 6.15), target: new THREE.Vector3(-.78, -.03, -.12) };
const emotions = { position: new THREE.Vector3(-.06, -1.15, 4.42), target: new THREE.Vector3(-.01, .9, .07) };
const diamondWhite = new THREE.Color(0xffffff);
const diamondBlue = new THREE.Color(0x39cffe);
const diamondPink = new THREE.Color(0xf70db1);
const metalSilver = new THREE.Color(0xfefefe);
const metalRose = new THREE.Color(0xd28b8b);
const metalGold = new THREE.Color(0xf7c478);

export default function RingScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55;
    const scene = new THREE.Scene();
    const environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04);
    scene.environment = environment.texture;
    const camera = new THREE.PerspectiveCamera(window.innerWidth < 700 ? 65 : window.innerWidth / window.innerHeight < 1.1 ? 44 : 25, 1, .01, 100);
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
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    loader.load(ringAsset.url, (gltf) => {
      if (disposed) return;
      ring = gltf.scene;
      scene.add(ring);
      window.dispatchEvent(new Event('jewelry-ready'));
      ring.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const name = object.name.toLowerCase();
        if (name.includes('diamond')) {
          const material = new THREE.MeshPhysicalMaterial({ color: diamondWhite, metalness: .05, roughness: .055, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2, side: THREE.DoubleSide });
          object.material = material;
        } else if (name.includes('gold')) {
          object.material = new THREE.MeshPhysicalMaterial({ color: 0xc7976f, metalness: .82, roughness: .12, clearcoat: 1, side: THREE.DoubleSide });
        } else if (name.includes('silver')) {
          object.material = new THREE.MeshPhysicalMaterial({ color: 0xd6c9d6, metalness: .82, roughness: .1, clearcoat: 1, side: THREE.DoubleSide });
        }
      });
      intro = gsap.timeline();
      intro.to(camera.position, { x: hero.position.x, y: hero.position.y, z: hero.position.z, duration: reduced ? .01 : 4, ease: 'power2.inOut' }, 0)
        .to(target, { x: window.innerWidth < 700 ? -.21 : hero.target.x, y: hero.target.y, z: hero.target.z, duration: reduced ? .01 : 4, ease: 'power2.inOut' }, 0);
    }, undefined, (error) => { console.error('Ring failed to load', error); window.dispatchEvent(new Event('jewelry-ready')); });

    function resize() {
      const width = window.innerWidth; const height = window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 700 ? 65 : width / height < 1.1 ? 44 : 25;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);
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
        ring.rotation.y = THREE.MathUtils.lerp(ring.rotation.y, -Math.PI / 3 * a * (1 - b) + .92 * b, .045);
        ring.rotation.x = THREE.MathUtils.lerp(ring.rotation.x, .92 * b, .045);
        ring.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          const material = object.material;
          if (!(material instanceof THREE.MeshPhysicalMaterial)) return;
          const name = object.name.toLowerCase();
          if (name.includes('diamond')) material.color.lerpColors(diamondWhite, diamondBlue, a).lerp(diamondPink, b);
          else if (name.includes('gold') || name.includes('silver')) material.color.lerpColors(metalSilver, metalRose, a).lerp(metalGold, b);
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
