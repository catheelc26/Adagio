// Elementos decorativos: la línea de barra, el trazo de bailarina animado,
// y el patrón de fondo para pantallas de entrada tipo "premium".

export const Barre = ({ className = "" }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="barre-line" />
    <span className="absolute h-1.5 w-1.5 rotate-45" style={{ backgroundColor: "var(--color-bronze)" }} />
  </div>
);

export const BalletFlourish = ({ size = 40, color = "#14A39A", className = "", animateDraw = false }) => (
  <svg width={size} height={size * 2} viewBox="0 0 70 140" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M44 3 C40 3, 38 7, 41 10 C43 12, 41 14, 38 12 L35 32 C34 40, 30 42, 27 46 C24 50, 27 55, 32 53 C36 51, 36 46, 32 44"
      stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      className={animateDraw ? "draw-path" : ""} style={animateDraw ? { animationDelay: "0.1s" } : {}}
    />
    <path
      d="M32 53 C24 50, 12 51, 10 60 C8 68, 18 72, 27 68 C33 65, 33 58, 27 57 C23 56, 20 60, 23 63"
      stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      className={animateDraw ? "draw-path" : ""} style={animateDraw ? { animationDelay: "0.5s" } : {}}
    />
    <path
      d="M27 68 C36 72, 50 72, 56 65 C61 59, 55 52, 47 55 C42 57, 42 63, 47 65 C51 67, 55 64, 53 60"
      stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      className={animateDraw ? "draw-path" : ""} style={animateDraw ? { animationDelay: "0.9s" } : {}}
    />
    <path
      d="M27 68 C22 78, 18 90, 20 102 C21 112, 26 120, 24 128 C23 133, 17 136, 13 132 C10 129, 13 125, 17 127"
      stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      className={animateDraw ? "draw-path" : ""} style={animateDraw ? { animationDelay: "1.3s" } : {}}
    />
  </svg>
);

export const PremiumPattern = () => (
  <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: 0.3 }} preserveAspectRatio="none" viewBox="0 0 380 760" xmlns="http://www.w3.org/2000/svg">
    <path d="M-20 40 L120 200 M40 -20 L220 180" stroke="#BE9B3F" strokeWidth="1" />
    <path d="M280 -20 L440 160" stroke="#2B5C8A" strokeWidth="1" />
    <path d="M260 620 L420 760 M180 680 L360 760" stroke="#14A39A" strokeWidth="1" />
    <path d="M320 540 L460 700" stroke="#2B5C8A" strokeWidth="1" />
    <circle cx="70" cy="90" r="4" fill="#fff" />
    <circle cx="330" cy="140" r="3" fill="#fff" />
    <circle cx="60" cy="660" r="3.5" fill="#fff" />
  </svg>
);
