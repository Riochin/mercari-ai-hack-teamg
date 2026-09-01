// プロトタイプ mercari-negotiation-battle.html の交渉ロジックを TS へ移植（数式はそのまま）。

import type { PersonaProfile, PersonaType, Turn } from "./types";

export const MAX_TURN = 5;

// ---- 4タイプ判定（仕様書 4.1）----
interface TypeMeta {
  type: PersonaType;
  avatar: string;
  name: string;
  desc: string;
}

export function typeFromProfile(p: {
  persist: number;
  politeness: number;
}): TypeMeta {
  const pushHigh = p.persist > 4;
  const politeHigh = p.politeness > 4;
  if (pushHigh && politeHigh)
    return {
      type: "gentleman",
      avatar: "🤵",
      name: "微笑み外交官タイプ",
      desc: "笑顔を絶やさず、じわじわ包囲網を狭めていく。気づいたときには、もう逃げ場がない。",
    };
  if (pushHigh && !politeHigh)
    return {
      type: "hot_blooded",
      avatar: "😤",
      name: "猪突猛進タイプ",
      desc: "考えるより先に、体が動く。まっすぐすぎるその勢いが、意外と相手の心を動かす。",
    };
  if (!pushHigh && politeHigh)
    return {
      type: "listener",
      avatar: "🕊️",
      name: "共感モンスタータイプ",
      desc: "相手の気持ちを、まるごと飲み込むように聞く。気づけば、心を開いているのはあなたの方かも。",
    };
  return {
    type: "mypace",
    avatar: "😌",
    name: "脱力仙人タイプ",
    desc: "勝ち負けなんて、気にしない。その抜けた力こそが、実はいちばんの武器だったりする。",
  };
}

export function buildPersona(persist: number, politeness: number): PersonaProfile {
  const meta = typeFromProfile({ persist, politeness });
  return {
    persist,
    politeness,
    type: meta.type,
    name: meta.name,
    avatar: meta.avatar,
  };
}

export const DEFAULT_PERSONA: PersonaProfile = buildPersona(4, 4); // 未診断時 = mypace

// ---- 購入者のセリフ候補（話し方の長さ×丁寧さ）----
interface Line {
  msg: string;
  emoji: string;
  tension: number;
}

function buyerLinePool(length: number, politeness: number): Line[] {
  const long = length > 4;
  const polite = politeness > 4;
  if (polite && long) {
    return [
      {
        msg: "こちらの商品にとても興味があり、即決も可能ですので、もしよろしければ少しお値引きのご検討をいただけますでしょうか。",
        emoji: "🙂",
        tension: 0.55,
      },
      {
        msg: "大変魅力的な商品で、ぜひ購入させていただきたいのですが、可能であれば少しだけお値下げいただけますと助かります。",
        emoji: "🙏",
        tension: 0.6,
      },
      {
        msg: "状態も良く気に入っているのですが、恐れ入りますが今一歩ご検討いただける余地はございますでしょうか。",
        emoji: "😅",
        tension: 0.65,
      },
    ];
  }
  if (polite && !long) {
    return [
      { msg: "少しお値下げいただけますか？", emoji: "🙂", tension: 0.3 },
      { msg: "即決しますのでご検討ください。", emoji: "😊", tension: 0.2 },
      { msg: "もう一声お願いできますか。", emoji: "🙏", tension: 0.35 },
    ];
  }
  if (!polite && long) {
    return [
      {
        msg: "結構前から気になってて、できればもう少しだけ値下げしてもらえたら嬉しいんだけど、どうかな？",
        emoji: "🥺",
        tension: 0.5,
      },
      {
        msg: "即決できるので、その分ちょっとだけお値下げ交渉させてもらえないかな。",
        emoji: "😆",
        tension: 0.3,
      },
      {
        msg: "欲しいんだけど、正直今の価格だと少し手が届かなくて…もう一声お願いできたら。",
        emoji: "😞",
        tension: 0.55,
      },
    ];
  }
  return [
    { msg: "もう少し安くならない？", emoji: "😆", tension: 0.15 },
    { msg: "即決するから考えて！", emoji: "😤", tension: 0.1 },
    { msg: "もうちょっとお願い！", emoji: "🥺", tension: 0.2 },
  ];
}

export interface GeneratedNegotiation {
  turns: Turn[];
  status: "agreed" | "stalled";
  finalPrice: number | null;
}

export interface BattleParams {
  askPrice: number; // 出品価格
  sellerMin: number; // 出品者の最低希望額（非公開）
  sellerStub: number; // 出品者の頑固さ 0-100（非公開）
  buyerWant: number;
  persist: number;
  politeness: number;
  isRematch?: boolean;
}

// ダミーの交渉生成：粘り強さ・話し方・出品者の頑固さから、それらしいターン列を作る
export function generateTurns(params: BattleParams): GeneratedNegotiation {
  const { askPrice, sellerMin, sellerStub, buyerWant, persist, politeness } =
    params;
  const length = politeness; // 話し方の長さは温度感に連動
  const persistPct = ((persist - 1) / 6) * 100;
  const min = params.isRematch
    ? Math.max(sellerMin - 200, buyerWant)
    : sellerMin;
  const turnsCount = 3 + Math.round(Math.random());
  const turns: Turn[] = [];
  let price = askPrice;

  const sellerLines: Line[] = [
    { msg: "状態が良いので、これ以上は難しいです", emoji: "😐", tension: 0.75 },
    { msg: "その価格だと正直厳しいです…", emoji: "😟", tension: 0.6 },
    { msg: "うーん、少しだけなら", emoji: "🤔", tension: 0.4 },
    { msg: "早めに手放したいので、ここまでなら", emoji: "😅", tension: 0.2 },
  ];
  const buyerLines = buyerLinePool(length, politeness);
  const willAgree = Math.random() < 0.45 + persistPct / 250;

  for (let i = 0; i < turnsCount; i++) {
    const speaker: "buyer" | "seller" = i % 2 === 0 ? "buyer" : "seller";
    if (speaker === "buyer") {
      const pull = (price - Math.max(min, buyerWant)) * (0.28 + persistPct / 400);
      price = Math.max(min, Math.round((price - pull) / 50) * 50);
      const line = buyerLines[i % buyerLines.length];
      turns.push({
        speaker,
        message: line.msg,
        emoji: line.emoji,
        tension: line.tension,
        offer: price,
      });
    } else {
      const holdBack = (price - min) * (sellerStub / 500);
      price = Math.min(askPrice, price + Math.round(holdBack / 50) * 50);
      const line = sellerLines[i % sellerLines.length];
      turns.push({
        speaker,
        message: line.msg,
        emoji: line.emoji,
        tension: line.tension,
        offer: price,
      });
    }
  }

  if (willAgree) {
    const finalPrice = Math.max(
      min,
      Math.min(price, buyerWant + Math.round(((price - buyerWant) * 0.4) / 50) * 50),
    );
    turns.push({
      speaker: "seller",
      message: "わかりました、その金額でお譲りします",
      emoji: "😊",
      tension: 0.45,
      offer: finalPrice,
    });
    return { turns, status: "agreed", finalPrice };
  }

  turns.push({
    speaker: "seller",
    message: "申し訳ありませんが、これ以上のお値下げは致しかねます",
    emoji: "😡",
    tension: 0.85,
    offer: price,
  });
  return { turns, status: "stalled", finalPrice: null };
}

export const yen = (n: number) => "¥" + Number(n).toLocaleString("ja-JP");
