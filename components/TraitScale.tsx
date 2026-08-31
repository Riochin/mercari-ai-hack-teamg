"use client";

const DotCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface TraitScaleProps {
  value: number; // 1-7
  onChange: (v: number) => void;
}

// 両端が大きく中央に向かって小さくなる7段階ドット選択（診断・交渉設定で共用）
export function TraitScale({ value, onChange }: TraitScaleProps) {
  return (
    <div className="trait-scale">
      {[1, 2, 3, 4, 5, 6, 7].map((v) => (
        <button
          key={v}
          type="button"
          className={"trait-dot" + (v === value ? " on" : "")}
          onClick={() => onChange(v)}
        >
          <DotCheck />
        </button>
      ))}
    </div>
  );
}
