import { useId } from "react";

// Scalable collection illustrations keep product silhouettes consistent at every size.
export function ProductVisual({
  kind = "ring",
  gemColor = "#dceef4",
  metal = "gold",
  label = "Jewelry illustration",
  halo = false,
}: {
  kind?: string;
  gemColor?: string;
  metal?: string;
  label?: string;
  halo?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  if (kind.startsWith("/"))
    return (
      <img
        src={kind}
        alt={label}
        className="product-visual"
        loading="lazy"
        decoding="async"
        width={1254}
        height={1254}
      />
    );
  const rose = metal.toLowerCase().includes("rose");
  const silver = /white|platinum|silver/i.test(metal);
  const tones = rose
    ? ["#9b6456", "#ffe0ca", "#cc8a73"]
    : silver
      ? ["#858e98", "#ffffff", "#b8c4cc"]
      : ["#98713b", "#fff0c0", "#d5ac67"];
  const gold = `url(#metal-${id})`;
  const stone = (x: number, y: number, scale = 1) => (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <polygon
        points="0,-30 24,-20 30,3 16,26 -16,26 -30,3 -24,-20"
        fill={gemColor}
        stroke={gold}
        strokeWidth="3"
      />
      <polygon
        points="0,-18 15,-11 18,3 9,16 -9,16 -18,3 -15,-11"
        fill={`url(#gem-${id})`}
        stroke="#fff"
        strokeOpacity=".6"
        strokeWidth="1"
      />
      <path
        d="M0-30 0-18M24-20 15-11M30 3 18 3M16 26 9 16M-16 26-9 16M-30 3-18 3M-24-20-15-11M0-18 9 16-15-11 18 3-9 16 15-11-18 3Z"
        fill="none"
        stroke="#fff"
        strokeOpacity=".5"
      />
      <path d="M-21-18-9-22M-18-15-6-19" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
  const smallStones = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    count: number,
    start = 0,
    end = Math.PI * 2,
  ) =>
    Array.from({ length: count }, (_, index) => {
      const angle = start + ((end - start) * index) / count;
      return (
        <circle
          key={index}
          cx={cx + rx * Math.cos(angle)}
          cy={cy + ry * Math.sin(angle)}
          r="4"
          fill="#eef8ff"
          stroke={gold}
          strokeWidth="1.5"
        />
      );
    });
  return (
    <svg viewBox="0 0 400 360" role="img" aria-label={label} className="product-visual">
      <defs>
        <linearGradient id={`metal-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={tones[0]} />
          <stop offset=".3" stopColor={tones[1]} />
          <stop offset=".48" stopColor={tones[2]} />
          <stop offset=".7" stopColor={tones[1]} />
          <stop offset="1" stopColor={tones[0]} />
        </linearGradient>
        <linearGradient id={`gem-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="white" />
          <stop offset=".32" stopColor={gemColor} />
          <stop offset=".7" stopColor={gemColor} />
          <stop offset="1" stopColor="white" />
        </linearGradient>
        <radialGradient id={`shadow-${id}`}>
          <stop stopColor="#6d5040" stopOpacity=".16" />
          <stop offset="1" stopColor="#6d5040" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="289" rx="100" ry="17" fill={`url(#shadow-${id})`} />
      {kind === "ring" && (
        <g transform="rotate(-22 200 185)">
          <ellipse cx="200" cy="196" rx="62" ry="77" fill="none" stroke={gold} strokeWidth="13" />
          <ellipse
            cx="200"
            cy="196"
            rx="59"
            ry="75"
            fill="none"
            stroke="#fff7dd"
            strokeOpacity=".7"
            strokeWidth="2"
          />
          <path d="m139 174 29-42M261 174l-29-42" stroke={gold} strokeWidth="9" />
          {smallStones(200, 185, 59, 70, 14, Math.PI, Math.PI * 2)}
          {halo && smallStones(200, 117, 40, 37, 18)}
          {stone(200, 116, 1.14)}
        </g>
      )}
      {kind === "necklace" && (
        <g>
          <path
            d="M93 76c-23 134 48 158 107 158S329 210 307 76"
            fill="none"
            stroke={gold}
            strokeWidth="5"
          />
          <path
            d="M93 76c-23 134 48 158 107 158S329 210 307 76"
            fill="none"
            stroke="#fff7dd"
            strokeDasharray="2 5"
            strokeWidth="2"
          />
          {halo && smallStones(200, 139, 98, 92, 28, 0, Math.PI)}
          <path d="M200 233v9" stroke={gold} strokeWidth="4" />
          {stone(200, 263, halo ? 1.18 : 0.72)}
        </g>
      )}
      {kind === "earrings" &&
        [146, 254].map((x) => (
          <g key={x}>
            <circle cx={x} cy="111" r="9" fill="#f4fbff" stroke={gold} strokeWidth="3" />
            <path
              d={`M${x} 121q-24 34 0 61q24-27 0-61`}
              fill="none"
              stroke={gold}
              strokeWidth="5"
            />
            {stone(x, 219, 0.82)}
            <path
              d={`M${x - 18} 137v26M${x + 18} 137v26`}
              stroke="#f0faff"
              strokeWidth="3"
              strokeDasharray="3 4"
            />
          </g>
        ))}
      {kind === "bracelet" && (
        <g transform="rotate(-20 200 190)">
          <ellipse cx="200" cy="188" rx="109" ry="57" fill="none" stroke={gold} strokeWidth="11" />
          {smallStones(200, 188, 109, 57, 44)}
          <rect x="192" y="235" width="17" height="18" rx="3" fill={gold} />
        </g>
      )}
      <path d="m287 105 2 8 8 2-8 2-2 8-2-8-8-2 8-2Z" fill="white" opacity=".8" />
    </svg>
  );
}
