import { useId } from "react";
import type { CustomRing } from "@/lib/jewelry-data";

export function EngravingPreview({
  text,
  style = "Serif",
  metal = "Default",
}: {
  text: string;
  style?: CustomRing["engravingStyle"];
  metal?: string;
}) {
  const id = useId().replace(/:/g, "");
  const rose = /rose/i.test(metal);
  const silver = /silver/i.test(metal) && !/gold|rose/i.test(metal);
  const colors = rose
    ? ["#ac6a54", "#ffe0cf", "#c08871"]
    : silver
      ? ["#777f86", "#f5faff", "#b4bec8"]
      : ["#97723b", "#fff1c5", "#c9a567"];
  return (
    <svg
      className="engraving-visual"
      viewBox="0 0 440 280"
      role="img"
      aria-label={`Inside ${metal} band${text ? ` engraved with ${text}` : " engraving preview"}`}
    >
      <defs>
        <linearGradient id={`engraving-metal-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={colors[0]} />
          <stop offset=".25" stopColor={colors[1]} />
          <stop offset=".6" stopColor={colors[2]} />
          <stop offset=".85" stopColor={colors[1]} />
          <stop offset="1" stopColor={colors[0]} />
        </linearGradient>
        <path id={`engraving-path-${id}`} d="M100 126 A120 69 0 0 0 340 126" />
      </defs>
      <ellipse cx="220" cy="222" rx="146" ry="17" fill="#493c2c" opacity=".06" />
      <ellipse
        cx="220"
        cy="139"
        rx="148"
        ry="83"
        fill="none"
        stroke={`url(#engraving-metal-${id})`}
        strokeWidth="32"
      />
      <ellipse
        cx="220"
        cy="126"
        rx="148"
        ry="81"
        fill="none"
        stroke={colors[0]}
        strokeWidth="2"
        opacity=".55"
      />
      <ellipse
        cx="220"
        cy="151"
        rx="148"
        ry="81"
        fill="none"
        stroke={colors[1]}
        strokeWidth="2"
        opacity=".8"
      />
      <text
        fill={colors[0]}
        fontFamily={style === "Sans" ? "Archivo, sans-serif" : "Georgia, serif"}
        fontSize={text.length > 22 ? 11 : 15}
        letterSpacing="1.2"
      >
        <textPath href={`#engraving-path-${id}`} startOffset="50%" textAnchor="middle">
          {text || "YOUR WORDS, FOREVER"}
        </textPath>
      </text>
    </svg>
  );
}
