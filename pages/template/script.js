// =====================================================================
// 🎊 CONFIGURACIÓN DE CONFETTI — editá este objeto para personalizar
// =====================================================================
//   trigger     : 'click' = solo al hacer click/tap
//                 'auto'  = bucle automático (sin click)
//                 'both'  = ambas modalidades combinadas
//                 'off'   = completamente desactivado
//
//   autoInterval : ms entre cada disparo automático (ej: 2500 = 2.5s)
//
//   effects      : efectos BURST (disparo único). Cada uno tiene toggle
//     { click, auto } independiente. Podés activar varios en simultáneo.
//
//   snow / rain / autumn: sistemas CONTINUOS de partículas.
//     active:true/false  → encendido/apagado
//     particlesPerTick   → cantidad spawn por intervalo
//     tickInterval       → ms entre spawns
//     speed: { min, max }→ velocidad aleatoria entre rango
//     scalar: { min, max}→ tamaño aleatorio (❄️💧 más chico/grande)
//     colors             → múltiples tonos = opacidad variada
//     angle              → dirección (270 = vertical hacia abajo)
//     gravity, spread, decay, ticks → física
//
//   BURST DISPONIBLES: basic | random | realistic | fireworks
//                      stars | school | shapes | emoji | custom
// =====================================================================
const CONFETTI = {
  trigger: "both",
  autoInterval: 2500,
  colors: ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff8c42"],

  // --- EFECTOS BURST (click / auto) ---
  effects: {
    basic: { click: false, auto: false },
    random: { click: false, auto: false },
    realistic: { click: false, auto: false },
    fireworks: { click: false, auto: false },
    stars: { click: false, auto: false },
    school: { click: false, auto: false },
    shapes: { click: false, auto: false },
    emoji: { click: false, auto: false },
    custom: { click: true, auto: false },
  },

  // --- SISTEMAS CONTINUOS ---
  snow: {
    active: false,
    particlesPerTick: 1,
    tickInterval: 120,
    speed: { min: 1, max: 5 },
    scalar: { min: 0.3, max: 1.8 },
    colors: ["#ffffff", "#f0f8ff", "#e6f3ff"],
    angle: 270,
    gravity: 0.04,
    spread: 160,
    ticks: 500,
    decay: 0.98,
  },

  rain: {
    active: false,
    particlesPerTick: 3,
    tickInterval: 70,
    speed: { min: 15, max: 30 },
    scalar: { min: 0.3, max: 0.6 },
    colors: ["#a0c4e8", "#80a8cc", "#6090b0"],
    angle: 262,
    gravity: 0.5,
    spread: 50,
    ticks: 130,
    decay: 0.94,
  },

  autumn: {
    // active: false,
    active: true,
    particlesPerTick: 1,
    tickInterval: 200,
    speed: { min: 2, max: 7 },
    scalar: { min: 0.5, max: 1.8 },
    colors: [
      "#D2691E",
      "#CD853F",
      "#B8860B",
      "#A0522D",
      "#8B4513",
      "#DAA520",
      "#FF8C00",
    ],
    angle: 270,
    gravity: 0.06,
    spread: 200,
    ticks: 400,
    decay: 0.97,
  },
};
// =====================================================================

document.addEventListener("DOMContentLoaded", () => {
  const spriteSheet = document.getElementById("sourceSprite");
  const canvas = document.getElementById("animCanvas");
  // alpha: false optimiza el rendimiento indicando que el canvas no tendrá fondo transparente
  const ctx = canvas.getContext("2d", { alpha: false });

  // --- CONFIGURACIÓN MATEMÁTICA DEL SPRITE SHEET ---
  const COLUMNS = 4;
  const ROWS = 2;
  const TOTAL_FRAMES = 8;

  // --- CONFIGURACIÓN DE TIEMPO ---
  // Tiempo que cada fotograma será el protagonista (en milisegundos)
  // 1500ms (1.5 segundos) da un ritmo romántico y pausado
  const MS_PER_FRAME = 4500;

  const frames = [];
  let startTime = null;

  // Función de inicialización
  function initAnimation() {
    const frameWidth = spriteSheet.naturalWidth / COLUMNS;
    const frameHeight = spriteSheet.naturalHeight / ROWS;

    canvas.width = frameWidth;
    canvas.height = frameHeight;

    // console.log(`Canvas configurado: ${frameWidth}x${frameHeight}px`);

    // 1. EXTRAER Y ALMACENAR FOTOGRAMAS (BUFFERING)
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      // Calcular la posición (x, y) en la cuadrícula
      const col = i % COLUMNS;
      const row = Math.floor(i / COLUMNS);

      const sx = col * frameWidth;
      const sy = row * frameHeight;

      // Crear un canvas invisible en memoria para guardar este fotograma específico
      const buffer = document.createElement("canvas");
      buffer.width = frameWidth;
      buffer.height = frameHeight;
      const bufferCtx = buffer.getContext("2d");

      // Dibujar el recorte en el buffer
      bufferCtx.drawImage(
        spriteSheet,
        sx,
        sy,
        frameWidth,
        frameHeight, // Coordenadas de origen (Recorte)
        0,
        0,
        frameWidth,
        frameHeight, // Coordenadas de destino (Buffer)
      );

      // Guardar el fotograma listo en nuestro array
      frames.push(buffer);
    }

    // 2. INICIAR EL BUCLE DE ANIMACIÓN
    requestAnimationFrame(renderLoop);
  }

  // Función del bucle de renderizado
  function renderLoop(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    // Calcular en qué punto exacto de la animación global estamos
    const totalProgress = elapsed / MS_PER_FRAME;

    // Determinar qué fotograma estamos viendo y cuál es el siguiente
    const currentIndex = Math.floor(totalProgress) % TOTAL_FRAMES;
    const nextIndex = (currentIndex + 1) % TOTAL_FRAMES;

    // Calcular el progreso decimal dentro del fotograma actual (de 0.0 a 0.999...)
    const transitionProgress = totalProgress % 1;

    // --- CÁLCULO DE TRANSICIÓN SUAVE (EASING) ---
    // En lugar de una transición lineal robótica, usamos una curva "Ease-In-Out"
    // Esto hace que el fundido empiece lento, acelere en medio, y termine lento.
    const alpha =
      transitionProgress * transitionProgress * (3 - 2 * transitionProgress);

    // --- DIBUJADO EN PANTALLA ---
    // 1. Dibujar el fotograma actual con opacidad al 100%
    ctx.globalAlpha = 1.0;
    ctx.drawImage(frames[currentIndex], 0, 0);

    // 2. Superponer el siguiente fotograma con opacidad variable
    ctx.globalAlpha = alpha;
    ctx.drawImage(frames[nextIndex], 0, 0);

    // Llamar recursivamente al siguiente cuadro de animación (60 FPS)
    requestAnimationFrame(renderLoop);
  }

  // Asegurarnos de que la imagen base cargue antes de hacer cálculos
  if (spriteSheet.complete) {
    initAnimation();
  } else {
    spriteSheet.onload = initAnimation;
  }

  // =====================================================================
  // 🎊 SISTEMA DE CONFETTI
  // =====================================================================

  // --- CACHE DE SHAPES (EMOJIS) ---
  const _shapes = {};
  try {
    _shapes.star = confetti.shapeFromText("⭐");
    _shapes.snowflake = confetti.shapeFromText("❄️");
    _shapes.pumpkin = confetti.shapeFromText("🎃");
    _shapes.tree = confetti.shapeFromText("🎄");
    _shapes.heart = confetti.shapeFromText("💜");
    _shapes.unicorn = confetti.shapeFromText("🦄");
    _shapes.raindrop = confetti.shapeFromText("💧");
    _shapes.leaf1 = confetti.shapeFromText("🍂");
    _shapes.leaf2 = confetti.shapeFromText("🍁");
  } catch (_e) {
    console.warn("🎊 Emoji shapes no soportadas en este navegador");
  }

  // --- PRESETS DE EFECTOS ---
  // Cada preset recibe (confetti, clickOrigin, isClick).
  // isClick=true → spread:360 para explosión radial desde el punto de click.
  const PRESETS = {
    basic: (c, origin, isClick) => {
      c({
        particleCount: 150,
        spread: isClick ? 360 : 80,
        colors: CONFETTI.colors,
        origin: { y: 0.6 },
        ...(origin && { origin }),
      });
    },

    random: (c, origin, isClick) => {
      c({
        particleCount: 100,
        angle: Math.random() * 360,
        spread: 360,
        colors: CONFETTI.colors,
        origin: { y: 0.5 },
        ...(origin && { origin }),
      });
    },

    realistic: (c, origin, isClick) => {
      c({
        particleCount: 100,
        spread: isClick ? 360 : 70,
        gravity: 0.8,
        scalar: 1.2,
        flat: false,
        colors: CONFETTI.colors,
        decay: 0.94,
        origin: { y: 0.6 },
        ...(origin && { origin }),
      });
    },

    fireworks: (c, origin, isClick) => {
      const d = {
        colors: CONFETTI.colors,
        origin: { y: 0.6 },
        ...(origin && { origin }),
      };
      const f = (r, o) =>
        c({
          ...d,
          ...o,
          particleCount: Math.floor(200 * r),
          ...(isClick && { spread: 360 }),
        });
      if (isClick) {
        f(0.25, { startVelocity: 55 });
        f(0.2, { startVelocity: 45 });
        f(0.35, { decay: 0.91, scalar: 0.8 });
        f(0.1, { startVelocity: 25, decay: 0.92, scalar: 1.2 });
        f(0.1, { startVelocity: 45 });
      } else {
        f(0.25, { spread: 26, startVelocity: 55 });
        f(0.2, { spread: 60 });
        f(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        f(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        f(0.1, { spread: 120, startVelocity: 45 });
      }
    },

    stars: (c, origin, isClick) => {
      c({
        particleCount: 80,
        spread: isClick ? 360 : 100,
        colors: ["#FFD700", "#FFA500", "#FFFACD"],
        shapes: [_shapes.star || "square", "circle"],
        scalar: 1.5,
        origin: { y: 0.5 },
        ...(origin && { origin }),
      });
    },

    school: (c, origin, isClick) => {
      const col = ["#000000", "#FFD700", "#FFFFFF"];
      if (origin) {
        c({
          particleCount: 160,
          spread: isClick ? 360 : 55,
          origin,
          colors: col,
        });
      } else {
        c({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: col,
        });
        c({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: col,
        });
      }
    },

    shapes: (c, origin, isClick) => {
      c({
        particleCount: 120,
        spread: isClick ? 360 : 90,
        colors: CONFETTI.colors,
        shapes: [
          "square",
          "circle",
          _shapes.pumpkin || "square",
          _shapes.tree || "circle",
          _shapes.heart || "circle",
        ],
        scalar: 1.3,
        origin: { y: 0.5 },
        ...(origin && { origin }),
      });
    },

    emoji: (c, origin, isClick) => {
      c({
        particleCount: 60,
        spread: isClick ? 360 : 120,
        colors: ["#E91E63", "#9C27B0", "#FF9800"],
        shapes: [_shapes.unicorn || "circle"],
        scalar: 2.5,
        origin: { y: 0.5 },
        ...(origin && { origin }),
      });
    },

    custom: (c, origin, isClick) => {
      if (confetti.shapeFromPath) {
        const heart = confetti.shapeFromPath({
          path: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
        });
        c({
          particleCount: 50,
          spread: isClick ? 360 : 100,
          colors: ["#e91e63", "#ff4081", "#f50057"],
          shapes: [heart],
          scalar: 1.5,
          origin: { y: 0.2 },
          ...(origin && { origin }),
        });
      } else {
        c({
          particleCount: 50,
          spread: isClick ? 360 : 80,
          colors: ["#e91e63", "#ff4081", "#f50057"],
          origin: { y: 0.6 },
          ...(origin && { origin }),
        });
      }
    },
  };

  // --- OBTENER ORIGEN DESDE CLICK / TAP ---
  function getClickOrigin(e) {
    if (e.touches) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.touches[0].clientX - rect.left) / rect.width,
        y: (e.touches[0].clientY - rect.top) / rect.height,
      };
    }
    return {
      x: e.offsetX / canvas.clientWidth,
      y: e.offsetY / canvas.clientHeight,
    };
  }

  // --- MANEJADOR DE CLICK / TAP ---
  function burstConfetti(e) {
    e.preventDefault();
    if (CONFETTI.trigger === "off" || CONFETTI.trigger === "auto") return;
    const origin = getClickOrigin(e);
    Object.entries(CONFETTI.effects).forEach(([name, cfg]) => {
      if (cfg.click) PRESETS[name]?.(confetti, origin, true);
    });
  }

  // --- BUCLE AUTOMÁTICO ---
  let _autoInterval = null;

  function startAutoConfetti() {
    if (CONFETTI.trigger === "off" || CONFETTI.trigger === "click") return;
    _autoInterval = setInterval(() => {
      Object.entries(CONFETTI.effects).forEach(([name, cfg]) => {
        if (cfg.auto) PRESETS[name]?.(confetti);
      });
    }, CONFETTI.autoInterval);
  }

  // --- SISTEMAS CONTINUOS (snow / rain / autumn) ---
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const _continuousIntervals = {};

  const SHAPE_POOL = {
    snow: [_shapes.snowflake],
    rain: [_shapes.raindrop],
    autumn: [_shapes.leaf1, _shapes.leaf2],
  };

  function startContinuous(key) {
    const cfg = CONFETTI[key];
    if (!cfg.active) return;
    const pool = SHAPE_POOL[key] || [];

    _continuousIntervals[key] = setInterval(() => {
      for (let i = 0; i < cfg.particlesPerTick; i++) {
        confetti({
          particleCount: 1,
          spread: cfg.spread,
          startVelocity: rand(cfg.speed.min, cfg.speed.max),
          scalar: rand(cfg.scalar.min, cfg.scalar.max),
          gravity: cfg.gravity,
          ticks: cfg.ticks,
          decay: cfg.decay,
          angle: cfg.angle,
          colors: [pick(cfg.colors)],
          shapes: [pick(pool) || "circle"],
          origin: { x: Math.random(), y: -0.05 },
        });
      }
    }, cfg.tickInterval);
  }

  // --- INICIALIZAR ---
  canvas.addEventListener("click", burstConfetti);
  canvas.addEventListener("touchstart", burstConfetti, { passive: false });
  startAutoConfetti();
  startContinuous("snow");
  startContinuous("rain");
  startContinuous("autumn");
});
