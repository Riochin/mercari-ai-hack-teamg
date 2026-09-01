import { useId } from "react";

// 磨いた泥だんごをそれっぽく描くSVG（艶・ハイライト・接地影付き）。写真の代わり。
// gradient の id は useId で必ず有効・一意にする（日本語や空白を含む値でも安全）。
export function Dango({ color, matte }: { id?: string; color: string; matte?: boolean }) {
  const raw = useId();
  const id = raw.replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id={`bg-${id}`} cx="50%" cy="34%" r="80%">
          <stop offset="0%" stopColor="#FBF7F0" />
          <stop offset="100%" stopColor="#E7DECF" />
        </radialGradient>
        <radialGradient id={`sh-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="52%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity={matte ? "0.32" : "0.5"} />
        </radialGradient>
        <radialGradient id={`hl-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity={matte ? "0.5" : "0.9"} />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#bg-${id})`} />
      <ellipse cx="50" cy="80" rx="31" ry="6.5" fill="#000" opacity="0.16" />
      <circle cx="50" cy="47" r="31" fill={color} />
      <circle cx="50" cy="47" r="31" fill={`url(#sh-${id})`} />
      <ellipse cx="39" cy="35" rx="14" ry="10" fill={`url(#hl-${id})`} transform="rotate(-20 39 35)" />
      <ellipse cx="58" cy="61" rx="10" ry="6" fill={`url(#hl-${id})`} opacity="0.3" />
    </svg>
  );
}
