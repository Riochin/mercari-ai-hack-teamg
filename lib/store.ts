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
  sessions: NegotiationSession[];
  notifications: AppNotification[];

  setPersona: (p: PersonaProfile) => void;
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
      sessions: [],
      notifications: [],

      setPersona: (p) => set({ persona: p, diagnosed: true }),
      resetDiagnosis: () =>
        set({ persona: DEFAULT_PERSONA, diagnosed: false }),

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
