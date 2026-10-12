import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, Volume2, VolumeX, Moon, Sun, Settings, X } from "lucide-react";
import type { RingController } from "@/components/RingScene";
import { createJewelryScroll } from "@/lib/jewelry-scroll";

const RingScene = lazy(() => import("@/components/RingScene"));
const referenceAsset = (name: string) => `https://webgi-jewelry.vercel.app/${name}`;
const gems: [string, string, string][] = [
  ["Ruby", "#f70db1", "ruby.9da343b5.svg"],
  ["Faint", "#cfecec", "faint.0d850f19.svg"],
  ["Fancy", "#a9cbe2", "fancy.dada7bdd.svg"],
  ["Aquamarine", "#62cffe", "aqua.755a8510.svg"],
  ["Swiss blue", "#76dce4", "swiss.b5799f23.svg"],
  ["Yellow", "#efe75b", "yellow.cc990856.svg"],
  ["Orange", "#eb8e17", "orange.4a867210.svg"],
  ["Green", "#17ebb5", "green.cc131b3c.svg"],
  ["Emerald", "#5eca00", "emerald.b61f0fe9.svg"],
  ["Rose", "#fa37d7", "rose.a498b2f5.svg"],
  ["Violet", "#c200f2", "violet.d61091fd.svg"],
];
const metals: [string, string, string, string][] = [
  ["Default", "#fea04d", "#ffffff", "default.d41b035d.png"],
  ["Silver and gold", "#ffffff", "#fea04d", "silver_gold.68ce4867.png"],
  ["Silver", "#ffffff", "#ffffff", "silver_silver.c0f79122.png"],
  ["Gold", "#fea04d", "#fea04d", "gold_gold.b32d73ce.png"],
  ["Rose and silver", "#fa8787", "#ffffff", "rose_silver.cb0922ee.png"],
  ["Gold and rose", "#fea04d", "#fa8787", "gold_rose.2b9d889a.png"],
  ["Rose gold", "#fa8787", "#fa8787", "rose_rose.8dafeb12.png"],
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unique Jewelry | Mancini & Co" },
      {
        name: "description",
        content:
          "Explore the Mancini & Co jewelry collection through an animated diamond ring experience.",
      },
      { property: "og:title", content: "Unique Jewelry | Mancini & Co" },
      {
        property: "og:description",
        content:
          "Explore the Mancini & Co jewelry collection through an animated diamond ring experience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const root = useRef<HTMLElement>(null);
  const [controller, setController] = useState<RingController>();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [interactive, setInteractive] = useState(false);
  const [section, setSection] = useState(0);
  const [muted, setMuted] = useState(true);
  const [night, setNight] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [menu, setMenu] = useState<"gems" | "metals" | null>(null);
  const [gem, setGem] = useState("Ruby");
  const [metal, setMetal] = useState("Default");
  const [changingModel, setChangingModel] = useState(false);
  const audio = useRef<HTMLAudioElement | undefined>(undefined);
  const smooth = useRef<ReturnType<typeof createJewelryScroll> | undefined>(undefined);
  const scrollAnimations = useRef<ScrollTrigger[]>([]);
  const configAnimation = useRef<gsap.core.Timeline | undefined>(undefined);
  const introAnimation = useRef<gsap.core.Timeline | undefined>(undefined);
  const secondModel = useRef(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousOverflow = document.body.style.overflowY;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    const previousRestoration = window.history.scrollRestoration;
    document.body.style.overflowY = "hidden";
    document.documentElement.style.scrollBehavior = "auto";
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    smooth.current = createJewelryScroll(reducedMotion.current);
    audio.current = new Audio("https://webgi-jewelry.vercel.app/assets/sounds/music_loop.mp3");
    audio.current.loop = true;
    audio.current.volume = 0.1;
    const onScroll = () => {
      const sections = root.current?.querySelectorAll<HTMLElement>(".jewelry-section");
      if (!sections) return;
      let active = 0;
      sections.forEach((element, index) => {
        if (element.getBoundingClientRect().top <= window.innerHeight / 2) active = index;
      });
      setSection(active);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      smooth.current?.destroy();
      audio.current?.pause();
      configAnimation.current?.kill();
      window.removeEventListener("scroll", onScroll);
      document.body.style.overflowY = previousOverflow;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    if (!controller || !root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = reducedMotion.current;
    const mobile = () => window.matchMedia("(max-width: 600px)").matches;
    const { position, target, rotation, colors, update, updateColors } = controller;
    const ctx = gsap.context(() => {
      function setupScroll() {
        const before = new Set(ScrollTrigger.getAll());
        const first = {
          trigger: ".jewelry-forever-section",
          start: "top bottom",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
        };
        const second = {
          trigger: ".jewelry-emotions-section",
          start: "top bottom",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
        };
        // Separate scroll tweens retain the original easing and exact section boundaries.
        gsap.to(position, {
          x: -1.83,
          y: -0.14,
          z: 6.15,
          scrollTrigger: first,
          immediateRender: false,
          onUpdate: update,
        });
        gsap.to(target, {
          x: () => (mobile() ? 0 : -0.78),
          y: () => (mobile() ? 1.5 : -0.03),
          z: -0.12,
          scrollTrigger: first,
          immediateRender: false,
          onUpdate: update,
        });
        gsap.to(rotation, {
          x: 0,
          y: 0,
          z: Math.PI / 2,
          scrollTrigger: first,
          immediateRender: false,
          onUpdate: update,
        });
        gsap.fromTo(
          colors,
          { forever: 0 },
          { forever: 1, scrollTrigger: first, immediateRender: false, onUpdate: updateColors },
        );
        gsap.to(".jewelry-scroller", {
          autoAlpha: 0,
          yPercent: 150,
          scrollTrigger: { ...first, end: "top center", scrub: reduced ? true : 1 },
          immediateRender: false,
        });
        gsap.to(".jewelry-copy", {
          autoAlpha: 0,
          xPercent: 100,
          ease: "power4.out",
          scrollTrigger: { ...first, scrub: reduced ? true : 1 },
          immediateRender: false,
        });
        gsap.to(".jewelry-forever .jewelry-backword", {
          opacity: 0.1,
          ease: "power4.inOut",
          scrollTrigger: { ...first, scrub: reduced ? true : 1 },
          immediateRender: false,
        });
        gsap.fromTo(
          ".jewelry-forever",
          { autoAlpha: 0, xPercent: reduced ? 0 : -110 },
          {
            autoAlpha: 1,
            xPercent: 0,
            ease: "power4.inOut",
            scrollTrigger: { ...first, scrub: reduced ? true : 1 },
            immediateRender: false,
          },
        );
        gsap.to(".jewelry-dot-0", {
          opacity: 0.5,
          scale: 1,
          ease: "power4.inOut",
          scrollTrigger: { ...first, scrub: reduced ? true : 1 },
        });
        gsap.to(".jewelry-dot-1", {
          opacity: 1,
          scale: 1.5,
          ease: "power4.inOut",
          scrollTrigger: { ...first, scrub: reduced ? true : 1 },
        });

        gsap.to(position, {
          x: -0.06,
          y: -1.15,
          z: 4.42,
          scrollTrigger: second,
          immediateRender: false,
          onUpdate: update,
        });
        gsap.to(target, {
          x: -0.01,
          y: 0.9,
          z: 0.07,
          scrollTrigger: second,
          immediateRender: false,
          onUpdate: update,
        });
        gsap.to(rotation, {
          x: 0,
          y: 0,
          z: -Math.PI / 2,
          scrollTrigger: second,
          immediateRender: false,
          onUpdate: update,
        });
        gsap.fromTo(
          colors,
          { emotions: 0 },
          { emotions: 1, scrollTrigger: second, immediateRender: false, onUpdate: updateColors },
        );
        gsap.to(".jewelry-forever", {
          autoAlpha: 0,
          xPercent: reduced ? 0 : -110,
          ease: "power4.inOut",
          scrollTrigger: { ...second, scrub: reduced ? true : 1 },
          immediateRender: false,
        });
        gsap.to(".jewelry-emotions .jewelry-backword", {
          opacity: 0.1,
          ease: "power4.inOut",
          scrollTrigger: { ...second, scrub: reduced ? true : 1 },
          immediateRender: false,
        });
        gsap.fromTo(
          ".jewelry-emotions-content",
          { autoAlpha: 0, yPercent: reduced ? 0 : 130 },
          {
            autoAlpha: 1,
            yPercent: 0,
            ease: "power4.inOut",
            scrollTrigger: { ...second, scrub: reduced ? true : 1 },
            immediateRender: false,
          },
        );
        gsap.to(".jewelry-dot-1", {
          opacity: 0.5,
          scale: 1,
          ease: "power4.inOut",
          scrollTrigger: { ...second, scrub: reduced ? true : 1 },
          immediateRender: false,
        });
        gsap.to(".jewelry-dot-2", {
          opacity: 1,
          scale: 1.5,
          ease: "power4.inOut",
          scrollTrigger: { ...second, scrub: reduced ? true : 1 },
          immediateRender: false,
        });
        scrollAnimations.current = ScrollTrigger.getAll().filter((trigger) => !before.has(trigger));
        document.body.style.overflowY = "auto";
        smooth.current?.start();
        setInteractive(true);
        ScrollTrigger.refresh();
      }
      // Loading completes first, then the camera settles before the UI enters.
      introAnimation.current = gsap.timeline();
      if (reduced) {
        gsap.set(position, { x: 1.28, y: -1.7, z: 5.86 });
        gsap.set(target, { x: mobile() ? -0.21 : 0.91, y: 0.03, z: -0.25 });
        gsap.set(".jewelry-loader", { xPercent: 100, autoAlpha: 0 });
        gsap.set([".jewelry-header", ".jewelry-copy", ".jewelry-scroller", ".jewelry-dots"], {
          autoAlpha: 1,
        });
        gsap.set(".jewelry-dot-0", { opacity: 1, scale: 1.5 });
        update();
        setupScroll();
      } else {
        introAnimation.current
          .to(".jewelry-loader", { xPercent: 100, duration: 0.8, ease: "power4.inOut" }, 1)
          .fromTo(
            position,
            { x: 3, y: -0.8, z: 1.2 },
            { x: 1.28, y: -1.7, z: 5.86, duration: 4, onUpdate: update },
            1,
          )
          .fromTo(
            target,
            { x: 2.5, y: -0.07, z: -0.1 },
            { x: mobile() ? -0.21 : 0.91, y: 0.03, z: -0.25, duration: 4, onUpdate: update },
            1,
          )
          .fromTo(
            ".jewelry-header",
            { autoAlpha: 0, yPercent: -100 },
            { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: "power1.inOut" },
            4,
          )
          .fromTo(
            ".jewelry-scroller",
            { autoAlpha: 0, yPercent: 150 },
            { autoAlpha: 1, yPercent: 0, duration: 1, ease: "power4.inOut" },
            4,
          )
          .fromTo(
            ".jewelry-copy",
            { autoAlpha: 0, xPercent: 100 },
            {
              autoAlpha: 1,
              xPercent: 0,
              duration: 1.8,
              ease: "power4.inOut",
              onComplete: () => ctx.add(setupScroll),
            },
            4,
          )
          .fromTo(
            ".jewelry-dots",
            { autoAlpha: 0, xPercent: 50 },
            { autoAlpha: 1, xPercent: 0, duration: 2, ease: "power4.inOut" },
            4.8,
          )
          .set(".jewelry-dot-0", { opacity: 1, scale: 1.5 }, 4.8);
      }
    }, root);
    return () => {
      ctx.revert();
      scrollAnimations.current = [];
    };
  }, [controller]);

  useEffect(() => {
    controller?.setNight(night);
  }, [controller, night]);
  useEffect(() => {
    if (!error) return;
    introAnimation.current?.kill();
    document.body.style.overflowY = "auto";
  }, [error]);

  function goTo(index: number) {
    if (!interactive || customizing) return;
    const element = root.current?.querySelectorAll(".jewelry-section")[index];
    if (element) smooth.current?.scrollTo(window.scrollY + element.getBoundingClientRect().top);
  }
  async function toggleMusic() {
    if (!audio.current) return;
    if (audio.current.paused) {
      try {
        await audio.current.play();
        setMuted(false);
      } catch {
        setMuted(true);
      }
    } else {
      audio.current.pause();
      setMuted(true);
    }
  }
  function animateView(
    position: { x: number; y: number; z: number },
    target: { x: number; y: number; z: number },
    duration: number,
  ) {
    if (!controller) return;
    configAnimation.current?.kill();
    controller.setOrbit(false);
    const timeline = gsap.timeline({
      defaults: { duration: reducedMotion.current ? 0 : duration, onUpdate: controller.update },
    });
    timeline.to(controller.position, position, 0).to(controller.target, target, 0);
    configAnimation.current = timeline;
    return timeline;
  }
  function customize() {
    if (!controller || !interactive) return;
    smooth.current?.stop();
    document.body.style.overflowY = "hidden";
    scrollAnimations.current.forEach((trigger) => trigger.disable(false));
    setCustomizing(true);
    if (muted) void toggleMusic();
    const timeline = animateView({ x: -0.17, y: -0.25, z: 8.5 }, { x: 0, y: 0, z: 0 }, 2.5);
    timeline
      ?.to(
        controller.rotation,
        {
          x: secondModel.current ? 0 : -Math.PI / 2,
          y: 0,
          z: secondModel.current ? 0 : -Math.PI / 2,
        },
        0,
      )
      .to(
        ".jewelry-emotions-content",
        {
          autoAlpha: 0,
          xPercent: 130,
          duration: reducedMotion.current ? 0 : 1.5,
          ease: "power4.out",
        },
        0,
      )
      .fromTo(
        ".jewelry-config-footer",
        { autoAlpha: 0, yPercent: 150 },
        { autoAlpha: 1, yPercent: 0, duration: reducedMotion.current ? 0 : 1.5 },
        reducedMotion.current ? 0 : 2.5,
      )
      .call(() => controller.setOrbit(true));
  }
  function exitCustomization() {
    if (!controller || changingModel) return;
    setMenu(null);
    const timeline = animateView(
      { x: -0.06, y: -1.15, z: 4.42 },
      { x: -0.01, y: 0.9, z: 0.07 },
      1.2,
    );
    timeline
      ?.to(controller.rotation, { x: 0, y: 0, z: -Math.PI / 2, ease: "power4.out" }, 0)
      .to(".jewelry-config-footer", { autoAlpha: 0, yPercent: 150 }, 0)
      .to(
        ".jewelry-emotions-content",
        {
          autoAlpha: 1,
          xPercent: 0,
          duration: reducedMotion.current ? 0 : 0.5,
          ease: "power4.out",
        },
        0,
      )
      .call(() => {
        setCustomizing(false);
        document.body.style.overflowY = "auto";
        scrollAnimations.current.forEach((trigger) => trigger.enable(false, false));
        smooth.current?.start();
      });
  }
  function openMenu(next: "gems" | "metals" | null) {
    setMenu(next);
    const mobile = window.matchMedia("(max-width: 600px)").matches;
    animateView(
      next === "gems" ? { x: 1.6, y: 3.66, z: 2.55 } : { x: -0.17, y: -0.25, z: 8.5 },
      next === "gems"
        ? { x: mobile ? 0 : -0.01, y: mobile ? 0.5 : 0.89, z: -0.09 }
        : { x: 0, y: 0, z: 0 },
      next === "gems" ? 1.5 : 2.5,
    )?.call(() => controller?.setOrbit(true));
  }
  async function changeModel() {
    if (!controller || changingModel) return;
    setChangingModel(true);
    setMenu(null);
    try {
      await controller.changeModel();
      secondModel.current = !secondModel.current;
    } catch {
      setError("The alternative ring could not load. Please reload to try again.");
    } finally {
      setChangingModel(false);
    }
  }

  return (
    <main
      ref={root}
      className="jewelry-page"
      data-night={night}
      data-customizing={customizing}
      data-interactive={interactive}
    >
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <RingScene onReady={setController} onProgress={setProgress} onError={setError} />
        </Suspense>
      </ClientOnly>
      <div
        className="jewelry-loader"
        role="status"
        aria-live="polite"
        aria-hidden={interactive && !error}
      >
        <svg width="48" height="48" fill="none" aria-hidden="true">
          <circle cx="25" cy="29" r="15" stroke="currentColor" strokeWidth="2" />
          <path
            d="m18 8 3-4h8l3 4-7 6-7-6Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p>{error || "Loading... Please wait"}</p>
        {error ? (
          <button className="jewelry-button" onClick={() => window.location.reload()}>
            Try again
          </button>
        ) : (
          <div className="jewelry-progress" style={{ transform: `scaleX(${progress})` }} />
        )}
      </div>
      {error && controller && (
        <div className="jewelry-load-error" role="alert">
          {error}
          <button onClick={() => window.location.reload()}>Try again</button>
        </div>
      )}
      <header className="jewelry-header">
        <div className="jewelry-brand">
          MANCINI &amp; CO{" "}
          <a href="https://www.neotix.com.br/lab" target="_blank" rel="noreferrer">
            BY NEOTIX
          </a>
        </div>
        <nav className="jewelry-navigation" aria-label="Main navigation">
          <a href="https://www.neotix.com.br/lab" target="_blank" rel="noreferrer">
            Know more
          </a>
          <button
            aria-label={muted ? "Turn sound on" : "Mute sound"}
            onClick={() => void toggleMusic()}
          >
            {muted ? <VolumeX size={24} strokeWidth={1} /> : <Volume2 size={24} strokeWidth={1} />}
          </button>
          <button aria-label={night ? "Day mode" : "Night mode"} onClick={() => setNight(!night)}>
            {night ? <Sun size={24} strokeWidth={1} /> : <Moon size={24} strokeWidth={1} />}
          </button>
        </nav>
      </header>
      <section className="jewelry-section jewelry-hero-section" aria-label="Unique jewelry">
        <div className="jewelry-copy" inert={!interactive || section !== 0 || customizing}>
          <div className="jewelry-hero-content">
            <h1 className="jewelry-title">
              Unique
              <br />
              Jewelry
            </h1>
            <div className="jewelry-hero-text">
              <p className="jewelry-description">
                Customize your unique ring with graphic angles and pure lines that combine to create
                the pure beauty of the collection.
              </p>
              <button className="jewelry-button jewelry-start" onClick={() => goTo(1)}>
                Start now{" "}
                <span className="jewelry-cta-circle">
                  <ArrowDown size={24} strokeWidth={1} />
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="jewelry-scroll">
          <button
            className="jewelry-scroller"
            onClick={() => goTo(1)}
            disabled={!interactive}
            aria-label="Scroll to Forever"
          >
            <span>Start scrolling to explore</span>
            <ArrowDown size={24} strokeWidth={1.5} />
          </button>
        </div>
      </section>
      <section className="jewelry-section jewelry-forever-section" aria-label="Forever">
        <div className="jewelry-forever" inert={section !== 1 || customizing}>
          <div className="jewelry-backword" aria-hidden="true">
            Forever
          </div>
          <div className="jewelry-forever-content">
            <div className="script">created to last</div>
            <h2>
              For
              <br />
              ever
            </h2>
            <p>
              Customize your unique ring with graphic angles and pure lines that combine to create
              the pure beauty of the collection.
            </p>
          </div>
        </div>
      </section>
      <section className="jewelry-section jewelry-emotions-section" aria-label="Emotions">
        <div className="jewelry-emotions" inert={section !== 2 || customizing}>
          <div className="jewelry-backword" aria-hidden="true">
            Emotions
          </div>
          <div className="jewelry-emotions-content">
            <div className="jewelry-emotions-text">
              <div className="script">share your</div>
              <h2>Emotions</h2>
              <p>
                Colorful gemstones from aquamarine, amethyst, tourmaline to diamonds come together
                in white gold on this luxury ring.
              </p>
            </div>
            <button className="jewelry-button jewelry-customize" onClick={customize}>
              Customize it <Settings size={24} strokeWidth={1} />
            </button>
          </div>
        </div>
      </section>
      <nav className="jewelry-dots" aria-label="Sections" inert={!interactive || customizing}>
        {["Unique jewelry", "Forever", "Emotions"].map((label, index) => (
          <button
            key={label}
            aria-label={label}
            aria-current={section === index ? "step" : undefined}
            onClick={() => goTo(index)}
          >
            <span className={`jewelry-dot jewelry-dot-${index}`} />
          </button>
        ))}
      </nav>
      <div className="jewelry-config-header" inert={!customizing}>
        <h3>Customize your ring</h3>
        <p>Created by Neotix and Pixotronics. All rights reserved.</p>
        <button
          aria-label={muted ? "Turn sound on" : "Mute sound"}
          onClick={() => void toggleMusic()}
        >
          {muted ? <VolumeX size={24} strokeWidth={1} /> : <Volume2 size={24} strokeWidth={1} />}
        </button>
        <button aria-label={night ? "Day mode" : "Night mode"} onClick={() => setNight(!night)}>
          {night ? <Sun size={24} strokeWidth={1} /> : <Moon size={24} strokeWidth={1} />}
        </button>
        <button className="jewelry-exit" onClick={exitCustomization} disabled={changingModel}>
          Exit
        </button>
      </div>
      <div className="jewelry-config-footer" inert={!customizing}>
        {menu && (
          <div
            className="jewelry-palette"
            data-menu={menu}
            aria-label={menu === "gems" ? "Gemstone colors" : "Metal finishes"}
          >
            {menu === "gems"
              ? gems.map(([label, value, asset]) => (
                  <button
                    key={label}
                    aria-label={label}
                    aria-pressed={gem === label}
                    onClick={() => {
                      setGem(label);
                      controller?.setGem(value);
                    }}
                  >
                    <img src={referenceAsset(asset)} alt="" width={32} height={32} />
                  </button>
                ))
              : metals.map(([label, first, second, asset]) => (
                  <button
                    key={label}
                    aria-label={label}
                    aria-pressed={metal === label}
                    onClick={() => {
                      setMetal(label);
                      controller?.setMetals(first, second);
                    }}
                  >
                    <img src={referenceAsset(asset)} alt="" width={60} />
                  </button>
                ))}
            <button aria-label="Close palette" onClick={() => openMenu(null)}>
              <X size={24} strokeWidth={1} />
            </button>
          </div>
        )}
        <div className="jewelry-config-buttons">
          <button
            aria-label="Configure gemstones"
            aria-pressed={menu === "gems"}
            onClick={() => openMenu(menu === "gems" ? null : "gems")}
          >
            <img src={referenceAsset("diamond.db72a3a1.svg")} alt="" width={32} height={32} />
          </button>
          <button
            aria-label="Configure metals"
            aria-pressed={menu === "metals"}
            onClick={() => openMenu(menu === "metals" ? null : "metals")}
          >
            <img src={referenceAsset("material.4aa2ee7a.svg")} alt="" width={32} height={32} />
          </button>
          <button
            aria-label="Change ring design"
            disabled={changingModel}
            onClick={() => void changeModel()}
          >
            <img src={referenceAsset("ring.57707868.svg")} alt="" width={32} height={32} />
          </button>
        </div>
        {changingModel && <p role="status">Loading ring…</p>}
      </div>
    </main>
  );
}
