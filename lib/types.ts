// 共通データモデル（仕様書 4章）。3画面はこの形でデータをやり取りする。
//
// PersonaType は仕様書 4.1 記載の4種（gentleman/hot_blooded/listener/mypace）を
// 起点に、押しの強さ×話し方をそれぞれ4段階に細分化した16タイプへ拡張したもの。
// 元の4種は各象限のいちばん極端な角（例: gentleman = 押し・丁寧さともに最大）として
// そのまま残っている。persist/politeness の2軸で決まる点は変わらないため、
// ②③側のロジック（persist/politeness を直接見る）には影響しない。
export type PersonaType =
  | "mypace"
  | "cool_dodger"
  | "quiet_retreat"
  | "listener"
  | "mood_trader"
  | "steady_merchant"
  | "soft_pressure"
  | "quiet_support"
  | "straight_shooter"
  | "slow_grinder"
  | "firm_charmer"
  | "elegant_closer"
  | "hot_blooded"
  | "fierce_dealer"
  | "sweet_persistence"
  | "gentleman";

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
  buyer: { name: string; want: number; persona: PersonaProfile };
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
