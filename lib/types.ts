// 共通データモデル（仕様書 4章）。3画面はこの形でデータをやり取りする。

export type PersonaType = "gentleman" | "hot_blooded" | "listener" | "mypace";

export interface PersonaProfile {
  persist: number; // 押しの強さ 1-7
  politeness: number; // 温度感 1-7
  type: PersonaType;
  name: string;
  avatar: string;
}

export type Speaker = "buyer" | "seller";

export interface Turn {
  speaker: Speaker;
  message: string;
  emoji: string;
  offer: number;
  tension: number; // 0=即レス, 1=かなり渋る・迷う
}

export type SessionStatus =
  | "in_progress"
  | "agreed"
  | "stalled"
  | "seller_review"
  | "completed"
  | "declined";

export interface NegotiationSession {
  sessionId: string;
  item: { name: string; listPrice: number; photo: string };
  buyer: {
    name: string;
    want: number;
    persona: PersonaProfile;
    characterId?: string | null;
    characterName?: string | null;
  };
  seller: { minPrice: number; stubbornness: number }; // 出品時設定済み・購入者には非公開
  turns: Turn[];
  status: SessionStatus;
  finalPrice: number | null;
  createdAt: string;
}

export interface AppNotification {
  notificationId: string;
  sessionId: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
