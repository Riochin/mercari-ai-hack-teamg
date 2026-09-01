"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { ProductScreen } from "@/components/screens/ProductScreen";
import { ProfileScreen } from "@/components/screens/ProfileScreen";
import { BattleSheet } from "@/components/screens/BattleSheet";
import { SearchScreen } from "@/components/screens/SearchScreen";
import { SellerNotifyScreen } from "@/components/screens/SellerNotifyScreen";
import { SellerReviewScreen } from "@/components/screens/SellerReviewScreen";

type View = "product" | "search" | "profile" | "notify" | "review";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<View>("product");
  const [battleOpen, setBattleOpen] = useState(false);
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);

  const notifications = useStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  // localStorage 永続化ストアのハイドレーション後に描画（ミスマッチ回避）
  useEffect(() => setMounted(true), []);

  return (
    <div className="stack">
      <div className="device">
        <div className="phone">
          <div className="notch" />

          {mounted && (
            <>
              <ProductScreen
                unread={unread}
                active={view === "product" && !battleOpen}
                onOpenBattle={() => setBattleOpen(true)}
                onOpenSearch={() => setView("search")}
                onBell={() => setView("notify")}
                onMypage={() => setView("profile")}
              />

              {view === "search" && (
                <SearchScreen
                  unread={unread}
                  onBack={() => setView("product")}
                  onOpenProduct={() => setView("product")}
                  onBell={() => setView("notify")}
                  onMypage={() => setView("profile")}
                />
              )}

              {view === "profile" && (
                <ProfileScreen
                  onBack={() => setView("product")}
                  unread={unread}
                  onBell={() => setView("notify")}
                  onMypage={() => setView("profile")}
                />
              )}

              {view === "notify" && (
                <SellerNotifyScreen
                  onBack={() => setView("product")}
                  onOpenReview={(id) => {
                    setReviewSessionId(id);
                    setView("review");
                  }}
                  unread={unread}
                  onBell={() => setView("notify")}
                  onMypage={() => setView("profile")}
                />
              )}

              {view === "review" && reviewSessionId && (
                <SellerReviewScreen
                  sessionId={reviewSessionId}
                  onBack={() => setView("notify")}
                  unread={unread}
                  onBell={() => setView("notify")}
                  onMypage={() => setView("profile")}
                />
              )}

              <BattleSheet
                open={battleOpen}
                onClose={() => setBattleOpen(false)}
                onGoNotify={() => {
                  setBattleOpen(false);
                  setView("notify");
                }}
                onOpenProfile={() => {
                  setBattleOpen(false);
                  setView("profile");
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
