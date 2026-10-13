import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Settings,
  X,
  ShoppingBag,
  Menu,
  ArrowUpRight,
  Heart,
  Link2,
  Pencil,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import type { RingController } from "@/components/RingScene";
import { createJewelryScroll } from "@/lib/jewelry-scroll";
import { createJewelryTimeline } from "@/lib/jewelry-animation";
import { CartProvider, useCartStore } from "@/hooks/use-cart-store";
import {
  customRingPrice,
  formatPrice,
  ringSizes,
  type CustomRing,
  type Product,
} from "@/lib/jewelry-data";
import { JewelryCollections } from "@/components/JewelryCollections";
import { ProductQuickViewModal } from "@/components/ProductQuickViewModal";
import { CraftsmanshipSection } from "@/components/CraftsmanshipSection";
import { DiamondGuide } from "@/components/DiamondGuide";
import { PressReviewsSection } from "@/components/PressReviewsSection";
import { CartDrawer } from "@/components/CartDrawer";
import { ConciergeModal, ConciergeSection } from "@/components/ConciergeModal";
import { JewelryFooter } from "@/components/JewelryFooter";
import { FloatingRingPip } from "@/components/FloatingRingPip";
import { JewelrySelectionsProvider, useJewelrySelections } from "@/hooks/use-jewelry-selections";
import { decodeRingDesign, gems, metals } from "@/lib/ring-designs";
import { SavedJewelryDrawer } from "@/components/SavedJewelryDrawer";
import { ProductComparisonModal } from "@/components/ProductComparisonModal";
import {
  RingPersonalizationModal,
  type PersonalizationMode,
} from "@/components/RingPersonalizationModal";

const RingScene = lazy(() => import("@/components/RingScene"));
const referenceAsset = (name: string) => `https://webgi-jewelry.vercel.app/${name}`;
const copyVector = ({ x, y, z }: RingController["position"]) => ({ x, y, z });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mancini & Co | Extraordinary Jewelry, Made Personal" },
      {
        name: "description",
        content:
          "Discover the Mancini & Co collection, create your own ring in 3D, and explore the art of extraordinary jewelry.",
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
  return (
    <CartProvider>
      <JewelrySelectionsProvider>
        <JewelryExperience />
      </JewelrySelectionsProvider>
    </CartProvider>
  );
}

function JewelryExperience() {
  const root = useRef<HTMLElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const cart = useCartStore();
  const selections = useJewelrySelections();
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
  const [pastHero, setPastHero] = useState(false);
  const [pipCollapsed, setPipCollapsed] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);
  const [ringSize, setRingSize] = useState("7");
  const [design, setDesign] = useState<CustomRing["design"]>("Signature");
  const [engraving, setEngraving] = useState("");
  const [engravingStyle, setEngravingStyle] = useState<"Serif" | "Sans">("Serif");
  const [personalization, setPersonalization] = useState<PersonalizationMode>(null);
  const [pendingDesign, setPendingDesign] = useState<CustomRing | null>(null);
  const [restoringRing, setRestoringRing] = useState(false);
  const loading = !error && (!controller || Boolean(pendingDesign));
  const sharedDesignPending = useRef(false);
  const audio = useRef<HTMLAudioElement | undefined>(undefined);
  const smooth = useRef<ReturnType<typeof createJewelryScroll> | undefined>(undefined);
  const scrollAnimations = useRef<ScrollTrigger[]>([]);
  const configAnimation = useRef<gsap.core.Timeline | undefined>(undefined);
  const introAnimation = useRef<gsap.core.Timeline | undefined>(undefined);
  const secondModel = useRef(false);
  const reducedMotion = useRef(false);
  const activeSection = useRef(0);
  const docked = useRef(false);
  const viewBeforeDock = useRef<
    Pick<RingController, "position" | "target" | "rotation"> | undefined
  >(undefined);
  const customReturnFocus = useRef<HTMLElement | null>(null);
  const viewBeforeCustomization = useRef<
    Pick<RingController, "position" | "target" | "rotation"> | undefined
  >(undefined);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousOverflow = document.body.style.overflowY;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    const previousRestoration = window.history.scrollRestoration;
    document.body.style.overflowY = "auto";
    document.documentElement.style.scrollBehavior = "auto";
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    smooth.current = createJewelryScroll(reducedMotion.current);
    smooth.current.start();
    const shared = new URLSearchParams(window.location.search).get("ring");
    if (shared) {
      const specs = decodeRingDesign(shared);
      if (specs) {
        sharedDesignPending.current = true;
        setPendingDesign(specs);
      } else toast.info("This ring link is incomplete. You can create a fresh design.");
    }
    audio.current = new Audio("https://webgi-jewelry.vercel.app/assets/sounds/music_loop.mp3");
    audio.current.loop = true;
    audio.current.volume = 0.1;
    return () => {
      smooth.current?.destroy();
      audio.current?.pause();
      configAnimation.current?.kill();
      document.body.style.overflowY = previousOverflow;
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    if (!controller || !root.current) return;
    const sceneController = controller;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = reducedMotion.current;
    const mobile = () => window.matchMedia("(max-width: 600px)").matches;
    const { position, target, update } = controller;
    let initialized = false;
    let finishEntrance = () => {};
    const ctx = gsap.context(() => {
      function setupScroll() {
        if (initialized) return;
        initialized = true;
        window.removeEventListener("scroll", finishEntrance);
        const timeline = createJewelryTimeline(sceneController, reduced, mobile);
        const updateSection = (trigger: ScrollTrigger) => {
          const next = Math.min(2, Math.floor(trigger.progress * 2 + 0.5));
          if (activeSection.current === next) return;
          activeSection.current = next;
          setSection(next);
        };
        const trigger = ScrollTrigger.create({
          animation: timeline,
          trigger: ".jewelry-forever-section",
          start: "top bottom",
          endTrigger: ".jewelry-emotions-section",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: updateSection,
          onRefresh: updateSection,
        });
        scrollAnimations.current = [trigger];
        setInteractive(true);
        ScrollTrigger.refresh();
      }
      // Browsing stays available while loading and during the short camera entrance.
      const settle = () => {
        gsap.set(position, { x: 1.28, y: -1.7, z: 5.86 });
        gsap.set(target, { x: mobile() ? -0.21 : 0.91, y: 0.03, z: -0.25 });
        gsap.set([".jewelry-copy", ".jewelry-scroller", ".jewelry-dots"], {
          autoAlpha: 1,
        });
        gsap.set(".jewelry-dot-0", { opacity: 1, scale: 1.5 });
        update();
        setupScroll();
      };
      finishEntrance = () => {
        introAnimation.current?.kill();
        ctx.add(settle);
      };
      if (reduced || window.scrollY > 20 || sharedDesignPending.current) {
        settle();
      } else {
        window.addEventListener("scroll", finishEntrance, { passive: true });
        introAnimation.current = gsap.timeline({ onComplete: () => ctx.add(settle) });
        introAnimation.current
          .fromTo(
            position,
            { x: 3, y: -0.8, z: 1.2 },
            { x: 1.28, y: -1.7, z: 5.86, duration: 1.8, onUpdate: update },
            0,
          )
          .fromTo(
            target,
            { x: 2.5, y: -0.07, z: -0.1 },
            { x: mobile() ? -0.21 : 0.91, y: 0.03, z: -0.25, duration: 1.8, onUpdate: update },
            0,
          );
      }
    }, root);
    return () => {
      window.removeEventListener("scroll", finishEntrance);
      ctx.revert();
      scrollAnimations.current = [];
    };
  }, [controller]);

  useEffect(() => {
    controller?.setNight(night);
  }, [controller, night]);
  useEffect(() => {
    if (loading) document.body.style.overflowY = "hidden";
    else if (!customizing) document.body.style.overflowY = "auto";
  }, [loading, customizing]);
  useEffect(() => {
    if (!error) return;
    introAnimation.current?.kill();
    document.body.style.overflowY = "auto";
    smooth.current?.start();
    setInteractive(true);
    if (!controller)
      gsap.set([".jewelry-header", ".jewelry-copy", ".jewelry-scroller"], { autoAlpha: 1 });
  }, [error]);

  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    const observe = () => {
      if (!hero.current) return;
      observer?.disconnect();
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          setPastHero(
            !entry.isIntersecting &&
              entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0),
          );
        },
        { rootMargin: `-${window.innerHeight * 0.45}px 0px 0px 0px`, threshold: 0 },
      );
      observer.observe(hero.current);
    };
    observe();
    window.addEventListener("resize", observe);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, []);

  useEffect(() => {
    const space = root.current?.querySelector<HTMLElement>(".pip-canvas-space");
    if (!space || !root.current) return;
    const measure = () => {
      const rect = space.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      root.current?.style.setProperty("--pip-top", `${rect.top}px`);
      root.current?.style.setProperty("--pip-left", `${rect.left}px`);
      root.current?.style.setProperty("--pip-width", `${rect.width}px`);
      root.current?.style.setProperty("--pip-height", `${rect.height}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(space);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pastHero, pipCollapsed]);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 480px)");
    const minimize = () => {
      if (narrow.matches) setPipCollapsed(true);
    };
    minimize();
    narrow.addEventListener("change", minimize);
    return () => narrow.removeEventListener("change", minimize);
  }, []);

  useEffect(() => {
    if (!controller || !interactive || customizing || docked.current === pastHero) return;
    docked.current = pastHero;
    configAnimation.current?.kill();
    controller.setOrbit(false);
    if (pastHero) {
      scrollAnimations.current.forEach((trigger) => trigger.disable(false));
      viewBeforeDock.current = {
        position: copyVector(controller.position),
        target: copyVector(controller.target),
        rotation: copyVector(controller.rotation),
      };
      animateView({ x: -0.17, y: -0.25, z: 8.5 }, { x: 0, y: 0, z: 0 }, 0.65)
        ?.to(
          controller.rotation,
          {
            x: secondModel.current ? 0 : -Math.PI / 2,
            y: 0,
            z: secondModel.current ? 0 : -Math.PI / 2,
          },
          0,
        )
        .call(() => controller.setOrbit(!pipCollapsed));
    } else {
      const view = viewBeforeDock.current;
      if (view) {
        Object.assign(controller.position, view.position);
        Object.assign(controller.target, view.target);
        Object.assign(controller.rotation, view.rotation);
        controller.update();
      }
      scrollAnimations.current.forEach((trigger) => trigger.enable(false, true));
      ScrollTrigger.update();
    }
  }, [controller, interactive, pastHero, customizing]);

  useEffect(() => {
    if (pastHero && !customizing) controller?.setOrbit(!pipCollapsed);
  }, [pipCollapsed]);

  useEffect(() => {
    // Radix owns modal focus/overflow; stop Lenis so wheel input cannot move the page beneath it.
    const overlay =
      cart.cartOpen ||
      cart.conciergeOpen ||
      Boolean(quickProduct) ||
      mobileMenu ||
      selections.savedOpen ||
      selections.comparisonOpen ||
      Boolean(personalization) ||
      restoringRing ||
      loading;
    const synchronize = () => {
      if (overlay || customizing || document.body.hasAttribute("data-scroll-locked"))
        smooth.current?.stop();
      else smooth.current?.start();
    };
    synchronize();
    const observer = new MutationObserver(synchronize);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });
    return () => observer.disconnect();
  }, [
    cart.cartOpen,
    cart.conciergeOpen,
    quickProduct,
    mobileMenu,
    customizing,
    selections.savedOpen,
    selections.comparisonOpen,
    personalization,
    restoringRing,
    loading,
  ]);

  useEffect(() => {
    if (!customizing) return;
    root.current?.querySelector<HTMLButtonElement>(".jewelry-exit")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (
        cart.cartOpen ||
        cart.conciergeOpen ||
        quickProduct ||
        personalization ||
        selections.savedOpen ||
        selections.comparisonOpen
      )
        return;
      if (event.key === "Escape") {
        event.preventDefault();
        exitCustomization();
      }
      if (event.key !== "Tab") return;
      const elements = Array.from(
        root.current?.querySelectorAll<HTMLElement>(
          ".jewelry-config-header button:not(:disabled), .jewelry-config-footer button:not(:disabled), .jewelry-config-footer select, .jewelry-canvas",
        ) ?? [],
      ).filter((element) => getComputedStyle(element).visibility !== "hidden");
      const first = elements[0],
        last = elements.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !elements.includes(document.activeElement as HTMLElement))
      ) {
        event.preventDefault();
        last?.focus();
      }
      if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !elements.includes(document.activeElement as HTMLElement))
      ) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [
    customizing,
    changingModel,
    cart.cartOpen,
    cart.conciergeOpen,
    quickProduct,
    menu,
    personalization,
    selections.savedOpen,
    selections.comparisonOpen,
  ]);

  const customSpecs = useMemo<CustomRing>(() => {
    const chosenGem = gems.find(([label]) => label === gem)!;
    const chosenMetal = metals.find(([label]) => label === metal)!;
    return {
      gem,
      gemColor: chosenGem[1],
      metal,
      metalColors: [chosenMetal[1], chosenMetal[2]],
      design,
      size: ringSize,
      ...(engraving ? { engraving, engravingStyle } : {}),
    };
  }, [gem, metal, design, ringSize, engraving, engravingStyle]);

  const goToId = useCallback(
    (id: string) => {
      setMobileMenu(false);
      const element = document.getElementById(id);
      if (!element || customizing) return;
      smooth.current?.start();
      smooth.current?.scrollTo(
        Math.max(0, element.getBoundingClientRect().top + window.scrollY - 88),
      );
    },
    [customizing],
  );

  const goTo = useCallback(
    (index: number) => {
      if (customizing) return;
      const element = root.current?.querySelectorAll<HTMLElement>(".jewelry-section")[index];
      if (element) smooth.current?.scrollTo(element);
    },
    [customizing],
  );
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
  const animateView = useCallback(
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
    },
    [controller],
  );
  const customize = useCallback(
    function customize(specs: CustomRing = customSpecs) {
      if (!controller || !interactive) return;
      smooth.current?.stop();
      document.body.style.overflowY = "hidden";
      scrollAnimations.current.forEach((trigger) => trigger.disable(false));
      viewBeforeCustomization.current = {
        position: copyVector(controller.position),
        target: copyVector(controller.target),
        rotation: copyVector(controller.rotation),
      };
      customReturnFocus.current = document.activeElement as HTMLElement | null;
      controller.setGem(specs.gemColor);
      controller.setMetals(specs.metalColors[0], specs.metalColors[1]);
      setCustomizing(true);
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
    },
    [controller, interactive, customSpecs, animateView],
  );
  function exitCustomization() {
    if (!controller || changingModel) return;
    setMenu(null);
    const view = viewBeforeCustomization.current;
    const timeline = animateView(
      view?.position ?? { x: -0.06, y: -1.15, z: 4.42 },
      view?.target ?? { x: -0.01, y: 0.9, z: 0.07 },
      1.2,
    );
    timeline
      ?.to(
        controller.rotation,
        {
          ...(view?.rotation ?? { x: 0, y: 0, z: -Math.PI / 2 }),
          ease: "power4.out",
        },
        0,
      )
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
        if (pastHero) controller.setOrbit(!pipCollapsed);
        else scrollAnimations.current.forEach((trigger) => trigger.enable(false, false));
        smooth.current?.start();
        customReturnFocus.current?.focus({ preventScroll: true });
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
      setDesign(secondModel.current ? "Halo" : "Signature");
    } catch {
      setError("The alternative ring could not load. Please reload to try again.");
    } finally {
      setChangingModel(false);
    }
  }

  useEffect(() => {
    if (!pendingDesign || !controller || !interactive) return;
    let cancelled = false;
    const restore = async () => {
      setRestoringRing(true);
      setChangingModel(true);
      controller.setOrbit(false);
      scrollAnimations.current.forEach((trigger) => trigger.disable(false));
      try {
        if ((pendingDesign.design === "Halo") !== secondModel.current) {
          await controller.changeModel();
          secondModel.current = pendingDesign.design === "Halo";
        }
        if (cancelled) return;
        setGem(pendingDesign.gem);
        setMetal(pendingDesign.metal);
        setDesign(pendingDesign.design);
        setRingSize(pendingDesign.size);
        setEngraving(pendingDesign.engraving ?? "");
        setEngravingStyle(pendingDesign.engravingStyle ?? "Serif");
        customize(pendingDesign);
        toast.success("Your ring design is ready to explore");
      } catch {
        if (!cancelled) {
          scrollAnimations.current.forEach((trigger) => trigger.enable(false, true));
          toast.error("This ring design could not load. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setPendingDesign(null);
          setRestoringRing(false);
          setChangingModel(false);
          sharedDesignPending.current = false;
        }
      }
    };
    void restore();
    return () => {
      cancelled = true;
    };
  }, [pendingDesign, controller, interactive, customize]);

  function reopenDesign(specs: CustomRing) {
    setPendingDesign(specs);
    if (!controller)
      toast.info(
        "Your design will open as soon as the 3D ring finishes loading. You can keep browsing.",
      );
  }

  // Hero section changes affect accessibility/navigation, not the catalog tree.
  const storefront = useMemo(
    () => (
      <div className="flagship-content" inert={customizing || loading}>
        <div className="collection-prelude">
          <span>MANCINI &amp; CO</span>
          <p>A world of precious possibilities.</p>
          <button onClick={() => goToId("collections")} aria-label="Explore the collections">
            <ArrowDown size={20} strokeWidth={1} />
          </button>
        </div>
        <JewelryCollections onQuickView={setQuickProduct} />
        <CraftsmanshipSection />
        <DiamondGuide />
        <PressReviewsSection />
        <ConciergeSection />
        <JewelryFooter onStory={() => goTo(0)} />
      </div>
    ),
    [customizing, loading, goToId, goTo],
  );

  return (
    <main
      ref={root}
      className="jewelry-page"
      data-night={night}
      data-customizing={customizing}
      data-interactive={interactive}
      data-past-hero={pastHero}
      data-pip-collapsed={pipCollapsed}
      data-scene-ready={Boolean(controller)}
      data-loading={loading}
      aria-busy={loading}
    >
      <div className="ring-viewport" inert={pastHero && pipCollapsed && !customizing}>
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <RingScene
              onReady={setController}
              onProgress={setProgress}
              onError={setError}
              interactive={customizing || (pastHero && !pipCollapsed)}
            />
          </Suspense>
        </ClientOnly>
      </div>
      {loading && (
        <div className="jewelry-loader" role="status" aria-live="polite" data-lenis-prevent>
          <svg width="48" height="48" fill="none" aria-hidden="true">
            <circle cx="25" cy="29" r="15" stroke="currentColor" strokeWidth="2" />
            <path
              d="m18 8 3-4h8l3 4-7 6-7-6Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p>Loading... Please wait</p>
          <div
            className="jewelry-progress"
            style={{ transform: `scaleX(${progress})` }}
            aria-hidden="true"
          />
        </div>
      )}
      {error && (
        <div className="jewelry-load-error" role="alert">
          {error}
          <button onClick={() => window.location.reload()}>Try again</button>
        </div>
      )}
      <header className="jewelry-header" inert={customizing || loading}>
        <div className="jewelry-brand">
          <button onClick={() => goTo(0)} aria-label="Mancini & Co — back to the 3D story">
            MANCINI &amp; CO
          </button>
        </div>
        <nav className="jewelry-navigation" aria-label="Main navigation">
          <button className="desktop-nav" onClick={() => goToId("collections")}>
            Collections
          </button>
          <button className="desktop-nav" onClick={() => goToId("atelier")}>
            Atelier
          </button>
          <button className="desktop-nav" onClick={() => goToId("diamond-guide")}>
            Diamond guide
          </button>
          <button className="desktop-nav" onClick={() => cart.setConciergeOpen(true)}>
            Private salon
          </button>
          <button
            aria-label={muted ? "Turn sound on" : "Mute sound"}
            onClick={() => void toggleMusic()}
          >
            {muted ? <VolumeX size={24} strokeWidth={1} /> : <Volume2 size={24} strokeWidth={1} />}
          </button>
          <button aria-label={night ? "Day mode" : "Night mode"} onClick={() => setNight(!night)}>
            {night ? <Sun size={24} strokeWidth={1} /> : <Moon size={24} strokeWidth={1} />}
          </button>
          <button
            className="saved-toggle"
            aria-label={`Open saved collection, ${selections.wishlist.length + selections.designs.length} pieces`}
            onClick={() => selections.setSavedOpen(true)}
          >
            <Heart size={21} strokeWidth={1} />
            <span>{selections.wishlist.length + selections.designs.length}</span>
          </button>
          <button
            className="bag-toggle"
            aria-label={`Open shopping bag, ${cart.count} items`}
            onClick={() => cart.setCartOpen(true)}
          >
            <ShoppingBag size={21} strokeWidth={1} />
            <span>{cart.count}</span>
          </button>
          <button
            className="mobile-menu-toggle"
            aria-label={mobileMenu ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenu}
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} strokeWidth={1} />}
          </button>
        </nav>
      </header>
      {mobileMenu && (
        <nav className="mobile-navigation" aria-label="Mobile navigation">
          <button onClick={() => goToId("collections")}>
            Collections <ArrowUpRight size={18} />
          </button>
          <button onClick={() => goToId("atelier")}>
            The atelier <ArrowUpRight size={18} />
          </button>
          <button onClick={() => goToId("diamond-guide")}>
            Diamond guide <ArrowUpRight size={18} />
          </button>
          <button
            onClick={() => {
              setMobileMenu(false);
              cart.setConciergeOpen(true);
            }}
          >
            Private salon <ArrowUpRight size={18} />
          </button>
        </nav>
      )}
      <div ref={hero} className="jewelry-story" id="story" inert={customizing || loading}>
        <section className="jewelry-section jewelry-hero-section" aria-label="Unique jewelry">
          {!controller && error && (
            <img
              className="hero-ring-preview"
              src="/images/aurora.jpg"
              alt="A diamond ring from the Mancini collection"
              fetchPriority="high"
            />
          )}
          <div
            className="jewelry-copy"
            inert={(Boolean(controller) && section !== 0) || customizing}
          >
            <div className="jewelry-hero-content">
              <h1 className="jewelry-title">
                Unique
                <br />
                Jewelry
              </h1>
              <div className="jewelry-hero-text">
                <p className="jewelry-description">
                  Customize your unique ring with graphic angles and pure lines that combine to
                  create the pure beauty of the collection.
                </p>
                <button
                  className="jewelry-button jewelry-start"
                  onClick={() => (interactive && controller ? goTo(1) : goToId("collections"))}
                >
                  {interactive && controller ? "Start now" : "Explore pieces"}{" "}
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
              aria-label="Scroll to Forever"
            >
              <span>Start scrolling to explore</span>
              <ArrowDown size={24} strokeWidth={1.5} />
            </button>
          </div>
        </section>
        <section className="jewelry-section jewelry-forever-section" aria-label="Forever">
          <div
            className="jewelry-forever"
            inert={(Boolean(controller) && section !== 1) || customizing}
          >
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
          <div
            className="jewelry-emotions"
            inert={(Boolean(controller) && section !== 2) || customizing}
          >
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
              <button
                className="jewelry-button jewelry-customize"
                disabled={!controller || !interactive}
                onClick={() => customize()}
              >
                {controller && interactive ? "Customize it" : "3D preview loading"}{" "}
                <Settings size={24} strokeWidth={1} />
              </button>
            </div>
          </div>
        </section>
      </div>
      {storefront}
      <FloatingRingPip
        visible={pastHero && Boolean(controller) && !customizing}
        collapsed={pipCollapsed}
        onCollapse={() => setPipCollapsed(!pipCollapsed)}
        onExpand={() => customize()}
        onStory={() => goTo(0)}
      />
      <nav
        className="jewelry-dots"
        aria-label="Sections"
        inert={!interactive || customizing || pastHero || loading}
      >
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
            data-lenis-prevent
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
        <div
          className="ring-personalization-tools"
          role="group"
          aria-label="Save and personalize your ring"
        >
          <button
            disabled={changingModel}
            onClick={() => {
              setMenu(null);
              setPersonalization("engrave");
            }}
          >
            <Pencil size={15} /> Engrave
          </button>
          <button
            disabled={changingModel}
            onClick={() => {
              setMenu(null);
              setPersonalization("save");
            }}
          >
            <Heart size={15} /> Save design
          </button>
          <button
            disabled={changingModel}
            onClick={() => {
              setMenu(null);
              setPersonalization("share");
            }}
          >
            <Link2 size={15} /> Share
          </button>
        </div>
        <div className="custom-ring-summary">
          <p>
            {gem} · {metal === "Default" ? "Silver & gold" : metal} · {design}
            {engraving && (
              <span className="custom-inscription">
                “{engraving}” · {engravingStyle}
              </span>
            )}
          </p>
          <label className="field-label">
            US size
            <select value={ringSize} onChange={(event) => setRingSize(event.target.value)}>
              {ringSizes.map((size) => (
                <option key={size.us}>{size.us}</option>
              ))}
            </select>
          </label>
          <button
            className="luxury-button solid"
            disabled={changingModel}
            onClick={() => {
              cart.addCustomRing(customSpecs);
              cart.setCartOpen(true);
              toast.success("Your custom ring is in the bag");
            }}
          >
            <ShoppingBag size={16} /> Add your ring · {formatPrice(customRingPrice(customSpecs))}
          </button>
        </div>
      </div>
      <ProductQuickViewModal
        product={quickProduct}
        onClose={() => setQuickProduct(null)}
        night={night}
      />
      <CartDrawer night={night} />
      <ConciergeModal night={night} />
      <SavedJewelryDrawer
        night={night}
        sceneReady={Boolean(controller) && interactive}
        onRestore={reopenDesign}
        onQuickView={setQuickProduct}
      />
      <ProductComparisonModal night={night} onQuickView={setQuickProduct} />
      <RingPersonalizationModal
        mode={personalization}
        onClose={() => setPersonalization(null)}
        specs={customSpecs}
        night={night}
        onEngraving={(text, font) => {
          setEngraving(text);
          setEngravingStyle(font);
        }}
      />
      <Toaster theme={night ? "dark" : "light"} position="top-center" />
    </main>
  );
}
