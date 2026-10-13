# Legrand Arquitetura

Site institucional em React 19 e TypeScript, com Tailwind CSS e CSS organizado por seção. A implementação usa Vinext/Vite e exportação estática. Os componentes acessíveis de diálogo e seleção usam as primitivas instaladas de shadcn/Radix.

## Prévia pronta, sem instalar dependências

A versão compilada e revisada está em `dist/client`. Para abrir localmente com Node.js:

```sh
node preview.mjs
```

Acesse `http://127.0.0.1:5173`. Imagens e fontes são locais.

## Desenvolvimento

Requer Node.js 22.13 ou superior e npm.

```sh
npm ci
npm run dev
```

A prévia fica em `http://localhost:5173`. Para verificar os tipos e gerar a versão estática:

```sh
npx tsc --noEmit
npm run build
```

A saída pública está em `dist/client`. Não é necessário backend para a interface atual.

## Personalização

- `lib/legrand-content.ts`: dados do escritório, contato, serviços, depoimentos, etapas, fotos e pontos focais.
- `app/page.tsx`: cabeçalho, abertura e mensagem principal.
- `components/site-sections.tsx`: apresentação, serviços, diferenciais, processo, galeria, depoimentos, contato e rodapé.
- `components/contact-form.tsx`: campos, validação e estados da demonstração.
- `app/globals.css`: paleta, componentes, seções, breakpoints e redução de movimento.
- `public/images`: imagens demonstrativas em WebP.

Para usar imagens reais, coloque os arquivos em `public/images`, atualize `image`, `alt`, `width`, `height` e `position` em `lib/legrand-content.ts` e retire os avisos de demonstração apenas depois de substituir as imagens. Atualize também a foto da abertura em `app/page.tsx`. Não atribua as fotos atuais a projetos da Legrand.

## Contato e formulário

Todos os links de WhatsApp usam `+55 47 99745-4497`. Instagram oficial: `@legrandarquitetura`. A localização usa a consulta de endereço do Google Maps.

O formulário valida todos os campos, mostra erros acessíveis, simula 800 ms de processamento local e apresenta sucesso demonstrativo. Nenhum dado é enviado ou armazenado. Após a validação, o visitante pode escolher abrir o WhatsApp com seu texto preenchido; a mensagem só é enviada pelo próprio visitante. Para integrar um backend real, substitua a simulação em `ContactForm` e atualize o aviso visível.

## Conteúdo e imagens

Nota 4,7/5, 30 avaliações e os três depoimentos reproduzem exclusivamente as informações fornecidas no briefing. Não foram adicionados nomes de clientes, números de projetos ou anos de experiência.

As sete fotos demonstrativas são identificadas na interface. Fontes, autores e licença de uso estão em `IMAGE-SOURCES.md`. A imagem de área externa é uma renderização. As fontes locais Manrope e Cormorant Garamond incluem suas licenças em `public/fonts`.

## Recursos de acesso

Menu móvel com Escape, link para pular ao conteúdo, foco visível, rótulos, erros associados aos campos e feedback anunciado. A galeria usa diálogo com foco contido, Escape, retorno de foco ao card e teclas esquerda/direita. Entradas por rolagem e transições respeitam `prefers-reduced-motion`.

## Hero com sequência de frames

A hero do site já está conectada ao motor JavaScript puro de `public/hero-scroll.js`. Coloque `frame-0001.webp` até `frame-0240.webp` em `public/frames` e gere o site novamente. Para a prévia já compilada, os mesmos arquivos podem ser colocados diretamente em `dist/client/frames`, sem recompilar. A sequência do vídeo fornecido já está instalada: 240 frames WEBP de 1280 × 720. Com movimento reduzido, a hero exibe o primeiro frame estático.

A hero agora começa apenas com a sequência, sem componentes. O menu, o título LEGRAND e o subtítulo surgem progressivamente conforme os móveis aparecem. O fundo preserva a luz quente do vídeo; a interface usa a composição minimalista da referência.
