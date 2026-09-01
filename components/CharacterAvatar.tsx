"use client";

import { useEffect, useState } from "react";
import type { CharacterMeta } from "@/lib/characters";

interface CharacterAvatarProps {
  character: CharacterMeta | null;
  fallbackEmoji: string;
  size: "mini" | "chat";
  decorative?: boolean;
}

export function CharacterAvatar({
  character,
  fallbackEmoji,
  size,
  decorative = true,
}: CharacterAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [character?.image]);

  if (!character || failed) {
    return (
      <span className={size === "mini" ? "mytype-avatar" : "bavatar"} aria-hidden={decorative || undefined}>
        {fallbackEmoji}
      </span>
    );
  }

  return (
    <span className={`character-avatar ${size}`} aria-hidden={decorative || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={character.image}
        alt={decorative ? "" : character.label}
        style={{ objectPosition: character.focus }}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
