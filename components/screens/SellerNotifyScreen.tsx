"use client";

import Image from "next/image";
import { BackChevron } from "../icons";
import { StatusBar, BottomNav } from "../PhoneChrome";
import { CharacterAvatar } from "../CharacterAvatar";
import { useStore } from "@/lib/store";
import { getCharacter } from "@/lib/characters";
import { yen } from "@/lib/negotiation";
import type { PersonaType } from "@/lib/types";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

// いろんな購入者AIの雰囲気を伝えるためのモック（実データではない）。
// 商品画像は public/mock-items/ 配下に用意する（下記 photo を参照）。
interface MockNotif {
  id: string;
  type: PersonaType;
  buyerName: string;
  itemName: string;
  price: number;
  timeLabel: string;
  photo: string;
  unread?: boolean;
}
const MOCK_NOTIFICATIONS: MockNotif[] = [
  { id: "mock-1", type: "soft_pressure", buyerName: "ふわりん", itemName: "ヴィンテージ腕時計", price: 8500, timeLabel: "5分前", photo: "/mock-items/watch.jpg", unread: true },
  { id: "mock-2", type: "hot_blooded", buyerName: "ダッシュ丸", itemName: "ランニングシューズ", price: 3200, timeLabel: "1時間前", photo: "/mock-items/sneakers.jpg" },
  { id: "mock-3", type: "gentleman", buyerName: "スーツ田中", itemName: "ノートパソコン", price: 45000, timeLabel: "3時間前", photo: "/mock-items/laptop.png" },
  { id: "mock-4", type: "cool_dodger", buyerName: "クールべ", itemName: "レザートートバッグ", price: 6800, timeLabel: "昨日", photo: "/mock-items/bag.jpeg" },
  { id: "mock-5", type: "elegant_closer", buyerName: "はちまき先生", itemName: "アクションフィギュア", price: 2500, timeLabel: "2日前", photo: "/mock-items/figure.jpg" },
];

interface Props {
  onBack: () => void;
  onOpenReview: (sessionId: string) => void;
  unread: number;
  onBell: () => void;
  onMypage: () => void;
}

export function SellerNotifyScreen({ onBack, onOpenReview, unread, onBell, onMypage }: Props) {
  const notifications = useStore((s) => s.notifications);
  const sessions = useStore((s) => s.sessions);

  // 承認/見送りで対応済み（completed/declined）になった依頼は、古いデータが残っていても表示しない
  const visibleNotifications = notifications.filter((n) => {
    const session = sessions.find((s) => s.sessionId === n.sessionId);
    return !session || (session.status !== "completed" && session.status !== "declined");
  });

  return (
    <div className="screen profile-screen">
      <StatusBar />
      <div className="sheet-header">
        <BackChevron onClick={onBack} />
        <span className="title">やることリスト</span>
      </div>
      <div className="content">
        <div className="notif-list">
          {visibleNotifications.length === 0 && (
            <div className="notif-empty">
              まだ本物の通知はありません。
              <br />
              購入者が交渉して「購入をリクエスト」すると、
              <br />
              ここに合意額の通知が届きます。
            </div>
          )}

          {visibleNotifications.map((n) => {
            const session = sessions.find((s) => s.sessionId === n.sessionId);
            const photo = session?.item.photo ?? "/dorodango.png";
            const buyerCharacter = session
              ? getCharacter(session.buyer.persona.type)
              : null;
            return (
              <button className="notif-item" type="button" key={n.notificationId} onClick={() => onOpenReview(n.sessionId)}>
                <Image className="thumb" src={photo} alt="" width={48} height={48} />
                <div className="n-body">
                  <div className="n-title">
                    {!n.read && <span className="unread-dot" />}
                    {n.title}
                  </div>
                  <div className="n-text">{n.body}</div>
                  {session && (
                    <div className="notif-ai-row">
                      <CharacterAvatar
                        character={buyerCharacter}
                        fallbackEmoji={session.buyer.persona.avatar}
                        size="chat"
                      />
                      <span className="notif-ai-name">
                        {session.buyer.characterName?.trim() || "購入者AI"}
                      </span>
                      {session.finalPrice != null && (
                        <span className="notif-ai-price">{yen(session.finalPrice)}</span>
                      )}
                    </div>
                  )}
                  <div className="n-time">{timeAgo(n.createdAt)}</div>
                </div>
              </button>
            );
          })}

          {MOCK_NOTIFICATIONS.map((m) => {
            const character = getCharacter(m.type);
            return (
              <div className="notif-item mock" key={m.id}>
                <Image className="thumb" src={m.photo} alt="" width={48} height={48} />
                <div className="n-body">
                  <div className="n-title">
                    {m.unread && <span className="unread-dot" />}
                    AIが合意額を提案しました
                  </div>
                  <div className="n-text">「{m.itemName}」に{yen(m.price)}の合意提案が届いています</div>
                  <div className="notif-ai-row">
                    <CharacterAvatar character={character} fallbackEmoji={character.emoji} size="chat" />
                    <span className="notif-ai-name">{m.buyerName}</span>
                    <span className="notif-ai-price">{yen(m.price)}</span>
                  </div>
                  <div className="n-time">{m.timeLabel}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav active="bell" unread={unread} onBell={onBell} onMypage={onMypage} />
    </div>
  );
}
