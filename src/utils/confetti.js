const COLORS = ['#0B6657', '#BDE8D5', '#F59E0B', '#FCD34D', '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6'];
const WAVE_DELAYS = [0, 0.35, 0.7];
const FLAKES_PER_SIDE = 60;
const DURATION = 5.5;
const FADE_TIME = 1;
const GRAVITY = 300;
const DRAG_RATE = 1.2;
const MAX_FRAME_TIME = 0.05;

const random = (min, max) => min + Math.random() * (max - min);

function createFlake(side, delay, width, height) {
  const fromLeft = side === 'left';
  const spread = (random(10, 55) * Math.PI) / 180;
  const speed = Math.max(width, height) * random(0.9, 1.9);

  return {
    delay,
    x: fromLeft ? 0 : width,
    y: height,
    velocityX: Math.sin(spread) * speed * (fromLeft ? 1 : -1),
    velocityY: -Math.cos(spread) * speed,
    size: random(6, 11),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    isRound: Math.random() < 0.25,
    rotation: random(0, Math.PI * 2),
    rotationSpeed: random(-8, 8),
    flip: random(0, Math.PI * 2),
    flipSpeed: random(5, 12),
  };
}

function drawFlake(context, flake) {
  context.save();
  context.translate(flake.x, flake.y);
  context.rotate(flake.rotation);
  context.scale(1, Math.cos(flake.flip));
  context.fillStyle = flake.color;

  if (flake.isRound) {
    context.beginPath();
    context.arc(0, 0, flake.size / 2, 0, Math.PI * 2);
    context.fill();
  } else {
    context.fillRect(-flake.size / 2, -flake.size / 3, flake.size, flake.size * 0.66);
  }
  context.restore();
}

/**
 * Pops confetti from both bottom corners. Returns a function that stops it.
 * Does nothing for people who ask their system to reduce motion.
 */
export function launchConfetti(canvas) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

  const context = canvas.getContext('2d');
  if (!context) return undefined;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  context.scale(pixelRatio, pixelRatio);

  const flakes = WAVE_DELAYS.flatMap((delay) =>
    ['left', 'right'].flatMap((side) =>
      Array.from({ length: FLAKES_PER_SIDE }, () => createFlake(side, delay + random(0, 0.1), width, height)),
    ),
  );

  let frame;
  let elapsed = 0;
  let previous = performance.now();

  const animate = (now) => {
    const delta = Math.min((now - previous) / 1000, MAX_FRAME_TIME);
    previous = now;
    elapsed += delta;

    context.clearRect(0, 0, width, height);
    if (elapsed >= DURATION) return;

    context.globalAlpha = Math.min((DURATION - elapsed) / FADE_TIME, 1);
    const drag = Math.exp(-DRAG_RATE * delta);

    for (const flake of flakes) {
      if (elapsed < flake.delay) continue;

      flake.velocityX *= drag;
      flake.velocityY = flake.velocityY * drag + GRAVITY * delta;
      flake.x += flake.velocityX * delta;
      flake.y += flake.velocityY * delta;
      flake.rotation += flake.rotationSpeed * delta;
      flake.flip += flake.flipSpeed * delta;
      drawFlake(context, flake);
    }

    frame = requestAnimationFrame(animate);
  };

  frame = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(frame);
    context.clearRect(0, 0, width, height);
  };
}
