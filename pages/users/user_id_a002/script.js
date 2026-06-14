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
  const MS_PER_FRAME = 1500;

  const frames = [];
  let startTime = null;

  // Función de inicialización
  function initAnimation() {
    const frameWidth = spriteSheet.naturalWidth / COLUMNS;
    const frameHeight = spriteSheet.naturalHeight / ROWS;

    canvas.width = frameWidth;
    canvas.height = frameHeight;

    console.log(`Canvas configurado: ${frameWidth}x${frameHeight}px`);

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
});
