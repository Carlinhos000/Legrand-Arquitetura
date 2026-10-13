"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { House, Sofa, Ruler, PencilRuler, MessageCircle, MapPin, Star, X, Maximize2, Quote, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { business, projects, services, steps, reviews } from "@/lib/legrand-content";
import { ContactForm } from "@/components/contact-form";

type PhotoProps = { index: number; className?: string; priority?: boolean };
export function Photo({ index, className = "", priority = false }: PhotoProps) {
  const photo = projects[index];
  return <img className={className} src={photo.image} alt={`${photo.alt} — imagem demonstrativa`} width={photo.width} height={photo.height} style={{ objectPosition: photo.position }} loading={priority ? "eager" : "lazy"} decoding="async" />;
}
function Heading({ label, children, text, centered = false }: { label: string; children: ReactNode; text?: string; centered?: boolean }) {
  return <div className={`section-heading reveal ${centered ? "centered" : ""}`}><span className="eyebrow">{label}</span><h2>{children}</h2>{text && <p>{text}</p>}</div>;
}
function Stars() { return <span className="stars" aria-label="Avaliação média de 4,7 de 5 estrelas">{[0,1,2,3,4].map(i => <Star key={i} size={16} aria-hidden="true" strokeWidth={1.2} fill="currentColor"/>)}</span>; }

function Portfolio() {
  const [active, setActive] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  function move(amount: number) { setActive(prev => prev === null ? null : (prev + amount + projects.length) % projects.length); }
  return <section className="portfolio section-space" id="projetos" aria-labelledby="portfolio-heading">
    <div className="container"><div className="portfolio-heading-row reveal"><div><span className="eyebrow">Um olhar para as possibilidades</span><h2 id="portfolio-heading">Projetos pensados<br/>para <em>viver.</em></h2></div><div className="gallery-description"><p>Forma, luz e materiais.<br/>Espaços com sentido em cada detalhe.</p><small>Galeria demonstrativa · imagens de referência,<br/>sem vínculo com projetos da Legrand.</small></div></div>
      <div className="project-grid">{projects.map((project,index) => <button className={`project-card project-${project.id} reveal`} key={project.id} aria-label={`Ver projeto: ${project.category}`} onClick={event => { opener.current = event.currentTarget; setActive(index); }}><Photo index={index}/><span className="project-shade"/><span className="project-caption"><span><small>{project.label}</small><strong>{project.category}</strong></span><span className="project-action">Ver projeto <Maximize2 size={16} aria-hidden="true"/></span></span></button>)}</div>
    </div>
    <Dialog open={active !== null} onOpenChange={open => { if (!open) setActive(null); }}>
      <DialogContent className="lightbox" showCloseButton={false} onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus(); }} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); move(1); } if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } }}>
        <div className="lightbox-top"><div><DialogTitle>{active === null ? "Projeto" : projects[active].category}</DialogTitle><DialogDescription>Imagem demonstrativa. Substituível por projeto real da Legrand.</DialogDescription></div><DialogClose className="lightbox-close" aria-label="Fechar imagem"><X size={24}/></DialogClose></div>
        {active !== null && <Photo index={active} className="lightbox-photo" priority/>}
        <div className="lightbox-bottom"><button onClick={() => move(-1)}>Anterior</button><span>{String((active ?? 0)+1).padStart(2,"0")} / 07</span><button onClick={() => move(1)}>Próxima</button></div>
      </DialogContent>
    </Dialog>
  </section>;
}

export function SiteSections() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }); }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(element => { element.classList.add("will-reveal"); observer.observe(element); });
    return () => { observer.disconnect(); document.querySelectorAll(".will-reveal").forEach(element => element.classList.remove("will-reveal")); };
  }, []);
  const icons = { house: House, sofa: Sofa, ruler: Ruler, pencil: PencilRuler };
  return <>
    <section className="about container" aria-labelledby="about-heading">
      <div className="about-copy reveal"><span className="eyebrow">O escritório</span><h2 id="about-heading">Arquitetura com<br/>propósito, cuidado e<br/><em>personalidade.</em></h2><p>A Legrand Arquitetura desenvolve soluções práticas e personalizadas para quem deseja construir, reformar ou transformar um ambiente. Unimos criatividade, planejamento e atenção aos detalhes para que cada projeto tenha beleza, funcionalidade e identidade.</p><a className="text-link" href="#contato">Vamos conversar sobre seu projeto</a></div>
      <div className="about-composition reveal"><Photo index={1} className="about-main"/><Photo index={0} className="about-secondary"/><span className="image-note">Imagens demonstrativas</span></div>
      <div className="trust-row reveal"><div className="rating-proof"><span className="rating-number">4,7<span>/5</span></span><div><Stars/><small>30 avaliações no Google</small></div></div><div><MapPin size={23} strokeWidth={1.3} aria-hidden="true"/><p>Atendimento em<br/><strong>Joinville e região</strong></p></div><div><House size={23} strokeWidth={1.3} aria-hidden="true"/><p>Projetos<br/><strong>residenciais e comerciais</strong></p></div></div>
    </section>

    <section className="services section-space" id="servicos"><div className="container"><Heading label="Como podemos ajudar">Do primeiro traço<br/>ao ambiente <em>pronto.</em></Heading><div className="service-grid">{services.map((service,index) => { const Icon = icons[service.icon]; return <article className="service-item reveal" key={service.title}><div className="service-top"><Icon size={30} strokeWidth={1.25} aria-hidden="true"/><span>0{index+1}</span></div><h3>{service.title}</h3><p>{service.text}</p></article>; })}</div></div></section>

    <section className="difference section-space"><div className="container"><Heading label="Nossa essência" centered>Mais do que um projeto bonito.<br/>Um espaço que funciona <em>para você.</em></Heading><div className="difference-grid"><figure className="difference-photo reveal"><Photo index={1}/><figcaption>Beleza que acolhe.<br/>Funcionalidade que acompanha.</figcaption></figure><div className="difference-list reveal">{[{title:"Atendimento próximo e cuidadoso",text:"Escuta e diálogo para compreender o que é importante na sua rotina."},{title:"Soluções criativas e práticas",text:"Ideias que conectam suas necessidades às possibilidades do espaço."},{title:"Atenção aos detalhes em todas as etapas",text:"Um olhar cuidadoso para a composição, os materiais e os acabamentos."}].map((item,index) => <article key={item.title}><span className="detail-index">0{index+1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}<a className="button light" href="#contato">Vamos planejar seu espaço</a></div></div></div></section>

    <section className="process section-space container" id="processo"><Heading label="Como trabalhamos" centered>Uma ideia. Quatro etapas.<br/>Cuidado em cada <em>detalhe.</em></Heading><div className="process-list">{steps.map((step,index) => <article className={`process-step reveal ${index%2 ? "reverse" : ""}`} key={step.title}><div className="process-copy"><span className="eyebrow">Etapa 0{index+1}</span><h3>{step.title}</h3><p>{step.text}</p><span className="process-detail">{step.detail}</span><span className="step-number" aria-hidden="true">0{index+1}</span></div><Photo index={step.image} className="process-photo"/></article>)}</div></section>

    <Portfolio/>

    <section className="testimonials section-space container" id="depoimentos"><div className="testimonial-intro reveal"><Heading label="Quem confia, conta">Boas ideias começam<br/>com boas <em>relações.</em></Heading><div className="review-rating"><strong>4,7<span>/5</span></strong><div><Stars/><p>30 avaliações no Google</p></div></div></div><div className="review-grid">{reviews.map(review => <blockquote className="review-item reveal" key={review}><Quote size={26} strokeWidth={1.2} aria-hidden="true"/><p>“{review}”</p><footer><span className="review-line"/>Avaliação no Google</footer></blockquote>)}</div></section>

    <section className="contact section-space" id="contato"><Photo index={0} className="contact-backdrop"/><div className="container contact-grid"><div className="contact-copy reveal"><span className="eyebrow">Seu próximo capítulo</span><h2>Vamos transformar<br/>seu <em>espaço?</em></h2><p>Conte um pouco sobre o seu projeto e descubra como a Legrand Arquitetura pode ajudar.</p><div className="button-row"><a className="button light" href={business.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} aria-hidden="true"/>Falar pelo WhatsApp</a><a className="button outline-light" href={business.maps} target="_blank" rel="noopener noreferrer"><MapPin size={18} aria-hidden="true"/>Ver localização</a></div><address><a href={`tel:+5547997454497`}>{business.phone}</a><p>{business.address}</p></address></div><div className="reveal"><ContactForm/></div></div></section>


  </>;
}


export function SiteFooter() { return <>
    <footer className="site-footer"><div className="container footer-top"><div><a href="#inicio" className="brand"><span>LEGRAND</span><small>ARQUITETURA</small></a><p>Arquitetura, interiores e<br/>soluções personalizadas.</p></div><div><span className="footer-label">Encontre a Legrand</span><address>{business.address}</address><a href={business.maps} className="text-link" target="_blank" rel="noopener noreferrer">Como chegar</a></div><div><span className="footer-label">Vamos conversar</span><a href={`tel:+5547997454497`}>{business.phone}</a><a href={business.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true"/>WhatsApp</a><a href={business.instagram} target="_blank" rel="noopener noreferrer"><Camera size={16} aria-hidden="true"/>Instagram</a></div></div><div className="footer-wordmark container" aria-hidden="true">LEGRAND</div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Legrand Arquitetura. Todos os direitos reservados.</span><span>Joinville, Santa Catarina</span></div></footer>
    <a className="floating-whatsapp" href={business.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Falar com a Legrand pelo WhatsApp"><MessageCircle size={23}/><span>Vamos conversar?</span></a>
  </>; }
