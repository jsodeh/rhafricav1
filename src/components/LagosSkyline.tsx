import React from "react";

const LagosSkyline = () => (
  <svg
    viewBox="0 0 1440 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-40 md:h-56 lg:h-64"
    preserveAspectRatio="none"
    style={{ display: 'block' }}
  >
    <defs>
      <linearGradient id="lagos-gradient" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e40af" />
        <stop offset="1" stopColor="#fbbf24" />
      </linearGradient>
    </defs>
    {/* Lagos skyline silhouette - inspired by the images provided */}
    <path
      d="M0 160 L40 150 L60 120 L80 130 L100 110 L120 140 L140 120 L160 130 L180 100 L200 120 L220 110 L240 140 L260 120 L280 130 L300 100 L320 120 L340 110 L360 140 L380 120 L400 130 L420 100 L440 120 L460 110 L480 140 L500 120 L520 130 L540 100 L560 120 L580 110 L600 140 L620 120 L640 130 L660 100 L680 120 L700 110 L720 140 L740 120 L760 130 L780 100 L800 120 L820 110 L840 140 L860 120 L880 130 L900 100 L920 120 L940 110 L960 140 L980 120 L1000 130 L1020 100 L1040 120 L1060 110 L1080 140 L1100 120 L1120 130 L1140 100 L1160 120 L1180 110 L1200 140 L1220 120 L1240 130 L1260 100 L1280 120 L1300 110 L1320 140 L1340 120 L1360 130 L1380 100 L1400 120 L1440 160 V180 H0 Z"
      fill="url(#lagos-gradient)"
      opacity="0.95"
    />
    {/* Add some iconic Lagos buildings/bridges as stylized rectangles and lines for extra detail */}
    <rect x="100" y="80" width="30" height="70" fill="#1e40af" opacity="0.7" /> {/* Eko Hotel */}
    <rect x="300" y="60" width="20" height="90" fill="#1e40af" opacity="0.7" /> {/* Civic Center */}
    <rect x="600" y="100" width="18" height="50" fill="#fbbf24" opacity="0.7" /> {/* National Theatre */}
    <rect x="900" y="70" width="25" height="80" fill="#1e40af" opacity="0.7" /> {/* UBA House */}
    <rect x="1200" y="90" width="22" height="60" fill="#fbbf24" opacity="0.7" /> {/* NITEL Building */}
    {/* Stylized bridge (Third Mainland) */}
    <polyline points="200,140 250,100 300,140" fill="none" stroke="#fbbf24" strokeWidth="6" opacity="0.8" />
    <polyline points="1100,140 1150,100 1200,140" fill="none" stroke="#fbbf24" strokeWidth="6" opacity="0.8" />
  </svg>
);

export default LagosSkyline; 