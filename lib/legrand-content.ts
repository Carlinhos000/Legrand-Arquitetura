// Troque os arquivos ou caminhos abaixo pelas imagens reais do escritório.
// As imagens atuais são demonstrativas e não representam projetos da Legrand.
export const business = {
  name: "Legrand Arquitetura",
  phone: "(47) 99745-4497",
  whatsapp: "https://wa.me/5547997454497?text=Ol%C3%A1%2C%20gostaria%20de%20conversar%20sobre%20um%20projeto.",
  instagram: "https://www.instagram.com/legrandarquitetura/",
  address: "Al. Rolf Colin, 109 — América, Joinville — SC, 89204-070",
  maps: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Legrand Arquitetura Al. Rolf Colin 109 América Joinville SC 89204-070"),
};

export const projects = [
  { id: "facade", category: "Fachadas residenciais", label: "Arquitetura residencial", image: "/images/facade.webp", alt: "Volumes brancos de uma residência contemporânea com jardim", position: "50% 55%", width: 2200, height: 2200 },
  { id: "living", category: "Salas de estar", label: "Interiores residenciais", image: "/images/living.webp", alt: "Sala de estar acolhedora com madeira natural e sofá claro", position: "50% 65%", width: 1600, height: 2256 },
  { id: "kitchen", category: "Cozinhas", label: "Interiores residenciais", image: "/images/kitchen.webp", alt: "Cozinha branca com ilha e cadeiras em madeira", position: "50% 50%", width: 1600, height: 1067 },
  { id: "bedroom", category: "Quartos", label: "Interiores residenciais", image: "/images/bedroom.webp", alt: "Quarto com tons neutros, cama ampla e armário em madeira", position: "50% 50%", width: 1600, height: 1067 },
  { id: "bathroom", category: "Banheiros", label: "Interiores residenciais", image: "/images/bathroom.webp", alt: "Banheiro com bancada em madeira, pedra e banheira independente", position: "50% 50%", width: 1600, height: 1067 },
  { id: "commercial", category: "Ambientes comerciais", label: "Arquitetura comercial", image: "/images/commercial.webp", alt: "Café contemporâneo com mesas escuras, plantas e fachada de vidro", position: "50% 65%", width: 1600, height: 2433 },
  { id: "exterior", category: "Áreas externas", label: "Espaços de convivência", image: "/images/exterior.webp", alt: "Renderização de área externa com pergolado branco, paisagismo e bar", position: "50% 50%", width: 1600, height: 1075 },
] as const;

export const services = [
  { title: "Projetos arquitetônicos", text: "Desenvolvimento de residências, reformas e espaços comerciais.", icon: "house" },
  { title: "Arquitetura de interiores", text: "Composição de ambientes funcionais, confortáveis e personalizados.", icon: "sofa" },
  { title: "Planejamento de ambientes", text: "Organização de layout, circulação, materiais, iluminação e acabamentos.", icon: "ruler" },
  { title: "Consultoria e personalização", text: "Orientação para escolhas estéticas e soluções adequadas ao orçamento e ao estilo do cliente.", icon: "pencil" },
] as const;

export const steps = [
  { title: "Conversa inicial", text: "Entendemos suas necessidades, preferências, rotina e objetivos.", image: 1, detail: "Um projeto começa com escuta." },
  { title: "Conceito e planejamento", text: "Organizamos as ideias e definimos a direção estética e funcional do projeto.", image: 2, detail: "Ideias que encontram seu lugar." },
  { title: "Desenvolvimento do projeto", text: "Criamos as soluções arquitetônicas, os ambientes, materiais e detalhes.", image: 4, detail: "Cada escolha tem uma razão." },
  { title: "Entrega e acompanhamento", text: "Apresentamos o projeto com clareza e orientamos os próximos passos.", image: 6, detail: "Clareza para seguir em frente." },
] as const;

export const reviews = [
  "Ótimo atendimento, boas ideias e agilidade no processo.",
  "Excelente serviço de planejamento, atendimento ao cliente e atenção ao detalhe.",
  "Soluções para o projeto, atenciosos e dedicados.",
] as const;
