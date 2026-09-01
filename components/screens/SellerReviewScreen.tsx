"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BackChevron, Chevron } from "../icons";
import { ChatBubble } from "../ChatBubble";
import { useStore } from "@/lib/store";
import { yen } from "@/lib/negotiation";
import { findCharacter } from "@/lib/characters";

interface Props {
  sessionId: string;
  onBack: () => void;
}

export function SellerReviewScreen({ sessionId, onBack }: Props) {
  const session = useStore((s) => s.sessions.find((x) => x.sessionId === sessionId));
  const notifications = useStore((s) => s.notifications);
  const setSessionStatus = useStore((s) => s.setSessionStatus);
  const markNotificationRead = useStore((s) => s.markNotificationRead);

  const [expanded, setExpanded] = useState(false);

  // 開いた時点で該当通知を既読化
  useEffect(() => {
    const n = notifications.find((x) => x.sessionId === sessionId && !x.read);
    if (n) markNotificationRead(n.notificationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (!session) {
    return (
      <div className="screen profile-screen">
        <div className="sheet-header">
          <BackChevron onClick={onBack} />
          <span className="title">合意額の確認</span>
        </div>
        <div className="notif-empty">この交渉は見つかりませんでした。</div>
      </div>
    );
  }

  const finalPrice = session.finalPrice ?? 0;
  const listPrice = session.item.listPrice;
  const minPrice = session.seller.minPrice;
  const discount = listPrice - finalPrice;
  const aboveMin = finalPrice >= minPrice;
  const buyerCharacter = findCharacter(session.buyer.persona.type, session.buyer.characterId);

  // すでに承認/見送り済みなら結果画面を表示
  if (session.status === "completed" || session.status === "declined") {
    const done = session.status === "completed";
    return (
      <div className="screen profile-screen">
        <div className="sheet-header">
          <BackChevron onClick={onBack} />
          <span className="title">{done ? "取引成立" : "見送り"}</span>
        </div>
        <div className={"outcome " + session.status}>
          <div className="o-emoji">{done ? "🎉" : "🙇"}</div>
          <div className="o-title">{done ? "取引が成立しました" : "今回は見送りました"}</div>
          {done && <div className="o-price">{yen(finalPrice)}</div>}
          <div className="o-text">
            {done
              ? `「${session.item.name}」を ${yen(finalPrice)} でお譲りします。購入者に通知されました。`
              : `「${session.item.name}」の今回の合意は見送りとなりました。`}
          </div>
          <button className="o-back" onClick={onBack}>
            お知らせに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen profile-screen">
      <div className="sheet-header">
        <BackChevron onClick={onBack} />
        <span className="title">合意額の確認</span>
      </div>
      <div className="sheet-content">
        <div className="review-item">
          <Image src={session.item.photo} alt={session.item.name} width={56} height={56} />
          <div>
            <div className="ri-name">{session.item.name}</div>
            <div className="ri-list">出品価格 {yen(listPrice)}</div>
          </div>
        </div>

        <div className="agree-hero">
          <div className="ah-label">AIが合意しました</div>
          <div className="ah-price">{yen(finalPrice)}</div>
          <div className="ah-diff">
            出品価格から <b>{yen(discount)}</b> の値引き
            {aboveMin ? "（最低希望額の範囲内）" : "（最低希望額を下回っています）"}
          </div>
        </div>

        <div className="diff-grid">
          <div className="diff-cell">
            <div className="dc-label">出品価格</div>
            <div className="dc-val">{yen(listPrice)}</div>
          </div>
          <div className="diff-cell min">
            <div className="dc-label">最低希望額</div>
            <div className="dc-val">{yen(minPrice)}</div>
          </div>
          <div className={"diff-cell " + (aboveMin ? "ok" : "min")}>
            <div className="dc-label">今回の合意</div>
            <div className="dc-val">{yen(finalPrice)}</div>
          </div>
        </div>

        <button className={"accordion-toggle" + (expanded ? " open" : "")} onClick={() => setExpanded((v) => !v)}>
          <span>やりとりを見る（{session.turns.length}往復）</span>
          <Chevron color="#222" className="chev" />
        </button>

        {expanded && (
          <div className="accordion-body">
            <div className="log seller-view">
              {session.turns.map((t, i) => (
                <ChatBubble
                  turn={t}
                  buyerCharacter={buyerCharacter}
                  buyerName={session.buyer.characterName}
                  key={i}
                />
              ))}
            </div>
          </div>
        )}

        <div className="seller-actions">
          <button className="approve-btn" onClick={() => setSessionStatus(sessionId, "completed")}>
            この金額で承認する
          </button>
          <button className="decline-btn" onClick={() => setSessionStatus(sessionId, "declined")}>
            今回は見送る
          </button>
        </div>
      </div>
    </div>
  );
}
