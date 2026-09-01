import type { Turn } from "@/lib/types";
import { SELLER_CHARACTER, type CharacterMeta } from "@/lib/characters";
import { yen } from "@/lib/negotiation";
import { CharacterAvatar } from "./CharacterAvatar";

// 静的な吹き出し（出品者側のやりとり展開で使用）。
// 左右・色の反転は親 .log に .seller-view を付けて CSS 側で行う。
interface Props {
  turn: Turn;
  buyerCharacter?: CharacterMeta | null;
  buyerName?: string | null;
}

export function ChatBubble({ turn, buyerCharacter = null, buyerName = null }: Props) {
  const who = turn.speaker === "seller" ? "出品者AI" : buyerName?.trim() || "あなたのAI";
  return (
    <div className={"bubble-row " + turn.speaker}>
      <span className="bname">{who}</span>
      <div className="brow-inline">
        {turn.speaker === "buyer" ? (
          <CharacterAvatar character={buyerCharacter} fallbackEmoji={turn.emoji || "🙂"} size="chat" />
        ) : (
          <CharacterAvatar character={SELLER_CHARACTER} fallbackEmoji={SELLER_CHARACTER.emoji} size="chat" />
        )}
        <div className="bubble">
          <span className="btext">{turn.message}</span>
        </div>
      </div>
      <span className="boffer">{yen(turn.offer)}</span>
    </div>
  );
}
