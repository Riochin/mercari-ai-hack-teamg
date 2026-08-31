import type { Turn } from "@/lib/types";
import { yen } from "@/lib/negotiation";

// 静的な吹き出し（出品者側のやりとり展開で使用）。
// 左右・色の反転は親 .log に .seller-view を付けて CSS 側で行う。
export function ChatBubble({ turn }: { turn: Turn }) {
  const who = turn.speaker === "seller" ? "出品者AI" : "あなたのAI";
  return (
    <div className={"bubble-row " + turn.speaker}>
      <span className="bname">{who}</span>
      <div className="brow-inline">
        <span className="bavatar">{turn.emoji || "🙂"}</span>
        <div className="bubble">
          <span className="btext">{turn.message}</span>
        </div>
      </div>
      <span className="boffer">{yen(turn.offer)}</span>
    </div>
  );
}
