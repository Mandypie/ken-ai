import React from 'react';

interface GalaxyLogoProps {
  size?: number;
  className?: string;
}

export function GalaxyLogo({ size = 32, className = '' }: GalaxyLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Ken AI logo"
    >
      <defs>
        {/* Primary gradient: Deep violet -> Relativistic rose -> Cosmic gold */}
        <linearGradient id="ken-grad-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="50%" stopColor="#FF6FB5" />
          <stop offset="100%" stopColor="#FFC46B" />
        </linearGradient>

        {/* Secondary reverse gradient for depth and dimensional curvature */}
        <linearGradient id="ken-grad-alt" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFC46B" />
          <stop offset="55%" stopColor="#FF6FB5" />
          <stop offset="100%" stopColor="#7C5CFF" />
        </linearGradient>

        {/* Radiant Singularity Core */}
        <radialGradient id="ken-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="35%" stopColor="#FFD54F" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#FF6FB5" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle outer celestial boundary ring */}
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="url(#ken-grad-main)"
        strokeWidth="1.2"
        strokeDasharray="3 4"
        opacity="0.25"
      />

      {/* Tilted orbital ellipse slicing across the emblem */}
      <ellipse
        cx="32"
        cy="32"
        rx="26"
        ry="11.5"
        transform="rotate(-28 32 32)"
        fill="none"
        stroke="url(#ken-grad-alt)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* ── THE CELESTIAL 'K' ── */}

      {/* 1. Vertical Spine (Photon beam pillar) */}
      <path
        d="M19 12 C18 24, 18 40, 19 52"
        fill="none"
        stroke="url(#ken-grad-main)"
        strokeWidth="4.8"
        strokeLinecap="round"
      />

      {/* 2. Upper Accretion Wing (Sweeping out to top-right) */}
      <path
        d="M21 32 C26 23, 34 16, 47 12.5 C49.5 11.8, 50.8 14.2, 48.8 15.8 C39 23.5, 30.5 29.5, 23 33.5 Z"
        fill="url(#ken-grad-main)"
        opacity="0.95"
      />

      {/* 3. Lower Relativistic Jet (Sweeping out to bottom-right) */}
      <path
        d="M22 31 C30.5 36, 39 42, 48 49 C50 50.8, 48.5 53, 46.2 51.8 C35.5 46, 27 38.5, 21 33 Z"
        fill="url(#ken-grad-alt)"
        opacity="0.95"
      />

      {/* 4. Glowing Singularity Core at the K vertex */}
      <circle cx="21" cy="32" r="7.5" fill="url(#ken-core)" />
      <circle cx="21" cy="32" r="2.8" fill="#FFFFFF" />

      {/* 5. Stellar Apex Sparkle */}
      <circle cx="48.5" cy="13.5" r="2.2" fill="#FFC46B" />
      <circle cx="48.5" cy="13.5" r="1.1" fill="#FFFFFF" />
    </svg>
  );
}
