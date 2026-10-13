(() => {
  "use strict";

  // CONFIGURAÇÃO: coloque a pasta frames ao lado de index.html.
  const CONFIG = {
    frameCount: 240,
    frameDirectory: "frames/",
    framePrefix: "frame-",
    extension: ".webp",
    fit: "cover",       // "cover" preenche com recorte; "contain" mostra tudo.
    focalX: 0.5,        // 0 = esquerda; 0.5 = centro; 1 = direita.
    focalY: 0.5,
    smoothingMs: 65,    // Pequena suavização, sem interceptar a rolagem.
    desktopDpr: 2,
    mobileDpr: 1.5,
    desktopDecodeEdge: 2400,
    mobileDecodeEdge: 1600,
  };

  const hero = document.querySelector("[data-sequence-hero]") || document.getElementById("hero");
  const stage = document.getElementById("hero-stage");
  const canvas = document.getElementById("hero-canvas");
  const poster = document.getElementById("hero-poster");
  const panel = document.getElementById("load-panel");
  const label = document.getElementById("load-label");
  const percent = document.getElementById("load-percent");
  const loadProgress = document.getElementById("load-progress");
  const sequenceProgress = document.getElementById("sequence-progress");
  const retryButton = document.getElementById("retry-button");
  const status = document.getElementById("animation-status");
  if (!hero || !stage || !canvas) return;

  const context = canvas.getContext("2d", { alpha: false });
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const staticFrame = CONFIG.frameCount - 1;
  const openingIndex = () => motion.matches ? staticFrame : 0;
  const sceneElements = [...document.querySelectorAll("[data-hero-reveal]")];
  const navigation = document.querySelector('[data-hero-reveal="navigation"]');
  const floatingContact = document.querySelector(".floating-whatsapp");
  const revealWindows = { navigation: [0.18, 0.43], title: [0.32, 0.68], subtitle: [0.53, 0.8] };
  const mobile = () => window.innerWidth <= 700;
  const frameUrl = index => `${CONFIG.frameDirectory}${CONFIG.framePrefix}${String(index + 1).padStart(4, "0")}${CONFIG.extension}`;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  stage.style.setProperty("--image-fit", CONFIG.fit);
  stage.style.setProperty("--focal-x", `${CONFIG.focalX * 100}%`);
  stage.style.setProperty("--focal-y", `${CONFIG.focalY * 100}%`);
  poster.addEventListener("error", () => { poster.style.visibility = "hidden"; });

  if (!context) {
    panel.hidden = true;
    status.textContent = "Exibindo a imagem estática de abertura.";
    hero.dataset.sceneError = "true";
    sceneElements.forEach(element => { element.style.setProperty("--reveal", "1"); element.dataset.visible = "true"; });
    return;
  }

  // Os arquivos são pré-carregados, mas somente poucos frames próximos
  // são decodificados. Manter 240 bitmaps grandes pode consumir gigabytes.
  const sources = new Map();
  const bitmaps = new Map();
  const sourceRequests = new Map();
  const decodeQueue = new Set();
  const decoding = new Set();
  const warmed = new Set();
  const failed = new Set();
  const reloadFrames = new Set();
  const pendingWarm = new Set(Array.from({ length: CONFIG.frameCount }, (_, i) => i));
  let sourceBytes = 0;
  let bitmapBytes = 0;
  let warmWorkers = 0;
  let ready = false;
  let width = 1;
  let height = 1;
  let heroStart = 0;
  let scrollRange = 1;
  let progress = 0;
  let target = 0;
  let displayedPosition = 0;
  let wanted = 0;
  let lastDrawn = -1;
  let raf = 0;
  let measureRaf = 0;
  let lastTime = 0;
  let inView = true;
  let paused = document.hidden;

  function touch(cache, index) {
    const value = cache.get(index);
    if (value) { cache.delete(index); cache.set(index, value); }
    return value;
  }

  function trimCaches() {
    const sourceLimit = (mobile() ? 24 : 48) * 1024 * 1024;
    const bitmapLimit = (mobile() ? 32 : 64) * 1024 * 1024;
    for (const [index, entry] of sources) {
      if (sourceBytes <= sourceLimit) break;
      if (decoding.has(index) || sourceRequests.has(index)) continue;
      sources.delete(index); sourceBytes -= entry.bytes;
      if (entry.image) entry.image.src = "";
    }
    for (const [index, entry] of bitmaps) {
      if (bitmapBytes <= bitmapLimit && bitmaps.size <= (mobile() ? 6 : 10)) break;
      if (index === lastDrawn || index === wanted || decoding.has(index)) continue;
      bitmaps.delete(index); bitmapBytes -= entry.bytes; entry.close();
    }
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => { image.onload = image.onerror = null; resolve(image); };
      image.onerror = () => { image.onload = image.onerror = null; reject(new Error(`Imagem indisponível: ${url}`)); };
      image.src = url;
    });
  }

  async function getSource(index) {
    const cached = touch(sources, index);
    if (cached) return cached;
    if (sourceRequests.has(index)) return sourceRequests.get(index);
    const request = (async () => {
      let entry;
      // Image permite abrir o exemplo também em file://. Em HTTP usamos
      // blobs e o cache do navegador, sem guardar todas as imagens abertas.
      if (location.protocol === "file:") {
        const image = await loadImage(frameUrl(index));
        entry = { image, bytes: image.naturalWidth * image.naturalHeight * 4 };
      } else {
        const response = await fetch(frameUrl(index), { cache: reloadFrames.delete(index) ? "reload" : "force-cache" });
        if (!response.ok) throw new Error(`Frame ${index + 1}: HTTP ${response.status}`);
        const blob = await response.blob();
        entry = { blob, bytes: blob.size };
      }
      sources.set(index, entry); sourceBytes += entry.bytes;
      warmed.add(index); pendingWarm.delete(index); failed.delete(index);
      updateLoading();
      return entry;
    })();
    sourceRequests.set(index, request);
    try { return await request; }
    catch (error) { failed.add(index); pendingWarm.delete(index); updateLoading(); throw error; }
    finally { sourceRequests.delete(index); trimCaches(); }
  }

  async function decode(index) {
    const source = await getSource(index);
    let temporaryUrl;
    let image = source.image;
    try {
      if (!image) { temporaryUrl = URL.createObjectURL(source.blob); image = await loadImage(temporaryUrl); }
      const edge = mobile() ? CONFIG.mobileDecodeEdge : CONFIG.desktopDecodeEdge;
      const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight));
      const w = Math.max(1, Math.round(image.naturalWidth * scale));
      const h = Math.max(1, Math.round(image.naturalHeight * scale));
      let drawable;
      if (typeof createImageBitmap === "function") {
        try { drawable = await createImageBitmap(image, { resizeWidth: w, resizeHeight: h, resizeQuality: "medium" }); }
        catch { /* Safari antigo: fallback para um canvas auxiliar. */ }
      }
      if (!drawable) {
        drawable = document.createElement("canvas"); drawable.width = w; drawable.height = h;
        const drawingContext = drawable.getContext("2d");
        if (!drawingContext) throw new Error("Não foi possível preparar o frame.");
        drawingContext.drawImage(image, 0, 0, w, h);
      }
      return {
        image: drawable, width: w, height: h, bytes: w * h * 4,
        close() { if (typeof drawable.close === "function") drawable.close(); else drawable.width = drawable.height = 0; },
      };
    } finally {
      if (temporaryUrl) { image && (image.src = ""); URL.revokeObjectURL(temporaryUrl); }
    }
  }

  function requestFrame(index) {
    index = clamp(index, 0, CONFIG.frameCount - 1);
    if (bitmaps.has(index) || decoding.has(index) || failed.has(index)) return;
    decodeQueue.add(index); pumpDecoders();
  }

  function pumpDecoders() {
    if (paused) return;
    const limit = mobile() ? 1 : 2;
    while (decoding.size < limit && decodeQueue.size) {
      const index = [...decodeQueue].sort((a, b) => Math.abs(a - wanted) - Math.abs(b - wanted))[0];
      decodeQueue.delete(index); decoding.add(index);
      decode(index).then(entry => {
        const previous = bitmaps.get(index);
        if (previous) { bitmapBytes -= previous.bytes; previous.close(); }
        bitmaps.set(index, entry); bitmapBytes += entry.bytes;
        if (index === openingIndex() && !ready) {
          ready = true; stage.classList.add("has-frame");
          applyMotion(); startPreload();
        }
        requestRender();
      }).catch(() => {
        failed.add(index);
        if (index === openingIndex() && !ready) showOpeningError(); else updateLoading();
      }).finally(() => { decoding.delete(index); trimCaches(); pumpDecoders(); });
    }
  }

  // Concorrência limitada; prioriza arquivos próximos do ponto atual.
  function startPreload() {
    if (!ready || motion.matches || paused) return;
    const limit = mobile() ? 3 : 4;
    while (warmWorkers < limit && pendingWarm.size) {
      warmWorkers++;
      (async () => {
        while (pendingWarm.size && !motion.matches && !paused) {
          const index = [...pendingWarm].sort((a, b) => Math.abs(a - wanted) - Math.abs(b - wanted))[0];
          pendingWarm.delete(index);
          try { await getSource(index); } catch { /* A falha não apaga o frame já exibido. */ }
        }
      })().finally(() => { warmWorkers--; updateLoading(); });
    }
  }

  function updateLoading() {
    const total = motion.matches ? 1 : CONFIG.frameCount;
    const count = motion.matches ? Number(warmed.has(staticFrame)) : warmed.size;
    loadProgress.max = total; loadProgress.value = count;
    percent.textContent = `${Math.round(count / total * 100)}%`;
    if (ready && count === total && (motion.matches || !failed.size)) {
      panel.hidden = true;
      if (status.textContent !== "Imagens carregadas.") status.textContent = "Imagens carregadas.";
    } else if (ready && failed.size && !warmWorkers && !pendingWarm.size) {
      panel.hidden = false; label.textContent = "Algumas imagens não carregaram";
      retryButton.hidden = false;
      status.textContent = "Parte da sequência não carregou. Você pode tentar novamente.";
    }
  }

  function showOpeningError() {
    hero.dataset.motion = "static";
    hero.dataset.sceneError = "true";
    updateScene(lastDrawn);
    panel.hidden = false; label.textContent = hero.dataset.fallback === "true" ? "Imagem estática · aguardando a sequência" : "A imagem de abertura não carregou";
    percent.textContent = ""; loadProgress.hidden = true; retryButton.hidden = false;
    status.textContent = "Não foi possível carregar a imagem de abertura. O conteúdo continua disponível.";
    scheduleMeasure();
  }

  function applyMotion() {
    hero.dataset.motion = ready && !motion.matches ? "scroll" : "static";
    if (motion.matches) {
      poster.src = frameUrl(staticFrame);
      target = displayedPosition = wanted = staticFrame; decodeQueue.clear(); requestFrame(staticFrame);
    } else if (ready) {
      panel.hidden = warmed.size === CONFIG.frameCount && !failed.size;
      label.textContent = "Carregando imagens";
    }
    updateScene(lastDrawn);
    trimCaches(); scheduleMeasure(); requestRender(); startPreload(); updateLoading();
  }

  // A interface acompanha o frame realmente desenhado, inclusive ao voltar.
  // A abertura permanece limpa; marca e navegação surgem com o mobiliário.
  function updateScene(index) {
    const ratio = Math.max(0, index) / (CONFIG.frameCount - 1);
    const outside = window.scrollY >= heroStart + scrollRange + height - 80;
    const complete = motion.matches || hero.dataset.sceneError === "true";
    const smoothstep = value => value * value * (3 - 2 * value);
    for (const element of sceneElements) {
      const [start, end] = revealWindows[element.dataset.heroReveal] || [0.4, 0.8];
      const value = complete || (outside && element === navigation) ? 1 : smoothstep(clamp((ratio - start) / (end - start), 0, 1));
      element.style.setProperty("--reveal", value.toFixed(4));
      element.style.setProperty("--reveal-offset", `${((1 - value) * 14).toFixed(2)}px`);
      element.dataset.visible = value > 0 ? "true" : "false";
      element.inert = value < 0.6;
    }
    hero.style.setProperty("--scene-shade", complete ? "1" : smoothstep(clamp((ratio - 0.12) / 0.5, 0, 1)).toFixed(4));
    hero.dataset.exited = outside ? "true" : "false";
    navigation?.classList.toggle("scrolled", outside);
    if (floatingContact) floatingContact.inert = !outside;
  }

  function measure() {
    measureRaf = 0;
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, mobile() ? CONFIG.mobileDpr : CONFIG.desktopDpr);
    const w = Math.round(width * dpr), h = Math.round(height * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
    const heroRect = hero.getBoundingClientRect();
    heroStart = heroRect.top + window.scrollY;
    scrollRange = Math.max(1, hero.offsetHeight - height);
    if (lastDrawn >= 0) drawFrame(lastDrawn);
    updateScroll();
  }

  function scheduleMeasure() { if (!measureRaf) measureRaf = requestAnimationFrame(measure); }

  function updateScroll() {
    const y = window.scrollY;
    inView = y + window.innerHeight > heroStart && y < heroStart + hero.offsetHeight;
    progress = motion.matches ? 1 : clamp((y - heroStart) / scrollRange, 0, 1);
    target = progress * (CONFIG.frameCount - 1);
    sequenceProgress.style.transform = `scaleX(${progress})`;
    updateScene(lastDrawn);
    requestRender();
  }

  function drawFrame(index) {
    const entry = touch(bitmaps, index);
    if (!entry) return;
    const ratio = CONFIG.fit === "contain" ? Math.min(width / entry.width, height / entry.height) : Math.max(width / entry.width, height / entry.height);
    const w = entry.width * ratio, h = entry.height * ratio;
    const x = (width - w) * CONFIG.focalX, y = (height - h) * CONFIG.focalY;
    context.fillStyle = "#07162f"; context.fillRect(0, 0, width, height);
    context.drawImage(entry.image, x, y, w, h);
    lastDrawn = index;
    canvas.dataset.frame = String(index + 1);
    updateScene(index);
  }

  function requestRender() {
    if (!raf && !paused && (inView || motion.matches)) raf = requestAnimationFrame(render);
  }

  function render(time) {
    raf = 0;
    const elapsed = lastTime ? Math.min(80, time - lastTime) : 16;
    lastTime = time;
    if (motion.matches) displayedPosition = staticFrame;
    else displayedPosition += (target - displayedPosition) * (1 - Math.exp(-elapsed / CONFIG.smoothingMs));
    if (Math.abs(target - displayedPosition) < 0.03) displayedPosition = target;
    wanted = Math.round(displayedPosition);
    if (bitmaps.has(wanted)) drawFrame(wanted);
    else requestFrame(wanted); // Mantém a última imagem; não pisca em branco.
    for (const index of decodeQueue) if (Math.abs(index - wanted) > 3) decodeQueue.delete(index);
    if (!motion.matches && ready) {
      const direction = target >= displayedPosition ? 1 : -1;
      requestFrame(wanted + direction); requestFrame(wanted + direction * 2);
    }
    if (!motion.matches && Math.abs(target - displayedPosition) > 0.03) requestRender();
  }

  retryButton.addEventListener("click", () => {
    for (const index of failed) {
      pendingWarm.add(index); reloadFrames.add(index); warmed.delete(index);
      const source = sources.get(index);
      if (source) { sources.delete(index); sourceBytes -= source.bytes; if (source.image) source.image.src = ""; }
    }
    failed.clear(); retryButton.hidden = true; loadProgress.hidden = false;
    label.textContent = "Carregando imagens"; percent.textContent = "0%";
    hero.dataset.sceneError = "false";
    requestFrame(ready ? wanted : openingIndex()); startPreload();
  });
  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", scheduleMeasure, { passive: true });
  window.addEventListener("orientationchange", scheduleMeasure, { passive: true });
  window.addEventListener("pageshow", () => { paused = document.hidden; scheduleMeasure(); startPreload(); pumpDecoders(); });
  document.addEventListener("visibilitychange", () => {
    paused = document.hidden;
    if (paused) { cancelAnimationFrame(raf); raf = 0; lastTime = 0; }
    else { scheduleMeasure(); requestRender(); startPreload(); pumpDecoders(); }
  });
  if (typeof ResizeObserver === "function") new ResizeObserver(scheduleMeasure).observe(stage);
  if (motion.addEventListener) motion.addEventListener("change", applyMotion);
  else motion.addListener(applyMotion); // Safari antigo.

  status.textContent = "Carregando imagem de abertura.";
  if (motion.matches) poster.src = frameUrl(staticFrame);
  measure(); requestFrame(openingIndex());
})();
