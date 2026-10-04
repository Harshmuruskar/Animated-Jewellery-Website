import { createFileRoute, ClientOnly } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ArrowDown, Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RingScene = lazy(() => import('@/components/RingScene'));

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Unique Jewelry | Mancini & Co' },
    { name: 'description', content: 'Explore the Mancini & Co jewelry collection through an animated diamond ring experience.' },
    { property: 'og:title', content: 'Unique Jewelry | Mancini & Co' },
    { property: 'og:description', content: 'Explore the Mancini & Co jewelry collection through an animated diamond ring experience.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState(0);
  const [muted, setMuted] = useState(true);
  const [night, setNight] = useState(false);
  useEffect(() => {
    const onReady = () => setReady(true);
    window.addEventListener('jewelry-ready', onReady);
    const onScroll = () => setSection(Math.min(2, Math.round(window.scrollY / window.innerHeight)));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('jewelry-ready', onReady); window.removeEventListener('scroll', onScroll); };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.jewelry-header', { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power1.inOut' });
      gsap.fromTo('.jewelry-copy', { x: 140, opacity: 0 }, { x: 0, opacity: 1, duration: 1.8, delay: .15, ease: 'power4.inOut' });
      gsap.fromTo('.jewelry-scroll', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: .4, ease: 'power4.inOut' });
      gsap.fromTo('.jewelry-dots', { x: 35, opacity: 0 }, { x: 0, opacity: 1, duration: 1.4, delay: .3 });
    });
    return () => ctx.revert();
  }, [ready]);
  const goTo = (n: number) => window.scrollTo({ top: window.innerHeight * n, behavior: 'smooth' });
  return <main className="jewelry-page" data-night={night}>
    <ClientOnly fallback={null}><Suspense fallback={null}><RingScene /></Suspense></ClientOnly>
    <header className="jewelry-header" style={{ opacity: ready ? undefined : 0 }}>
      <div className="jewelry-brand">MANCINI &amp; CO <small>BY NEOTIX</small></div>
      <nav className="jewelry-navigation" aria-label="Main navigation">
        <Button variant="iconPlain" size="sm" onClick={() => goTo(1)}>Know more</Button>
        <Button variant="iconPlain" size="icon" aria-label={muted ? 'Turn sound on' : 'Mute sound'} title={muted ? 'Turn sound on' : 'Mute sound'} onClick={() => setMuted(!muted)}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</Button>
        <Button variant="iconPlain" size="icon" aria-label={night ? 'Day mode' : 'Night mode'} title={night ? 'Day mode' : 'Night mode'} onClick={() => setNight(!night)}>{night ? <Sun size={17} /> : <Moon size={17} />}</Button>
      </nav>
    </header>
    <div className="jewelry-copy" style={{ opacity: ready ? (section === 0 ? 1 : 0) : 0, visibility: section === 0 ? 'visible' : 'hidden' }}>
      <h1 className="jewelry-title">Unique<br />Jewelry</h1>
      <p className="jewelry-description">Customize your unique ring with graphic angles and pure lines that combine to create the pure beauty of the collection.</p>
      <div className="jewelry-cta"><Button variant="jewelry" size="jewelry" onClick={() => goTo(1)}>Start now <span className="jewelry-cta-circle"><ArrowDown size={15} strokeWidth={1} /></span></Button></div>
    </div>
    <div className="jewelry-secondary" style={{ opacity: ready && section === 1 ? 1 : 0, visibility: section === 1 ? 'visible' : 'hidden' }}>
      <div className="jewelry-backword">Forever</div><div className="script">created to last</div><h2>For<br />ever</h2>
      <p>Customize your unique ring with graphic angles and pure lines that combine to create the pure beauty of the collection.</p>
    </div>
    <div className="jewelry-secondary" style={{ opacity: ready && section === 2 ? 1 : 0, visibility: section === 2 ? 'visible' : 'hidden' }}>
      <div className="jewelry-backword">Emotions</div><div className="script">share your</div><h2>Emotions</h2>
      <p>Colorful gemstones from aquamarine, amethyst, tourmaline to diamonds come together in white gold on this luxury ring.</p>
    </div>
    <div className="jewelry-scroll" style={{ opacity: ready && section === 0 ? 1 : 0 }}><span>Start scrolling to explore</span><ArrowDown size={14} strokeWidth={1.5} /></div>
    <div className="jewelry-dots" aria-label="Sections">{[0,1,2].map(n => <Button key={n} variant="iconPlain" size="icon" className="!h-5 !w-5" aria-label={['Unique jewelry', 'Forever', 'Emotions'][n]} onClick={() => goTo(n)}><span className="jewelry-dot" data-active={section === n} /></Button>)}</div>
    <div className="jewelry-spacer" /><div className="jewelry-spacer" /><div className="jewelry-spacer" />
  </main>;
}
