"use client";

import Image from "next/image";
import { BackChevron } from "../icons";
import { useStore } from "@/lib/store";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "たった今";
  if (min < 60) return `${min}分前`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

interface Props {
  onBack: () => void;
  onOpenReview: (sessionId: string) => void;
}

export function SellerNotifyScreen({ onBack, onOpenReview }: Props) {
  const notifications = useStore((s) => s.notifications);
  const sessions = useStore((s) => s.sessions);

  return (
    <div className="screen profile-screen">
      <div className="sheet-header">
        <BackChevron onClick={onBack} />
        <span className="title">お知らせ（出品者）</span>
      </div>
      <div className="content">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            まだ通知はありません。
            <br />
            購入者が交渉して「購入をリクエスト」すると、
            <br />
            ここに合意額の通知が届きます。
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((n) => {
              const session = sessions.find((s) => s.sessionId === n.sessionId);
              const photo = session?.item.photo ?? "/dorodango.png";
              return (
                <div className="notif-item" key={n.notificationId} onClick={() => onOpenReview(n.sessionId)}>
                  <Image className="thumb" src={photo} alt="" width={48} height={48} />
                  <div className="n-body">
                    <div className="n-title">
                      {!n.read && <span className="unread-dot" />}
                      {n.title}
                    </div>
                    <div className="n-text">{n.body}</div>
                    <div className="n-time">{timeAgo(n.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
