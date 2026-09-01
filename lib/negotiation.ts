// プロトタイプ mercari-negotiation-battle.html の交渉ロジックを TS へ移植（数式はそのまま）。

import type { PersonaProfile, PersonaType, Turn } from "./types";

export const MAX_TURN = 5;

// ---- 16タイプ判定（仕様書 4.1 の4象限を、押し/丁寧さそれぞれ4段階に細分化）----
interface TypeMeta {
  type: PersonaType;
  avatar: string;
  name: string;
  desc: string;
}

// 1-7 の平均点を4段階に振り分ける。4はちょうど band1（低め側）に入るようにして、
// 「未診断時=4,4」が旧仕様の mypace 象限に近い場所へ落ちるようにしている。
function bandOf(score: number): 0 | 1 | 2 | 3 {
  if (score <= 2.5) return 0;
  if (score <= 4) return 1;
  if (score <= 5.5) return 2;
  return 3;
}

// 行 = persist band（0:あっさり 〜 3:とことん粘る）
// 列 = politeness band（0:フランク 〜 3:徹底したですます調）
// 四隅（[0][0] [0][3] [3][0] [3][3]）は仕様書4.1の4タイプをそのまま極端値として残す。
const TYPE_GRID: TypeMeta[][] = [
  [
    { type: "mypace", avatar: "😌", name: "脱力仙人タイプ", desc: "勝ち負けなんて、気にしない。その抜けた力こそが、実はいちばんの武器だったりする。" },
    { type: "cool_dodger", avatar: "😎", name: "クールスルータイプ", desc: "掴もうとすると、するりと躱される。本気なのか気まぐれなのか、最後までつかめない。" },
    { type: "quiet_retreat", avatar: "🍃", name: "ひそやか撤退タイプ", desc: "無理はしない、それが一番の礼儀だと思っている。引き際の潔さに、なぜか好感が持てる。" },
    { type: "listener", avatar: "🕊️", name: "共感モンスタータイプ", desc: "相手の気持ちを、まるごと飲み込むように聞く。気づけば、心を開いているのはあなたの方かも。" },
  ],
  [
    { type: "mood_trader", avatar: "🎲", name: "気分屋トレーダータイプ", desc: "その日の気分で強さが変わる、読めないタイプ。運が良ければ、思わぬ好条件を引き出してくる。" },
    { type: "steady_merchant", avatar: "🛍️", name: "マイペース商人タイプ", desc: "焦らず、騒がず、自分のペースで淡々と進める。気づけば、いつの間にか話がまとまっている。" },
    { type: "soft_pressure", avatar: "☁️", name: "ふんわり交渉人タイプ", desc: "強く言わないのに、なぜか断りづらい。やわらかい圧、とでも呼ぶべき独特の存在感。" },
    { type: "quiet_support", avatar: "🌙", name: "静かな伴走者タイプ", desc: "前には出ないが、隣からそっと支える。気づけば、いちばん頼りにしているのはこの人だったりする。" },
  ],
  [
    { type: "straight_shooter", avatar: "⚾", name: "直球勝負タイプ", desc: "駆け引きより、まっすぐ本音でぶつかる。不器用なほどの正直さが、意外と信頼を生む。" },
    { type: "slow_grinder", avatar: "🐢", name: "じわじわ圧タイプ", desc: "急がず、しかし止まらない。気づいたときには、じりじりと押し切られている。" },
    { type: "firm_charmer", avatar: "🌸", name: "芯の通った交渉人タイプ", desc: "物腰はやわらかいのに、譲れない一線だけは絶対に動かさない。そのギャップに、思わず一目置いてしまう。" },
    { type: "elegant_closer", avatar: "🎩", name: "上品な仕留め人タイプ", desc: "終始にこやかなのに、気づけば望みどおりの結果に着地している。一番怖いのは、たぶんこのタイプ。" },
  ],
  [
    { type: "hot_blooded", avatar: "😤", name: "猪突猛進タイプ", desc: "考えるより先に、体が動く。まっすぐすぎるその勢いが、意外と相手の心を動かす。" },
    { type: "fierce_dealer", avatar: "🔥", name: "本気ディーラータイプ", desc: "駆け引き上等、根競べ大歓迎。長引くほど燃えてくる、根っからの勝負師タイプ。" },
    { type: "sweet_persistence", avatar: "🍯", name: "粘り上手タイプ", desc: "しつこいはずなのに、なぜか嫌われない。粘りと愛嬌のバランス感覚が抜群な、交渉のプロ。" },
    { type: "gentleman", avatar: "🤵", name: "微笑み外交官タイプ", desc: "笑顔を絶やさず、じわじわ包囲網を狭めていく。気づいたときには、もう逃げ場がない。" },
  ],
];

export function typeFromProfile(p: {
  persist: number;
  politeness: number;
}): TypeMeta {
  return TYPE_GRID[bandOf(p.persist)][bandOf(p.politeness)];
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

export const DEFAULT_PERSONA: PersonaProfile = buildPersona(4, 4); // 未診断時 = steady_merchant（マイペース商人タイプ）

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

// デモで毎回結果が変わらないよう、1回目は決裂・2回目は成立…と固定で交互に切り替える
let negotiationAttempt = 0;

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
  negotiationAttempt += 1;
  const willAgree = negotiationAttempt % 2 === 0; // 奇数回目=決裂、偶数回目=成立

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
