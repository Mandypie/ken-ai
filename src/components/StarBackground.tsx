import { useRef, useEffect, useCallback } from 'react';
import { useMotion } from '../hooks/useMotion';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useTheme } from '../hooks/useTheme';

/* ── Background Star Field ── */
interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  phase: number;
  speed: number;
}

/* ── Night: Relativistic Plasma Filaments (Black Hole) ── */
interface PlasmaFilament {
  radius: number;
  angle: number;
  angularSpeed: number;
  arcLength: number;
  width: number;
  color: string;
  brightness: number;
  zLayer: 'rear-lensed' | 'front-disk' | 'outer-ring';
}

/* ── Night: Passing Comets ── */
interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tailLength: number;
  headRadius: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  sparkles: { x: number; y: number; size: number; alpha: number }[];
}

/* ── Daybreak: Solar Magnetic Prominence Loop ── */
interface SolarProminence {
  baseAngle: number;
  arcSpan: number;
  loopHeight: number;
  oscillationFreq: number;
  phase: number;
  strokeWidth: number;
  color: string;
}

/* ── Daybreak: Coronal Solar Wind Particle ── */
interface SolarWindMote {
  angle: number;
  distance: number;
  speed: number;
  size: number;
  baseAlpha: number;
  color: string;
  wobblePhase: number;
}

export function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldAnimate = useMotion();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State refs
  const starsRef = useRef<Star[]>([]);
  const filamentsRef = useRef<PlasmaFilament[]>([]);
  const cometsRef = useRef<Comet[]>([]);
  const prominencesRef = useRef<SolarProminence[]>([]);
  const solarWindRef = useRef<SolarWindMote[]>([]);
  const nextCometTimeRef = useRef<number>(0);
  const flarePulseRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  // Initialize stars
  const initStars = useCallback((width: number, height: number) => {
    const count = isMobile ? 50 : 130;
    starsRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      baseAlpha: Math.random() * 0.45 + 0.25,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.8 + 0.3,
    }));
  }, [isMobile]);

  // Initialize Night Mode: Black Hole accretion plasma
  const initBlackHolePlasma = useCallback((baseRadius: number) => {
    const palette = [
      '#FFFFFF',
      '#FFF8E1',
      '#FFD54F',
      '#FFA726',
      '#FF7043',
      '#EC407A',
      '#AB47BC',
      '#7C5CFF',
    ];

    const filamentCount = isMobile ? 220 : 450;
    filamentsRef.current = Array.from({ length: filamentCount }, (_, i) => {
      const isInner = i % 3 !== 0;
      const r = isInner
        ? baseRadius * (1.02 + Math.pow(Math.random(), 0.6) * 0.7)
        : baseRadius * (1.6 + Math.random() * 1.6);

      const orbitalSpeed = (0.028 * Math.pow(baseRadius / r, 1.4)) * (0.85 + Math.random() * 0.3);
      const layerType: 'rear-lensed' | 'front-disk' | 'outer-ring' =
        i % 4 === 0 ? 'rear-lensed' : i % 4 === 1 ? 'outer-ring' : 'front-disk';

      return {
        radius: r,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: orbitalSpeed,
        arcLength: Math.random() * 0.65 + 0.2,
        width: Math.random() * 2.8 + 0.8,
        color: palette[Math.floor(Math.random() * palette.length)],
        brightness: Math.random() * 0.6 + 0.4,
        zLayer: layerType,
      };
    });
  }, [isMobile]);

  // Initialize Daybreak Mode: Radiant Stellar Prominences & Solar Wind
  const initRadiantStellar = useCallback((sunRadius: number) => {
    const prominenceColors = [
      '#FFE082', // Warm gold
      '#FFB74D', // Solar amber
      '#FF8A65', // Sunset peach
      '#FF80AB', // Coronal rose
      '#EA80FC', // Violet flare
      '#FFFFFF', // White-hot plasma
    ];

    // 8-12 magnetic prominence loops emerging from the sun's surface
    const loopCount = isMobile ? 7 : 11;
    prominencesRef.current = Array.from({ length: loopCount }, (_, i) => ({
      baseAngle: (i * (Math.PI * 2 / loopCount)) + (Math.random() * 0.3 - 0.15),
      arcSpan: Math.random() * 0.35 + 0.2, // angular distance between loop roots
      loopHeight: sunRadius * (0.35 + Math.random() * 0.75), // loop apex extension
      oscillationFreq: Math.random() * 0.8 + 0.6,
      phase: Math.random() * Math.PI * 2,
      strokeWidth: Math.random() * 2.5 + 1.2,
      color: prominenceColors[Math.floor(Math.random() * prominenceColors.length)],
    }));

    // 70 solar wind motes radiating outward into the daytime atmosphere
    const moteCount = isMobile ? 40 : 75;
    solarWindRef.current = Array.from({ length: moteCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: sunRadius * (1.05 + Math.random() * 2.2),
      speed: Math.random() * 0.6 + 0.4,
      size: Math.random() * 2.0 + 0.8,
      baseAlpha: Math.random() * 0.45 + 0.25,
      color: prominenceColors[Math.floor(Math.random() * prominenceColors.length)],
      wobblePhase: Math.random() * Math.PI * 2,
    }));
  }, [isMobile]);

  // Spawn night comet
  const spawnComet = useCallback((width: number, height: number) => {
    const startX = width * (0.3 + Math.random() * 0.75);
    const startY = -40;
    const trajectoryAngle = Math.PI * 0.73 + (Math.random() * 0.2 - 0.1);
    const speed = Math.random() * 4.5 + 6.5;
    const maxLife = Math.floor(Math.random() * 120 + 100);

    cometsRef.current.push({
      x: startX,
      y: startY,
      vx: Math.cos(trajectoryAngle) * speed,
      vy: Math.sin(trajectoryAngle) * speed,
      tailLength: Math.random() * 80 + 110,
      headRadius: Math.random() * 1.5 + 1.8,
      alpha: 0,
      maxAlpha: Math.random() * 0.35 + 0.65,
      life: 0,
      maxLife,
      sparkles: [],
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initStars(width, height);
      const bhRadius = Math.min(width, height) * (isMobile ? 0.19 : 0.21);
      initBlackHolePlasma(bhRadius);

      const sunRadius = Math.min(width, height) * (isMobile ? 0.16 : 0.18);
      initRadiantStellar(sunRadius);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let frameTime = 0;
    let isVisible = true;
    nextCometTimeRef.current = performance.now() + 600;

    const onVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible && shouldAnimate) renderLoop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const renderLoop = () => {
      if (!isVisible || !ctx) return;

      ctx.clearRect(0, 0, width, height);
      frameTime += 0.016;

      // ── 1. BACKGROUND STARS ──
      for (const star of starsRef.current) {
        const starAlpha = shouldAnimate
          ? star.baseAlpha + Math.sin(frameTime * star.speed + star.phase) * 0.3
          : star.baseAlpha;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `rgba(238, 240, 250, ${Math.max(0.04, Math.min(0.85, starAlpha))})`
          : `rgba(90, 80, 140, ${Math.max(0.01, Math.min(0.22, starAlpha * 0.35))})`;
        ctx.fill();
      }

      // Center position of cosmic anchor (framed in upper right on desktop, center on mobile)
      const cx = isMobile ? width * 0.5 : width * 0.71;
      const cy = isMobile ? height * 0.37 : height * 0.44;

      // ══════════════════════════════════════════════════════════════
      // ── 2. DAYBREAK MODE: RADIANT STELLAR (THE DAWN STAR & PROMINENCES)
      // ══════════════════════════════════════════════════════════════
      if (!isDark) {
        const R_sun = Math.min(width, height) * (isMobile ? 0.16 : 0.18);

        ctx.save();
        ctx.translate(cx, cy);

        // Slow stellar rotation
        if (shouldAnimate) {
          ctx.rotate(frameTime * 0.03);
        }

        // 2a. Expansive Soft Dawn Corona (Subtle atmospheric warmth)
        const coronaAura = ctx.createRadialGradient(0, 0, R_sun * 0.7, 0, 0, R_sun * 3.4);
        coronaAura.addColorStop(0, 'rgba(255, 248, 225, 0.45)');
        coronaAura.addColorStop(0.2, 'rgba(255, 213, 79, 0.25)');
        coronaAura.addColorStop(0.45, 'rgba(255, 138, 128, 0.12)');
        coronaAura.addColorStop(0.7, 'rgba(179, 136, 255, 0.04)');
        coronaAura.addColorStop(1, 'rgba(247, 246, 251, 0)');
        ctx.fillStyle = coronaAura;
        ctx.beginPath();
        ctx.arc(0, 0, R_sun * 3.4, 0, Math.PI * 2);
        ctx.fill();

        // 2b. Magnetic Solar Prominence Loops (Looping plasma arcs)
        for (const loop of prominencesRef.current) {
          // Breathing motion of loops
          const breathing = shouldAnimate
            ? Math.sin(frameTime * loop.oscillationFreq + loop.phase) * 0.18
            : 0;
          const currentHeight = loop.loopHeight * (1.0 + breathing);

          const a1 = loop.baseAngle;
          const a2 = loop.baseAngle + loop.arcSpan;
          const midAngle = (a1 + a2) / 2;

          // Loop base points on sun's surface
          const x1 = Math.cos(a1) * R_sun;
          const y1 = Math.sin(a1) * R_sun;
          const x2 = Math.cos(a2) * R_sun;
          const y2 = Math.sin(a2) * R_sun;

          // Apex control points arching high into the corona
          const apexR = R_sun + currentHeight;
          const cpx = Math.cos(midAngle) * apexR;
          const cpy = Math.sin(midAngle) * apexR;

          ctx.save();
          const loopGrad = ctx.createLinearGradient(x1, y1, cpx, cpy);
          loopGrad.addColorStop(0, 'rgba(255, 179, 0, 0.2)');
          loopGrad.addColorStop(0.5, loop.color);
          loopGrad.addColorStop(1, 'rgba(255, 255, 255, 0.85)');

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(cpx, cpy, x2, y2);
          ctx.strokeStyle = loopGrad;
          ctx.lineWidth = loop.strokeWidth;
          ctx.lineCap = 'round';
          ctx.shadowColor = '#FFD54F';
          ctx.shadowBlur = 10;
          ctx.stroke();

          // Plasma bead moving along loop apex
          if (shouldAnimate) {
            const beadProgress = (Math.sin(frameTime * loop.oscillationFreq * 1.5 + loop.phase) + 1) / 2;
            const bx = (1 - beadProgress) * (1 - beadProgress) * x1 + 2 * (1 - beadProgress) * beadProgress * cpx + beadProgress * beadProgress * x2;
            const by = (1 - beadProgress) * (1 - beadProgress) * y1 + 2 * (1 - beadProgress) * beadProgress * cpy + beadProgress * beadProgress * y2;

            ctx.beginPath();
            ctx.arc(bx, by, loop.strokeWidth * 0.9, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#FFFFFF';
            ctx.shadowBlur = 8;
            ctx.fill();
          }

          ctx.restore();
        }

        // 2c. Drifting Solar Wind Particles
        for (const mote of solarWindRef.current) {
          if (shouldAnimate) {
            mote.distance += mote.speed;
            mote.angle += 0.002;
            // Recycle motes that drift too far
            if (mote.distance > R_sun * 3.2) {
              mote.distance = R_sun * 1.05;
              mote.angle = Math.random() * Math.PI * 2;
            }
          }

          const mx = Math.cos(mote.angle) * mote.distance;
          const my = Math.sin(mote.angle) * mote.distance;

          // Fade out towards outer corona
          const distRatio = (mote.distance - R_sun) / (R_sun * 2.2);
          const alpha = mote.baseAlpha * Math.max(0, 1 - distRatio);

          ctx.beginPath();
          ctx.arc(mx, my, mote.size, 0, Math.PI * 2);
          ctx.fillStyle = mote.color;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = '#FFD54F';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // 2d. Chromosphere Solar Flare Ring (Pulsating inner halo)
        const flarePulse = Math.sin(frameTime * 1.2) * 0.04;
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R_sun * (1.02 + flarePulse), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 179, 0, 0.45)';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#FF8A65';
        ctx.shadowBlur = 20;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, R_sun * (0.99 + flarePulse * 0.5), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 248, 225, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#FFF59D';
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();

        // 2e. Radiant Photosphere (Luminous white-gold core disk)
        const coreSunGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, R_sun);
        coreSunGrad.addColorStop(0, '#FFFFFF'); // Dazzling white core
        coreSunGrad.addColorStop(0.4, '#FFF9C4'); // Cream white-gold
        coreSunGrad.addColorStop(0.75, '#FFE082'); // Solar amber
        coreSunGrad.addColorStop(0.95, '#FFB74D'); // Warm limb edge
        coreSunGrad.addColorStop(1, 'rgba(255, 167, 38, 0.85)');

        ctx.save();
        ctx.fillStyle = coreSunGrad;
        ctx.shadowColor = '#FFE082';
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.arc(0, 0, R_sun * 0.96, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore(); // Restore sun translation
      }

      // ══════════════════════════════════════════════════════════════
      // ── 3. NIGHT MODE: GARGANTUA ROTATING BLACK HOLE & PASSING COMETS
      // ══════════════════════════════════════════════════════════════
      if (isDark) {
        const R = Math.min(width, height) * (isMobile ? 0.19 : 0.21); // Event horizon radius

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.16); // Tilt into perspective

        // 3a. Broad Diffuse Cosmic Halo
        const outerHalo = ctx.createRadialGradient(0, 0, R * 0.8, 0, 0, R * 3.6);
        outerHalo.addColorStop(0, 'rgba(255, 235, 190, 0.2)');
        outerHalo.addColorStop(0.25, 'rgba(255, 175, 90, 0.12)');
        outerHalo.addColorStop(0.5, 'rgba(236, 64, 122, 0.06)');
        outerHalo.addColorStop(0.75, 'rgba(124, 92, 255, 0.03)');
        outerHalo.addColorStop(1, 'rgba(7, 8, 18, 0)');
        ctx.fillStyle = outerHalo;
        ctx.beginPath();
        ctx.arc(0, 0, R * 3.6, 0, Math.PI * 2);
        ctx.fill();

        // 3b. REAR GRAVITATIONAL LENSING ARCHES
        const upperLensedSquash = 0.95;
        const lowerLensedSquash = 0.82;

        ctx.save();
        ctx.scale(1, upperLensedSquash);
        const upperArchBase = ctx.createRadialGradient(0, -R * 0.1, R * 0.97, 0, -R * 0.1, R * 2.2);
        upperArchBase.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        upperArchBase.addColorStop(0.12, 'rgba(255, 224, 140, 0.7)');
        upperArchBase.addColorStop(0.35, 'rgba(255, 160, 80, 0.4)');
        upperArchBase.addColorStop(0.65, 'rgba(236, 64, 122, 0.18)');
        upperArchBase.addColorStop(1, 'rgba(124, 92, 255, 0)');
        ctx.fillStyle = upperArchBase;
        ctx.beginPath();
        ctx.arc(0, -R * 0.08, R * 2.15, Math.PI * 0.88, Math.PI * 2.12);
        ctx.arc(0, 0, R * 0.96, Math.PI * 2.05, Math.PI * 0.95, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.scale(1, lowerLensedSquash);
        const lowerArchBase = ctx.createRadialGradient(0, R * 0.1, R * 0.97, 0, R * 0.1, R * 1.85);
        lowerArchBase.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        lowerArchBase.addColorStop(0.15, 'rgba(255, 215, 120, 0.45)');
        lowerArchBase.addColorStop(0.45, 'rgba(236, 64, 122, 0.18)');
        lowerArchBase.addColorStop(1, 'rgba(124, 92, 255, 0)');
        ctx.fillStyle = lowerArchBase;
        ctx.beginPath();
        ctx.arc(0, R * 0.08, R * 1.8, Math.PI * 0.08, Math.PI * 0.92);
        ctx.arc(0, 0, R * 0.96, Math.PI * 0.95, Math.PI * 0.05, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 3c. Rotating Gas Plumes in Lensed Arches
        for (const filament of filamentsRef.current) {
          if (shouldAnimate) {
            filament.angle += filament.angularSpeed;
          }

          if (filament.zLayer === 'rear-lensed') {
            const isUpper = Math.cos(filament.angle) > -0.25;
            const squash = isUpper ? upperLensedSquash : lowerLensedSquash;

            ctx.save();
            ctx.scale(1.04, squash);
            const doppler = Math.pow(0.5 - 0.5 * Math.cos(filament.angle), 1.5) * 0.8 + 0.2;

            ctx.beginPath();
            ctx.arc(0, isUpper ? -R * 0.08 : R * 0.08, filament.radius * 0.82, filament.angle, filament.angle + filament.arcLength);
            ctx.strokeStyle = filament.color;
            ctx.globalAlpha = Math.min(1, filament.brightness * doppler * 0.85);
            ctx.lineWidth = filament.width * 1.5;
            ctx.stroke();
            ctx.restore();
          }
        }

        // 3d. PITCH-BLACK EVENT HORIZON SHADOW
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.96, 0, Math.PI * 2);
        ctx.fillStyle = '#040510';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 28;
        ctx.fill();
        ctx.restore();

        // 3e. INNER PHOTON SPHERE
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.98, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#FFF9C4';
        ctx.shadowBlur = 14;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, R * 1.01, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 196, 107, 0.8)';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#FF7043';
        ctx.shadowBlur = 22;
        ctx.stroke();
        ctx.restore();

        // 3f. FOREGROUND EQUATORIAL ACCRETION DISK
        const diskSquash = 0.21;
        ctx.save();
        ctx.scale(1.0, diskSquash);

        const diskBaseGlow = ctx.createRadialGradient(0, 0, R * 1.02, 0, 0, R * 3.3);
        diskBaseGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        diskBaseGlow.addColorStop(0.12, 'rgba(255, 235, 180, 0.85)');
        diskBaseGlow.addColorStop(0.35, 'rgba(255, 175, 80, 0.6)');
        diskBaseGlow.addColorStop(0.65, 'rgba(236, 64, 122, 0.35)');
        diskBaseGlow.addColorStop(0.85, 'rgba(124, 92, 255, 0.15)');
        diskBaseGlow.addColorStop(1, 'rgba(7, 8, 18, 0)');
        ctx.fillStyle = diskBaseGlow;
        ctx.beginPath();
        ctx.arc(0, 0, R * 3.3, 0, Math.PI * 2);
        ctx.fill();

        for (const filament of filamentsRef.current) {
          if (filament.zLayer === 'front-disk' || filament.zLayer === 'outer-ring') {
            const normalizedAngle = ((filament.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const isFront = normalizedAngle > Math.PI * 0.05 && normalizedAngle < Math.PI * 0.95;

            const cosA = Math.cos(filament.angle);
            const doppler = Math.pow(0.55 - 0.45 * cosA, 1.8) * 0.85 + 0.15;

            ctx.beginPath();
            ctx.arc(0, 0, filament.radius, filament.angle, filament.angle + filament.arcLength * 1.5);
            ctx.strokeStyle = filament.color;
            ctx.globalAlpha = Math.min(1, filament.brightness * doppler * (isFront ? 1.0 : 0.45));
            ctx.lineWidth = filament.width * 1.8;
            ctx.stroke();
          }
        }
        ctx.restore();

        // 3g. Clip top event horizon silhouette
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.96, Math.PI * 1.05, Math.PI * 1.95);
        ctx.fillStyle = '#040510';
        ctx.fill();
        ctx.restore();

        ctx.restore(); // Restore black hole translation

        // 3h. PASSING COMETS
        const currentTime = performance.now();
        if (shouldAnimate && currentTime > nextCometTimeRef.current && cometsRef.current.length < 3) {
          spawnComet(width, height);
          nextCometTimeRef.current = currentTime + 2200 + Math.random() * 2300;
        }

        for (let i = cometsRef.current.length - 1; i >= 0; i--) {
          const comet = cometsRef.current[i];

          if (shouldAnimate) {
            comet.x += comet.vx;
            comet.y += comet.vy;
            comet.life++;

            const progress = comet.life / comet.maxLife;
            if (progress < 0.18) {
              comet.alpha = (progress / 0.18) * comet.maxAlpha;
            } else if (progress > 0.6) {
              comet.alpha = ((1 - progress) / 0.4) * comet.maxAlpha;
            } else {
              comet.alpha = comet.maxAlpha;
            }

            if (Math.random() < 0.4) {
              comet.sparkles.push({
                x: comet.x + (Math.random() * 4 - 2),
                y: comet.y + (Math.random() * 4 - 2),
                size: Math.random() * 1.5 + 0.5,
                alpha: comet.alpha * 0.8,
              });
            }

            for (let s = comet.sparkles.length - 1; s >= 0; s--) {
              comet.sparkles[s].alpha -= 0.03;
              if (comet.sparkles[s].alpha <= 0) {
                comet.sparkles.splice(s, 1);
              }
            }
          }

          for (const sp of comet.sparkles) {
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 235, 180, ${sp.alpha})`;
            ctx.fill();
          }

          const tailAngle = Math.atan2(comet.vy, comet.vx) + Math.PI;
          const tailEndX = comet.x + Math.cos(tailAngle) * comet.tailLength;
          const tailEndY = comet.y + Math.sin(tailAngle) * comet.tailLength;

          ctx.save();
          const tailGrad = ctx.createLinearGradient(comet.x, comet.y, tailEndX, tailEndY);
          tailGrad.addColorStop(0, `rgba(255, 255, 255, ${comet.alpha})`);
          tailGrad.addColorStop(0.12, `rgba(255, 224, 130, ${comet.alpha * 0.95})`);
          tailGrad.addColorStop(0.4, `rgba(255, 111, 181, ${comet.alpha * 0.6})`);
          tailGrad.addColorStop(0.8, `rgba(124, 92, 255, ${comet.alpha * 0.2})`);
          tailGrad.addColorStop(1, 'rgba(124, 92, 255, 0)');

          ctx.beginPath();
          ctx.moveTo(comet.x, comet.y);
          ctx.lineTo(tailEndX, tailEndY);
          ctx.strokeStyle = tailGrad;
          ctx.lineWidth = comet.headRadius * 1.8;
          ctx.lineCap = 'round';
          ctx.stroke();

          const headGlow = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, comet.headRadius * 4.5);
          headGlow.addColorStop(0, `rgba(255, 255, 255, ${comet.alpha})`);
          headGlow.addColorStop(0.35, `rgba(255, 224, 130, ${comet.alpha * 0.85})`);
          headGlow.addColorStop(1, 'rgba(255, 111, 181, 0)');
          ctx.fillStyle = headGlow;
          ctx.beginPath();
          ctx.arc(comet.x, comet.y, comet.headRadius * 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(comet.x, comet.y, comet.headRadius * 0.9, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${comet.alpha})`;
          ctx.fill();
          ctx.restore();

          if (comet.life >= comet.maxLife || comet.x < -150 || comet.y > height + 150) {
            cometsRef.current.splice(i, 1);
          }
        }
      }

      if (shouldAnimate) {
        rafRef.current = requestAnimationFrame(renderLoop);
      }
    };

    renderLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(rafRef.current);
    };
  }, [shouldAnimate, initStars, initBlackHolePlasma, initRadiantStellar, spawnComet, isDark, isMobile]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Background ambient gradient */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: isDark
            ? `
              radial-gradient(circle at 71% 44%, rgba(124, 92, 255, 0.14) 0%, transparent 65%),
              linear-gradient(-20deg,
                transparent 15%,
                rgba(124, 92, 255, 0.05) 30%,
                rgba(255, 111, 181, 0.07) 45%,
                rgba(255, 196, 107, 0.05) 60%,
                transparent 75%
              )
            `
            : `
              radial-gradient(circle at 71% 44%, rgba(255, 224, 130, 0.18) 0%, transparent 65%),
              linear-gradient(-20deg,
                transparent 20%,
                rgba(255, 179, 0, 0.02) 35%,
                rgba(255, 112, 67, 0.025) 50%,
                transparent 70%
              )
            `,
          filter: isDark ? 'blur(55px)' : 'blur(60px)',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
