import { useEffect, useRef } from "react";
import ringAsset from "@/assets/ring_webgi.glb.asset.json";

type Vector = { x: number; y: number; z: number };
type Color = {
  lerpColors: (a: Color, b: Color, amount: number) => Color;
  convertSRGBToLinear: () => Color;
};
type Ring = {
  rotation: Vector & { set: (x: number, y: number, z: number) => void };
  material: { color: Color };
};
type Controls = {
  enabled: boolean;
  autoRotate: boolean;
  minDistance: number;
  maxDistance: number;
  enablePan: boolean;
  screenSpacePanning: boolean;
};
type Camera = {
  position: Vector;
  target: Vector;
  controls?: Controls;
  setCameraOptions: (options: { fov: number }) => void;
  positionUpdated: (value: boolean) => void;
  targetUpdated: (value: boolean) => void;
};
type Pass = {
  passObject: {
    lowQualityFrames?: number;
    stepCount: number;
    material: { defines: Record<string, number> };
  };
};
type Plugin = {
  passes?: { ssr?: Pass; ssao?: Pass };
  pass?: { passObject: { bloomIterations: number } };
  enabled: boolean;
};
type Manager = {
  importer: {
    registerFile: (path: string) => {
      setDecoderPath: (path: string) => void;
      setDecoderConfig: (config: { type: string }) => void;
    };
    addEventListener: (
      name: string,
      callback: (event: { loaded: number; total: number }) => void,
    ) => void;
  };
  addFromPath: (path: string) => Promise<unknown[]>;
};
type Viewer = {
  scene: {
    activeCamera: Camera;
    findObjectsByName: (name: string) => Ring[];
    removeSceneModels: () => void;
  };
  renderer: { displayCanvasScaling: number; refreshPipeline: () => void };
  addPlugin: (plugin: unknown, ...args: unknown[]) => Promise<Plugin & Manager>;
  setBackground: (color: Color) => void;
  setDirty: () => void;
  addEventListener: (name: string, callback: () => void) => void;
  dispose: () => void;
};
type PluginName =
  | "AssetManagerPlugin"
  | "GBufferPlugin"
  | "ProgressivePlugin"
  | "TonemapPlugin"
  | "SSRPlugin"
  | "SSAOPlugin"
  | "FrameFadePlugin"
  | "GroundPlugin"
  | "BloomPlugin"
  | "TemporalAAPlugin"
  | "DiamondPlugin"
  | "RandomizedDirectionalLightPlugin";
type Runtime = Record<PluginName, new (...args: unknown[]) => unknown> & {
  ViewerApp: new (options: {
    canvas: HTMLCanvasElement;
    useGBufferDepth: boolean;
    isAntialiased: boolean;
  }) => Viewer;
  Color: new (value: string | number) => Color;
};

export type RingController = {
  position: Vector;
  target: Vector;
  rotation: Vector;
  colors: { forever: number; emotions: number };
  update: () => void;
  updateColors: () => void;
  setNight: (night: boolean) => void;
  setOrbit: (enabled: boolean) => void;
  setGem: (color: string) => void;
  setMetals: (silver: string, gold: string) => void;
  changeModel: () => Promise<void>;
};

type Props = {
  onReady: (controller: RingController) => void;
  onProgress: (progress: number) => void;
  onError: (message: string) => void;
};

// Pin the engine used by the reference. Loading it here keeps WebGL out of SSR.
const runtimeUrl = "https://dist.pixotronics.com/webgi/runtime/bundle-0.4.6.mjs";
const referenceModel = "https://webgi-jewelry.vercel.app/assets/ring_webgi.glb";

export default function RingScene(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef(props);
  callbacks.current = props;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let viewer: Viewer | undefined;

    async function setup() {
      const runtime = (await import(/* @vite-ignore */ runtimeUrl)) as Runtime;
      if (disposed) return;
      viewer = new runtime.ViewerApp({
        canvas: canvas!,
        useGBufferDepth: true,
        isAntialiased: false,
      });
      const instance = viewer;
      instance.renderer.displayCanvasScaling = Math.min(window.devicePixelRatio, 1);
      const manager = await instance.addPlugin(runtime.AssetManagerPlugin);
      const decoder = manager.importer.registerFile("ring.drc");
      decoder.setDecoderPath("/draco/");
      decoder.setDecoderConfig({ type: "wasm" });
      await instance.addPlugin(runtime.GBufferPlugin);
      await instance.addPlugin(new runtime.ProgressivePlugin(32));
      await instance.addPlugin(
        new runtime.TonemapPlugin(true, false, [
          "vec4 vignette(vec4 color, vec2 uv, float offset, float darkness) { uv = (uv - vec2(0.5)) * vec2(offset); return vec4(mix(color.rgb, vec3(0.17, 0.00, 0.09), dot(uv, uv)), color.a); }",
          "gl_FragColor = vignette(gl_FragColor, vUv, 1.1, 0.8);",
        ]),
      );
      const ssr = await instance.addPlugin(runtime.SSRPlugin);
      const ssao = await instance.addPlugin(runtime.SSAOPlugin);
      await instance.addPlugin(runtime.FrameFadePlugin);
      await instance.addPlugin(runtime.GroundPlugin);
      const bloom = await instance.addPlugin(runtime.BloomPlugin);
      await instance.addPlugin(runtime.TemporalAAPlugin);
      await instance.addPlugin(runtime.DiamondPlugin);
      await instance.addPlugin(runtime.RandomizedDirectionalLightPlugin, false);
      if (disposed) {
        instance.dispose();
        return;
      }

      manager.importer.addEventListener("onProgress", (event) => {
        if (!disposed && event.total > 0) callbacks.current.onProgress(event.loaded / event.total);
      });
      instance.renderer.refreshPipeline();
      // Lovable serves the retained asset pointer; other hosts use the same source GLB.
      const local = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
      const models = await manager.addFromPath(local ? referenceModel : ringAsset.url);
      if (!models?.length && !local) await manager.addFromPath(referenceModel);
      if (disposed) {
        instance.dispose();
        return;
      }

      let secondModel = false;
      let customGem: string | undefined;
      let customMetals: [string, string] | undefined;
      let ring!: Ring;
      let silver!: Ring;
      let gold!: Ring;
      let diamonds: Ring[];
      function findMaterials() {
        const ringObject = instance.scene.findObjectsByName(secondModel ? "Scene_1" : "Scene")[0];
        const silverObject = instance.scene.findObjectsByName(
          secondModel ? "alliance" : "silver",
        )[0];
        const goldObject = instance.scene.findObjectsByName(secondModel ? "entourage" : "gold")[0];
        diamonds = (
          secondModel
            ? ["Object"]
            : [
                "diamonds",
                "diamonds001",
                "diamonds002",
                "diamonds003",
                "diamonds004",
                "diamonds005",
              ]
        ).flatMap((name) => instance.scene.findObjectsByName(name));
        if (!ringObject || !silverObject || !goldObject || !diamonds.length)
          throw new Error("The ring model could not be loaded. Please try again.");
        ring = ringObject;
        silver = silverObject;
        gold = goldObject;
      }
      findMaterials();
      const camera = instance.scene.activeCamera;
      const mobile = window.matchMedia("(max-width: 600px)").matches;
      if (camera.controls) camera.controls.enabled = false;
      if (mobile) {
        camera.setCameraOptions({ fov: 65 });
        bloom.enabled = false;
      }
      if (ssr.passes?.ssr) {
        ssr.passes.ssr.passObject.lowQualityFrames = 0;
        if (mobile) ssr.passes.ssr.passObject.stepCount /= 2;
      }
      if (bloom.pass) bloom.pass.passObject.bloomIterations = 2;
      if (ssao.passes?.ssao) ssao.passes.ssao.passObject.material.defines["NUM_SAMPLES"] = 4;

      const rotation = { x: ring.rotation.x, y: ring.rotation.y, z: ring.rotation.z };
      const colors = { forever: 0, emotions: 0 };
      const color = (value: string | number) => new runtime.Color(value).convertSRGBToLinear();
      const white = color(0xffffff),
        blue = color(0x39cffe),
        pink = color(0xf70db1);
      const silverColor = color(0xfefefe),
        goldColor = color(0xe2bf7f),
        rose = color(0xd28b8b),
        warmGold = color(0xf7c478);
      let needsUpdate = true;
      const update = () => {
        needsUpdate = true;
        instance.setDirty();
      };
      const updateColors = () => {
        // Like the reference, customization preserves the chosen look on return.
        if (customGem || customMetals) {
          update();
          return;
        }
        if (!customGem)
          for (const diamond of diamonds) {
            diamond.material.color.lerpColors(white, blue, colors.forever);
            if (colors.emotions > 0) diamond.material.color.lerpColors(blue, pink, colors.emotions);
          }
        if (!customMetals) {
          silver.material.color.lerpColors(silverColor, rose, colors.forever);
          gold.material.color.lerpColors(goldColor, rose, colors.forever);
          if (colors.emotions > 0)
            for (const metal of [silver, gold])
              metal.material.color.lerpColors(rose, warmGold, colors.emotions);
        }
        update();
      };
      instance.addEventListener("preFrame", () => {
        if (!needsUpdate || disposed) return;
        ring.rotation.set(rotation.x, rotation.y, rotation.z);
        camera.positionUpdated(false);
        camera.targetUpdated(true);
        needsUpdate = false;
      });
      instance.setBackground(color("#EEB7B5"));
      callbacks.current.onProgress(1);
      callbacks.current.onReady({
        position: camera.position,
        target: camera.target,
        rotation,
        colors,
        update,
        updateColors,
        setNight: (night) => {
          instance.setBackground(color(night ? "#22052f" : "#EEB7B5"));
          update();
        },
        setOrbit: (enabled) => {
          if (!camera.controls) return;
          Object.assign(camera.controls, {
            enabled,
            autoRotate: enabled,
            minDistance: enabled ? 5 : 0,
            maxDistance: enabled ? 13 : Infinity,
            enablePan: false,
            screenSpacePanning: false,
          });
        },
        setGem: (value) => {
          customGem = value;
          for (const diamond of diamonds) diamond.material.color = color(value);
          update();
        },
        setMetals: (first, second) => {
          customMetals = [first, second];
          silver.material.color = color(first);
          gold.material.color = color(second);
          update();
        },
        changeModel: async () => {
          instance.scene.removeSceneModels();
          secondModel = !secondModel;
          await manager.addFromPath(
            `https://webgi-jewelry.vercel.app/assets/${secondModel ? "ring2_webgi" : "ring_webgi"}.glb`,
          );
          if (disposed) return;
          findMaterials();
          Object.assign(rotation, { x: secondModel ? 0 : -Math.PI / 2, y: 0, z: 0 });
          if (customGem) for (const diamond of diamonds) diamond.material.color = color(customGem);
          if (customMetals) {
            silver.material.color = color(customMetals[0]);
            gold.material.color = color(customMetals[1]);
          }
          update();
        },
      });
    }

    setup().catch((error) => {
      if (disposed) return;
      console.error("Ring scene failed to load", error);
      callbacks.current.onError(
        "The 3D ring could not load. Please check your connection and try again.",
      );
    });
    return () => {
      disposed = true;
      viewer?.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="jewelry-canvas" aria-label="Animated diamond ring" />;
}
