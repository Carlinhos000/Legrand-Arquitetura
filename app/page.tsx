"use client";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { SiteSections, SiteFooter } from "@/components/site-sections";
const whatsapp = "https://wa.me/5547997454497?text=Ol%C3%A1%2C%20gostaria%20de%20conversar%20sobre%20um%20projeto.";
const nav = [["Sobre", "sobre"], ["Serviços", "servicos"], ["Projetos", "projetos"], ["Processo", "processo"], ["Depoimentos", "depoimentos"], ["Contato", "contato"]];
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape" && menuOpen) { setMenuOpen(false); document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus(); } };
    document.addEventListener("keydown", close);
    const onResize = () => { if (window.innerWidth > 1000) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => { document.removeEventListener("keydown", close); window.removeEventListener("resize", onResize); };
  }, [menuOpen]);
  useEffect(() => {
    if (document.querySelector("script[data-legrand-sequence]")) return;
    const script = document.createElement("script");
    script.src = "/hero-scroll.js"; script.dataset.legrandSequence = "true";
    document.body.appendChild(script);
  }, []);
  return <>
    <a className="skip-link" href="#sobre">Pular animação e ir ao conteúdo</a>
    <header className="site-header cinematic-header" data-hero-reveal="navigation">
      <a href="#inicio" className="brand" aria-label="Legrand Arquitetura — início"><span>LEGRAND</span></a>
      <nav aria-label="Navegação principal" className="desktop-nav">{nav.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
      <button className="menu-toggle" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="menu-mobile" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
      {menuOpen && <nav className="mobile-nav" id="menu-mobile" aria-label="Navegação mobile">{nav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}<a className="button" href={whatsapp}>Falar pelo WhatsApp</a></nav>}
    </header>
    <main id="conteudo">
      <section className="scroll-hero cinematic-hero" id="inicio" aria-labelledby="hero-heading" data-sequence-hero="true" data-motion="static" data-fallback="false">
        <div className="hero hero-stage" id="hero-stage">
        <img id="hero-poster" className="hero-image hero-poster" src="/frames/frame-0001.webp" alt="Ambiente interno contemporâneo — sequência visual demonstrativa" fetchPriority="high" width={1280} height={720}/>
        <canvas id="hero-canvas" aria-hidden="true"/>
        <div className="hero-shade" />
        <div className="hero-content"><h1 id="hero-heading" data-hero-reveal="title">LEGRAND</h1><p className="hero-subtitle" data-hero-reveal="subtitle">Arquitetura &amp; interiores</p></div>
        <div className="sequence-loading" id="load-panel"><span id="load-label">Preparando sequência</span><span id="load-percent" aria-hidden="true">0%</span><progress id="load-progress" value={0} max={240} aria-label="Carregamento da animação"/><button id="retry-button" type="button" hidden>Tentar novamente</button></div>
        <div className="sequence-progress" aria-hidden="true"><span id="sequence-progress"/></div>
        </div>
      </section>
      <p className="sr-only" id="animation-status" role="status" aria-live="polite"/>
      <section className="intro-strip container" id="sobre"><h2>Projetos que transformam<br/>espaços em <em>experiências.</em></h2><div><p>Arquitetura pensada para unir beleza, funcionalidade e personalidade em cada detalhe.</p><small className="sequence-credit">Sequência visual demonstrativa.</small></div></section>
      <SiteSections/>
    </main>
    <SiteFooter/>
  </>;
}
