"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppNotification,
  NegotiationSession,
  PersonaProfile,
  SessionStatus,
} from "./types";
import { DEFAULT_PERSONA } from "./negotiation";

interface StoreState {
  persona: PersonaProfile;
  diagnosed: boolean;
  // ユーザーが相棒キャラクターにつけた名前（未設定なら命名ステップを表示する）
  // ※ 相棒キャラクター自体は persona.type から一意に決まる（lib/characters.ts）ので、
  //   ここではUI演出用の「名前」だけを持つ。
  characterName: string | null;
  sessions: NegotiationSession[];
  notifications: AppNotification[];

  setPersona: (p: PersonaProfile) => void;
  setCharacterName: (name: string) => void;
  resetDiagnosis: () => void;

  // 購入者が交渉を保存し、出品者への通知を1件発行する
  requestPurchase: (session: NegotiationSession) => void;
  // 出品者が承認/見送り
  setSessionStatus: (sessionId: string, status: SessionStatus) => void;
  markNotificationRead: (notificationId: string) => void;
}

let seq = 0;
const nextId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${(seq++).toString(36)}`;

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      persona: DEFAULT_PERSONA,
      diagnosed: false,
      characterName: null,
      sessions: [],
      notifications: [],

      // 診断し直すたびに、名前は新しいキャラクターに合わせてつけ直してもらう
      setPersona: (p) => set({ persona: p, diagnosed: true, characterName: null }),
      setCharacterName: (name) => set({ characterName: name }),
      resetDiagnosis: () =>
        set({
          persona: DEFAULT_PERSONA,
          diagnosed: false,
          characterName: null,
        }),

      requestPurchase: (session) =>
        set((s) => {
          const saved: NegotiationSession = {
            ...session,
            status: "seller_review",
          };
          const notif: AppNotification = {
            notificationId: nextId("ntf"),
            sessionId: saved.sessionId,
            title: "AIが合意額を提案しました",
            body: `「${saved.item.name}」に${(saved.finalPrice ?? 0).toLocaleString(
              "ja-JP",
            )}円の合意提案が届いています`,
            read: false,
            createdAt: new Date().toISOString(),
          };
          return {
            sessions: [saved, ...s.sessions.filter((x) => x.sessionId !== saved.sessionId)],
            notifications: [notif, ...s.notifications],
          };
        }),

      setSessionStatus: (sessionId, status) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.sessionId === sessionId ? { ...x, status } : x,
          ),
        })),

      markNotificationRead: (notificationId) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.notificationId === notificationId ? { ...n, read: true } : n,
          ),
        })),
    }),
    { name: "mercari-nego-store" },
  ),
);

export const makeSessionId = () => nextId("nego");
