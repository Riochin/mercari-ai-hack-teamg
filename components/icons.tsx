// プロトタイプ由来の SVG アイコン群（同じパス・同じ色を踏襲）
import type { JSX } from "react";

export const BackChevron = (props: { onClick?: () => void; className?: string }) => {
  const icon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (!props.onClick) return icon;
  return (
    <button type="button" className={`icon-button ${props.className ?? ""}`} onClick={props.onClick} aria-label="戻る">
      {icon}
    </button>
  );
};

export const StatusIcons = () => (
  <span className="icons">
    <svg width="18" height="12" viewBox="0 0 18 12">
      <rect x="0" y="7" width="3" height="5" fill="#222" />
      <rect x="5" y="5" width="3" height="7" fill="#222" />
      <rect x="10" y="3" width="3" height="9" fill="#222" />
      <rect x="15" y="0" width="3" height="12" fill="#222" />
    </svg>
    <svg width="16" height="12" viewBox="0 0 16 12">
      <path
        d="M8 10.5a1.4 1.4 0 100-2.8 1.4 1.4 0 000 2.8zM4.2 6.6a5.4 5.4 0 017.6 0l-1.4 1.4a3.4 3.4 0 00-4.8 0L4.2 6.6zM1 3.6a9.8 9.8 0 0114 0L13.6 5A7.8 7.8 0 002.4 5L1 3.6z"
        fill="#222"
      />
    </svg>
    <svg width="24" height="12" viewBox="0 0 24 12">
      <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="#222" />
      <rect x="2" y="2" width="17" height="8" rx="1" fill="#222" />
      <rect x="21" y="4" width="2" height="4" rx="1" fill="#222" />
    </svg>
  </span>
);

const c = (active: boolean) => (active ? "#222" : "#B0B0B0");

export const NavIcons: Record<string, (active: boolean) => JSX.Element> = {
  home: (a) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 11.5L12 4l8 7.5" stroke={c(a)} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 10v9h12v-9" stroke={c(a)} strokeWidth="1.8" />
    </svg>
  ),
  bell: (a) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20s-7-4.4-9.5-9C.8 7.2 2.6 4 6 4c2 0 3.5 1.1 4.3 2.4 0 0 .5.9.7 1.3.2-.4.7-1.3.7-1.3C12.5 5.1 14 4 16 4c3.4 0 5.2 3.2 3.5 7-2.5 4.6-9.5 9-9.5 9z"
        stroke={c(a)}
        strokeWidth="1.7"
      />
    </svg>
  ),
  pay: (a) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="12.3" y="3.3" width="4" height="7.6" rx="1" transform="rotate(45 14.3 7.1)" stroke={c(a)} strokeWidth="1.6" />
      <path d="M9.5 10.5L4 16" stroke={c(a)} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 20h7" stroke={c(a)} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  mypage: (a) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2.5" stroke={c(a)} strokeWidth="1.7" />
      <path d="M3 10.5h18" stroke={c(a)} strokeWidth="1.7" />
      <circle cx="16.5" cy="14.5" r="1.3" fill={c(a)} />
    </svg>
  ),
  sell: (a) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" stroke={c(a)} strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="13.5" r="3" stroke={c(a)} strokeWidth="1.7" />
    </svg>
  ),
};

export const CameraIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="12" cy="13.5" r="3" stroke="#fff" strokeWidth="1.8" />
  </svg>
);

export const RobotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="8" width="16" height="11" rx="3" stroke="#0A7CFF" strokeWidth="1.7" />
    <path d="M12 8V4M9 4h6" stroke="#0A7CFF" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="9" cy="13.5" r="1.3" fill="#0A7CFF" />
    <circle cx="15" cy="13.5" r="1.3" fill="#0A7CFF" />
  </svg>
);

export const Chevron = ({ color = "#B0B0B0", className = "" }: { color?: string; className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
